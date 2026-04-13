// ─── Système de vote AcuSensus ────────────────────────────────────────────────
// Logique centralisée : calcul de la valeur, coûts en points, application d'un
// vote sur un élément (point, commentaire, catégorie) ou sur une participation
// entière.
//
// Règles :
//   - Valeur d'un élément/participation : 1 + Σ(ratio_voter × 0.1)
//   - Vote sur un élément isolé    = 1 point consommé
//   - Vote sur une participation   = 2 points consommés, le vote s'applique
//                                    à TOUS les éléments (virtuellement on
//                                    l'enregistre comme vote "participation")
//   - Un utilisateur ne peut voter qu'une fois par (participation, élément).

import type {
  UserParticipation,
  Vote,
  StatutPraticien,
  User,
} from '@/types';
import { RATIO_STATUT } from '@/types';
import { updateParticipationById } from '@/lib/participation-store';

export const COST_ELEMENT = 1;
export const COST_PARTICIPATION = 2;

function uid(): string {
  return `v-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// Calcule la valeur (1 + Σ ratio × 0.1) pour une liste de votes filtrés.
export function computeValeur(votes: Vote[] | undefined): number {
  if (!votes || votes.length === 0) return 1;
  const sum = votes.reduce((acc, v) => acc + (RATIO_STATUT[v.voterStatut] ?? 1) * 0.1, 0);
  return 1 + sum;
}

// Valeur d'un élément précis au sein d'une participation (ex : un point 3R).
// Le vote sur la participation entière compte aussi comme vote pour chaque élément.
export function computeElementValeur(
  participation: UserParticipation,
  elementKey: string,
): number {
  const votes = (participation.votes ?? []).filter(
    (v) => v.cible === 'participation' || v.elementKey === elementKey,
  );
  return computeValeur(votes);
}

export interface VoteResult {
  ok: boolean;
  error?: string;
  updated?: UserParticipation;
  consumed?: number; // points consommés
}

// Vérifie qu'un utilisateur n'a pas déjà voté (même élément ou sur la participation).
function alreadyVoted(
  participation: UserParticipation,
  voterId: string,
  elementKey?: string,
): boolean {
  const votes = participation.votes ?? [];
  if (elementKey) {
    return votes.some(
      (v) => v.voterId === voterId && v.cible === 'element' && v.elementKey === elementKey,
    );
  }
  return votes.some((v) => v.voterId === voterId && v.cible === 'participation');
}

// Vote sur un élément (ex : "point:3R", "bilan:0", "strategie:2", "comment:ann-xxx").
export function voteOnElement(
  participation: UserParticipation,
  voter: Pick<User, 'id' | 'statut' | 'votePoints'>,
  elementKey: string,
): VoteResult {
  if ((voter.votePoints ?? 0) < COST_ELEMENT) {
    return { ok: false, error: "Solde insuffisant (1 pt requis)." };
  }
  if (alreadyVoted(participation, voter.id, elementKey)) {
    return { ok: false, error: 'Vous avez déjà voté sur cet élément.' };
  }
  const newVote: Vote = {
    id: uid(),
    voterId: voter.id,
    voterStatut: voter.statut ?? 'etudiant',
    cible: 'element',
    elementKey,
    createdAt: new Date().toISOString(),
  };
  const votes = [...(participation.votes ?? []), newVote];
  const votePoints = (participation.votePoints ?? 0) + 1;
  const valeur = computeValeur(votes);
  const updated = updateParticipationById(participation.id, { votes, votePoints, valeur });
  return { ok: !!updated, updated, consumed: COST_ELEMENT };
}

// Vote sur la participation entière (coût 2 pts).
export function voteOnParticipation(
  participation: UserParticipation,
  voter: Pick<User, 'id' | 'statut' | 'votePoints'>,
): VoteResult {
  if ((voter.votePoints ?? 0) < COST_PARTICIPATION) {
    return { ok: false, error: 'Solde insuffisant (2 pts requis).' };
  }
  if (alreadyVoted(participation, voter.id)) {
    return { ok: false, error: 'Vous avez déjà validé cette participation.' };
  }
  const newVote: Vote = {
    id: uid(),
    voterId: voter.id,
    voterStatut: voter.statut ?? 'etudiant',
    cible: 'participation',
    createdAt: new Date().toISOString(),
  };
  const votes = [...(participation.votes ?? []), newVote];
  const votePoints = (participation.votePoints ?? 0) + 2;
  const valeur = computeValeur(votes);
  const updated = updateParticipationById(participation.id, { votes, votePoints, valeur });
  return { ok: !!updated, updated, consumed: COST_PARTICIPATION };
}

// Annuler un vote sur un élément (refund 1 pt).
export function unvoteOnElement(
  participation: UserParticipation,
  voter: Pick<User, 'id' | 'statut' | 'votePoints'>,
  elementKey: string,
): VoteResult {
  const votes = participation.votes ?? [];
  const idx = votes.findIndex(
    (v) => v.voterId === voter.id && v.cible === 'element' && v.elementKey === elementKey,
  );
  if (idx === -1) {
    return { ok: false, error: "Aucun vote à annuler sur cet élément." };
  }
  const newVotes = votes.filter((_, i) => i !== idx);
  const votePoints = Math.max(0, (participation.votePoints ?? 0) - 1);
  const valeur = computeValeur(newVotes);
  const updated = updateParticipationById(participation.id, { votes: newVotes, votePoints, valeur });
  return { ok: !!updated, updated, consumed: -COST_ELEMENT };
}

// Annuler un vote sur la participation entière (remboursement 2 pts).
export function unvoteOnParticipation(
  participation: UserParticipation,
  voter: Pick<User, 'id' | 'statut' | 'votePoints'>,
): VoteResult {
  const votes = participation.votes ?? [];
  const idx = votes.findIndex(
    (v) => v.voterId === voter.id && v.cible === 'participation',
  );
  if (idx === -1) {
    return { ok: false, error: 'Aucun vote à annuler sur cette participation.' };
  }
  const newVotes = votes.filter((_, i) => i !== idx);
  const votePoints = Math.max(0, (participation.votePoints ?? 0) - 2);
  const valeur = computeValeur(newVotes);
  const updated = updateParticipationById(participation.id, { votes: newVotes, votePoints, valeur });
  return { ok: !!updated, updated, consumed: -COST_PARTICIPATION };
}

// Utilitaire : statut d'un utilisateur → label ratio
export function ratioLabel(statut?: StatutPraticien): string {
  const r = RATIO_STATUT[statut ?? 'etudiant'];
  return `×${r}`;
}

// ─── Système de vote AcuSensus ────────────────────────────────────────────────

import type { UserParticipation, Vote, StatutPraticien, User } from '@/types';
import { RATIO_STATUT } from '@/types';
import { updateParticipationById } from '@/lib/participation-store';

export const COST_ELEMENT = 1;
export const COST_PARTICIPATION = 2;

function uid(): string {
  return `v-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function computeValeur(votes: Vote[] | undefined): number {
  if (!votes || votes.length === 0) return 1;
  const sum = votes.reduce((acc, v) => acc + (RATIO_STATUT[v.voterStatut] ?? 1) * 0.1, 0);
  return 1 + sum;
}

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
  consumed?: number;
}

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

export async function voteOnElement(
  participation: UserParticipation,
  voter: Pick<User, 'id' | 'statut' | 'votePoints'>,
  elementKey: string,
): Promise<VoteResult> {
  if ((voter.votePoints ?? 0) < COST_ELEMENT) {
    return { ok: false, error: 'Solde insuffisant (1 pt requis).' };
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
  const updated = await updateParticipationById(participation.id, { votes, votePoints, valeur });
  return { ok: !!updated, updated, consumed: COST_ELEMENT };
}

export async function voteOnParticipation(
  participation: UserParticipation,
  voter: Pick<User, 'id' | 'statut' | 'votePoints'>,
): Promise<VoteResult> {
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
  const updated = await updateParticipationById(participation.id, { votes, votePoints, valeur });
  return { ok: !!updated, updated, consumed: COST_PARTICIPATION };
}

export async function unvoteOnElement(
  participation: UserParticipation,
  voter: Pick<User, 'id' | 'statut' | 'votePoints'>,
  elementKey: string,
): Promise<VoteResult> {
  const votes = participation.votes ?? [];
  const idx = votes.findIndex(
    (v) => v.voterId === voter.id && v.cible === 'element' && v.elementKey === elementKey,
  );
  if (idx === -1) return { ok: false, error: 'Aucun vote à annuler sur cet élément.' };
  const newVotes = votes.filter((_, i) => i !== idx);
  const votePoints = Math.max(0, (participation.votePoints ?? 0) - 1);
  const valeur = computeValeur(newVotes);
  const updated = await updateParticipationById(participation.id, { votes: newVotes, votePoints, valeur });
  return { ok: !!updated, updated, consumed: -COST_ELEMENT };
}

export async function unvoteOnParticipation(
  participation: UserParticipation,
  voter: Pick<User, 'id' | 'statut' | 'votePoints'>,
): Promise<VoteResult> {
  const votes = participation.votes ?? [];
  const idx = votes.findIndex(
    (v) => v.voterId === voter.id && v.cible === 'participation',
  );
  if (idx === -1) return { ok: false, error: 'Aucun vote à annuler sur cette participation.' };
  const newVotes = votes.filter((_, i) => i !== idx);
  const votePoints = Math.max(0, (participation.votePoints ?? 0) - 2);
  const valeur = computeValeur(newVotes);
  const updated = await updateParticipationById(participation.id, { votes: newVotes, votePoints, valeur });
  return { ok: !!updated, updated, consumed: -COST_PARTICIPATION };
}

export function ratioLabel(statut?: StatutPraticien): string {
  const r = RATIO_STATUT[statut ?? 'etudiant'];
  return `x${r}`;
}

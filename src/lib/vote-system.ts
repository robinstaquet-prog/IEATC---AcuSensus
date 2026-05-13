// ─── Système de vote AcuSensus ────────────────────────────────────────────────
// Les votes sont appliqués via des fonctions RPC Supabase (SECURITY DEFINER)
// pour contourner les RLS qui bloquent la modification des lignes d'autrui.

import type { UserParticipation, StatutPraticien, User } from '@/types';
import { RATIO_STATUT } from '@/types';
import { supabase } from '@/lib/supabase';
import { insertNotification } from '@/lib/notification-store';

export const COST_ELEMENT = 1;
export const COST_PARTICIPATION = 2;

export function computeValeur(votes: UserParticipation['votes']): number {
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

// ─── Mapping brut depuis le résultat RPC ─────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToParticipation(row: Record<string, any>): UserParticipation {
  const extra = row.extra_data ?? {};
  return {
    id: row.id,
    userId: row.user_id,
    caseId: row.case_id,
    grilleChoisie: extra.grilleChoisie ?? 'yin_yang',
    grilleSecondaire: extra.grilleSecondaire ?? undefined,
    bilanEnergetique: extra.bilanEnergetique ?? undefined,
    strategie: extra.strategie ?? undefined,
    publicationMode: extra.publicationMode ?? 'anonyme',
    valeur: extra.valeur ?? 1.0,
    pointsProposer: extra.pointsProposer ?? [],
    annotationsInterrogatoire: extra.annotationsInterrogatoire ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    polariteIdentifiee: extra.polariteIdentifiee,
    localisationIdentifiee: extra.localisationIdentifiee,
    categoriesRetenues: extra.categoriesRetenues ?? [],
    commentaireLibre: extra.commentaireLibre,
    revelationFaite: extra.revelationFaite ?? false,
    annotationsPouls: extra.annotationsPouls,
    langueTexte: extra.langueTexte,
    annotationsLangue: extra.annotationsLangue,
    examensSupp: extra.examensSupp,
    palpationAbdo: extra.palpationAbdo,
    deuxiemeSeance: extra.deuxiemeSeance,
    publiee: extra.publiee,
    votes: extra.votes ?? [],
    votePoints: extra.votePoints ?? 0,
    difficultéEstimee: extra.difficultéEstimee,
  };
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

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Les analyses du corpus statique ne sont PAS dans Supabase. */
function isCorpusAnalysis(participation: UserParticipation): boolean {
  // Les IDs Supabase commencent par 'p-' (UUID auto), les analyses corpus ont
  // des IDs comme 'a001-yy-meridiens', 'a002-student', etc.
  return !participation.id.startsWith('p-');
}

/** Vote optimiste pour les analyses du corpus (pas de RPC). */
function optimisticVote(
  participation: UserParticipation,
  voter: Pick<User, 'id' | 'statut'>,
  cible: 'participation' | 'element',
  elementKey?: string,
  cost = 1,
): VoteResult {
  const newVote = {
    id: `v-${Date.now()}-opt`,
    voterId: voter.id,
    voterStatut: (voter.statut ?? 'etudiant') as StatutPraticien,
    cible: cible as import('@/types').VoteCible,
    elementKey,
    createdAt: new Date().toISOString(),
  };
  const votes = [...(participation.votes ?? []), newVote];
  return {
    ok: true,
    updated: { ...participation, votes, valeur: computeValeur(votes) },
    consumed: cost,
  };
}

// ─── Votes via RPC ────────────────────────────────────────────────────────────

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

  // Analyse du corpus → vote optimiste (pas dans Supabase)
  if (isCorpusAnalysis(participation)) {
    return optimisticVote(participation, voter, 'element', elementKey, COST_ELEMENT);
  }

  const { data, error } = await supabase.rpc('cast_vote', {
    p_participation_id: participation.id,
    p_voter_id:         voter.id,
    p_voter_statut:     voter.statut ?? 'etudiant',
    p_cible:            'element',
    p_element_key:      elementKey,
  });

  if (error || !data?.ok) {
    return { ok: false, error: data?.error ?? error?.message ?? 'Vote impossible' };
  }
  const updated = data.row ? rowToParticipation(data.row) : undefined;
  return { ok: true, updated, consumed: COST_ELEMENT };
}

export async function voteOnParticipation(
  participation: UserParticipation,
  voter: Pick<User, 'id' | 'statut' | 'votePoints'> & { prenom?: string; nom?: string },
): Promise<VoteResult> {
  if ((voter.votePoints ?? 0) < COST_PARTICIPATION) {
    return { ok: false, error: 'Solde insuffisant (2 pts requis).' };
  }
  if (alreadyVoted(participation, voter.id)) {
    return { ok: false, error: 'Vous avez déjà validé cette participation.' };
  }

  // Analyse du corpus → vote optimiste (pas dans Supabase)
  if (isCorpusAnalysis(participation)) {
    return optimisticVote(participation, voter, 'participation', undefined, COST_PARTICIPATION);
  }

  const { data, error } = await supabase.rpc('cast_vote', {
    p_participation_id: participation.id,
    p_voter_id:         voter.id,
    p_voter_statut:     voter.statut ?? 'etudiant',
    p_cible:            'participation',
    p_element_key:      null,
  });

  if (error || !data?.ok) {
    return { ok: false, error: data?.error ?? error?.message ?? 'Vote impossible' };
  }

  // Notification au propriétaire de l'analyse (sauf si c'est lui-même qui vote)
  if (participation.userId && participation.userId !== voter.id) {
    void insertNotification(participation.userId, 'vote_analyse', {
      participationId: participation.id,
      caseId: participation.caseId,
      voterId: voter.id,
      voterPrenom: voter.prenom ?? '',
      voterNom: voter.nom ?? '',
    });
  }

  const updated = data.row ? rowToParticipation(data.row) : undefined;
  return { ok: true, updated, consumed: COST_PARTICIPATION };
}

export async function unvoteOnElement(
  participation: UserParticipation,
  voter: Pick<User, 'id' | 'statut' | 'votePoints'>,
  elementKey: string,
): Promise<VoteResult> {
  // Corpus → retrait optimiste
  if (isCorpusAnalysis(participation)) {
    const votes = (participation.votes ?? []).filter(
      (v) => !(v.voterId === voter.id && v.cible === 'element' && v.elementKey === elementKey),
    );
    return { ok: true, updated: { ...participation, votes, valeur: computeValeur(votes) }, consumed: -COST_ELEMENT };
  }

  const { data, error } = await supabase.rpc('cancel_vote', {
    p_participation_id: participation.id,
    p_voter_id:         voter.id,
    p_cible:            'element',
    p_element_key:      elementKey,
  });

  if (error || !data?.ok) {
    return { ok: false, error: data?.error ?? error?.message ?? 'Annulation impossible' };
  }
  const updated = data.row ? rowToParticipation(data.row) : undefined;
  return { ok: true, updated, consumed: -COST_ELEMENT };
}

export async function unvoteOnParticipation(
  participation: UserParticipation,
  voter: Pick<User, 'id' | 'statut' | 'votePoints'>,
): Promise<VoteResult> {
  // Corpus → retrait optimiste
  if (isCorpusAnalysis(participation)) {
    const votes = (participation.votes ?? []).filter(
      (v) => !(v.voterId === voter.id && v.cible === 'participation'),
    );
    return { ok: true, updated: { ...participation, votes, valeur: computeValeur(votes) }, consumed: -COST_PARTICIPATION };
  }

  const { data, error } = await supabase.rpc('cancel_vote', {
    p_participation_id: participation.id,
    p_voter_id:         voter.id,
    p_cible:            'participation',
    p_element_key:      null,
  });

  if (error || !data?.ok) {
    return { ok: false, error: data?.error ?? error?.message ?? 'Annulation impossible' };
  }
  const updated = data.row ? rowToParticipation(data.row) : undefined;
  return { ok: true, updated, consumed: -COST_PARTICIPATION };
}

export function ratioLabel(statut?: StatutPraticien): string {
  const r = RATIO_STATUT[statut ?? 'etudiant'];
  return `x${r}`;
}

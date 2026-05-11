'use client';

// ─── Store d'exercices d'apprentissage — Supabase ────────────────────────────
// Les exercices sont PRIVES : pas de publication, pas comptabilisés dans les stats.
// Stockés dans user_participations avec extra_data.isExercice = true.
// Schéma réel : id (uuid auto), user_id, case_id, extra_data (JSONB), created_at, updated_at

import { supabase } from '@/lib/supabase';
import type { UserParticipation } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromRow(row: Record<string, any>): UserParticipation {
  const extra = row.extra_data ?? {};
  return {
    id: row.id,
    userId: row.user_id,
    caseId: row.case_id,
    grilleChoisie: extra.grilleChoisie ?? 'yin_yang',
    grilleSecondaire: extra.grilleSecondaire ?? undefined,
    bilanEnergetique: extra.bilanEnergetique ?? undefined,
    strategie: extra.strategie ?? undefined,
    publicationMode: undefined,
    valeur: 0,
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
    publiee: false,
    votes: [],
    votePoints: 0,
    difficultéEstimee: extra.difficultéEstimee,
  };
}

function toExtraData(data: Partial<UserParticipation> & { caseId: string }) {
  return {
    isExercice: true,
    grilleChoisie: data.grilleChoisie ?? 'yin_yang',
    grilleSecondaire: data.grilleSecondaire ?? null,
    bilanEnergetique: data.bilanEnergetique ?? null,
    strategie: data.strategie ?? null,
    pointsProposer: data.pointsProposer ?? [],
    annotationsInterrogatoire: data.annotationsInterrogatoire ?? [],
    polariteIdentifiee: data.polariteIdentifiee,
    localisationIdentifiee: data.localisationIdentifiee,
    categoriesRetenues: data.categoriesRetenues ?? [],
    commentaireLibre: data.commentaireLibre,
    revelationFaite: data.revelationFaite ?? false,
    annotationsPouls: data.annotationsPouls,
    langueTexte: data.langueTexte,
    annotationsLangue: data.annotationsLangue,
    examensSupp: data.examensSupp,
    palpationAbdo: data.palpationAbdo,
    deuxiemeSeance: data.deuxiemeSeance,
    difficultéEstimee: data.difficultéEstimee,
  };
}

/** Récupère l'exercice d'un utilisateur pour un cas donné. */
export async function getExercice(
  userId: string,
  caseId: string,
): Promise<UserParticipation | undefined> {
  const { data, error } = await supabase
    .from('user_participations')
    .select('*')
    .eq('user_id', userId)
    .eq('case_id', caseId)
    .filter('extra_data->isExercice', 'eq', 'true')
    .maybeSingle();
  if (error || !data) return undefined;
  return fromRow(data);
}

/** Tous les exercices d'un utilisateur. */
export async function getAllExercices(userId: string): Promise<UserParticipation[]> {
  const { data, error } = await supabase
    .from('user_participations')
    .select('*')
    .eq('user_id', userId)
    .filter('extra_data->isExercice', 'eq', 'true')
    .order('updated_at', { ascending: false });
  if (error || !data) return [];
  return data.map(fromRow);
}

/** Enregistre un exercice d'apprentissage (insert ou update). */
export async function saveExercice(
  userId: string,
  data: Partial<UserParticipation> & { caseId: string },
): Promise<UserParticipation> {
  const now = new Date().toISOString();
  const existing = await getExercice(userId, data.caseId);

  if (existing) {
    const { data: updated, error } = await supabase
      .from('user_participations')
      .update({ extra_data: toExtraData(data), updated_at: now })
      .eq('id', existing.id)
      .select()
      .single();
    if (error || !updated) throw new Error(error?.message ?? 'Erreur mise à jour exercice');
    return fromRow(updated);
  }

  // Pas d'id custom — Supabase génère un UUID automatiquement
  const { data: inserted, error } = await supabase
    .from('user_participations')
    .insert({
      user_id: userId,
      case_id: data.caseId,
      extra_data: toExtraData(data),
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();
  if (error || !inserted) throw new Error(error?.message ?? 'Erreur insertion exercice');
  return fromRow(inserted);
}

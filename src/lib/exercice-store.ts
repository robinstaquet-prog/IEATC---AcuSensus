'use client';

// ─── Store d'exercices d'apprentissage — Supabase ────────────────────────────
// Les exercices sont PRIVES : pas de publication, pas comptabilisés dans les stats.
// Stockés dans user_participations avec extra_data.isExercice = true.

import { supabase } from '@/lib/supabase';
import type { UserParticipation } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromRow(row: Record<string, any>): UserParticipation {
  const extra = row.extra_data ?? {};
  return {
    id: row.id,
    userId: row.user_id,
    caseId: row.case_id,
    grilleChoisie: row.grille_choisie,
    grilleSecondaire: row.grille_secondaire ?? undefined,
    bilanEnergetique: row.bilan_energetique ?? undefined,
    strategie: row.strategie ?? undefined,
    publicationMode: undefined,
    valeur: 0,
    pointsProposer: row.points_traitement ?? [],
    annotationsInterrogatoire: row.annotations ?? [],
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

function toRow(userId: string, data: Partial<UserParticipation> & { caseId: string }) {
  return {
    case_id: data.caseId,
    user_id: userId,
    grille_choisie: data.grilleChoisie ?? 'yin_yang',
    grille_secondaire: data.grilleSecondaire ?? null,
    bilan_energetique: data.bilanEnergetique ?? null,
    strategie: data.strategie ?? null,
    points_traitement: data.pointsProposer ?? [],
    publication_mode: 'anonyme',
    valeur: 0,
    annotations: data.annotationsInterrogatoire ?? [],
    extra_data: {
      isExercice: true,
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
    },
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
      .update({ ...toRow(userId, data), updated_at: now })
      .eq('id', existing.id)
      .select()
      .single();
    if (error || !updated) throw new Error(error?.message ?? 'Erreur mise à jour exercice');
    return fromRow(updated);
  }

  const row = {
    id: `ex-${Date.now()}`,
    ...toRow(userId, data),
    created_at: now,
    updated_at: now,
  };
  const { data: inserted, error } = await supabase
    .from('user_participations')
    .insert(row)
    .select()
    .single();
  if (error || !inserted) throw new Error(error?.message ?? 'Erreur insertion exercice');
  return fromRow(inserted);
}

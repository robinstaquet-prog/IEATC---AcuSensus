'use client';

// ─── Store de participation — Supabase ────────────────────────────────────────

import { supabase } from '@/lib/supabase';
import type { UserParticipation, ClinicalCase, DifficulteEstimee } from '@/types';
import { RATIO_STATUT, DIFFICULTE_LABELS } from '@/types';

// ─── Colonnes directes RÉELLES dans user_participations ──────────────────────
// Confirmées par les erreurs PostgREST successives :
//   ✗ annotations, bilan_energetique, valeur (n'existent PAS)
//
// Seules les colonnes ci-dessous sont écrites directement :
//   id (uuid auto), user_id, case_id, extra_data (JSONB),
//   created_at, updated_at
//
// TOUT le reste (grille_choisie, publication_mode, valeur, bilan_energetique,
// strategie, annotations, etc.) est stocké dans extra_data.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromRow(row: Record<string, any>): UserParticipation {
  const extra = row.extra_data ?? {};
  return {
    id: row.id,
    userId: row.user_id,
    caseId: row.case_id,
    // extra_data en priorité, fallback colonnes directes (rétrocompat)
    grilleChoisie: extra.grilleChoisie ?? row.grille_choisie ?? undefined,
    grilleSecondaire: extra.grilleSecondaire ?? row.grille_secondaire ?? undefined,
    bilanEnergetique: extra.bilanEnergetique ?? row.bilan_energetique ?? undefined,
    strategie: extra.strategie ?? row.strategie ?? undefined,
    publicationMode: extra.publicationMode ?? row.publication_mode ?? 'anonyme',
    valeur: extra.valeur ?? row.valeur ?? 1.0,
    pointsProposer: extra.pointsProposer ?? row.points_traitement ?? [],
    annotationsInterrogatoire: extra.annotationsInterrogatoire ?? row.annotations ?? [],
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

function toExtraData(data: Partial<UserParticipation> & { caseId: string }) {
  return {
    grilleChoisie: data.grilleChoisie ?? 'yin_yang',
    grilleSecondaire: data.grilleSecondaire ?? null,
    publicationMode: data.publicationMode ?? 'anonyme',
    valeur: data.valeur ?? 1.0,
    bilanEnergetique: data.bilanEnergetique ?? null,
    strategie: data.strategie ?? null,
    pointsProposer: data.pointsProposer ?? [],
    polariteIdentifiee: data.polariteIdentifiee,
    localisationIdentifiee: data.localisationIdentifiee,
    categoriesRetenues: data.categoriesRetenues ?? [],
    commentaireLibre: data.commentaireLibre,
    revelationFaite: data.revelationFaite ?? false,
    annotationsInterrogatoire: data.annotationsInterrogatoire ?? [],
    annotationsPouls: data.annotationsPouls,
    langueTexte: data.langueTexte,
    annotationsLangue: data.annotationsLangue,
    examensSupp: data.examensSupp,
    palpationAbdo: data.palpationAbdo,
    deuxiemeSeance: data.deuxiemeSeance,
    publiee: data.publiee,
    votes: data.votes ?? [],
    votePoints: data.votePoints ?? 0,
    difficultéEstimee: data.difficultéEstimee,
  };
}

// ─── Fonctions du store ───────────────────────────────────────────────────────

export async function getParticipation(
  userId: string,
  caseId: string,
): Promise<UserParticipation | undefined> {
  const { data, error } = await supabase
    .from('user_participations')
    .select('*')
    .eq('user_id', userId)
    .eq('case_id', caseId)
    .maybeSingle();
  if (error || !data) return undefined;
  return fromRow(data);
}

export async function getAllParticipations(userId: string): Promise<UserParticipation[]> {
  const { data, error } = await supabase
    .from('user_participations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data.map(fromRow);
}

/** Si la valeur dépasse 50, marque le cas comme qualifié pour l'apprentissage. */
async function maybeQualifieCase(caseId: string, valeur?: number): Promise<void> {
  if ((valeur ?? 0) >= 50) {
    await supabase
      .from('clinical_cases')
      .update({ qualifie_apprentissage: true })
      .eq('id', caseId);
  }
}

export async function upsertParticipation(
  userId: string,
  data: Partial<UserParticipation> & { caseId: string },
): Promise<UserParticipation> {
  const now = new Date().toISOString();
  const existing = await getParticipation(userId, data.caseId);

  if (existing) {
    const { data: updated, error } = await supabase
      .from('user_participations')
      .update({
        extra_data: toExtraData(data),
        updated_at: now,
      })
      .eq('id', existing.id)
      .select()
      .single();
    if (error || !updated) throw new Error(error?.message ?? 'Erreur mise à jour');
    await maybeQualifieCase(data.caseId, data.valeur);
    return fromRow(updated);
  }

  // Pas d'id custom : Supabase génère automatiquement un UUID
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
  if (error || !inserted) throw new Error(error?.message ?? 'Erreur insertion');
  await maybeQualifieCase(data.caseId, data.valeur);
  return fromRow(inserted);
}

export async function getParticipationsByCase(caseId: string): Promise<UserParticipation[]> {
  const { data, error } = await supabase
    .from('user_participations')
    .select('*')
    .eq('case_id', caseId)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data.map(fromRow);
}

export async function updateParticipationById(
  id: string,
  patch: Partial<UserParticipation>,
): Promise<UserParticipation | undefined> {
  const { data: existing } = await supabase
    .from('user_participations')
    .select('*')
    .eq('id', id)
    .single();
  if (!existing) return undefined;

  const currentExtra = existing.extra_data ?? {};
  const newExtra = {
    ...currentExtra,
    ...(patch.votes !== undefined && { votes: patch.votes }),
    ...(patch.votePoints !== undefined && { votePoints: patch.votePoints }),
    ...(patch.revelationFaite !== undefined && { revelationFaite: patch.revelationFaite }),
    ...(patch.valeur !== undefined && { valeur: patch.valeur }),
    ...(patch.publicationMode !== undefined && { publicationMode: patch.publicationMode }),
  };

  const { data: updated, error } = await supabase
    .from('user_participations')
    .update({
      extra_data: newExtra,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
  if (error || !updated) return undefined;
  if (patch.valeur !== undefined) {
    await maybeQualifieCase(existing.case_id, patch.valeur);
  }
  return fromRow(updated);
}

export async function markRevelation(userId: string, caseId: string): Promise<void> {
  const existing = await getParticipation(userId, caseId);
  if (!existing) return;
  const { data: row } = await supabase
    .from('user_participations')
    .select('extra_data')
    .eq('id', existing.id)
    .single();
  await supabase
    .from('user_participations')
    .update({
      extra_data: { ...(row?.extra_data ?? {}), revelationFaite: true },
      updated_at: new Date().toISOString(),
    })
    .eq('id', existing.id);
}

export async function removeParticipation(userId: string, caseId: string): Promise<void> {
  await supabase
    .from('user_participations')
    .delete()
    .eq('user_id', userId)
    .eq('case_id', caseId);
}

// No-op : les analyses statiques ne sont pas insérées dans Supabase
export async function syncParticipationIfNeeded(_p: UserParticipation): Promise<void> {
  // Les analyses statiques proviennent de data/cases.ts, pas de la DB
}

// ─── Qualification "cas d'apprentissage" ─────────────────────────────────────

export function isCasApprentissage(
  cas: ClinicalCase,
  participations: UserParticipation[],
): boolean {
  if (cas.exemplaire || cas.qualifieApprentissage) return true;
  const hasExpertVariante =
    cas.analyses.some(
      (a) => a.role === 'expert' || a.auteurStatut === 'expert',
    ) ||
    participations.some(
      (p) =>
        (p as UserParticipation & { role?: string }).role === 'expert' ||
        (p as UserParticipation & { auteurStatut?: string }).auteurStatut === 'expert',
    );
  if (hasExpertVariante) return true;
  if (participations.some((p) => (p.valeur ?? 0) >= 50)) return true;
  return participations.some((p) =>
    (p.votes ?? []).some((v) => RATIO_STATUT[v.voterStatut] === 10),
  );
}

// ─── Difficulté estimée ───────────────────────────────────────────────────────

export interface DifficultyResult {
  niveau: DifficulteEstimee;
  label: string;
  count: number;
  total: number;
}

export function computeDifficulty(participations: UserParticipation[]): DifficultyResult | null {
  const votes = participations
    .map((p) => p.difficultéEstimee)
    .filter((d): d is DifficulteEstimee => !!d);
  if (votes.length === 0) return null;
  const counts = new Map<DifficulteEstimee, number>();
  for (const v of votes) counts.set(v, (counts.get(v) ?? 0) + 1);
  let best: DifficulteEstimee = votes[0]!;
  let bestCount = 0;
  for (const [niveau, count] of counts.entries()) {
    if (count > bestCount) { best = niveau; bestCount = count; }
  }
  return { niveau: best, label: DIFFICULTE_LABELS[best], count: bestCount, total: votes.length };
}

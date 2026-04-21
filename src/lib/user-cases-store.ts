'use client';

// ─── Store de cas soumis par l'utilisateur — Supabase ───────────────────────

import { supabase } from '@/lib/supabase';
import type { ClinicalCase, StatutCas, NiveauComplexite, ReadingGridId } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: Record<string, any>): ClinicalCase {
  return {
    id: row.id,
    slug: row.slug,
    titre: row.titre,
    statut: row.statut as StatutCas,
    niveauComplexite: row.niveau_complexite as NiveauComplexite,
    age: row.age ?? undefined,
    sexe: row.sexe ?? undefined,
    casComplet: row.cas_complet,
    exemplaire: row.exemplaire,
    qualifieApprentissage: row.qualifie_apprentissage ?? false,
    grillePrincipale: row.grille_principale as ReadingGridId,
    tags: row.tags ?? [],
    content: row.content,
    auteurId: row.auteur_id ?? undefined,
    dateCreation: row.date_creation ?? undefined,
    datePublication: row.date_publication ?? undefined,
    viewCount: row.view_count ?? 0,
    analyses: [],
  };
}

export async function getUserCases(): Promise<ClinicalCase[]> {
  const { data, error } = await supabase
    .from('clinical_cases')
    .select('*')
    .not('auteur_id', 'is', null);
  if (error || !data) return [];
  return data.map(mapRow);
}

export async function getUserCasesByAuteur(auteurId: string): Promise<ClinicalCase[]> {
  const { data, error } = await supabase
    .from('clinical_cases')
    .select('*')
    .eq('auteur_id', auteurId)
    .order('date_creation', { ascending: false });
  if (error || !data) return [];
  return data.map(mapRow);
}

export async function getUserCaseById(id: string): Promise<ClinicalCase | undefined> {
  const { data, error } = await supabase
    .from('clinical_cases')
    .select('*')
    .eq('id', id)
    .single();
  if (error || !data) return undefined;
  return mapRow(data);
}

export async function addUserCase(cas: ClinicalCase): Promise<{ error: string | null }> {
  const { error } = await supabase.from('clinical_cases').insert({
    id: cas.id,
    slug: cas.slug,
    titre: cas.titre,
    statut: cas.statut,
    niveau_complexite: cas.niveauComplexite,
    age: cas.age ?? null,
    sexe: cas.sexe ?? null,
    cas_complet: cas.casComplet,
    exemplaire: cas.exemplaire,
    grille_principale: cas.grillePrincipale,
    tags: cas.tags,
    content: cas.content,
    auteur_id: cas.auteurId ?? null,
    date_creation: cas.dateCreation ?? null,
    date_publication: cas.datePublication ?? null,
  });
  if (error) return { error: error.message };
  return { error: null };
}

export async function deleteUserCase(id: string): Promise<void> {
  await supabase.from('clinical_cases').delete().eq('id', id);
}

export async function updateUserCase(id: string, patch: {
  titre?: string;
  slug?: string;
  content?: Partial<ClinicalCase['content']>;
}): Promise<{ error: string | null }> {
  const update: Record<string, unknown> = {};
  if (patch.titre !== undefined) update.titre = patch.titre;
  if (patch.slug !== undefined) update.slug = patch.slug;
  if (patch.content !== undefined) update.content = patch.content;
  const { error } = await supabase
    .from('clinical_cases')
    .update(update)
    .eq('id', id);
  if (error) return { error: error.message };
  return { error: null };
}

export { GRILLES, getGrille, getGrilleLabel } from './grilles';
export {
  CLINICAL_CASES,
  getCaseBySlug,
  getCasesExemplaires,
  getCasesRecents,
} from './cases';
export { LEXIQUE, getTermById, getTermesByCategorie } from './lexique';

// ─── Re-exports enrichis avec les cas utilisateur (localStorage) ────────────
// getCaseById et getCasesPublies cherchent aussi dans le store utilisateur.

import {
  getCaseById as getCaseByIdCorpus,
  getCasesPublies as getCasesPubliesCorpus,
} from './cases';
import type { ClinicalCase } from '@/types';

export function getCaseById(id: string): ClinicalCase | undefined {
  return getCaseByIdCorpus(id);
}

export function getCasesPublies(): ClinicalCase[] {
  return getCasesPubliesCorpus();
}

// ─── Cas récents avec Supabase (server-side) ────────────────────────────────
// Fusionne les cas statiques du corpus avec les cas soumis par les utilisateurs.

import { getGrille } from './grilles';
import type { ReadingGridId } from '@/types';

export async function getRecentCasesWithDb(limit = 4): Promise<ClinicalCase[]> {
  const corpusCases = getCasesPubliesCorpus();
  let dbCases: ClinicalCase[] = [];

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const { data } = await supabase
      .from('clinical_cases')
      .select('*')
      .eq('statut', 'publie')
      .order('date_creation', { ascending: false })
      .limit(20);

    if (data) {
      dbCases = data.map((row) => ({
        id: row.id,
        slug: row.slug,
        titre: row.titre,
        statut: row.statut,
        niveauComplexite: row.niveau_complexite,
        age: row.age ?? undefined,
        sexe: row.sexe ?? undefined,
        casComplet: row.cas_complet,
        exemplaire: row.exemplaire,
        grillePrincipale: row.grille_principale as ReadingGridId,
        tags: row.tags ?? [],
        content: row.content,
        auteurId: row.auteur_id ?? undefined,
        dateCreation: row.date_creation ?? '',
        datePublication: row.date_publication ?? undefined,
        viewCount: row.view_count ?? 0,
        analyses: [],
      }));
    }
  } catch {
    // Supabase non disponible — on continue avec le corpus seul
  }

  // Fusionner en dédupliquant par ID (les cas du corpus existent aussi en DB)
  const seen = new Set<string>();
  const all: ClinicalCase[] = [];
  for (const c of [...dbCases, ...corpusCases]) {
    if (!seen.has(c.id)) {
      seen.add(c.id);
      all.push(c);
    }
  }

  return all
    .sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime())
    .slice(0, limit);
}

// ─── Statistiques globales calculées ─────────────────────────────────────────

import { CLINICAL_CASES } from './cases';
import {
  normaliserTextes,
  labelConceptIeatc,
  SYNDROMES_IEATC,
  normaliserTechnique,
  extraireChaineCausale,
} from './normalisation';
import { normalizePoint } from '@/lib/point-normalize';
import { createClient } from '@supabase/supabase-js';
import type { GlobalStats, FrequencyEntry, NiveauComplexite, ChaineCausaleFreq } from '@/types';

function computeFrequency(ids: string[]): FrequencyEntry[] {
  const map: Record<string, number> = {};
  for (const id of ids) {
    if (!id) continue; // ignorer les valeurs vides/undefined
    map[id] = (map[id] ?? 0) + 1;
  }
  return Object.entries(map)
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Retourne l'ensemble des IDs de familles couvertes par les syndromes donnés.
 * Quand un syndrome spécifique est reconnu (ex: vide_yin_rein), sa famille-mère
 * (vide_yin) ne doit pas être comptée séparément dans les stats.
 */
function famillesCouvertesBySyndromes(syndromeIds: string[]): Set<string> {
  const covered = new Set<string>();
  for (const sid of syndromeIds) {
    const parentId = SYNDROMES_IEATC.find((s) => s.id === sid)?.parentFamilleId;
    if (parentId) covered.add(parentId);
  }
  return covered;
}

export async function computeGlobalStats(): Promise<GlobalStats> {
  const publie = CLINICAL_CASES.filter((c) => c.statut === 'publie');
  const allAnalyses = publie.flatMap((c) => c.analyses);

  // Points — codes bruts extraits des traitements proposés
  // Normaliser les codes (VG→TM, RM→JM, etc.) pour agréger correctement
  const allPointCodes = allAnalyses.flatMap((a) =>
    a.pointsUtilises.map((p) => normalizePoint(p.code).code),
  );

  // Grilles principales utilisées dans les analyses
  const allGrilles = allAnalyses.map((a) => a.grillePrincipale);

  // Localisation des foyers — renseignée par les praticiens dans leur analyse
  // ('non_applicable' exclu car non informatif pour les statistiques)
  const allFoyers = allAnalyses
    .map((a) => a.localisationFoyer)
    .filter((f): f is NonNullable<typeof f> => !!f && f !== 'non_applicable')
    .map(String);

  // Techniques de traitement — extraites et normalisées (composite → base)
  // Ex : tonification_chauffee → tonification | dispersion_puis_tonification → [dispersion, tonification]
  const allTechniques: string[] = allAnalyses.flatMap((a) =>
    a.pointsUtilises.flatMap((p) => normaliserTechnique(p.technique)),
  );

  // ── Normalisation sémantique à 4 couches ─────────────────────────────────────
  // Sources : categoriesDiagnostiques (requis) + bilanEnergetique + strategie (optionnels)
  // Chaque analyse contribue une fois par concept reconnu (sans doublons intra-analyse).
  // Fix A : quand un syndrome spécifique est reconnu, sa famille-mère n'est PAS
  //         comptée séparément (déduplication hiérarchique).
  const famillesCounts: Record<string, number> = {};
  const syndromesCounts: Record<string, number> = {};
  const organesCounts: Record<string, number> = {};
  const strategiesCounts: Record<string, number> = {};
  const pathologiesCounts: Record<string, number> = {};
  // Chaînes causales — clé = "effet|cause" pour déduplication
  const chainesCounts: Record<string, { effet: string; cause: string; marqueur: string; count: number }> = {};

  for (const a of allAnalyses) {
    const textesDiag: string[] = [
      ...a.categoriesDiagnostiques,
      ...(a.bilanEnergetique ? [a.bilanEnergetique] : []),
    ];
    const textesStrategie: string[] = [
      ...(a.strategieTherapeutique ? [a.strategieTherapeutique] : []),
      ...(a.strategie ? [a.strategie] : []),
    ];

    const { familles, syndromes, organes } = normaliserTextes(textesDiag);
    const { strategies } = normaliserTextes(textesStrategie);

    // Fix A — ne pas compter les familles déjà couvertes par un syndrome spécifique
    const couvertes = famillesCouvertesBySyndromes(syndromes);
    for (const f of familles) {
      if (!couvertes.has(f)) famillesCounts[f] = (famillesCounts[f] ?? 0) + 1;
    }
    for (const s of syndromes) syndromesCounts[s] = (syndromesCounts[s] ?? 0) + 1;
    for (const o of organes) organesCounts[o] = (organesCounts[o] ?? 0) + 1;
    for (const s of strategies) strategiesCounts[s] = (strategiesCounts[s] ?? 0) + 1;

    // Chaînes causales — extraites des textes diagnostiques + bilan
    for (const t of textesDiag) {
      const chaine = extraireChaineCausale(t);
      if (chaine) {
        const key = `${chaine.effet}|${chaine.cause}`;
        if (chainesCounts[key]) {
          chainesCounts[key].count += 1;
        } else {
          chainesCounts[key] = { effet: chaine.effet, cause: chaine.cause, marqueur: chaine.marqueur, count: 1 };
        }
      }
    }
  }

  // ── Pathologies — extraites du motif de consultation (par cas, non par analyse) ──
  for (const c of publie) {
    const { pathologies } = normaliserTextes([c.content.motif]);
    for (const p of pathologies) pathologiesCounts[p] = (pathologiesCounts[p] ?? 0) + 1;
  }

  // ── Fix C — Participations publiques Supabase ────────────────────────────────
  // Inclure les analyses publiées par les membres dans les statistiques globales.
  // Seules les participations avec publicationMode='public' et publiee=true sont incluses.
  // Les exercices (isExercice=true) sont toujours exclus.
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { data: parts } = await supabase
      .from('user_participations')
      .select('extra_data')
      .filter('extra_data->>publicationMode', 'eq', 'public')
      .filter('extra_data->>publiee', 'eq', 'true')
      .filter('extra_data->>isExercice', 'neq', 'true');

    for (const row of parts ?? []) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const extra: Record<string, any> = row.extra_data ?? {};

      // Points proposés par l'utilisateur
      const pointsProposer: Array<{ code?: string; technique?: string }> = extra.pointsProposer ?? [];
      for (const p of pointsProposer) {
        if (p.code) allPointCodes.push(normalizePoint(p.code).code);
        if (p.technique) allTechniques.push(...normaliserTechnique(p.technique));
      }

      // Grille choisie
      if (extra.grilleChoisie) allGrilles.push(extra.grilleChoisie);

      // Localisation identifiée
      const foyer = extra.localisationIdentifiee;
      if (foyer && foyer !== 'non_applicable') allFoyers.push(String(foyer));

      // Textes diagnostiques : catégories retenues + bilan énergétique
      const textesDiag: string[] = [
        ...(Array.isArray(extra.categoriesRetenues) ? extra.categoriesRetenues.filter(Boolean) : []),
        ...(extra.bilanEnergetique ? [extra.bilanEnergetique] : []),
      ];

      // Texte stratégie
      const textesStrategie: string[] = extra.strategie ? [extra.strategie] : [];

      if (textesDiag.length > 0 || textesStrategie.length > 0) {
        const { familles, syndromes, organes } = normaliserTextes(textesDiag);
        const { strategies } = normaliserTextes(textesStrategie);

        // Fix A — même déduplication pour les participations
        const couvertes = famillesCouvertesBySyndromes(syndromes);
        for (const f of familles) {
          if (!couvertes.has(f)) famillesCounts[f] = (famillesCounts[f] ?? 0) + 1;
        }
        for (const s of syndromes) syndromesCounts[s] = (syndromesCounts[s] ?? 0) + 1;
        for (const o of organes) organesCounts[o] = (organesCounts[o] ?? 0) + 1;
        for (const s of strategies) strategiesCounts[s] = (strategiesCounts[s] ?? 0) + 1;

        // Chaînes causales — participations Supabase
        for (const t of textesDiag) {
          const chaine = extraireChaineCausale(t);
          if (chaine) {
            const key = `${chaine.effet}|${chaine.cause}`;
            if (chainesCounts[key]) {
              chainesCounts[key].count += 1;
            } else {
              chainesCounts[key] = { effet: chaine.effet, cause: chaine.cause, marqueur: chaine.marqueur, count: 1 };
            }
          }
        }
      }
    }
  } catch {
    // Supabase non disponible (build statique, etc.) — on continue avec le corpus seul
  }

  const topFamillesDiag: FrequencyEntry[] = Object.entries(famillesCounts)
    .map(([id, count]) => ({ id, count, label: labelConceptIeatc(id) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  const topSyndromes: FrequencyEntry[] = Object.entries(syndromesCounts)
    .map(([id, count]) => ({ id, count, label: labelConceptIeatc(id) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  const topOrganes: FrequencyEntry[] = Object.entries(organesCounts)
    .map(([id, count]) => ({ id, count, label: labelConceptIeatc(id) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const topStrategies: FrequencyEntry[] = Object.entries(strategiesCounts)
    .map(([id, count]) => ({ id, count, label: labelConceptIeatc(id) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const topPathologies: FrequencyEntry[] = Object.entries(pathologiesCounts)
    .map(([id, count]) => ({ id, count, label: labelConceptIeatc(id) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  const complexityDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
  const sexeDistribution: Record<string, number> = { masculin: 0, feminin: 0, non_precise: 0 };

  for (const c of publie) {
    complexityDistribution[c.niveauComplexite] =
      (complexityDistribution[c.niveauComplexite] ?? 0) + 1;
    const sexe = c.sexe ?? 'non_precise';
    sexeDistribution[sexe] = (sexeDistribution[sexe] ?? 0) + 1;
  }

  const topChaines: ChaineCausaleFreq[] = Object.values(chainesCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  return {
    totalCas: CLINICAL_CASES.length,
    casPublies: publie.length,
    casExemplaires: publie.filter((c) => c.exemplaire || c.qualifieApprentissage).length,
    totalAnalyses: allAnalyses.length,
    pointsDistincts: new Set(allPointCodes).size,
    topPoints: computeFrequency(allPointCodes).slice(0, 10),
    topGrilles: computeFrequency(allGrilles).slice(0, 8),
    topFoyers: computeFrequency(allFoyers),
    topTechniques: computeFrequency(allTechniques),
    topFamillesDiag,
    topSyndromes,
    topOrganes,
    topStrategies,
    topPathologies,
    topChaines,
    repartitionComplexite: complexityDistribution as Record<NiveauComplexite, number>,
    repartitionSexe: sexeDistribution,
  };
}

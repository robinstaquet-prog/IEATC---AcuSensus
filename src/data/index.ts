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

// ─── Statistiques globales calculées ─────────────────────────────────────────

import { CLINICAL_CASES } from './cases';
import { normaliserTextes, labelConceptIeatc } from './normalisation';
import type { GlobalStats, FrequencyEntry, NiveauComplexite } from '@/types';

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

export function computeGlobalStats(): GlobalStats {
  const publie = CLINICAL_CASES.filter((c) => c.statut === 'publie');
  const allAnalyses = publie.flatMap((c) => c.analyses);

  // Points — codes bruts extraits des traitements proposés
  const allPointCodes = allAnalyses.flatMap((a) => a.pointsUtilises.map((p) => p.code));

  // Grilles principales utilisées dans les analyses
  const allGrilles = allAnalyses.map((a) => a.grillePrincipale);

  // Localisation des foyers — renseignée par les praticiens dans leur analyse
  // ('non_applicable' exclu car non informatif pour les statistiques)
  const allFoyers = allAnalyses
    .map((a) => a.localisationFoyer)
    .filter((f): f is NonNullable<typeof f> => !!f && f !== 'non_applicable')
    .map(String);

  // Techniques de traitement — extraites des points proposés dans chaque analyse
  const allTechniques = allAnalyses.flatMap((a) => a.pointsUtilises.map((p) => p.technique));

  // ── Normalisation sémantique à 4 couches ─────────────────────────────────────
  // Sources : categoriesDiagnostiques (requis) + bilanEnergetique + strategie (optionnels)
  // Chaque analyse contribue une fois par concept reconnu (sans doublons intra-analyse).
  const famillesCounts: Record<string, number> = {};
  const syndromesCounts: Record<string, number> = {};
  const organesCounts: Record<string, number> = {};
  const strategiesCounts: Record<string, number> = {};
  const pathologiesCounts: Record<string, number> = {};

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

    for (const f of familles) famillesCounts[f] = (famillesCounts[f] ?? 0) + 1;
    for (const s of syndromes) syndromesCounts[s] = (syndromesCounts[s] ?? 0) + 1;
    for (const o of organes) organesCounts[o] = (organesCounts[o] ?? 0) + 1;
    for (const s of strategies) strategiesCounts[s] = (strategiesCounts[s] ?? 0) + 1;
  }

  // ── Pathologies — extraites du motif de consultation (par cas, non par analyse) ──
  for (const c of publie) {
    const { pathologies } = normaliserTextes([c.content.motif]);
    for (const p of pathologies) pathologiesCounts[p] = (pathologiesCounts[p] ?? 0) + 1;
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

  return {
    totalCas: CLINICAL_CASES.length,
    casPublies: publie.length,
    casExemplaires: publie.filter((c) => c.exemplaire).length,
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
    repartitionComplexite: complexityDistribution as Record<NiveauComplexite, number>,
    repartitionSexe: sexeDistribution,
  };
}

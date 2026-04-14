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
import type { GlobalStats, FrequencyEntry, NiveauComplexite } from '@/types';

function computeFrequency(ids: string[]): FrequencyEntry[] {
  const map: Record<string, number> = {};
  for (const id of ids) {
    map[id] = (map[id] ?? 0) + 1;
  }
  return Object.entries(map)
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count);
}

export function computeGlobalStats(): GlobalStats {
  const publie = CLINICAL_CASES.filter((c) => c.statut === 'publie');
  const allAnalyses = publie.flatMap((c) => c.analyses);

  const allPointCodes = allAnalyses.flatMap((a) => a.pointsUtilises.map((p) => p.code));
  const allGrilles = allAnalyses.map((a) => a.grillePrincipale);
  const allPolarites = allAnalyses.map((a) => a.polarite);

  const complexityDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0 };
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
    topPoints: computeFrequency(allPointCodes).slice(0, 10),
    topGrilles: computeFrequency(allGrilles).slice(0, 7),
    topPolarites: computeFrequency(allPolarites),
    repartitionComplexite: complexityDistribution as Record<NiveauComplexite, number>,
    repartitionSexe: sexeDistribution,
  };
}

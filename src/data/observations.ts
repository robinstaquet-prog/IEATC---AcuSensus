// ─── Table d'observations plate — architecture cross-stats ───────────────────
// Chaque analyse du corpus = 1 ligne avec toutes ses dimensions extraites.
// Permet des requêtes du type :
//   "Quand syndrome = vide_yang_rein, quels points reviennent ?"
//   "Quand organe = foie, quelle technique domine ?"

import { CLINICAL_CASES } from './cases';
import { normaliserTextes, normaliserTechnique, labelConceptIeatc } from './normalisation';
import { normalizePoint } from '@/lib/point-normalize';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Observation {
  caseId: string;
  grille: string;
  foyer: string | null;
  points: string[];        // codes normalisés (ex: "36E", "4TM")
  techniques: string[];    // étendues (tonification_chauffee → ['tonification_chauffee', 'tonification'])
  familles: string[];      // familles diagnostiques (couche 1)
  syndromes: string[];     // syndromes IEATC (couche 2)
  organes: string[];       // organes/localisations (couche 3)
  strategies: string[];    // stratégies thérapeutiques (couche 4)
  niveauComplexite: number;
  sexe: string;
}

export type CrossDimension = 'syndromes' | 'organes' | 'familles' | 'strategies' | 'points' | 'grilles';

export interface ConceptOption {
  id: string;
  label: string;
  count: number;
}

export interface ConceptIndex {
  syndromes: ConceptOption[];
  organes: ConceptOption[];
  familles: ConceptOption[];
  strategies: ConceptOption[];
  points: ConceptOption[];
  grilles: ConceptOption[];
  // Carte id → label pour la résolution côté client
  labelMap: Record<string, string>;
}

export interface CrossStatResult {
  matchCount: number;
  topPoints: Array<{ id: string; count: number }>;
  topTechniques: Array<{ id: string; count: number }>;
  topGrilles: Array<{ id: string; count: number }>;
  topSyndromes: Array<{ id: string; count: number }>;
  topOrganes: Array<{ id: string; count: number }>;
  topStrategies: Array<{ id: string; count: number }>;
  topFamilles: Array<{ id: string; count: number }>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function countFreq(ids: string[], exclude?: string): Array<{ id: string; count: number }> {
  const map: Record<string, number> = {};
  for (const id of ids) {
    if (!id || id === exclude) continue;
    map[id] = (map[id] ?? 0) + 1;
  }
  return Object.entries(map)
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count);
}

// ─── Construction de la table d'observations ──────────────────────────────────

export function buildObservations(): Observation[] {
  const obs: Observation[] = [];
  const publie = CLINICAL_CASES.filter((c) => c.statut === 'publie');

  for (const cas of publie) {
    for (const analyse of cas.analyses) {
      const textesDiag: string[] = [
        ...analyse.categoriesDiagnostiques,
        ...(analyse.bilanEnergetique ? [analyse.bilanEnergetique] : []),
      ];
      const textesStrategie: string[] = [
        ...((analyse as { strategieTherapeutique?: string }).strategieTherapeutique
          ? [(analyse as { strategieTherapeutique?: string }).strategieTherapeutique!]
          : []),
        ...(analyse.strategie ? [analyse.strategie] : []),
      ];

      const { familles, syndromes, organes } = normaliserTextes(textesDiag);
      const { strategies } = normaliserTextes(textesStrategie);

      const points = analyse.pointsUtilises.map((p) => normalizePoint(p.code).code);
      const techniques = analyse.pointsUtilises.flatMap((p) =>
        normaliserTechnique(p.technique as string),
      );

      obs.push({
        caseId: cas.id,
        grille: analyse.grillePrincipale,
        foyer: (analyse.localisationFoyer as string | undefined) ?? null,
        points,
        techniques,
        familles,
        syndromes,
        organes,
        strategies,
        niveauComplexite: cas.niveauComplexite,
        sexe: cas.sexe ?? 'non_precise',
      });
    }
  }

  return obs;
}

// ─── Index des concepts disponibles ──────────────────────────────────────────

export function buildConceptIndex(obs: Observation[]): ConceptIndex {
  const toOptions = (ids: string[], labelize = true): ConceptOption[] =>
    countFreq(ids).map(({ id, count }) => ({
      id,
      label: labelize ? (labelConceptIeatc(id) || id) : id,
      count,
    }));

  const syndromes = toOptions(obs.flatMap((o) => o.syndromes));
  const organes = toOptions(obs.flatMap((o) => o.organes));
  const familles = toOptions(obs.flatMap((o) => o.familles));
  const strategies = toOptions(obs.flatMap((o) => o.strategies));
  const points = toOptions(obs.flatMap((o) => o.points), false);
  const grilles = toOptions(obs.map((o) => o.grille), false);

  // Carte complète id → label pour résolution côté client
  const labelMap: Record<string, string> = {};
  for (const list of [syndromes, organes, familles, strategies]) {
    for (const { id, label } of list) {
      labelMap[id] = label;
    }
  }

  return { syndromes, organes, familles, strategies, points, grilles, labelMap };
}

// Note : computeCrossStats est défini directement dans CrossStatsExplorer.tsx
// (composant client) pour éviter de bundler CLINICAL_CASES côté navigateur.

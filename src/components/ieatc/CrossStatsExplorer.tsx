'use client';

// ─── Explorateur de corrélations IEATC ───────────────────────────────────────
// Permet de sélectionner un syndrome, organe, famille, stratégie ou point,
// et d'afficher les corrélations dans le corpus (points, techniques, grilles…)

import { useState, useMemo } from 'react';
// import type only — pas d'import runtime depuis observations.ts (évite de bundler CLINICAL_CASES côté client)
import type {
  Observation,
  ConceptIndex,
  CrossDimension,
  CrossStatResult,
} from '@/data/observations';
import { cn } from '@/lib/utils';
import { Search, Crosshair } from 'lucide-react';

// ─── Calcul cross-stats (pur, sans dépendances lourdes) ──────────────────────

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

function computeCrossStats(
  obs: Observation[],
  dimension: CrossDimension,
  value: string,
): CrossStatResult {
  const filtered = obs.filter((o) => {
    if (dimension === 'grilles') return o.grille === value;
    return (o[dimension] as string[]).includes(value);
  });
  const excl = (d: CrossDimension) => (d === dimension ? value : undefined);

  return {
    matchCount: filtered.length,
    topPoints: countFreq(filtered.flatMap((o) => o.points), excl('points')).slice(0, 10),
    topTechniques: countFreq(filtered.flatMap((o) => o.techniques)).slice(0, 8),
    topGrilles: countFreq(filtered.map((o) => o.grille), excl('grilles')).slice(0, 6),
    topSyndromes: countFreq(filtered.flatMap((o) => o.syndromes), excl('syndromes')).slice(0, 10),
    topOrganes: countFreq(filtered.flatMap((o) => o.organes), excl('organes')).slice(0, 8),
    topStrategies: countFreq(filtered.flatMap((o) => o.strategies), excl('strategies')).slice(0, 8),
    topFamilles: countFreq(filtered.flatMap((o) => o.familles), excl('familles')).slice(0, 6),
  };
}

// ─── Labels fixes ─────────────────────────────────────────────────────────────

const DIMENSION_LABELS: Record<CrossDimension, string> = {
  syndromes: 'Syndromes',
  organes: 'Organes',
  familles: 'Familles',
  strategies: 'Stratégies',
  points: 'Points',
  grilles: 'Grilles',
};

const TECHNIQUE_LABELS: Record<string, string> = {
  tonification: 'Tonification',
  tonification_chauffee: 'Tonification chauffée',
  moxa_tonification: 'Tonification chauffée (moxa)',
  dispersion: 'Dispersion',
  dispersion_chauffee: 'Dispersion chauffée',
  dispersion_puis_tonification: 'Dispersion → Tonification',
  harmonisation: 'Harmonisation',
  gros_sel: 'Gros sel (8JM)',
};

const TECHNIQUE_COLORS: Record<string, string> = {
  tonification: 'bg-emerald-500',
  tonification_chauffee: 'bg-lime-500',
  moxa_tonification: 'bg-orange-400',
  dispersion: 'bg-blue-500',
  dispersion_chauffee: 'bg-cyan-500',
  dispersion_puis_tonification: 'bg-indigo-500',
  harmonisation: 'bg-violet-500',
  gros_sel: 'bg-amber-400',
};

const GRILLE_LABELS: Record<string, string> = {
  yin_yang: 'Yin / Yang',
  cinq_elements: 'Cinq Éléments',
  six_energies: 'Six Énergies',
  huit_principes: 'Huit Principes',
  merveilleux_vaisseaux: 'Merveilleux Vaisseaux',
  meridiens_tendino: 'Méridiens Tendino-Musculaires',
};

// ─── Barre de stat ────────────────────────────────────────────────────────────

function MiniBar({ label, value, max, color = 'bg-teal-500' }: {
  label: string; value: number; max: number; color?: string;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-700 truncate pr-2">{label}</span>
        <span className="text-[10px] text-slate-400 shrink-0">{value}</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ─── Panneau de résultats ────────────────────────────────────────────────────

function ResultsPanel({
  result,
  selectedLabel,
  labelMap,
}: {
  result: CrossStatResult;
  selectedLabel: string;
  labelMap: Record<string, string>;
}) {
  const label = (id: string) => labelMap[id] || id;

  const maxPoint = result.topPoints[0]?.count ?? 1;
  const maxTech = result.topTechniques[0]?.count ?? 1;
  const maxGrille = result.topGrilles[0]?.count ?? 1;
  const maxSyndrome = result.topSyndromes[0]?.count ?? 1;
  const maxOrgane = result.topOrganes[0]?.count ?? 1;
  const maxStrategie = result.topStrategies[0]?.count ?? 1;

  if (result.matchCount === 0) {
    return (
      <div className="text-center py-12 text-slate-400 text-sm">
        Aucune analyse ne correspond à « {selectedLabel} ».
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Compteur */}
      <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
        <Crosshair size={15} className="text-teal-600 shrink-0" />
        <span className="text-sm font-semibold text-slate-800">
          {result.matchCount} analyse{result.matchCount > 1 ? 's' : ''} avec «&nbsp;{selectedLabel}&nbsp;»
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Points */}
        {result.topPoints.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Points les plus utilisés
            </p>
            <div className="space-y-2.5">
              {result.topPoints.map(({ id, count }) => (
                <MiniBar key={id} label={id} value={count} max={maxPoint} color="bg-teal-500" />
              ))}
            </div>
          </div>
        )}

        {/* Techniques */}
        {result.topTechniques.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Techniques associées
            </p>
            <div className="space-y-2.5">
              {result.topTechniques.map(({ id, count }) => (
                <MiniBar
                  key={id}
                  label={TECHNIQUE_LABELS[id] ?? id}
                  value={count}
                  max={maxTech}
                  color={TECHNIQUE_COLORS[id] ?? 'bg-slate-400'}
                />
              ))}
            </div>
          </div>
        )}

        {/* Syndromes associés */}
        {result.topSyndromes.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Syndromes associés
            </p>
            <div className="space-y-2.5">
              {result.topSyndromes.map(({ id, count }) => (
                <MiniBar key={id} label={label(id)} value={count} max={maxSyndrome} color="bg-violet-400" />
              ))}
            </div>
          </div>
        )}

        {/* Organes */}
        {result.topOrganes.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Organes impliqués
            </p>
            <div className="space-y-2.5">
              {result.topOrganes.map(({ id, count }) => (
                <MiniBar key={id} label={label(id)} value={count} max={maxOrgane} color="bg-indigo-400" />
              ))}
            </div>
          </div>
        )}

        {/* Stratégies */}
        {result.topStrategies.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Stratégies thérapeutiques
            </p>
            <div className="space-y-2.5">
              {result.topStrategies.map(({ id, count }) => (
                <MiniBar key={id} label={label(id)} value={count} max={maxStrategie} color="bg-amber-400" />
              ))}
            </div>
          </div>
        )}

        {/* Grilles */}
        {result.topGrilles.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Grilles utilisées
            </p>
            <div className="space-y-2.5">
              {result.topGrilles.map(({ id, count }) => (
                <MiniBar
                  key={id}
                  label={GRILLE_LABELS[id] ?? id}
                  value={count}
                  max={maxGrille}
                  color="bg-teal-400"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

interface CrossStatsExplorerProps {
  observations: Observation[];
  conceptIndex: ConceptIndex;
}

export function CrossStatsExplorer({ observations, conceptIndex }: CrossStatsExplorerProps) {
  const [dimension, setDimension] = useState<CrossDimension>('syndromes');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  const options = conceptIndex[dimension];

  const filtered = useMemo(() => {
    if (!search) return options;
    const q = search.toLowerCase();
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.id.toLowerCase().includes(q),
    );
  }, [options, search]);

  const result = useMemo(() => {
    if (!selected) return null;
    return computeCrossStats(observations, dimension, selected);
  }, [observations, dimension, selected]);

  const selectedLabel = selected
    ? (options.find((o) => o.id === selected)?.label ?? selected)
    : '';

  const handleDimensionChange = (d: CrossDimension) => {
    setDimension(d);
    setSelected(null);
    setSearch('');
  };

  const dimensions: CrossDimension[] = ['syndromes', 'organes', 'familles', 'strategies', 'points', 'grilles'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">
      {/* ── Panneau gauche : sélecteur ───────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Onglets de dimension */}
        <div className="grid grid-cols-3 border-b border-slate-100">
          {dimensions.map((d) => (
            <button
              key={d}
              onClick={() => handleDimensionChange(d)}
              className={cn(
                'px-2 py-2.5 text-xs font-medium transition-colors border-b-2',
                dimension === d
                  ? 'border-teal-600 text-teal-700 bg-teal-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50',
              )}
            >
              {DIMENSION_LABELS[d]}
            </button>
          ))}
        </div>

        {/* Recherche */}
        <div className="p-3 border-b border-slate-100">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Rechercher un ${DIMENSION_LABELS[dimension].toLowerCase().slice(0, -1)}…`}
              className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Liste des concepts */}
        <div className="max-h-[420px] overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Aucun résultat.</p>
          ) : (
            <ul>
              {filtered.map((opt) => (
                <li key={opt.id}>
                  <button
                    onClick={() => setSelected(opt.id === selected ? null : opt.id)}
                    className={cn(
                      'w-full text-left px-4 py-3 flex items-center justify-between gap-2 transition-colors border-b border-slate-50 hover:bg-slate-50',
                      selected === opt.id ? 'bg-teal-50 border-teal-100' : '',
                    )}
                  >
                    <span className={cn(
                      'text-sm truncate',
                      selected === opt.id ? 'font-semibold text-teal-800' : 'text-slate-700',
                    )}>
                      {opt.label}
                    </span>
                    <span className="text-xs text-slate-400 shrink-0 font-mono">{opt.count}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ── Panneau droit : résultats ────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 min-h-[300px]">
        {!selected ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400">
            <Crosshair size={32} className="mb-3 text-slate-200" />
            <p className="text-sm">Sélectionnez un {DIMENSION_LABELS[dimension].toLowerCase().slice(0, -1)} pour voir ses corrélations.</p>
          </div>
        ) : result ? (
          <ResultsPanel
            result={result}
            selectedLabel={selectedLabel}
            labelMap={conceptIndex.labelMap}
          />
        ) : null}
      </div>
    </div>
  );
}

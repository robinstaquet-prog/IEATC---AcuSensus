import { computeGlobalStats } from '@/data';
import { getGrille } from '@/data/grilles';
import { GridBadge } from '@/components/ieatc/GridBadge';
import { COMPLEXITE_LABELS } from '@/lib/constants';
import Link from 'next/link';
import { BarChart3, BookOpen, Star, GitBranch, Crosshair, ArrowRight, Layers } from 'lucide-react';

// ─── Labels métier ────────────────────────────────────────────────────────────

const FOYER_LABELS: Record<string, string> = {
  superieur: 'Foyer Supérieur (poumons, cœur)',
  moyen: 'Foyer Moyen (digestif)',
  inferieur: 'Foyer Inférieur (reins, utérus)',
  multiple: 'Foyers multiples',
};

const FOYER_COLORS: Record<string, string> = {
  superieur: 'bg-sky-500',
  moyen: 'bg-amber-500',
  inferieur: 'bg-indigo-500',
  multiple: 'bg-violet-500',
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

const COMPLEXITE_BAR_COLORS: Record<number, string> = {
  1: 'bg-emerald-500',
  2: 'bg-amber-500',
  3: 'bg-orange-500',
};

// ─── Barre de stat générique ──────────────────────────────────────────────────

function StatBar({
  label,
  value,
  max,
  color = 'bg-teal-500',
}: {
  label: string;
  value: number;
  max: number;
  color?: string;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-slate-800 truncate pr-2">{label}</span>
        <span className="text-xs text-slate-500 shrink-0">{value}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function StatistiquesPage() {
  const stats = await computeGlobalStats();

  const maxPointCount = stats.topPoints[0]?.count ?? 1;
  const maxGrilleCount = stats.topGrilles[0]?.count ?? 1;
  const maxFoyerCount = stats.topFoyers[0]?.count ?? 1;
  const maxTechniqueCount = stats.topTechniques[0]?.count ?? 1;
  const maxFamilleCount = stats.topFamillesDiag[0]?.count ?? 1;
  const maxSyndromeCount = stats.topSyndromes[0]?.count ?? 1;
  const maxOrganeCount = stats.topOrganes[0]?.count ?? 1;
  const maxStrategieCount = stats.topStrategies[0]?.count ?? 1;
  const maxPathologieCount = stats.topPathologies[0]?.count ?? 1;
  const totalSexe = Object.values(stats.repartitionSexe).reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 size={22} className="text-teal-600" />
          <h1 className="text-2xl font-bold text-slate-900">Statistiques</h1>
        </div>
        <p className="text-slate-500 text-sm">
          Vue d'ensemble du corpus IEATC — points, grilles de lecture, foyers et techniques.
          Ces données reflètent les analyses du corpus éditorial.
        </p>
      </div>

      {/* Lien explorateur */}
      <Link
        href="/statistiques/explorer"
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors text-sm font-medium mb-8"
      >
        <Layers size={15} />
        Explorer les corrélations — syndrome ↔ points ↔ techniques
        <ArrowRight size={14} className="ml-1" />
      </Link>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Cas publiés', value: stats.casPublies, icon: BookOpen, bg: 'bg-teal-50', color: 'text-teal-600' },
          { label: "Cas d'apprentissage", value: stats.casExemplaires, icon: Star, bg: 'bg-amber-50', color: 'text-amber-600' },
          { label: 'Analyses dans le corpus', value: stats.totalAnalyses, icon: GitBranch, bg: 'bg-indigo-50', color: 'text-indigo-600' },
          { label: 'Points distincts référencés', value: stats.pointsDistincts, icon: Crosshair, bg: 'bg-emerald-50', color: 'text-emerald-600' },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon size={20} className={color} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-sm text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Points les plus utilisés */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-bold text-slate-900 mb-1">Points les plus utilisés</h2>
          <p className="text-sm text-slate-500 mb-5">
            Fréquence d'apparition dans les traitements proposés
          </p>
          <div className="space-y-4">
            {stats.topPoints.map(({ id, count }) => (
              <StatBar key={id} label={id} value={count} max={maxPointCount} />
            ))}
          </div>
        </div>

        {/* Grilles de lecture */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-bold text-slate-900 mb-1">Grilles de lecture</h2>
          <p className="text-sm text-slate-500 mb-5">
            Distribution par grille principale utilisée dans les analyses
          </p>
          <div className="space-y-4">
            {stats.topGrilles.map(({ id, count }) => {
              const grille = getGrille(id as Parameters<typeof getGrille>[0]);
              return (
                <div key={id}>
                  <div className="flex items-center gap-3 mb-1.5">
                    {grille ? (
                      <GridBadge grilleId={grille.id} size="sm" />
                    ) : (
                      <span className="text-sm font-medium text-slate-700">{id}</span>
                    )}
                    <span className="text-xs text-slate-400 ml-auto">
                      {count} analyse{count > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-500 rounded-full"
                      style={{ width: `${(count / maxGrilleCount) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Localisation des foyers */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-bold text-slate-900 mb-1">Localisation des foyers</h2>
          <p className="text-sm text-slate-500 mb-5">
            Foyer principalement impliqué dans chaque analyse — renseigné par le praticien
          </p>
          <div className="space-y-4">
            {stats.topFoyers.map(({ id, count }) => (
              <StatBar
                key={id}
                label={FOYER_LABELS[id] ?? id}
                value={count}
                max={maxFoyerCount}
                color={FOYER_COLORS[id] ?? 'bg-slate-400'}
              />
            ))}
            {stats.topFoyers.length === 0 && (
              <p className="text-sm text-slate-400 italic">Aucune donnée disponible.</p>
            )}
          </div>
        </div>

        {/* Techniques de traitement */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-bold text-slate-900 mb-1">Techniques de traitement</h2>
          <p className="text-sm text-slate-500 mb-5">
            Distribution des techniques sur l'ensemble des points proposés dans les analyses
          </p>
          <div className="space-y-4">
            {stats.topTechniques.map(({ id, count }) => (
              <StatBar
                key={id}
                label={TECHNIQUE_LABELS[id] ?? id}
                value={count}
                max={maxTechniqueCount}
                color={TECHNIQUE_COLORS[id] ?? 'bg-slate-400'}
              />
            ))}
            {stats.topTechniques.length === 0 && (
              <p className="text-sm text-slate-400 italic">Aucune donnée disponible.</p>
            )}
          </div>
        </div>

        {/* Familles diagnostiques — couche 1 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-bold text-slate-900 mb-1">Familles diagnostiques</h2>
          <p className="text-sm text-slate-500 mb-5">
            Grandes familles pathologiques Yin/Yang — Vide, Plénitude, Stagnation, Facteurs
          </p>
          <div className="space-y-4">
            {stats.topFamillesDiag.map(({ id, count, label }) => (
              <StatBar key={id} label={label ?? id} value={count} max={maxFamilleCount} color="bg-teal-500" />
            ))}
            {stats.topFamillesDiag.length === 0 && (
              <p className="text-sm text-slate-400 italic">Aucune donnée disponible.</p>
            )}
          </div>
        </div>

        {/* Syndromes spécifiques — couche 2 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-bold text-slate-900 mb-1">Syndromes identifiés</h2>
          <p className="text-sm text-slate-500 mb-5">
            Syndromes IEATC nommés reconnus dans les bilans et catégories diagnostiques
          </p>
          <div className="space-y-4">
            {stats.topSyndromes.map(({ id, count, label }) => (
              <StatBar key={id} label={label ?? id} value={count} max={maxSyndromeCount} color="bg-violet-500" />
            ))}
            {stats.topSyndromes.length === 0 && (
              <p className="text-sm text-slate-400 italic">Aucune donnée disponible.</p>
            )}
          </div>
        </div>

        {/* Organes et localisations — couche 3 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-bold text-slate-900 mb-1">Organes et localisations</h2>
          <p className="text-sm text-slate-500 mb-5">
            Organes Tsang/Fu, Foyers et Merveilleux Vaisseaux impliqués
          </p>
          <div className="space-y-4">
            {stats.topOrganes.map(({ id, count, label }) => (
              <StatBar key={id} label={label ?? id} value={count} max={maxOrganeCount} color="bg-indigo-500" />
            ))}
            {stats.topOrganes.length === 0 && (
              <p className="text-sm text-slate-400 italic">Aucune donnée disponible.</p>
            )}
          </div>
        </div>

        {/* Stratégies thérapeutiques — couche 4 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-bold text-slate-900 mb-1">Stratégies thérapeutiques</h2>
          <p className="text-sm text-slate-500 mb-5">
            Axes de traitement reconnus dans les stratégies des analyses
          </p>
          <div className="space-y-4">
            {stats.topStrategies.map(({ id, count, label }) => (
              <StatBar key={id} label={label ?? id} value={count} max={maxStrategieCount} color="bg-amber-500" />
            ))}
            {stats.topStrategies.length === 0 && (
              <p className="text-sm text-slate-400 italic">Aucune donnée disponible.</p>
            )}
          </div>
        </div>

        {/* Motifs de consultation — couche 5 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:col-span-2">
          <h2 className="font-bold text-slate-900 mb-1">Motifs de consultation</h2>
          <p className="text-sm text-slate-500 mb-5">
            Pathologies et plaintes cliniques normalisées — extraites des motifs de consultation des cas publiés
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-4">
            {stats.topPathologies.map(({ id, count, label }) => (
              <StatBar key={id} label={label ?? id} value={count} max={maxPathologieCount} color="bg-rose-500" />
            ))}
            {stats.topPathologies.length === 0 && (
              <p className="text-sm text-slate-400 italic">Aucune donnée disponible.</p>
            )}
          </div>
        </div>

        {/* Répartition démographique */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-bold text-slate-900 mb-5">Répartition des cas</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Sexe du patient
              </p>
              <div className="space-y-3">
                {[
                  { key: 'feminin', label: 'Femmes', color: 'bg-pink-400' },
                  { key: 'masculin', label: 'Hommes', color: 'bg-blue-400' },
                  { key: 'non_precise', label: 'Non précisé', color: 'bg-slate-300' },
                ].map(({ key, label, color }) => {
                  const count = stats.repartitionSexe[key] ?? 0;
                  if (count === 0) return null;
                  const pct = totalSexe > 0 ? Math.round((count / totalSexe) * 100) : 0;
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-700">{label}</span>
                        <span className="text-slate-500">{count} ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Niveau de complexité
              </p>
              <div className="space-y-2">
                {([1, 2, 3] as const).map((level) => {
                  const count = stats.repartitionComplexite[level] ?? 0;
                  if (count === 0) return null;
                  const pct =
                    stats.casPublies > 0 ? Math.round((count / stats.casPublies) * 100) : 0;
                  return (
                    <div key={level} className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 w-24 shrink-0">
                        {COMPLEXITE_LABELS[level]}
                      </span>
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${COMPLEXITE_BAR_COLORS[level]}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400 w-4 shrink-0">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Chaînes causales */}
        {stats.topChaines && stats.topChaines.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:col-span-2">
            <h2 className="font-bold text-slate-900 mb-1">Chaînes causales</h2>
            <p className="text-sm text-slate-500 mb-5">
              Relations Effet → Cause les plus fréquentes dans les bilans énergétiques
            </p>
            <div className="space-y-2">
              {stats.topChaines.map((c, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-slate-100 px-4 py-2.5 hover:border-slate-200 transition-colors">
                  <span className="text-xs text-slate-400 w-5 shrink-0 font-mono">{i + 1}</span>
                  <span className="text-sm font-medium text-slate-800 flex-1 min-w-0">{c.effet}</span>
                  <ArrowRight size={13} className="text-slate-300 shrink-0" />
                  <span className="text-xs text-slate-500 italic shrink-0">{c.marqueur}</span>
                  <ArrowRight size={13} className="text-slate-300 shrink-0" />
                  <span className="text-sm font-medium text-violet-700 flex-1 min-w-0 text-right">{c.cause}</span>
                  <span className="text-xs font-semibold text-slate-400 w-6 text-right shrink-0">{c.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Roadmap statistiques communautaires */}
        <div className="bg-teal-50 rounded-xl border border-teal-200 p-6 lg:col-span-2">
          <h3 className="font-semibold text-teal-900 mb-1">Statistiques communautaires — À venir</h3>
          <p className="text-xs text-teal-700 mb-4">
            Ces statistiques s'enrichiront automatiquement avec les participations de la communauté.
          </p>
          <ul className="grid sm:grid-cols-2 gap-2 text-sm text-teal-800">
            {[
              'Distribution des grilles choisies par les participants',
              'Techniques les plus proposées par les étudiants',
              "Divergences de raisonnement entre analyses d'un même cas",
              'Difficulté perçue par la communauté vs. niveau officiel',
              'Associations récurrentes motif clinique ↔ points utilisés',
              'Évolution des pratiques dans le temps',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

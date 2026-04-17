import { computeGlobalStats } from '@/data';
import { getGrille } from '@/data/grilles';
import { GridBadge } from '@/components/ieatc/GridBadge';
import { COMPLEXITE_LABELS, COMPLEXITE_COLORS } from '@/lib/constants';
import { BarChart3, BookOpen, Star, GitBranch, TrendingUp } from 'lucide-react';

// ─── Barre de stat ─────────────────────────────────────────────────────────────

function StatBar({ label, value, max, sublabel }: {
  label: string;
  value: number;
  max: number;
  sublabel?: string;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-slate-800 truncate">{label}</span>
        <span className="text-xs text-slate-500 shrink-0 ml-2">{value}</span>
      </div>
      {sublabel && <p className="text-xs text-slate-400 mb-1">{sublabel}</p>}
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-teal-500 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StatistiquesPage() {
  const stats = computeGlobalStats();

  const maxPointCount = stats.topPoints[0]?.count ?? 1;
  const maxGrilleCount = stats.topGrilles[0]?.count ?? 1;
  const maxPolariteCount = stats.topPolarites[0]?.count ?? 1;
  const totalSexe = Object.values(stats.repartitionSexe).reduce((a, b) => a + b, 0);

  const POLARITE_LABELS: Record<string, string> = {
    yin: 'Yin',
    yang: 'Yang',
    mixte: 'Yin/Yang mixte',
  };

  const POLARITE_COLORS: Record<string, string> = {
    yin: 'bg-blue-500',
    yang: 'bg-red-500',
    mixte: 'bg-violet-500',
  };

  const COMPLEXITE_BAR_COLORS: Record<number, string> = {
    1: 'bg-emerald-500',
    2: 'bg-amber-500',
    3: 'bg-orange-500',
    4: 'bg-red-500',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 size={22} className="text-teal-600" />
          <h1 className="text-2xl font-bold text-slate-900">Statistiques</h1>
        </div>
        <p className="text-slate-500 text-sm">
          Vue globale sur la base de cas IEATC — points mobilisés, grilles de lecture, polarités.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Cas publiés', value: stats.casPublies, icon: BookOpen, bg: 'bg-teal-50', color: 'text-teal-600' },
          { label: "Cas d'apprentissage", value: stats.casExemplaires, icon: Star, bg: 'bg-amber-50', color: 'text-amber-600' },
          { label: 'Lectures / Analyses', value: stats.totalAnalyses, icon: GitBranch, bg: 'bg-indigo-50', color: 'text-indigo-600' },
          { label: 'Total base', value: stats.totalCas, icon: TrendingUp, bg: 'bg-emerald-50', color: 'text-emerald-600' },
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
          <p className="text-sm text-slate-500 mb-5">Fréquence d'apparition dans les analyses</p>
          <div className="space-y-4">
            {stats.topPoints.map(({ id, count }) => (
              <StatBar key={id} label={id} value={count} max={maxPointCount} />
            ))}
          </div>
        </div>

        {/* Grilles de lecture */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-bold text-slate-900 mb-1">Grilles de lecture</h2>
          <p className="text-sm text-slate-500 mb-5">Distribution par grille principale d'analyse</p>
          <div className="space-y-4">
            {stats.topGrilles.map(({ id, count }) => {
              const grille = getGrille(id as Parameters<typeof getGrille>[0]);
              return (
                <div key={id}>
                  <div className="flex items-center gap-3 mb-2">
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

        {/* Polarités */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-bold text-slate-900 mb-1">Polarités Yin / Yang</h2>
          <p className="text-sm text-slate-500 mb-5">
            Répartition des diagnostics par polarité générale
          </p>
          <div className="space-y-4">
            {stats.topPolarites.map(({ id, count }) => (
              <div key={id}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">
                    {POLARITE_LABELS[id] ?? id}
                  </span>
                  <span className="text-xs text-slate-400">{count}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${POLARITE_COLORS[id] ?? 'bg-slate-400'}`}
                    style={{ width: `${(count / maxPolariteCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Répartition démographique */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-bold text-slate-900 mb-5">Répartition des cas</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Sexe
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
                Complexité
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

        {/* Roadmap */}
        <div className="bg-teal-50 rounded-xl border border-teal-200 p-6 lg:col-span-2">
          <h3 className="font-semibold text-teal-900 mb-3">Statistiques avancées — Roadmap</h3>
          <ul className="grid sm:grid-cols-2 gap-2 text-sm text-teal-800">
            {[
              'Associations récurrentes motif clinique ↔ points utilisés',
              'Divergences entre analyses pour un même cas',
              'Similitudes structurelles inter-cas (clustering)',
              'Évolution des diagnostics dans le temps',
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

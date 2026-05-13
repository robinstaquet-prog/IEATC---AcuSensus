// ─── Explorateur de corrélations IEATC ───────────────────────────────────────
// Page serveur : construit les observations et l'index, puis délègue l'UI
// au composant client CrossStatsExplorer.

import Link from 'next/link';
import { buildObservationsWithDb, buildConceptIndex } from '@/data/observations';
import { CrossStatsExplorer } from '@/components/ieatc/CrossStatsExplorer';
import { BarChart3, ArrowLeft, Layers } from 'lucide-react';

export const revalidate = 60;

export default async function ExplorerPage() {
  const observations = await buildObservationsWithDb();
  const conceptIndex = buildConceptIndex(observations);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-2">
        <Link
          href="/statistiques"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-teal-600 mb-5 transition-colors"
        >
          <ArrowLeft size={14} />
          Statistiques générales
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <Layers size={22} className="text-teal-600" />
          <h1 className="text-2xl font-bold text-slate-900">Explorateur de corrélations</h1>
        </div>
        <p className="text-slate-500 text-sm">
          Sélectionnez un syndrome, organe, famille diagnostique, stratégie ou point pour voir
          les corrélations dans le corpus — quels points apparaissent, quelles techniques,
          quels autres syndromes sont associés.
        </p>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
        {[
          { label: 'Analyses indexées', value: observations.length, color: 'text-teal-600' },
          { label: 'Syndromes distincts', value: conceptIndex.syndromes.length, color: 'text-violet-600' },
          { label: 'Organes distincts', value: conceptIndex.organes.length, color: 'text-indigo-600' },
          { label: 'Points distincts', value: conceptIndex.points.length, color: 'text-emerald-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-3 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Explorer */}
      <CrossStatsExplorer observations={observations} conceptIndex={conceptIndex} />

      {/* Lien vers stats globales */}
      <div className="mt-8 text-center">
        <Link
          href="/statistiques"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-teal-600 transition-colors"
        >
          <BarChart3 size={14} />
          Voir les statistiques globales
        </Link>
      </div>
    </div>
  );
}

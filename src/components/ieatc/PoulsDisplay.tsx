import type { PrisePouls, LecturePouls, QualitePouls } from '@/types';
import { cn } from '@/lib/utils';

// ─── Labels des qualités de pouls ─────────────────────────────────────────────

const QUALITE_CONFIG: Record<QualitePouls, { label: string; color: string }> = {
  vide: { label: 'Vide', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  plein: { label: 'Plein', color: 'bg-red-100 text-red-800 border-red-200' },
  faible: { label: 'Faible', color: 'bg-blue-50 text-blue-700 border-blue-100' },
  vide_plus: { label: 'Vide+', color: 'bg-blue-200 text-blue-900 border-blue-300' },
  plein_plus: { label: 'Plein+', color: 'bg-red-200 text-red-900 border-red-300' },
  large: { label: 'Large', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  etroit: { label: 'Étroit', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  mou: { label: 'Mou', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  dur: { label: 'Dur', color: 'bg-red-200 text-red-900 border-red-300' },
  corde_arc: { label: 'Corde-arc', color: 'bg-rose-100 text-rose-800 border-rose-200' },
  rapide: { label: 'Rapide', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  lent: { label: 'Lent', color: 'bg-teal-100 text-teal-800 border-teal-200' },
  superficiel: { label: 'Superficiel', color: 'bg-sky-100 text-sky-800 border-sky-200' },
  profond: { label: 'Profond', color: 'bg-violet-100 text-violet-800 border-violet-200' },
  normal: { label: 'Normal', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  absent: { label: 'Absent', color: 'bg-slate-200 text-slate-500 border-slate-300' },
};

// ─── Labels des positions ─────────────────────────────────────────────────────

const POSITION_LABELS: Record<string, { label: string; side?: string }> = {
  foyer_superieur_gauche: { label: 'FI gauche — Cœur (9C)', side: 'Gauche' },
  foyer_moyen_gauche: { label: 'F. Moyen gauche', side: 'Gauche' },
  foyer_inferieur_gauche: { label: 'F. Inférieur gauche — Rein', side: 'Gauche' },
  foyer_superieur_droit: { label: 'F. Supérieur droit — Poumon (9P)', side: 'Droit' },
  foyer_moyen_droit: { label: 'F. Moyen droit', side: 'Droit' },
  foyer_inferieur_droit: { label: 'F. Inférieur droit — Rein', side: 'Droit' },
  global_superficiel: { label: 'Superficiel global (Yang)' },
  global_profond: { label: 'Profond global (Yin)' },
  specifique: { label: '' },
};

function QualiteBadge({ qualite }: { qualite: QualitePouls }) {
  const config = QUALITE_CONFIG[qualite];
  return (
    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full border', config.color)}>
      {config.label}
    </span>
  );
}

function LecturePoulsRow({ lecture }: { lecture: LecturePouls }) {
  const posConfig = POSITION_LABELS[lecture.position] ?? { label: lecture.position };
  const positionLabel = lecture.position === 'specifique'
    ? (lecture.positionLabel ?? 'Position spécifique')
    : posConfig.label;

  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 py-3 border-b border-slate-100 last:border-0">
      <div className="sm:w-48 flex-shrink-0">
        <p className="text-sm font-medium text-slate-800">{positionLabel}</p>
        {posConfig.side && (
          <span className="text-xs text-slate-400">{posConfig.side}</span>
        )}
      </div>
      <div className="flex-1">
        {/* Qualités brutes uniquement — pas d'interprétation ici */}
        <div className="flex flex-wrap gap-1.5">
          {lecture.qualites.map((q) => (
            <QualiteBadge key={q} qualite={q} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

interface PoulsDisplayProps {
  prisePouls: PrisePouls;
}

export function PoulsDisplay({ prisePouls }: PoulsDisplayProps) {
  return (
    <div className="bg-slate-900 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 bg-slate-800 flex items-center gap-3">
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" style={{ animationDelay: '0.15s' }} />
          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" style={{ animationDelay: '0.3s' }} />
        </div>
        <h3 className="text-sm font-semibold text-slate-200">Prise de pouls</h3>
        <span className="ml-auto text-xs text-slate-400">{prisePouls.condition}</span>
      </div>

      {/* Lectures */}
      <div className="px-5 py-1 bg-white">
        {prisePouls.lectures.map((lecture, i) => (
          <LecturePoulsRow key={i} lecture={lecture} />
        ))}
      </div>

      {/* Pas de synthèse affichée — interprétation laissée au praticien */}
    </div>
  );
}

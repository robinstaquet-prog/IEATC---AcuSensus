import type { PointUsage, TechniquePoint } from '@/types';
import { cn } from '@/lib/utils';

// ─── Labels et couleurs par technique ────────────────────────────────────────

const TECHNIQUE_CONFIG: Record<TechniquePoint, { label: string; className: string }> = {
  tonification: { label: 'Ton.', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  dispersion: { label: 'Dis.', className: 'bg-red-100 text-red-800 border-red-200' },
  harmonisation: { label: 'Harmo.', className: 'bg-slate-100 text-slate-700 border-slate-300' },
  moxa_tonification: { label: 'Moxa Ton.', className: 'bg-orange-100 text-orange-800 border-orange-200' },
  tonification_chauffee: { label: 'Ton. ch.', className: 'bg-orange-200 text-orange-900 border-orange-300' },
  dispersion_chauffee: { label: 'Dis. ch.', className: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
  dispersion_puis_tonification: { label: 'Dis.→Ton.', className: 'bg-amber-100 text-amber-800 border-amber-300' },
  gros_sel: { label: 'Gros sel', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
};

// ─── Composant AcuPoint inline ────────────────────────────────────────────────
// Règle absolue : code + nom + technique TOUJOURS ensemble

interface AcuPointInlineProps {
  point: PointUsage;
  showJustification?: boolean;
  className?: string;
}

export function AcuPointInline({ point, showJustification = false, className }: AcuPointInlineProps) {
  const tech = TECHNIQUE_CONFIG[point.technique];

  return (
    <span className={cn('inline-flex items-center gap-1.5 group', className)}>
      <span className="font-mono font-bold text-slate-900 text-sm bg-slate-100 px-1.5 py-0.5 rounded">
        {point.code}
      </span>
      {point.nomIeatc && (
        <span className="text-slate-600 text-sm">{point.nomIeatc}</span>
      )}
      <span className={cn('text-xs font-medium px-1.5 py-0.5 rounded border', tech.className)}>
        {tech.label}
      </span>
      {showJustification && point.justification && (
        <span className="text-xs text-slate-400">— {point.justification}</span>
      )}
    </span>
  );
}

// ─── Composant AcuPoint carte ─────────────────────────────────────────────────
// Pour la liste des points dans une analyse

interface AcuPointCardProps {
  point: PointUsage;
  index?: number;
}

export function AcuPointCard({ point, index }: AcuPointCardProps) {
  const tech = TECHNIQUE_CONFIG[point.technique];

  return (
    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
      {index !== undefined && (
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-xs font-medium flex items-center justify-center mt-0.5">
          {index + 1}
        </span>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-mono font-bold text-slate-900 text-base">{point.code}</span>
          {point.nomIeatc && (
            <span className="text-slate-700 font-medium text-sm">{point.nomIeatc}</span>
          )}
          <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full border', tech.className)}>
            {tech.label}
          </span>
        </div>
        {point.justification && (
          <p className="text-sm text-slate-600 leading-relaxed">{point.justification}</p>
        )}
      </div>
    </div>
  );
}

// ─── Liste de points ──────────────────────────────────────────────────────────

interface AcuPointListProps {
  points: PointUsage[];
  compact?: boolean;
}

export function AcuPointList({ points, compact = false }: AcuPointListProps) {
  const sorted = [...points].sort((a, b) => (a.ordre ?? 99) - (b.ordre ?? 99));

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {sorted.map((p, i) => (
          <AcuPointInline key={i} point={p} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sorted.map((p, i) => (
        <AcuPointCard key={i} point={p} index={i} />
      ))}
    </div>
  );
}

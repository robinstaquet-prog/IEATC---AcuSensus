import { getGrille } from '@/data/grilles';
import type { ReadingGridId } from '@/types';
import { cn } from '@/lib/utils';

interface GridBadgeProps {
  grilleId: ReadingGridId;
  size?: 'sm' | 'md' | 'lg';
  withDot?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-sm px-3 py-1.5 font-semibold',
};

const dotSizes = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-2 h-2',
};

export function GridBadge({ grilleId, size = 'md', withDot = false, className }: GridBadgeProps) {
  const grille = getGrille(grilleId);
  if (!grille) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        grille.colorClass,
        grille.textClass,
        sizeClasses[size],
        className,
      )}
    >
      {withDot && (
        <span className={cn('rounded-full opacity-80', grille.dotClass, dotSizes[size])} />
      )}
      {grille.nomCourt}
    </span>
  );
}

// Version longue avec description — pour la fiche cas
export function GridBadgeFull({ grilleId }: { grilleId: ReadingGridId }) {
  const grille = getGrille(grilleId);
  if (!grille) return null;

  return (
    <div className={cn('inline-flex items-start gap-3 rounded-xl px-4 py-3 border', grille.colorClass, grille.borderClass)}>
      <div className={cn('mt-0.5 flex-shrink-0 w-3 h-3 rounded-full', grille.dotClass)} />
      <div>
        <p className={cn('font-semibold text-sm', grille.textClass)}>{grille.nom}</p>
        <p className={cn('text-xs mt-0.5 opacity-80', grille.textClass)}>{grille.description.slice(0, 90)}…</p>
      </div>
    </div>
  );
}

'use client';

import { useState, useMemo } from 'react';
import { LEXIQUE } from '@/data/lexique';
import { Input } from '@/components/ui/input';
import type { Term, CategorieTerm } from '@/types';
import { cn } from '@/lib/utils';
import {
  Search,
  Library,
  AlertTriangle,
  BookOpen,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// ─── Config des catégories ─────────────────────────────────────────────────────

const CATEGORIE_CONFIG: Record<CategorieTerm, { label: string; color: string }> = {
  energie: { label: 'Énergie', color: 'bg-teal-100 text-teal-800' },
  organe_tsang: { label: 'Organe Tsang', color: 'bg-indigo-100 text-indigo-800' },
  organe_fu: { label: 'Organe Fu', color: 'bg-violet-100 text-violet-800' },
  grille: { label: 'Grille de lecture', color: 'bg-slate-100 text-slate-700' },
  point_type: { label: 'Type de point', color: 'bg-emerald-100 text-emerald-800' },
  technique: { label: 'Technique', color: 'bg-amber-100 text-amber-700' },
  pathologie: { label: 'Pathologie', color: 'bg-red-100 text-red-800' },
  physiologie: { label: 'Physiologie', color: 'bg-sky-100 text-sky-800' },
  concept_fondamental: { label: 'Concept fondamental', color: 'bg-rose-100 text-rose-800' },
};

const IMPORTANCE_CONFIG = {
  fondamental: { label: 'Fondamental', dot: 'bg-red-500' },
  important: { label: 'Important', dot: 'bg-amber-500' },
  complementaire: { label: 'Complémentaire', dot: 'bg-slate-300' },
};

// ─── Carte de terme ───────────────────────────────────────────────────────────

function TermCard({ term }: { term: Term }) {
  const [expanded, setExpanded] = useState(false);
  const catConfig = CATEGORIE_CONFIG[term.categorie];
  const importanceConfig = IMPORTANCE_CONFIG[term.importance];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-5 py-4 flex items-start gap-3 hover:bg-slate-50/60 transition-colors"
      >
        <span
          className={cn('mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0', importanceConfig.dot)}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-bold text-slate-900">{term.terme}</h3>
            {term.correspondanceMtc && (
              <span className="text-xs text-slate-400 font-normal">({term.correspondanceMtc})</span>
            )}
            <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', catConfig.color)}>
              {catConfig.label}
            </span>
          </div>
          <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
            {term.definition}
          </p>
        </div>
        <span className="text-slate-400 mt-0.5 shrink-0 ml-2">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {/* Développé */}
      {expanded && (
        <div className="px-5 pb-5 pt-1 border-t border-slate-100 space-y-4">
          {/* Définition complète */}
          <p className="text-sm text-slate-700 leading-relaxed">{term.definition}</p>

          {/* Alerte homonymie */}
          {term.alerteHomonymie && (
            <div className="flex gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <AlertTriangle
                size={15}
                className="text-amber-600 shrink-0 mt-0.5"
              />
              <p className="text-xs text-amber-800 leading-relaxed">
                <span className="font-semibold">Attention homonymie : </span>
                {term.alerteHomonymie}
              </p>
            </div>
          )}

          {/* Synonymes */}
          {term.synonymes.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Synonymes / correspondances
              </p>
              <div className="flex flex-wrap gap-1.5">
                {term.synonymes.map((s) => (
                  <span
                    key={s}
                    className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Source IEATC */}
          {term.sourceIeatc && (
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <BookOpen size={11} />
              Source : {term.sourceIeatc}
            </p>
          )}

          {/* Voir aussi */}
          {term.voirAussi && term.voirAussi.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Voir aussi
              </p>
              <div className="flex flex-wrap gap-1.5">
                {term.voirAussi.map((id) => {
                  const other = LEXIQUE.find((t) => t.id === id);
                  return (
                    <span
                      key={id}
                      className="text-xs px-2.5 py-1 bg-teal-50 text-teal-700 rounded-full border border-teal-200"
                    >
                      {other?.terme ?? id}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const ALL_CATEGORIES = Object.keys(CATEGORIE_CONFIG) as CategorieTerm[];

export default function LexiquePage() {
  const [search, setSearch] = useState('');
  const [activeCategorie, setActiveCategorie] = useState<CategorieTerm | ''>('');

  const filtered = useMemo(() => {
    return LEXIQUE.filter((t) => {
      if (activeCategorie && t.categorie !== activeCategorie) return false;
      if (search) {
        const q = search.toLowerCase();
        const haystack = [t.terme, t.definition, ...t.synonymes, t.correspondanceMtc ?? '']
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [search, activeCategorie]);

  // Only show categories that have terms
  const usedCategories = ALL_CATEGORIES.filter((cat) =>
    LEXIQUE.some((t) => t.categorie === cat),
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Library size={22} className="text-teal-600" />
          <h1 className="text-2xl font-bold text-slate-900">Lexique IEATC</h1>
        </div>
        <p className="text-slate-500 text-sm">
          Terminologie propre à l'école IEATC — avec correspondances MTC classique et alertes
          d'homonymie.
        </p>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6 space-y-4">
        <Input
          icon={<Search size={16} />}
          placeholder="Rechercher un terme, une définition, un synonyme…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategorie('')}
            className={cn(
              'text-sm px-3 py-1.5 rounded-full border font-medium transition-colors',
              !activeCategorie
                ? 'bg-slate-900 text-white border-slate-900'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50',
            )}
          >
            Tous
          </button>
          {usedCategories.map((cat) => {
            const config = CATEGORIE_CONFIG[cat];
            return (
              <button
                key={cat}
                onClick={() => setActiveCategorie(cat === activeCategorie ? '' : cat)}
                className={cn(
                  'text-sm px-3 py-1.5 rounded-full border font-medium transition-colors',
                  activeCategorie === cat
                    ? cn(config.color, 'border-transparent')
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50',
                )}
              >
                {config.label}
              </button>
            );
          })}

          {(search || activeCategorie) && (
            <button
              onClick={() => { setSearch(''); setActiveCategorie(''); }}
              className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 px-2 py-1.5 transition-colors"
            >
              <X size={13} />
              Réinitialiser
            </button>
          )}

          <span className="ml-auto self-center text-sm text-slate-500">
            {filtered.length === LEXIQUE.length
              ? `${LEXIQUE.length} termes`
              : <><strong className="text-slate-700">{filtered.length}</strong> / {LEXIQUE.length} termes</>
            }
          </span>
        </div>
      </div>

      {/* Légende importance */}
      <div className="flex items-center gap-4 mb-5 text-xs text-slate-500">
        <span className="font-medium">Importance :</span>
        {Object.entries(IMPORTANCE_CONFIG).map(([key, cfg]) => (
          <span key={key} className="flex items-center gap-1.5">
            <span className={cn('w-2 h-2 rounded-full', cfg.dot)} />
            {cfg.label}
          </span>
        ))}
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-400 text-lg mb-2">Aucun terme ne correspond.</p>
          <button
            onClick={() => { setSearch(''); setActiveCategorie(''); }}
            className="text-sm text-teal-600 hover:text-teal-700"
          >
            Réinitialiser
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => (
            <TermCard key={t.id} term={t} />
          ))}
        </div>
      )}
    </div>
  );
}

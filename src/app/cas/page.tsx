'use client';

// ─── Page liste des cas cliniques ─────────────────────────────────────────────
// Filtres :
//   1. Tous les cas | Cas d'apprentissage (radio)
//   2. Niveau de complexité
//   3. Grille — visible uniquement en mode "Cas d'apprentissage"

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { getCasesPublies } from '@/data';
import { getUserCases } from '@/lib/user-cases-store';
import { GRILLES } from '@/data/grilles';
import { Input } from '@/components/ui/input';
import type { ClinicalCase, ReadingGridId } from '@/types';
import { cn } from '@/lib/utils';
import {
  Search,
  BookOpen,
  Eye,
  Star,
  X,
  FileText,
  GraduationCap,
} from 'lucide-react';

// ─── Utilitaires d'affichage ──────────────────────────────────────────────────

const COMPLEXITE_LABELS: Record<number, string> = { 1: '1ère année', 2: 'Intermédiaire', 3: '4ème année', 4: 'Avancé' };
const COMPLEXITE_COLORS: Record<number, string> = {
  1: 'bg-emerald-100 text-emerald-700',
  2: 'bg-amber-100 text-amber-700',
  3: 'bg-orange-100 text-orange-700',
  4: 'bg-red-100 text-red-700',
};

function CasCard({ cas, showApprentissage }: { cas: ClinicalCase; showApprentissage?: boolean }) {
  const complexiteColor = COMPLEXITE_COLORS[cas.niveauComplexite];
  const complexiteLabel = COMPLEXITE_LABELS[cas.niveauComplexite];
  const href = cas.id.startsWith('user-cas-') ? `/mes-cas/${cas.id}` : `/cas/${cas.id}`;

  return (
    <Link href={href} className="group block">
      <article className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 h-full flex flex-col">
        {/* Header */}
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              {cas.exemplaire && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                  <Star size={10} />
                  Apprentissage
                </span>
              )}
              {!cas.casComplet && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">
                  <FileText size={10} />
                  Partiel
                </span>
              )}
              <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', complexiteColor)}>
                {complexiteLabel}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400 shrink-0">
              <Eye size={12} />
              {cas.viewCount}
            </div>
          </div>
          <h3 className="font-semibold text-slate-900 leading-snug group-hover:text-teal-700 transition-colors">
            {cas.titre}
          </h3>
        </div>

        {/* Motif */}
        <div className="px-5 flex-1">
          <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
            {cas.content.motif}
          </p>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 mt-4 border-t border-slate-100 flex items-center justify-between">
          {/* Bouton apprentissage (discret) */}
          {showApprentissage && (
            <Link
              href={`/apprentissage/${cas.id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 font-medium px-2 py-1 rounded-lg hover:bg-amber-50 transition-colors"
              title="Ouvrir en mode apprentissage"
            >
              <GraduationCap size={13} />
              Apprentissage
            </Link>
          )}
          <div className="flex items-center gap-2 text-xs text-slate-400 ml-auto">
            {cas.age && <span>{cas.age} ans</span>}
            {cas.age && cas.sexe && <span>·</span>}
            {cas.sexe && <span>{cas.sexe === 'feminin' ? 'F' : cas.sexe === 'masculin' ? 'H' : '?'}</span>}
            {cas.analyses.length > 1 && (
              <>
                <span>·</span>
                <span>{cas.analyses.length} analyse{cas.analyses.length > 1 ? 's' : ''}</span>
              </>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

// ─── Filtres ──────────────────────────────────────────────────────────────────

type ModeFiltre = 'tous' | 'apprentissage';

interface Filters {
  search: string;
  mode: ModeFiltre;         // Filtre 1 : Tous / Apprentissage
  niveau: string;           // Filtre 2 : Niveau de complexité
  grille: ReadingGridId | ''; // Filtre 3 : Grille (visible seulement si mode = 'apprentissage')
}

const INITIAL_FILTERS: Filters = {
  search: '',
  mode: 'tous',
  niveau: '',
  grille: '',
};

function filterCas(cas: ClinicalCase[], f: Filters): ClinicalCase[] {
  return cas.filter((c) => {
    // Recherche textuelle
    if (f.search) {
      const q = f.search.toLowerCase();
      const haystack = [
        c.titre,
        c.content.motif,
        ...c.content.interrogatoire.map((i) => i.valeur),
        c.content.prisePouls.synthese ?? '',
        ...c.tags,
        ...c.analyses.flatMap((a) => [
          a.raisonnement,
          ...a.categoriesDiagnostiques,
          ...a.pointsUtilises.map((p) => p.code),
        ]),
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    // Filtre 1 : Apprentissage = cas marqués exemplaire ou avec analyse expert
    if (f.mode === 'apprentissage') {
      const isApprentissage =
        c.exemplaire ||
        c.analyses.some((a) => a.role === 'expert' || a.auteurStatut === 'expert');
      if (!isApprentissage) return false;
    }

    // Filtre 2 : Niveau (basé sur niveauComplexite du cas)
    if (f.niveau && c.niveauComplexite !== Number(f.niveau)) return false;

    // Filtre 3 : Grille — uniquement en mode apprentissage
    // IMPORTANT : ne montrer que les cas dont une analyse QUALIFIEE (expert ou valeur >= 50)
    // utilise cette grille, pas n'importe quelle analyse.
    if (f.mode === 'apprentissage' && f.grille) {
      const hasGrilleQualifiee = c.analyses.some((a) => {
        // L'analyse doit etre qualifiee pour l'apprentissage
        const isQualified =
          a.role === 'expert' ||
          a.auteurStatut === 'expert' ||
          (a.valeur ?? 0) >= 50;
        if (!isQualified) return false;
        // L'analyse qualifiee doit utiliser la grille selectionnee
        return (
          a.grillePrincipale === f.grille ||
          a.grillesSecondaires?.includes(f.grille as ReadingGridId)
        );
      });
      if (!hasGrilleQualifiee) return false;
    }

    return true;
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CasListPage() {
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
  const corpus = getCasesPublies();
  const [userCases, setUserCases] = useState<ClinicalCase[]>([]);

  useEffect(() => {
    getUserCases().then((cas) => {
      const publies = cas.filter((c) => c.statut === 'publie');
      const nouveaux = publies.filter((c) => !corpus.some((cc) => cc.id === c.id));
      setUserCases(nouveaux);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const cases = useMemo(() => [...corpus, ...userCases], [userCases]); // eslint-disable-line react-hooks/exhaustive-deps
  const filtered = useMemo(() => filterCas(cases, filters), [cases, filters]);

  const hasActive =
    filters.search ||
    filters.mode !== 'tous' ||
    filters.niveau ||
    filters.grille;

  const selectClass =
    'h-10 px-3 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer';

  const radioBase =
    'text-sm px-4 py-2 rounded-lg border font-medium transition-colors cursor-pointer';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen size={22} className="text-teal-600" />
          <h1 className="text-2xl font-bold text-slate-900">Cas cliniques</h1>
        </div>
        <p className="text-slate-500 text-sm">
          Base de cas structurés et commentés selon les grilles de lecture IEATC.
          Chaque cas peut faire l'objet de plusieurs analyses.
        </p>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-8 shadow-sm space-y-4">
        {/* Recherche */}
        <Input
          icon={<Search size={16} />}
          placeholder="Rechercher — symptôme, point, catégorie diagnostique, grille…"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />

        {/* Filtre 1 : Tous / Apprentissage */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFilters({ ...filters, mode: 'tous', grille: '' })}
            className={cn(
              radioBase,
              filters.mode === 'tous'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50',
            )}
          >
            Tous les cas
          </button>
          <button
            onClick={() => setFilters({ ...filters, mode: 'apprentissage' })}
            className={cn(
              radioBase,
              filters.mode === 'apprentissage'
                ? 'bg-amber-500 text-white border-amber-500'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50',
            )}
          >
            <Star size={12} className="inline mr-1" />
            Cas d'apprentissage
          </button>

          {/* Filtre 2 : Niveau */}
          <select
            value={filters.niveau}
            onChange={(e) => setFilters({ ...filters, niveau: e.target.value })}
            className={selectClass}
          >
            <option value="">Tout niveau</option>
            <option value="1">1ère année</option>
            <option value="2">Intermédiaire</option>
            <option value="3">4ème année</option>
            <option value="4">Avancé</option>
          </select>

          {/* Filtre 3 : Grille — uniquement visible en mode Apprentissage */}
          {filters.mode === 'apprentissage' && (
            <select
              value={filters.grille}
              onChange={(e) => setFilters({ ...filters, grille: e.target.value as ReadingGridId | '' })}
              className={selectClass}
            >
              <option value="">Toutes les grilles</option>
              {GRILLES.map((g) => (
                <option key={g.id} value={g.id}>{g.nomCourt}</option>
              ))}
            </select>
          )}

          {hasActive && (
            <button
              onClick={() => setFilters(INITIAL_FILTERS)}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <X size={14} />
              Réinitialiser
            </button>
          )}

          <div className="ml-auto text-sm text-slate-500">
            {filtered.length === cases.length ? (
              <span>{cases.length} cas</span>
            ) : (
              <span>
                <strong className="text-slate-700">{filtered.length}</strong> / {cases.length} cas
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Résultats */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-400 text-lg mb-2">Aucun cas ne correspond.</p>
          <button
            onClick={() => setFilters(INITIAL_FILTERS)}
            className="text-sm text-teal-600 hover:text-teal-700"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((c) => (
            <CasCard key={c.id} cas={c} showApprentissage={filters.mode === 'apprentissage'} />
          ))}
        </div>
      )}
    </div>
  );
}

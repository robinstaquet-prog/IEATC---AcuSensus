'use client';

// ─── Page Mode Apprentissage ─────────────────────────────────────────────────
// Liste les cas qualifies pour l'apprentissage (expert ou valeur >= 50).
// Chaque cas propose un bouton "S'entrainer" qui redirige vers /apprentissage/[id].

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { getCasesPublies } from '@/data';
import type { ClinicalCase } from '@/types';
import { cn } from '@/lib/utils';
import { GraduationCap, BookOpen, Star } from 'lucide-react';

// ─── Utilitaires d'affichage ─────────────────────────────────────────────────

const COMPLEXITE_LABELS: Record<number, string> = {
  1: '1ere annee',
  2: 'Intermediaire',
  3: '4eme annee',
  4: 'Avance',
};
const COMPLEXITE_COLORS: Record<number, string> = {
  1: 'bg-emerald-100 text-emerald-700',
  2: 'bg-amber-100 text-amber-700',
  3: 'bg-orange-100 text-orange-700',
  4: 'bg-red-100 text-red-700',
};

function ApprentissageCasCard({ cas }: { cas: ClinicalCase }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 h-full flex flex-col">
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
              <Star size={10} />
              Apprentissage
            </span>
            <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', COMPLEXITE_COLORS[cas.niveauComplexite])}>
              {COMPLEXITE_LABELS[cas.niveauComplexite]}
            </span>
          </div>
        </div>
        <h3 className="font-semibold text-slate-900 leading-snug">
          {cas.titre}
        </h3>
      </div>

      {/* Motif */}
      <div className="px-5 flex-1">
        <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
          {cas.content.motif}
        </p>
      </div>

      {/* Tags */}
      <div className="px-5 py-2">
        <div className="flex flex-wrap gap-1.5">
          {cas.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Footer + bouton */}
      <div className="px-5 py-4 mt-auto border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          {cas.age && <span>{cas.age} ans</span>}
          {cas.age && cas.sexe && <span>.</span>}
          {cas.sexe && <span>{cas.sexe === 'feminin' ? 'F' : cas.sexe === 'masculin' ? 'H' : '?'}</span>}
        </div>
        <Link
          href={`/apprentissage/${cas.id}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-500 transition-colors"
        >
          <GraduationCap size={14} />
          S&apos;entrainer sur ce cas
        </Link>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ApprentissagePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const casApprentissage = useMemo(() => {
    if (!mounted) return [];
    // getCasesPublies inclut deja les cas utilisateur
    const allCases = getCasesPublies();
    return allCases.filter((c) => {
      // Apprentissage = cas marqués exemplaire ou avec analyse expert
      return c.exemplaire || c.analyses.some((a) => a.role === 'expert' || a.auteurStatut === 'expert');
    });
  }, [mounted]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <GraduationCap size={22} className="text-teal-600" />
          <h1 className="text-2xl font-bold text-slate-900">Mode Apprentissage</h1>
        </div>
        <p className="text-slate-500 text-sm max-w-3xl leading-relaxed">
          Entraînez-vous sur des cas cliniques validés par la communauté.
          Réalisez votre analyse en conditions réelles, puis comparez-la avec les analyses
          d&apos;experts et de praticiens confirmés. Vos exercices restent privés et n&apos;impactent
          pas les statistiques du cas.
        </p>
      </div>

      {/* Indication visuelle : exercice privé */}
      <div className="bg-teal-50 border border-teal-200 rounded-xl px-5 py-3 mb-8 flex items-start gap-3">
        <BookOpen size={16} className="text-teal-600 mt-0.5 shrink-0" />
        <p className="text-sm text-teal-800">
          <strong>Exercice privé</strong> — Vos exercices d&apos;apprentissage ne sont pas publiés,
          ne rapportent pas de points de vote, et ne figurent pas dans les statistiques du cas ni
          de votre profil.
        </p>
      </div>

      {/* Liste des cas */}
      {casApprentissage.length === 0 ? (
        <div className="text-center py-16">
          <GraduationCap size={36} className="text-slate-300 mx-auto mb-4" />
          <p className="text-slate-400 text-lg mb-2">Aucun cas d&apos;apprentissage disponible.</p>
          <p className="text-sm text-slate-400">
            Les cas deviennent disponibles quand ils ont une analyse d&apos;expert ou une participation tres votee.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {casApprentissage.map((c) => (
            <ApprentissageCasCard key={c.id} cas={c} />
          ))}
        </div>
      )}
    </div>
  );
}

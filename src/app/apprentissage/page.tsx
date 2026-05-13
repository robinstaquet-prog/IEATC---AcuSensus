'use client';

// ─── Page Mode Apprentissage ─────────────────────────────────────────────────
// Liste uniquement les cas certifiés pour l'apprentissage :
// - exemplaire (marqué par l'éditeur) OU qualifieApprentissage (seuil communautaire)
// Chaque cas propose un bouton "S'entrainer" qui redirige vers /apprentissage/[id].

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { getCasesPublies } from '@/data';
import { getUserCases } from '@/lib/user-cases-store';
import type { ClinicalCase } from '@/types';
import { cn } from '@/lib/utils';
import { COMPLEXITE_LABELS, COMPLEXITE_COLORS } from '@/lib/constants';
import { GraduationCap, BookOpen, Star, GitBranch, Lock } from 'lucide-react';

function ApprentissageCasCard({ cas }: { cas: ClinicalCase }) {
  const analysesCount = cas.analyses.length;
  const hasExpert = cas.analyses.some((a) => a.role === 'expert' || a.auteurStatut === 'expert');

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 h-full flex flex-col group">
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
          {hasExpert && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100 shrink-0">
              Expert
            </span>
          )}
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

      {/* Tags */}
      {cas.tags.length > 0 && (
        <div className="px-5 py-2">
          <div className="flex flex-wrap gap-1.5">
            {cas.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer + bouton */}
      <div className="px-5 py-4 mt-auto border-t border-slate-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          {cas.age && (
            <span>
              {cas.age} ans
              {cas.sexe && cas.sexe !== 'non_precise' && ` · ${cas.sexe === 'feminin' ? 'F' : 'H'}`}
            </span>
          )}
          {analysesCount > 0 && (
            <span className="flex items-center gap-1">
              <GitBranch size={11} />
              {analysesCount} analyse{analysesCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <Link
          href={`/apprentissage/${cas.id}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-500 transition-colors shrink-0"
        >
          <GraduationCap size={14} />
          S&apos;entraîner
        </Link>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ApprentissagePage() {
  const [mounted, setMounted] = useState(false);
  const [niveauFiltre, setNiveauFiltre] = useState<number | ''>('');
  const [dbCases, setDbCases] = useState<ClinicalCase[]>([]);

  useEffect(() => {
    setMounted(true);
    // Charger les cas Supabase marqués apprentissage
    getUserCases().then((cas) => {
      setDbCases(
        cas.filter((c) => c.statut === 'publie' && (c.exemplaire || c.qualifieApprentissage)),
      );
    });
  }, []);

  const casApprentissage = useMemo(() => {
    if (!mounted) return [];
    const corpusCases = getCasesPublies().filter((c) => c.exemplaire || c.qualifieApprentissage);
    // Fusionner corpus + Supabase (dédupliquer par ID)
    const seen = new Set(corpusCases.map((c) => c.id));
    const merged = [...corpusCases];
    for (const c of dbCases) {
      if (!seen.has(c.id)) {
        seen.add(c.id);
        merged.push(c);
      }
    }
    return merged;
  }, [mounted, dbCases]);

  const filtered = useMemo(() => {
    if (!niveauFiltre) return casApprentissage;
    return casApprentissage.filter((c) => c.niveauComplexite === niveauFiltre);
  }, [casApprentissage, niveauFiltre]);

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
          d&apos;experts et de praticiens confirmés.
        </p>
      </div>

      {/* Indication visuelle + filtre niveau */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1 bg-teal-50 border border-teal-200 rounded-xl px-5 py-3 flex items-start gap-3">
          <Lock size={15} className="text-teal-600 mt-0.5 shrink-0" />
          <p className="text-sm text-teal-800">
            <strong>Exercice privé</strong> — Vos exercices ne sont pas publiés et ne figurent pas dans les statistiques.
          </p>
        </div>

        {casApprentissage.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm text-slate-500 whitespace-nowrap">Niveau :</span>
            <select
              value={niveauFiltre}
              onChange={(e) => setNiveauFiltre(e.target.value ? Number(e.target.value) : '')}
              className="h-10 px-3 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
            >
              <option value="">Tous</option>
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>{COMPLEXITE_LABELS[n]}</option>
              ))}
            </select>
            <span className="text-sm text-slate-400 whitespace-nowrap">
              {filtered.length} cas
            </span>
          </div>
        )}
      </div>

      {/* Liste des cas */}
      {casApprentissage.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
          <GraduationCap size={40} className="text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-medium mb-1">Aucun cas d&apos;apprentissage disponible.</p>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            Les cas deviennent disponibles lorsqu&apos;ils sont certifiés :
            marqués exemplaires par l&apos;éditeur ou qualifiés par la communauté.
          </p>
          <Link
            href="/cas"
            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-lg bg-teal-600 text-white font-semibold text-sm hover:bg-teal-500 transition-colors"
          >
            <BookOpen size={15} />
            Explorer les cas
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-400 mb-2">Aucun cas pour ce niveau.</p>
          <button
            onClick={() => setNiveauFiltre('')}
            className="text-sm text-teal-600 hover:text-teal-700"
          >
            Voir tous les niveaux
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((c) => (
            <ApprentissageCasCard key={c.id} cas={c} />
          ))}
        </div>
      )}
    </div>
  );
}

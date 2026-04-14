'use client';

// ─── Page d'initialisation des comptes de démo ───────────────────────────────

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { seedFakeAccounts, type SeedResult } from '@/lib/supabase-seed-accounts';
import { Database, CheckCircle2, XCircle, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';

export default function AdminSeedPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<SeedResult[] | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/connexion');
      return;
    }
    if (!isLoading && user && !user.is_admin) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  const handleSeed = async () => {
    setRunning(true);
    setResults(null);
    const res = await seedFakeAccounts();
    setResults(res);
    setRunning(false);
  };

  if (isLoading || !user?.is_admin) return null;

  const created = results?.filter((r) => r.status === 'created').length ?? 0;
  const existing = results?.filter((r) => r.status === 'exists').length ?? 0;
  const errors = results?.filter((r) => r.status === 'error').length ?? 0;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      {/* En-tête */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/admin"
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft size={14} />
          Administration
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-sm font-medium text-slate-700">Comptes de démo</span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
            <Database size={20} className="text-slate-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Initialiser les comptes de démo</h1>
            <p className="text-sm text-slate-500 mt-1">
              Crée les comptes Supabase Auth pour les utilisateurs de démonstration prédéfinis
              (admin, experts, praticiens, étudiant).
            </p>
          </div>
        </div>

        {/* Liste des comptes */}
        <div className="mb-6 rounded-xl bg-slate-50 border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Comptes qui seront créés
          </p>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="font-medium text-slate-700">Robin Staquet</span>
              <span className="text-xs text-slate-400">Admin · Praticien expérimenté · 1000 pts</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-slate-700">Laurent Mercier</span>
              <span className="text-xs text-slate-400">Expert · 200 pts</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-slate-700">Isabelle Fontaine</span>
              <span className="text-xs text-slate-400">Expert · 180 pts</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-slate-700">Marie Dubois</span>
              <span className="text-xs text-slate-400">Praticien expérimenté · 80 pts</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-slate-700">Thomas Bernard</span>
              <span className="text-xs text-slate-400">Étudiant · 30 pts</span>
            </div>
          </div>
        </div>

        {/* Bouton */}
        <button
          onClick={handleSeed}
          disabled={running}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-teal-600 text-white font-semibold text-sm hover:bg-teal-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {running ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Initialisation en cours…
            </>
          ) : (
            <>
              <Database size={16} />
              Initialiser les comptes de démo
            </>
          )}
        </button>

        {/* Résultats */}
        {results && (
          <div className="mt-6 space-y-4">
            {/* Résumé */}
            <div className="grid grid-cols-3 gap-3 text-center text-sm">
              <div className="rounded-lg bg-teal-50 border border-teal-200 p-3">
                <p className="text-2xl font-bold text-teal-700">{created}</p>
                <p className="text-xs text-teal-600 mt-0.5">Créé(s)</p>
              </div>
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                <p className="text-2xl font-bold text-amber-700">{existing}</p>
                <p className="text-xs text-amber-600 mt-0.5">Existant(s)</p>
              </div>
              <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                <p className="text-2xl font-bold text-red-700">{errors}</p>
                <p className="text-xs text-red-600 mt-0.5">Erreur(s)</p>
              </div>
            </div>

            {/* Détail */}
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <p className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide bg-slate-50 border-b border-slate-200">
                Détail
              </p>
              <div className="divide-y divide-slate-100">
                {results.map((r) => (
                  <div key={r.email} className="flex items-start gap-3 px-4 py-3">
                    {r.status === 'created' && (
                      <CheckCircle2 size={16} className="text-teal-500 shrink-0 mt-0.5" />
                    )}
                    {r.status === 'exists' && (
                      <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                    )}
                    {r.status === 'error' && (
                      <XCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{r.email}</p>
                      {r.message && (
                        <p className="text-xs text-slate-400 mt-0.5">{r.message}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

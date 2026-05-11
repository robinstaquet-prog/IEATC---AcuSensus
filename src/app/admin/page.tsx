'use client';

// ─── Page d'administration AcuSensus ─────────────────────────────────────────

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Shield, Check, Loader2, AlertCircle, ExternalLink, Eye, EyeOff, BookOpen, Trash2, Pencil, Database } from 'lucide-react';
import { CLINICAL_CASES } from '@/data/cases';
import { getHiddenCorpusCaseIds, setCorpusCaseHidden } from '@/lib/corpus-overrides';
import type { ClinicalCase } from '@/types';

const STATUTS_OPTIONS = [
  { value: 'premiere_annee', label: '1ère année' },
  { value: 'etudiant', label: 'Étudiant' },
  { value: 'quatrieme_annee', label: '4ème année' },
  { value: 'jeune_praticien', label: 'Jeune praticien' },
  { value: 'praticien_experimente', label: 'Praticien expérimenté' },
  { value: 'expert', label: 'Expert' },
];

interface UserRow {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  statut_ieatc: string;
  role: string;
  points_vote: number;
  is_admin: boolean;
  date_inscription: string;
  // Champs éditables locaux
  _editStatut: string;
  _editPoints: number;
  _editAdmin: boolean;
  _saving: boolean;
  _saved: boolean;
  _error: string | null;
}

export default function AdminPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

  // ─── Cas Supabase ───────────────────────────────────────────────────────────
  const [supabaseCases, setSupabaseCases] = useState<{ id: string; titre: string; auteur_id: string | null }[]>([]);
  const [loadingCases, setLoadingCases] = useState(false);
  const [seedingCorpus, setSeedingCorpus] = useState(false);
  const [seedCorpusMsg, setSeedCorpusMsg] = useState<string | null>(null);

  const fetchSupabaseCases = useCallback(async () => {
    setLoadingCases(true);
    const { data } = await supabase
      .from('clinical_cases')
      .select('id, titre, auteur_id')
      .order('titre', { ascending: true });
    setSupabaseCases(data ?? []);
    setLoadingCases(false);
  }, []);

  const deleteCas = async (id: string) => {
    if (!confirm(`Supprimer définitivement le cas "${id}" de Supabase ?\n\nLes participations liées seront aussi supprimées (cascade FK).`)) return;
    try {
      const session = (await supabase.auth.getSession()).data.session;
      const res = await fetch('/api/admin/delete-case', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token ?? ''}`,
        },
        body: JSON.stringify({ caseId: id }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        alert('Erreur suppression : ' + (error ?? 'inconnue'));
        return;
      }
      setSupabaseCases((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      alert('Erreur réseau : ' + String(e));
    }
  };

  const seedAllCorpus = async () => {
    setSeedingCorpus(true);
    setSeedCorpusMsg(null);
    let inserted = 0;
    let skipped = 0;
    for (const cas of CLINICAL_CASES) {
      const now = new Date().toISOString();
      const { error } = await supabase.from('clinical_cases').upsert(
        {
          id: cas.id,
          slug: cas.slug,
          titre: cas.titre,
          statut: cas.statut,
          niveau_complexite: cas.niveauComplexite,
          age: cas.age ?? null,
          sexe: cas.sexe ?? null,
          cas_complet: cas.casComplet,
          exemplaire: cas.exemplaire,
          qualifie_apprentissage: cas.qualifieApprentissage ?? false,
          grille_principale: cas.grillePrincipale,
          tags: cas.tags,
          content: cas.content,
          view_count: cas.viewCount ?? 0,
          auteur_id: cas.auteurId ?? null,
          date_creation: cas.dateCreation ?? null,
          date_publication: cas.datePublication ?? null,
          created_at: cas.dateCreation ?? now,
          updated_at: now,
        } as Partial<ClinicalCase>,
        { onConflict: 'id', ignoreDuplicates: false },
      );
      if (error) skipped++;
      else inserted++;
    }
    setSeedCorpusMsg(`${inserted} cas insérés / mis à jour, ${skipped} erreurs.`);
    setSeedingCorpus(false);
    await fetchSupabaseCases();
  };

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    setFetchError(null);
    const { data, error } = await supabase
      .from('users')
      .select('id, prenom, nom, email, statut_ieatc, role, points_vote, is_admin, date_inscription')
      .order('date_inscription', { ascending: false });

    if (error) {
      setFetchError('Impossible de charger les utilisateurs. Vérifiez vos droits.');
      setLoadingUsers(false);
      return;
    }

    setUsers(
      (data ?? []).map((u) => ({
        ...u,
        _editStatut: u.statut_ieatc ?? 'etudiant',
        _editPoints: u.points_vote ?? 10,
        _editAdmin: u.is_admin ?? false,
        _saving: false,
        _saved: false,
        _error: null,
      }))
    );
    setLoadingUsers(false);
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/connexion');
      return;
    }
    if (!isLoading && user && !user.is_admin) {
      router.push('/');
      return;
    }
    if (user?.is_admin) {
      fetchUsers();
      setHiddenIds(getHiddenCorpusCaseIds());
      fetchSupabaseCases();
    }
  }, [user, isLoading, router, fetchUsers, fetchSupabaseCases]);

  const toggleCasVisibility = (id: string) => {
    const nowHidden = !hiddenIds.has(id);
    setCorpusCaseHidden(id, nowHidden);
    setHiddenIds((prev) => {
      const next = new Set(prev);
      if (nowHidden) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const updateUserField = (id: string, field: string, value: unknown) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, [field]: value, _saved: false } : u))
    );
  };

  const saveUser = async (row: UserRow) => {
    updateUserField(row.id, '_saving', true);
    updateUserField(row.id, '_error', null);

    const { error } = await supabase
      .from('users')
      .update({
        statut_ieatc: row._editStatut,
        points_vote: row._editPoints,
        is_admin: row._editAdmin,
      })
      .eq('id', row.id);

    if (error) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === row.id
            ? { ...u, _saving: false, _error: 'Erreur lors de la sauvegarde.' }
            : u
        )
      );
      return;
    }

    setUsers((prev) =>
      prev.map((u) =>
        u.id === row.id
          ? {
              ...u,
              statut_ieatc: u._editStatut,
              points_vote: u._editPoints,
              is_admin: u._editAdmin,
              _saving: false,
              _saved: true,
              _error: null,
            }
          : u
      )
    );

    // Reset le badge "sauvegardé" après 2 s
    setTimeout(() => {
      setUsers((prev) =>
        prev.map((u) => (u.id === row.id ? { ...u, _saved: false } : u))
      );
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-slate-400" />
      </div>
    );
  }

  if (!user?.is_admin) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
            <Shield size={20} className="text-teal-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Administration AcuSensus</h1>
            <p className="text-sm text-slate-500">Gestion des utilisateurs enregistrés</p>
          </div>
        </div>
        <Link
          href="/admin/seed"
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <ExternalLink size={14} />
          Comptes démo
        </Link>
      </div>

      {/* Erreur de chargement */}
      {fetchError && (
        <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle size={16} />
          {fetchError}
        </div>
      )}

      {/* Table */}
      {loadingUsers ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-slate-300" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          Aucun utilisateur enregistré pour l&apos;instant.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">
                  <th className="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Utilisateur</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Statut IEATC</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Rôle</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Points de vote</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Inscription</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Admin ?</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Prénom Nom + email */}
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900 whitespace-nowrap">
                        {row.prenom} {row.nom}
                      </div>
                      <div className="text-xs text-slate-400 truncate max-w-[160px]">{row.email}</div>
                    </td>

                    {/* Statut IEATC — éditable */}
                    <td className="px-4 py-3">
                      <select
                        value={row._editStatut}
                        onChange={(e) => updateUserField(row.id, '_editStatut', e.target.value)}
                        className="px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        {STATUTS_OPTIONS.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Rôle (lecture seule) */}
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-500">{row.role}</span>
                    </td>

                    {/* Points de vote — éditable */}
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={row._editPoints}
                        onChange={(e) =>
                          updateUserField(row.id, '_editPoints', parseInt(e.target.value) || 0)
                        }
                        min={0}
                        className="w-20 px-2 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </td>

                    {/* Date d'inscription */}
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500">
                      {row.date_inscription
                        ? new Date(row.date_inscription).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>

                    {/* Admin toggle */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => updateUserField(row.id, '_editAdmin', !row._editAdmin)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          row._editAdmin ? 'bg-teal-600' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          style={{ transform: row._editAdmin ? 'translateX(18px)' : 'translateX(2px)' }}
                          className="inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform"
                        />
                      </button>
                    </td>

                    {/* Sauvegarder */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => saveUser(row)}
                          disabled={row._saving}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-medium hover:bg-teal-500 transition-colors disabled:opacity-60"
                        >
                          {row._saving ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Check size={12} />
                          )}
                          Sauvegarder
                        </button>
                        {row._saved && (
                          <span className="text-xs text-teal-600 font-medium">Sauvegardé ✓</span>
                        )}
                        {row._error && (
                          <span className="text-xs text-red-500">{row._error}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Cas dans Supabase (clinical_cases) ───────────────────────────── */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Database size={18} className="text-slate-600" />
            <div>
              <h2 className="text-lg font-bold text-slate-900">Cas dans Supabase</h2>
              <p className="text-xs text-slate-400">
                Les cas en base. Suppression définitive (participations liées supprimées aussi).
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {seedCorpusMsg && <span className="text-xs text-teal-600">{seedCorpusMsg}</span>}
            <button
              onClick={seedAllCorpus}
              disabled={seedingCorpus}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-500 transition-colors disabled:opacity-60"
            >
              {seedingCorpus ? <Loader2 size={14} className="animate-spin" /> : <Database size={14} />}
              Insérer tous les cas du corpus
            </button>
          </div>
        </div>

        {loadingCases ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={24} className="animate-spin text-slate-300" />
          </div>
        ) : supabaseCases.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm bg-white rounded-2xl border border-slate-200">
            Aucun cas dans Supabase pour l&apos;instant.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">
                  <th className="px-4 py-3 font-semibold text-slate-600">ID</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Titre</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Auteur</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {supabaseCases.map((cas) => (
                  <tr key={cas.id} className="hover:bg-slate-50/40">
                    <td className="px-4 py-3 font-mono text-xs text-slate-400 whitespace-nowrap">{cas.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{cas.titre}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {cas.auteur_id ? cas.auteur_id.slice(0, 8) + '…' : 'Corpus'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/mes-cas/${cas.id}/modifier`}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          <Pencil size={11} /> Modifier
                        </Link>
                        <button
                          onClick={() => deleteCas(cas.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 text-xs text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={11} /> Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Gestion du corpus ─────────────────────────────────────────────── */}
      <div className="mt-10">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen size={18} className="text-slate-600" />
          <div>
            <h2 className="text-lg font-bold text-slate-900">Gestion du corpus</h2>
            <p className="text-xs text-slate-400">
              Les cas masqués n&apos;apparaissent plus dans la liste publique. Les stats ne sont pas affectées.
            </p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left">
                <th className="px-4 py-3 font-semibold text-slate-600">ID</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Titre</th>
                <th className="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Complexité</th>
                <th className="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Analyses</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Visibilité</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {CLINICAL_CASES.map((cas) => {
                const hidden = hiddenIds.has(cas.id);
                return (
                  <tr key={cas.id} className={hidden ? 'bg-slate-50/80 opacity-60' : 'hover:bg-slate-50/40'}>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400 whitespace-nowrap">{cas.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800 leading-snug">{cas.titre}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{cas.content.motif.slice(0, 70)}{cas.content.motif.length > 70 ? '…' : ''}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">Niveau {cas.niveauComplexite}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{cas.analyses.length}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleCasVisibility(cas.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          hidden
                            ? 'bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700'
                            : 'bg-red-50 text-red-600 hover:bg-red-100'
                        }`}
                      >
                        {hidden ? <Eye size={12} /> : <EyeOff size={12} />}
                        {hidden ? 'Restaurer' : 'Masquer'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

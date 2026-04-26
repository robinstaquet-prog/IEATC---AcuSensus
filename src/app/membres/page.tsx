'use client';

// ─── Page Membres — liste de tous les membres AcuSensus ──────────────────────

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { LABEL_STATUT_IEATC } from '@/lib/constants';
import { Users, MapPin, Loader2, Search, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MemberRow {
  id: string;
  prenom: string;
  nom: string;
  statut_ieatc: string;
  annee_promotion?: number;
  lieu_pratique?: string;
  photo_profil?: string;
}

export default function MembresPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [membres, setMembres] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push('/connexion');
      return;
    }

    void (async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, prenom, nom, statut_ieatc, annee_promotion, lieu_pratique, photo_profil')
          .order('prenom', { ascending: true });
        if (error) {
          setFetchError(`Erreur chargement membres : ${error.message}. Le SQL supabase/members-messaging.sql a-t-il été exécuté ?`);
        } else {
          setMembres(data ?? []);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [user, isLoading, router]);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-slate-400" />
      </div>
    );
  }

  const filtered = membres.filter((m) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      m.prenom?.toLowerCase().includes(q) ||
      m.nom?.toLowerCase().includes(q) ||
      m.lieu_pratique?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* En-tête */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
          <Users size={20} className="text-teal-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Membres AcuSensus</h1>
          <p className="text-sm text-slate-500">{membres.length} membre{membres.length > 1 ? 's' : ''} inscrit{membres.length > 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Erreur éventuelle */}
      {fetchError && (
        <div className="mb-6 flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          {fetchError}
        </div>
      )}

      {/* Recherche */}
      <div className="relative mb-6">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Rechercher par nom, prénom, lieu…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">Aucun membre trouvé.</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((m) => {
            const fullName = `${m.prenom ?? ''} ${m.nom ?? ''}`.trim() || '—';
            const initiale = fullName.charAt(0).toUpperCase();
            const statutLabel = m.statut_ieatc ? LABEL_STATUT_IEATC[m.statut_ieatc] ?? m.statut_ieatc : '';
            return (
              <Link
                key={m.id}
                href={`/membres/${m.id}`}
                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-teal-300 hover:shadow-sm transition-all group"
              >
                {m.photo_profil ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.photo_profil}
                    alt={fullName}
                    className="w-11 h-11 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className={cn(
                    'w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-base shrink-0',
                    'bg-teal-500 group-hover:bg-teal-400 transition-colors',
                  )}>
                    {initiale}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 group-hover:text-teal-700 transition-colors truncate">
                    {fullName}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {statutLabel}
                    {m.annee_promotion ? ` · Volée ${m.annee_promotion}` : ''}
                  </p>
                  {m.lieu_pratique && (
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                      <MapPin size={10} />
                      {m.lieu_pratique}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

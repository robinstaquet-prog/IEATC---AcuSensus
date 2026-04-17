'use client';

// ─── Mon profil — Supabase Auth ───────────────────────────────────────────────
// Affiche : identité (nom/prénom/statut/volée + infos optionnelles),
// compteurs (participations et cas soumis, tous + publics),
// puis listes publiques uniquement (participations publiées + cas soumis publics).

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getAllParticipations } from '@/lib/participation-store';
import { getUserCasesByAuteur, deleteUserCase } from '@/lib/user-cases-store';
import { getAllExercices } from '@/lib/exercice-store';
import { getCaseById } from '@/data';
import { GridBadge } from '@/components/ieatc/GridBadge';
import { LABEL_STATUT_IEATC } from '@/lib/constants';
import type { UserParticipation, ClinicalCase } from '@/types';
import { cn } from '@/lib/utils';
import {
  User,
  BookOpen,
  PenLine,
  Award,
  MapPin,
  Mail,
  Phone,
  ArrowRight,
  Coins,
  FilePlus,
  GraduationCap,
  LogIn,
  Trash2,
  Loader2,
} from 'lucide-react';

function PublicParticipationRow({ p }: { p: UserParticipation }) {
  const cas = getCaseById(p.caseId);
  if (!cas) return null;
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <Link
            href={`/cas/${cas.id}`}
            className="font-semibold text-slate-900 hover:text-teal-700 transition-colors leading-snug block mb-1"
          >
            {cas.titre}
          </Link>
          <div className="flex flex-wrap gap-2 mb-1.5">
            {p.grilleChoisie && <GridBadge grilleId={p.grilleChoisie} size="sm" />}
            {p.grilleSecondaire && <GridBadge grilleId={p.grilleSecondaire} size="sm" />}
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-100">
              Publique
            </span>
          </div>
          {p.bilanEnergetique && (
            <p className="text-xs text-slate-500 italic line-clamp-2">{p.bilanEnergetique}</p>
          )}
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1">
          <span className="text-xs text-slate-400">
            Valeur {Number(p.valeur ?? 1).toFixed(2)}
          </span>
          <Link
            href={`/cas/${cas.id}`}
            className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-medium"
          >
            Voir <ArrowRight size={11} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ProfilPage() {
  const { user, isLoading } = useAuth();
  const [participations, setParticipations] = useState<UserParticipation[]>([]);
  const [userCases, setUserCases] = useState<ClinicalCase[]>([]);
  const [exercices, setExercices] = useState<UserParticipation[]>([]);
  type OngletProfil = 'participations' | 'cas' | 'apprentissage';
  const [onglet, setOnglet] = useState<OngletProfil>('participations');

  useEffect(() => {
    if (user) {
      getAllParticipations(user.id).then(setParticipations);
      setExercices(getAllExercices(user.id));
      getUserCasesByAuteur(user.id).then(setUserCases);
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 flex justify-center">
        <Loader2 size={28} className="text-teal-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10">
          <User size={36} className="text-slate-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-900 mb-2">Mon espace</h1>
          <p className="text-slate-500 text-sm mb-6">
            Connectez-vous pour voir votre profil et vos participations.
          </p>
          <Link
            href="/connexion"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-teal-600 text-white hover:bg-teal-500 font-semibold text-sm transition-colors"
          >
            <LogIn size={16} />
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  // Données profil
  const fullName = [user.prenom, user.nom].filter(Boolean).join(' ') || user.pseudo || user.email;
  const isExpert = user.statut_ieatc === 'expert';
  const volee = user.annee_promotion ? `Volée ${user.annee_promotion}` : null;
  const statutLabel = user.statut_ieatc
    ? LABEL_STATUT_IEATC[user.statut_ieatc] ?? user.statut_ieatc
    : '—';

  // Compteurs
  const totalPart = participations.length;
  const publicPart = participations.filter((p) => p.publicationMode === 'public').length;
  const anonPart = totalPart - publicPart;
  const totalCasSoumis = userCases.length;
  const publicCasSoumis = userCases.filter((c) => c.auteurId === user.id).length;
  const publicParticipations = participations.filter((p) => p.publicationMode === 'public');

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header profil */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-6">
          <div className="flex items-center gap-4">
            {user.photo_profil ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.photo_profil}
                alt={fullName}
                className="w-14 h-14 rounded-full object-cover border-2 border-white/20"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-xl">
                {fullName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-white">{fullName}</h1>
                {isExpert && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white">
                    <Award size={10} /> EXPERT
                  </span>
                )}
                {user.is_admin && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-700 text-teal-200">
                    ADMIN
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-sm">
                {statutLabel}
                {volee && <span className="text-slate-500"> · {volee}</span>}
              </p>
            </div>
            <span
              title="Points de vote"
              className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30"
            >
              <Coins size={13} />
              {user.votePoints ?? 0} pts
            </span>
          </div>

          {/* Infos optionnelles */}
          {(user.lieu_pratique || user.mail_public || user.telephone) && (
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-400">
              {user.lieu_pratique && (
                <span className="inline-flex items-center gap-1">
                  <MapPin size={11} /> {user.lieu_pratique}
                </span>
              )}
              {user.mail_public && (
                <span className="inline-flex items-center gap-1">
                  <Mail size={11} /> {user.mail_public}
                </span>
              )}
              {user.telephone && (
                <span className="inline-flex items-center gap-1">
                  <Phone size={11} /> {user.telephone}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Compteurs */}
        <div className="grid grid-cols-2 divide-x divide-slate-100 bg-slate-50/60">
          <div className="px-5 py-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{totalPart}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Participations ({publicPart} publiques · {anonPart} anonymes)
            </p>
          </div>
          <div className="px-5 py-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{totalCasSoumis}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Cas soumis ({publicCasSoumis} publics · {totalCasSoumis - publicCasSoumis} anonymes)
            </p>
          </div>
        </div>
      </div>

      {/* Bouton soumettre un cas */}
      <div className="mb-8">
        <Link
          href="/soumettre"
          className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-teal-600 text-white hover:bg-teal-500 transition-colors shadow-sm font-semibold text-sm"
        >
          <FilePlus size={18} />
          Soumettre un cas clinique
        </Link>
      </div>

      {/* Onglets : participations, cas soumis, apprentissage */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setOnglet('participations')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
              onglet === 'participations'
                ? 'text-teal-700 border-b-2 border-teal-600 bg-teal-50/50'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50',
            )}
          >
            <PenLine size={14} />
            Participations
          </button>
          <button
            onClick={() => setOnglet('cas')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
              onglet === 'cas'
                ? 'text-teal-700 border-b-2 border-teal-600 bg-teal-50/50'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50',
            )}
          >
            <BookOpen size={14} />
            Cas soumis
          </button>
          <button
            onClick={() => setOnglet('apprentissage')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
              onglet === 'apprentissage'
                ? 'text-teal-700 border-b-2 border-teal-600 bg-teal-50/50'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50',
            )}
          >
            <GraduationCap size={14} />
            Apprentissage
          </button>
        </div>

        <div className="p-6">
          {/* Onglet participations publiques */}
          {onglet === 'participations' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <PenLine size={16} className="text-teal-600" />
                  Mes participations publiques
                </h2>
                <Link
                  href="/cas"
                  className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1 font-medium"
                >
                  <BookOpen size={13} />
                  Explorer les cas
                </Link>
              </div>

              {publicParticipations.length === 0 ? (
                <div className="rounded-xl border border-slate-200 p-8 text-center">
                  <PenLine size={24} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">
                    Aucune participation publique pour l&apos;instant.
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Seules les participations publiées en mode public s&apos;affichent ici.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {publicParticipations.map((p) => (
                    <PublicParticipationRow key={p.id} p={p} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Onglet cas soumis */}
          {onglet === 'cas' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen size={16} className="text-teal-600" />
                  Mes cas soumis publics
                </h2>
                <Link
                  href="/soumettre"
                  className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1 font-medium"
                >
                  <FilePlus size={13} />
                  Soumettre un cas
                </Link>
              </div>

              {userCases.length === 0 ? (
                <div className="rounded-xl border border-slate-200 p-8 text-center">
                  <BookOpen size={24} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">
                    Aucun cas soumis pour l&apos;instant.
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    <Link href="/soumettre" className="text-teal-600 hover:text-teal-700 underline">
                      Soumettez votre premier cas
                    </Link>
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userCases.map((c) => (
                    <div key={c.id} className="rounded-xl border border-slate-200 shadow-sm p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/mes-cas/${c.id}`}
                            className="font-semibold text-slate-900 hover:text-teal-700 transition-colors leading-snug block mb-1"
                          >
                            {c.titre}
                          </Link>
                          <p className="text-xs text-slate-500 line-clamp-1">{c.content.motif}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Link
                            href={`/mes-cas/${c.id}`}
                            className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-medium"
                          >
                            Voir <ArrowRight size={11} />
                          </Link>
                          <button
                            onClick={async () => {
                              if (confirm(`Supprimer le cas "${c.titre}" ? Cette action est irréversible.`)) {
                                await deleteUserCase(c.id);
                                setUserCases((prev) => prev.filter((x) => x.id !== c.id));
                              }
                            }}
                            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                            title="Supprimer ce cas"
                          >
                            <Trash2 size={12} />
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Onglet apprentissage */}
          {onglet === 'apprentissage' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <GraduationCap size={16} className="text-teal-600" />
                  Mes cas d&apos;apprentissage
                </h2>
                <Link
                  href="/apprentissage"
                  className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1 font-medium"
                >
                  <BookOpen size={13} />
                  Explorer
                </Link>
              </div>

              {exercices.length === 0 ? (
                <div className="rounded-xl border border-slate-200 p-8 text-center">
                  <GraduationCap size={24} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">
                    Aucun exercice d&apos;apprentissage terminé.
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    <Link href="/apprentissage" className="text-teal-600 hover:text-teal-700 underline">
                      Découvrir les cas d&apos;apprentissage
                    </Link>
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {exercices.map((ex) => {
                    const cas = getCaseById(ex.caseId);
                    const titreCas = cas?.titre ?? ex.caseId;
                    const dateStr = ex.updatedAt
                      ? new Date(ex.updatedAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : '';
                    return (
                      <div key={ex.id} className="rounded-xl border border-slate-200 shadow-sm p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 leading-snug mb-0.5">
                              {titreCas}
                            </p>
                            {dateStr && (
                              <p className="text-xs text-slate-400">{dateStr}</p>
                            )}
                          </div>
                          <Link
                            href={`/apprentissage/${ex.caseId}`}
                            className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-medium shrink-0"
                          >
                            Revoir <ArrowRight size={11} />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

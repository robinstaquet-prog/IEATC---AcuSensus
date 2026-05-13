'use client';

// ─── Profil public d'un membre ────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { sendMessage } from '@/lib/message-store';
import { LABEL_STATUT_IEATC } from '@/lib/constants';
import { GridBadge } from '@/components/ieatc/GridBadge';
import {
  User,
  MapPin,
  Mail,
  Phone,
  BookOpen,
  PenLine,
  ArrowRight,
  Loader2,
  Send,
  X,
  Award,
  EyeOff,
} from 'lucide-react';
import type { ClinicalCase, UserParticipation } from '@/types';

interface MemberProfile {
  id: string;
  prenom: string;
  nom: string;
  statut_ieatc: string;
  annee_promotion?: number;
  lieu_pratique?: string;
  mail_public?: string;
  telephone?: string;
  photo_profil?: string;
  is_admin?: boolean;
  show_mail_membres?: boolean;
  show_telephone_membres?: boolean;
}

export default function MembreProfilPage() {
  const params = useParams();
  const memberId = params?.id as string;
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [membre, setMembre] = useState<MemberProfile | null>(null);
  const [cases, setCases] = useState<ClinicalCase[]>([]);
  const [participations, setParticipations] = useState<UserParticipation[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Messagerie
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [sending, setSending] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [messageError, setMessageError] = useState<string | null>(null);

  const isAdmin = user?.is_admin ?? false;

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/connexion');
      return;
    }
    if (!user || !memberId) return;

    void (async () => {
      const [profileRes, casesRes, partsRes] = await Promise.all([
        supabase
          .from('users')
          .select('id, prenom, nom, statut_ieatc, annee_promotion, lieu_pratique, mail_public, telephone, photo_profil, is_admin, show_mail_membres, show_telephone_membres')
          .eq('id', memberId)
          .single(),
        supabase
          .from('clinical_cases')
          .select('*')
          .eq('auteur_id', memberId)
          .order('date_creation', { ascending: false }),
        supabase
          .from('user_participations')
          .select('id, user_id, case_id, extra_data, created_at, updated_at')
          .eq('user_id', memberId)
          .filter('extra_data->>isExercice', 'neq', 'true')
          .order('created_at', { ascending: false }),
      ]);

      if (profileRes.error || !profileRes.data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setMembre(profileRes.data);

      // Cas : admin voit tout, sinon seulement 'public'
      const allCases = (casesRes.data ?? []) as ClinicalCase[];
      setCases(
        isAdmin
          ? allCases
          : allCases.filter((c) => (c.content as { publicationMode?: string }).publicationMode === 'public'),
      );

      // Participations : admin voit tout, sinon seulement 'public'
      const allParts = partsRes.data ?? [];
      setParticipations(
        isAdmin
          ? allParts.map(rowToParticipation)
          : allParts.filter((p) => (p.extra_data?.publicationMode ?? p.extra_data?.publication_mode) === 'public').map(rowToParticipation),
      );

      setLoading(false);
    })();
  }, [user, isLoading, router, memberId, isAdmin]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function rowToParticipation(row: Record<string, any>): UserParticipation {
    const extra = row.extra_data ?? {};
    return {
      id: row.id,
      userId: row.user_id,
      caseId: row.case_id,
      grilleChoisie: extra.grilleChoisie ?? 'yin_yang',
      grilleSecondaire: extra.grilleSecondaire ?? undefined,
      bilanEnergetique: extra.bilanEnergetique ?? undefined,
      strategie: extra.strategie ?? undefined,
      publicationMode: extra.publicationMode ?? 'anonyme',
      valeur: extra.valeur ?? 1.0,
      pointsProposer: extra.pointsProposer ?? [],
      annotationsInterrogatoire: extra.annotationsInterrogatoire ?? [],
      createdAt: row.created_at,
      updatedAt: row.updated_at ?? row.created_at,
      categoriesRetenues: extra.categoriesRetenues ?? [],
      revelationFaite: extra.revelationFaite ?? false,
      votes: extra.votes ?? [],
      votePoints: extra.votePoints ?? 0,
    };
  }

  const handleSendMessage = async () => {
    if (!user || !membre || !messageContent.trim()) return;
    setSending(true);
    setMessageError(null);
    const { error } = await sendMessage(
      user.id,
      user.prenom ?? '',
      user.nom ?? '',
      membre.id,
      messageContent.trim(),
    );
    setSending(false);
    if (error) {
      setMessageError('Erreur lors de l\'envoi. Réessayez.');
      return;
    }
    setMessageSent(true);
    setMessageContent('');
    setTimeout(() => {
      setShowMessageForm(false);
      setMessageSent(false);
    }, 2500);
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-slate-400" />
      </div>
    );
  }

  if (notFound || !membre) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <User size={36} className="text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500">Membre introuvable.</p>
        <Link href="/membres" className="mt-4 inline-block text-sm text-teal-600 hover:underline">
          ← Retour aux membres
        </Link>
      </div>
    );
  }

  // Ne pas afficher son propre profil ici — rediriger vers /profil
  if (user && membre.id === user.id) {
    router.replace('/profil');
    return null;
  }

  const fullName = `${membre.prenom ?? ''} ${membre.nom ?? ''}`.trim() || '—';
  const initiale = fullName.charAt(0).toUpperCase();
  const statutLabel = membre.statut_ieatc ? LABEL_STATUT_IEATC[membre.statut_ieatc] ?? membre.statut_ieatc : '';
  const isExpert = membre.statut_ieatc === 'expert';

  // Comptages pour affichage (admin voit totaux réels)
  const totalParts = isAdmin
    ? participations.length
    : participations.filter((p) => p.publicationMode === 'public').length;
  const anonPartsCount = isAdmin
    ? participations.filter((p) => p.publicationMode === 'anonyme').length
    : 0;

  const totalCases = cases.length;
  const anonCasesCount = isAdmin
    ? cases.filter((c) => (c.content as { publicationMode?: string }).publicationMode === 'anonyme').length
    : 0;

  const publicParticipations = participations.filter((p) => p.publicationMode === 'public');
  const publicCases = cases.filter((c) => (c.content as { publicationMode?: string }).publicationMode === 'public');

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/membres" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal-600 mb-6 transition-colors">
        ← Tous les membres
      </Link>

      {/* Header profil */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-6">
          <div className="flex items-center gap-4">
            {membre.photo_profil ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={membre.photo_profil}
                alt={fullName}
                className="w-14 h-14 rounded-full object-cover border-2 border-white/20"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-xl">
                {initiale}
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
                {membre.is_admin && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-700 text-teal-200">
                    ADMIN
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-sm">
                {statutLabel}
                {membre.annee_promotion ? <span className="text-slate-500"> · Volée {membre.annee_promotion}</span> : null}
              </p>
            </div>
          </div>

          {(membre.lieu_pratique || (membre.mail_public && membre.show_mail_membres !== false) || (membre.telephone && membre.show_telephone_membres !== false)) && (
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-400">
              {membre.lieu_pratique && (
                <span className="inline-flex items-center gap-1"><MapPin size={11} /> {membre.lieu_pratique}</span>
              )}
              {membre.mail_public && membre.show_mail_membres !== false && (
                <span className="inline-flex items-center gap-1"><Mail size={11} /> {membre.mail_public}</span>
              )}
              {membre.telephone && membre.show_telephone_membres !== false && (
                <span className="inline-flex items-center gap-1"><Phone size={11} /> {membre.telephone}</span>
              )}
            </div>
          )}
        </div>

        {/* Compteurs */}
        <div className="grid grid-cols-2 divide-x divide-slate-100 bg-slate-50/60">
          <div className="px-5 py-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{totalParts}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {isAdmin && anonPartsCount > 0
                ? `Analyses (dont ${anonPartsCount} anonyme${anonPartsCount > 1 ? 's' : ''})`
                : 'Analyses publiques'}
            </p>
          </div>
          <div className="px-5 py-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{totalCases}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {isAdmin && anonCasesCount > 0
                ? `Cas soumis (dont ${anonCasesCount} anonyme${anonCasesCount > 1 ? 's' : ''})`
                : 'Cas soumis publics'}
            </p>
          </div>
        </div>
      </div>

      {/* Bouton envoyer un message */}
      {!showMessageForm ? (
        <button
          onClick={() => setShowMessageForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-500 transition-colors mb-6"
        >
          <Send size={14} />
          Envoyer un message
        </button>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-slate-900 text-sm">Message à {fullName}</p>
            <button onClick={() => { setShowMessageForm(false); setMessageContent(''); setMessageError(null); }}
              className="text-slate-400 hover:text-slate-600 transition-colors">
              <X size={16} />
            </button>
          </div>
          {messageSent ? (
            <div className="text-sm text-teal-600 font-medium py-2">Message envoyé ✓</div>
          ) : (
            <>
              <textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Votre message…"
                rows={4}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />
              {messageError && <p className="text-xs text-red-500 mt-1">{messageError}</p>}
              <div className="flex justify-end mt-3">
                <button
                  onClick={handleSendMessage}
                  disabled={sending || !messageContent.trim()}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-500 transition-colors disabled:opacity-60"
                >
                  {sending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                  Envoyer
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Analyses publiques */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
          <PenLine size={16} className="text-teal-600" />
          <h2 className="font-bold text-slate-900 text-base">
            Analyses{isAdmin && anonPartsCount > 0 ? ` · ${anonPartsCount} anonyme${anonPartsCount > 1 ? 's' : ''} (admin)` : ''}
          </h2>
        </div>
        <div className="p-5">
          {publicParticipations.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              Aucune analyse publique pour l&apos;instant.
            </div>
          ) : (
            <div className="space-y-3">
              {publicParticipations.map((p) => (
                <div key={p.id} className="rounded-xl border border-slate-100 p-4 hover:border-slate-200 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 mb-1 font-mono">{p.caseId}</p>
                      <div className="flex flex-wrap gap-1.5 mb-1.5">
                        {p.grilleChoisie && <GridBadge grilleId={p.grilleChoisie} size="sm" />}
                        {p.grilleSecondaire && <GridBadge grilleId={p.grilleSecondaire} size="sm" />}
                      </div>
                      {p.bilanEnergetique && (
                        <p className="text-xs text-slate-500 italic line-clamp-2">{p.bilanEnergetique}</p>
                      )}
                    </div>
                    <Link
                      href={`/cas/${p.caseId}`}
                      className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-medium shrink-0"
                    >
                      Voir <ArrowRight size={11} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Admin : analyses anonymes (visuellement séparées) */}
          {isAdmin && anonPartsCount > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1 mb-3">
                <EyeOff size={11} /> Analyses anonymes (visible admin uniquement)
              </p>
              <div className="space-y-3">
                {participations
                  .filter((p) => p.publicationMode === 'anonyme')
                  .map((p) => (
                    <div key={p.id} className="rounded-xl border border-slate-100 p-4 bg-slate-50/50">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-500 mb-1 font-mono">{p.caseId}</p>
                          <div className="flex flex-wrap gap-1.5 mb-1.5">
                            {p.grilleChoisie && <GridBadge grilleId={p.grilleChoisie} size="sm" />}
                          </div>
                          {p.bilanEnergetique && (
                            <p className="text-xs text-slate-500 italic line-clamp-2">{p.bilanEnergetique}</p>
                          )}
                        </div>
                        <Link href={`/cas/${p.caseId}`}
                          className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-medium shrink-0">
                          Voir <ArrowRight size={11} />
                        </Link>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cas soumis publics */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
          <BookOpen size={16} className="text-teal-600" />
          <h2 className="font-bold text-slate-900 text-base">
            Cas soumis{isAdmin && anonCasesCount > 0 ? ` · ${anonCasesCount} anonyme${anonCasesCount > 1 ? 's' : ''} (admin)` : ''}
          </h2>
        </div>
        <div className="p-5">
          {publicCases.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              Aucun cas soumis public pour l&apos;instant.
            </div>
          ) : (
            <div className="space-y-3">
              {publicCases.map((c) => (
                <div key={c.id} className="rounded-xl border border-slate-100 p-4 hover:border-slate-200 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/cas/${c.id}`}
                        className="font-semibold text-slate-900 hover:text-teal-700 transition-colors block mb-1 leading-snug"
                      >
                        {c.titre}
                      </Link>
                      <p className="text-xs text-slate-500 line-clamp-1">{c.content?.motif}</p>
                    </div>
                    <Link href={`/cas/${c.id}`}
                      className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-medium shrink-0">
                      Voir <ArrowRight size={11} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Admin : cas anonymes */}
          {isAdmin && anonCasesCount > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1 mb-3">
                <EyeOff size={11} /> Cas anonymes (visible admin uniquement)
              </p>
              <div className="space-y-3">
                {cases
                  .filter((c) => (c.content as { publicationMode?: string }).publicationMode === 'anonyme')
                  .map((c) => (
                    <div key={c.id} className="rounded-xl border border-slate-100 p-4 bg-slate-50/50">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <Link href={`/cas/${c.id}`}
                            className="font-semibold text-slate-900 hover:text-teal-700 transition-colors block mb-1 leading-snug">
                            {c.titre}
                          </Link>
                          <p className="text-xs text-slate-500 line-clamp-1">{c.content?.motif}</p>
                        </div>
                        <Link href={`/cas/${c.id}`}
                          className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-medium shrink-0">
                          Voir <ArrowRight size={11} />
                        </Link>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

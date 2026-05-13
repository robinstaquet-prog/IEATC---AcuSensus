'use client';

// ─── Mon profil — Supabase Auth ───────────────────────────────────────────────
// Affiche : identité (nom/prénom/statut/volée + infos optionnelles),
// compteurs (participations et cas soumis, tous + publics + anonymes),
// TOUTES les participations (publiques ET anonymes) avec analyse dépliable.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getAllParticipations } from '@/lib/participation-store';
import { getUserCasesByAuteur, deleteUserCase, getCasesByIds } from '@/lib/user-cases-store';
import { getAllExercices } from '@/lib/exercice-store';
import { getNotifications, markAllNotifsRead, type Notification } from '@/lib/notification-store';
import { getReceivedMessages, markAllMessagesRead, sendMessage, type Message } from '@/lib/message-store';
import { getCasesPublies } from '@/data';
import { GridBadge } from '@/components/ieatc/GridBadge';
import { getGrilleLabel } from '@/data/grilles';
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
  Library,
  Coins,
  FilePlus,
  GraduationCap,
  LogIn,
  Trash2,
  Loader2,
  Bell,
  MessageSquare,
  ThumbsUp,
  Send,
  EyeOff,
  Shield,
  ChevronDown,
  Target,
} from 'lucide-react';


export default function ProfilPage() {
  const { user, isLoading, updatePrivacy } = useAuth();
  const [participations, setParticipations] = useState<UserParticipation[]>([]);
  const [userCases, setUserCases] = useState<ClinicalCase[]>([]);
  const [exercices, setExercices] = useState<UserParticipation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  // Map pour résoudre les noms de cas (corpus + Supabase)
  const [caseMap, setCaseMap] = useState<Map<string, ClinicalCase>>(new Map());
  // Réponses inline aux messages
  const [replyOpenId, setReplyOpenId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replySending, setReplySending] = useState(false);
  const [replySentId, setReplySentId] = useState<string | null>(null);
  type OngletProfil = 'participations' | 'cas' | 'apprentissage' | 'notifications';
  const [onglet, setOnglet] = useState<OngletProfil>('participations');
  // Cartes dépliées (analyse complète visible)
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  // Confidentialité
  const [showMail, setShowMail] = useState(true);
  const [showTelephone, setShowTelephone] = useState(true);
  const [savingPrivacy, setSavingPrivacy] = useState(false);
  const [privacySaved, setPrivacySaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    setShowMail(user.show_mail_membres ?? true);
    setShowTelephone(user.show_telephone_membres ?? true);
    void (async () => {
      const [parts, exos, cases, notifs, msgs] = await Promise.all([
        getAllParticipations(user.id),
        getAllExercices(user.id),
        getUserCasesByAuteur(user.id),
        getNotifications(user.id),
        getReceivedMessages(user.id),
      ]);
      setParticipations(parts);
      setExercices(exos);
      setUserCases(cases);
      setNotifications(notifs);
      setMessages(msgs);

      // Construire la map de résolution des cas (corpus + Supabase)
      const map = new Map<string, ClinicalCase>();
      for (const c of getCasesPublies()) map.set(c.id, c);
      for (const c of cases) map.set(c.id, c);
      // Chercher les cas manquants dans Supabase (participations sur des cas d'autres utilisateurs)
      const allCaseIds = new Set([...parts.map((p) => p.caseId), ...exos.map((e) => e.caseId)]);
      const missingIds = [...allCaseIds].filter((id) => !map.has(id));
      if (missingIds.length > 0) {
        const dbCases = await getCasesByIds(missingIds);
        for (const c of dbCases) map.set(c.id, c);
      }
      setCaseMap(map);
    })();
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
  const publicCasSoumis = userCases.filter((c) => (c.content as { publicationMode?: string }).publicationMode === 'public').length;
  // Les notifs de type 'message' ne comptent pas ici — les messages ont leur propre compteur
  const unreadNotifCount = notifications.filter((n) => !n.read && n.type !== 'message').length;
  const unreadMsgCount = messages.filter((m) => !m.read).length;
  const totalUnread = unreadNotifCount + unreadMsgCount;

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

      {/* Onglets : participations, cas soumis, apprentissage, notifications */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setOnglet('participations')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-3 py-3 text-sm font-medium transition-colors',
              onglet === 'participations'
                ? 'text-teal-700 border-b-2 border-teal-600 bg-teal-50/50'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50',
            )}
          >
            <PenLine size={14} />
            <span className="hidden sm:inline">Participations</span>
          </button>
          <button
            onClick={() => setOnglet('cas')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-3 py-3 text-sm font-medium transition-colors',
              onglet === 'cas'
                ? 'text-teal-700 border-b-2 border-teal-600 bg-teal-50/50'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50',
            )}
          >
            <BookOpen size={14} />
            <span className="hidden sm:inline">Cas soumis</span>
          </button>
          <button
            onClick={() => setOnglet('apprentissage')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-3 py-3 text-sm font-medium transition-colors',
              onglet === 'apprentissage'
                ? 'text-teal-700 border-b-2 border-teal-600 bg-teal-50/50'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50',
            )}
          >
            <GraduationCap size={14} />
            <span className="hidden sm:inline">Apprentissage</span>
          </button>
          <button
            onClick={async () => {
              setOnglet('notifications');
              if (user && (unreadNotifCount > 0 || unreadMsgCount > 0)) {
                await Promise.all([
                  markAllNotifsRead(user.id),
                  markAllMessagesRead(user.id),
                ]);
                setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
                setMessages((prev) => prev.map((m) => ({ ...m, read: true })));
              }
            }}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-3 py-3 text-sm font-medium transition-colors relative',
              onglet === 'notifications'
                ? 'text-teal-700 border-b-2 border-teal-600 bg-teal-50/50'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50',
            )}
          >
            <Bell size={14} />
            <span className="hidden sm:inline">Notifications</span>
            {totalUnread > 0 && (
              <span className="absolute top-2 right-2 sm:static sm:ml-0 flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold">
                {totalUnread > 9 ? '9+' : totalUnread}
              </span>
            )}
          </button>
        </div>

        <div className="p-6">
          {/* Onglet participations (toutes — anonymes visibles uniquement par soi) */}
          {onglet === 'participations' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <PenLine size={16} className="text-teal-600" />
                  Mes participations
                </h2>
                <Link
                  href="/cas"
                  className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1 font-medium"
                >
                  <BookOpen size={13} />
                  Explorer les cas
                </Link>
              </div>

              {anonPart > 0 && (
                <div className="flex items-start gap-2 rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 mb-4 text-xs text-slate-500">
                  <EyeOff size={13} className="shrink-0 mt-0.5 text-slate-400" />
                  <p>Vos participations anonymes sont visibles <strong>uniquement par vous</strong>. Les autres membres ne les voient pas.</p>
                </div>
              )}

              {participations.length === 0 ? (
                <div className="rounded-xl border border-slate-200 p-8 text-center">
                  <PenLine size={24} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">
                    Aucune participation pour l&apos;instant.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {participations.map((p) => {
                    const isAnon = p.publicationMode !== 'public';
                    const cas = caseMap.get(p.caseId);
                    if (!cas) return null;
                    const isExpanded = expandedCards.has(p.id);
                    const toggleExpand = () => {
                      setExpandedCards((prev) => {
                        const next = new Set(prev);
                        if (next.has(p.id)) next.delete(p.id);
                        else next.add(p.id);
                        return next;
                      });
                    };
                    const hasAnalysis = !!(p.bilanEnergetique || p.strategie || (p.pointsProposer && p.pointsProposer.length > 0) || p.commentaireLibre);
                    return (
                      <div key={p.id} className={cn(
                        'bg-white rounded-xl border shadow-sm overflow-hidden',
                        isAnon ? 'border-slate-200 bg-slate-50/40' : 'border-slate-200',
                      )}>
                        {/* En-tête — toujours visible */}
                        <div className="p-4">
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
                                {isAnon ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                                    <EyeOff size={9} /> Anonyme
                                  </span>
                                ) : (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-100">
                                    Publique
                                  </span>
                                )}
                              </div>
                              {!isExpanded && p.bilanEnergetique && (
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
                                Voir le cas <ArrowRight size={11} />
                              </Link>
                            </div>
                          </div>

                          {/* Bouton déplier / replier */}
                          {hasAnalysis && (
                            <button
                              onClick={toggleExpand}
                              className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 hover:text-teal-600 transition-colors font-medium"
                            >
                              <ChevronDown size={13} className={cn('transition-transform', isExpanded && 'rotate-180')} />
                              {isExpanded ? 'Replier mon analyse' : 'Voir mon analyse complète'}
                            </button>
                          )}
                        </div>

                        {/* Contenu déplié — analyse complète */}
                        {isExpanded && hasAnalysis && (
                          <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-4 space-y-4">
                            {/* Grilles */}
                            {p.grilleChoisie && (
                              <div>
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Grille(s) de lecture</p>
                                <p className="text-xs text-slate-700">
                                  {getGrilleLabel(p.grilleChoisie)}
                                  {p.grilleSecondaire ? ` + ${getGrilleLabel(p.grilleSecondaire)}` : ''}
                                </p>
                              </div>
                            )}

                            {/* Bilan énergétique */}
                            {p.bilanEnergetique && (
                              <div>
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Bilan énergétique</p>
                                <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">{p.bilanEnergetique}</p>
                              </div>
                            )}

                            {/* Stratégie thérapeutique */}
                            {p.strategie && (
                              <div>
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Stratégie thérapeutique</p>
                                <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">{p.strategie}</p>
                              </div>
                            )}

                            {/* Points proposés */}
                            {p.pointsProposer && p.pointsProposer.length > 0 && (
                              <div>
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                                  <Target size={10} className="inline mr-1" />
                                  Points proposés ({p.pointsProposer.length})
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {p.pointsProposer.map((pt, i) => (
                                    <span
                                      key={i}
                                      className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-mono"
                                    >
                                      {pt.code ?? '?'}
                                      {pt.action && (
                                        <span className="text-slate-400 font-sans text-[10px]">{pt.action}</span>
                                      )}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Commentaire libre */}
                            {p.commentaireLibre && (
                              <div>
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Commentaire</p>
                                <p className="text-xs text-slate-600 italic whitespace-pre-line">{p.commentaireLibre}</p>
                              </div>
                            )}

                            {/* Annotations — compteur */}
                            {((p.annotationsInterrogatoire?.length ?? 0) + (p.annotationsPouls?.length ?? 0) + (p.annotationsLangue?.length ?? 0)) > 0 && (
                              <div className="flex gap-3 text-[10px] text-slate-400">
                                {(p.annotationsInterrogatoire?.length ?? 0) > 0 && (
                                  <span>{p.annotationsInterrogatoire!.length} annot. interrogatoire</span>
                                )}
                                {(p.annotationsPouls?.length ?? 0) > 0 && (
                                  <span>{p.annotationsPouls!.length} annot. pouls</span>
                                )}
                                {(p.annotationsLangue?.length ?? 0) > 0 && (
                                  <span>{p.annotationsLangue!.length} annot. langue</span>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
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
                          <Link
                            href={`/mes-cas/${c.id}/modifier`}
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors font-medium"
                          >
                            <PenLine size={12} />
                            Modifier
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

          {/* Onglet notifications */}
          {onglet === 'notifications' && (
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
                <Bell size={16} className="text-teal-600" />
                Notifications
              </h2>

              {/* Messages reçus */}
              {messages.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <MessageSquare size={12} /> Messages reçus
                  </p>
                  <div className="space-y-2">
                    {messages.map((msg) => (
                      <div key={msg.id} className={cn(
                        'rounded-xl border',
                        !msg.read ? 'border-teal-200 bg-teal-50/40' : 'border-slate-100',
                      )}>
                        <div className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                              {msg.senderPrenom?.charAt(0).toUpperCase() ?? '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Link
                                  href={`/membres/${msg.senderId}`}
                                  className="text-sm font-semibold text-slate-900 hover:text-teal-700 transition-colors"
                                >
                                  {msg.senderPrenom} {msg.senderNom}
                                </Link>
                                {!msg.read && (
                                  <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
                                )}
                              </div>
                              <p className="text-sm text-slate-700 whitespace-pre-wrap">{msg.content}</p>
                              <div className="flex items-center justify-between mt-2">
                                <p className="text-xs text-slate-400">
                                  {new Date(msg.createdAt).toLocaleDateString('fr-FR', {
                                    day: 'numeric', month: 'long', year: 'numeric',
                                    hour: '2-digit', minute: '2-digit',
                                  })}
                                </p>
                                <button
                                  onClick={() => {
                                    setReplyOpenId(replyOpenId === msg.id ? null : msg.id);
                                    setReplyText('');
                                    setReplySentId(null);
                                  }}
                                  className="flex items-center gap-1.5 text-xs text-teal-600 hover:text-teal-700 font-medium transition-colors"
                                >
                                  <Send size={11} />
                                  Répondre
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Formulaire de réponse inline */}
                        {replyOpenId === msg.id && (
                          <div className="border-t border-slate-100 px-4 py-3 bg-slate-50/60">
                            {replySentId === msg.id ? (
                              <p className="text-xs text-teal-600 font-medium py-1">Réponse envoyée ✓</p>
                            ) : (
                              <>
                                <textarea
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder={`Répondre à ${msg.senderPrenom}…`}
                                  rows={3}
                                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none bg-white"
                                />
                                <div className="flex justify-end gap-2 mt-2">
                                  <button
                                    onClick={() => { setReplyOpenId(null); setReplyText(''); }}
                                    className="text-xs text-slate-400 hover:text-slate-600 px-3 py-1.5 transition-colors"
                                  >
                                    Annuler
                                  </button>
                                  <button
                                    onClick={async () => {
                                      if (!user || !replyText.trim()) return;
                                      setReplySending(true);
                                      await sendMessage(
                                        user.id,
                                        user.prenom ?? '',
                                        user.nom ?? '',
                                        msg.senderId,
                                        replyText.trim(),
                                      );
                                      setReplySending(false);
                                      setReplySentId(msg.id);
                                      setReplyText('');
                                      setTimeout(() => {
                                        setReplyOpenId(null);
                                        setReplySentId(null);
                                      }, 2000);
                                    }}
                                    disabled={replySending || !replyText.trim()}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-500 transition-colors disabled:opacity-60"
                                  >
                                    {replySending ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />}
                                    Envoyer
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Votes sur analyses */}
              {notifications.filter((n) => n.type === 'vote_analyse').length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <ThumbsUp size={12} /> Validations reçues
                  </p>
                  <div className="space-y-2">
                    {notifications
                      .filter((n) => n.type === 'vote_analyse')
                      .map((n) => (
                        <div key={n.id} className={cn(
                          'rounded-xl border p-4',
                          !n.read ? 'border-amber-200 bg-amber-50/40' : 'border-slate-100',
                        )}>
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center shrink-0">
                              <ThumbsUp size={12} className="text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-slate-800">
                                <Link
                                  href={`/membres/${n.data.voterId}`}
                                  className="font-semibold hover:text-teal-700 transition-colors"
                                >
                                  {n.data.voterPrenom} {n.data.voterNom}
                                </Link>
                                {' '}a validé votre analyse sur{' '}
                                <Link
                                  href={`/cas/${n.data.caseId}`}
                                  className="text-teal-600 hover:text-teal-700 font-medium"
                                >
                                  {n.data.caseId}
                                </Link>
                              </p>
                              <p className="text-xs text-slate-400 mt-1">
                                {new Date(n.createdAt).toLocaleDateString('fr-FR', {
                                  day: 'numeric', month: 'long', year: 'numeric',
                                  hour: '2-digit', minute: '2-digit',
                                })}
                              </p>
                            </div>
                            {!n.read && <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {messages.length === 0 && notifications.filter((n) => n.type === 'vote_analyse').length === 0 && (
                <div className="text-center py-10">
                  <Bell size={28} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">Aucune notification pour l&apos;instant.</p>
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
                    const cas = caseMap.get(ex.caseId);
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

      {/* Confidentialité */}
      {(user.mail_public || user.telephone) && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={16} className="text-teal-600" />
            <h2 className="font-bold text-slate-900 text-base">Confidentialité</h2>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Contrôlez ce que les autres membres voient sur votre profil. Ces informations restent dans votre profil mais leur visibilité est limitée selon votre choix.
          </p>
          <div className="space-y-4">
            {user.mail_public && (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
                    <Mail size={13} className="text-slate-400" />
                    Adresse email publique
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{user.mail_public}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {showMail ? 'Visible par les autres membres.' : 'Masquée aux autres membres.'}
                  </p>
                </div>
                <button
                  onClick={() => { setShowMail((v) => !v); setPrivacySaved(false); }}
                  className={cn(
                    'relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none',
                    showMail ? 'bg-teal-600' : 'bg-slate-200',
                  )}
                  role="switch"
                  aria-checked={showMail}
                >
                  <span className={cn(
                    'inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
                    showMail ? 'translate-x-5' : 'translate-x-0',
                  )} />
                </button>
              </div>
            )}
            {user.telephone && (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
                    <Phone size={13} className="text-slate-400" />
                    Numéro de téléphone
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{user.telephone}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {showTelephone ? 'Visible par les autres membres.' : 'Masqué aux autres membres.'}
                  </p>
                </div>
                <button
                  onClick={() => { setShowTelephone((v) => !v); setPrivacySaved(false); }}
                  className={cn(
                    'relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none',
                    showTelephone ? 'bg-teal-600' : 'bg-slate-200',
                  )}
                  role="switch"
                  aria-checked={showTelephone}
                >
                  <span className={cn(
                    'inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
                    showTelephone ? 'translate-x-5' : 'translate-x-0',
                  )} />
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 mt-5 pt-4 border-t border-slate-100">
            <button
              onClick={async () => {
                setSavingPrivacy(true);
                await updatePrivacy(showMail, showTelephone);
                setSavingPrivacy(false);
                setPrivacySaved(true);
              }}
              disabled={savingPrivacy}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-500 transition-colors disabled:opacity-60"
            >
              {savingPrivacy ? <Loader2 size={13} className="animate-spin" /> : null}
              Enregistrer
            </button>
            {privacySaved && (
              <span className="text-xs text-teal-600 font-medium">Préférences enregistrées ✓</span>
            )}
          </div>
        </div>
      )}

      {/* Ressources */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Ressources</p>
        <Link
          href="/lexique"
          className="flex items-center gap-3 px-4 py-3 bg-white rounded-lg border border-slate-200 hover:border-teal-300 hover:shadow-sm transition-all group"
        >
          <Library size={16} className="text-teal-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 group-hover:text-teal-700">Lexique IEATC</p>
            <p className="text-xs text-slate-400">Glossaire des concepts et termes de l&apos;école</p>
          </div>
          <ArrowRight size={14} className="text-slate-300 group-hover:text-teal-500 shrink-0" />
        </Link>
      </div>
    </div>
  );
}

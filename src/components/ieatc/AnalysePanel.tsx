'use client';

// ─── Panneau d'analyse déverrouillée ──────────────────────────────────────────
// 3 formes d'analyse :
//   1. Participations brutes triées par valeur (votes), experts mis en avant
//   2. Synthèse intelligente : texte annoté + bilan/stratégie/points agrégés
//   3. Filtre par grille (UNION de 1 à 2 grilles)
//
// Système d'annotation : panneau latéral droit (clic), pas de popover hover.

import { useMemo, useState, useCallback } from 'react';
import type {
  UserParticipation,
  ClinicalCase,
  ReadingGridId,
  Annotation,
  Vote,
} from '@/types';
import { DIFFICULTE_LABELS, RATIO_STATUT } from '@/types';
import { GRILLES, getGrilleLabel } from '@/data/grilles';
import { GridBadge } from '@/components/ieatc/GridBadge';
import { VoteButton } from '@/components/ieatc/VoteButton';
import { cn } from '@/lib/utils';
import {
  Users,
  Sparkles,
  Filter,
  Award,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  ThumbsUp,
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/ui/Toast';
import {
  voteOnElement,
  unvoteOnElement,
  COST_ELEMENT,
} from '@/lib/vote-system';

// ─── Types internes ──────────────────────────────────────────────────────────

/** Commentaire d'annotation enrichi pour le panneau latéral */
interface AnnotationComment {
  annId: string;
  comment: string;
  author: string;
  participationId: string;
  voteCount: number;
  hasVoted: boolean;
  /** Passage original complet sélectionné par l'auteur */
  passage: string;
}

/** Sélection active d'un passage annoté */
interface AnnotationSelection {
  ids: string[];
}

// ─── Utilitaires ──────────────────────────────────────────────────────────────

function participationValeur(p: UserParticipation): number {
  return p.valeur ?? 1;
}

function isExpert(p: UserParticipation): boolean {
  const ext = p as UserParticipation & { role?: string; auteurStatut?: string };
  return ext.role === 'expert' || ext.auteurStatut === 'expert';
}

/** Médaille pour les 3 premiers commentaires (si > 0 votes) */
function medalEmoji(rank: number): string {
  if (rank === 0) return '\u{1F3C5}';
  if (rank === 1) return '\u{1F948}';
  if (rank === 2) return '\u{1F949}';
  return '';
}

// ─── Segmentation du texte par annotations ────────────────────────────────────

function buildSegments(text: string, annotations: Annotation[]) {
  if (annotations.length === 0) return [{ text, ids: [] as string[] }];
  const bp = new Set<number>([0, text.length]);
  for (const a of annotations) {
    bp.add(Math.max(0, a.start));
    bp.add(Math.min(text.length, a.start + a.length));
  }
  const sorted = [...bp].sort((a, b) => a - b);
  return sorted.slice(0, -1).map((s, i) => {
    const e = sorted[i + 1]!;
    const ids = annotations
      .filter((a) => a.start < e && a.start + a.length > s)
      .map((a) => a.id);
    return { text: text.slice(s, e), ids };
  });
}

// ─── Panneau latéral droit des annotations ────────────────────────────────────

function AnnotationSidePanel({
  selection,
  comments,
  onClose,
  onVote,
  onUnvote,
}: {
  selection: AnnotationSelection;
  comments: AnnotationComment[];
  onClose: () => void;
  onVote: (participationId: string, annId: string) => void;
  onUnvote: (participationId: string, annId: string) => void;
}) {
  // Animation "+1" : state temporaire par annId
  const [animating, setAnimating] = useState<Record<string, boolean>>({});
  const [showAll, setShowAll] = useState(false);

  // Trier par nombre de votes décroissant
  const sorted = useMemo(
    () => [...comments].sort((a, b) => b.voteCount - a.voteCount),
    [comments],
  );
  const visible = showAll ? sorted : sorted.slice(0, 3);
  const extraCount = Math.max(0, sorted.length - 3);

  const handleVoteClick = (c: AnnotationComment) => {
    if (c.hasVoted) {
      onUnvote(c.participationId, c.annId);
    } else {
      onVote(c.participationId, c.annId);
      // Déclencher animation "+1"
      setAnimating((prev) => ({ ...prev, [c.annId]: true }));
      setTimeout(() => {
        setAnimating((prev) => ({ ...prev, [c.annId]: false }));
      }, 650);
    }
  };

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/30 shadow-lg p-4 space-y-3 w-full max-w-sm">
      {/* Titre */}
      <p className="text-sm font-semibold text-slate-800 leading-snug">
        <span className="text-amber-600 mr-1">{'\u{1F4CC}'}</span>
        {comments.length} remarque{comments.length !== 1 ? 's' : ''} sur ce passage
      </p>

      {/* Commentaires en cards */}
      {visible.map((c, rank) => {
        const medal = c.voteCount > 0 ? medalEmoji(rank) : '';
        return (
          <div
            key={`${c.participationId}-${c.annId}`}
            className="rounded-lg border border-slate-200 bg-white shadow-sm p-3 space-y-2"
          >
            {/* Passage original sélectionné par l'auteur */}
            <p className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1 leading-snug border border-amber-100">
              &laquo;&nbsp;{c.passage.length > 120 ? c.passage.slice(0, 120) + '…' : c.passage}&nbsp;&raquo;
            </p>

            {/* En-tête : médaille + compteur de votes */}
            <div className="flex items-center gap-2 text-xs text-slate-500">
              {medal && <span className="text-base">{medal}</span>}
              <span className="font-semibold">
                {c.voteCount} vote{c.voteCount !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Commentaire */}
            <p className="text-sm text-slate-700 leading-snug">
              {c.comment
                ? c.comment.split('\n').map(l => l.trim()).filter(Boolean).join(' — ')
                : <em className="text-slate-400">(sans commentaire)</em>}
            </p>

            {/* Bouton de vote */}
            <div className="flex items-center justify-end gap-2">
              <div className="relative flex items-center gap-1.5">
                {/* Animation "+1" */}
                {animating[c.annId] && (
                  <span className="vote-pop absolute -top-4 left-0 text-green-600 font-bold text-sm pointer-events-none">
                    +1
                  </span>
                )}
                <span className={cn('text-sm font-semibold', animating[c.annId] && 'vote-bounce')}>
                  {c.voteCount}
                </span>
              </div>
              <button
                onClick={() => handleVoteClick(c)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                  c.hasVoted
                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                    : 'bg-slate-100 text-slate-500 hover:bg-teal-100 hover:text-teal-700',
                )}
              >
                <ThumbsUp
                  size={16}
                  fill={c.hasVoted ? 'currentColor' : 'none'}
                />
                {c.hasVoted ? 'Annuler' : 'Voter'}
              </button>
            </div>
          </div>
        );
      })}

      {extraCount > 0 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full text-xs text-teal-600 hover:text-teal-800 font-medium text-center py-1.5 rounded-lg hover:bg-teal-50 transition-colors cursor-pointer"
        >
          +{extraCount} autre{extraCount > 1 ? 's' : ''} — voir tout
        </button>
      )}
      {showAll && sorted.length > 3 && (
        <button
          onClick={() => setShowAll(false)}
          className="w-full text-xs text-slate-400 hover:text-slate-600 font-medium text-center py-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
        >
          Réduire
        </button>
      )}

      {visible.length === 0 && (
        <p className="text-xs text-slate-400 italic text-center py-2">
          Aucun commentaire sur ce passage.
        </p>
      )}

      {/* Bouton fermer */}
      <div className="flex justify-center pt-1">
        <button
          onClick={onClose}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors px-3 py-1.5 rounded-full border border-slate-200 hover:border-slate-300"
        >
          <X size={12} />
          Fermer
        </button>
      </div>
    </div>
  );
}

// ─── Texte annoté avec panneau latéral (clic) ─────────────────────────────────
// Remplace l'ancien AnnotatedReadText / StaticAnnotatedText à base de popovers.

function AnnotatedTextWithPanel({
  text,
  annotations,
  highlightClass = 'bg-teal-100 text-teal-900',
  allAnnotationsMeta,
  participations,
  onVote,
  borderClass,
}: {
  text: string;
  annotations: Annotation[];
  highlightClass?: string;
  /** Métadonnées enrichies de TOUTES les annotations (cross-participations) */
  allAnnotationsMeta: { ann: Annotation; author: string; valeur: number; participationId: string }[];
  participations: UserParticipation[];
  onVote: (updated: UserParticipation) => void;
  borderClass?: string;
}) {
  const { user, addVotePoints } = useAuth();
  const { show } = useToast();

  const [selection, setSelection] = useState<AnnotationSelection | null>(null);

  const segments = useMemo(() => buildSegments(text, annotations), [text, annotations]);

  // Clic sur un passage annoté → ouvre le panneau latéral
  const handleClick = useCallback(
    (ids: string[]) => {
      if (selection && selection.ids.join(',') === ids.join(',')) {
        setSelection(null);
        return;
      }
      setSelection({ ids });
    },
    [selection],
  );

  // Construire les commentaires pour le panneau latéral
  const panelComments = useMemo((): AnnotationComment[] => {
    if (!selection) return [];
    return allAnnotationsMeta
      .filter((x) => selection.ids.includes(x.ann.id))
      .map((x) => {
        const p = participations.find((pp) => pp.id === x.participationId);
        const allVotes = (p?.votes ?? []) as Vote[];
        const elemWeight = weightedVotes(
          allVotes.filter((v) => v.cible === 'element' && v.elementKey === `annotation:${x.ann.id}`),
        );
        const partWeight = weightedVotes(allVotes.filter((v) => v.cible === 'participation'));
        const voteCount = elemWeight + partWeight;
        const hasVoted =
          !!user &&
          allVotes.some(
            (v) =>
              v.voterId === user.id &&
              v.cible === 'element' &&
              v.elementKey === `annotation:${x.ann.id}`,
          );
        // Reconstituer le passage original complet de cette annotation
        const annStart = Math.max(0, x.ann.start);
        const annEnd = Math.min(text.length, x.ann.start + x.ann.length);
        const passage = text.slice(annStart, annEnd);

        return {
          annId: x.ann.id,
          comment: x.ann.comment ?? '',
          author: x.author,
          participationId: x.participationId,
          voteCount,
          hasVoted,
          passage,
        };
      });
  }, [selection, allAnnotationsMeta, participations, user]);

  // Vote sur une annotation
  const handleAnnotationVote = useCallback(
    async (participationId: string, annId: string) => {
      if (!user) {
        show('Connectez-vous pour voter', 'error');
        return;
      }
      const balance = user.votePoints ?? 0;
      if (balance < COST_ELEMENT) {
        show(`Solde insuffisant (${COST_ELEMENT} pt requis)`, 'error');
        return;
      }
      const participation = participations.find((p) => p.id === participationId);
      if (!participation) return;
      const result = await voteOnElement(participation, user, `annotation:${annId}`);
      if (!result.ok) {
        show(result.error ?? 'Vote impossible', 'error');
        return;
      }
      addVotePoints(-COST_ELEMENT);
      show(`-${COST_ELEMENT} pt, il vous reste ${balance - COST_ELEMENT}`, 'success');
      if (result.updated) onVote(result.updated);
    },
    [user, participations, addVotePoints, show, onVote],
  );

  // Annuler un vote sur une annotation
  const handleAnnotationUnvote = useCallback(
    async (participationId: string, annId: string) => {
      if (!user) return;
      const participation = participations.find((p) => p.id === participationId);
      if (!participation) return;
      const result = await unvoteOnElement(participation, user, `annotation:${annId}`);
      if (!result.ok) {
        show(result.error ?? 'Annulation impossible', 'error');
        return;
      }
      addVotePoints(COST_ELEMENT);
      show(`+${COST_ELEMENT} pt remboursé`, 'success');
      if (result.updated) onVote(result.updated);
    },
    [user, participations, addVotePoints, show, onVote],
  );

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Texte annoté */}
      <div
        className={cn(
          'flex-1 min-w-0 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap p-3 rounded-lg border',
          borderClass ?? 'border-slate-200 bg-slate-50',
        )}
      >
        {segments.map((seg, i) => {
          if (seg.ids.length === 0) return <span key={i}>{seg.text}</span>;
          const depth = Math.min(seg.ids.length, 3);
          const cls =
            depth === 1
              ? highlightClass
              : depth === 2
                ? highlightClass.replace('100', '200')
                : highlightClass.replace('100', '300');
          const isSelected =
            selection && seg.ids.some((id) => selection.ids.includes(id));
          return (
            <mark
              key={i}
              className={cn(
                'rounded-sm cursor-pointer transition-colors',
                isSelected ? 'bg-amber-200 text-amber-900' : cls,
                !isSelected && 'hover:brightness-90',
              )}
              onClick={() => handleClick(seg.ids)}
            >
              {seg.text}
            </mark>
          );
        })}
      </div>

      {/* Panneau latéral droit */}
      {selection && (
        <div className="w-full md:w-80 shrink-0">
          <AnnotationSidePanel
            selection={selection}
            comments={panelComments}
            onClose={() => setSelection(null)}
            onVote={handleAnnotationVote}
            onUnvote={handleAnnotationUnvote}
          />
        </div>
      )}
    </div>
  );
}

// ─── Forme 1 : Participations brutes ──────────────────────────────────────────

function AnalyseForme1({
  participations,
  onVote,
  interrogatoireText,
  poulsText,
}: {
  participations: UserParticipation[];
  onVote: (updated: UserParticipation) => void;
  interrogatoireText: string;
  poulsText: string;
}) {
  const [onlyExperts, setOnlyExperts] = useState(false);
  const list = useMemo(() => {
    const filtered = onlyExperts ? participations.filter(isExpert) : participations;
    return [...filtered].sort((a, b) => participationValeur(b) - participationValeur(a));
  }, [participations, onlyExperts]);

  return (
    <div className="space-y-4">
      <label className="inline-flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
        <input
          type="checkbox"
          checked={onlyExperts}
          onChange={(e) => setOnlyExperts(e.target.checked)}
          className="accent-amber-500"
        />
        <CheckCircle2 size={12} className="text-amber-500" />
        Analyses validées par les experts
      </label>

      {list.length === 0 && (
        <p className="text-sm text-slate-400 italic">Aucune participation pour l'instant.</p>
      )}

      {list.map((p, index) => (
        <ParticipationCard
          key={p.id}
          participation={p}
          rank={index}
          onVoted={onVote}
          interrogatoireText={interrogatoireText}
          poulsText={poulsText}
          allParticipations={participations}
        />
      ))}
    </div>
  );
}

// Labels de technique en toutes lettres
const TECHNIQUE_LABELS: Record<string, string> = {
  tonification: 'Tonifié',
  dispersion: 'Dispersé',
  neutre: 'Neutre',
  moxa: 'Moxa',
  moxa_tonification: 'Moxa + Tonifié',
  moxa_dispersion: 'Moxa + Dispersé',
  harmonisation: 'Harmonisé',
  tonification_chauffee: 'Tonifié chauffé',
  dispersion_chauffee: 'Dispersé chauffé',
  dispersion_puis_tonification: 'Dispersé puis Tonifié',
  gros_sel: 'Gros sel',
};

// ─── Carte de participation (Forme 1) ─────────────────────────────────────────

function ParticipationCard({
  participation: p,
  rank,
  onVoted,
  interrogatoireText,
  poulsText,
  allParticipations,
}: {
  participation: UserParticipation;
  rank?: number;
  onVoted: (u: UserParticipation) => void;
  interrogatoireText?: string;
  poulsText?: string;
  allParticipations?: UserParticipation[];
}) {
  const [expanded, setExpanded] = useState(false);
  const expert = isExpert(p);
  const pExt = p as UserParticipation & { auteurPseudo?: string; auteurStatut?: string };
  const bilanPoints = (p.bilanEnergetique ?? '')
    .split('\n')
    .map((l) => l.replace(/^\d+\.\s*/, '').trim())
    .filter(Boolean);
  const strategiePoints = (p.strategie ?? '')
    .split('\n')
    .map((l) => l.replace(/^\d+\.\s*/, '').trim())
    .filter(Boolean);
  const author = p.publicationMode === 'anonyme'
    ? 'Anonyme'
    : (pExt.auteurPseudo ?? `User ${(p.userId ?? p.id).slice(0, 6)}`);
  const pCa = p as UserParticipation & { grillePrincipale?: ReadingGridId; grillesSecondaires?: ReadingGridId[] };
  const grilleAffichee = p.grilleChoisie ?? pCa.grillePrincipale;
  const grilleSecAffichee = p.grilleSecondaire ?? pCa.grillesSecondaires?.[0];

  // Métadonnées d'annotations pour le panneau latéral (cette participation uniquement)
  const annMetaInterro = useMemo(() => {
    return (p.annotationsInterrogatoire ?? []).map((a) => ({
      ann: a,
      author,
      valeur: p.valeur ?? 1,
      participationId: p.id,
    }));
  }, [p, author]);

  const annMetaPouls = useMemo(() => {
    return (p.annotationsPouls ?? []).map((a) => ({
      ann: a,
      author,
      valeur: p.valeur ?? 1,
      participationId: p.id,
    }));
  }, [p, author]);

  const annMetaLangue = useMemo(() => {
    return (p.annotationsLangue ?? []).map((a) => ({
      ann: a,
      author,
      valeur: p.valeur ?? 1,
      participationId: p.id,
    }));
  }, [p, author]);

  // Participations pour le panneau latéral
  const participationsList = useMemo(
    () => allParticipations ?? [p],
    [allParticipations, p],
  );

  return (
    <div
      className={cn(
        'rounded-xl border bg-white overflow-hidden',
        expert ? 'border-amber-400' : 'border-slate-200',
      )}
    >
      {/* En-tête cliquable */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setExpanded((v) => !v)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpanded((v) => !v); } }}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors cursor-pointer',
          expert ? 'bg-amber-50/60 hover:bg-amber-50' : 'bg-white hover:bg-slate-50/80',
        )}
      >
        <span className="text-slate-400 shrink-0">
          {expanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {rank === 0 && <span className="text-base">🥇</span>}
            {rank === 1 && <span className="text-base">🥈</span>}
            {rank === 2 && <span className="text-base">🥉</span>}
            <span className="font-semibold text-sm text-slate-900">{author}</span>
            {expert && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500 text-white shrink-0">
                <Award size={9} /> EXPERT
              </span>
            )}
            {participationValeur(p) >= 50 && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 shrink-0">
                ✓ Qualifié apprentissage
              </span>
            )}
            {grilleAffichee && <GridBadge grilleId={grilleAffichee} size="sm" />}
            {grilleSecAffichee && <GridBadge grilleId={grilleSecAffichee} size="sm" />}
            {p.difficultéEstimee && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200 shrink-0">
                {DIFFICULTE_LABELS[p.difficultéEstimee]}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Valeur : {participationValeur(p).toFixed(2)} · {(p.votes ?? []).length} vote{(p.votes ?? []).length > 1 ? 's' : ''}
          </p>
        </div>

        <span onClick={(e) => e.stopPropagation()}>
          <VoteButton participation={p} onVoted={onVoted} size="sm" />
        </span>
      </div>

      {/* Contenu déplié */}
      {expanded && (
        <div className={cn('px-4 pb-4 pt-2 space-y-4 border-t', expert ? 'border-amber-100' : 'border-slate-100')}>

          {/* Grilles choisies */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1">Grilles de lecture</p>
            <div className="flex gap-2 flex-wrap">
              {grilleAffichee && <GridBadge grilleId={grilleAffichee} size="sm" />}
              {grilleSecAffichee && <GridBadge grilleId={grilleSecAffichee} size="sm" />}
              {!grilleAffichee && <span className="text-xs text-slate-400 italic">Non précisé</span>}
            </div>
          </div>

          {/* Interrogatoire annoté — panneau latéral */}
          {interrogatoireText && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1.5">
                Interrogatoire
                {(p.annotationsInterrogatoire ?? []).length > 0 && (
                  <span className="ml-2 font-normal normal-case text-slate-400">(cliquez sur les passages surlignés)</span>
                )}
              </p>
              <AnnotatedTextWithPanel
                text={interrogatoireText}
                annotations={p.annotationsInterrogatoire ?? []}
                highlightClass="bg-teal-100 text-teal-900"
                allAnnotationsMeta={annMetaInterro}
                participations={participationsList}
                onVote={onVoted}
              />
            </div>
          )}

          {/* Langue annotée — panneau latéral */}
          {p.langueTexte && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1.5">
                Langue & examens
                {(p.annotationsLangue ?? []).length > 0 && (
                  <span className="ml-2 font-normal normal-case text-slate-400">(cliquez sur les passages surlignés)</span>
                )}
              </p>
              <AnnotatedTextWithPanel
                text={p.langueTexte}
                annotations={p.annotationsLangue ?? []}
                highlightClass="bg-violet-100 text-violet-900"
                allAnnotationsMeta={annMetaLangue}
                participations={participationsList}
                onVote={onVoted}
                borderClass="border-violet-100 bg-violet-50/30"
              />
            </div>
          )}

          {/* Pouls annotés — panneau latéral */}
          {poulsText && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1.5">
                Pouls
                {(p.annotationsPouls ?? []).length > 0 && (
                  <span className="ml-2 font-normal normal-case text-slate-400">(cliquez sur les passages surlignés)</span>
                )}
              </p>
              <AnnotatedTextWithPanel
                text={poulsText}
                annotations={p.annotationsPouls ?? []}
                highlightClass="bg-indigo-100 text-indigo-900"
                allAnnotationsMeta={annMetaPouls}
                participations={participationsList}
                onVote={onVoted}
                borderClass="border-indigo-100 bg-indigo-50/40"
              />
            </div>
          )}

          {/* Bilan énergétique */}
          {(p.bilanEnergetique ?? '').trim() && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1">
                Bilan énergétique
              </p>
              <ul className="space-y-1">
                {bilanPoints.map((b, i) => (
                  <li key={i} className="flex items-start justify-between gap-2 text-sm text-slate-700">
                    <span>{i + 1}. {b}</span>
                    <span onClick={(e) => e.stopPropagation()}>
                      <VoteButton participation={p} elementKey={`bilan:${i}`} onVoted={onVoted} size="sm" label="" />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Stratégie */}
          {(p.strategie ?? '').trim() && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1">
                Stratégie thérapeutique
              </p>
              <ul className="space-y-1">
                {strategiePoints.map((s, i) => (
                  <li key={i} className="flex items-start justify-between gap-2 text-sm text-slate-700">
                    <span>{i + 1}. {s}</span>
                    <span onClick={(e) => e.stopPropagation()}>
                      <VoteButton participation={p} elementKey={`strategie:${i}`} onVoted={onVoted} size="sm" label="" />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Points proposés */}
          {p.pointsProposer && p.pointsProposer.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1">
                Points proposés
              </p>
              <div className="space-y-1.5">
                {p.pointsProposer.map((pt, i) => {
                  const techniqueLabel =
                    TECHNIQUE_LABELS[pt.technique ?? ''] ??
                    TECHNIQUE_LABELS[pt.action ?? ''] ??
                    pt.technique ??
                    pt.action ??
                    '';
                  return (
                    <div
                      key={i}
                      className="flex items-start justify-between gap-2 rounded border border-slate-100 bg-slate-50 px-2.5 py-1.5"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="font-mono font-semibold text-sm text-slate-800">
                          {pt.code}
                        </span>
                        {techniqueLabel && (
                          <span className="ml-1.5 text-xs text-indigo-600 font-medium">
                            — {techniqueLabel}
                          </span>
                        )}
                        {pt.justification && (
                          <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                            {pt.justification}
                          </p>
                        )}
                      </div>
                      <span onClick={(e) => e.stopPropagation()}>
                        <VoteButton participation={p} elementKey={`point:${pt.code}`} onVoted={onVoted} size="sm" label="" />
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Commentaire libre */}
          {p.commentaireLibre && (
            <p className="pt-2 border-t border-slate-100 text-xs italic text-slate-500">
              &laquo; {p.commentaireLibre} &raquo;
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Texte de pouls aplati ───────────────────────────────────────────────────

function buildPoulsText(cas: ClinicalCase): string {
  return cas.content.prisePouls.lectures
    .map((l) => `${l.positionLabel ?? l.position} — ${l.qualites.join(', ')}`)
    .join('\n');
}

// ─── Forme 2 : Synthèse intelligente ──────────────────────────────────────────

/** Somme pondérée d'un sous-ensemble de votes (applique RATIO_STATUT). */
function weightedVotes(votes: Vote[]): number {
  return votes.reduce((acc, v) => acc + (RATIO_STATUT[v.voterStatut] ?? 1), 0);
}

interface AggItem {
  text: string;
  total: number;
  count: number;
  votes: number;  // poids pondéré par statut (expert = 10, étudiant = 1…)
}

function aggregate(
  participations: UserParticipation[],
  extract: (p: UserParticipation) => string[],
  elementKeyFn?: (index: number, text: string) => string,
): AggItem[] {
  const map = new Map<string, AggItem>();
  for (const p of participations) {
    const valeur = participationValeur(p);
    const allVotes = p.votes ?? [];
    const partWeight = weightedVotes(allVotes.filter((v) => v.cible === 'participation'));
    const items = extract(p);
    for (let i = 0; i < items.length; i++) {
      const t = items[i]!;
      const key = t.trim().toLowerCase();
      if (!key) continue;
      let elemWeight = 0;
      if (elementKeyFn) {
        const ek = elementKeyFn(i, t.trim());
        elemWeight = weightedVotes(
          allVotes.filter((v) => v.cible === 'element' && v.elementKey === ek),
        );
      }
      const itemWeight = partWeight + elemWeight;
      const cur = map.get(key);
      if (cur) {
        cur.total += valeur;
        cur.count += 1;
        cur.votes += itemWeight;
      } else {
        map.set(key, { text: t.trim(), total: valeur, count: 1, votes: itemWeight });
      }
    }
  }
  return [...map.values()].sort(
    (a, b) => (b.count + b.votes) - (a.count + a.votes) || b.total - a.total,
  );
}

function AnalyseForme2({
  cas,
  participations,
  onVote,
}: {
  cas: ClinicalCase;
  participations: UserParticipation[];
  onVote: (updated: UserParticipation) => void;
}) {
  // Texte aplati de l'interrogatoire
  const interrogatoireText = useMemo(
    () =>
      [
        cas.content.motif,
        ...cas.content.interrogatoire.map((i) => `${i.cle} : ${i.valeur}`),
        cas.content.contexteVie ?? '',
        cas.content.antecedents ?? '',
      ]
        .filter(Boolean)
        .join('\n\n'),
    [cas],
  );

  // Annotations communautaires — interrogatoire
  const allAnnotations = useMemo(() => {
    const arr: { ann: Annotation; author: string; valeur: number; participationId: string }[] = [];
    for (const p of participations) {
      for (const a of p.annotationsInterrogatoire ?? []) {
        arr.push({
          ann: a,
          author: p.publicationMode === 'anonyme' ? 'Anonyme' : p.userId,
          valeur: p.valeur ?? 1,
          participationId: p.id,
        });
      }
    }
    return arr;
  }, [participations]);

  // Texte pouls
  const poulsText = useMemo(() => buildPoulsText(cas), [cas]);

  // Annotations communautaires — pouls
  const allAnnotationsPouls = useMemo(() => {
    const arr: { ann: Annotation; author: string; valeur: number; participationId: string }[] = [];
    for (const p of participations) {
      for (const a of p.annotationsPouls ?? []) {
        arr.push({
          ann: a,
          author: p.publicationMode === 'anonyme' ? 'Anonyme' : p.userId,
          valeur: p.valeur ?? 1,
          participationId: p.id,
        });
      }
    }
    return arr;
  }, [participations]);

  // Texte langue
  const langueTexteCas = useMemo(() => {
    const officielle = cas.analyses.find((a) => a.type === 'officielle');
    if (officielle?.langueTexte) return officielle.langueTexte;
    const withLangue = participations.find((p) => p.langueTexte);
    return withLangue?.langueTexte ?? null;
  }, [cas, participations]);

  // Annotations communautaires — langue
  const allAnnotationsLangue = useMemo(() => {
    const arr: { ann: Annotation; author: string; valeur: number; participationId: string }[] = [];
    for (const p of participations) {
      for (const a of p.annotationsLangue ?? []) {
        arr.push({
          ann: a,
          author: p.publicationMode === 'anonyme' ? 'Anonyme' : p.userId,
          valeur: p.valeur ?? 1,
          participationId: p.id,
        });
      }
    }
    return arr;
  }, [participations]);

  // Toutes les annotations aplaties
  const allAnns = useMemo(() => allAnnotations.map((x) => x.ann), [allAnnotations]);
  const allAnnsPouls = useMemo(() => allAnnotationsPouls.map((x) => x.ann), [allAnnotationsPouls]);
  const allAnnsLangue = useMemo(() => allAnnotationsLangue.map((x) => x.ann), [allAnnotationsLangue]);

  // Agrégats
  const bilanAgg = useMemo(
    () =>
      aggregate(
        participations,
        (p) =>
          (p.bilanEnergetique ?? '')
            .split('\n')
            .map((l) => l.replace(/^\d+\.\s*/, '').trim())
            .filter(Boolean),
        (i) => `bilan:${i}`,
      ),
    [participations],
  );
  const strategieAgg = useMemo(
    () =>
      aggregate(
        participations,
        (p) =>
          (p.strategie ?? '')
            .split('\n')
            .map((l) => l.replace(/^\d+\.\s*/, '').trim())
            .filter(Boolean),
        (i) => `strategie:${i}`,
      ),
    [participations],
  );
  const pointsAgg = useMemo(
    () =>
      aggregate(
        participations,
        (p) =>
          (p.pointsProposer ?? [])
            .map((pt) => pt.code ?? '')
            .filter(Boolean),
        (_i, code) => `point:${code}`,
      ),
    [participations],
  );

  const TECHNIQUE_ABBREV: Record<string, string> = {
    tonification: 't',
    dispersion: 'd',
    harmonisation: 'h',
    tonification_chauffee: 't ch',
    dispersion_puis_tonification: 'd\u2192t',
  };

  const pointsTechniqueMap = useMemo(() => {
    const map = new Map<string, Map<string, number>>();
    for (const p of participations) {
      for (const pt of p.pointsProposer ?? []) {
        const code = (pt.code ?? '').trim().toLowerCase();
        if (!code) continue;
        const technique = (pt.action ?? pt.technique ?? '') as string;
        if (!technique) continue;
        if (!map.has(code)) map.set(code, new Map());
        const techMap = map.get(code)!;
        techMap.set(technique, (techMap.get(technique) ?? 0) + 1);
      }
    }
    return map;
  }, [participations]);

  return (
    <div className="space-y-5">
      {/* Texte annoté — Interrogatoire */}
      <div>
        <h4 className="text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
          Interrogatoire — commentaires communautaires
        </h4>
        <AnnotatedTextWithPanel
          text={interrogatoireText}
          annotations={allAnns}
          highlightClass="bg-teal-100 text-teal-900"
          allAnnotationsMeta={allAnnotations}
          participations={participations}
          onVote={onVote}
          borderClass="border-slate-200 bg-slate-50"
        />
      </div>

      {/* Pouls — annotations communautaires */}
      <div>
        <h4 className="text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
          Pouls — commentaires communautaires
        </h4>
        {cas.content.prisePouls.condition && (
          <p className="text-xs text-slate-400 italic mb-1">{cas.content.prisePouls.condition}</p>
        )}
        <AnnotatedTextWithPanel
          text={poulsText}
          annotations={allAnnsPouls}
          highlightClass="bg-indigo-100 text-indigo-900"
          allAnnotationsMeta={allAnnotationsPouls}
          participations={participations}
          onVote={onVote}
          borderClass="border-indigo-100 bg-indigo-50/40"
        />
        {cas.content.prisePouls.synthese && (
          <p className="mt-2 text-xs text-slate-500 italic border-l-2 border-indigo-200 pl-3">
            {cas.content.prisePouls.synthese}
          </p>
        )}
        {allAnnotationsPouls.length === 0 && (
          <p className="text-xs text-slate-400 italic mt-1">
            Aucun commentaire communautaire sur les pouls.
          </p>
        )}
      </div>

      {/* Langue & examens — annotations communautaires */}
      <div>
        <h4 className="text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
          Langue & examens — commentaires communautaires
        </h4>
        {langueTexteCas ? (
          <>
            <AnnotatedTextWithPanel
              text={langueTexteCas}
              annotations={allAnnsLangue}
              highlightClass="bg-amber-100 text-amber-900"
              allAnnotationsMeta={allAnnotationsLangue}
              participations={participations}
              onVote={onVote}
              borderClass="border-amber-100 bg-amber-50/30"
            />
            {allAnnotationsLangue.length === 0 && (
              <p className="text-xs text-slate-400 italic mt-1">
                Aucun commentaire communautaire sur la langue.
              </p>
            )}
          </>
        ) : (
          <p className="text-xs text-slate-400 italic p-3 rounded-lg border border-slate-200 bg-slate-50">
            Aucune donnée de langue dans ce cas.
          </p>
        )}
      </div>

      {/* Agrégats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AggColumn title="Bilan énergétique (agrégé)" items={bilanAgg} />
        <AggColumn title="Stratégie (agrégée)" items={strategieAgg} />
        <AggColumn
          title="Points proposés (agrégés)"
          items={pointsAgg}
          mono
          techniqueMap={pointsTechniqueMap}
          techniqueAbbrev={TECHNIQUE_ABBREV}
        />
      </div>
    </div>
  );
}

function AggColumn({
  title,
  items,
  mono,
  techniqueMap,
  techniqueAbbrev,
}: {
  title: string;
  items: AggItem[];
  mono?: boolean;
  techniqueMap?: Map<string, Map<string, number>>;
  techniqueAbbrev?: Record<string, string>;
}) {
  const MAX_VISIBLE = 4;
  const [expanded, setExpanded] = useState(false);
  const visibleItems = expanded ? items : items.slice(0, MAX_VISIBLE);
  const hiddenCount = items.length - MAX_VISIBLE;

  const techniqueLabel = (code: string): string | null => {
    if (!techniqueMap || !techniqueAbbrev) return null;
    const techCounts = techniqueMap.get(code.trim().toLowerCase());
    if (!techCounts || techCounts.size === 0) return null;
    const total = [...techCounts.values()].reduce((a, b) => a + b, 0);
    const sorted = [...techCounts.entries()].sort((a, b) => b[1] - a[1]);
    return sorted
      .map(([tech, count]) => {
        const pct = Math.round((count / total) * 100);
        const abbr = techniqueAbbrev[tech] ?? tech;
        return `${abbr} : ${pct}%`;
      })
      .join(' / ');
  };

  return (
    <div>
      <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2">
        {title}
      </h5>
      {items.length === 0 ? (
        <p className="text-xs text-slate-400 italic">Aucun élément.</p>
      ) : (
        <div className="space-y-1.5">
          {visibleItems.map((it, i) => {
            const techStr = techniqueMap ? techniqueLabel(it.text) : null;
            const score = it.count + it.votes;
            const maxScore = items[0] ? items[0].count + items[0].votes : 1;
            const barPct = Math.round((score / Math.max(maxScore, 1)) * 100);
            return (
              <div
                key={i}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm relative overflow-hidden"
              >
                {/* Barre de fond proportionnelle au score */}
                <div
                  className="absolute inset-y-0 left-0 bg-teal-50/60 transition-all"
                  style={{ width: `${barPct}%` }}
                />
                <div className="relative flex items-center gap-2">
                  <span className={cn('text-slate-700 flex-1 min-w-0 truncate', mono && 'font-mono text-xs')}>{it.text}</span>
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500 shrink-0" title={`${it.count} analyse${it.count > 1 ? 's' : ''}`}>
                    <Users size={10} />
                    {it.count}
                  </span>
                  {it.votes > 0 && (
                    <span className="inline-flex items-center gap-0.5 text-xs text-amber-600 shrink-0" title={`Poids votes : ${Math.round(it.votes * 10) / 10} (pondéré par statut)`}>
                      <ThumbsUp size={10} fill="currentColor" />
                      {Math.round(it.votes * 10) / 10}
                    </span>
                  )}
                  <span className="text-xs font-bold text-teal-700 shrink-0 ml-1" title="Score = analyses + votes pondérés">
                    {Math.round(score * 10) / 10}
                  </span>
                </div>
                {techStr && (
                  <span className="relative block text-[10px] text-slate-500 mt-0.5">
                    {techStr}
                  </span>
                )}
              </div>
            );
          })}
          {hiddenCount > 0 && !expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="text-xs text-teal-600 hover:text-teal-700 font-medium px-1 py-1"
            >
              Voir plus ({hiddenCount} autre{hiddenCount > 1 ? 's' : ''})
            </button>
          )}
          {expanded && hiddenCount > 0 && (
            <button
              onClick={() => setExpanded(false)}
              className="text-xs text-slate-500 hover:text-slate-700 font-medium px-1 py-1"
            >
              Réduire
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Forme 3 : Filtre par grille (UNION max 2) ────────────────────────────────

function AnalyseForme3({
  cas,
  participations,
  onVote,
}: {
  cas: ClinicalCase;
  participations: UserParticipation[];
  onVote: (updated: UserParticipation) => void;
}) {
  const [selected, setSelected] = useState<ReadingGridId[]>([]);

  const toggle = (g: ReadingGridId) => {
    setSelected((prev) => {
      if (prev.includes(g)) return prev.filter((x) => x !== g);
      if (prev.length >= 2) return [prev[1]!, g];
      return [...prev, g];
    });
  };

  const filtered = useMemo(() => {
    if (selected.length === 0) return participations;
    return participations.filter((p) => {
      const pCa = p as UserParticipation & {
        grillePrincipale?: ReadingGridId;
        grillesSecondaires?: ReadingGridId[];
      };
      const g1 = p.grilleChoisie ?? pCa.grillePrincipale;
      const g2 = p.grilleSecondaire ?? pCa.grillesSecondaires?.[0];
      return (g1 && selected.includes(g1)) || (g2 && selected.includes(g2));
    });
  }, [participations, selected]);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-slate-500 mb-2">
          Sélectionnez 1 ou 2 grilles (UNION — participations utilisant l'une OU l'autre).
        </p>
        <div className="flex flex-wrap gap-2">
          {GRILLES.map((g) => {
            const active = selected.includes(g.id);
            return (
              <button
                key={g.id}
                onClick={() => toggle(g.id)}
                className={cn(
                  'text-xs px-3 py-1.5 rounded-full border-2 font-medium transition-all',
                  active
                    ? cn(g.colorClass, g.textClass, 'border-transparent')
                    : 'border-slate-200 text-slate-600 hover:border-slate-300',
                )}
              >
                {g.nomCourt}
              </button>
            );
          })}
        </div>
        {selected.length > 0 && (
          <p className="text-xs text-slate-500 mt-2">
            {filtered.length} participation{filtered.length > 1 ? 's' : ''} correspond
            {filtered.length > 1 ? 'ent' : ''} à{' '}
            <span className="font-semibold">
              {selected.map((g) => getGrilleLabel(g)).join(' ou ')}
            </span>
            .
          </p>
        )}
      </div>
      <AnalyseForme2 cas={cas} participations={filtered} onVote={onVote} />
    </div>
  );
}

// ─── Panneau principal (onglets) ──────────────────────────────────────────────

type FormeId = 'forme1' | 'forme2' | 'forme3';

export function AnalysePanel({
  cas,
  participations,
  onVote,
}: {
  cas: ClinicalCase;
  participations: UserParticipation[];
  onVote: (updated: UserParticipation) => void;
}) {
  const [forme, setForme] = useState<FormeId>('forme1');

  const interrogatoireText = useMemo(
    () =>
      [
        cas.content.motif,
        ...cas.content.interrogatoire.map((i) => `${i.cle} : ${i.valeur}`),
        cas.content.contexteVie ?? '',
        cas.content.antecedents ?? '',
      ]
        .filter(Boolean)
        .join('\n\n'),
    [cas],
  );

  const poulsTextFlat = useMemo(() => buildPoulsText(cas), [cas]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 bg-gradient-to-r from-teal-600 to-teal-700 flex items-center gap-3">
        <Sparkles size={15} className="text-teal-100" />
        <h2 className="text-white font-bold text-sm">Analyse déverrouillée</h2>
        <span className="ml-auto text-teal-100 text-xs">
          {participations.length} participation{participations.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex border-b border-slate-200">
        <TabButton active={forme === 'forme1'} onClick={() => setForme('forme1')} icon={<Users size={13} />}>
          Participations
        </TabButton>
        <TabButton active={forme === 'forme2'} onClick={() => setForme('forme2')} icon={<Sparkles size={13} />}>
          Synthèse
        </TabButton>
        <TabButton active={forme === 'forme3'} onClick={() => setForme('forme3')} icon={<Filter size={13} />}>
          Filtre par grille
        </TabButton>
      </div>

      <div className="p-5">
        {forme === 'forme1' && (
          <AnalyseForme1
            participations={participations}
            onVote={onVote}
            interrogatoireText={interrogatoireText}
            poulsText={poulsTextFlat}
          />
        )}
        {forme === 'forme2' && <AnalyseForme2 cas={cas} participations={participations} onVote={onVote} />}
        {forme === 'forme3' && <AnalyseForme3 cas={cas} participations={participations} onVote={onVote} />}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-1 flex items-center justify-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors',
        active
          ? 'text-teal-700 border-b-2 border-teal-600 bg-teal-50/50'
          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50',
      )}
    >
      {icon}
      {children}
    </button>
  );
}

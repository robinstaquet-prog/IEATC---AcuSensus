'use client';

// ─── VoteButton — bouton 👍 pour voter sur un élément ou une participation ───
// Coût : 1 pt pour un élément, 2 pts pour la participation entière.

import { ThumbsUp } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/ui/Toast';
import {
  voteOnElement,
  voteOnParticipation,
  unvoteOnParticipation,
  COST_ELEMENT,
  COST_PARTICIPATION,
} from '@/lib/vote-system';
import type { UserParticipation } from '@/types';
import { cn } from '@/lib/utils';

interface VoteButtonProps {
  participation: UserParticipation;
  /** Si fourni, vote sur un élément précis. Sinon, vote sur la participation entière. */
  elementKey?: string;
  label?: string;
  size?: 'sm' | 'md';
  /** Appelé après un vote réussi (pour forcer un refresh). */
  onVoted?: (updated: UserParticipation) => void;
  className?: string;
}

export function VoteButton({
  participation,
  elementKey,
  label,
  size = 'sm',
  onVoted,
  className,
}: VoteButtonProps) {
  const { user, addVotePoints } = useAuth();
  const { show } = useToast();

  const cost = elementKey ? COST_ELEMENT : COST_PARTICIPATION;
  const balance = user?.votePoints ?? 0;
  const canVote = !!user && balance >= cost;

  // Compte combien de votes s'appliquent déjà (utile pour l'affichage)
  const votes = participation.votes ?? [];
  const count = elementKey
    ? votes.filter(
        (v) => v.cible === 'participation' || v.elementKey === elementKey,
      ).length
    : votes.filter((v) => v.cible === 'participation').length;

  const hasUserVotedOnParticipation = !elementKey && !!user && votes.some(
    (v) => v.voterId === user.id && v.cible === 'participation',
  );

  const handleClick = async () => {
    if (!user) {
      show('Connectez-vous pour voter', 'error');
      return;
    }
    if (!elementKey && hasUserVotedOnParticipation) {
      const result = await unvoteOnParticipation(participation, user);
      if (!result.ok) {
        show(result.error ?? 'Annulation impossible', 'error');
        return;
      }
      addVotePoints(cost); // remboursement
      show(`+${cost} pts remboursés`, 'success');
      if (result.updated) onVoted?.(result.updated);
      return;
    }
    if (!canVote) {
      show(`Solde insuffisant (${cost} pt requis)`, 'error');
      return;
    }
    const result = elementKey
      ? await voteOnElement(participation, user, elementKey)
      : await voteOnParticipation(participation, user);
    if (!result.ok) {
      show(result.error ?? 'Vote impossible', 'error');
      return;
    }
    addVotePoints(-cost);
    show(`−${cost} pt · il vous reste ${balance - cost}`, 'success');
    if (result.updated) onVoted?.(result.updated);
  };

  return (
    <button
      onClick={handleClick}
      disabled={!hasUserVotedOnParticipation && !canVote}
      title={
        elementKey
          ? `Voter pour cet élément (${cost} pt)`
          : hasUserVotedOnParticipation
          ? 'Annuler votre validation'
          : `Valider toute cette participation (${cost} pts)`
      }
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium transition-colors',
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1.5',
        hasUserVotedOnParticipation
          ? 'bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200'
          : canVote
          ? 'border-teal-200 text-teal-700 bg-teal-50 hover:bg-teal-100'
          : 'border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed',
        className,
      )}
    >
      <ThumbsUp size={size === 'sm' ? 11 : 13} fill={hasUserVotedOnParticipation ? 'currentColor' : 'none'} />
      {label ?? (elementKey ? `+1` : hasUserVotedOnParticipation ? `Validé ✓` : `Valider (2 pts)`)}
      {count > 0 && (
        <span className="text-[10px] font-semibold text-teal-600">· {count}</span>
      )}
    </button>
  );
}

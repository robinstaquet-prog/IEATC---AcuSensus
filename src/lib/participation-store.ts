'use client';

// ─── Store de participation — localStorage (MVP) ──────────────────────────────
// MVP : stockage local dans le navigateur de l'utilisateur.
// Production : remplacer par appels Supabase avec RLS strict.
// La couche d'abstraction est là : les composants utilisent ces fonctions,
// pas directement localStorage ou Supabase.

import type { UserParticipation, DifficulteEstimee } from '@/types';
import { DIFFICULTE_LABELS, RATIO_STATUT } from '@/types';

const STORAGE_KEY = 'acusensus:participations';

function getAll(): UserParticipation[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UserParticipation[]) : [];
  } catch {
    return [];
  }
}

function saveAll(participations: UserParticipation[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(participations));
}

export function getParticipation(
  userId: string,
  caseId: string,
): UserParticipation | undefined {
  return getAll().find((p) => p.userId === userId && p.caseId === caseId);
}

export function getAllParticipations(userId: string): UserParticipation[] {
  return getAll().filter((p) => p.userId === userId);
}

export function upsertParticipation(
  userId: string,
  data: Partial<UserParticipation> & { caseId: string },
): UserParticipation {
  const all = getAll();
  const idx = all.findIndex((p) => p.userId === userId && p.caseId === data.caseId);
  const now = new Date().toISOString();

  if (idx >= 0) {
    all[idx] = { ...all[idx], ...data, userId, updatedAt: now };
    saveAll(all);
    return all[idx]!;
  }

  const newP: UserParticipation = {
    id: `p-${Date.now()}`,
    userId,
    caseId: data.caseId,
    grilleChoisie: data.grilleChoisie,
    grilleSecondaire: data.grilleSecondaire,
    polariteIdentifiee: data.polariteIdentifiee,
    localisationIdentifiee: data.localisationIdentifiee,
    categoriesRetenues: data.categoriesRetenues ?? [],
    pointsProposer: data.pointsProposer ?? [],
    commentaireLibre: data.commentaireLibre,
    revelationFaite: data.revelationFaite ?? false,
    createdAt: now,
    updatedAt: now,
    annotationsInterrogatoire: data.annotationsInterrogatoire,
    annotationsPouls: data.annotationsPouls,
    langueTexte: data.langueTexte,
    annotationsLangue: data.annotationsLangue,
    examensSupp: data.examensSupp,
    palpationAbdo: data.palpationAbdo,
    bilanEnergetique: data.bilanEnergetique,
    strategie: data.strategie,
    deuxiemeSeance: data.deuxiemeSeance,
    publicationMode: data.publicationMode,
    publiee: data.publiee,
    votes: data.votes,
    votePoints: data.votePoints,
    valeur: data.valeur,
    difficultéEstimee: data.difficultéEstimee,
  };
  saveAll([...all, newP]);
  return newP;
}

// Toutes les participations associées à un cas (tous utilisateurs confondus).
// MVP : utilisé pour afficher la forme 1 (toutes les participations triées par valeur).
export function getParticipationsByCase(caseId: string): UserParticipation[] {
  return getAll().filter((p) => p.caseId === caseId);
}

// Met à jour directement une participation existante par id (pour les votes).
export function updateParticipationById(
  id: string,
  patch: Partial<UserParticipation>,
): UserParticipation | undefined {
  const all = getAll();
  const idx = all.findIndex((p) => p.id === id);
  if (idx === -1) return undefined;
  all[idx] = { ...all[idx]!, ...patch, updatedAt: new Date().toISOString() };
  saveAll(all);
  return all[idx]!;
}

// ─── Qualification "cas d'apprentissage" ─────────────────────────────────────
// Un cas est "d'apprentissage" si :
//   1. Il a au moins une analyse de type expert (role/auteurStatut = 'expert'), OU
//   2. Il a au moins une participation avec valeur >= 50 (très populaire), OU
//   3. Une participation a reçu un vote à ratio 10 (vote expert)
import type { ClinicalCase } from '@/types';

export function isCasApprentissage(
  cas: ClinicalCase,
  participations: UserParticipation[],
): boolean {
  // Condition 1 : cas explicitement marqué exemplaire
  if (cas.exemplaire) return true;

  // Condition 2 : au moins une analyse VARIANTE d'expert
  // (l'analyse officielle ne compte pas — elle existe pour tous les cas)
  const hasExpertVariante =
    cas.analyses.some(
      (a) => a.type !== 'officielle' && (a.role === 'expert' || a.auteurStatut === 'expert'),
    ) ||
    participations.some(
      (p) =>
        (p as UserParticipation & { role?: string }).role === 'expert' ||
        (p as UserParticipation & { auteurStatut?: string }).auteurStatut === 'expert',
    );
  if (hasExpertVariante) return true;

  // Condition 3 : participation très populaire (valeur >= 50)
  const hasPopular = participations.some((p) => (p.valeur ?? 0) >= 50);
  if (hasPopular) return true;

  // Condition 4 : un vote expert (ratio 10) dans les votes d'une participation
  const hasExpertVote = participations.some((p) =>
    (p.votes ?? []).some((v) => RATIO_STATUT[v.voterStatut] === 10),
  );
  return hasExpertVote;
}

export function markRevelation(userId: string, caseId: string): void {
  const all = getAll();
  const idx = all.findIndex((p) => p.userId === userId && p.caseId === caseId);
  if (idx >= 0) {
    all[idx] = { ...all[idx]!, revelationFaite: true, updatedAt: new Date().toISOString() };
    saveAll(all);
  }
}

// Supprime la participation d'un utilisateur pour un cas donné.
// Note : les points de vote gagnés à la soumission ne sont pas remboursés.
export function removeParticipation(userId: string, caseId: string): void {
  const all = getAll();
  const filtered = all.filter((p) => !(p.userId === userId && p.caseId === caseId));
  saveAll(filtered);
}

// Agrège les évaluations de difficulté de toutes les participations d'un cas.
// Retourne le niveau le plus fréquent et le nombre de votes correspondants.
export interface DifficultyResult {
  niveau: DifficulteEstimee;
  label: string;
  count: number;
  total: number; // nombre total de participations ayant renseigné ce champ
}

// Insère une participation dans le store si elle n'y est pas encore (par id).
// Utilisé pour synchroniser les analyses statiques (cas.analyses) vers localStorage
// afin que les votes fonctionnent.
export function syncParticipationIfNeeded(participation: UserParticipation): void {
  if (typeof window === 'undefined') return;
  const all = getAll();
  if (all.some((p) => p.id === participation.id)) return;
  saveAll([...all, participation]);
}

export function computeDifficulty(caseId: string): DifficultyResult | null {
  const participations = getParticipationsByCase(caseId);
  const votes = participations
    .map((p) => p.difficultéEstimee)
    .filter((d): d is DifficulteEstimee => !!d);

  if (votes.length === 0) return null;

  const counts = new Map<DifficulteEstimee, number>();
  for (const v of votes) {
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }

  let best: DifficulteEstimee = votes[0]!;
  let bestCount = 0;
  for (const [niveau, count] of counts.entries()) {
    if (count > bestCount) {
      best = niveau;
      bestCount = count;
    }
  }

  return {
    niveau: best,
    label: DIFFICULTE_LABELS[best],
    count: bestCount,
    total: votes.length,
  };
}

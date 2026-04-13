'use client';

// ─── Store d'exercices d'apprentissage — localStorage (MVP) ─────────────────
// Les exercices sont PRIVES : pas de +2 votePoints, pas de publication,
// pas comptabilises dans les statistiques du cas ni du profil.
// Stockes separement des participations (cle differente).

import type { UserParticipation } from '@/types';

const STORAGE_KEY = 'acusensus_exercices';

function getAll(): UserParticipation[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UserParticipation[]) : [];
  } catch {
    return [];
  }
}

function saveAll(exercices: UserParticipation[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(exercices));
}

/** Recupere l'exercice d'un utilisateur pour un cas donne (s'il existe). */
export function getExercice(
  userId: string,
  caseId: string,
): UserParticipation | undefined {
  return getAll().find((e) => e.userId === userId && e.caseId === caseId);
}

/** Tous les exercices d'un utilisateur. */
export function getAllExercices(userId: string): UserParticipation[] {
  return getAll().filter((e) => e.userId === userId);
}

/** Enregistre un exercice d'apprentissage (insert ou update). */
export function saveExercice(
  userId: string,
  data: Partial<UserParticipation> & { caseId: string },
): UserParticipation {
  const all = getAll();
  const idx = all.findIndex((e) => e.userId === userId && e.caseId === data.caseId);
  const now = new Date().toISOString();

  if (idx >= 0) {
    all[idx] = { ...all[idx], ...data, userId, updatedAt: now };
    saveAll(all);
    return all[idx]!;
  }

  const newE: UserParticipation = {
    id: `ex-${Date.now()}`,
    userId,
    caseId: data.caseId,
    grilleChoisie: data.grilleChoisie,
    grilleSecondaire: data.grilleSecondaire,
    polariteIdentifiee: data.polariteIdentifiee,
    localisationIdentifiee: data.localisationIdentifiee,
    categoriesRetenues: data.categoriesRetenues ?? [],
    pointsProposer: data.pointsProposer ?? [],
    commentaireLibre: data.commentaireLibre,
    revelationFaite: false,
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
    publicationMode: undefined,
    publiee: false,
    votes: [],
    votePoints: 0,
    valeur: 0,
    difficultéEstimee: data.difficultéEstimee,
  };
  saveAll([...all, newE]);
  return newE;
}

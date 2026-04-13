'use client';

// ─── Store de cas soumis par l'utilisateur — localStorage (MVP) ─────────────
// Permet de stocker les cas crees par les utilisateurs.
// En production : remplacer par Supabase.

import type { ClinicalCase } from '@/types';

const STORAGE_KEY = 'acusensus_user_cases';

function getAll(): ClinicalCase[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ClinicalCase[]) : [];
  } catch {
    return [];
  }
}

function saveAll(cases: ClinicalCase[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
}

/** Recupere tous les cas soumis par les utilisateurs. */
export function getUserCases(): ClinicalCase[] {
  return getAll();
}

/** Recupere les cas soumis par un utilisateur donne. */
export function getUserCasesByAuteur(auteurId: string): ClinicalCase[] {
  return getAll().filter((c) => c.auteurId === auteurId);
}

/** Recupere un cas utilisateur par son ID. */
export function getUserCaseById(id: string): ClinicalCase | undefined {
  return getAll().find((c) => c.id === id);
}

/** Ajoute un nouveau cas soumis par un utilisateur. */
export function addUserCase(cas: ClinicalCase): void {
  const all = getAll();
  all.push(cas);
  saveAll(all);
}

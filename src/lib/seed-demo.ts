'use client';

// ─── Seed des participations démo — localStorage ──────────────────────────────
// Au premier chargement (flag "acusensus_seeded" absent du localStorage),
// injecte les analyses variantes des cas cliniques en tant que participations
// démo, avec des auteurs fictifs et des statuts variés.
//
// Ces participations permettent d'illustrer le panneau d'analyse dès l'ouverture
// de l'application, sans que l'utilisateur n'ait besoin de consigner quoi que
// ce soit.

import { CLINICAL_CASES } from '@/data/cases';
import type { UserParticipation, ClinicalAnalysis } from '@/types';

const STORAGE_KEY = 'acusensus:participations';
const SEEDED_FLAG = 'acusensus_seeded_v3';

// Convertit une ClinicalAnalysis (variante de démo) en UserParticipation stockable.
// Le champ `role` (non présent sur UserParticipation) est attaché dynamiquement
// pour que isExpert() fonctionne dans AnalysePanel sans modifier le type core.
function analyseToDemoParticipation(a: ClinicalAnalysis): UserParticipation {
  const now = new Date().toISOString();
  const participation: UserParticipation & { role?: string } = {
    // On utilise l'id de l'analyse comme id de participation démo
    id: a.id,
    // userId fictif basé sur le pseudo (stable entre sessions)
    userId: `demo-${a.auteurPseudo?.toLowerCase().replace(/\s+/g, '-') ?? 'anonyme'}`,
    caseId: a.caseId,
    grilleChoisie: a.grillePrincipale,
    grilleSecondaire: a.grillesSecondaires?.[0],
    polariteIdentifiee: a.polarite,
    localisationIdentifiee: a.localisationFoyer,
    categoriesRetenues: a.categoriesDiagnostiques,
    pointsProposer: a.pointsUtilises.map((p) => ({
      code: p.code,
      technique: p.technique,
      action: p.action,
      justification: p.justification,
      ordre: p.ordre,
    })),
    commentaireLibre: a.commentaireLibre,
    bilanEnergetique: a.bilanEnergetique,
    strategie: a.strategieTherapeutique,
    // Annotations : reprises telles quelles pour illustrer les commentaires communautaires
    annotationsInterrogatoire: a.annotationsInterrogatoire,
    annotationsPouls: a.annotationsPouls,
    revelationFaite: false,
    publicationMode: a.publicationMode ?? 'public',
    publiee: true,
    votePoints: a.votePoints ?? 0,
    valeur: a.valeur ?? 1.0,
    createdAt: now,
    updatedAt: now,
  };
  // Transmet le rôle éditorial pour que isExpert() fonctionne dans AnalysePanel
  if (a.role) {
    participation.role = a.role;
  }
  return participation;
}

// Retourne toutes les analyses variantes ("participations démo") des cas publiés.
function collectDemoParticipations(): UserParticipation[] {
  const demos: UserParticipation[] = [];
  for (const cas of CLINICAL_CASES) {
    if (cas.statut !== 'publie') continue;
    for (const analyse of cas.analyses) {
      // On exclut les analyses officielles (type 'officielle') — on ne garde que
      // les variantes qui illustrent les participations de praticiens/étudiants.
      if (analyse.type === 'officielle') continue;
      demos.push(analyseToDemoParticipation(analyse));
    }
  }
  return demos;
}

// Point d'entrée — à appeler une seule fois côté client (layout ou ClientRoot).
export function seedDemoParticipations(): void {
  if (typeof window === 'undefined') return;
  // Ne ré-exécuter qu'une seule fois
  if (localStorage.getItem(SEEDED_FLAG)) return;

  const demos = collectDemoParticipations();
  if (demos.length === 0) return;

  // On fusionne avec les participations déjà présentes (au cas où)
  let existing: UserParticipation[] = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    existing = raw ? (JSON.parse(raw) as UserParticipation[]) : [];
  } catch {
    existing = [];
  }

  // Éviter les doublons (par id)
  const existingIds = new Set(existing.map((p) => p.id));
  const toAdd = demos.filter((d) => !existingIds.has(d.id));
  const merged = [...existing, ...toAdd];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  localStorage.setItem(SEEDED_FLAG, '1');
}

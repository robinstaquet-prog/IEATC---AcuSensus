// ─── Constantes partagées AcuSensus ──────────────────────────────────────────
// Source unique de vérité pour les labels et couleurs utilisés dans plusieurs pages.

// ─── Complexité ───────────────────────────────────────────────────────────────

export const COMPLEXITE_LABELS: Record<number, string> = {
  1: '1ère année',
  2: 'Intermédiaire',
  3: '4ème année',
  4: 'Avancé',
};

export const COMPLEXITE_COLORS: Record<number, string> = {
  1: 'bg-emerald-100 text-emerald-700',
  2: 'bg-amber-100 text-amber-700',
  3: 'bg-orange-100 text-orange-700',
  4: 'bg-red-100 text-red-700',
};

// ─── Clés d'interrogatoire ────────────────────────────────────────────────────

export const CLE_LABELS: Record<string, string> = {
  douleur: 'Douleur',
  horaire: 'Horaire',
  activite: 'Activité',
  traumatisme: 'Traumatisme',
  preferences: 'Préférences',
  antecedents: 'Antécédents',
  sommeil: 'Sommeil',
  alimentation: 'Alimentation',
  digestion: 'Digestion',
  urine: 'Urines',
  transit: 'Transit',
  energie: 'Énergie',
  temperature: 'Température',
  emotionnel: 'Émotionnel',
  contexte: 'Contexte',
  symptome: 'Symptôme',
  evolution: 'Évolution',
  selles: 'Selles',
  frissons: 'Frissons / chaleur',
  transpiration: 'Transpiration',
  menstruations: 'Menstruations',
  symptomes_tete: 'Symptômes tête',
  oreilles: 'Oreilles',
  coeur: 'Cœur',
  aspect: 'Aspect',
  psychisme: 'Psychisme',
  desirs: 'Désirs',
};

export function cleLabel(cle: string): string {
  return CLE_LABELS[cle] ?? cle.charAt(0).toUpperCase() + cle.slice(1).replace(/_/g, ' ');
}

// ─── Statuts IEATC ────────────────────────────────────────────────────────────

export const LABEL_STATUT_IEATC: Record<string, string> = {
  premiere_annee: '1ère année',
  etudiant: 'Étudiant',
  quatrieme_annee: '4ème année',
  jeune_praticien: 'Jeune praticien',
  praticien_experimente: 'Praticien expérimenté',
  expert: 'Expert',
  // Compatibilité anciens enregistrements
  etudiant_4e_annee: 'Étudiant 4e année',
};

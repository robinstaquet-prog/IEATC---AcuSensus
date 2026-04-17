/**
 * Moteur de normalisation des concepts IEATC (non-destructif)
 *
 * Les textes libres (categoriesDiagnostiques, bilanEnergetique, strategie)
 * sont analysés post-hoc pour extraire les concepts canoniques — en lecture seule.
 * Le texte original n'est JAMAIS modifié ni stocké différemment.
 *
 * Un membre peut écrire « Rein en vide de Yin », « Vide yin du Rein »
 * ou « Insuffisance du Yin rénal » — le système reconnaît les trois et
 * les agrège sous le même concept canonique pour les statistiques.
 */

// ─── Utilitaires ──────────────────────────────────────────────────────────────

/** Supprime diacritiques et met en minuscules */
export function stripAccents(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Normalise un texte pour la recherche de concepts :
 * minuscules, sans accents, tout caractère non alphanumérique → espace.
 */
export function normaliserTexteIeatc(s: string): string {
  return stripAccents(s)
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Vérifie si un pattern est présent dans un texte normalisé en tant que séquence
 * de mots entiers (pas de correspondance au milieu d'un mot).
 */
function matchPattern(normalizedText: string, pattern: string): boolean {
  return (` ${normalizedText} `).includes(` ${pattern} `);
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type CategorieConcept = 'famille_diag' | 'organe' | 'localisation';

export interface ConceptIeatc {
  id: string;
  label: string;            // label canonique affiché dans les stats
  categorie: CategorieConcept;
  /**
   * Patterns de reconnaissance (texte normalisé : minuscules, sans accents).
   * AU MOINS UN pattern doit être présent pour que le concept soit reconnu.
   * Les expressions multi-mots sont supportées (ex : "foyer moyen").
   */
  patterns: string[];
}

// ─── Familles diagnostiques ───────────────────────────────────────────────────

export const FAMILLES_DIAG: ConceptIeatc[] = [

  // ── Vides ──────────────────────────────────────────────────────────────────
  {
    id: 'vide_yang',
    label: 'Vide de Yang',
    categorie: 'famille_diag',
    patterns: [
      'vide de yang', 'vide yang', 'yang vide',
      'insuffisance yang', 'yang insuffisant', 'deficience yang',
      'yang deficient', 'carence yang', 'manque de yang',
      'yang manquant', 'yang general insuffisant', 'yang ne monte pas',
    ],
  },
  {
    id: 'vide_yin',
    label: 'Vide de Yin',
    categorie: 'famille_diag',
    patterns: [
      'vide de yin', 'vide yin', 'yin vide',
      'insuffisance yin', 'yin insuffisant', 'deficience yin',
      'yin deficient', 'carence yin', 'manque de yin',
      'yin manquant', 'yin non nourri',
    ],
  },
  {
    id: 'vide_qi',
    label: 'Vide de Qi',
    categorie: 'famille_diag',
    patterns: [
      'vide de qi', 'vide qi', 'qi vide',
      'insuffisance qi', 'qi insuffisant', 'deficience qi',
      'qi deficient', 'insuffisance energetique', 'energie insuffisante',
      'manque de qi', 'qi affaibli', 'qi epuise',
    ],
  },
  {
    id: 'vide_sang',
    label: 'Vide de Sang',
    categorie: 'famille_diag',
    patterns: [
      'vide de sang', 'vide sang', 'sang vide',
      'insuffisance sang', 'sang insuffisant', 'xue vide',
      'sang non nourri', 'carence sanguine', 'sang deficient',
    ],
  },
  {
    id: 'vide_jing',
    label: 'Vide de Jing / Essence',
    categorie: 'famille_diag',
    patterns: [
      'vide de jing', 'vide jing', 'jing vide',
      'insuffisance jing', 'jing insuffisant', 'jing epuise',
      'vide d essence', 'essence insuffisante', 'epuisement du jing',
      'essence renale insuffisante',
    ],
  },

  // ── Excès / Plénitudes ─────────────────────────────────────────────────────
  {
    id: 'exces_yin',
    label: 'Excès / Plénitude de Yin',
    categorie: 'famille_diag',
    patterns: [
      'exces de yin', 'exces yin', 'yin en exces', 'plenitude yin',
      'plenitude de yin', 'yin plenitude', 'trop de yin',
      'yin trop fort', 'yin excessif', 'masse de yin',
    ],
  },
  {
    id: 'exces_yang',
    label: 'Excès / Plénitude de Yang',
    categorie: 'famille_diag',
    patterns: [
      'exces de yang', 'exces yang', 'yang en exces', 'plenitude yang',
      'plenitude de yang', 'yang plenitude', 'trop de yang',
      'yang trop fort', 'yang excessif',
    ],
  },

  // ── Stagnations ────────────────────────────────────────────────────────────
  {
    id: 'stagnation_qi',
    label: 'Stagnation de Qi',
    categorie: 'famille_diag',
    patterns: [
      'stagnation de qi', 'stagnation qi', 'qi stagnant',
      'stagnation energetique', 'stagnation d energie', 'energie stagnante',
      'blocage de qi', 'stagnation du qi', 'qi bloque',
      'stagnation de l energie',
    ],
  },
  {
    id: 'stagnation_sang',
    label: 'Stagnation de Sang',
    categorie: 'famille_diag',
    patterns: [
      'stagnation de sang', 'stagnation sang', 'sang stagnant',
      'sang bloque', 'stase sanguine', 'stase de sang',
      'xue stagnant', 'stagnation du sang',
    ],
  },
  {
    id: 'obstruction_meridien',
    label: 'Obstruction / Atteinte de méridien',
    categorie: 'famille_diag',
    patterns: [
      'obstruction du meridien', 'obstruction meridien',
      'atteinte du meridien', 'atteinte meridien',
      'meridien obstrue', 'meridien bloque', 'meridien perturbe',
      'stagnation meridien', 'meridien atteint',
      'vide du meridien', 'sequelle meridien',
      'circulation du meridien perturbee', 'meridien insuffisant',
    ],
  },

  // ── Facteurs pathogènes ────────────────────────────────────────────────────
  {
    id: 'chaleur',
    label: 'Chaleur',
    categorie: 'famille_diag',
    patterns: [
      'chaleur interne', 'chaleur de', 'chaleur dans', 'chaleur au',
      'accumulation de chaleur', 'exces de chaleur', 'chaleur pathogene',
      'feu de', 'feu dans', 'accumulation de feu',
    ],
  },
  {
    id: 'chaleur_vide',
    label: 'Chaleur de Vide',
    categorie: 'famille_diag',
    patterns: [
      'chaleur de vide', 'feu de vide', 'chaleur xu',
      'chaleur vide', 'vide avec chaleur', 'chaleur residuelle',
      'chaleur d origine xu',
    ],
  },
  {
    id: 'humidite',
    label: 'Humidité',
    categorie: 'famille_diag',
    patterns: [
      'humidite interne', 'retention d humidite', 'accumulation d humidite',
      'humidite de', 'humidite dans', 'humidite au',
      'exces d humidite', 'humidite pathogene', 'retention humidite',
      'masse d humidite', 'humidite excessive',
    ],
  },
  {
    id: 'humidite_chaleur',
    label: 'Humidité-Chaleur',
    categorie: 'famille_diag',
    patterns: [
      'humidite chaleur', 'chaleur humidite',
      'humidite et chaleur', 'chaleur et humidite',
    ],
  },
  {
    id: 'humidite_froid',
    label: 'Humidité-Froid',
    categorie: 'famille_diag',
    patterns: [
      'humidite froid', 'froid humidite',
      'humidite et froid', 'froid et humidite', 'froid humide',
    ],
  },
  {
    id: 'froid',
    label: 'Froid',
    categorie: 'famille_diag',
    patterns: [
      'froid interne', 'froid de', 'froid dans', 'froid au',
      'invasion de froid', 'froid pathogene', 'accumulation de froid',
      'blocage par le froid', 'contraction par le froid',
    ],
  },
  {
    id: 'vent',
    label: 'Vent',
    categorie: 'famille_diag',
    patterns: [
      'vent interne', 'vent externe', 'invasion de vent',
      'vent pathogene', 'montee du vent', 'vent de foie',
      'vent yang', 'agitation interne', 'tremblements internes',
    ],
  },
  {
    id: 'secheresse',
    label: 'Sécheresse',
    categorie: 'famille_diag',
    patterns: [
      'secheresse interne', 'secheresse de', 'secheresse dans',
      'manque de liquides', 'assechement des', 'liquides insuffisants',
      'jin ye insuffisants', 'jin ye vide',
    ],
  },

  // ── Patterns mixtes et systémiques ─────────────────────────────────────────
  {
    id: 'montee_yang',
    label: 'Montée du Yang',
    categorie: 'famille_diag',
    patterns: [
      'montee du yang', 'yang qui monte', 'yang ascendant',
      'yang ne descend pas', 'yang ne monte pas',
      'remontee du yang', 'yang monte en fleche',
    ],
  },
  {
    id: 'cycle_ko',
    label: 'Cycle Ko perturbé',
    categorie: 'famille_diag',
    patterns: [
      'cycle ko', 'ko inverse', 'ko brise', 'ko perturbe',
      'invasion ko', 'ko affaibli', 'relation ko', 'ko inversee',
    ],
  },
  {
    id: 'cycle_sheng',
    label: 'Cycle Sheng insuffisant',
    categorie: 'famille_diag',
    patterns: [
      'cycle sheng', 'sheng perturbe', 'sheng insuffisant',
      'ne nourrit plus', 'ne peut plus nourrir', 'ne nourrit pas',
      'relation mere enfant', 'mere insuffisante',
    ],
  },
  {
    id: 'blocage_foyer',
    label: 'Blocage de Foyer',
    categorie: 'famille_diag',
    patterns: [
      'foyer bloque', 'blocage du foyer', 'foyer sature',
      'circulation entre foyers', 'foyer obstrue',
      'communication entre foyers', 'passage entre foyers bloque',
    ],
  },
];

// ─── Organes et localisations ─────────────────────────────────────────────────

export const ORGANES_LOCA: ConceptIeatc[] = [

  // ── Organes Zang ──────────────────────────────────────────────────────────
  {
    id: 'rein',
    label: 'Rein',
    categorie: 'organe',
    patterns: [
      'rein', 'reins', 'zang rein', 'eau element',
    ],
  },
  {
    id: 'foie',
    label: 'Foie',
    categorie: 'organe',
    patterns: [
      'foie', 'zang foie', 'hepatique', 'bois element',
    ],
  },
  {
    id: 'rate',
    label: 'Rate',
    categorie: 'organe',
    patterns: [
      'rate', 'zang rate', 'terre element',
    ],
  },
  {
    id: 'coeur',
    label: 'Cœur',
    categorie: 'organe',
    patterns: [
      'coeur', 'zang coeur',
    ],
  },
  {
    id: 'poumon',
    label: 'Poumon',
    categorie: 'organe',
    patterns: [
      'poumon', 'poumons', 'zang poumon', 'metal element',
    ],
  },

  // ── Organes Fu ────────────────────────────────────────────────────────────
  {
    id: 'estomac',
    label: 'Estomac',
    categorie: 'organe',
    patterns: [
      'estomac', 'fu estomac',
    ],
  },
  {
    id: 'vb',
    label: 'Vésicule Biliaire',
    categorie: 'organe',
    patterns: [
      'vesicule biliaire', 'vesicule', 'meridien vb', 'vb',
    ],
  },
  {
    id: 'intestin_grele',
    label: 'Intestin Grêle',
    categorie: 'organe',
    patterns: [
      'intestin grele',
    ],
  },
  {
    id: 'gros_intestin',
    label: 'Gros Intestin',
    categorie: 'organe',
    patterns: [
      'gros intestin',
    ],
  },
  {
    id: 'vessie',
    label: 'Vessie',
    categorie: 'organe',
    patterns: [
      'meridien vessie',
    ],
  },
  {
    id: 'triple_rec',
    label: 'Triple Réchauffeur',
    categorie: 'organe',
    patterns: [
      'triple rechauffeur', 'triple rec',
    ],
  },

  // ── Localisations Trois Foyers ────────────────────────────────────────────
  {
    id: 'foyer_superieur',
    label: 'Foyer Supérieur',
    categorie: 'localisation',
    patterns: [
      'foyer superieur',
    ],
  },
  {
    id: 'foyer_moyen',
    label: 'Foyer Moyen',
    categorie: 'localisation',
    patterns: [
      'foyer moyen',
    ],
  },
  {
    id: 'foyer_inferieur',
    label: 'Foyer Inférieur',
    categorie: 'localisation',
    patterns: [
      'foyer inferieur',
    ],
  },
];

// ─── API de normalisation ─────────────────────────────────────────────────────

/**
 * Extrait les concepts IEATC reconnus dans un texte libre.
 * Retourne les familles diagnostiques et organes/localisations identifiés.
 */
export function extraireConceptsIeatc(texte: string): {
  familles: string[];
  organes: string[];
} {
  const n = normaliserTexteIeatc(texte);

  const familles: string[] = [];
  for (const concept of FAMILLES_DIAG) {
    if (concept.patterns.some((p) => matchPattern(n, p))) {
      familles.push(concept.id);
    }
  }

  const organes: string[] = [];
  for (const concept of ORGANES_LOCA) {
    if (concept.patterns.some((p) => matchPattern(n, p))) {
      organes.push(concept.id);
    }
  }

  return { familles, organes };
}

/**
 * Normalise un ensemble de textes (ex : array de categoriesDiagnostiques)
 * et agrège tous les concepts reconnus sans doublons pour une même analyse.
 */
export function normaliserTextes(textes: string[]): {
  familles: string[];
  organes: string[];
} {
  const allFamilles = new Set<string>();
  const allOrganes = new Set<string>();

  for (const texte of textes) {
    const { familles, organes } = extraireConceptsIeatc(texte);
    familles.forEach((f) => allFamilles.add(f));
    organes.forEach((o) => allOrganes.add(o));
  }

  return {
    familles: [...allFamilles],
    organes: [...allOrganes],
  };
}

/**
 * Retourne le label canonique d'un concept par son id.
 * Retourne l'id tel quel si inconnu.
 */
export function labelConceptIeatc(id: string): string {
  const all: ConceptIeatc[] = [...FAMILLES_DIAG, ...ORGANES_LOCA];
  return all.find((c) => c.id === id)?.label ?? id;
}

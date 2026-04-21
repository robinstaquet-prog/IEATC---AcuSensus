/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MOTEUR DE NORMALISATION SÉMANTIQUE IEATC — Version 2
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Principe fondamental : non-destructif, post-hoc.
 * Les textes libres (categoriesDiagnostiques, bilanEnergetique, strategie)
 * sont analysés en lecture seule pour extraire les concepts canoniques.
 * Le praticien écrit librement — le système classe et agrège.
 *
 * Architecture à 4 couches :
 *   1. Familles diag     — Vide, Plénitude, Stagnation, Facteur pathogène
 *   2. Syndromes         — Vide de Yin du Rein, Yang du Foie montant, etc.
 *   3. Organes/Foyers    — Rein, Foie, Rate, Foyer Moyen, etc.
 *   4. Stratégies        — Nourrir Yin, Tonifier Yang, Pacifier Vent, etc.
 *
 * ─── RÈGLES CLINIQUES FONDAMENTALES (intégrées dans la données) ──────────────
 *
 * R1. Yin/Yang prime TOUJOURS — orienter la polarité avant tout autre lecture.
 * R2. Traiter le général AVANT le local — un Yang local sur vide Yang général
 *     sera absorbé sans effet durable.
 * R3. Feu du vide ≠ Chaleur réelle — le traiter en TONIFIANT le Yin,
 *     JAMAIS en dispersant la chaleur (risque d'aggravation).
 * R4. Vide de Yin du Rein → Yang du Foie monte (cause indirecte).
 *     Traiter le Rein, pas le Foie en premier.
 * R5. Règle des 3 Foyers — en cas de Foyer Moyen plein : le traiter en
 *     PREMIER, avant le Foyer Inférieur vide (sinon le plein bloque tout).
 * R6. Oé en plénitude locale / Iong insuffisante = paradoxe IEATC classique.
 *     Tonifier l'Iong générale ET disperser l'Oé locale.
 * R7. Cycle Ko inversé (Bois envahit Terre) : ne pas soutenir la Terre seule
 *     sans calmer d'abord le Bois en excès.
 *
 * Source : Corpus IEATC — PIV YY tomes 4-5, PVI EEA tome 3
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ─── Utilitaires de normalisation ────────────────────────────────────────────

/** Supprime les diacritiques, met en minuscules, normalise les espaces */
export function normaliserTexteIeatc(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Matching sur mots entiers (word-boundary via espaces virtuels) */
function matchPattern(normalized: string, pattern: string): boolean {
  return (` ${normalized} `).includes(` ${pattern} `);
}

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Catégorie dans la hiérarchie de normalisation IEATC.
 * Ordonnée du plus général au plus spécifique.
 */
export type CategorieConcept =
  | 'famille_diag'   // Vide, Plénitude, Stagnation, Facteur pathogène — niveau 1
  | 'syndrome'       // Syndrome nommé spécifique — niveau 2
  | 'organe'         // Organe Tsang ou Fu — niveau 3
  | 'localisation'   // Foyer Supérieur/Moyen/Inférieur — niveau 3
  | 'vaisseau'       // Merveilleux Vaisseau (Du Mai, Ren Mai…) — niveau 3
  | 'element'        // Élément wuxing (Eau, Bois, Feu, Terre, Métal) — niveau 3
  | 'strategie'      // Stratégie thérapeutique — niveau 4
  | 'pathologie';    // Présentation clinique / motif de consultation — niveau 5

export interface ConceptIeatc {
  id: string;
  label: string;                   // Label canonique affiché dans les stats
  categorie: CategorieConcept;
  description?: string;            // Note clinique courte (visible dans UI future)
  /**
   * Expressions de reconnaissance (texte normalisé : minuscules, sans accents).
   * AU MOINS UNE expression doit être présente (word-boundary matching).
   * Les expressions multi-mots sont supportées.
   */
  patterns: string[];
  /**
   * Règles cliniques applicables à ce concept (identifiants R1-R7).
   * Permet de relier les statistiques aux règles cliniques de l'école.
   */
  regles?: string[];
  /**
   * Priorité de traitement IEATC : 1 = traiter en premier, 3 = traiter en dernier.
   * Reflète la logique protocole (général avant local, cause avant conséquence).
   */
  priorite?: 1 | 2 | 3;
}

// ═══════════════════════════════════════════════════════════════════════════════
// COUCHE 1 — FAMILLES DIAGNOSTIQUES
// Les grandes familles pathologiques — niveau de lecture Yin/Yang
// ═══════════════════════════════════════════════════════════════════════════════

export const FAMILLES_DIAG: ConceptIeatc[] = [

  // ─── Vides (Xu) ─────────────────────────────────────────────────────────────
  {
    id: 'vide_yang',
    label: 'Vide de Yang',
    categorie: 'famille_diag',
    description: 'Insuffisance de la force Yang — froid, fatigue, pâleur, pouls vide profond.',
    patterns: [
      'vide de yang', 'vide yang', 'yang vide',
      'insuffisance yang', 'yang insuffisant', 'yang deficient',
      'carence yang', 'manque de yang', 'yang manquant',
      'yang general insuffisant',
    ],
    regles: ['R1', 'R2'],
    priorite: 1,
  },
  {
    id: 'vide_yin',
    label: 'Vide de Yin',
    categorie: 'famille_diag',
    description: 'Insuffisance de substance Yin — chaleur vespérale, sécheresse, sueurs nocturnes.',
    patterns: [
      'vide de yin', 'vide yin', 'yin vide',
      'insuffisance yin', 'yin insuffisant', 'yin deficient',
      'carence yin', 'manque de yin', 'yin manquant', 'yin insuffisant',
    ],
    regles: ['R1', 'R4'],
    priorite: 1,
  },
  {
    id: 'vide_qi',
    label: 'Vide de Qi / Tchi',
    categorie: 'famille_diag',
    description: 'Insuffisance de Qi (Tchi) — fatigue, essoufflement, voix basse, sueur spontanée.',
    patterns: [
      'vide de qi', 'vide qi', 'qi vide', 'vide de tchi', 'tchi vide',
      'insuffisance qi', 'qi insuffisant', 'qi deficient',
      'insuffisance energetique', 'energie insuffisante',
      'manque de qi', 'qi affaibli', 'qi epuise',
    ],
    priorite: 1,
  },
  {
    id: 'vide_sang',
    label: 'Vide de Sang (Xue Xu)',
    categorie: 'famille_diag',
    description: 'Insuffisance de Sang — pâleur, vertiges, palpitations, ongles fragiles.',
    patterns: [
      'vide de sang', 'vide sang', 'sang vide',
      'insuffisance sang', 'sang insuffisant', 'xue vide',
      'sang non nourri', 'carence sanguine', 'sang deficient',
    ],
    priorite: 1,
  },
  {
    id: 'vide_jing',
    label: 'Vide de Jing / Tsing (Ancestrale)',
    categorie: 'famille_diag',
    description: 'Épuisement de l\'énergie ancestrale Tsing (Jing). Irréversible — on ne peut qu\'en économiser l\'usage.',
    patterns: [
      'vide de jing', 'vide jing', 'jing vide', 'tsing vide',
      'vide de tsing', 'insuffisance jing', 'jing epuise', 'tsing epuise',
      'vide d essence', 'essence insuffisante', 'energie ancestrale epuisee',
      'epuisement du jing',
    ],
    priorite: 1,
  },
  {
    id: 'vide_iong',
    label: 'Vide d\'Iong (Ying Qi insuffisante)',
    categorie: 'famille_diag',
    description: 'Insuffisance de l\'énergie nutritive Iong (Ying Qi). L\'Iong nourrit les structures internes via les méridiens.',
    patterns: [
      'iong insuffisante', 'iong vide', 'vide d iong', 'vide de iong',
      'ying qi insuffisante', 'insuffisance iong', 'iong affaiblie',
    ],
    regles: ['R6'],
    priorite: 1,
  },

  // ─── Excès / Plénitudes (Shi) ────────────────────────────────────────────────
  {
    id: 'exces_yin',
    label: 'Excès / Plénitude de Yin',
    categorie: 'famille_diag',
    description: 'Excès de Yin — humidité, froid, lourdeur, blocage de la circulation Yang.',
    patterns: [
      'exces de yin', 'exces yin', 'yin en exces', 'plenitude yin',
      'plenitude de yin', 'yin plenitude', 'trop de yin',
      'yin trop fort', 'yin excessif',
    ],
    regles: ['R5'],
    priorite: 1,
  },
  {
    id: 'exces_yang',
    label: 'Excès / Plénitude de Yang',
    categorie: 'famille_diag',
    description: 'Excès de Yang — chaleur, rougeur, agitation, plein.',
    patterns: [
      'exces de yang', 'exces yang', 'yang en exces', 'plenitude yang',
      'plenitude de yang', 'yang plenitude', 'trop de yang',
      'yang trop fort', 'yang excessif', 'yang local', 'yang en plenitude',
    ],
    priorite: 1,
  },
  {
    id: 'plenitude_oe',
    label: 'Plénitude d\'Oé (Wei Qi en excès)',
    categorie: 'famille_diag',
    description: 'Oé (Wei Qi / énergie défensive) en excès local : chaleur, rougeur, inflammation de surface.',
    patterns: [
      'oe en plenitude', 'plenitude d oe', 'oe en exces', 'oé en plenitude',
      'wei qi en exces', 'oé excessif', 'exces d oe',
      'chaleur de surface', 'oé locale excessive',
    ],
    regles: ['R6'],
    priorite: 1,
  },

  // ─── Stagnations ─────────────────────────────────────────────────────────────
  {
    id: 'stagnation_qi',
    label: 'Stagnation de Qi',
    categorie: 'famille_diag',
    description: 'Qi bloqué — douleur distensive, ballonnements, humeur changeante.',
    patterns: [
      'stagnation de qi', 'stagnation qi', 'qi stagnant',
      'stagnation energetique', 'stagnation d energie', 'energie stagnante',
      'blocage de qi', 'stagnation du qi', 'qi bloque', 'stagnation du tchi',
    ],
    priorite: 2,
  },
  {
    id: 'stagnation_sang',
    label: 'Stagnation de Sang',
    categorie: 'famille_diag',
    description: 'Sang bloqué — douleur fixe et lancinante, teint sombre, pouls en corde.',
    patterns: [
      'stagnation de sang', 'stagnation sang', 'sang stagnant',
      'sang bloque', 'stase sanguine', 'stase de sang', 'xue stagnant',
      'stagnation du sang',
    ],
    priorite: 2,
  },
  {
    id: 'obstruction_meridien',
    label: 'Obstruction / Atteinte de méridien',
    categorie: 'famille_diag',
    description: 'Méridien principal (TT) atteint ou obstrué : douleur sur trajet, aggravation nocturne si Yin.',
    patterns: [
      'obstruction du meridien', 'obstruction meridien',
      'atteinte du meridien', 'atteinte meridien',
      'meridien obstrue', 'meridien bloque', 'meridien atteint',
      'vide du meridien', 'sequelle meridien', 'meridien perturbe',
      'meridien insuffisant', 'circulation meridienne perturbee',
    ],
    priorite: 2,
  },

  // ─── Facteurs pathogènes internes ────────────────────────────────────────────
  {
    id: 'chaleur',
    label: 'Chaleur (plénitude)',
    categorie: 'famille_diag',
    description: 'Chaleur réelle — plénitude : rougeur, soif, agitation, langue rouge, pouls rapide.',
    patterns: [
      'chaleur interne', 'chaleur de', 'chaleur dans', 'chaleur au',
      'accumulation de chaleur', 'exces de chaleur', 'chaleur pathogene',
      'feu de', 'feu dans', 'accumulation de feu', 'chaleur plein',
      'chaleur reelle',
    ],
    regles: ['R3'],
    priorite: 2,
  },
  {
    id: 'feu_vide',
    label: 'Feu du vide (Xu Huo) — Chaleur de Vide',
    categorie: 'famille_diag',
    description: 'CRITIQUE : chaleur produite par un vide de Yin, pas par un excès. NE JAMAIS disperser — tonifier le Yin.',
    patterns: [
      'feu du vide', 'chaleur de vide', 'feu de vide', 'xu huo',
      'chaleur xu', 'chaleur vide', 'vide avec chaleur',
      'chaleur d origine xu', 'yang relatif ascendant',
      'chaleur vesperal', 'chaleur le soir', 'chaleur en fin de journee',
    ],
    regles: ['R3'],
    priorite: 1,
  },
  {
    id: 'humidite',
    label: 'Humidité',
    categorie: 'famille_diag',
    description: 'Humidité interne — lourdeur, oedème, selles molles, enduit épais.',
    patterns: [
      'humidite interne', 'retention d humidite', 'accumulation d humidite',
      'humidite de', 'humidite dans', 'humidite au',
      'exces d humidite', 'humidite pathogene', 'retention humidite',
      'masse d humidite', 'humidite excessive', 'charge humide',
    ],
    priorite: 2,
  },
  {
    id: 'humidite_chaleur',
    label: 'Humidité-Chaleur',
    categorie: 'famille_diag',
    description: 'Association humidité + chaleur — dysurie, ictère, éruptions, enduit jaune gras.',
    patterns: [
      'humidite chaleur', 'chaleur humidite',
      'humidite et chaleur', 'chaleur et humidite',
      'enduit jaune gras', 'chaleur humide',
    ],
    priorite: 2,
  },
  {
    id: 'humidite_froid',
    label: 'Humidité-Froid',
    categorie: 'famille_diag',
    description: 'Association humidité + froid — douleurs articulaires, lourdeur, membres froids.',
    patterns: [
      'humidite froid', 'froid humidite',
      'humidite et froid', 'froid et humidite', 'froid humide',
      'enduit blanc epais',
    ],
    priorite: 2,
  },
  {
    id: 'froid_interne',
    label: 'Froid interne',
    categorie: 'famille_diag',
    description: 'Froid interne — contraction, douleurs améliorées par la chaleur, selles liquides.',
    patterns: [
      'froid interne', 'froid de', 'froid dans', 'froid au',
      'invasion de froid', 'froid pathogene', 'accumulation de froid',
      'blocage par le froid', 'manque de chaleur yang',
    ],
    priorite: 2,
  },
  {
    id: 'vent_interne',
    label: 'Vent interne',
    categorie: 'famille_diag',
    description: 'Vent interne (du Foie) — vertiges, tremblements, mouvements involontaires, pouls corde-arc.',
    patterns: [
      'vent interne', 'vent du foie', 'vent interne du foie',
      'agitation interne', 'yang monte en usurpateur',
      'yang ascendant', 'yang ne descend pas',
    ],
    regles: ['R4'],
    priorite: 2,
  },
  {
    id: 'vent_externe',
    label: 'Vent externe',
    categorie: 'famille_diag',
    description: 'Invasion de Vent externe — début brusque, symptômes mobiles, crainte du vent.',
    patterns: [
      'vent externe', 'invasion de vent', 'vent pathogene',
      'agression de vent', 'vent froid externe', 'vent chaleur externe',
    ],
    priorite: 2,
  },
  {
    id: 'secheresse',
    label: 'Sécheresse',
    categorie: 'famille_diag',
    description: 'Sécheresse — yeux secs, gorge sèche, constipation, peau desséchée.',
    patterns: [
      'secheresse interne', 'secheresse de', 'secheresse dans',
      'manque de liquides', 'assechement des', 'liquides insuffisants',
      'jin ye insuffisants', 'jin ye vide', 'manque de jin ye',
    ],
    priorite: 2,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// COUCHE 2 — SYNDROMES SPÉCIFIQUES IEATC
// Patterns cliniques nommés — avec règles et priorités de traitement
// ═══════════════════════════════════════════════════════════════════════════════

export const SYNDROMES_IEATC: ConceptIeatc[] = [

  // ─── Vides du Rein ──────────────────────────────────────────────────────────
  {
    id: 'vide_yang_rein',
    label: 'Vide de Yang du Rein',
    categorie: 'syndrome',
    description: 'Insuffisance Yang du Rein — froid lombaire, urines claires, poils d\'oreille blancs précoces.',
    patterns: [
      'vide de yang du rein', 'vide yang rein', 'yang du rein vide',
      'yang du rein insuffisant', 'rein yang vide', 'yang rein insuffisant',
      'vide yang rein', 'rein en vide de yang',
    ],
    regles: ['R1', 'R2'],
    priorite: 1,
  },
  {
    id: 'mingmen_insuffisant',
    label: 'Ming Men insuffisant — Feu de la Porte de la Vie',
    categorie: 'syndrome',
    description: 'CRITIQUE : le Feu du Ming Men (VG4) est la source du Yang constitutionnel. Son insuffisance = froid profond, diarrhées matinales, impuissance.',
    patterns: [
      'ming men insuffisant', 'ming men eteint', 'feu du ming men',
      'feu de ming men', 'feu du rein', 'feu originel insuffisant',
      'porte de la vie', 'yang du rein ming men',
      'ming men declinant', 'du mai insuffisant feu',
    ],
    regles: ['R1', 'R2'],
    priorite: 1,
  },
  {
    id: 'vide_yin_rein',
    label: 'Vide de Yin du Rein',
    categorie: 'syndrome',
    description: 'Insuffisance Yin du Rein — cause profonde du Yang du Foie montant et du Feu du vide. Traiter en premier.',
    patterns: [
      'vide de yin du rein', 'vide yin rein', 'yin du rein vide',
      'yin du rein insuffisant', 'rein yin vide', 'rein en vide de yin',
      'insuffisance yin du rein', 'yin renal insuffisant',
      'eau insuffisante', 'vide profond de l eau',
      'vide de yin rein',
    ],
    regles: ['R3', 'R4'],
    priorite: 1,
  },
  {
    id: 'vide_jing_rein',
    label: 'Vide de Jing / Tsing du Rein',
    categorie: 'syndrome',
    description: 'Épuisement de l\'essence ancestrale (Tsing/Jing) stockée dans le Rein.',
    patterns: [
      'vide de jing du rein', 'jing du rein vide',
      'tsing du rein vide', 'essence renale insuffisante',
      'epuisement du jing du rein', 'jing rein insuffisant',
    ],
    priorite: 1,
  },

  // ─── Foie : syndromes Yang montant et Vent ──────────────────────────────────
  {
    id: 'yang_foie_montant',
    label: 'Yang du Foie montant (Gan Yang Shang Kang)',
    categorie: 'syndrome',
    description: 'Yang du Foie non ancré monte vers le haut — céphalées temporales, visage rouge, irritabilité. Cause : vide de Yin du Rein. Traiter le Rein d\'abord.',
    patterns: [
      'yang du foie montant', 'yang foie montant',
      'yang du foie en exces', 'prosperite du yang du foie',
      'foie yang montant', 'yang montant du foie',
      'yang monte', 'yang en usurpateur',
      'bois non contenu', 'feu du foie montant',
    ],
    regles: ['R4'],
    priorite: 2,
  },
  {
    id: 'vent_interne_foie',
    label: 'Vent interne du Foie (Gan Feng Nei Dong)',
    categorie: 'syndrome',
    description: 'Vent interne — toujours secondaire à vide Yin/Sang du Foie ou Rein. Pouls corde-arc caractéristique.',
    patterns: [
      'vent interne du foie', 'vent du foie', 'gan feng',
      'vent interne foie', 'foie vent interne',
      'pouls corde arc', 'vertiges vent interne',
    ],
    regles: ['R4'],
    priorite: 2,
  },
  {
    id: 'feu_foie',
    label: 'Feu du Foie / Chaleur du Foie',
    categorie: 'syndrome',
    description: 'Chaleur en plénitude dans le Foie — yeux rouges, amertume buccale, constipation.',
    patterns: [
      'feu du foie', 'chaleur du foie', 'chaleur foie',
      'chaleur du bois', 'bois en chaleur',
      'feu foie', 'foie en feu', 'foie chaud',
      'plénitude chaleur foie', 'plenitude chaleur foie',
    ],
    regles: ['R3'],
    priorite: 2,
  },
  {
    id: 'vide_sang_foie',
    label: 'Vide de Sang du Foie',
    categorie: 'syndrome',
    description: 'Sang insuffisant dans le Foie — yeux secs, ongles cassants, règles pâles, crampes nocturnes.',
    patterns: [
      'vide de sang du foie', 'sang du foie vide', 'foie sang vide',
      'foie non nourri', 'foie mal nourri', 'sang foie insuffisant',
      'vide sang foie',
    ],
    priorite: 1,
  },
  {
    id: 'vide_yin_foie',
    label: 'Vide de Yin du Foie',
    categorie: 'syndrome',
    description: 'Yin du Foie insuffisant — tendons non nourris, vision trouble, chaleur du vide associée.',
    patterns: [
      'vide de yin du foie', 'yin du foie vide', 'foie yin vide',
      'vide yin foie', 'insuffisance yin foie',
      'tendons non nourris', 'tendons insuffisamment nourris',
      'foie ne nourrit plus les tendons', 'foie vb ne gouverne plus',
    ],
    regles: ['R4'],
    priorite: 1,
  },
  {
    id: 'stagnation_qi_foie',
    label: 'Stagnation de Qi du Foie',
    categorie: 'syndrome',
    description: 'Qi du Foie stagnant — irritabilité, hypocondre douloureux, règles irrégulières.',
    patterns: [
      'stagnation de qi du foie', 'qi du foie stagnant',
      'foie qi stagnant', 'stagnation qi foie',
      'foie bloque', 'qi foie stagne',
      'bois qui se bloque',
    ],
    priorite: 2,
  },

  // ─── Cycle Ko Bois → Terre ──────────────────────────────────────────────────
  {
    id: 'bois_envahit_terre',
    label: 'Bois envahit Terre (cycle Ko pathologique)',
    categorie: 'syndrome',
    description: 'Foie/VB (Bois) en excès contrôle trop fort la Rate/Estomac (Terre) — troubles digestifs aggravés par le stress.',
    patterns: [
      'bois envahit terre', 'foie envahit rate', 'bois sur terre',
      'ko pathologique', 'cycle ko pathologique',
      'foie vb envahit', 'bois domine terre',
      'rate affaiblie par le foie', 'foie agresse la rate',
      'conflit bois terre', 'stress crise foie rate',
      'chaleur du bois debordant', 'bois f vb envahit',
    ],
    regles: ['R7'],
    priorite: 2,
  },
  {
    id: 'cycle_ko_inverse',
    label: 'Cycle Ko inversé',
    categorie: 'syndrome',
    description: 'L\'élément contrôlé se retourne contre celui qui contrôle — signe de désordre profond.',
    patterns: [
      'cycle ko inverse', 'ko inverse', 'ko brise',
      'ko inversee', 'relation ko brisee', 'cycle ko perturbe',
      'invasion ko',
    ],
    regles: ['R7'],
    priorite: 2,
  },

  // ─── Cycle Sheng ─────────────────────────────────────────────────────────────
  {
    id: 'cycle_sheng_eau_bois',
    label: 'Cycle Sheng Eau → Bois brisé',
    categorie: 'syndrome',
    description: 'Le Rein (Eau) n\'alimente plus le Foie/VB (Bois) — tendons fragiles, fatigabilité, mononucléose séquellaire.',
    patterns: [
      'eau ne nourrit plus bois', 'eau bois cycle sheng',
      'cycle sheng eau bois', 'sheng eau vers bois',
      'rein ne nourrit plus foie', 'eau insuffisante bois',
      'insuffisance eau bois', 'cycle sheng brise',
      'eau vers bois defaillant', 'bois mal nourri par l eau',
      'foie mal nourri par le rein',
    ],
    regles: ['R4'],
    priorite: 1,
  },
  {
    id: 'cycle_sheng_bois_feu',
    label: 'Cycle Sheng Bois → Feu brisé',
    categorie: 'syndrome',
    description: 'Le Foie/VB (Bois) n\'alimente plus le Cœur/IG (Feu) — cascade énergétique défaillante.',
    patterns: [
      'bois ne nourrit plus feu', 'cycle sheng bois feu',
      'cascade eau bois feu', 'bois vers feu defaillant',
      'cycle eau bois feu',
    ],
    priorite: 1,
  },

  // ─── Syndromes du Cœur ───────────────────────────────────────────────────────
  {
    id: 'shen_perturbe',
    label: 'Shen perturbé (Cœur troublé)',
    categorie: 'syndrome',
    description: 'Le Shen (esprit, hébergé par le Cœur) est perturbé — insomnie, palpitations, anxiété, irritabilité.',
    patterns: [
      'shen perturbe', 'coeur perturbe', 'shen trouble',
      'insomnie palpitations', 'coeur shen',
      'shen agite', 'perturbation du shen',
    ],
    priorite: 2,
  },
  {
    id: 'feu_monte_au_coeur',
    label: 'Feu du Foie monte au Cœur',
    categorie: 'syndrome',
    description: 'Le Feu du Foie remonte vers le Cœur via le cycle Bois→Feu — insomnie, palpitations, agitation.',
    patterns: [
      'feu monte au coeur', 'yang foie feu coeur',
      'feu foie monte', 'bois vers feu coeur',
      'chaleur foie coeur', 'foie feu coeur',
    ],
    priorite: 2,
  },

  // ─── Syndromes de la Rate / Foyer Moyen ─────────────────────────────────────
  {
    id: 'rate_non_rechauffee',
    label: 'Rate non réchauffée par le Feu du Rein',
    categorie: 'syndrome',
    description: 'Le Yang du Rein (Ming Men) insuffisant ne réchauffe plus la Rate — digestion froide, selles molles.',
    patterns: [
      'rate non rechauffee', 'rate sans soutien yang',
      'digestion froide', 'rate non soutenue',
      'rate non soutenue par le feu',
      'foyer moyen non soutenu par le foyer inferieur',
      'foyer moyen non rechauffe',
    ],
    regles: ['R2'],
    priorite: 2,
  },
  {
    id: 'exces_yin_foyer_moyen',
    label: 'Excès de Yin au Foyer Moyen (Rate chargée)',
    categorie: 'syndrome',
    description: 'Plénitude de Yin bloque le Foyer Moyen — TRAITER EN PREMIER selon la règle des 3 Foyers.',
    patterns: [
      'exces yin foyer moyen', 'yin foyer moyen excessif',
      'foyer moyen sature', 'rate surchargee',
      'rate trop forte', 'rate en exces de yin',
      'plenitude yin foyer moyen', 'plenitude au foyer moyen',
    ],
    regles: ['R5'],
    priorite: 1,
  },

  // ─── Syndromes du Rein / Foyer Inférieur ────────────────────────────────────
  {
    id: 'foyer_inferieur_vide_yang',
    label: 'Foyer Inférieur en vide de Yang',
    categorie: 'syndrome',
    description: 'Yang insuffisant au Foyer Inférieur — Rein/VB/Ming Men défaillants. Diarrhées, urines claires, froid lombaire.',
    patterns: [
      'foyer inferieur vide de yang', 'foyer inferieur vide yang',
      'foyer inferieur yang vide', 'vide yang foyer inferieur',
      'vide de yang au foyer inferieur', 'yang vide foyer inferieur',
      'foyer inferieur en vide', 'yang foyer inferieur insuffisant',
      'foyer inferieur insuffisant',
    ],
    regles: ['R2'],
    priorite: 1,
  },
  {
    id: 'diarrhees_matinales_mingmen',
    label: 'Diarrhées matinales — Ming Men (Yang Ming)',
    categorie: 'syndrome',
    description: 'Diarrhées au petit matin (heure du GI) = Ming Men ne stimule plus le Yang Ming. Signe très caractéristique.',
    patterns: [
      'diarrhees matinales', 'diarrhee au petit matin',
      'diarrhees le matin', 'yang ming sans stimulus',
      'gros intestin non active le matin', 'yang ming perturbe',
      'souffles yang ne montent plus', 'yang ne monte pas le matin',
    ],
    regles: ['R2'],
    priorite: 1,
  },

  // ─── Paradoxe Oé/Iong ────────────────────────────────────────────────────────
  {
    id: 'paradoxe_oe_iong',
    label: 'Paradoxe : Oé plein local / Iong vide général',
    categorie: 'syndrome',
    description: 'SPÉCIFIQUE IEATC : chaleur/inflammation locale (Oé en excès) sur fond de vide Yang général (Iong insuffisante). Traiter l\'Iong générale ET disperser l\'Oé locale.',
    patterns: [
      'paradoxe yang local', 'paradoxe local general',
      'vide yang general chaleur locale', 'oé plenitude iong vide',
      'chaleur locale vide general', 'iong vide oe plenitude',
      'vide general inflammation locale',
    ],
    regles: ['R6'],
    priorite: 1,
  },

  // ─── Merveilleux Vaisseaux ───────────────────────────────────────────────────
  {
    id: 'du_mai_insuffisant',
    label: 'Du Mai insuffisant — Yang ne monte plus',
    categorie: 'syndrome',
    description: 'Du Mai (Vaisseau Gouverneur) insuffisant — le Yang de l\'axe dorsal ne monte plus. Ming Men → VG4.',
    patterns: [
      'du mai insuffisant', 'du mai fragilise',
      'yang ne monte plus le long du du mai',
      'yang du dos insuffisant', 'du mai vide',
      'vaisseau gouverneur insuffisant', 'vg insuffisant',
    ],
    regles: ['R2'],
    priorite: 1,
  },
  {
    id: 'ren_mai_fragilise',
    label: 'Ren Mai fragilisé — Yin insuffisant pour ancrer',
    categorie: 'syndrome',
    description: 'Ren Mai (Vaisseau Conception) fragilisé — Yin de base insuffisant, Yang non ancré.',
    patterns: [
      'ren mai fragilise', 'ren mai insuffisant',
      'yin insuffisant pour ancrer', 'yin de base insuffisant',
      'vaisseau conception fragilise', 'vc insuffisant',
    ],
    regles: ['R4'],
    priorite: 1,
  },

  // ─── Spécifiques organiques ─────────────────────────────────────────────────
  {
    id: 'vb_sans_drainage',
    label: 'Vésicule Biliaire sans drainage — reflux vers Foie',
    categorie: 'syndrome',
    description: 'La VB ne se draine plus — chaleur et bile refluent vers le Foie. Amertume, nausées, ictère.',
    patterns: [
      'vb ne se draine pas', 'vesicule biliaire sans drainage',
      'vb sature', 'refluence vers le foie',
      'chaleur vb', 'vesicule en chaleur',
    ],
    priorite: 2,
  },
  {
    id: 'oreille_rein_shao_yang',
    label: 'Oreille interne — domaine Rein / Shao Yang',
    categorie: 'syndrome',
    description: 'L\'oreille est l\'orifice du Rein. Les méridiens TR et VB (Shao Yang) passent dans l\'oreille. Bourdonnements ou surdité = diagnostic différentiel vide/plein.',
    patterns: [
      'oreille interne', 'oreille rein', 'oreille domaine rein',
      'bourdonnements vide', 'bourdonnements rein',
      'surdite vide', 'shao yang oreille', 'tr vb oreille',
      'feu vide irrite oreille',
    ],
    regles: ['R3'],
    priorite: 2,
  },
  {
    id: 'tendons_foie_vb',
    label: 'Tendons / Ligaments — domaine Foie/VB',
    categorie: 'syndrome',
    description: 'Les tendons sont gouvernés par le Foie (Su Wen). Insuffisance du Foie = tendons fragiles, genou vulnérable.',
    patterns: [
      'tendons non nourris', 'tendons insuffisamment nourris',
      'tendons fragiles', 'tendons vulnerables',
      'ligaments non nourris', 'foie ne gouverne plus les tendons',
      'tendons foie vb', 'tendons et ligaments insuffisants',
      'foie vb tendons',
    ],
    regles: ['R4'],
    priorite: 2,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// COUCHE 3 — ORGANES, LOCALISATIONS, VAISSEAUX, ÉLÉMENTS
// ═══════════════════════════════════════════════════════════════════════════════

export const ORGANES_LOCA: ConceptIeatc[] = [

  // ─── Organes Tsang (Zang) ────────────────────────────────────────────────────
  {
    id: 'rein',
    label: 'Rein',
    categorie: 'organe',
    patterns: ['rein', 'reins', 'zang rein'],
  },
  {
    id: 'foie',
    label: 'Foie',
    categorie: 'organe',
    patterns: ['foie', 'zang foie', 'hepatique'],
  },
  {
    id: 'rate',
    label: 'Rate',
    categorie: 'organe',
    patterns: ['rate', 'zang rate'],
  },
  {
    id: 'coeur',
    label: 'Cœur',
    categorie: 'organe',
    patterns: ['coeur', 'zang coeur'],
  },
  {
    id: 'poumon',
    label: 'Poumon',
    categorie: 'organe',
    patterns: ['poumon', 'poumons', 'zang poumon'],
  },
  {
    id: 'maitre_coeur',
    label: 'Maître du Cœur',
    categorie: 'organe',
    patterns: ['maitre du coeur', 'maitre coeur', 'pericarde'],
  },

  // ─── Viscères Fu ─────────────────────────────────────────────────────────────
  {
    id: 'estomac',
    label: 'Estomac',
    categorie: 'organe',
    patterns: ['estomac', 'fu estomac'],
  },
  {
    id: 'vb',
    label: 'Vésicule Biliaire',
    categorie: 'organe',
    patterns: ['vesicule biliaire', 'vesicule', 'vb'],
  },
  {
    id: 'intestin_grele',
    label: 'Intestin Grêle',
    categorie: 'organe',
    patterns: ['intestin grele'],
  },
  {
    id: 'gros_intestin',
    label: 'Gros Intestin',
    categorie: 'organe',
    patterns: ['gros intestin'],
  },
  {
    id: 'vessie',
    label: 'Vessie (méridien)',
    categorie: 'organe',
    patterns: ['meridien vessie', 'meridien v'],
  },
  {
    id: 'triple_rec',
    label: 'Triple Réchauffeur (TR)',
    categorie: 'organe',
    patterns: ['triple rechauffeur', 'tr '],
  },

  // ─── Localisations Trois Foyers ──────────────────────────────────────────────
  {
    id: 'foyer_superieur',
    label: 'Foyer Supérieur',
    categorie: 'localisation',
    patterns: ['foyer superieur'],
  },
  {
    id: 'foyer_moyen',
    label: 'Foyer Moyen',
    categorie: 'localisation',
    patterns: ['foyer moyen'],
  },
  {
    id: 'foyer_inferieur',
    label: 'Foyer Inférieur',
    categorie: 'localisation',
    patterns: ['foyer inferieur'],
  },

  // ─── Merveilleux Vaisseaux ───────────────────────────────────────────────────
  {
    id: 'du_mai',
    label: 'Du Mai (Vaisseau Gouverneur)',
    categorie: 'vaisseau',
    patterns: ['du mai', 'vaisseau gouverneur'],
  },
  {
    id: 'ren_mai',
    label: 'Ren Mai (Vaisseau Conception)',
    categorie: 'vaisseau',
    patterns: ['ren mai', 'vaisseau conception'],
  },
  {
    id: 'yang_qiao',
    label: 'Yang Qiao Mo',
    categorie: 'vaisseau',
    patterns: ['yang qiao', 'yang qiao mo'],
  },
  {
    id: 'yin_qiao',
    label: 'Yin Qiao Mo',
    categorie: 'vaisseau',
    patterns: ['yin qiao', 'yin qiao mo'],
  },

  // ─── Axes Grands Méridiens ───────────────────────────────────────────────────
  {
    id: 'shao_yang',
    label: 'Shao Yang (TR + VB)',
    categorie: 'localisation',
    patterns: ['shao yang'],
  },
  {
    id: 'yang_ming',
    label: 'Yang Ming (E + GI)',
    categorie: 'localisation',
    patterns: ['yang ming'],
  },
  {
    id: 'tai_yin',
    label: 'Tai Yin (Rate + Poumon)',
    categorie: 'localisation',
    patterns: ['tai yin'],
  },
  {
    id: 'jue_yin',
    label: 'Jue Yin (Foie + MC)',
    categorie: 'localisation',
    patterns: ['jue yin'],
  },

  // ─── Éléments wuxing ─────────────────────────────────────────────────────────
  {
    id: 'element_eau',
    label: 'Eau (Rein / VB)',
    categorie: 'element',
    patterns: ['element eau', 'eau element'],
  },
  {
    id: 'element_bois',
    label: 'Bois (Foie / VB)',
    categorie: 'element',
    patterns: ['element bois', 'bois element'],
  },
  {
    id: 'element_feu',
    label: 'Feu (Cœur / IG)',
    categorie: 'element',
    patterns: ['element feu', 'feu element'],
  },
  {
    id: 'element_terre',
    label: 'Terre (Rate / Estomac)',
    categorie: 'element',
    patterns: ['element terre', 'terre element'],
  },
  {
    id: 'element_metal',
    label: 'Métal (Poumon / GI)',
    categorie: 'element',
    patterns: ['element metal', 'metal element'],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// COUCHE 4 — STRATÉGIES THÉRAPEUTIQUES NORMALISÉES
// Les grands axes de traitement reconnus dans les textes de stratégie
// ═══════════════════════════════════════════════════════════════════════════════

export const STRATEGIES_IEATC: ConceptIeatc[] = [
  {
    id: 'equilibrer_yy',
    label: 'Équilibrer le Yin/Yang général',
    categorie: 'strategie',
    description: 'Étape 1 du protocole IEATC — toujours en premier.',
    patterns: [
      'equilibrer le yin yang', 'traiter le yy', 'traiter le yin yang general',
      'equilibre yin yang', 'yin yang general', 'yy general',
    ],
    regles: ['R1', 'R2'],
    priorite: 1,
  },
  {
    id: 'tonifier_yang_general',
    label: 'Tonifier le Yang général',
    categorie: 'strategie',
    patterns: [
      'tonifier le yang general', 'tonification yang general',
      'soutenir le yang general', 'yang general tonifie',
    ],
    priorite: 1,
  },
  {
    id: 'tonifier_yang_rein',
    label: 'Tonifier le Yang du Rein / Ming Men',
    categorie: 'strategie',
    description: 'Avec moxas en priorité (VG4, V23).',
    patterns: [
      'tonifier le yang du rein', 'tonifier yang rein',
      'tonifier ming men', 'ranimer le feu du ming men',
      'ranimer ming men', 'soutenir le yang du rein',
      'augmenter le feu du ming men',
    ],
    regles: ['R2'],
    priorite: 1,
  },
  {
    id: 'nourrir_yin_rein',
    label: 'Nourrir le Yin du Rein',
    categorie: 'strategie',
    description: 'Stratégie indirecte pour le Yang du Foie montant — traiter la cause, pas le symptôme.',
    patterns: [
      'nourrir le yin du rein', 'nourrir yin rein',
      'tonifier le yin du rein', 'soutenir le yin du rein',
      'yin du rein tonifie', 'nourrir l eau',
      'nourrir la base yin',
    ],
    regles: ['R4'],
    priorite: 1,
  },
  {
    id: 'disperser_yang_foie',
    label: 'Disperser / Abaisser le Yang du Foie',
    categorie: 'strategie',
    description: 'Traitement secondaire — toujours après avoir nourri le Yin du Rein (R4).',
    patterns: [
      'disperser le yang du foie', 'abaisser le yang du foie',
      'disperser yang foie', 'descendre le yang du foie',
      'calmer le yang du foie', 'yang foie dispersé',
    ],
    regles: ['R4'],
    priorite: 2,
  },
  {
    id: 'clarifier_feu_vide',
    label: 'Clarifier le Feu du vide (tonifier Yin)',
    categorie: 'strategie',
    description: 'RÈGLE CRITIQUE : clarifier = tonifier le Yin, PAS disperser la chaleur.',
    patterns: [
      'clarifier le feu du vide', 'clarifier feu vide',
      'traiter le feu du vide', 'tonifier le yin clarifier',
      'nourrir le yin pour clarifier',
    ],
    regles: ['R3'],
    priorite: 1,
  },
  {
    id: 'pacifier_vent_interne',
    label: 'Pacifier le Vent interne du Foie',
    categorie: 'strategie',
    patterns: [
      'pacifier le vent interne', 'pacifier vent interne',
      'calmer le vent interne', 'vent interne pacifie',
    ],
    regles: ['R4'],
    priorite: 2,
  },
  {
    id: 'disperser_foyer_moyen',
    label: 'Disperser le Foyer Moyen (excès de Yin)',
    categorie: 'strategie',
    description: 'RÈGLE DES 3 FOYERS : traiter le Foyer Moyen plein AVANT le Foyer Inférieur vide.',
    patterns: [
      'disperser le foyer moyen', 'lever l exces de yin au foyer moyen',
      'lever l exces yin foyer moyen', 'disperser la plenitude du foyer moyen',
      'vider le foyer moyen', 'abaisser le foyer moyen',
    ],
    regles: ['R5'],
    priorite: 1,
  },
  {
    id: 'tonifier_foyer_inferieur',
    label: 'Tonifier le Foyer Inférieur',
    categorie: 'strategie',
    patterns: [
      'tonifier le foyer inferieur', 'soutenir le foyer inferieur',
      'tonification foyer inferieur', 'renforcer le foyer inferieur',
    ],
    regles: ['R2'],
    priorite: 1,
  },
  {
    id: 'relancer_cycle_sheng',
    label: 'Relancer le cycle Sheng Eau → Bois',
    categorie: 'strategie',
    patterns: [
      'relancer le cycle sheng', 'nourrir l eau pour relancer le bois',
      'relancer cycle sheng', 'relancer sheng eau bois',
      'nourrir eau pour bois', 'relancer l eau et le bois',
    ],
    regles: ['R4'],
    priorite: 1,
  },
  {
    id: 'lever_humidite',
    label: 'Lever l\'humidité',
    categorie: 'strategie',
    patterns: [
      'lever l humidite', 'disperser l humidite',
      'drainer l humidite', 'eliminer l humidite',
      'dispersion humidite', 'drainage humidite',
    ],
    priorite: 2,
  },
  {
    id: 'liberer_meridien',
    label: 'Libérer / Débloquer le méridien',
    categorie: 'strategie',
    patterns: [
      'liberer le meridien', 'debloquer le meridien',
      'lever l obstruction meridienne', 'liberer la circulation meridienne',
      'ouvrir le meridien',
    ],
    priorite: 2,
  },
  {
    id: 'pacifier_shen',
    label: 'Pacifier le Shen (Cœur)',
    categorie: 'strategie',
    patterns: [
      'pacifier le shen', 'calmer le shen', 'shen pacifie',
      'apaiser le coeur', 'calmer le coeur', 'soutenir le coeur',
    ],
    priorite: 2,
  },
  {
    id: 'tonifier_iong',
    label: 'Tonifier l\'Iong (Ying Qi)',
    categorie: 'strategie',
    description: 'Traitement général en cas de paradoxe Oé/Iong.',
    patterns: [
      'tonifier l iong', 'tonifier l iong generale',
      'tonification iong', 'nourrir l iong', 'soutenir l iong',
    ],
    regles: ['R6'],
    priorite: 1,
  },
  {
    id: 'disperser_oe',
    label: 'Disperser l\'Oé locale',
    categorie: 'strategie',
    patterns: [
      'disperser l oe', 'disperser l oe locale', 'disperser l oe en exces',
      'dispersion oe', 'vider l oe locale',
    ],
    regles: ['R6'],
    priorite: 2,
  },
  {
    id: 'nourrir_sang',
    label: 'Nourrir le Sang',
    categorie: 'strategie',
    patterns: [
      'nourrir le sang', 'tonifier le sang', 'soutenir le sang',
      'nourrir le xue',
    ],
    priorite: 1,
  },
  {
    id: 'calmer_bois',
    label: 'Calmer le Bois (Foie/VB en excès)',
    categorie: 'strategie',
    patterns: [
      'calmer le bois', 'calmer le foie', 'disperser le bois',
      'apaiser le bois', 'drainer le foie',
    ],
    regles: ['R7'],
    priorite: 2,
  },
  {
    id: 'consolider_terre',
    label: 'Consolider la Terre (Rate/Estomac)',
    categorie: 'strategie',
    patterns: [
      'consolider la terre', 'soutenir la rate', 'consolider rate estomac',
      'soutenir la rate estomac', 'tonifier la rate',
    ],
    regles: ['R7'],
    priorite: 2,
  },
  {
    id: 'traitement_local',
    label: 'Traitement local (dernier temps)',
    categorie: 'strategie',
    description: 'Le traitement local vient TOUJOURS en dernier, après avoir équilibré le général.',
    patterns: [
      'traitement local', 'traitement local en dernier', 'local en dernier',
      'traiter localement', 'traitement secondaire local',
    ],
    regles: ['R2'],
    priorite: 3,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// COUCHE 5 — PATHOLOGIES / MOTIFS DE CONSULTATION
// Normalise les présentations cliniques en entités statistiques.
// Source principale : ClinicalCase.content.motif (motif de consultation).
// Chaque entrée regroupe toutes les variantes d'expression d'une même plainte.
// ═══════════════════════════════════════════════════════════════════════════════

export const PATHOLOGIES_IEATC: ConceptIeatc[] = [

  // ─── Douleurs locomotrices ───────────────────────────────────────────────────
  {
    id: 'lombalgie',
    label: 'Lombalgie / Douleur lombaire',
    categorie: 'pathologie',
    patterns: [
      'lombalgie', 'lombalgies', 'lumbago',
      'douleur lombaire', 'douleurs lombaires',
      'mal de dos', 'mal au dos', 'douleur au dos',
      'douleur bas du dos', 'douleur en bas du dos',
    ],
  },
  {
    id: 'cervicalgie',
    label: 'Cervicalgie / Douleur cervicale',
    categorie: 'pathologie',
    patterns: [
      'cervicalgie', 'cervicalgies',
      'douleur cervicale', 'douleurs cervicales',
      'douleur au cou', 'douleur dans le cou',
      'raideur cervicale', 'raideur du cou',
      'torticolis', 'nuque douloureuse', 'nuque raide',
    ],
  },
  {
    id: 'tendinite',
    label: 'Tendinite / Tendinopathie',
    categorie: 'pathologie',
    patterns: [
      'tendinite', 'tendinites', 'tendinopathie', 'tendinopathies', 'tendinose',
      'epicondylite', 'epicondylites', 'epicondyle',
      'epitrochleite', 'rotulien', 'tendon',
      'periarthrite', 'coiffe des rotateurs',
    ],
  },
  {
    id: 'gonalgie',
    label: 'Gonalgie / Douleur de genou',
    categorie: 'pathologie',
    patterns: [
      'gonalgie', 'gonalgies',
      'douleur genou', 'douleur au genou', 'douleurs genou',
      'douleur du genou', 'genou douloureux', 'genou droit', 'genou gauche',
      'chondropathie', 'menisque',
    ],
  },
  {
    id: 'sciatique',
    label: 'Sciatique / Névralgie sciatique',
    categorie: 'pathologie',
    patterns: [
      'sciatique', 'sciatalgie', 'nevralgique sciatique',
      'irradiation sciatique', 'douleur irradiante jambe',
      'douleur irradiation fessiere', 'crural',
    ],
  },
  {
    id: 'epaule_douloureuse',
    label: 'Épaule douloureuse',
    categorie: 'pathologie',
    patterns: [
      'epaule douloureuse', 'douleur epaule', 'douleur a l epaule',
      'douleur de l epaule', 'blocage epaule', 'epaule bloquee',
      'epaule droite', 'epaule gauche',
    ],
  },
  {
    id: 'arthralgie',
    label: 'Arthralgie / Arthrite / Goutte',
    categorie: 'pathologie',
    patterns: [
      'arthralgie', 'arthralgies', 'arthrite', 'arthrites',
      'douleur articulaire', 'douleurs articulaires',
      'polyarthrite', 'rhumatisme', 'rhumatismes',
      'goutte', 'crise de goutte', 'hyperuricemie',
    ],
  },

  // ─── Neurologie / Tête ───────────────────────────────────────────────────────
  {
    id: 'cephalees',
    label: 'Céphalées / Migraines',
    categorie: 'pathologie',
    patterns: [
      'cephalee', 'cephalees', 'migraine', 'migraines',
      'mal de tete', 'maux de tete', 'mal a la tete',
      'douleur cephalique', 'cephalee temporale', 'cephalee frontale',
      'cephalee occipitale', 'algie de la face',
    ],
  },
  {
    id: 'vertiges',
    label: 'Vertiges / Étourdissements',
    categorie: 'pathologie',
    patterns: [
      'vertige', 'vertiges', 'etourdissement', 'etourdissements',
      'sensation de vertige', 'instabilite', 'troubles de l equilibre',
    ],
  },
  {
    id: 'acouphenes',
    label: 'Acouphènes / Bourdonnements d\'oreille',
    categorie: 'pathologie',
    patterns: [
      'acouphene', 'acouphenes', 'bourdonnement', 'bourdonnements',
      'bourdonnement d oreille', 'bourdonnements d oreille',
      'tinnitus', 'sifflement oreille', 'sifflements oreille',
    ],
  },

  // ─── Sommeil / Psychisme ─────────────────────────────────────────────────────
  {
    id: 'insomnie',
    label: 'Insomnie / Troubles du sommeil',
    categorie: 'pathologie',
    patterns: [
      'insomnie', 'insomnies', 'trouble du sommeil', 'troubles du sommeil',
      'difficulte a dormir', 'difficultes a dormir',
      'difficulte d endormissement', 'endormissement difficile',
      'sommeil perturbe', 'sommeil de mauvaise qualite',
      'reveil nocturne', 'reveils nocturnes', 'reveil precoce',
    ],
  },
  {
    id: 'anxiete',
    label: 'Anxiété / Stress',
    categorie: 'pathologie',
    patterns: [
      'anxiete', 'stress', 'angoisse', 'angoisses',
      'nervosité', 'nervosité excessive',
      'agitation', 'irritabilite',
      'burn out', 'burnout', 'epuisement professionnel',
    ],
  },
  {
    id: 'depression',
    label: 'Dépression / Mélancolie',
    categorie: 'pathologie',
    patterns: [
      'depression', 'depressions', 'deprime', 'abattement',
      'melancolie', 'tristesse persistante', 'humeur sombre',
    ],
  },

  // ─── Digestif ────────────────────────────────────────────────────────────────
  {
    id: 'diarrhees',
    label: 'Diarrhées / Transit accéléré',
    categorie: 'pathologie',
    patterns: [
      'diarrhee', 'diarrhees', 'selles molles', 'selles liquides',
      'transit accelere', 'colon irritable', 'intestin irritable',
      'syndrome intestin irritable', 'sii', 'colite',
    ],
  },
  {
    id: 'constipation',
    label: 'Constipation',
    categorie: 'pathologie',
    patterns: [
      'constipation', 'constipations', 'selles dures',
      'transit lent', 'difficulte a aller a la selle',
    ],
  },
  {
    id: 'ballonnements',
    label: 'Ballonnements / Distension abdominale',
    categorie: 'pathologie',
    patterns: [
      'ballonnement', 'ballonnements', 'distension abdominale',
      'gaz intestinaux', 'flatulences', 'meteorisme',
      'ventre gonflé', 'ventre gonfle', 'abdomen distendu',
    ],
  },
  {
    id: 'nausees',
    label: 'Nausées / Vomissements',
    categorie: 'pathologie',
    patterns: [
      'nausee', 'nausees', 'vomissement', 'vomissements',
      'sensation de nausee', 'envie de vomir',
    ],
  },
  {
    id: 'reflux',
    label: 'Reflux / RGO / Brûlures d\'estomac',
    categorie: 'pathologie',
    patterns: [
      'reflux', 'rgo', 'pyrosis', 'brulure estomac', 'brulures estomac',
      'remontees acides', 'acidite gastrique', 'gastrite',
    ],
  },

  // ─── Cardiovasculaire ────────────────────────────────────────────────────────
  {
    id: 'palpitations',
    label: 'Palpitations / Arythmie',
    categorie: 'pathologie',
    patterns: [
      'palpitation', 'palpitations', 'tachycardie',
      'arythmie', 'extrasystole', 'extrasystoles',
      'coeur qui s emballe', 'coeur rapide',
    ],
  },
  {
    id: 'hypertension',
    label: 'Hypertension artérielle (HTA)',
    categorie: 'pathologie',
    patterns: [
      'hypertension', 'hta', 'tension elevee', 'tension arterielle elevee',
      'pression arterielle haute', 'tension trop haute',
    ],
  },

  // ─── Gynécologie ─────────────────────────────────────────────────────────────
  {
    id: 'dysmenorrhee',
    label: 'Dysménorrhée / Règles douloureuses',
    categorie: 'pathologie',
    patterns: [
      'dysmenorrhee', 'regles douloureuses', 'douleurs menstruelles',
      'crampes menstruelles', 'douleurs regles', 'douleur regles',
      'douleur pendant les regles', 'algodysmenorrhee',
    ],
  },
  {
    id: 'irregularite_menstruelle',
    label: 'Irrégularité menstruelle / Aménorrhée',
    categorie: 'pathologie',
    patterns: [
      'amenorrhee', 'absence de regles', 'regles absentes',
      'irregularite menstruelle', 'regles irregulieres', 'cycle irregulier',
      'oligomenorrhee', 'spanioménorrhée', 'cycles trop longs',
    ],
  },
  {
    id: 'spm',
    label: 'Syndrome prémenstruel (SPM)',
    categorie: 'pathologie',
    patterns: [
      'spm', 'syndrome premenstruel', 'premenstruel',
      'syndrome pre menstruel', 'tension premenstruelle',
    ],
  },

  // ─── Respiratoire ────────────────────────────────────────────────────────────
  {
    id: 'toux',
    label: 'Toux / Toux chronique',
    categorie: 'pathologie',
    patterns: [
      'toux', 'toux chronique', 'toux seche', 'toux grasse',
      'toux persistante', 'toux irritative',
    ],
  },
  {
    id: 'asthme',
    label: 'Asthme / Dyspnée',
    categorie: 'pathologie',
    patterns: [
      'asthme', 'dyspnee', 'essoufflement', 'difficulte respiratoire',
      'difficultes respiratoires', 'oppression thoracique',
      'souffle court', 'gene respiratoire',
    ],
  },
  {
    id: 'sinusite',
    label: 'Sinusite / Rhinite / Rhume',
    categorie: 'pathologie',
    patterns: [
      'sinusite', 'sinusites', 'rhinite', 'rhinites',
      'congestion nasale', 'nez bouche', 'rhume chronique',
      'rhino sinusite', 'ecoulement nasal', 'mouchage frequent',
    ],
  },

  // ─── Uro-génital ─────────────────────────────────────────────────────────────
  {
    id: 'pollakiurie',
    label: 'Pollakiurie / Mictions fréquentes',
    categorie: 'pathologie',
    patterns: [
      'pollakiurie', 'mictions frequentes', 'envie frequente d uriner',
      'envie d uriner souvent', 'incontinence urinaire', 'fuites urinaires',
      'besoins frequents', 'urgences mictionnelles',
    ],
  },
  {
    id: 'nycturie',
    label: 'Nycturie / Réveils nocturnes pour uriner',
    categorie: 'pathologie',
    patterns: [
      'nycturie', 'nycturiés', 'se lever la nuit pour uriner',
      'lever la nuit', 'mictions nocturnes', 'reveils pour uriner',
      'envie d uriner la nuit',
    ],
  },

  // ─── Général ─────────────────────────────────────────────────────────────────
  {
    id: 'fatigue',
    label: 'Fatigue / Asthénie',
    categorie: 'pathologie',
    patterns: [
      'fatigue', 'fatigues', 'asthenie', 'epuisement',
      'manque d energie', 'manque d energies', 'fatigue chronique',
      'fatigue generale', 'grande fatigue', 'tres fatigue',
    ],
  },

  // ─── Peau ────────────────────────────────────────────────────────────────────
  {
    id: 'eczema',
    label: 'Eczéma / Prurit / Dermatite',
    categorie: 'pathologie',
    patterns: [
      'eczema', 'dermatite', 'prurit', 'demangeaison', 'demangeaisons',
      'psoriasis', 'urticaire', 'eruption cutanee',
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// API DE NORMALISATION
// ═══════════════════════════════════════════════════════════════════════════════

/** Table complète : tous les concepts (familles + syndromes + organes + stratégies + pathologies) */
const TOUS_CONCEPTS: ConceptIeatc[] = [
  ...FAMILLES_DIAG,
  ...SYNDROMES_IEATC,
  ...ORGANES_LOCA,
  ...STRATEGIES_IEATC,
  ...PATHOLOGIES_IEATC,
];

/**
 * Extrait tous les concepts IEATC reconnus dans un texte libre.
 * Retourne les IDs groupés par catégorie.
 */
export function extraireConceptsIeatc(texte: string): {
  familles: string[];
  syndromes: string[];
  organes: string[];
  strategies: string[];
  pathologies: string[];
} {
  const n = normaliserTexteIeatc(texte);

  const familles: string[] = [];
  const syndromes: string[] = [];
  const organes: string[] = [];
  const strategies: string[] = [];
  const pathologies: string[] = [];

  for (const concept of TOUS_CONCEPTS) {
    if (!concept.patterns.some((p) => matchPattern(n, p))) continue;
    switch (concept.categorie) {
      case 'famille_diag':
        familles.push(concept.id);
        break;
      case 'syndrome':
        syndromes.push(concept.id);
        break;
      case 'organe':
      case 'localisation':
      case 'vaisseau':
      case 'element':
        organes.push(concept.id);
        break;
      case 'strategie':
        strategies.push(concept.id);
        break;
      case 'pathologie':
        pathologies.push(concept.id);
        break;
    }
  }

  return { familles, syndromes, organes, strategies, pathologies };
}

/**
 * Normalise un ensemble de textes (ex : categoriesDiagnostiques d'une analyse)
 * et agrège les concepts sans doublons pour une même analyse.
 */
export function normaliserTextes(textes: string[]): {
  familles: string[];
  syndromes: string[];
  organes: string[];
  strategies: string[];
  pathologies: string[];
} {
  const f = new Set<string>();
  const s = new Set<string>();
  const o = new Set<string>();
  const st = new Set<string>();
  const pa = new Set<string>();

  for (const t of textes) {
    const r = extraireConceptsIeatc(t);
    r.familles.forEach((x) => f.add(x));
    r.syndromes.forEach((x) => s.add(x));
    r.organes.forEach((x) => o.add(x));
    r.strategies.forEach((x) => st.add(x));
    r.pathologies.forEach((x) => pa.add(x));
  }

  return {
    familles: [...f],
    syndromes: [...s],
    organes: [...o],
    strategies: [...st],
    pathologies: [...pa],
  };
}

/**
 * Retourne le label canonique d'un concept par son id.
 * Retourne l'id tel quel si inconnu.
 */
export function labelConceptIeatc(id: string): string {
  return TOUS_CONCEPTS.find((c) => c.id === id)?.label ?? id;
}

/**
 * Retourne la description clinique d'un concept.
 */
export function descriptionConceptIeatc(id: string): string | undefined {
  return TOUS_CONCEPTS.find((c) => c.id === id)?.description;
}

/**
 * Retourne les règles cliniques associées à un concept (ex : ['R3', 'R4']).
 */
export function reglesConceptIeatc(id: string): string[] {
  return TOUS_CONCEPTS.find((c) => c.id === id)?.regles ?? [];
}

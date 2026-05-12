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
  /**
   * ID de la famille-mère dans FAMILLES_DIAG.
   * Quand ce syndrome est reconnu dans un texte, sa famille-mère ne doit PAS
   * être comptée séparément dans les stats (évite le double comptage).
   * Exemple : vide_yin_rein (syndrome) couvre vide_yin (famille).
   */
  parentFamilleId?: string;
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
    description: 'Excès de Yang — chaleur, rougeur, agitation, plein. (Yang Shi — plénitude Yang réelle, distincte du Yang apparent produit par vide de Yin)',
    patterns: [
      'exces de yang', 'exces yang', 'yang en exces', 'plenitude yang',
      'plenitude de yang', 'yang plenitude', 'trop de yang',
      'yang trop fort', 'yang excessif', 'yang local', 'yang en plenitude',
      'plenitude yang reelle', 'yang en plein', 'yang reel en exces',
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
      'stagnation yang', 'yang en stagnation', 'yang bloque au',
      'blocage de la circulation', 'blocage de la descente',
      'blocage circulation meridienne',
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
      'obstruction chronique du meridien', 'obstruction chronique',
      'meridien vb obstrue', 'meridien foie obstrue', 'meridien rein obstrue',
      'meridien vb bloque', 'meridien foie bloque',
      'vide meridien', 'meridien en vide', 'stagnation dans le meridien',
      'stagnation locale sur terrain de vide meridien',
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
      'chaleur locale', 'plenitude chaleur', 'chaleur en plenitude',
      'feu montant', 'feu qui monte',
    ],
    regles: ['R3'],
    priorite: 2,
  },
  {
    id: 'feu_vide',
    label: 'Feu du vide (Xu Huo) — Chaleur de Vide',
    categorie: 'famille_diag',
    description: 'CRITIQUE : chaleur produite par un vide de Yin, pas par un excès. NE JAMAIS disperser — tonifier le Yin. = Yang apparent : le Yang monte non parce qu\'il est en excès, mais parce que le Yin ne l\'ancre plus. Traitement : TONIFIER le Yin — JAMAIS disperser.',
    patterns: [
      'feu du vide', 'chaleur de vide', 'feu de vide', 'xu huo',
      'chaleur xu', 'chaleur vide', 'vide avec chaleur',
      'chaleur d origine xu', 'yang relatif ascendant',
      'chaleur vesperal', 'chaleur le soir', 'chaleur en fin de journee',
      'yang apparent', 'faux yang', 'yang flottant',
      'yang non ancre', 'yang sans racine', 'yang qui flotte',
      'chaleur apparente', 'chaleur fausse', 'jia yang',
      'yin ne peut plus ancrer', 'yang monte par manque de yin',
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
      'l humidite', 'envahi par l humidite', 'humidite envahissante',
      'humidite stagnante', 'humidite predominante', 'terrain humide',
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

  // ─── Tan (Phlegme / Flegme) ─────────────────────────────────────────────────
  {
    id: 'tan',
    label: 'Tan (Phlegme / Flegme)',
    categorie: 'famille_diag',
    description: 'Humidité épaissi en Phlegme (Tan). Obstrue méridiens, orifices, organes. Traitement long — dissoudre progressivement.',
    patterns: [
      'phlegme', 'flegme', 'glaires pathogenes', 'mucus pathologique',
      'accumulation de tan', 'retention de tan', 'formation de tan',
      'production de tan', 'tan obstrue', 'tan dans les meridiens',
      'tan humide', 'tan chaud', 'tan froid', 'tan vent',
      'humidite epaissie', 'humidite epaissie en tan',
      'humidite transformee en tan', 'obstruction par le tan',
      'phlegme obstruant', 'phlegme accumule',
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
    parentFamilleId: 'vide_yang',
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
    parentFamilleId: 'vide_yang',
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
    parentFamilleId: 'vide_yin',
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
    parentFamilleId: 'vide_jing',
  },
  {
    id: 'vide_qi_poumon',
    label: 'Vide de Qi du Poumon (Métal insuffisant)',
    categorie: 'syndrome',
    description: 'Insuffisance du Qi du Poumon — souffle court, fatigue profonde, voix faible, transpiration spontanée. Le Poumon gouverne le Qi et la respiration.',
    patterns: [
      'vide de qi du poumon', 'vide qi poumon', 'poumon qi vide',
      'poumon en vide de qi', 'qi du poumon vide', 'qi du poumon insuffisant',
      'insuffisance qi poumon', 'poumon affaibli', 'qi pulmonaire insuffisant',
      'metal insuffisant', 'vide du metal', 'element metal vide',
      'souffle insuffisant', 'souffle affaibli', 'fatigue profonde poumon',
    ],
    priorite: 1,
    parentFamilleId: 'vide_qi',
  },

  // ─── Syndromes du Poumon ─────────────────────────────────────────────────────
  {
    id: 'vide_yin_poumon',
    label: 'Vide de Yin du Poumon',
    categorie: 'syndrome',
    description: 'Yin du Poumon insuffisant — toux sèche, raucité, chaleur vespérale, sécheresse des muqueuses.',
    patterns: [
      'vide de yin du poumon', 'yin du poumon vide', 'poumon yin vide',
      'vide yin poumon', 'insuffisance yin poumon', 'yin pulmonaire vide',
      'poumon sec', 'muqueuses seches poumon', 'secheresse du poumon',
      'yin du metal vide', 'metal en vide de yin',
      'poumon ne peut plus humidifier', 'muqueuses non humidifiees',
    ],
    priorite: 1,
    parentFamilleId: 'vide_yin',
  },
  {
    id: 'chaleur_poumon',
    label: 'Chaleur du Poumon',
    categorie: 'syndrome',
    description: 'Chaleur dans le Poumon — toux avec expectorations jaunes, fièvre, narines dilatées.',
    patterns: [
      'chaleur du poumon', 'poumon en chaleur', 'feu du poumon',
      'chaleur poumon', 'poumon chaud', 'chaleur metal',
      'chaleur dans le poumon', 'inflammation poumon',
      'poumon envahi par la chaleur',
    ],
    priorite: 2,
    parentFamilleId: 'chaleur',
  },
  {
    id: 'vent_froid_poumon',
    label: 'Vent-Froid envahissant le Poumon',
    categorie: 'syndrome',
    description: 'Invasion de Vent-Froid dans le Poumon — rhume, frissons, toux, congestion nasale.',
    patterns: [
      'vent froid poumon', 'vent froid envahit le poumon',
      'invasion vent froid', 'poumon envahi par le vent froid',
      'agression vent froid', 'vent froid en surface',
      'poumon attaque par le vent', 'invasion externe poumon',
      'poumon sous vent froid',
    ],
    priorite: 2,
    parentFamilleId: 'vent_externe',
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
      'foie en plenitude yang', 'yang du foie en plenitude',
      'yang du foie en exces reel',
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
    parentFamilleId: 'vent_interne',
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
    parentFamilleId: 'chaleur',
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
      'vide du foie', 'vide du zang foie', 'foie en vide',
      'zang foie vide', 'foie affaibli', 'tsang foie vide',
    ],
    priorite: 1,
    parentFamilleId: 'vide_sang',
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
    parentFamilleId: 'vide_yin',
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
    parentFamilleId: 'stagnation_qi',
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
      'terre fragilisee', 'rate fragilisee secondairement',
      'terre affaiblie secondairement',
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
      'eau ne soutient plus le bois', 'foie non nourri par le rein',
      'rein ne soutient plus le foie', 'insuffisance eau vers bois',
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

  // ─── Cycles Sheng supplémentaires ────────────────────────────────────────────
  {
    id: 'cycle_sheng_feu_terre',
    label: 'Cycle Sheng Feu → Terre brisé (Cœur ne nourrit plus Rate)',
    categorie: 'syndrome',
    description: 'Le Cœur (Feu) n\'alimente plus la Rate (Terre) — fatigue digestive profonde sur fond de faiblesse cardiaque.',
    patterns: [
      'feu ne nourrit plus terre', 'cycle sheng feu terre',
      'coeur ne nourrit plus la rate', 'feu vers terre defaillant',
      'cascade feu terre', 'coeur rate cycle sheng',
      'feu insuffisant pour la terre',
    ],
    priorite: 1,
  },
  {
    id: 'cycle_sheng_terre_metal',
    label: 'Cycle Sheng Terre → Métal brisé (Rate ne nourrit plus Poumon)',
    categorie: 'syndrome',
    description: 'La Rate (Terre) n\'alimente plus le Poumon (Métal) — infections respiratoires répétées sur fond de vide digestif.',
    patterns: [
      'terre ne nourrit plus metal', 'cycle sheng terre metal',
      'rate ne nourrit plus le poumon', 'terre vers metal defaillant',
      'cascade terre metal', 'rate poumon cycle sheng',
      'digestion ne soutient plus le poumon', 'rate ne soutient plus poumon',
    ],
    priorite: 1,
  },
  {
    id: 'cycle_sheng_metal_eau',
    label: 'Cycle Sheng Métal → Eau brisé (Poumon ne nourrit plus Rein)',
    categorie: 'syndrome',
    description: 'Le Poumon (Métal) ne diffuse plus vers le Rein (Eau) — vide de Yin du Rein secondaire à un vide du Poumon.',
    patterns: [
      'metal ne nourrit plus eau', 'cycle sheng metal eau',
      'poumon ne nourrit plus le rein', 'metal vers eau defaillant',
      'cascade metal eau', 'poumon rein cycle sheng',
      'diffusion du poumon vers le rein insuffisante',
      'poumon ne soutient plus le rein',
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
    parentFamilleId: 'chaleur',
  },

  // ─── Syndromes du Cœur supplémentaires ──────────────────────────────────────
  {
    id: 'vide_qi_coeur',
    label: 'Vide de Qi du Cœur',
    categorie: 'syndrome',
    description: 'Qi du Cœur insuffisant — palpitations légères à l\'effort, essoufflement, fatigue, pouls vide.',
    patterns: [
      'vide de qi du coeur', 'vide qi coeur', 'coeur qi vide',
      'qi du coeur vide', 'qi du coeur insuffisant',
      'insuffisance qi coeur', 'coeur en vide de qi',
      'coeur affaibli', 'qi cardiaque insuffisant',
      'feu insuffisant coeur', 'coeur en vide',
    ],
    priorite: 1,
    parentFamilleId: 'vide_qi',
  },
  {
    id: 'vide_yin_coeur',
    label: 'Vide de Yin du Cœur',
    categorie: 'syndrome',
    description: 'Yin du Cœur insuffisant — insomnie, chaleur vespérale, sueurs nocturnes, palpitations, anxiété.',
    patterns: [
      'vide de yin du coeur', 'yin du coeur vide', 'coeur yin vide',
      'vide yin coeur', 'insuffisance yin coeur',
      'coeur ne peut plus ancrer le shen', 'yin cardiaque vide',
      'yin coeur insuffisant', 'vide de yin cardiaque',
    ],
    regles: ['R3'],
    priorite: 1,
    parentFamilleId: 'vide_yin',
  },
  {
    id: 'vide_yang_coeur',
    label: 'Vide de Yang du Cœur',
    categorie: 'syndrome',
    description: 'Yang du Cœur insuffisant — froid thoracique, dyspnée, pouls profond lent, teint pâle-bleuté.',
    patterns: [
      'vide de yang du coeur', 'yang du coeur vide', 'coeur yang vide',
      'vide yang coeur', 'insuffisance yang coeur',
      'yang cardiaque insuffisant', 'coeur froid', 'froid thoracique',
      'yang du coeur insuffisant',
    ],
    regles: ['R1', 'R2'],
    priorite: 1,
    parentFamilleId: 'vide_yang',
  },
  {
    id: 'vide_sang_coeur',
    label: 'Vide de Sang du Cœur',
    categorie: 'syndrome',
    description: 'Sang du Cœur insuffisant — palpitations, rêves agités, mémoire faible, visage terne.',
    patterns: [
      'vide de sang du coeur', 'sang du coeur vide', 'coeur sang vide',
      'sang coeur insuffisant', 'coeur non nourri par le sang',
      'sang insuffisant pour nourrir le coeur',
      'xue du coeur vide', 'vide sang coeur',
    ],
    priorite: 1,
    parentFamilleId: 'vide_sang',
  },
  {
    id: 'tan_coeur',
    label: 'Tan obstruant le Cœur (Phlegme-Feu)',
    categorie: 'syndrome',
    description: 'Phlegme obstruant les orifices du Cœur — confusion mentale, agitation, manie.',
    patterns: [
      'tan obstrue le coeur', 'phlegme coeur', 'flegme coeur',
      'tan coeur', 'phlegme feu coeur', 'tan feu monte au coeur',
      'coeur obstrue par le tan', 'orifices du coeur obstrues',
      'phlegme obscurcit le coeur', 'tan obscurcit les orifices',
    ],
    priorite: 2,
    parentFamilleId: 'tan',
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
      'rechauffeur moyen non soutenu', 'yang insuffisant pour rechauffer',
      'rechauffeur moyen insuffisant', 'foyer moyen non alimente',
    ],
    regles: ['R2'],
    priorite: 2,
    parentFamilleId: 'vide_yang',
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
      'exces de yin au foyer moyen', 'plenitude de yin au foyer moyen',
      'plenitude yin au foyer moyen', 'plenitude de yin foyer moyen',
      'exces de yin foyer moyen', 'yin en exces au foyer moyen',
      'foyer moyen en exces de yin', 'exces yin au foyer moyen',
    ],
    regles: ['R5'],
    priorite: 1,
    parentFamilleId: 'exces_yin',
  },

  // ─── Syndromes de la Rate / Estomac supplémentaires ─────────────────────────
  {
    id: 'vide_qi_rate',
    label: 'Vide de Qi de la Rate',
    categorie: 'syndrome',
    description: 'Qi de la Rate insuffisant — digestion lente, fatigue post-prandiale, selles molles, membres lourds.',
    patterns: [
      'vide de qi de la rate', 'vide qi rate', 'rate qi vide',
      'qi de la rate vide', 'qi de la rate insuffisant',
      'insuffisance qi rate', 'rate en vide de qi',
      'rate affaiblie', 'rate insuffisante', 'zang rate vide',
      'rate non soutenue', 'rate carencee', 'rate fragilisee',
      'digestion insuffisante par vide de rate',
    ],
    priorite: 1,
    parentFamilleId: 'vide_qi',
  },
  {
    id: 'vide_yang_rate',
    label: 'Vide de Yang de la Rate',
    categorie: 'syndrome',
    description: 'Yang de la Rate insuffisant — digestion froide, membres froids, diarrhées, œdèmes.',
    patterns: [
      'vide de yang de la rate', 'vide yang rate', 'rate yang vide',
      'yang de la rate vide', 'yang rate insuffisant',
      'insuffisance yang rate', 'rate en vide de yang',
      'rate froide', 'yang splenique insuffisant',
      'vide yang splenique',
    ],
    priorite: 1,
    parentFamilleId: 'vide_yang',
  },
  {
    id: 'humidite_rate',
    label: 'Humidité envahissant la Rate',
    categorie: 'syndrome',
    description: 'Humidité bloquant la Rate — digestion lourde, lourdeur générale, enduit lingual épais.',
    patterns: [
      'humidite envahit la rate', 'humidite rate', 'rate envahie par l humidite',
      'rate sature d humidite', 'humidite bloque la rate',
      'rate sous l humidite', 'rate bloquee par l humidite',
      'humidite obstrue rate estomac', 'humidite foyer moyen',
      'rate sous charge humide', 'rate chargee en humidite',
    ],
    priorite: 2,
    parentFamilleId: 'humidite',
  },
  {
    id: 'chaleur_estomac',
    label: 'Chaleur de l\'Estomac',
    categorie: 'syndrome',
    description: 'Chaleur dans l\'Estomac — faim intense, soif, gencives enflées, brûlures épigastriques.',
    patterns: [
      'chaleur de l estomac', 'chaleur estomac', 'estomac en chaleur',
      'feu de l estomac', 'estomac chaud', 'feu estomac',
      'chaleur dans l estomac', 'brulures d estomac',
    ],
    priorite: 2,
    parentFamilleId: 'chaleur',
  },
  {
    id: 'vide_yin_estomac',
    label: 'Vide de Yin de l\'Estomac',
    categorie: 'syndrome',
    description: 'Yin de l\'Estomac insuffisant — faim sans appétit, bouche sèche, épigastre brûlant, langue rouge sans enduit.',
    patterns: [
      'vide de yin de l estomac', 'yin de l estomac vide',
      'estomac yin vide', 'vide yin estomac',
      'insuffisance yin estomac', 'estomac en vide de yin',
      'yin gastrique insuffisant', 'estomac sec',
    ],
    priorite: 1,
    parentFamilleId: 'vide_yin',
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
      'foyer inferieur non rechauffe', 'foyer inferieur froid',
      'foyer inferieur ne retient', 'yang vide au foyer inferieur',
      'yin et froid vainqueurs',
    ],
    regles: ['R2'],
    priorite: 1,
    parentFamilleId: 'vide_yang',
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
    parentFamilleId: 'vide_yang',
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
      'oe plenitude iong insuffisante', 'iong insuffisante oe plenitude',
      'plenitude locale iong insuffisante', 'oe en plenitude iong vide',
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
    parentFamilleId: 'vide_yang',
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
    parentFamilleId: 'vide_yin',
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
      'vesicule biliaire qui ne se draine', 'vesicule biliaire ne se draine',
      'vesicule biliaire non drainee', 'vb non drainee', 'vesicule non drainee',
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

  // ─── Esprits des organes (Wushen) ────────────────────────────────────────────
  {
    id: 'hun_perturbe',
    label: 'Hun perturbé (âme végétative — domaine Foie)',
    categorie: 'syndrome',
    description: 'Le Hun (esprit du Foie) est perturbé — rêves agités, déambulations nocturnes, instabilité psychique, décisions difficiles.',
    patterns: [
      'hun perturbe', 'hun instable', 'hun non ancre',
      'esprit du foie perturbe', 'hun agite', 'foie hun',
      'ame vegetative perturbee', 'hun fragilise',
      'reves perturbants foie', 'instabilite psychique foie',
    ],
    priorite: 2,
  },
  {
    id: 'po_perturbe',
    label: 'Po perturbé (âme corporelle — domaine Poumon)',
    categorie: 'syndrome',
    description: 'Le Po (esprit du Poumon) est perturbé — deuil non résolu, mélancolie, tristesse profonde, crispation cutanée.',
    patterns: [
      'po perturbe', 'po non ancre', 'esprit du poumon perturbe',
      'po agite', 'poumon po', 'ame corporelle perturbee',
      'deuil non resolu', 'melancolie profonde', 'tristesse metal',
      'po fragilise',
    ],
    priorite: 2,
  },
  {
    id: 'zhi_perturbe',
    label: 'Zhi perturbé (volonté — domaine Rein)',
    categorie: 'syndrome',
    description: 'Le Zhi (volonté du Rein) est perturbé — manque de volonté, peur chronique, incapacité à avancer.',
    patterns: [
      'zhi perturbe', 'zhi insuffisant', 'esprit du rein perturbe',
      'volonte affaiblie', 'rein zhi', 'zhi vide',
      'manque de volonte profond', 'peur chronique envahissante',
      'peur pathologique rein',
    ],
    priorite: 2,
  },
  {
    id: 'yi_perturbe',
    label: 'Yi perturbé (intellect — domaine Rate)',
    categorie: 'syndrome',
    description: 'Le Yi (intellect de la Rate) est perturbé — ruminations, idées fixes, pensées circulaires, obsessions.',
    patterns: [
      'yi perturbe', 'yi insuffisant', 'esprit de la rate perturbe',
      'intellectualite perturbee', 'rate yi', 'rumination pathologique',
      'pensees circulaires', 'idees fixes', 'yi fragilise',
    ],
    priorite: 2,
  },

  // ─── Tan dans les méridiens ──────────────────────────────────────────────────
  {
    id: 'tan_meridiens',
    label: 'Tan obstruant les méridiens',
    categorie: 'syndrome',
    description: 'Phlegme (Tan) accumulé dans les méridiens — douleurs sourdes, engourdissements, lourdeur, masses molles.',
    patterns: [
      'tan dans les meridiens', 'phlegme dans les meridiens',
      'tan obstrue les meridiens', 'accumulation de phlegme dans les meridiens',
      'phlegme meridien', 'tan bloque meridien',
      'obstruction par le tan', 'tan et stagnation de sang',
      'phlegme stagnant dans les meridiens',
    ],
    priorite: 2,
    parentFamilleId: 'tan',
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
  {
    id: 'chong_mai',
    label: 'Chong Mai (Vaisseau Pénétrant)',
    categorie: 'vaisseau',
    patterns: ['chong mai', 'vaisseau penetrant', 'tchrong mai'],
  },
  {
    id: 'dai_mai',
    label: 'Dai Mai (Vaisseau Ceinture)',
    categorie: 'vaisseau',
    patterns: ['dai mai', 'vaisseau ceinture'],
  },
  {
    id: 'yang_wei_mo',
    label: 'Yang Wei Mo',
    categorie: 'vaisseau',
    patterns: ['yang wei mo', 'yang wei'],
  },
  {
    id: 'yin_wei_mo',
    label: 'Yin Wei Mo',
    categorie: 'vaisseau',
    patterns: ['yin wei mo', 'yin wei'],
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
  {
    id: 'shao_yin',
    label: 'Shao Yin (Rein + Cœur)',
    categorie: 'localisation',
    patterns: ['shao yin'],
  },
  {
    id: 'tai_yang',
    label: 'Tai Yang (Vessie + IG)',
    categorie: 'localisation',
    patterns: ['tai yang'],
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

  // ─── Strategies Rate / Estomac ───────────────────────────────────────────────
  {
    id: 'tonifier_qi_rate',
    label: 'Tonifier le Qi de la Rate',
    categorie: 'strategie',
    patterns: [
      'tonifier le qi de la rate', 'tonifier qi rate',
      'soutenir la rate', 'renforcer le qi de la rate',
      'tonification qi rate', 'fortifier la rate',
      'tonifier la terre', 'renforcer la terre',
    ],
    priorite: 1,
  },
  {
    id: 'rechauffer_rate',
    label: 'Réchauffer la Rate / Foyer Moyen',
    categorie: 'strategie',
    patterns: [
      'rechauffer la rate', 'rechauffer le foyer moyen',
      'rechauffer rate estomac', 'rechauffement rate',
      'apporter yang a la rate', 'yang pour rechauffer la rate',
      'rechauffer le rechauffeur moyen', 'rechauffer la terre',
    ],
    priorite: 1,
  },
  {
    id: 'nourrir_yin_estomac',
    label: 'Nourrir le Yin de l\'Estomac',
    categorie: 'strategie',
    patterns: [
      'nourrir le yin de l estomac', 'nourrir yin estomac',
      'tonifier le yin de l estomac', 'humidifier l estomac',
      'nourrir les liquides de l estomac', 'yin gastrique',
    ],
    priorite: 1,
  },

  // ─── Strategies Poumon ───────────────────────────────────────────────────────
  {
    id: 'tonifier_qi_poumon',
    label: 'Tonifier le Qi du Poumon',
    categorie: 'strategie',
    patterns: [
      'tonifier le qi du poumon', 'tonifier qi poumon',
      'soutenir le poumon', 'renforcer le qi du poumon',
      'tonification qi poumon', 'fortifier le poumon',
      'soutenir le metal', 'tonifier le metal',
    ],
    priorite: 1,
  },
  {
    id: 'nourrir_yin_poumon',
    label: 'Nourrir le Yin du Poumon',
    categorie: 'strategie',
    patterns: [
      'nourrir le yin du poumon', 'nourrir yin poumon',
      'tonifier le yin du poumon', 'humidifier le poumon',
      'nourrir le metal yin', 'yin poumon tonifie',
      'humidifier les muqueuses respiratoires',
    ],
    priorite: 1,
  },

  // ─── Strategies Cœur ─────────────────────────────────────────────────────────
  {
    id: 'nourrir_yin_coeur',
    label: 'Nourrir le Yin du Cœur',
    categorie: 'strategie',
    patterns: [
      'nourrir le yin du coeur', 'nourrir yin coeur',
      'tonifier le yin du coeur', 'soutenir le yin du coeur',
      'yin coeur tonifie', 'nourrir le coeur yin',
    ],
    priorite: 1,
  },
  {
    id: 'nourrir_sang_coeur',
    label: 'Nourrir le Sang du Cœur',
    categorie: 'strategie',
    patterns: [
      'nourrir le sang du coeur', 'nourrir sang coeur',
      'tonifier le sang du coeur', 'soutenir le sang du coeur',
      'nourrir le coeur en sang',
    ],
    priorite: 1,
  },

  // ─── Strategies Tan / Phlegme ────────────────────────────────────────────────
  {
    id: 'eliminer_tan',
    label: 'Éliminer le Tan (Phlegme)',
    categorie: 'strategie',
    patterns: [
      'eliminer le tan', 'dissoudre le tan', 'resoudre le phlegme',
      'drainer le tan', 'disperser le phlegme',
      'elimination du tan', 'traiter le phlegme',
      'lever le tan', 'transformer le phlegme', 'eliminer phlegme',
    ],
    priorite: 2,
  },

  // ─── Strategies cycles Sheng supplémentaires ─────────────────────────────────
  {
    id: 'relancer_cycle_sheng_terre_metal',
    label: 'Relancer le cycle Sheng Terre → Métal',
    categorie: 'strategie',
    patterns: [
      'relancer cycle sheng terre metal', 'relancer terre metal',
      'soutenir rate pour poumon', 'nourrir la rate pour le poumon',
      'relancer sheng terre vers metal',
      'consolider la terre pour le metal',
    ],
    priorite: 1,
  },
  {
    id: 'relancer_cycle_sheng_metal_eau',
    label: 'Relancer le cycle Sheng Métal → Eau',
    categorie: 'strategie',
    patterns: [
      'relancer cycle sheng metal eau', 'relancer metal eau',
      'soutenir poumon pour rein', 'nourrir le poumon pour le rein',
      'relancer sheng metal vers eau',
      'consolider le metal pour l eau',
    ],
    priorite: 1,
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

  // ─── Infectieux / Post-infectieux ────────────────────────────────────────────
  {
    id: 'mononucleose',
    label: 'Mononucléose / Epstein-Barr (séquelles)',
    categorie: 'pathologie',
    patterns: [
      'mononucleose', 'epstein barr', 'ebv',
      'sequelles mononucleose', 'fatigue post mononucleose',
      'post mononucleose', 'infection epstein barr',
      'syndrome mononucleosique',
    ],
  },
  {
    id: 'zona',
    label: 'Zona / Herpès',
    categorie: 'pathologie',
    patterns: [
      'zona', 'herpes zoster', 'herpes', 'nevralgie post zoosterienne',
      'sequelles de zona', 'douleurs post zona', 'post zona',
    ],
  },
  {
    id: 'infections_repetees',
    label: 'Infections répétées / Immunité faible',
    categorie: 'pathologie',
    patterns: [
      'infection repetee', 'infections repetees', 'rhumes frequents',
      'fragilite immunitaire', 'immunite faible', 'rhumes a repetition',
      'otite repetee', 'otites repetees', 'bronchite repetee',
      'infections frequentes', 'terrain fragile infections',
    ],
  },

  // ─── Métabolique / Constitutionnel ──────────────────────────────────────────
  {
    id: 'fibromyalgie',
    label: 'Fibromyalgie / Douleurs diffuses',
    categorie: 'pathologie',
    patterns: [
      'fibromyalgie', 'fibromyalgies', 'douleur diffuse', 'douleurs diffuses',
      'syndrome douloureux diffus', 'douleur generalisee',
    ],
  },
  {
    id: 'fatigue_chronique',
    label: 'Syndrome de fatigue chronique (SFC)',
    categorie: 'pathologie',
    patterns: [
      'syndrome de fatigue chronique', 'sfc', 'encephalomyelite myalgique',
      'em sfc', 'epuisement chronique', 'fatigue extreme persistante',
      'fatigue invalidante', 'fibromyalgie fatigue',
    ],
  },
  {
    id: 'oedeme',
    label: 'Œdème / Rétention d\'eau',
    categorie: 'pathologie',
    patterns: [
      'oedeme', 'oedemes', 'retention d eau', 'retention hydrique',
      'gonflement des membres', 'jambes lourdes', 'jambes gonflees',
      'infiltration hydrique', 'prise de poids oedeme',
      'chevilles gonflees',
    ],
  },
  {
    id: 'surpoids',
    label: 'Surpoids / Obésité',
    categorie: 'pathologie',
    patterns: [
      'surpoids', 'obesite', 'prise de poids', 'embonpoint',
      'difficulte a maigrir', 'poids excessif', 'kilos en trop',
    ],
  },

  // ─── Endocrinien / Gynécologique ─────────────────────────────────────────────
  {
    id: 'menopause',
    label: 'Ménopause / Périménopause',
    categorie: 'pathologie',
    patterns: [
      'menopause', 'perimenopause', 'premenopause',
      'post menopause', 'syndrome menopausique',
      'cessation des regles', 'arret des regles menopause',
    ],
  },
  {
    id: 'bouffees_chaleur',
    label: 'Bouffées de chaleur',
    categorie: 'pathologie',
    patterns: [
      'bouffee de chaleur', 'bouffees de chaleur',
      'flush', 'montee de chaleur', 'montees de chaleur',
      'chaleur montante soudaine', 'chaleur soudaine',
    ],
  },
  {
    id: 'sueurs_nocturnes',
    label: 'Sueurs nocturnes',
    categorie: 'pathologie',
    patterns: [
      'sueur nocturne', 'sueurs nocturnes', 'transpiration nocturne',
      'transpire la nuit', 'mouille de sueur la nuit',
      'sueurs pendant le sommeil',
    ],
  },
  {
    id: 'infertilite',
    label: 'Infertilité / Difficultés à concevoir',
    categorie: 'pathologie',
    patterns: [
      'infertilite', 'infertilites', 'sterilite',
      'difficulte a concevoir', 'difficulte a tomber enceinte',
      'pma', 'fiv', 'aide medicale a la procreation',
      'hypofertilite',
    ],
  },
  {
    id: 'trouble_sexuel',
    label: 'Trouble sexuel / Dysfonction',
    categorie: 'pathologie',
    patterns: [
      'impuissance', 'dysfonction erectile', 'trouble erectil',
      'frigidite', 'baisse de libido', 'libido faible',
      'dysfonction sexuelle', 'trouble de la sexualite',
      'perte de libido', 'ejaculation precoce',
    ],
  },
  {
    id: 'enuresie',
    label: 'Énurésie / Incontinence nocturne',
    categorie: 'pathologie',
    patterns: [
      'enuresie', 'pipi au lit', 'incontinence nocturne',
      'mictions nocturnes involontaires', 'lit mouille nuit',
    ],
  },

  // ─── Cheveux / Peau (compléments) ────────────────────────────────────────────
  {
    id: 'alopecie',
    label: 'Alopécie / Chute de cheveux',
    categorie: 'pathologie',
    patterns: [
      'alopecie', 'chute de cheveux', 'perte de cheveux',
      'calvitie', 'cheveux qui tombent', 'clairseme',
      'perte capillaire', 'cheveux fragiles',
    ],
  },
  {
    id: 'acne',
    label: 'Acné / Imperfections cutanées',
    categorie: 'pathologie',
    patterns: [
      'acne', 'boutons', 'imperfection cutanee',
      'peau grasse', 'couperose', 'rougeurs cutanees', 'peau impure',
    ],
  },

  // ─── Thorax / Cardiovasculaire (complément) ──────────────────────────────────
  {
    id: 'douleur_thoracique',
    label: 'Douleur thoracique / Oppression',
    categorie: 'pathologie',
    patterns: [
      'douleur thoracique', 'douleurs thoraciques', 'oppression thoracique',
      'oppression de poitrine', 'serrement poitrine', 'douleur poitrine',
      'angine de poitrine', 'angor', 'douleur precordiale',
    ],
  },
  {
    id: 'varices',
    label: 'Varices / Insuffisance veineuse',
    categorie: 'pathologie',
    patterns: [
      'varices', 'varice', 'insuffisance veineuse',
      'phlebite', 'thrombose veineuse', 'jambes varices',
      'telangiectasies',
    ],
  },

  // ─── Psychisme (compléments) ─────────────────────────────────────────────────
  {
    id: 'toc',
    label: 'TOC / Pensées obsessionnelles',
    categorie: 'pathologie',
    patterns: [
      'toc', 'trouble obsessionnel compulsif', 'pensee obsessionnelle',
      'rumination obsessionnelle', 'pensees intrusives',
      'obsession', 'compulsion',
    ],
  },
  {
    id: 'hyperactivite',
    label: 'Hyperactivité / TDAH',
    categorie: 'pathologie',
    patterns: [
      'hyperactivite', 'tdah', 'deficit d attention',
      'trouble attention', 'difficulte de concentration',
      'hyperactivite avec deficit attention', 'agitation enfant',
    ],
  },
  {
    id: 'syndrome_sec',
    label: 'Syndrome sec / Sécheresse généralisée (Sjögren)',
    categorie: 'pathologie',
    patterns: [
      'syndrome sec', 'secheresse generalisee', 'sjogren',
      'yeux secs', 'bouche seche', 'secheresse buccale',
      'secheresse des muqueuses', 'manque de secretions',
    ],
  },

  // ─── ORL ─────────────────────────────────────────────────────────────────────
  {
    id: 'surdite',
    label: 'Surdité / Hypoacousie',
    categorie: 'pathologie',
    patterns: [
      'surdite', 'surdites', 'hypoacousie', 'perte d audition',
      'baisse de l audition', 'trouble auditif',
      'oreille qui entend moins', 'difficile entendre',
    ],
  },
  {
    id: 'pharyngite',
    label: 'Pharyngite / Amygdalite chronique',
    categorie: 'pathologie',
    patterns: [
      'pharyngite', 'amygdalite', 'gorge irritee', 'gorge douloureuse',
      'mal de gorge chronique', 'angine a repetition',
      'noeud dans la gorge', 'sensation de boule gorge',
    ],
  },

  // ─── Urologie ────────────────────────────────────────────────────────────────
  {
    id: 'lithiase',
    label: 'Lithiase / Calculs (rein, vésicule)',
    categorie: 'pathologie',
    patterns: [
      'lithiase', 'calcul', 'calculs', 'calcul renal',
      'calcul urinaire', 'colique nephretique',
      'lithiase biliaire', 'calcul vesiculaire',
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

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
 *   4. Stratégies        — Nourrir Yin, Tonifier Yang, Disperser Fong, etc.
 *
 * ─── RÈGLES CLINIQUES FONDAMENTALES (intégrées dans les données) ─────────────
 *
 * R1. Yin/Yang prime TOUJOURS — orienter la polarité avant tout autre lecture.
 * R2. Traiter le général AVANT le local — un Yang local sur vide Yang général
 *     sera absorbé sans effet durable.
 * R3. Yang apparent (Feu apparent) ≠ Chaleur réelle — le traiter en TONIFIANT le Yin,
 *     JAMAIS en dispersant la chaleur (risque d'aggravation).
 * R4. Vide de Yin du Rein → Yang du Foie monte (cause indirecte).
 *     Traiter le Rein, pas le Foie en premier.
 * R5. Règle des 3 Foyers — en cas de Foyer Moyen plein : le traiter en
 *     PREMIER, avant le Foyer Inférieur vide (sinon le plein bloque tout).
 * R6. Oé en plénitude locale / Iong insuffisante = paradoxe IEATC classique.
 *     Tonifier l'Iong générale ET disperser l'Oé locale.
 * R7. Cycle Ko inversé (Bois attaque Terre) : ne pas soutenir la Terre seule
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

// ═══════════════════════════════════════════════════════════════════════════════
// COUCHE SÉMANTIQUE — Expansion des équivalences IEATC
//
// Principe : quand un praticien écrit librement, il ne dit PAS toujours
// "stagnation de Qi du Foie". Il dit "le foie est bloqué", "le foie ne
// circule pas", "blocage du foie", "foie congestionné"...
//
// Cette couche ENRICHIT le texte normalisé avec les formes canoniques
// correspondantes — sans supprimer l'original. Ainsi les patterns existants
// peuvent les reconnaître.
//
// Règle d'or : toujours AJOUTER, jamais REMPLACER (non-destructif).
// ═══════════════════════════════════════════════════════════════════════════════

const EQUIVALENCES_SEMANTIQUES: Array<[phrase: string, enrichissement: string]> = [

  // ─── STAGNATION DE QI DU FOIE ────────────────────────────────────────────────
  // Toutes les façons de dire que le Qi du Foie est bloqué
  ['le foie ne circule pas',         'stagnation qi foie foie bloque'],
  ['le foie ne circule plus',        'stagnation qi foie foie bloque'],
  ['foie ne circule pas',            'stagnation qi foie foie bloque'],
  ['foie ne circule plus',           'stagnation qi foie foie bloque'],
  ['le foie est bloque',             'stagnation qi foie foie bloque'],
  ['foie est bloque',                'stagnation qi foie foie bloque'],
  ['blocage du foie',                'stagnation qi foie foie bloque'],
  ['blocage au foie',                'stagnation qi foie foie bloque'],
  ['blocage de l energie du foie',   'stagnation qi foie foie bloque'],
  ['energie du foie bloquee',        'stagnation qi foie foie bloque'],
  ['energie du foie stagnante',      'stagnation qi foie foie bloque'],
  ['energie du foie entravee',       'stagnation qi foie foie bloque'],
  ['energie du foie ne passe pas',   'stagnation qi foie foie bloque'],
  ['qi du foie qui stagne',          'stagnation qi foie'],
  ['qi du foie en stagnation',       'stagnation qi foie'],
  ['qi du foie qui se bloque',       'stagnation qi foie foie bloque'],
  ['qi du foie est retenu',          'stagnation qi foie qi bloque'],
  ['foie congestionne',              'stagnation qi foie foie bloque'],
  ['foie est congestionne',          'stagnation qi foie foie bloque'],
  ['foie entrave',                   'stagnation qi foie foie bloque'],
  ['foie est entrave',               'stagnation qi foie foie bloque'],
  ['foie obstrue',                   'stagnation qi foie foie bloque'],
  ['foie se bloque',                 'stagnation qi foie foie bloque'],
  ['foie qui se bloque',             'stagnation qi foie bois qui se bloque'],
  ['foie ne laisse pas circuler',    'stagnation qi foie foie bloque'],
  ['foie ne fait plus passer',       'stagnation qi foie foie bloque'],
  ['foie ne fait pas passer le qi',  'stagnation qi foie foie bloque'],
  ['foie ralenti',                   'stagnation qi foie foie bloque'],
  ['foie fige',                      'stagnation qi foie foie bloque'],
  ['foie coince',                    'stagnation qi foie foie bloque'],
  ['foie sature',                    'stagnation qi foie foie bloque'],
  ['bois bloque',                    'stagnation qi foie bois qui se bloque'],
  ['bois est bloque',                'stagnation qi foie bois qui se bloque'],
  ['bois stagnant',                  'stagnation qi foie bois qui se bloque'],
  ['bois en stagnation',             'stagnation qi foie bois qui se bloque'],
  ['stagnation du bois',             'stagnation qi foie bois qui se bloque'],
  ['blocage du bois',                'stagnation qi foie bois qui se bloque'],
  ['energie du bois bloquee',        'stagnation qi foie bois qui se bloque'],
  ['bois ralenti',                   'stagnation qi foie bois qui se bloque'],
  ['bois qui ne circule pas',        'stagnation qi foie bois qui se bloque'],
  ['bois qui ne circule plus',       'stagnation qi foie bois qui se bloque'],
  ['foie vb bloque',                 'stagnation qi foie bois qui se bloque'],
  ['foie vb en stagnation',          'stagnation qi foie bois qui se bloque'],
  ['vb bloque',                      'stagnation qi foie foie bloque'],
  ['vesicule bloquee',               'stagnation qi foie foie bloque'],
  // Frustration / émotions qui bloquent le Foie
  ['foie serre',                     'stagnation qi foie foie bloque'],
  ['foie contracte',                 'stagnation qi foie foie bloque'],
  ['tension au niveau du foie',      'stagnation qi foie foie bloque'],
  ['crispation du foie',             'stagnation qi foie foie bloque'],

  // ─── YANG DU FOIE MONTANT ────────────────────────────────────────────────────
  ['yang qui monte',                 'yang du foie montant yang monte'],
  ['yang monte',                     'yang du foie montant yang monte'],
  ['yang ascendant',                 'yang du foie montant yang monte'],
  ['yang non ancre',                 'yang du foie montant yang non ancre'],
  ['yang flottant',                  'yang du foie montant yang flottant'],
  ['yang qui flotte',                'yang du foie montant yang flottant'],
  ['yang ne descend pas',            'yang du foie montant yang monte'],
  ['yang s eleve',                   'yang du foie montant yang monte'],
  ['yang remonte',                   'yang du foie montant yang monte'],
  ['yang monte vers le haut',        'yang du foie montant yang monte'],
  ['yang en rebellion',              'yang du foie montant yang en usurpateur'],
  ['yang monte en usurpateur',       'yang du foie montant yang en usurpateur'],
  ['yang du foie monte',             'yang du foie montant yang monte'],
  ['yang foie monte',                'yang du foie montant yang monte'],
  ['yang du foie non ancre',         'yang du foie montant yang non ancre'],
  ['yang du foie qui monte',         'yang du foie montant yang monte'],
  ['yang du foie flotte',            'yang du foie montant yang flottant'],
  ['yang du foie s eleve',           'yang du foie montant yang monte'],
  ['yang du foie trop fort',         'yang du foie montant yang du foie en exces'],
  ['yang du foie en exces',          'yang du foie montant yang du foie en exces'],
  ['yang du foie en plenitude',      'yang du foie montant yang du foie en plenitude'],
  ['yang du foie deborde',           'yang du foie montant yang du foie en exces'],
  ['yang du foie envahit',           'yang du foie montant yang en usurpateur'],
  ['yang du foie non controle',      'yang du foie montant yang monte'],
  ['yang du foie qui s eleve',       'yang du foie montant yang monte'],
  ['yang non ancre par le yin',      'yang du foie montant yang non ancre yang flottant'],
  ['prosperite du yang',             'yang du foie montant prosperite du yang du foie'],
  ['yang du bois monte',             'yang du foie montant yang monte'],
  ['yang du bois en exces',          'yang du foie montant yang du foie en exces'],
  ['yang sans ancrage yin',          'yang du foie montant yang sans racine yang non ancre'],
  ['yang libre sans controle',       'yang du foie montant yang non ancre'],
  // Symptômes typiques → yang du Foie montant
  ['cephalees aux tempes',           'yang du foie montant yang monte'],
  ['migraine temporale',             'yang du foie montant yang monte'],
  ['douleur aux tempes',             'yang du foie montant yang monte'],
  ['rouge au visage colere',         'yang du foie montant yang du foie en exces'],
  ['visage rouge qui monte',         'yang du foie montant yang monte feu du foie'],
  ['pouls corde et rapide',          'yang du foie montant pouls corde arc yang du foie en exces'],

  // ─── VIDE DE YANG DU REIN / MING MEN ────────────────────────────────────────
  ['yang du rein s epuise',          'vide yang rein yang du rein insuffisant'],
  ['yang du rein faiblit',           'vide yang rein yang du rein insuffisant'],
  ['yang du rein ne suffit plus',    'vide yang rein yang du rein insuffisant'],
  ['yang du rein diminue',           'vide yang rein yang du rein insuffisant'],
  ['rein manque de yang',            'vide yang rein yang du rein insuffisant'],
  ['rein yang qui faiblit',          'vide yang rein yang du rein insuffisant'],
  ['yang renal insuffisant',         'vide yang rein yang du rein insuffisant'],
  ['yang renal en baisse',           'vide yang rein yang du rein insuffisant'],
  ['yang du rein qui se vide',       'vide yang rein yang du rein insuffisant'],
  ['rein ne rechauffe plus',         'vide yang rein yang du rein insuffisant'],
  ['rein n a plus assez de yang',    'vide yang rein yang du rein insuffisant'],
  ['yang renal epuise',              'vide yang rein yang du rein insuffisant'],
  ['carence yang du rein',           'vide yang rein yang du rein insuffisant'],
  ['rein froid',                     'vide yang rein yang du rein insuffisant'],
  ['froid au rein',                  'vide yang rein yang du rein insuffisant'],
  ['yang du rein ne rechauffe plus', 'vide yang rein yang du rein insuffisant'],
  ['yang du rein trop faible',       'vide yang rein yang du rein insuffisant'],
  ['yang renal trop faible',         'vide yang rein yang du rein insuffisant'],
  // Ming Men
  ['feu du rein s eteint',           'feu du ming men ming men eteint mingmen insuffisant'],
  ['feu de la vie s eteint',         'feu du ming men ming men eteint'],
  ['feu de ming men s eteint',       'feu du ming men ming men eteint'],
  ['feu originel s eteint',          'feu du ming men feu originel insuffisant'],
  ['feu du ming men s eteint',       'feu du ming men ming men eteint'],
  ['ming men ne rechauffe plus',     'feu du ming men ming men insuffisant'],
  ['ming men s affaiblit',           'feu du ming men ming men insuffisant'],
  ['feu du ming men s affaiblit',    'feu du ming men ming men insuffisant'],
  ['ming men eteint',                'feu du ming men ming men eteint'],
  ['porte de vie insuffisante',      'feu du ming men feu originel insuffisant'],
  // Symptômes typiques → vide de Yang du Rein
  ['froid lombaire',                 'vide yang rein yang du rein insuffisant'],
  ['lombes froides',                 'vide yang rein yang du rein insuffisant'],
  ['dos froid dans le bas',          'vide yang rein yang du rein insuffisant'],
  ['urines claires et abondantes',   'vide yang rein yang du rein insuffisant'],
  ['urines claires',                 'vide yang rein yang du rein insuffisant'],

  // ─── VIDE DE YIN DU REIN ─────────────────────────────────────────────────────
  ['yin du rein s epuise',           'vide yin rein yin du rein insuffisant'],
  ['yin du rein faiblit',            'vide yin rein yin du rein insuffisant'],
  ['yin du rein diminue',            'vide yin rein yin du rein insuffisant'],
  ['rein manque de yin',             'vide yin rein yin du rein insuffisant'],
  ['yin renal insuffisant',          'vide yin rein yin du rein insuffisant'],
  ['yin renal epuise',               'vide yin rein yin du rein insuffisant'],
  ['rein n a plus assez de yin',     'vide yin rein yin du rein insuffisant'],
  ['essence du rein insuffisante',   'vide yin rein yin du rein insuffisant vide jing rein'],
  ['rein yin qui se vide',           'vide yin rein yin du rein insuffisant'],
  ['eau du rein insuffisante',       'vide yin rein eau insuffisante'],
  ['eau renale insuffisante',        'vide yin rein eau insuffisante'],
  ['carence yin du rein',            'vide yin rein yin du rein insuffisant'],
  ['yin renal qui diminue',          'vide yin rein yin du rein insuffisant'],
  ['yin renal qui se tarit',         'vide yin rein yin du rein insuffisant'],
  ['substance yin du rein insuffisante', 'vide yin rein yin du rein insuffisant'],
  ['eau insuffisante pour ancrer',   'vide yin rein eau insuffisante vide profond de l eau'],
  // Symptômes typiques → vide de Yin du Rein
  ['chaleur le soir',                'feu du vide chaleur vesperal vide yin rein'],
  ['chaleur en fin de journee',      'feu du vide chaleur vesperal vide yin rein'],
  ['chaleur la nuit',                'feu du vide chaleur vesperal vide yin'],
  ['chaleur vesperal',               'feu du vide chaleur vesperal vide yin rein'],
  ['sueurs la nuit',                 'vide de yin sueurs nocturnes feu du vide'],
  ['transpiration nocturne',         'vide de yin sueurs nocturnes'],
  ['sueurs nocturnes',               'vide de yin sueurs nocturnes feu du vide vide yin rein'],
  ['bourdonnements vide',            'vide yin rein oreille rein bourdonnements vide'],
  ['oreilles bourdonnement par vide','vide yin rein bourdonnements vide oreille rein'],

  // ─── FEU DU VIDE — toutes les formulations ───────────────────────────────────
  ['chaleur apparente',              'feu du vide yang apparent chaleur apparente'],
  ['chaleur par manque de yin',      'feu du vide chaleur de vide vide avec chaleur'],
  ['chaleur liee au vide de yin',    'feu du vide chaleur de vide'],
  ['yang apparent par vide de yin',  'feu du vide yang apparent yang non ancre'],
  ['yang qui flotte par manque de yin', 'feu du vide yang apparent yang flottant'],
  ['vide de yin avec chaleur',       'feu du vide chaleur de vide vide avec chaleur'],
  ['yang sans racine yin',           'feu du vide yang sans racine yang non ancre'],
  ['chaleur du vide',                'feu du vide chaleur de vide chaleur xu'],
  ['faux yang',                      'feu du vide yang apparent faux yang'],
  ['chaleur fictive',                'feu du vide yang apparent chaleur apparente'],
  ['chaleur qui monte par vide',     'feu du vide chaleur de vide yang monte par manque de yin'],
  ['yang monte par manque de yin',   'feu du vide yang apparent yang non ancre'],

  // ─── VIDE DE SANG DU FOIE ────────────────────────────────────────────────────
  ['foie ne nourrit plus',           'vide sang foie foie non nourri foie mal nourri'],
  ['foie manque de sang',            'vide sang foie sang foie insuffisant'],
  ['foie n est plus nourri',         'vide sang foie foie non nourri'],
  ['sang du foie insuffisant',       'vide sang foie sang foie insuffisant'],
  ['sang du foie appauvri',          'vide sang foie sang foie insuffisant'],
  ['foie mal alimente',              'vide sang foie foie mal nourri'],
  ['foie manque de substance',       'vide sang foie foie non nourri'],
  ['sang insuffisant pour le foie',  'vide sang foie sang foie insuffisant'],
  ['foie non alimente',              'vide sang foie foie non nourri'],
  ['bois non nourri en sang',        'vide sang foie sang foie insuffisant'],
  // Symptômes typiques → vide de Sang du Foie
  ['crampes nocturnes',              'vide sang foie foie non nourri'],
  ['crampes la nuit',                'vide sang foie foie non nourri'],
  ['jambes crampe nuit',             'vide sang foie foie non nourri'],
  ['crampes aux jambes la nuit',     'vide sang foie foie non nourri'],
  ['ongles cassants',                'vide sang foie foie non nourri'],
  ['ongles fragiles',                'vide sang foie foie non nourri'],
  ['ongles stries',                  'vide sang foie foie non nourri'],
  ['yeux secs et fatigues',          'vide sang foie foie non nourri vide yin foie'],
  ['vision trouble le soir',         'vide sang foie foie non nourri'],
  ['regles pales',                   'vide sang foie sang foie insuffisant vide sang'],
  ['regles peu abondantes',          'vide sang foie vide sang sang insuffisant'],

  // ─── VIDE DE QI DE LA RATE / FOYER MOYEN ────────────────────────────────────
  ['rate s affaiblit',               'vide qi rate rate affaiblie'],
  ['rate s epuise',                  'vide qi rate rate affaiblie'],
  ['rate ne produit plus',           'vide qi rate rate insuffisante'],
  ['rate ne transforme plus',        'vide qi rate rate insuffisante'],
  ['rate ne transporte plus',        'vide qi rate rate insuffisante'],
  ['rate deficiente',                'vide qi rate rate affaiblie'],
  ['rate manque de qi',              'vide qi rate qi de la rate insuffisant'],
  ['qi de la rate qui faiblit',      'vide qi rate qi de la rate insuffisant'],
  ['terre qui s affaiblit',          'vide qi rate rate affaiblie'],
  ['terre deficiente',               'vide qi rate rate affaiblie'],
  ['foyer moyen s affaiblit',        'vide qi rate rate affaiblie'],
  ['digestion affaiblie',            'vide qi rate rate affaiblie'],
  ['digestion deficiente',           'vide qi rate rate affaiblie'],
  ['digestion ne fonctionne plus',   'vide qi rate rate insuffisante'],
  ['rate fatiguee',                  'vide qi rate rate affaiblie'],
  ['rate qui se vide',               'vide qi rate rate affaiblie'],
  ['rate en vide',                   'vide qi rate rate affaiblie'],
  ['rate epuisee',                   'vide qi rate rate affaiblie rate insuffisante'],

  // ─── EXCÈS DE YIN AU FOYER MOYEN (R5) ───────────────────────────────────────
  ['foyer moyen trop charge',        'exces yin foyer moyen plenitude au foyer moyen rate surchargee'],
  ['foyer moyen encombre',           'exces yin foyer moyen plenitude au foyer moyen foyer moyen sature'],
  ['foyer moyen bloque',             'exces yin foyer moyen foyer moyen sature'],
  ['foyer moyen sature de yin',      'exces yin foyer moyen plenitude yin foyer moyen'],
  ['foyer moyen plein',              'plenitude au foyer moyen exces yin foyer moyen'],
  ['rate surchargee de yin',         'exces yin foyer moyen plenitude yin foyer moyen rate surchargee'],
  ['rate trop pleine',               'exces yin foyer moyen rate trop forte'],
  ['rate pleine',                    'exces yin foyer moyen rate trop forte plenitude yin foyer moyen'],
  ['foyer moyen obstrue',            'exces yin foyer moyen foyer moyen sature'],

  // ─── STAGNATION DE QI (général) ─────────────────────────────────────────────
  ['energie qui se bloque',          'stagnation de qi qi bloque stagnation energetique'],
  ['qi qui stagne',                  'stagnation de qi qi stagnant stagnation qi'],
  ['qi bloque',                      'stagnation de qi qi bloque blocage de qi'],
  ['energie bloquee',                'stagnation de qi qi bloque stagnation energetique'],
  ['energie ne circule pas',         'stagnation de qi qi stagnant blocage de la circulation'],
  ['energie retenue',                'stagnation de qi qi bloque stagnation energetique'],
  ['blocage energetique',            'stagnation energetique stagnation de qi qi bloque'],
  ['energie entravee',               'stagnation de qi qi bloque stagnation energetique'],
  ['tchi bloque',                    'stagnation du tchi qi bloque stagnation de qi'],
  ['tchi qui stagne',                'stagnation du tchi stagnation de qi qi stagnant'],
  ['tchi ne circule pas',            'stagnation du tchi stagnation de qi blocage de la circulation'],
  ['blocage du tchi',                'stagnation du tchi stagnation de qi qi bloque'],
  ['qi entrave',                     'stagnation de qi qi bloque blocage de la circulation'],
  ['qi ralenti',                     'stagnation de qi qi stagnant blocage circulation meridienne'],
  ['qi en stagnation',               'stagnation de qi qi stagnant stagnation energetique'],
  ['blocage du qi',                  'blocage de qi stagnation de qi qi bloque'],

  // ─── STAGNATION DE SANG ──────────────────────────────────────────────────────
  ['sang bloque',                    'stagnation de sang sang bloque'],
  ['sang qui stagne',                'stagnation de sang sang bloque'],
  ['sang coagule',                   'stagnation de sang sang bloque'],
  ['stase du sang',                  'stagnation de sang stase sanguine'],
  ['mauvaise circulation du sang',   'stagnation de sang sang bloque'],
  ['sang ne circule plus bien',      'stagnation de sang sang bloque'],
  ['sang stagnant dans',             'stagnation de sang sang bloque'],
  ['sang fige',                      'stagnation de sang sang bloque'],
  ['sang ralenti',                   'stagnation de sang sang bloque'],
  ['microcirculation perturbee',     'stagnation de sang sang bloque'],
  ['stase sanguine',                 'stagnation de sang stase sanguine'],
  ['sang qui ne circule plus',       'stagnation de sang sang bloque'],

  // ─── CYCLE TCHENG (engendrement) — formulations naturelles ──────────────────
  ['rein ne soutient plus le foie',  'rein ne nourrit plus foie cycle tcheng eau bois eau ne nourrit plus bois'],
  ['rein n alimente plus le foie',   'rein ne nourrit plus foie cycle tcheng eau bois'],
  ['eau ne monte plus vers le bois', 'eau ne nourrit plus bois cycle tcheng eau bois'],
  ['rein ne peut plus nourrir le foie', 'rein ne nourrit plus foie eau ne nourrit plus bois'],
  ['foie mal nourri par le rein',    'foie mal nourri par le rein cycle tcheng eau bois'],
  ['bois mal nourri par l eau',      'bois mal nourri par l eau cycle tcheng eau bois'],
  ['rein n arrive pas a nourrir le foie', 'rein ne nourrit plus foie cycle tcheng eau bois'],
  ['rein ne peut plus soutenir le foie', 'rein ne nourrit plus foie eau ne soutient plus le bois'],
  ['rate ne soutient plus le poumon','rate ne nourrit plus le poumon cycle tcheng terre metal'],
  ['rate n alimente plus le poumon', 'rate ne nourrit plus le poumon cycle tcheng terre metal'],
  ['poumon ne soutient plus le rein','poumon ne nourrit plus le rein cycle tcheng metal eau'],
  ['coeur ne soutient plus la rate', 'coeur ne nourrit plus la rate cycle tcheng feu terre'],
  ['feu ne nourrit plus la terre',   'feu ne nourrit plus terre cycle tcheng feu terre'],

  // ─── CYCLE KO — formulations naturelles (IEATC : "attaque" pas "envahit") ───
  ['foie agresse la rate',           'foie attaque la rate bois attaque terre ko pathologique'],
  ['foie envahit la rate',           'foie attaque la rate bois attaque terre ko pathologique'],
  ['stress affecte la digestion',    'bois attaque terre foie attaque rate stress crise foie rate'],
  ['colere affecte la digestion',    'bois attaque terre foie attaque rate stress crise foie rate'],
  ['emotions perturbent la rate',    'bois attaque terre foie attaque rate conflit bois terre'],
  ['foie perturbe la rate',          'foie attaque rate bois attaque terre conflit bois terre'],
  ['foie attaque la rate',           'foie attaque la rate bois attaque terre ko pathologique'],
  ['tension emotionnelle perturbe la digestion', 'bois attaque terre stress crise foie rate'],
  ['rate fragilisee par le foie',    'rate fragilisee secondairement bois attaque terre'],
  ['foie bois en exces affecte la terre', 'bois attaque terre ko pathologique bois domine terre'],
  ['stress perturbe la digestion',   'bois attaque terre stress crise foie rate conflit bois terre'],
  ['colere affecte l estomac',       'bois attaque terre foie attaque rate ko pathologique'],

  // ─── MING MEN / DIARRHÉES MATINALES ─────────────────────────────────────────
  ['diarrhee 5h matin',              'diarrhees matinales diarrhee au petit matin'],
  ['diarrhee tot le matin',          'diarrhees matinales diarrhee au petit matin'],
  ['va a la selle le matin',         'diarrhees matinales diarrhee au petit matin'],
  ['selles molles le matin',         'diarrhees matinales vide yang rein ming men insuffisant'],
  ['diarrhee a l aube',              'diarrhees matinales vide yang rein ming men insuffisant'],
  ['diarrhee entre 5h et 7h',        'diarrhees matinales vide yang rein ming men insuffisant'],
  ['transit le matin de bonne heure','diarrhees matinales diarrhee au petit matin'],

  // ─── FONG INTERNE (Vent interne) ─────────────────────────────────────────────
  ['fong',                           'fong interne du foie fong interne'],
  ['fongs',                          'fong interne du foie fong interne'],
  ['fong interne',                   'fong interne du foie fong interne'],
  ['vertiges par manque de yin',     'fong interne du foie vertiges fong interne vide yin rein vent interne du foie'],
  ['tremblements',                   'fong interne fong interne du foie agitation interne vent interne'],
  ['tremblements des membres',       'fong interne fong interne du foie vent interne du foie'],
  ['mouvements involontaires',       'fong interne agitation interne vent interne'],
  ['spasmes musculaires',            'fong interne tendons non nourris foie vb tendons vent interne'],
  ['convulsions',                    'fong interne agitation interne vent interne'],
  ['pouls corde',                    'pouls corde arc fong interne du foie yang du foie montant vent interne du foie'],
  ['pouls en corde',                 'pouls corde arc fong interne du foie yang du foie montant vent interne du foie'],
  ['pouls tendu',                    'pouls corde arc yang du foie montant'],
  ['pouls en corde d arc',           'pouls corde arc yang du foie montant fong interne du foie vent interne du foie'],

  // ─── HUMIDITÉ / TAN ──────────────────────────────────────────────────────────
  ['corps lourd',                    'humidite interne charge humide'],
  ['sensation de lourdeur',          'humidite interne charge humide'],
  ['lourdeur du corps',              'humidite interne charge humide'],
  ['lourdeur generale',              'humidite interne charge humide'],
  ['terrain humide et lourd',        'humidite interne terrain humide'],
  ['enduit epais',                   'humidite interne humidite excessive'],
  ['langue enduit epais',            'humidite interne humidite excessive'],
  ['mucus s accumule',               'accumulation de tan phlegme accumule'],
  ['glaires qui s accumulent',       'accumulation de tan phlegme accumule glaires pathogenes'],
  ['phlegme qui s accumule',         'accumulation de tan phlegme accumule'],
  ['tan qui obstrue',                'tan obstrue obstruction par le tan'],
  ['mucosites',                      'accumulation de tan retention de tan'],
  ['mucus pathologique',             'accumulation de tan phlegme accumule'],
  ['glaires dans les poumons',       'accumulation de tan tan dans les meridiens phlegme poumon'],
  ['terrain humide',                 'humidite interne retention d humidite terrain humide'],

  // ─── PARADOXE OÉ / IONG (R6) ────────────────────────────────────────────────
  ['inflammation locale sur vide',   'paradoxe yang local vide yang general chaleur locale vide general inflammation locale'],
  ['chaleur locale sur fond de vide','paradoxe yang local vide yang general chaleur locale'],
  ['inflammation en surface sur terrain de vide', 'paradoxe yang local vide general inflammation locale'],
  ['chaleur locale sur vide yang',   'paradoxe yang local vide yang general chaleur locale'],
  ['rougeur locale sur terrain de vide yang', 'paradoxe yang local vide yang general chaleur locale'],

  // ─── VIDE QI / YANG GÉNÉRAL ─────────────────────────────────────────────────
  ['energie generale insuffisante',  'insuffisance energetique vide qi energie insuffisante'],
  ['vide energetique general',       'insuffisance energetique vide qi energie insuffisante'],
  ['epuisement global',              'vide qi qi epuise energie insuffisante'],
  ['terrain vide',                   'vide qi insuffisance energetique'],
  ['terrain energetique appauvri',   'vide qi vide yang insuffisance energetique'],
  ['manque d energie general',       'vide qi manque de qi energie insuffisante'],
  ['epuisement energetique',         'vide qi qi epuise insuffisance energetique'],
  ['energie appauvrie',              'vide qi insuffisance energetique energie insuffisante'],
  ['grande fatigue energetique',     'vide qi insuffisance energetique energie insuffisante'],
  ['yang general qui s effondre',    'vide yang yang general insuffisant'],
  ['yang tres bas',                  'vide yang yang general insuffisant'],

  // ─── VIDE DE YIN GÉNÉRAL ─────────────────────────────────────────────────────
  ['substance yin insuffisante',     'vide de yin yin insuffisant yin deficient'],
  ['yin qui s epuise',               'vide de yin yin vide yin insuffisant'],
  ['yin appauvri',                   'vide de yin yin vide yin insuffisant'],
  ['yin diminue',                    'vide de yin yin vide yin insuffisant'],
  ['manque de yin',                  'vide de yin manque de yin yin insuffisant'],
  ['yin se tarit',                   'vide de yin yin vide yin insuffisant'],
  ['carence en yin',                 'vide de yin carence yin yin insuffisant'],
  ['yin epuise',                     'vide de yin yin vide yin epuise'],

  // ─── CHEN / PSYCHISME (terminologie IEATC : Chen, Roun, Pro, I, Tche) ───────
  ['esprit perturbe',                'chen perturbe coeur perturbe chen agite'],
  ['esprit agite',                   'chen perturbe chen agite perturbation du chen'],
  ['psychisme perturbe',             'chen perturbe coeur perturbe'],
  ['mental instable',                'chen perturbe chen agite'],
  ['esprit instable',                'chen perturbe chen trouble'],
  ['sommeil agite par le chen',      'chen perturbe insomnie palpitations'],
  ['coeur qui n ancre plus le chen', 'chen perturbe coeur ne peut plus ancrer le chen'],
  ['chen non ancre',                 'chen perturbe chen agite coeur ne peut plus ancrer le chen'],
  ['shen perturbe',                  'chen perturbe chen agite'],
  ['shen non ancre',                 'chen perturbe chen agite'],
  ['pensees qui s emballent',        'chen perturbe chen agite i perturbe'],
  ['ruminations',                    'i perturbe i insuffisant rumination pathologique'],
  ['pensees circulaires',            'i perturbe pensees circulaires'],
  ['idees fixes',                    'i perturbe idees fixes'],
  ['obsessions',                     'i perturbe idees fixes rumination pathologique'],
  ['peur profonde',                  'tche perturbe peur chronique envahissante peur pathologique rein'],
  ['peur du vide',                   'tche perturbe peur chronique envahissante'],
  ['manque de volonte',              'tche perturbe volonte affaiblie manque de volonte profond'],
  ['deuil non fait',                 'pro perturbe deuil non resolu melancolie profonde'],
  ['tristesse profonde',             'pro perturbe melancolie profonde tristesse metal'],

  // ─── TENDONS / LIGAMENTS ─────────────────────────────────────────────────────
  ['tendons fragiles',               'tendons foie vb tendons fragiles foie ne gouverne plus les tendons'],
  ['ligaments fragiles',             'tendons foie vb ligaments non nourris foie vb tendons'],
  ['tendons non nourris',            'tendons foie vb tendons non nourris vide yin foie vide sang foie'],
  ['tendons qui lachent',            'tendons foie vb tendons fragiles'],
  ['genou qui craque',               'tendons foie vb tendons fragiles gonalgie'],
  ['tendinopathie sur vide de foie', 'tendons foie vb vide sang foie foie ne gouverne plus les tendons'],

  // ─── NOMS DE POINTS ROMANISÉS (pinyin / IEATC) → codes ─────────────────────
  // Pinyin standard
  ['tai xi',                         '3r'],
  ['tai chong',                      '3f'],
  ['zu san li',                      '36e'],
  ['san yin jiao',                   '6rte'],
  ['shen men',                       '7c'],
  ['he gu',                          '4gi'],
  ['lie que',                        '7p'],
  ['nei guan',                       '6mc'],
  ['tian shu',                       '25e'],
  ['zhong wan',                      '12jm'],
  ['guan yuan',                      '4jm'],
  ['ming men',                       '4tm'],
  ['bai hui',                        '20tm'],
  ['fengchi',                        '20vb'],
  ['feng chi',                       '20vb'],
  ['yang ling quan',                 '34vb'],
  ['tai bai',                        '3rte'],
  ['yin ling quan',                  '9rte'],
  ['qu quan',                        '8f'],
  ['fu liu',                         '7r'],
  ['zhao hai',                       '6r'],
  ['da zhong',                       '4r'],
  ['shen shu',                       '23v'],
  ['fei shu',                        '13v'],
  ['gan shu',                        '18v'],
  ['pi shu',                         '20v'],
  ['xin shu',                        '15v'],
  ['da chang shu',                   '25v'],
  ['guan yuan shu',                  '26v'],
  ['chi ze',                         '5p'],
  ['kong zui',                       '6p'],
  ['yu ji',                          '10p'],
  ['zu lin qi',                      '41vb'],
  ['dan zhong',                      '17jm'],
  ['qi hai',                         '6jm'],
  ['zhong ji',                       '3jm'],
  ['shui fen',                       '9jm'],
  ['xue hai',                        '10rte'],
  ['feng long',                      '40e'],
  ['tian tu',                        '22jm'],
  ['lian quan',                      '23jm'],
  ['bai hui',                        '20tm'],
  ['yin tang',                       'yin tang'],
  ['yong quan',                      '1r'],
  ['da ling',                        '7mc'],
  ['jian shi',                       '5mc'],
  // Romanisation IEATC (française)
  ['tae xi',                         '3r'],
  ['tai tchong',                     '3f'],
  ['tsou san li',                    '36e'],
  ['san yin tsiao',                  '6rte'],
  ['chen men',                       '7c'],
  ['ho kou',                         '4gi'],
  ['lie tsiue',                      '7p'],
  ['nei kouan',                      '6mc'],
  ['tae pai',                        '3rte'],
  ['yin ling tsuan',                 '9rte'],
  ['tsiu tsuan',                     '8f'],
  ['fou lieou',                      '7r'],
  ['tcheou hai',                     '6r'],
  ['chen chou',                      '23v'],
  ['fong tche',                      '20vb'],
  ['yang ling tsuan',                '34vb'],

  // ─── CORRESPONDANCES ÉNERGÉTIQUES IEATC ↔ MTC ───────────────────────────────
  ['energie nutritive',              'iong energie nutritive'],
  ['ying qi',                        'iong energie nutritive'],
  ['energie defensive',              'oe energie defensive'],
  ['wei qi',                         'oe'],
  ['energie ancestrale',             'tsing energie ancestrale'],
  ['energie vitale',                 'tchi energie vitale'],
  ['jing qi',                        'tsing energie ancestrale'],
  ['yuan qi',                        'yuan tchi energie originelle'],
  ['zong qi',                        'tsong tchi'],
  ['zhen qi',                        'tcheung tchi tchi'],
  ['xue',                            'sang'],
  ['jin ye',                         'liquides organiques'],
  ['merveilleux vaisseaux',          'tou mo jenn mo yang tsiao mo yin tsiao mo tchrong mo tae mo yang oe mo yin oe mo du mai ren mai chong mai dai mai'],
  ['qi jing ba mai',                 'tou mo jenn mo yang tsiao mo yin tsiao mo tchrong mo tae mo yang oe mo yin oe mo du mai ren mai chong mai dai mai'],

  // ─── STAGNATION DE QI DE L'ESTOMAC ─────────────────────────────────────────
  ['blocage de l estomac',           'stagnation qi estomac estomac bloque'],
  ['blocage d estomac',              'stagnation qi estomac estomac bloque'],
  ['estomac bloque',                 'stagnation qi estomac'],
  ['estomac qui se bloque',          'stagnation qi estomac'],
  ['estomac obstrue',                'stagnation qi estomac'],
  ['estomac sature',                 'stagnation qi estomac stagnation nourriture'],
  ['estomac ne fait pas descendre',  'rebellion qi estomac stagnation qi estomac'],
  ['estomac ne descend plus',        'rebellion qi estomac'],
  ['qi de l estomac ne descend',     'rebellion qi estomac'],
  ['qi de l estomac rebelle',        'rebellion qi estomac'],
  ['estomac rebelle',                'rebellion qi estomac'],
  ['qi d estomac rebelle',           'rebellion qi estomac'],
  ['reflux gastrique',               'rebellion qi estomac chaleur estomac'],
  ['nausees par blocage',            'rebellion qi estomac stagnation qi estomac'],
  ['digestion bloquee dans l estomac','stagnation qi estomac stagnation nourriture'],

  // ─── STAGNATION DE QI DE LA RATE ───────────────────────────────────────────
  ['blocage de la rate',             'stagnation qi rate rate bloquee'],
  ['blocage a la rate',              'stagnation qi rate rate bloquee'],
  ['rate bloquee',                   'stagnation qi rate'],
  ['rate qui se bloque',             'stagnation qi rate'],
  ['rate obstrue',                   'stagnation qi rate'],

  // ─── STAGNATION DE SANG AU FOIE ────────────────────────────────────────────
  ['sang du foie stagnant',          'stagnation sang foie foie sang stagnant'],
  ['sang stagnant au foie',          'stagnation sang foie'],
  ['stase de sang au foie',          'stagnation sang foie stase sanguine foie'],
  ['sang bloque au foie',            'stagnation sang foie'],
  ['sang du foie qui se bloque',     'stagnation sang foie'],
  ['caillots menstruels',            'stagnation sang foie stagnation de sang'],
  ['regles avec caillots',           'stagnation sang foie stagnation de sang'],
  ['regles sombres',                 'stagnation sang foie vide sang foie'],

  // ─── YANG APPARENT — toutes formulations ────────────────────────────────────
  ['yang apparent de vb',            'yang apparent vb feu vide yang foie montant'],
  ['yang apparent vb',               'yang apparent vb feu vide yang foie montant'],
  ['faux yang de vb',                'yang apparent vb feu vide'],
  ['faux yang vb',                   'yang apparent vb feu vide'],
  ['yang flottant de vb',            'yang apparent vb yang flottant feu vide'],
  ['yang non ancre vb',              'yang apparent vb yang non ancre feu vide'],
  ['yang de vb qui monte',           'yang apparent vb yang foie montant'],
  ['yang vb montant',                'yang apparent vb yang foie montant'],
  ['yang apparent du foie',          'yang apparent foie feu vide yang foie montant'],
  ['yang apparent foie',             'yang apparent foie feu vide'],
  ['faux yang du foie',              'yang apparent foie feu vide'],
  ['yang flottant du foie',          'yang apparent foie yang flottant feu vide'],

  // ─── VIDE DE QI DU FOIE ─────────────────────────────────────────────────────
  ['foie en vide de qi',             'vide qi foie foie affaibli'],
  ['foie energetiquement vide',      'vide qi foie'],
  ['foie manque de qi',              'vide qi foie'],

  // ─── RÉBELLION QI / DESCENTE PERTURBÉE ──────────────────────────────────────
  ['qi ne descend pas',              'rebellion qi estomac descente perturbee'],
  ['descente perturbee',             'rebellion qi estomac'],
  ['qi monte en rebellion',          'rebellion qi estomac yang foie montant'],
  ['qi rebelle',                     'rebellion qi estomac'],
  ['hoquet chronique',               'rebellion qi estomac'],
  ['vomissements chroniques',        'rebellion qi estomac stagnation qi estomac'],

  // ═══════════════════════════════════════════════════════════════════════════
  // RÈGLE FONDAMENTALE : BLOCAGE = STAGNATION (synonymes absolus en IEATC)
  // "Foie bloqué" = "blocage du Foie" = "stagnation du Foie"
  // Le système doit reconnaître les deux formes pour chaque organe.
  // ═══════════════════════════════════════════════════════════════════════════

  // ─── FOIE (Bois) ─────────────────────────────────────────────────────────
  ['stagnation du foie',             'stagnation qi foie foie bloque'],
  ['stagnation au foie',             'stagnation qi foie foie bloque'],
  ['stagnation de l energie du foie','stagnation qi foie foie bloque'],
  ['stagnation du qi du foie',       'stagnation qi foie'],
  ['stagnation de qi foie',          'stagnation qi foie'],
  ['foie en stagnation',             'stagnation qi foie foie bloque'],
  ['le foie stagne',                 'stagnation qi foie foie bloque'],
  ['foie qui stagne',                'stagnation qi foie foie bloque'],

  // ─── VÉSICULE BILIAIRE (Bois — même famille que Foie) ────────────────────
  ['stagnation de la vesicule',      'stagnation qi foie bois qui se bloque'],
  ['stagnation de la vb',            'stagnation qi foie bois qui se bloque'],
  ['stagnation du bois vb',          'stagnation qi foie bois qui se bloque'],
  ['blocage de la vb',               'stagnation qi foie bois qui se bloque'],
  ['blocage de la vesicule',         'stagnation qi foie bois qui se bloque'],
  ['vesicule bloquee',               'stagnation qi foie bois qui se bloque'],
  ['vb stagnante',                   'stagnation qi foie bois qui se bloque'],

  // ─── ESTOMAC ──────────────────────────────────────────────────────────────
  ['stagnation de l estomac',        'stagnation qi estomac estomac bloque'],
  ['stagnation a l estomac',         'stagnation qi estomac estomac bloque'],
  ['stagnation du qi de l estomac',  'stagnation qi estomac'],
  ['estomac en stagnation',          'stagnation qi estomac'],
  ['l estomac stagne',               'stagnation qi estomac'],
  ['stagnation de qi d estomac',     'stagnation qi estomac'],

  // ─── RATE (Terre) ─────────────────────────────────────────────────────────
  ['stagnation de la rate',          'stagnation qi rate rate bloquee'],
  ['stagnation a la rate',           'stagnation qi rate rate bloquee'],
  ['stagnation du qi de la rate',    'stagnation qi rate'],
  ['rate en stagnation',             'stagnation qi rate'],
  ['la rate stagne',                 'stagnation qi rate'],

  // ─── POUMON (Métal) ───────────────────────────────────────────────────────
  ['stagnation du poumon',           'obstruction meridien stagnation qi'],
  ['blocage du poumon',              'obstruction meridien stagnation qi'],
  ['poumon bloque',                  'obstruction meridien stagnation qi poumon'],
  ['poumon en stagnation',           'obstruction meridien stagnation qi poumon'],
  ['qi du poumon bloque',            'obstruction meridien vide qi poumon'],
  ['qi du poumon stagnant',          'obstruction meridien stagnation qi'],

  // ─── CŒUR ─────────────────────────────────────────────────────────────────
  ['stagnation du coeur',            'stagnation de sang stagnation qi'],
  ['blocage du coeur',               'stagnation de sang obstruction meridien'],
  ['coeur bloque',                   'stagnation de sang stagnation qi'],
  ['qi du coeur bloque',             'stagnation qi vide qi coeur'],

  // ─── REIN (Eau) — stagnation Rein = souvent obstruction méridien ──────────
  ['stagnation du rein',             'obstruction meridien stagnation qi'],
  ['blocage du rein',                'obstruction meridien stagnation qi'],
  ['rein bloque',                    'obstruction meridien stagnation qi'],

  // ─── FORME GÉNÉRIQUE (organe + bloqué/stagnant sans précision) ───────────
  ['energie bloquee',                'stagnation qi foie bloque'],
  ['circulation bloquee',            'stagnation qi obstruction meridien'],
  ['qi bloque',                      'stagnation qi'],
  ['le qi ne circule plus',          'stagnation qi obstruction meridien'],
  ['le qi ne circule pas',           'stagnation qi obstruction meridien'],
  ['qi en stagnation',               'stagnation qi'],
  ['qi stagnant',                    'stagnation qi'],

  // ═══════════════════════════════════════════════════════════════════════════
  // TERMINOLOGIE IEATC PROPRE — Tsang, Fu, TT, Tchi, Iong, Oé, Tsing
  // Ces termes sont SPÉCIFIQUES à l'IEATC et doivent être reconnus
  // ═══════════════════════════════════════════════════════════════════════════

  // ─── TSANG (organes Yin pleins — équivalent Zang) ────────────────────────
  ['tsang foie',                     'foie zang foie'],
  ['tsang rate',                     'rate zang rate'],
  ['tsang coeur',                    'coeur zang coeur'],
  ['tsang poumon',                   'poumon zang poumon'],
  ['tsang rein',                     'rein zang rein'],
  ['les tsang',                      'organes yin tsang zang'],
  ['les cinq tsang',                 'organes yin tsang zang foie rate coeur poumon rein'],

  // ─── FU (viscères Yang creux) ────────────────────────────────────────────
  ['fu estomac',                     'estomac fu'],
  ['fu vesicule biliaire',           'vesicule biliaire fu'],
  ['fu intestin grele',              'intestin grele fu'],
  ['fu gros intestin',               'gros intestin fu'],
  ['fu vessie',                      'vessie fu'],
  ['les fu',                         'visceres yang fu'],
  ['les six fu',                     'visceres yang fu estomac vesicule biliaire intestin grele gros intestin vessie triple rechauffeur'],

  // ─── TCHI (Qi en IEATC) ──────────────────────────────────────────────────
  ['le tchi',                        'qi tchi energie vitale'],
  ['tchi insuffisant',               'vide de qi qi insuffisant tchi vide'],
  ['tchi en vide',                   'vide de qi qi vide tchi vide'],
  ['tchi epuise',                    'vide de qi qi epuise tchi vide'],
  ['tchi qui stagne',                'stagnation de qi qi stagnant tchi bloque'],
  ['tchi bloque',                    'stagnation de qi qi bloque tchi bloque'],
  ['le tchi ne circule plus',        'stagnation de qi obstruction meridien tchi bloque'],
  ['tchi en exces',                  'plenitude de qi tchi en exces'],
  ['manque de tchi',                 'vide de qi manque de qi tchi vide'],

  // ─── IONG (énergie nutritive — Ying Qi) ──────────────────────────────────
  ['iong',                           'iong energie nutritive ying qi'],
  ['l iong',                         'iong energie nutritive'],
  ['iong vide',                      'iong insuffisante vide d iong'],
  ['iong insuffisante',              'iong insuffisante vide d iong'],
  ['iong faiblit',                   'iong insuffisante vide d iong'],
  ['iong epuisee',                   'iong insuffisante vide d iong'],
  ['l iong ne nourrit plus',         'iong insuffisante vide d iong'],
  ['deficit d iong',                 'iong insuffisante vide d iong'],

  // ─── OÉ (énergie défensive — Wei Qi) ────────────────────────────────────
  ['oe',                             'oe energie defensive wei qi'],
  ['l oe',                           'oe energie defensive'],
  ['oe en exces',                    'oe en plenitude plenitude d oe'],
  ['oe locale excessive',            'oe en plenitude plenitude d oe'],
  ['oe qui monte',                   'oe en plenitude chaleur de surface'],
  ['oe qui ne circule plus',         'oe bloquee stagnation de qi'],
  ['oe locale en exces',             'oe en plenitude chaleur locale'],
  ['oe ne protege plus',             'vide d oe energie defensive insuffisante'],
  ['oe insuffisante',                'vide d oe energie defensive insuffisante'],
  ['defense insuffisante',           'vide d oe oe insuffisante'],

  // ─── TSING (énergie ancestrale — Jing) ───────────────────────────────────
  ['tsing',                          'tsing jing essence energie ancestrale'],
  ['le tsing',                       'tsing jing essence'],
  ['tsing vide',                     'vide de jing tsing epuise jing vide'],
  ['tsing insuffisant',              'vide de jing tsing epuise jing insuffisant'],
  ['tsing epuise',                   'vide de jing tsing epuise jing epuise'],
  ['tsing du rein',                  'jing du rein essence renale tsing rein'],
  ['tsing du rein vide',             'vide de jing du rein jing du rein vide tsing epuise'],
  ['l energie ancestrale s epuise',  'vide de jing tsing epuise energie ancestrale epuisee'],
  ['l energie ancestrale faiblit',   'vide de jing tsing epuise energie ancestrale epuisee'],

  // ─── TT / TCHING TCHENG (méridien principal) ────────────────────────────
  ['meridien principal',             'obstruction meridien meridien atteint'],
  ['meridien principal atteint',     'obstruction meridien meridien atteint'],
  ['meridien principal bloque',      'obstruction meridien meridien bloque'],
  ['meridien principal obstrue',     'obstruction meridien meridien obstrue'],
  ['atteinte du meridien principal', 'obstruction meridien atteinte meridien'],

  // ═══════════════════════════════════════════════════════════════════════════
  // ÉMOTIONS → ORGANES (correspondances fondamentales IEATC)
  // Colère → Foie | Joie → Cœur | Rumination → Rate | Tristesse → Poumon | Peur → Rein
  // ═══════════════════════════════════════════════════════════════════════════

  // ─── COLÈRE / FRUSTRATION → FOIE (Bois) ──────────────────────────────────
  ['colere',                         'stagnation qi foie foie bloque'],
  ['colere refoulee',                'stagnation qi foie foie bloque'],
  ['colere contenue',                'stagnation qi foie foie bloque'],
  ['frustration',                    'stagnation qi foie foie bloque'],
  ['frustration refoulee',           'stagnation qi foie foie bloque'],
  ['irritabilite',                   'yang du foie montant stagnation qi foie'],
  ['impatience',                     'stagnation qi foie yang du foie montant'],
  ['enervement',                     'stagnation qi foie yang du foie montant'],
  ['rage',                           'feu du foie yang du foie montant'],
  ['agacement',                      'stagnation qi foie'],
  ['ressentiment',                   'stagnation qi foie foie bloque'],

  // ─── JOIE EXCESSIVE / AGITATION → CŒUR (Feu) ────────────────────────────
  ['joie excessive',                 'shen perturbe shen agite coeur perturbe'],
  ['excitation excessive',           'shen perturbe shen agite'],
  ['manie',                          'shen perturbe shen agite feu du coeur'],
  ['agitation mentale',              'shen perturbe shen agite'],

  // ─── RUMINATION / SOUCI → RATE (Terre) ───────────────────────────────────
  ['souci',                          'yi perturbe vide qi rate rate affaiblie'],
  ['soucis',                         'yi perturbe vide qi rate rate affaiblie'],
  ['inquietude',                     'yi perturbe vide qi rate'],
  ['surmenage intellectuel',         'yi perturbe vide qi rate rate epuisee'],
  ['pensee excessive',               'yi perturbe rumination pathologique'],
  ['reflexion excessive',            'yi perturbe rumination pathologique vide qi rate'],

  // ─── TRISTESSE / DEUIL → POUMON (Métal) ──────────────────────────────────
  ['tristesse',                      'po perturbe melancolie profonde tristesse metal poumon'],
  ['deuil',                          'po perturbe deuil non resolu tristesse metal'],
  ['chagrin',                        'po perturbe melancolie profonde tristesse metal'],
  ['melancolie',                     'po perturbe melancolie profonde tristesse metal'],
  ['nostalgie envahissante',         'po perturbe melancolie profonde'],

  // ─── PEUR / TERREUR → REIN (Eau) ─────────────────────────────────────────
  ['peur',                           'zhi perturbe peur chronique envahissante rein'],
  ['peur chronique',                 'zhi perturbe peur chronique envahissante rein'],
  ['terreur',                        'zhi perturbe rein peur pathologique rein'],
  ['frayeur',                        'shen perturbe zhi perturbe rein'],
  ['angoisse profonde',              'zhi perturbe peur chronique envahissante rein'],
  ['manque de volonte',              'zhi perturbe volonte affaiblie vide yang rein'],

  // ═══════════════════════════════════════════════════════════════════════════
  // FONCTIONS ORGANIQUES — le praticien décrit la fonction défaillante
  // ═══════════════════════════════════════════════════════════════════════════

  // ─── FOIE gouverne les tendons, stocke le Sang, assure le libre flux du Qi
  ['le foie ne gouverne plus les tendons', 'vide sang foie tendons non nourris foie vb tendons'],
  ['le foie ne stocke plus le sang',       'vide sang foie sang du foie vide'],
  ['le foie ne draine plus',               'stagnation qi foie foie bloque'],
  ['le libre flux du foie est entrave',    'stagnation qi foie foie bloque'],

  // ─── RATE gouverne le transport-transformation, retient le Sang, monte le Qi pur
  ['la rate ne transforme plus',           'vide qi rate rate insuffisante'],
  ['la rate ne transporte plus',           'vide qi rate rate insuffisante'],
  ['la rate ne monte plus',               'vide qi rate qi de la rate ne monte plus prolapsus'],
  ['le qi de la rate ne monte plus',       'vide qi rate qi de la rate ne monte plus prolapsus'],
  ['la rate ne retient plus le sang',      'vide qi rate rate ne retient plus le sang'],
  ['la rate ne produit plus le sang',      'vide qi rate vide sang rate'],
  ['la terre ne transforme plus',          'vide qi rate rate insuffisante terre affaiblie'],

  // ─── POUMON gouverne le Qi, diffuse, fait descendre ──────────────────────
  ['le poumon ne diffuse plus',            'vide qi poumon qi du poumon insuffisant'],
  ['le poumon ne fait plus descendre',     'vide qi poumon rebellion qi'],
  ['le poumon ne gouverne plus le qi',     'vide qi poumon qi du poumon insuffisant'],
  ['diffusion du poumon insuffisante',     'vide qi poumon qi du poumon insuffisant'],
  ['le metal ne descend plus',            'vide qi poumon rebellion qi'],

  // ─── REIN gouverne l'Eau, stocke le Jing, produit la moelle ─────────────
  ['le rein ne gouverne plus l eau',       'vide yang rein yang du rein insuffisant'],
  ['le rein ne stocke plus le jing',       'vide jing rein jing du rein vide'],
  ['le rein ne retient plus',              'vide qi rein rein qui ne retient plus'],
  ['le rein ne rechauffe plus la rate',    'rate non rechauffee vide yang rein yang du rein insuffisant'],
  ['le feu du ming men ne rechauffe plus', 'ming men insuffisant vide yang rein feu du ming men'],

  // ─── CŒUR gouverne le Sang, abrite le Chen ──────────────────────────────
  ['le coeur ne gouverne plus le sang',    'vide qi coeur vide sang coeur'],
  ['le coeur n abrite plus le shen',       'shen perturbe coeur ne peut plus ancrer le shen'],
  ['le coeur ne propulse plus',            'vide qi coeur stagnation de sang'],

  // ═══════════════════════════════════════════════════════════════════════════
  // FONG EXTERNE — expressions naturelles
  // ═══════════════════════════════════════════════════════════════════════════
  ['fong externe',                   'vent externe fong externe invasion de fong'],
  ['invasion de fong',               'vent externe fong externe agression de fong'],
  ['agression de fong',              'vent externe fong externe invasion de fong'],
  ['fong froid',                     'vent externe fong externe vent froid fong froid'],
  ['fong chaleur',                   'vent externe fong externe vent chaleur fong chaleur'],
  ['attrape un fong',                'vent externe fong externe invasion de fong'],
  ['pris un fong',                   'vent externe fong externe invasion de fong'],
  ['fong attaque le poumon',         'vent externe fong externe poumon attaque par le vent invasion externe poumon'],
  ['fong attaque la surface',        'vent externe fong externe invasion de fong vent froid en surface'],
  ['fong envahit la surface',        'vent externe fong externe invasion de fong vent froid en surface'],

  // ═══════════════════════════════════════════════════════════════════════════
  // MERVEILLEUX VAISSEAUX — expressions naturelles IEATC
  // Tou Mo, Jenn Mo, Tchrong Mo, Taé Mo, Yang/Yin Tsiao Mo, Yang/Yin Oé Mo
  // ═══════════════════════════════════════════════════════════════════════════
  ['tou mo',                         'du mai vaisseau gouverneur tou mo'],
  ['tou mo insuffisant',             'du mai insuffisant tou mo vide yang ne monte plus'],
  ['tou mo fragilise',               'du mai fragilise tou mo vide'],
  ['jenn mo',                        'ren mai vaisseau conception jenn mo'],
  ['jenn mo fragilise',              'ren mai fragilise jenn mo vide yin insuffisant pour ancrer'],
  ['jenn mo insuffisant',            'ren mai insuffisant jenn mo vide'],
  ['tchrong mo',                     'chong mai vaisseau penetrant tchrong mo'],
  ['le tchrong mo ne distribue plus','chong mai insuffisant tchrong mo vide'],
  ['tae mo',                         'dai mai vaisseau ceinture tae mo'],
  ['yang tsiao mo',                  'yang qiao mo yang tsiao mo'],
  ['yin tsiao mo',                   'yin qiao mo yin tsiao mo'],
  ['yang oe mo',                     'yang wei mo yang oe mo'],
  ['yin oe mo',                      'yin wei mo yin oe mo'],

  // ═══════════════════════════════════════════════════════════════════════════
  // SIX ÉNERGIES / GRANDS MÉRIDIENS — présentations cliniques
  // ═══════════════════════════════════════════════════════════════════════════
  ['atteinte du tae yang',           'tae yang tai yang niveau tae yang'],
  ['syndrome tae yang',              'tae yang tai yang niveau tae yang'],
  ['atteinte du chao yang',          'chao yang shao yang niveau chao yang'],
  ['syndrome chao yang',             'chao yang shao yang niveau chao yang'],
  ['demi surface demi profondeur',   'chao yang shao yang niveau chao yang'],
  ['charniere',                      'chao yang shao yang niveau chao yang'],
  ['atteinte du yang ming',          'yang ming niveau yang ming'],
  ['syndrome yang ming',             'yang ming niveau yang ming'],
  ['atteinte du tae yin',            'tae yin tai yin niveau tae yin'],
  ['syndrome tae yin',               'tae yin tai yin niveau tae yin'],
  ['atteinte du chao yin',           'chao yin shao yin niveau chao yin'],
  ['syndrome chao yin',              'chao yin shao yin niveau chao yin'],
  ['atteinte du tsieu yin',          'tsieu yin tsiue yin jue yin niveau tsieu yin'],
  ['atteinte du tsiue yin',          'tsieu yin tsiue yin jue yin niveau tsiue yin'],
  ['syndrome tsieu yin',             'tsieu yin tsiue yin jue yin niveau tsieu yin'],
  ['syndrome tsiue yin',             'tsieu yin tsiue yin jue yin niveau tsiue yin'],

  // ═══════════════════════════════════════════════════════════════════════════
  // AXE CŒUR–REIN (Eau–Feu) — dysharmonie fondamentale
  // ═══════════════════════════════════════════════════════════════════════════
  ['coeur et rein ne communiquent plus', 'dysharmonie coeur rein axe eau feu brise vide yin rein shen perturbe'],
  ['le feu et l eau ne communiquent plus', 'dysharmonie coeur rein axe eau feu brise'],
  ['axe coeur rein brise',           'dysharmonie coeur rein axe eau feu brise'],
  ['axe eau feu brise',              'dysharmonie coeur rein axe eau feu brise'],
  ['l eau ne monte plus vers le feu','dysharmonie coeur rein vide yin rein axe eau feu brise'],
  ['le feu ne descend plus vers l eau', 'dysharmonie coeur rein axe eau feu brise'],

  // ═══════════════════════════════════════════════════════════════════════════
  // YANG APPARENT — enrichir toutes les variantes avec les deux termes
  // ═══════════════════════════════════════════════════════════════════════════
  ['yang apparent du rein',          'yang apparent feu du vide yang flottant rein vide yin rein'],
  ['faux yang du rein',              'yang apparent feu du vide rein vide yin rein'],
  ['chaleur sur vide de yin',        'yang apparent feu du vide chaleur de vide vide yin'],
  ['feu sur vide de yin',            'yang apparent feu du vide vide yin'],
  ['yang monte car le yin ne retient plus', 'yang apparent feu du vide yang non ancre vide yin'],

  // ═══════════════════════════════════════════════════════════════════════════
  // PROLAPSUS / QI QUI NE MONTE PLUS — Rate fondamentale
  // ═══════════════════════════════════════════════════════════════════════════
  ['prolapsus',                      'vide qi rate qi de la rate ne monte plus prolapsus'],
  ['ptose',                          'vide qi rate qi de la rate ne monte plus prolapsus'],
  ['descente d organe',              'vide qi rate qi de la rate ne monte plus prolapsus'],
  ['les chairs ne tiennent plus',    'vide qi rate qi de la rate ne monte plus'],
  ['qi ne monte plus',               'vide qi rate qi de la rate ne monte plus'],

  // ═══════════════════════════════════════════════════════════════════════════
  // CIRCULATION DU SANG — faire circuler, disperser les stases
  // ═══════════════════════════════════════════════════════════════════════════
  ['faire circuler le sang',         'faire circuler le sang disperser stases sanguines'],
  ['activer le sang',                'faire circuler le sang disperser stases sanguines'],
  ['mobiliser le sang',              'faire circuler le sang'],
  ['disperser les stases',           'disperser stases sanguines stagnation de sang'],
  ['lever les stases',               'disperser stases sanguines stagnation de sang'],
  ['sang a faire circuler',          'faire circuler le sang stagnation de sang'],

  // ═══════════════════════════════════════════════════════════════════════════
  // FAIRE CIRCULER LE QI — stratégie générale
  // ═══════════════════════════════════════════════════════════════════════════
  ['faire circuler le qi',           'faire circuler le qi stagnation qi'],
  ['faire circuler l energie',       'faire circuler le qi stagnation qi'],
  ['relancer la circulation du qi',  'faire circuler le qi stagnation qi'],
  ['debloquer le qi',                'faire circuler le qi stagnation qi qi bloque'],
  ['relancer le qi',                 'faire circuler le qi'],
  ['relancer l energie',             'faire circuler le qi'],

  // ═══════════════════════════════════════════════════════════════════════════
  // FAIRE DESCENDRE LE QI — pour rébellion
  // ═══════════════════════════════════════════════════════════════════════════
  ['faire descendre le qi',          'faire descendre le qi rebellion qi estomac'],
  ['abaisser le qi',                 'faire descendre le qi'],
  ['le qi doit redescendre',         'faire descendre le qi rebellion qi estomac'],
  ['ramener le qi vers le bas',      'faire descendre le qi'],

  // ═══════════════════════════════════════════════════════════════════════════
  // ANCRER LE YANG — stratégie spécifique
  // ═══════════════════════════════════════════════════════════════════════════
  ['ancrer le yang',                 'ancrer le yang nourrir le yin yang non ancre'],
  ['le yang doit etre ancre',        'ancrer le yang yang non ancre'],
  ['ramener le yang vers le bas',    'ancrer le yang disperser le yang du foie'],
  ['yang a ancrer',                  'ancrer le yang yang non ancre yang flottant'],

  // ═══════════════════════════════════════════════════════════════════════════
  // DISPERSER / CLARIFIER LA CHALEUR RÉELLE (≠ Yang apparent)
  // ═══════════════════════════════════════════════════════════════════════════
  ['disperser la chaleur',           'disperser la chaleur clarifier la chaleur'],
  ['clarifier la chaleur',           'disperser la chaleur clarifier la chaleur'],
  ['evacuer la chaleur',             'disperser la chaleur clarifier la chaleur'],
  ['rafraichir la chaleur',          'disperser la chaleur clarifier la chaleur'],
  ['eteindre le feu',                'disperser la chaleur clarifier la chaleur'],
  ['purger la chaleur',              'disperser la chaleur purgation chaleur'],

  // ═══════════════════════════════════════════════════════════════════════════
  // OBSERVATIONS CLINIQUES — Langue, Teint, Symptômes constitutionnels
  // ═══════════════════════════════════════════════════════════════════════════
  ['langue rouge sans enduit',       'vide de yin chaleur de vide yang apparent feu du vide'],
  ['langue pale',                    'vide de yang vide de sang vide qi'],
  ['langue pale et gonflée',         'vide de yang vide qi humidite'],
  ['langue rouge avec enduit jaune', 'chaleur humidite chaleur'],
  ['enduit blanc',                   'froid interne vide yang'],
  ['enduit jaune',                   'chaleur humidite chaleur'],
  ['langue violette',                'stagnation de sang stase sanguine'],
  ['langue foncee',                  'stagnation de sang stase sanguine'],
  ['teint pale',                     'vide de yang vide de sang vide qi'],
  ['teint terne',                    'vide de sang stagnation de sang'],
  ['teint jaune',                    'vide qi rate humidite rate'],
  ['teint rouge',                    'chaleur yang du foie montant feu'],

  // ─── Os / Vieillissement → Jing du Rein ──────────────────────────────────
  ['os fragiles',                    'vide jing rein jing du rein vide'],
  ['osteoporose',                    'vide jing rein jing du rein vide vide yin rein'],
  ['vieillissement premature',       'vide jing rein jing du rein vide tsing epuise'],
  ['cheveux blancs precoces',        'vide jing rein jing du rein vide'],
  ['dents qui se dechaussent',       'vide jing rein jing du rein vide'],

];

/**
 * Enrichit le texte normalisé avec des formes canoniques supplémentaires.
 * Principe non-destructif : on AJOUTE des termes canoniques au texte
 * sans supprimer l'original. Ainsi un praticien qui écrit librement
 * "le foie ne circule pas" voit son texte enrichi de "stagnation qi foie
 * foie bloque" — reconnu par les patterns existants.
 */
function enrichirTexteIeatc(texteNormalise: string): string {
  const additions: string[] = [];
  for (const [phrase, enrichissement] of EQUIVALENCES_SEMANTIQUES) {
    if (texteNormalise.includes(phrase)) {
      additions.push(enrichissement);
    }
  }
  if (additions.length === 0) return texteNormalise;
  return texteNormalise + ' ' + additions.join(' ');
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
  | 'vaisseau'       // Merveilleux Vaisseau (Tou Mo, Jenn Mo…) — niveau 3
  | 'element'        // Élément wuxing (Eau, Bois, Feu, Terre, Métal) — niveau 3
  | 'strategie'      // Stratégie thérapeutique — niveau 4
  | 'pathologie';    // Présentation clinique / motif de consultation — niveau 5

export interface ConceptIeatc {
  id: string;
  label: string;                   // Label canonique affiché dans les stats
  categorie: CategorieConcept;
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
    patterns: [
      'vide de yin', 'vide yin', 'yin vide',
      'insuffisance yin', 'yin insuffisant', 'yin deficient',
      'carence yin', 'manque de yin', 'yin manquant',
    ],
    regles: ['R1', 'R4'],
    priorite: 1,
  },
  {
    id: 'vide_qi',
    label: 'Vide de Qi / Tchi',
    categorie: 'famille_diag',
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
    label: 'Vide de Sang',
    categorie: 'famille_diag',
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
    label: 'Vide d\'Iong',
    categorie: 'famille_diag',
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
    label: 'Plénitude d\'Oé',
    categorie: 'famille_diag',
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
      'meridien poumon obstrue', 'meridien coeur obstrue',
      'meridien rate obstrue', 'meridien estomac obstrue',
      'meridien poumon bloque', 'meridien coeur bloque',
      'meridien rate bloque', 'meridien estomac bloque',
    ],
    priorite: 2,
  },

  // ─── Facteurs pathogènes internes ────────────────────────────────────────────
  {
    id: 'chaleur',
    label: 'Chaleur (plénitude)',
    categorie: 'famille_diag',
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
    label: 'Yang apparent / Feu apparent',
    categorie: 'famille_diag',
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
    patterns: [
      'froid interne', 'froid de', 'froid dans', 'froid au',
      'invasion de froid', 'froid pathogene', 'accumulation de froid',
      'blocage par le froid', 'manque de chaleur yang',
    ],
    priorite: 2,
  },
  {
    id: 'vent_interne',
    label: 'Fong interne',
    categorie: 'famille_diag',
    patterns: [
      'fong interne', 'fong du foie', 'fong interne du foie',
      'fong', 'fongs', 'le fong', 'les fong', 'les fongs', 'un fong',
      'vent interne', 'vent du foie', 'vent interne du foie',
      'agitation interne', 'yang monte en usurpateur',
      'yang ascendant', 'yang ne descend pas',
    ],
    regles: ['R4'],
    priorite: 2,
  },
  {
    id: 'vent_externe',
    label: 'Fong externe (Vent externe)',
    categorie: 'famille_diag',
    patterns: [
      'fong externe', 'invasion de fong', 'fong pathogene',
      'agression de fong', 'fong froid', 'fong chaleur',
      'fong froid externe', 'fong chaleur externe',
      'vent externe', 'invasion de vent', 'vent pathogene',
      'agression de vent', 'vent froid externe', 'vent chaleur externe',
    ],
    priorite: 2,
  },
  {
    id: 'secheresse',
    label: 'Sécheresse',
    categorie: 'famille_diag',
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
    patterns: [
      'phlegme', 'flegme', 'glaires pathogenes', 'mucus pathologique',
      'accumulation de tan', 'retention de tan', 'formation de tan',
      'production de tan', 'tan obstrue', 'tan dans les meridiens',
      'tan humide', 'tan chaud', 'tan froid', 'tan vent', 'tan feu',
      'humidite epaissie', 'humidite epaissie en tan',
      'humidite transformee en tan', 'obstruction par le tan',
      'phlegme obstruant', 'phlegme accumule',
      'mucosites epaisses', 'glaires', 'tan invisible',
      'tan pervers', 'le tan obstrue', 'le tan bloque',
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
    patterns: [
      'vide de yang du rein', 'vide yang rein', 'yang du rein vide',
      'yang du rein insuffisant', 'rein yang vide', 'yang rein insuffisant',
      'rein en vide de yang',
    ],
    regles: ['R1', 'R2'],
    priorite: 1,
    parentFamilleId: 'vide_yang',
  },
  {
    id: 'mingmen_insuffisant',
    label: 'Feu du Ming Men insuffisant',
    categorie: 'syndrome',
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
    label: 'Vide de Tsing du Rein',
    categorie: 'syndrome',
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
    label: 'Vide de Qi du Poumon',
    categorie: 'syndrome',
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
    label: 'Yang du Foie montant',
    categorie: 'syndrome',
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
    label: 'Fong interne du Foie',
    categorie: 'syndrome',
    patterns: [
      'fong interne du foie', 'fong du foie', 'fong interne foie',
      'fong foie', 'foie fong', 'fongs du foie',
      'vent interne du foie', 'vent du foie', 'gan feng',
      'vent interne foie', 'foie vent interne',
      'pouls corde arc', 'vertiges fong interne', 'vertiges vent interne',
    ],
    regles: ['R4'],
    priorite: 2,
    parentFamilleId: 'vent_interne',
  },
  {
    id: 'feu_foie',
    label: 'Feu du Foie',
    categorie: 'syndrome',
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
    id: 'bois_attaque_terre',
    label: 'Bois attaque la Terre',
    categorie: 'syndrome',
    patterns: [
      'bois attaque terre', 'bois envahit terre', 'foie attaque rate', 'foie envahit rate', 'bois sur terre',
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
    label: 'Cycle Raé (rébellion)',
    categorie: 'syndrome',
    patterns: [
      'cycle rae', 'rae', 'cycle de rebellion',
      'cycle ko inverse', 'ko inverse', 'ko brise',
      'ko inversee', 'relation ko brisee', 'cycle ko perturbe',
      'rebellion ko', 'element qui se retourne',
      'invasion ko',
    ],
    regles: ['R7'],
    priorite: 2,
  },

  // ─── Syndromes du Cœur ───────────────────────────────────────────────────────
  {
    id: 'chen_perturbe',
    label: 'Chen perturbé (Cœur)',
    categorie: 'syndrome',
    patterns: [
      'chen perturbe', 'coeur perturbe', 'chen trouble',
      'shen perturbe', 'shen trouble', 'shen agite', 'perturbation du shen',
      'insomnie palpitations', 'coeur chen',
      'chen agite', 'perturbation du chen',
    ],
    priorite: 2,
  },
  {
    id: 'feu_monte_au_coeur',
    label: 'Feu du Foie monte au Cœur',
    categorie: 'syndrome',
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
    label: 'Tan obstruant le Cœur',
    categorie: 'syndrome',
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
    id: 'froid_a_la_rate',
    label: 'Froid à la Rate',
    categorie: 'syndrome',
    patterns: [
      'froid a la rate', 'froid rate', 'rate non rechauffee', 'rate sans soutien yang',
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
    label: 'Excès de Yin au Foyer Moyen',
    categorie: 'syndrome',
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
  // ─── Paradoxe Oé/Iong ────────────────────────────────────────────────────────
  {
    id: 'paradoxe_oe_iong',
    label: 'Paradoxe Oé / Iong',
    categorie: 'syndrome',
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
    label: 'Tou Mo insuffisant',
    categorie: 'syndrome',
    patterns: [
      'du mai insuffisant', 'du mai fragilise', 'du mai vide',
      'tou mo insuffisant', 'tou mo fragilise', 'tou mo vide',
      'yang ne monte plus le long du du mai',
      'yang du dos insuffisant',
      'vaisseau gouverneur insuffisant', 'vg insuffisant',
    ],
    regles: ['R2'],
    priorite: 1,
    parentFamilleId: 'vide_yang',
  },
  {
    id: 'ren_mai_fragilise',
    label: 'Jenn Mo fragilisé',
    categorie: 'syndrome',
    patterns: [
      'ren mai fragilise', 'ren mai insuffisant', 'ren mai vide',
      'jenn mo fragilise', 'jenn mo insuffisant', 'jenn mo vide',
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
    label: 'VB sans drainage',
    categorie: 'syndrome',
    patterns: [
      'vb ne se draine pas', 'vesicule biliaire sans drainage',
      'vb sature', 'refluence vers le foie',
      'chaleur vb', 'vesicule en chaleur',
      'vesicule biliaire qui ne se draine', 'vesicule biliaire ne se draine',
      'vesicule biliaire non drainee', 'vb non drainee', 'vesicule non drainee',
    ],
    priorite: 2,
  },
  // ─── Esprits des organes (Wushen) ────────────────────────────────────────────
  {
    id: 'roun_perturbe',
    label: 'Roun perturbé (Foie)',
    categorie: 'syndrome',
    patterns: [
      'roun perturbe', 'roun instable', 'roun non ancre',
      'esprit du foie perturbe', 'roun agite', 'foie roun',
      'hun perturbe', 'hun instable', 'hun non ancre', 'hun agite',
      'ame vegetative perturbee', 'roun fragilise',
      'reves perturbants foie', 'instabilite psychique foie',
    ],
    priorite: 2,
  },
  {
    id: 'pro_perturbe',
    label: 'Pro perturbé (Poumon)',
    categorie: 'syndrome',
    patterns: [
      'pro perturbe', 'pro non ancre', 'esprit du poumon perturbe',
      'pro agite', 'poumon pro', 'po perturbe', 'po non ancre', 'po agite',
      'ame corporelle perturbee',
      'deuil non resolu', 'melancolie profonde', 'tristesse metal',
      'pro fragilise',
    ],
    priorite: 2,
  },
  {
    id: 'tche_perturbe',
    label: 'Tche perturbé (Rein)',
    categorie: 'syndrome',
    patterns: [
      'tche perturbe', 'tche insuffisant', 'esprit du rein perturbe',
      'volonte affaiblie', 'rein tche', 'tche vide',
      'zhi perturbe', 'zhi insuffisant', 'zhi vide',
      'manque de volonte profond', 'peur chronique envahissante',
      'peur pathologique rein',
    ],
    priorite: 2,
  },
  {
    id: 'i_perturbe',
    label: 'I perturbé (Rate)',
    categorie: 'syndrome',
    patterns: [
      'i perturbe', 'i insuffisant', 'esprit de la rate perturbe',
      'yi perturbe', 'yi insuffisant', 'yi fragilise',
      'intellectualite perturbee', 'rate i', 'rumination pathologique',
      'pensees circulaires', 'idees fixes', 'i fragilise',
    ],
    priorite: 2,
  },

  // ─── Tan dans les méridiens ──────────────────────────────────────────────────
  {
    id: 'tan_meridiens',
    label: 'Tan obstruant les méridiens',
    categorie: 'syndrome',
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

  // ─── Syndromes manquants : Estomac ──────────────────────────────────────────
  {
    id: 'stagnation_qi_estomac',
    label: 'Stagnation de Qi de l\'Estomac',
    categorie: 'syndrome',
    patterns: [
      'stagnation de qi de l estomac', 'stagnation qi estomac',
      'qi de l estomac stagnant', 'estomac qi stagnant',
      'blocage de l estomac', 'estomac bloque',
      'estomac obstrue', 'qi bloque dans l estomac',
      'estomac qui se bloque', 'stagnation dans l estomac',
      'blocage estomac', 'estomac en stagnation',
    ],
    priorite: 2,
    parentFamilleId: 'stagnation_qi',
  },
  {
    id: 'rebellion_qi_estomac',
    label: 'Rébellion du Qi de l\'Estomac',
    categorie: 'syndrome',
    patterns: [
      'rebellion du qi de l estomac', 'qi de l estomac rebelle',
      'qi de l estomac ne descend pas', 'qi estomac qui monte',
      'estomac rebelle', 'estomac ne fait pas descendre',
      'reflux qi estomac', 'qi rebelle estomac',
      'nausees par blocage estomac', 'estomac contre courant',
      'qi estomac en rebellion', 'estomac ne descend plus',
      'descente estomac perturbee',
    ],
    priorite: 2,
    parentFamilleId: 'stagnation_qi',
  },
  {
    id: 'stagnation_nourriture',
    label: 'Rétention de nourriture',
    categorie: 'syndrome',
    patterns: [
      'retention de nourriture', 'stagnation de nourriture',
      'nourriture stagnante', 'estomac surcharge',
      'aliments qui stagnent', 'digestion bloquee',
      'accumulation de nourriture', 'nourriture bloquee',
      'estomac deborde', 'surchauffe digestive',
    ],
    priorite: 2,
    parentFamilleId: 'stagnation_qi',
  },

  // ─── Syndromes manquants : Rate ─────────────────────────────────────────────
  {
    id: 'stagnation_qi_rate',
    label: 'Stagnation de Qi de la Rate',
    categorie: 'syndrome',
    patterns: [
      'stagnation de qi de la rate', 'stagnation qi rate',
      'qi de la rate stagnant', 'rate qi stagnant',
      'blocage de la rate', 'rate bloquee',
      'rate obstrue', 'rate qui se bloque',
      'blocage rate', 'rate en stagnation',
    ],
    priorite: 2,
    parentFamilleId: 'stagnation_qi',
  },
  {
    id: 'vide_sang_rate',
    label: 'Vide de Sang de la Rate',
    categorie: 'syndrome',
    patterns: [
      'vide de sang de la rate', 'sang de la rate vide',
      'rate sang vide', 'vide sang rate',
      'insuffisance sang rate', 'sang insuffisant rate',
      'rate ne produit plus le sang', 'rate ne genere plus le sang',
    ],
    priorite: 1,
    parentFamilleId: 'vide_sang',
  },

  // ─── Syndromes manquants : Foie ─────────────────────────────────────────────
  {
    id: 'vide_qi_foie',
    label: 'Vide de Qi du Foie',
    categorie: 'syndrome',
    patterns: [
      'vide de qi du foie', 'vide qi foie', 'foie qi vide',
      'qi du foie vide', 'qi du foie insuffisant',
      'insuffisance qi foie', 'foie en vide de qi',
      'foie energetiquement insuffisant',
    ],
    priorite: 1,
    parentFamilleId: 'vide_qi',
  },
  {
    id: 'stagnation_sang_foie',
    label: 'Stagnation de Sang au Foie',
    categorie: 'syndrome',
    patterns: [
      'stagnation de sang au foie', 'stagnation sang foie',
      'sang du foie stagnant', 'foie sang stagnant',
      'stase sanguine au foie', 'sang bloque au foie',
      'stagnation du sang au foie', 'stagnation de sang du foie',
      'sang stagnant foie', 'xue stagnant foie',
    ],
    priorite: 2,
    parentFamilleId: 'stagnation_sang',
  },
  {
    id: 'vide_yang_foie',
    label: 'Vide de Yang du Foie',
    categorie: 'syndrome',
    patterns: [
      'vide de yang du foie', 'vide yang foie', 'foie yang vide',
      'yang du foie vide', 'yang du foie insuffisant',
      'insuffisance yang foie', 'foie en vide de yang',
      'yang du bois insuffisant', 'bois en vide de yang',
    ],
    priorite: 1,
    parentFamilleId: 'vide_yang',
  },

  // ─── Syndromes manquants : Rein ─────────────────────────────────────────────
  {
    id: 'vide_qi_rein',
    label: 'Vide de Qi du Rein',
    categorie: 'syndrome',
    patterns: [
      'vide de qi du rein', 'vide qi rein', 'rein qi vide',
      'qi du rein vide', 'qi du rein insuffisant',
      'insuffisance qi rein', 'rein en vide de qi',
      'qi renal insuffisant', 'rein qui ne retient plus',
    ],
    priorite: 1,
    parentFamilleId: 'vide_qi',
  },

  // ─── Syndromes manquants : Poumon ────────────────────────────────────────────
  {
    id: 'vide_yang_poumon',
    label: 'Vide de Yang du Poumon',
    categorie: 'syndrome',
    patterns: [
      'vide de yang du poumon', 'vide yang poumon', 'poumon yang vide',
      'yang du poumon vide', 'yang du poumon insuffisant',
      'insuffisance yang poumon', 'poumon en vide de yang',
      'yang pulmonaire insuffisant',
    ],
    priorite: 1,
    parentFamilleId: 'vide_yang',
  },
  {
    id: 'tan_poumon',
    label: 'Tan obstruant le Poumon',
    categorie: 'syndrome',
    patterns: [
      'tan dans le poumon', 'phlegme dans le poumon',
      'tan obstrue le poumon', 'poumon obstrue par le tan',
      'phlegme poumon', 'tan poumon',
      'toux avec expectorations', 'accumulation tan poumon',
      'poumon envahi par le tan', 'tan dans le foyer superieur',
    ],
    priorite: 2,
    parentFamilleId: 'tan',
  },

  // ─── Syndromes manquants : Cœur/Rate (Feu-Terre) ────────────────────────────
  {
    id: 'vide_qi_rate_coeur',
    label: 'Vide de Qi Rate et Cœur',
    categorie: 'syndrome',
    patterns: [
      'vide qi rate coeur', 'vide de qi rate et coeur',
      'rate coeur en vide de qi', 'coeur rate insuffisants',
      'double vide qi rate coeur',
    ],
    priorite: 1,
    parentFamilleId: 'vide_qi',
  },

  // ─── Syndromes manquants : VB / TR ───────────────────────────────────────────
  {
    id: 'vide_qi_vb',
    label: 'Vide de Qi de la Vésicule Biliaire',
    categorie: 'syndrome',
    patterns: [
      'vide de qi de la vesicule', 'vide qi vb',
      'vesicule biliaire en vide de qi', 'qi de la vb vide',
      'vb en vide', 'vesicule insuffisante',
      'vesicule biliaire affaiblie', 'vb qi vide',
    ],
    priorite: 1,
    parentFamilleId: 'vide_qi',
  },

  // ─── Syndromes manquants : Yang apparent composite ───────────────────────────
  {
    id: 'yang_apparent_vb',
    label: 'Yang apparent de VB',
    categorie: 'syndrome',
    patterns: [
      'yang apparent de vb', 'yang apparent vb',
      'yang apparent de la vesicule', 'faux yang vb',
      'yang flottant vb', 'yang non ancre vb',
      'yang de vb qui monte', 'yang vb montant',
      'yang apparent vesicule biliaire',
    ],
    regles: ['R3', 'R4'],
    priorite: 2,
    parentFamilleId: 'feu_vide',
  },
  {
    id: 'yang_apparent_foie',
    label: 'Yang apparent du Foie',
    categorie: 'syndrome',
    patterns: [
      'yang apparent du foie', 'yang apparent foie',
      'faux yang foie', 'yang flottant foie',
      'yang non ancre foie', 'yang du foie non ancre',
      'yang apparent de foie',
    ],
    regles: ['R3', 'R4'],
    priorite: 2,
    parentFamilleId: 'feu_vide',
  },

  // ─── Dysharmonie Cœur–Rein (axe Eau-Feu) ────────────────────────────────
  {
    id: 'rein_coeur_dysharmonie',
    label: 'Dysharmonie Cœur–Rein',
    categorie: 'syndrome',
    patterns: [
      'dysharmonie coeur rein', 'axe coeur rein brise',
      'axe eau feu brise', 'coeur et rein ne communiquent plus',
      'coeur rein deconnectes', 'eau ne monte plus vers le feu',
      'feu ne descend plus vers l eau', 'rein coeur non connectes',
      'dysharmonie eau feu',
    ],
    regles: ['R4'],
    priorite: 1,
  },

  // ─── Qi de la Rate ne monte plus (prolapsus) ────────────────────────────
  {
    id: 'qi_rate_ne_monte_plus',
    label: 'Qi de la Rate ne monte plus',
    categorie: 'syndrome',
    patterns: [
      'qi de la rate ne monte plus', 'rate ne monte plus',
      'qi ne monte plus', 'prolapsus', 'ptose',
      'descente d organe', 'affaissement', 'rate ne soutient plus',
      'les chairs ne tiennent plus',
      'rate ne retient plus le sang',
    ],
    priorite: 1,
    parentFamilleId: 'vide_qi',
  },

  // ─── Vent-Chaleur envahissant le Poumon ──────────────────────────────────
  {
    id: 'vent_chaleur_poumon',
    label: 'Fong-Chaleur envahissant le Poumon',
    categorie: 'syndrome',
    patterns: [
      'vent chaleur poumon', 'fong chaleur poumon',
      'vent chaleur envahit le poumon', 'fong chaleur envahit le poumon',
      'invasion vent chaleur', 'invasion fong chaleur',
      'poumon envahi par le vent chaleur', 'poumon envahi par le fong chaleur',
      'agression vent chaleur', 'agression fong chaleur',
      'vent chaleur en surface', 'fong chaleur en surface',
    ],
    priorite: 2,
    parentFamilleId: 'vent_externe',
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
    patterns: ['rein', 'reins', 'zang rein', 'tsang rein', 'shen rein'],
  },
  {
    id: 'foie',
    label: 'Foie',
    categorie: 'organe',
    patterns: ['foie', 'zang foie', 'tsang foie', 'gan foie', 'hepatique'],
  },
  {
    id: 'rate',
    label: 'Rate',
    categorie: 'organe',
    patterns: ['rate', 'zang rate', 'tsang rate', 'pi rate'],
  },
  {
    id: 'coeur',
    label: 'Cœur',
    categorie: 'organe',
    patterns: ['coeur', 'zang coeur', 'tsang coeur', 'xin coeur'],
  },
  {
    id: 'poumon',
    label: 'Poumon',
    categorie: 'organe',
    patterns: ['poumon', 'poumons', 'zang poumon', 'tsang poumon', 'fei poumon'],
  },
  {
    id: 'maitre_coeur',
    label: 'Maître du Cœur (MC)',
    categorie: 'organe',
    patterns: ['maitre du coeur', 'maitre coeur', 'pericarde', 'xin bao', 'enveloppe du coeur'],
  },

  // ─── Viscères Fu ─────────────────────────────────────────────────────────────
  {
    id: 'estomac',
    label: 'Estomac',
    categorie: 'organe',
    patterns: ['estomac', 'fu estomac', 'wei estomac'],
  },
  {
    id: 'vb',
    label: 'Vésicule Biliaire',
    categorie: 'organe',
    patterns: ['vesicule biliaire', 'vesicule', 'vb', 'fu vb', 'dan vb'],
  },
  {
    id: 'intestin_grele',
    label: 'Intestin Grêle',
    categorie: 'organe',
    patterns: ['intestin grele', 'fu intestin grele', 'xiao chang'],
  },
  {
    id: 'gros_intestin',
    label: 'Gros Intestin',
    categorie: 'organe',
    patterns: ['gros intestin', 'fu gros intestin', 'da chang'],
  },
  {
    id: 'vessie',
    label: 'Vessie',
    categorie: 'organe',
    patterns: ['vessie', 'meridien vessie', 'meridien v', 'pang guang'],
  },
  {
    id: 'triple_rec',
    label: 'Triple Réchauffeur (TR)',
    categorie: 'organe',
    patterns: ['triple rechauffeur', 'san jiao', 'trois foyers organe'],
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

  // ─── Merveilleux Vaisseaux (8 Mo) ───────────────────────────────────────────
  // Nomenclature IEATC : Tou Mo, Jenn Mo, Tchrong Mo, Taé Mo, Yang/Yin Tsiao Mo, Yang/Yin Oé Mo
  {
    id: 'du_mai',
    label: 'Tou Mo (Vaisseau Gouverneur)',
    categorie: 'vaisseau',
    patterns: ['du mai', 'vaisseau gouverneur', 'tou mo'],
  },
  {
    id: 'ren_mai',
    label: 'Jenn Mo (Vaisseau Conception)',
    categorie: 'vaisseau',
    patterns: ['ren mai', 'vaisseau conception', 'jenn mo'],
  },
  {
    id: 'yang_qiao',
    label: 'Yang Tsiao Mo / Yang Qiao Mo',
    categorie: 'vaisseau',
    patterns: ['yang qiao', 'yang qiao mo', 'yang tsiao mo', 'yang tsiao'],
  },
  {
    id: 'yin_qiao',
    label: 'Yin Tsiao Mo / Yin Qiao Mo',
    categorie: 'vaisseau',
    patterns: ['yin qiao', 'yin qiao mo', 'yin tsiao mo', 'yin tsiao'],
  },
  {
    id: 'chong_mai',
    label: 'Tchrong Mo / Chong Mai (Vaisseau Pénétrant)',
    categorie: 'vaisseau',
    patterns: ['chong mai', 'vaisseau penetrant', 'tchrong mo', 'tchrong mai'],
  },
  {
    id: 'dai_mai',
    label: 'Taé Mo / Dai Mai (Vaisseau Ceinture)',
    categorie: 'vaisseau',
    patterns: ['dai mai', 'vaisseau ceinture', 'tae mo'],
  },
  {
    id: 'yang_wei_mo',
    label: 'Yang Oé Mo / Yang Wei Mo',
    categorie: 'vaisseau',
    patterns: ['yang wei mo', 'yang wei', 'yang oe mo'],
  },
  {
    id: 'yin_wei_mo',
    label: 'Yin Oé Mo / Yin Wei Mo',
    categorie: 'vaisseau',
    patterns: ['yin wei mo', 'yin wei', 'yin oe mo'],
  },

  // ─── Axes Grands Méridiens / Six Énergies ────────────────────────────────────
  // Variantes acceptées : orthographe IEATC (Taé/Chao) + MTC courante (Tai/Shao)
  {
    id: 'shao_yang',
    label: 'Chao Yang (TR + VB)',
    categorie: 'localisation',
    // "chao yang" = IEATC | "shao yang" = MTC | les deux sont acceptés
    patterns: ['chao yang', 'shao yang'],
  },
  {
    id: 'yang_ming',
    label: 'Yang Ming (E + GI)',
    categorie: 'localisation',
    patterns: ['yang ming', 'yan ming'],
  },
  {
    id: 'tai_yin',
    label: 'Taé Yin (Rate + Poumon)',
    categorie: 'localisation',
    // "tae yin" = IEATC | "tai yin" = MTC courante
    patterns: ['tae yin', 'tai yin'],
  },
  {
    id: 'jue_yin',
    label: 'Tsiué Yin (Foie + MC)',
    categorie: 'localisation',
    patterns: ['tsieu yin', 'tsiue yin', 'jue yin', 'tjue yin', 'jue-yin'],
  },
  {
    id: 'shao_yin',
    label: 'Chao Yin (Rein + Cœur)',
    categorie: 'localisation',
    // "chao yin" = IEATC | "shao yin" = MTC courante
    patterns: ['chao yin', 'shao yin'],
  },
  {
    id: 'tai_yang',
    label: 'Taé Yang (Vessie + IG)',
    categorie: 'localisation',
    // "tae yang" = IEATC | "tai yang" = MTC courante
    patterns: ['tae yang', 'tai yang'],
  },

  // ─── Éléments wuxing ─────────────────────────────────────────────────────────
  {
    id: 'element_eau',
    label: 'Eau (Rein / Vessie)',
    categorie: 'element',
    patterns: ['element eau', 'eau element', 'l eau', 'mouvement eau'],
  },
  {
    id: 'element_bois',
    label: 'Bois (Foie / VB)',
    categorie: 'element',
    patterns: ['element bois', 'bois element', 'le bois', 'mouvement bois'],
  },
  {
    id: 'element_feu',
    label: 'Feu (Cœur / IG)',
    categorie: 'element',
    patterns: ['element feu', 'feu element', 'le feu', 'mouvement feu'],
  },
  {
    id: 'element_terre',
    label: 'Terre (Rate / Estomac)',
    categorie: 'element',
    patterns: ['element terre', 'terre element', 'la terre', 'mouvement terre'],
  },
  {
    id: 'element_metal',
    label: 'Métal (Poumon / GI)',
    categorie: 'element',
    patterns: ['element metal', 'metal element', 'le metal', 'mouvement metal'],
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
      'tonifier le yang', 'soutenir le yang', 'relever le yang',
    ],
    priorite: 1,
  },
  {
    id: 'tonifier_yin_general',
    label: 'Tonifier le Yin général',
    categorie: 'strategie',
    patterns: [
      'tonifier le yin general', 'tonification yin general',
      'nourrir le yin general', 'soutenir le yin general',
      'yin general tonifie', 'nourrir le grand yin',
      'tonifier le yin', 'nourrir le yin', 'soutenir le yin',
    ],
    priorite: 1,
  },
  {
    id: 'tonifier_yang_rein',
    label: 'Tonifier le Yang du Rein / Ming Men',
    categorie: 'strategie',
    patterns: [
      'tonifier le yang du rein', 'tonifier yang rein',
      'tonifier ming men', 'ranimer le feu du ming men',
      'ranimer ming men', 'soutenir le yang du rein',
      'augmenter le feu du ming men',
      'travailler sur rein yang', 'nourrir le rein yang',
      'technique rein yang', 'rein yang', 'yang du rein',
    ],
    regles: ['R2'],
    priorite: 1,
  },
  {
    id: 'nourrir_yin_rein',
    label: 'Nourrir le Yin du Rein',
    categorie: 'strategie',
    patterns: [
      'nourrir le yin du rein', 'nourrir yin rein',
      'tonifier le yin du rein', 'soutenir le yin du rein',
      'yin du rein tonifie', 'nourrir l eau',
      'nourrir la base yin',
      'travailler sur rein yin', 'nourrir le rein yin',
      'rein yin', 'yin du rein',
    ],
    regles: ['R4'],
    priorite: 1,
  },
  {
    id: 'disperser_yang_foie',
    label: 'Disperser / Abaisser le Yang du Foie',
    categorie: 'strategie',
    patterns: [
      'disperser le yang du foie', 'abaisser le yang du foie',
      'disperser yang foie', 'descendre le yang du foie',
      'calmer le yang du foie', 'yang foie dispersé',
    ],
    regles: ['R4'],
    priorite: 2,
  },
  {
    id: 'traiter_yang_apparent',
    label: 'Traiter le Yang apparent / Feu apparent (vide de Yin)',
    categorie: 'strategie',
    patterns: [
      'yang apparent', 'feu apparent', 'chaleur apparente',
      'echauffement par vide de yin', 'chaleur par vide de yin',
      'feu par vide de yin', 'yang apparent par vide de yin',
      'traiter le yang apparent', 'traiter le feu apparent',
      'nourrir le yin pour calmer le feu', 'nourrir le yin pour eteindre le feu',
      'clarifier le feu du vide', 'clarifier feu vide',
      'traiter le feu du vide', 'nourrir le yin pour clarifier',
    ],
    regles: ['R3'],
    priorite: 1,
  },
  {
    id: 'traiter_yin_apparent',
    label: 'Traiter le Yin apparent / Froid apparent (vide de Yang)',
    categorie: 'strategie',
    patterns: [
      'yin apparent', 'froid apparent', 'froid par vide de yang',
      'yin apparent par vide de yang', 'froid apparent par vide de yang',
      'traiter le yin apparent', 'traiter le froid apparent',
      'tonifier le yang pour chasser le froid', 'rechauffer le yang',
    ],
    regles: ['R2'],
    priorite: 1,
  },
  {
    id: 'disperser_fong',
    label: 'Disperser / Expulser le Fong interne',
    categorie: 'strategie',
    patterns: [
      'disperser le fong', 'expulser le fong', 'chasser le fong',
      'faire sortir le fong', 'fong disperser', 'fong interne',
      'disperser les fong', 'expulser les fong', 'chasser les fong',
      'faire sortir les fong', 'disperser les fongs', 'expulser les fongs',
      'disperser le vent', 'expulser le vent', 'chasser le vent',
      'faire sortir le vent',
      'disperser le vent interne', 'expulser le vent interne',
      'chasser le vent interne', 'faire sortir le vent interne',
      'pacifier le vent interne', 'calmer le vent interne',
    ],
    regles: ['R4'],
    priorite: 2,
  },
  {
    id: 'disperser_foyer_moyen',
    label: 'Disperser le Foyer Moyen (excès de Yin)',
    categorie: 'strategie',
    patterns: [
      'disperser le foyer moyen', 'lever l exces de yin au foyer moyen',
      'lever l exces yin foyer moyen', 'disperser la plenitude du foyer moyen',
      'vider le foyer moyen', 'abaisser le foyer moyen',
      'faire circuler le foyer moyen', 'debloquer le foyer moyen',
      'faire circuler le rechauffeur moyen', 'debloquer le rechauffeur moyen',
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
      'nourrir le foyer inferieur', 'faire circuler le foyer inferieur',
      'debloquer le foyer inferieur', 'nourrir le rechauffeur inferieur',
    ],
    regles: ['R2'],
    priorite: 1,
  },
  {
    id: 'tonifier_foyer_superieur',
    label: 'Tonifier / Soutenir le Foyer Supérieur',
    categorie: 'strategie',
    patterns: [
      'tonifier le foyer superieur', 'soutenir le foyer superieur',
      'nourrir le foyer superieur', 'renforcer le foyer superieur',
      'faire circuler le foyer superieur', 'debloquer le foyer superieur',
      'tonification foyer superieur', 'nourrir le rechauffeur superieur',
    ],
    priorite: 1,
  },
  {
    id: 'relancer_cycle_tcheng',
    label: 'Relancer le cycle Tcheng Eau → Bois',
    categorie: 'strategie',
    patterns: [
      'relancer le cycle cheng', 'relancer le cycle sheng',
      'nourrir l eau pour relancer le bois',
      'relancer cycle cheng', 'relancer cycle sheng',
      'relancer cheng eau bois', 'relancer sheng eau bois',
      'nourrir eau pour bois', 'relancer l eau et le bois',
      'debloquer le bois', 'faire circuler le bois',
      'debloquer eau bois', 'relancer l eau vers le bois',
    ],
    regles: ['R4'],
    priorite: 1,
  },
  {
    id: 'relancer_cycle_tcheng_bois_feu',
    label: 'Relancer le cycle Tcheng Bois → Feu',
    categorie: 'strategie',
    patterns: [
      'relancer cycle cheng bois feu', 'relancer cycle sheng bois feu',
      'relancer bois feu', 'nourrir le bois pour le feu',
      'soutenir le bois pour le coeur', 'relancer bois vers feu',
      'debloquer le feu', 'faire circuler le feu',
      'debloquer bois feu', 'foie nourrit coeur',
    ],
    priorite: 1,
  },
  {
    id: 'relancer_cycle_tcheng_feu_terre',
    label: 'Relancer le cycle Tcheng Feu → Terre',
    categorie: 'strategie',
    patterns: [
      'relancer cycle cheng feu terre', 'relancer cycle sheng feu terre',
      'relancer feu terre', 'nourrir le feu pour la terre',
      'soutenir le coeur pour la rate', 'relancer feu vers terre',
      'debloquer la terre par le feu', 'faire circuler feu terre',
      'coeur nourrit rate',
    ],
    priorite: 1,
  },
  {
    id: 'debloquer_cycles_tcheng',
    label: 'Débloquer les cycles Tcheng (global)',
    categorie: 'strategie',
    patterns: [
      'debloquer les cycles cheng', 'debloquer les cycles sheng',
      'cycle d engendrement', 'cycle nourricier',
      'relancer le cycle nourricier', 'debloquer le cycle nourricier',
      'faire circuler le cycle cheng', 'harmoniser les cycles cheng',
      'debloquer le cycle d engendrement',
    ],
    priorite: 1,
  },
  {
    id: 'traiter_ko_pathologique',
    label: 'Traiter un cycle Ko pathologique (attaque)',
    categorie: 'strategie',
    patterns: [
      'ko pathologique', 'cycle ko pathologique', 'attaque par le cycle ko',
      'disperser l element agresseur', 'soutenir l element attaque',
      'bois attaque terre', 'eau attaque feu', 'feu attaque metal',
      'metal attaque bois', 'terre attaque eau',
      'traiter le cycle ko pathologique',
    ],
    priorite: 1,
  },
  {
    id: 'corriger_cycle_rae',
    label: 'Corriger un cycle Raé (Ko inversé / Rébellion)',
    categorie: 'strategie',
    patterns: [
      'cycle rae', 'rae', 'ko inverse', 'rebellion du cycle ko',
      'cycle ko inverse', 'element rebelle', 'rébellion element',
      'corriger le cycle rae', 'traiter le cycle rae',
      'contre-attaque cycle ko',
    ],
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
      'assecher l humidite', 'transformer l humidite',
      'chasser l humidite', 'resoudre l humidite',
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
      'ouvrir le meridien', 'deverrouiller le meridien',
      'faire circuler dans le meridien', 'restaurer le meridien',
      'repermeabiliser le meridien',
    ],
    priorite: 2,
  },
  {
    id: 'pacifier_chen',
    label: 'Pacifier le Chen (Cœur)',
    categorie: 'strategie',
    patterns: [
      'pacifier le shen', 'calmer le shen', 'shen pacifie',
      'apaiser le coeur', 'calmer le coeur', 'soutenir le coeur',
      'ancrer le shen', 'stabiliser le shen', 'apaiser le shen',
      'rasseoir le shen', 'shen a pacifier', 'shen a calmer',
    ],
    priorite: 2,
  },
  {
    id: 'tonifier_iong',
    label: 'Tonifier l\'Iong',
    categorie: 'strategie',
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
      'nourrir le xue', 'renforcer le sang', 'reconstituer le sang',
      'sang a nourrir', 'sang insuffisant a tonifier',
    ],
    priorite: 1,
  },
  {
    id: 'calmer_bois',
    label: 'Calmer le Bois (Foie/VB en excès)',
    categorie: 'strategie',
    patterns: [
      'calmer le bois', 'calmer le foie', 'disperser le bois',
      'apaiser le bois', 'drainer le foie', 'apaiser le foie',
      'foie a calmer', 'bois en exces a calmer',
      'ramener le foie', 'reduire l exces de bois',
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
      'renforcer la terre', 'terre a consolider',
      'soutenir la terre', 'la terre a besoin de soutien',
    ],
    regles: ['R7'],
    priorite: 2,
  },
  {
    id: 'traitement_local',
    label: 'Traitement local (dernier temps)',
    categorie: 'strategie',
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

  // ─── Strategies cycles Tcheng supplémentaires ────────────────────────────────
  {
    id: 'relancer_cycle_tcheng_terre_metal',
    label: 'Relancer le cycle Tcheng Terre → Métal',
    categorie: 'strategie',
    patterns: [
      'relancer cycle cheng terre metal', 'relancer cycle sheng terre metal',
      'relancer terre metal',
      'soutenir rate pour poumon', 'nourrir la rate pour le poumon',
      'relancer cheng terre vers metal', 'relancer sheng terre vers metal',
      'consolider la terre pour le metal',
      'debloquer le metal par la terre', 'faire circuler terre metal',
      'rate nourrit poumon',
    ],
    priorite: 1,
  },
  {
    id: 'relancer_cycle_tcheng_metal_eau',
    label: 'Relancer le cycle Tcheng Métal → Eau',
    categorie: 'strategie',
    patterns: [
      'relancer cycle cheng metal eau', 'relancer cycle sheng metal eau',
      'relancer metal eau',
      'soutenir poumon pour rein', 'nourrir le poumon pour le rein',
      'relancer cheng metal vers eau', 'relancer sheng metal vers eau',
      'consolider le metal pour l eau',
      'debloquer l eau par le metal', 'faire circuler metal eau',
      'poumon nourrit rein',
    ],
    priorite: 1,
  },

  // ─── Nouvelles stratégies IEATC ──────────────────────────────────────────────
  {
    id: 'consolider_yang_ming',
    label: 'Traiter le Yang Ming / Grand Yang Ming (E / GI)',
    categorie: 'strategie',
    patterns: [
      'consolider le yang ming', 'soutenir le yang ming',
      'tonifier le yang ming', 'yang ming', 'grand yang ming',
      'technique yang ming', 'travailler sur le yang ming',
      'traiter le yang ming', 'niveau yang ming',
      'debloquer le yang ming', 'liberer le yang ming',
    ],
    priorite: 1,
  },
  {
    id: 'harmoniser_foie_rate',
    label: 'Harmoniser Foie / Rate (Bois-Terre)',
    categorie: 'strategie',
    patterns: [
      'harmoniser le foie et la rate', 'harmoniser foie rate',
      'calmer le foie soutenir la rate', 'bois terre harmonisation',
      'harmoniser bois terre', 'lever l agression foie rate',
      'foie rate dysharmonie', 'dysharmonie foie rate',
      'harmoniser le bois et la terre',
    ],
    regles: ['R7'],
    priorite: 1,
  },
  {
    id: 'nourrir_yin_foie',
    label: 'Nourrir le Yin du Foie',
    categorie: 'strategie',
    patterns: [
      'nourrir le yin du foie', 'nourrir yin foie',
      'tonifier le yin du foie', 'soutenir le yin du foie',
      'yin du foie tonifie', 'nourrir le foie yin',
      'yin foie', 'nourrir le bois yin',
    ],
    priorite: 1,
  },
  {
    id: 'sudation',
    label: 'Méthode sudation (Han Fa)',
    categorie: 'strategie',
    patterns: [
      'sudation', 'han fa', 'methode sudation',
      'provoquer la sudation', 'ouvrir les pores',
      'expulser par la sudation', 'faire transpirer',
      'traitement par sudation',
    ],
    priorite: 2,
  },
  {
    id: 'purgation',
    label: 'Méthode purgation (Xia Fa)',
    categorie: 'strategie',
    patterns: [
      'purgation', 'xia fa', 'methode purgation',
      'purger', 'evacuer par le bas', 'traitement par purgation',
      'purger les intestins',
    ],
    priorite: 2,
  },

  // ─── Stratégies Six Énergies (niveaux énergétiques IEATC) ────────────────────
  {
    id: 'traiter_tae_yang',
    label: 'Traiter le niveau Taé Yang (V / IG)',
    categorie: 'strategie',
    patterns: [
      'tae yang', 'tai yang', 'niveau tae yang', 'niveau tai yang',
      'traiter le tae yang', 'traiter le tai yang',
      'soutenir le tae yang', 'soutenir le tai yang',
      'debloquer le tae yang', 'debloquer le tai yang',
      'liberer le tae yang', 'liberer le tai yang',
      'travailler sur le tae yang', 'travailler sur le tai yang',
      'tonifier le tae yang', 'tonifier le tai yang',
    ],
    priorite: 1,
  },
  {
    id: 'traiter_chao_yang',
    label: 'Traiter le niveau Chao Yang (VB / TR)',
    categorie: 'strategie',
    patterns: [
      'chao yang', 'shao yang', 'niveau chao yang', 'niveau shao yang',
      'traiter le chao yang', 'traiter le shao yang',
      'soutenir le chao yang', 'soutenir le shao yang',
      'debloquer le chao yang', 'debloquer le shao yang',
      'liberer le chao yang', 'liberer le shao yang',
      'travailler sur le chao yang', 'travailler sur le shao yang',
      'harmoniser le chao yang', 'harmoniser le shao yang',
      'tonifier le chao yang', 'tonifier le shao yang',
    ],
    priorite: 1,
  },
  {
    id: 'traiter_tae_yin',
    label: 'Traiter le niveau Taé Yin (P / Rt)',
    categorie: 'strategie',
    patterns: [
      'tae yin', 'tai yin', 'niveau tae yin', 'niveau tai yin',
      'traiter le tae yin', 'traiter le tai yin',
      'soutenir le tae yin', 'soutenir le tai yin',
      'tonifier le tae yin', 'tonifier le tai yin',
      'debloquer le tae yin', 'debloquer le tai yin',
      'travailler sur le tae yin', 'travailler sur le tai yin',
      'nourrir le tae yin', 'nourrir le tai yin',
    ],
    priorite: 1,
  },
  {
    id: 'traiter_chao_yin',
    label: 'Traiter le niveau Chao Yin (C / R)',
    categorie: 'strategie',
    patterns: [
      'chao yin', 'shao yin', 'niveau chao yin', 'niveau shao yin',
      'traiter le chao yin', 'traiter le shao yin',
      'soutenir le chao yin', 'soutenir le shao yin',
      'tonifier le chao yin', 'tonifier le shao yin',
      'debloquer le chao yin', 'debloquer le shao yin',
      'travailler sur le chao yin', 'travailler sur le shao yin',
      'nourrir le chao yin', 'nourrir le shao yin',
      'axe coeur rein chao yin', 'axe coeur rein shao yin',
    ],
    priorite: 1,
  },
  {
    id: 'traiter_jue_yin',
    label: 'Traiter le niveau Tsiué Yin (F / MC)',
    categorie: 'strategie',
    patterns: [
      'tsieu yin', 'tsiue yin', 'niveau tsieu yin', 'niveau tsiue yin',
      'jue yin', 'tjue yin', 'niveau jue yin', 'niveau tjue yin',
      'traiter le tsieu yin', 'traiter le tsiue yin',
      'traiter le jue yin', 'traiter le tjue yin',
      'soutenir le tsieu yin', 'soutenir le tsiue yin',
      'soutenir le jue yin', 'soutenir le tjue yin',
      'tonifier le tsieu yin', 'tonifier le tsiue yin',
      'tonifier le jue yin', 'tonifier le tjue yin',
      'debloquer le tsieu yin', 'debloquer le tsiue yin',
      'debloquer le jue yin', 'debloquer le tjue yin',
      'nourrir le tsieu yin', 'nourrir le tsiue yin',
      'nourrir le jue yin', 'nourrir le tjue yin',
      'travailler sur le tsieu yin', 'travailler sur le tsiue yin',
      'travailler sur le jue yin', 'travailler sur le tjue yin',
      'axe foie maitre coeur tsieu yin',
    ],
    priorite: 1,
  },

  // ─── Stratégies complémentaires fondamentales ────────────────────────────
  {
    id: 'faire_circuler_qi',
    label: 'Faire circuler le Qi (débloquer)',
    categorie: 'strategie',
    patterns: [
      'faire circuler le qi', 'relancer la circulation du qi',
      'relancer le qi', 'debloquer le qi', 'mobiliser le qi',
      'faire circuler l energie', 'relancer l energie',
      'remettre le qi en mouvement', 'liberer le qi',
    ],
    priorite: 2,
  },
  {
    id: 'disperser_chaleur',
    label: 'Disperser / Clarifier la Chaleur réelle',
    categorie: 'strategie',
    patterns: [
      'disperser la chaleur', 'clarifier la chaleur',
      'evacuer la chaleur', 'rafraichir la chaleur',
      'purger la chaleur', 'eteindre le feu',
      'chaleur a disperser', 'drainer la chaleur',
    ],
    regles: ['R3'],
    priorite: 2,
  },
  {
    id: 'faire_descendre_qi',
    label: 'Faire descendre le Qi (rébellion)',
    categorie: 'strategie',
    patterns: [
      'faire descendre le qi', 'abaisser le qi',
      'ramener le qi vers le bas', 'le qi doit redescendre',
      'abaisser le qi de l estomac', 'faire descendre qi estomac',
      'faire descendre qi poumon',
    ],
    priorite: 2,
  },
  {
    id: 'ancrer_yang',
    label: 'Ancrer le Yang (nourrir le Yin pour stabiliser)',
    categorie: 'strategie',
    patterns: [
      'ancrer le yang', 'yang a ancrer', 'le yang doit etre ancre',
      'ramener le yang vers le bas', 'stabiliser le yang',
      'enraciner le yang', 'yang a enraciner',
      'reenraciner le yang', 'yang flottant a ancrer',
    ],
    regles: ['R3', 'R4'],
    priorite: 1,
  },
  {
    id: 'faire_circuler_sang',
    label: 'Faire circuler le Sang / Disperser les stases',
    categorie: 'strategie',
    patterns: [
      'faire circuler le sang', 'activer le sang', 'mobiliser le sang',
      'disperser les stases', 'lever les stases', 'lever les stases sanguines',
      'disperser stases sanguines', 'dissoudre les stases',
      'traiter la stase sanguine', 'sang a faire circuler',
    ],
    priorite: 2,
  },
  {
    id: 'nourrir_sang_foie',
    label: 'Nourrir le Sang du Foie',
    categorie: 'strategie',
    patterns: [
      'nourrir le sang du foie', 'nourrir sang foie',
      'tonifier le sang du foie', 'soutenir le sang du foie',
      'nourrir le foie en sang', 'sang du foie a nourrir',
      'renourrir le foie', 'alimenter le foie en sang',
    ],
    priorite: 1,
  },
  {
    id: 'monter_yang_rate',
    label: 'Monter le Yang de la Rate (relever le Qi)',
    categorie: 'strategie',
    patterns: [
      'monter le yang de la rate', 'relever le qi de la rate',
      'relever le qi', 'faire monter le qi de la rate',
      'soutenir l ascension du qi pur', 'relever le qi pur',
      'monter le qi de la rate', 'ascending qi rate',
    ],
    priorite: 1,
  },
  {
    id: 'reconnecter_coeur_rein',
    label: 'Reconnecter l\'axe Cœur–Rein (Eau-Feu)',
    categorie: 'strategie',
    patterns: [
      'reconnecter coeur rein', 'reconnecter l axe coeur rein',
      'retablir l axe eau feu', 'retablir l axe coeur rein',
      'reconnecter eau et feu', 'faire communiquer coeur et rein',
      'harmoniser coeur et rein', 'harmoniser l axe eau feu',
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
  // Étape 1 : normalisation de base (minuscules, sans accents)
  const nBase = normaliserTexteIeatc(texte);
  // Étape 2 : enrichissement sémantique (ajoute les formes canoniques correspondant
  //           aux reformulations naturelles du praticien)
  const n = enrichirTexteIeatc(nBase);

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
 * Retourne les règles cliniques associées à un concept (ex : ['R3', 'R4']).
 */
export function reglesConceptIeatc(id: string): string[] {
  return TOUS_CONCEPTS.find((c) => c.id === id)?.regles ?? [];
}

// ═══════════════════════════════════════════════════════════════════════════════
// NORMALISATION DES TECHNIQUES
//
// En MTC/IEATC, une technique peut être composite : "tonification chauffée"
// EST une tonification (avec chaleur). "dispersion puis tonification" compte
// pour les DEUX familles. Les stats doivent refléter l'action thérapeutique
// de fond, pas uniquement la modalité de mise en œuvre.
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Décompose une technique en ses composantes de base pour les statistiques.
 *
 * Exemples :
 *   'tonification_chauffee'         → ['tonification_chauffee', 'tonification']
 *   'moxa_tonification'             → ['moxa_tonification', 'tonification']
 *   'moxa_dispersion'               → ['moxa_dispersion', 'dispersion']
 *   'dispersion_puis_tonification'  → ['dispersion_puis_tonification'] (acte propre)
 *   'moxa'                          → ['moxa'] (sans aiguille, stat propre)
 *   autres                          → [technique] (inchangé)
 */
export function normaliserTechnique(technique: string): string[] {
  switch (technique) {
    case 'tonification_chauffee':        return ['tonification_chauffee', 'tonification'];
    case 'moxa_tonification':            return ['moxa_tonification', 'tonification'];
    case 'moxa_dispersion':              return ['moxa_dispersion', 'dispersion'];
    case 'dispersion_chauffee':          return ['dispersion_chauffee', 'dispersion'];
    case 'dispersion_puis_tonification': return ['dispersion_puis_tonification'];
    default: return [technique];
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYSE DES CHAÎNES CAUSALES
//
// Un bilan clinique contient souvent une structure "Effet [marqueur] Cause" :
//   "Yang apparent de VB par vide de Yin du Foie"
//   → effet   : "yang apparent de vb"
//   → marqueur: "par vide de"
//   → cause   : "yin du foie"
//
// Cette structure est CLINIQUEMENT essentielle : le même symptôme (Yang apparent
// de VB) avec une cause différente (blocage Foie vs. vide Yin Foie) implique
// un traitement radicalement différent.
//
// Le parser détecte toutes les formulations naturelles :
//   "par / dû à / à cause de / secondaire à / sur fond de / consécutif à..."
// ═══════════════════════════════════════════════════════════════════════════════

export interface ChaineCausale {
  texteOriginal: string;
  effet: string;           // texte normalisé avant le marqueur
  cause: string;           // texte normalisé après le marqueur
  marqueur: string;        // marqueur causal détecté
  conceptsEffet: {         // concepts extraits de l'effet séparément
    familles: string[];
    syndromes: string[];
    organes: string[];
    strategies: string[];
    pathologies: string[];
  };
  conceptsCause: {         // concepts extraits de la cause séparément
    familles: string[];
    syndromes: string[];
    organes: string[];
    strategies: string[];
    pathologies: string[];
  };
}

/**
 * Marqueurs causaux ordonnés du plus long/spécifique au plus court/général.
 * Cet ordre est CRITIQUE pour éviter les faux positifs :
 * "par vide de" doit être testé avant "par".
 * Tous écrits en forme normalisée (sans accents, minuscules).
 */
const MARQUEURS_CAUSALITE: string[] = [
  // ── Forme "secondaire à" ──────────────────────────────────────────────────
  'secondaire a un vide de',
  'secondaire a un blocage de',
  'secondaire a un',
  'secondaire a',
  // ── Forme "sur fond de" ───────────────────────────────────────────────────
  'sur fond de vide de',
  'sur fond de',
  // ── Forme "à cause de" ───────────────────────────────────────────────────
  'a cause d un vide de',
  'a cause d un blocage de',
  'a cause d un',
  'a cause de',
  // ── Forme "en raison de" ──────────────────────────────────────────────────
  'en raison d un vide de',
  'en raison d un blocage de',
  'en raison d un',
  'en raison de',
  // ── Forme "consécutif à" ──────────────────────────────────────────────────
  'consecutif a un vide de',
  'consecutif a un',
  'consecutif a',
  // ── Forme "dû à" ─────────────────────────────────────────────────────────
  'du a un vide de',
  'du a un blocage de',
  'du a un',
  'du a',
  'du au vide de',
  'du au blocage de',
  'du au',
  // ── Forme "engendré / généré / provoqué par" ──────────────────────────────
  'engendre par un vide de',
  'engendre par un blocage de',
  'engendre par',
  'genere par un vide de',
  'genere par',
  'provoque par un vide de',
  'provoque par',
  // ── Forme "par" (la plus fréquente, la plus ambiguë — en dernier) ─────────
  'par vide de',
  'par blocage de',
  'par manque de',
  'par insuffisance de',
  'par deficience de',
  'par exces de',
  'par stagnation de',
  'par',
];

/**
 * Détecte et parse une chaîne causale dans un texte libre.
 * Retourne null si aucun marqueur causal n'est trouvé, ou si l'effet
 * ou la cause est vide après parsing.
 *
 * Exemples reconnus :
 *   "Yang apparent de VB par vide de Yin du Foie"
 *   "Yang flottant de VB dû à un blocage du Foie"
 *   "Yang de VB qui monte secondaire à un vide de Yin du Rein"
 *   "Faux yang de VB à cause d'un Foie bloqué"
 */
export function extraireChaineCausale(texte: string): ChaineCausale | null {
  const n = normaliserTexteIeatc(texte);
  for (const marqueur of MARQUEURS_CAUSALITE) {
    const needle = ` ${marqueur} `;
    const idx = n.indexOf(needle);
    if (idx === -1) continue;
    const effet = n.slice(0, idx).trim();
    const cause = n.slice(idx + needle.length).trim();
    if (!effet || !cause) continue;
    return {
      texteOriginal: texte,
      effet,
      cause,
      marqueur,
      conceptsEffet: extraireConceptsIeatc(effet),
      conceptsCause: extraireConceptsIeatc(cause),
    };
  }
  return null;
}

/**
 * Extrait toutes les chaînes causales d'un ensemble de textes.
 * Un texte sans marqueur causal est simplement ignoré.
 */
export function extraireChaines(textes: string[]): ChaineCausale[] {
  const chains: ChaineCausale[] = [];
  for (const t of textes) {
    if (!t) continue;
    const c = extraireChaineCausale(t);
    if (c) chains.push(c);
  }
  return chains;
}

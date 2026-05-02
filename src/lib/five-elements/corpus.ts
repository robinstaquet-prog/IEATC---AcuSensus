// ─── Corpus IEATC — Couche clinique IA ───────────────────────────────────────
// Données cliniques extraites et structurées à partir des polycopiés IEATC.
// Sources : ZANG_FU/, THEORIE/, CLINIQUE/, _SYSTEME/ du corpus IEATC.

// ─── Philosophie de lecture clinique IEATC ───────────────────────────────────

export const PHILOSOPHIE_CLINIQUE = `
PHILOSOPHIE DE LECTURE CLINIQUE IEATC (Institut d'Enseignement de l'Acupuncture de Tradition Chinoise, Lausanne)

═══ HIÉRARCHIE DE LECTURE (toujours respecter cet ordre) ═══
1. Polarité Yin/Yang — question fondamentale, JAMAIS secondaire
   → Avant tout diagnostic : le patient est-il en état Yin ou Yang ?
2. Localisation en Foyers (Supérieur/Moyen/Inférieur) si pertinent
3. Grille de lecture secondaire (5 Éléments, Zang/Fu, Méridiens, etc.)

RÈGLE D'OR : Le pouls CONFIRME ou infirme — il n'INITIE pas.
Le pouls est le dernier vérificateur, pas le premier orienteur.

═══ NIVEAUX DE RÉALITÉ DU PATIENT ═══
• Niveau 1 : Corps physique (symptômes organiques, douleurs, localisation)
• Niveau 2 : Énergies (Qi, Yin, Yang, Sang, Jing, Liquides organiques)
• Niveau 3 : Émotions (les 7 émotions comme causes internes)
• Niveau 4 : Esprit (Shen, Hun, Po, Yi, Zhi — les 5 Shen psychiques)
• Niveau 5 : Ciel antérieur (constitution, hérédité, karma)

═══ INDICATEURS DE GRILLE ═══
Quel signe oriente vers quelle grille de lecture :
• Douleur migratrice, irrégulière, aggravée par vent → Vent, Méridiens, Bois
• Douleur fixe, froide, aggravée par le froid → Froid, Sang stagnant
• Chaleur, soif, constipation, agitation → Chaleur, Yang excès
• Fatigue profonde, frilosité chronique, urines claires → Vide Yang, Eau-Rein
• Gonflement, lourdeur, mucosités, enduit gras → Humidité, Terre
• Douleur pressive, plénitude, symptômes variables selon émotions → Stagnation Qi
• Palpitations, insomnie, agitation mentale → Cœur, Feu
• Aménorrhée, ongles fragiles, vision trouble → Vide Sang, Foie-Bois
• Toux sèche, peau sèche, tristesse → Sécheresse, Métal, Poumon
• Alternance chaud/froid, symptômes multiples niveaux → Shaoyang, Triple Foyer

═══ CORRESPONDANCES ÉMOTION-ORGANE ═══
• Peur, anxiété profonde, manque de confiance → Rein (Eau) — ZHI épuisé
• Colère, frustration, impatience, irritabilité → Foie (Bois) — HUN entravé
• Joie excessive, agitation, rires incontrôlés → Cœur (Feu) — SHEN perturbé
• Soucis, rumination, pensée circulaire → Rate (Terre) — YI bloqué
• Tristesse, deuil, nostalgie, mélancolie → Poumon (Métal) — PO affaibli
Note Ko : chaque émotion est tempérée par l'émotion de l'élément qui la contrôle

═══ LOIS MÈRE-FILS (Wu Xing) ═══
Cycle Tcheng (génération) : Bois → Feu → Terre → Métal → Eau → Bois
Cycle Ko (contrôle) : Bois contrôle Terre | Terre contrôle Eau | Eau contrôle Feu | Feu contrôle Métal | Métal contrôle Bois
Cycle Rao (Ko inversé, pathologique) : grave — élément attaqué résiste et contre-attaque

Règle de traitement cycle Ko : NE PAS attaquer l'émotion en excès directement.
→ Tonifier l'élément dominateur (celui qui doit contrôler l'excès)

═══ POINTS PENN (5 Shu) — LOGIQUE IEATC ═══
Bois-Ting : issues/entrées (points d'urgence, premiers secours)
Feu-Iong : chaleur/joie (équilibre thermique, traitement froid → chaleur)
Terre-Iu : humidité/nutrition (tonification/dispersion profonde, point mère/fils)
Métal-King : rigueur/fermeté (régulation tissulaire, passage entre états)
Eau-Ro : profondeur/froid (traitement chaleur profonde, points d'approfondissement)

Tonification : utiliser le point MÈRE (point de l'élément qui engendre l'élément déficient)
Dispersion : utiliser le point FILS (point de l'élément que l'élément excédentaire engendre)

═══ POINTS DE COMMANDEMENT FONDAMENTAUX ═══
9P = Maître des artères et de toute énergie sanguine
17V = Maître du Sang (Shu dos diaphragme)
12RM = Maître des viscères Yin (Mu Foyer Moyen)
34VB = Maître des muscles, tendons, ligaments
4VG (Ming Men) = Feu ancestral, jamais dispersé, toujours moxa si besoin

═══ AXES YIN/YANG DES PENN ═══
• Yang du Yang (FS) : 8C — traitement Feu Cœur, joie, chaleur supérieure
• Yin du Yang (FS) : 8P — traitement Métal-Poumon, yin du FS
• Yang du Yin (FI) : 1F — régénère muscles/tendons, Yang du FI
• Yin du Yin (FI) : 10R — nourrit Yin profond du Rein
• FM (Yang) : 36E — maître de tout Yang, tonification générale
• FM (Yin) : 3RP — maître de tout Yin, tonification Yin générale
`;

// ─── Interface SyndromeClinique ───────────────────────────────────────────────

export interface SyndromeClinique {
  id: string;
  nom: string;
  element?: string;
  organe?: string;
  polarite: 'yin' | 'yang' | 'mixte';
  foyer?: 'superieur' | 'moyen' | 'inferieur' | 'multiple';
  nature: 'vide' | 'plein' | 'vide-plein' | 'complexe';
  signesCertains: string[];
  signesProbables: string[];
  signesAccessoires?: string[];
  pouls: string;
  langue: string;
  terrainEmotionnel?: string;
  terrainConstitutionnel?: string;
  pathogenie?: string;
  pointsFondamentaux: Array<{
    code: string;
    technique: 'T' | 'D' | 'N' | 'M' | 'MT' | 'MD';
    action: string;
    justificationIeatc?: string;
  }>;
  distinctions: Array<{
    avec: string;
    difference: string;
  }>;
  koVigilance?: string;
  progressionPossible?: string;
  remarqueIeatc?: string;
}

// ─── SYNDROMES REIN (Eau — FI) ────────────────────────────────────────────────

const SYNDROMES_REIN: SyndromeClinique[] = [
  {
    id: 'vide_yang_rein',
    nom: 'Vide de Yang du Rein',
    element: 'Eau', organe: 'Rein', polarite: 'yin', foyer: 'inferieur', nature: 'vide',
    signesCertains: [
      'Frilosité profonde, froid aux lombes et aux genoux',
      'Lombalgie chronique froide, améliorée par chaleur et pression',
      'Urines claires, abondantes, nycturie fréquente',
      'Fatigue matinale profonde — le Yang ne monte pas',
    ],
    signesProbables: [
      'Impuissance ou frigidité, diminution de la libido',
      'Diarrhées matinales à l\'aube (5h, "cock-crow diarrhea")',
      'Oedèmes déclives vespéraux',
      'Visage terne, teint grisâtre ou noirâtre',
      'Peur chronique, manque de confiance en soi',
    ],
    signesAccessoires: [
      'Poils pubiens rares', 'Spermatorrhée', 'Infertilité', 'Cheveux fragiles et ternes',
    ],
    pouls: 'Profond (Chen), vide (Xu), lent (Chi) — proximal gauche Rein Yang particulièrement vide. Parfois filiforme.',
    langue: 'Corps pâle, gonflé, avec empreintes dentaires possibles. Enduit blanc humide ou absent.',
    terrainEmotionnel: 'ZHI (Volonté/Rein) épuisé. Peur existentielle profonde, manque de vouloir-vivre, difficulté à aller de l\'avant.',
    terrainConstitutionnel: 'Épuisement du Feu du Ming Men. Constitution fragilisée par excès sexuels, surmeneage prolongé, chirurgie, peur traumatique.',
    pathogenie: 'Le Yang du Rein est le Feu du Ming Men (4VG) — source de tout Yang corporel. Son déclin entraîne un refroidissement systémique. Le Rein Yang chauffe le Foyer Moyen (digestion matinale déficiente) et assure la transformation des fluides (urines claires abondantes).',
    pointsFondamentaux: [
      { code: '4VG', technique: 'M', action: 'Ming Men — Feu ancestral. Réchauffe le Yang fondamental.', justificationIeatc: 'Ne jamais disperser — toujours moxa. C\'est la porte de la vie.' },
      { code: '23V', technique: 'MT', action: 'Shu dos Rein. Tonifie directement le Yang du Rein.', justificationIeatc: 'Shu dos = accès direct à l\'organe.' },
      { code: '4RM', technique: 'MT', action: 'Guan Yuan — Mer du Qi. Tonifie Yuan Qi, renforce racine Yang.', justificationIeatc: 'Point fondamental du Foyer Inférieur.' },
      { code: '7R', technique: 'T', action: 'Fu Liu — King Rein (Métal). Tonifie Yang du Rein, régule urines.', justificationIeatc: 'Point Métal du Rein : métal retient l\'eau.' },
      { code: '6RM', technique: 'M', action: 'Qi Hai — Mer du Qi. Renforce Yuan Qi du FI.', justificationIeatc: 'Moxa pour réchauffer le FI.' },
    ],
    distinctions: [
      { avec: 'Vide Yin Rein', difference: 'Yin = chaleurs dans 5 centres, sueurs nocturnes, langue rouge et sèche, pouls rapide. Yang = froid, langue pâle, pouls lent — opposé thermique complet.' },
      { avec: 'Vide Yang Rate', difference: 'Rate : selles molles après repas, digestion principale, muscles flasques. Rein Yang : lombalgie froide, urines claires, diarrhée matinale 5h.' },
      { avec: 'Froid bi douloureux', difference: 'Bi = douleur articulaire mobile ou fixe, aggravée par froid externe, mais pas de syndrome Rein Yang global.' },
    ],
    koVigilance: 'Vide Yang Rein → eau ne chauffe plus → Foyer Moyen se refroidit → diarrhée matinale (Rate-Estomac non réchauffés). Ko : eau contrôlait feu → si eau trop froide, plus de contrôle du Cœur.',
    progressionPossible: 'Évolution vers Vide Yang Rate associé. Stade avancé : vide Yang des cinq organes.',
    remarqueIeatc: 'Le Rein droit (Yang) = glandes surrénales/sexuelles. La tonification de 4VG (Ming Men) est l\'acte thérapeutique le plus puissant en cas de vide profond.',
  },
  {
    id: 'vide_yin_rein',
    nom: 'Vide de Yin du Rein',
    element: 'Eau', organe: 'Rein', polarite: 'yin', foyer: 'inferieur', nature: 'vide',
    signesCertains: [
      'Chaleurs dans les cinq centres (paumes, plantes, thorax) — surtout vespérales',
      'Sueurs nocturnes — transpirations qui arrêtent au réveil',
      'Lombalgie chronique sourde, diffuse, sans aggravation par froid',
      'Vertiges et acouphènes (sifflement aigu et constant)',
    ],
    signesProbables: [
      'Sécheresse buccale et pharyngée, surtout nocturne',
      'Insomnie légère, endormissement difficile, rêves nombreux',
      'Fatigue avec agitation interne paradoxale',
      'Légère anxiété ou irritabilité sans cause apparente',
    ],
    signesAccessoires: [
      'Spermatorrhée ou éjaculation précoce', 'Aménorrhée ou oligoménorrhée',
      'Cheveux secs et cassants', 'Ongles fragiles',
      'Perte de mémoire', 'Diminution acuité auditive',
    ],
    pouls: 'Vide (Xu), fin (Xi) et rapide (Shuo) — proximal gauche (Rein Yin) particulièrement vide. Parfois filiforme.',
    langue: 'Corps rouge, sec. Enduit très mince ou absent (langue "pelée"). Fissures possibles.',
    terrainEmotionnel: 'ZHI épuisé par épuisement profond. Peur de l\'avenir, anxiété sourde. Le Jing s\'épuise.',
    terrainConstitutionnel: 'Vide Yin = épuisement des substances fondamentales (Jing, Sang-Yin). Causes : surmenage chronique, activité sexuelle excessive, maladies prolongées fébriles, vieillissement.',
    pathogenie: 'Le Rein gauche (Yin) filtre le plasma sanguin et contrôle le squelette/articulations. Son vide entraîne une montée de chaleur vide (chaleur sans substance Yang en excès). Eau ne contrôle plus Feu → Feu monte.',
    pointsFondamentaux: [
      { code: '3R', technique: 'T', action: 'Tai Xi — Yuan Rein, point Terre. Nourrit Yin et Yang du Rein.', justificationIeatc: 'Point source = accès au Jing. Penn Terre du Rein = point de nutrition.' },
      { code: '6R', technique: 'T', action: 'Zhao Hai — point ouverture Yin Qiao Mai. Nourrit Yin profond, calme esprit.', justificationIeatc: 'Grand point nourrissage Yin = humidifie tout l\'organisme.' },
      { code: '23V', technique: 'T', action: 'Shu dos Rein. Nourrit le Jing du Rein.', justificationIeatc: 'Accès direct à l\'organe.' },
      { code: '7C', technique: 'T', action: 'Shen Men — Yuan Cœur. Nourrit Yin Cœur, calme Shen.', justificationIeatc: 'Eau-Feu en harmonie : nourrir Yin Rein ET calmer Feu Cœur.' },
      { code: '10R', technique: 'T', action: 'Yin Gu — Ro (Eau) du Rein. Yin du Yin profond.', justificationIeatc: 'Penn Eau du Rein = point le plus nourrissant du Yin du Rein.' },
    ],
    distinctions: [
      { avec: 'Vide Yang Rein', difference: 'Yang = froid, pâleur, pouls lent. Yin = chaleurs vespérales, sueurs nocturnes, langue rouge sèche, pouls rapide.' },
      { avec: 'Vide Yin Foie', difference: 'Foie Yin vide : ongles fragiles, spasmes musculaires, vision trouble, pouls corde-fin. Rein Yin vide : lombalgie, acouphènes, sueurs nocturnes.' },
      { avec: 'Chaleur Cœur', difference: 'Chaleur Cœur : aphtes, agitation, pouls plein-rapide. Vide Yin Rein : chaleur de fond vide, sans plénitude.' },
    ],
    koVigilance: 'Vide Yin Rein → Eau n\'éteint plus le Feu → Feu du Cœur monte (insomnie, palpitations, agitation). Ko pathologique : eau doit contrôler feu.',
    progressionPossible: 'Remontée Yang du Foie (eau ne retient plus l\'ancre du Foie). Chaleur vide générale.',
    remarqueIeatc: 'En IEATC : le Rein gauche contrôle le plasma, le squelette et la reproduction. La tonification de 3R et 6R est la base du traitement.',
  },
  {
    id: 'vide_jing_rein',
    nom: 'Vide de Jing du Rein (Essence Ancestrale)',
    element: 'Eau', organe: 'Rein', polarite: 'yin', foyer: 'inferieur', nature: 'vide',
    signesCertains: [
      'Retard de développement ou vieillissement précoce',
      'Troubles osseux, dentaires ou capillaires',
      'Infertilité ou diminution marquée de la libido',
      'Diminution des fonctions cognitives (mémoire, concentration)',
    ],
    signesProbables: [
      'Lombalgie et douleurs des membres inférieurs',
      'Acouphènes et diminution auditive',
      'Fragilité des dents et chute des cheveux',
    ],
    pouls: 'Profond (Chen), vide (Xu), fin (Xi) — proximal gauche Rein.',
    langue: 'Pâle ou rouge selon composante Yang/Yin déficiente. Enduit mince.',
    terrainEmotionnel: 'ZHI profondément épuisé. Perte du sens de direction existentielle. Vide de Ciel Antérieur.',
    pointsFondamentaux: [
      { code: '23V', technique: 'MT', action: 'Shu dos Rein — tonifie Jing directement.' },
      { code: '4VG', technique: 'M', action: 'Ming Men — renforce le Jing ancestral.' },
      { code: '3R', technique: 'T', action: 'Yuan Rein — accès au Jing.' },
      { code: '4RM', technique: 'MT', action: 'Guan Yuan — Mer du Qi, nourrit Yuan Qi.' },
      { code: '39VB', technique: 'T', action: 'Xuan Zhong — Réunion des moelles, tonifie le Jing.' },
    ],
    distinctions: [
      { avec: 'Vide Yin Rein', difference: 'Jing vide = atteinte constitutionnelle profonde, développement, os, reproduction. Yin vide = chaleur, sueurs nocturnes plus marquées.' },
    ],
    remarqueIeatc: 'Le Jing est l\'essence ancestrale héritée — niveau 5 (Ciel antérieur). Moxa sur Ming Men et Guan Yuan est fondamental.',
  },
];

// ─── SYNDROMES FOIE (Bois — FI/FM) ───────────────────────────────────────────

const SYNDROMES_FOIE: SyndromeClinique[] = [
  {
    id: 'stagnation_qi_foie',
    nom: 'Stagnation du Qi du Foie',
    element: 'Bois', organe: 'Foie', polarite: 'yang', foyer: 'inferieur', nature: 'plein',
    signesCertains: [
      'Douleurs, distensions ou oppression hypocondriaque (côtés de la cage thoracique)',
      'Irritabilité, colère facile ou retenue, frustration chronique',
      'Symptômes fluctuants selon l\'état émotionnel (stress = aggravation)',
    ],
    signesProbables: [
      'Dysménorrhée avec douleurs avant ou pendant les règles',
      'Syndrome prémenstruel : tension mammaire, irritabilité, ballonnements',
      'Sensation de boule dans la gorge ("plum-stone throat") — Meihe Qi',
      'Soupirs fréquents involontaires',
      'Digestion perturbée (flatulences, ballonnements) aggravée par le stress',
    ],
    signesAccessoires: [
      'Hypocondre gauche sensible à la pression', 'Douleurs intercostales',
      'Méridien Foie en corde au trajet',
    ],
    pouls: 'Corde-arc (Xian) — tendu comme une corde de luth, surtout à la barrière droite (Foie). Peut être légèrement rapide si chaleur associée.',
    langue: 'Corps normal ou légèrement violacé sur les bords. Enduit normal ou légèrement blanc.',
    terrainEmotionnel: 'HUN (Âme Supérieure du Foie) entravé. Rêves perturbés, difficulté à projeter et planifier. Imagination bloquée. Idées non réalisées.',
    terrainConstitutionnel: 'Constitution Bois bloquée. Souvent lié à accumulation de frustrations non exprimées, vie contrainte, ambitions non accomplies.',
    pathogenie: 'Le Foie est le Ministre de la Défense — il assure la libre circulation du Qi. La stagnation survient quand le Qi émotionnel non résolu entrave cette fonction. Le Bois perd son "impetus printanier" = son pouvoir de pénétration.',
    pointsFondamentaux: [
      { code: '3F', technique: 'D', action: 'Tai Chong — Yuan Foie (point Source). Majeur pour libérer stagnation Qi Foie.', justificationIeatc: 'Fait descendre la quantité de sang dans le Foie.' },
      { code: '14F', technique: 'D', action: 'Qi Men — Mu Foie. Libère stagnation locale au niveau de l\'organe.' },
      { code: '34VB', technique: 'D', action: 'Yang Ling Quan — He-mer VB, maître muscles/tendons. Libère Foyer Moyen.', justificationIeatc: 'Penn Terre de VB = accès profond à la stagnation.' },
      { code: '17RM', technique: 'N', action: 'Shan Zhong — Mu Maître Cœur. Libère le Qi thoracique, centre de réunion du Qi.' },
      { code: '4GI', technique: 'D', action: 'He Gu — Yuan GI. Libère la surface, anti-douleur, aide la descente.' },
    ],
    distinctions: [
      { avec: 'Chaleur Foie/Feu Foie', difference: 'Chaleur = yeux rouges, céphalées temporales, amertume, constipation, pouls corde ET rapide, langue rouge bords jaune.' },
      { avec: 'Stagnation Sang Foie', difference: 'Sang = douleurs fixes intenses, masses palpables, menstrues sombres avec caillots, pouls choppy (Se).' },
      { avec: 'Humidité-Chaleur Foie-VB', difference: 'Humidité-Chaleur = ictère, urines foncées, nausées, enduit jaune gras.' },
    ],
    koVigilance: 'Stagnation Qi Foie → peut envahir Terre (Bois attaque Rate-Estomac) : ballonnements, diarrhée, nausées. Peut aussi insulter Métal (Bois à contre-cycle sur Poumon) : toux, oppression thoracique.',
    progressionPossible: 'Vers Chaleur-Feu du Foie. Vers Stagnation Sang. Vers invasion de la Terre (Rate-Estomac).',
    remarqueIeatc: 'Le Foie est le premier organe atteint par les émotions modernes. La stagnation Qi Foie est le syndrome le plus fréquent dans la population active occidentale.',
  },
  {
    id: 'chaleur_foie',
    nom: 'Chaleur du Foie / Feu du Foie',
    element: 'Bois', organe: 'Foie', polarite: 'yang', foyer: 'inferieur', nature: 'plein',
    signesCertains: [
      'Céphalées temporales ou "en casque" soudaines',
      'Yeux rouges, douleurs oculaires, conjonctivite',
      'Amertume en bouche (surtout le matin)',
      'Colère explosive, irritabilité violente',
    ],
    signesProbables: [
      'Constipation avec selles sèches',
      'Urines foncées, jaunes',
      'Acouphènes soudains, bourdonnements (surtout forts et graves)',
      'Hypertension artérielle',
      'Soif marquée',
    ],
    signesAccessoires: [
      'Epistaxis', 'Saignements de gencives', 'Vomissements de sang (formes graves)',
      'Insomnie avec rêves agités',
    ],
    pouls: 'Corde-arc (Xian) ET rapide (Shuo). Plein à la barrière droite (Foie). Force marquée.',
    langue: 'Corps rouge, rouge vif sur les bords. Enduit jaune, peut être épais.',
    terrainEmotionnel: 'HUN en excès violent. Colère non maîtrisée. Feu monte vers le haut — le Yang s\'emballe.',
    pathogenie: 'Évolution de la stagnation Qi Foie devenue chaleur par accumulation. Le Yang du Foie s\'enflamme. La chaleur monte (Feu monte naturellement) = symptômes au niveau du visage, yeux, tête.',
    pointsFondamentaux: [
      { code: '2F', technique: 'D', action: 'Xing Jian — Iong (Feu) du Foie. Majeur pour disperser Feu du Foie.', justificationIeatc: 'Penn Feu du Foie : disperse directement le Feu excédentaire.' },
      { code: '43VB', technique: 'D', action: 'Xia Xi — Iong (Feu) VB. Disperse Feu VB, descend Yang.', justificationIeatc: 'Penn Feu VB.' },
      { code: '20VB', technique: 'D', action: 'Feng Chi — libère Vent, sédatif du Yang, détend la nuque.' },
      { code: '3R', technique: 'T', action: 'Tai Xi — Ancre le Yin du Rein pour retenir le Yang du Foie.', justificationIeatc: 'Eau retient Bois — nourrir la racine.' },
      { code: '18V', technique: 'D', action: 'Shu dos Foie — disperse directement la chaleur du Foie.' },
    ],
    distinctions: [
      { avec: 'Stagnation Qi Foie', difference: 'Stagnation : pouls corde seulement, symptômes variables selon stress. Chaleur Foie : pouls corde ET rapide, signes de chaleur francs, plus intense.' },
      { avec: 'Montée Yang du Foie', difference: 'Montée Yang : fond de vide Yin Rein, chaleur partielle, pouls corde-vide. Feu Foie : plénitude franche, pouls plein.' },
    ],
    koVigilance: 'Feu Foie monte → peut envahir Cœur (Feu Foie allume Feu Cœur). Chaleur Foie peut générer Vent interne.',
    progressionPossible: 'Vers Vent interne du Foie (convulsions, tremblements). Vers hémorragies.',
  },
  {
    id: 'remontee_yang_foie',
    nom: 'Montée du Yang du Foie (remontée du Yang)',
    element: 'Bois', organe: 'Foie', polarite: 'yang', foyer: 'multiple', nature: 'vide-plein',
    signesCertains: [
      'Céphalées temporales ou en casque — aggravées par stress ou effort',
      'Vertiges posturaux, sensation de tête lourde',
      'Irritabilité avec fond de fatigue',
    ],
    signesProbables: [
      'Acouphènes fluctuants selon stress',
      'Rougeur du visage par bouffées',
      'Hypertension labile',
      'Insomnies légères, rêves nombreux',
    ],
    pouls: 'Corde-arc (Xian) en surface, vide (Xu) en profondeur. Contraste surface/profondeur caractéristique.',
    langue: 'Corps normal ou légèrement rouge sur les bords. Enduit mince.',
    terrainEmotionnel: 'HUN désaxé — trop de projections sans ancrage du Rein. Manque de racines.',
    pathogenie: 'Fond de Vide Yin du Rein : l\'Eau ne retient plus le Yang du Foie. Le Yang monte mais la profondeur est vide. C\'est un vide qui crée un excès apparent en surface.',
    pointsFondamentaux: [
      { code: '3F', technique: 'D', action: 'Tai Chong — abaisse le Yang en excès en surface.' },
      { code: '3R', technique: 'T', action: 'Tai Xi — nourrit le Yin du Rein pour ancrer le Yang du Foie.', justificationIeatc: 'Traiter la cause (Vide Yin Rein) et non le symptôme.' },
      { code: '20VB', technique: 'D', action: 'Feng Chi — libère Vent, sédatif Yang Foie.' },
      { code: '6R', technique: 'T', action: 'Zhao Hai — nourrit Yin Rein profond.' },
    ],
    distinctions: [
      { avec: 'Feu Foie', difference: 'Feu Foie : plénitude franche, pouls corde ET plein ET rapide. Montée Yang : fond de vide, pouls corde EN SURFACE mais vide en profondeur.' },
    ],
    koVigilance: 'Base = Vide Yin Rein. Traiter d\'abord la racine (nourrir Yin Rein) avant de calmer le Yang du Foie.',
  },
  {
    id: 'vide_sang_foie',
    nom: 'Vide de Sang du Foie',
    element: 'Bois', organe: 'Foie', polarite: 'yin', foyer: 'inferieur', nature: 'vide',
    signesCertains: [
      'Vision trouble, photophobie légère, sécheresse oculaire',
      'Ongles striés, cassants, pâles ou déprimés',
      'Engourdissements et fourmillements des membres (surtout la nuit)',
    ],
    signesProbables: [
      'Menstrues peu abondantes, claires, cycle long ou aménorrhée',
      'Crampes musculaires nocturnes',
      'Cheveux secs, ternes, chute de cheveux',
      'Teint terne, blafard ou légèrement jaune',
      'Rêves nombreux, sommeil non réparateur',
    ],
    signesAccessoires: [
      'Tremblements fins des membres', 'Spasmes musculaires',
      'Palpitations légères', 'Anxiété légère',
    ],
    pouls: 'Vide (Xu), fin (Xi), parfois choppy (Se). Barrière droite (Foie) particulièrement vide. Lent possible.',
    langue: 'Pâle, sèche, bords pâles. Enduit mince ou absent.',
    terrainEmotionnel: 'HUN non nourri. Manque de vision intérieure, difficulté à projeter et rêver. Pauvreté imaginative.',
    terrainConstitutionnel: 'Foie thésaurise le sang — vide de sang = le Foie ne nourrit plus ses territoires. Causes : pertes sanguines, alimentation pauvre, surmenage, grossesses rapprochées.',
    pathogenie: 'Le Foie commande la distribution du sang veineux vers tous les organes. Son vide prive muscles, tendons, ongles, yeux et peau de leur nutrition. La nuit, le sang retourne au Foie pour se purifier — si Sang Foie est vide, le sommeil est troublé.',
    pointsFondamentaux: [
      { code: '8F', technique: 'T', action: 'Qu Quan — Ro (Eau) du Foie. Nourrit le Sang du Foie.', justificationIeatc: 'Penn Eau du Foie = point le plus nourrissant du Sang du Foie. Mère du Foie.' },
      { code: '17V', technique: 'T', action: 'Ge Shu — Shu dos diaphragme = Maître du Sang. Tonifie le Sang général.', justificationIeatc: 'Point de commandement du Sang.' },
      { code: '6RP', technique: 'T', action: 'San Yin Jiao — Réunion 3 Yin. Produit le Sang.', justificationIeatc: 'Carrefour Rein-Foie-Rate = nourrit Sang et Yin profondément.' },
      { code: '36E', technique: 'T', action: 'Zu San Li — Source du Qi digestif → source du Sang.', justificationIeatc: 'La Rate produit le Sang à partir du Qi digestif.' },
    ],
    distinctions: [
      { avec: 'Vide Yin Foie', difference: 'Yin Foie vide : symptômes de chaleur (chaleurs, sueurs nocturnes), pouls fin ET rapide. Sang Foie vide : sans chaleur, pouls fin sans rapidité.' },
      { avec: 'Vide Sang général', difference: 'Sang Foie vide : ongles, vision, tendons spécifiquement affectés. Sang général vide : pâleur globale, palpitations, fatigue sans localisation précise.' },
    ],
    koVigilance: 'Vide Sang Foie → Rate doit produire plus de sang (Terre nourrit Bois) → surcharge Rate.',
    remarqueIeatc: 'Le Foie réserve le Sang la nuit. Les troubles nocturnes (crampes, rêves) sont caractéristiques du Vide Sang Foie.',
  },
  {
    id: 'humidite_chaleur_foie_vb',
    nom: 'Humidité-Chaleur du Foie et de la Vésicule Biliaire',
    element: 'Bois', organe: 'Foie/VB', polarite: 'yang', foyer: 'inferieur', nature: 'plein',
    signesCertains: [
      'Ictère (jaunisse) : teint et yeux jaunes',
      'Sensation de chaleur avec oppression thoracique',
      'Nausées, vomissements, anorexie',
    ],
    signesProbables: [
      'Urines foncées, jaune-orangé',
      'Hypocondre douloureux à la pression',
      'Fièvre avec frissons alternants',
      'Lithiase biliaire, cholécystite',
    ],
    pouls: 'Glissant (Hua) et rapide (Shuo) aux barrières (Foie/VB).',
    langue: 'Corps rouge, enduit jaune gras épais.',
    pointsFondamentaux: [
      { code: '34VB', technique: 'D', action: 'He-mer VB. Draine Humidité-Chaleur du Foie-VB.' },
      { code: '19V', technique: 'D', action: 'Shu dos VB. Accès direct à l\'organe.' },
      { code: '9RP', technique: 'D', action: 'He-mer Rate. Transforme et draine l\'Humidité.' },
      { code: '40E', technique: 'D', action: 'Feng Long — Luo Estomac. Résout Humidité, clarifie Chaleur.' },
    ],
    distinctions: [
      { avec: 'Humidité-Froid Rate', difference: 'Humidité-Froid : enduit blanc gras, pouls lent. Humidité-Chaleur : enduit jaune, pouls rapide, ictère.' },
    ],
  },
];

// ─── SYNDROMES CŒUR (Feu — FS) ────────────────────────────────────────────────

const SYNDROMES_COEUR: SyndromeClinique[] = [
  {
    id: 'vide_qi_coeur',
    nom: 'Vide de Qi du Cœur',
    element: 'Feu', organe: 'Cœur', polarite: 'yin', foyer: 'superieur', nature: 'vide',
    signesCertains: [
      'Palpitations légères, aggravées à l\'effort',
      'Essoufflement à l\'effort ou au stress',
      'Fatigue générale, sensation de faiblesse cardiaque',
    ],
    signesProbables: [
      'Teint pâle ou blafard',
      'Sudation spontanée légère',
      'Voix faible',
      'Mélancolie légère',
    ],
    pouls: 'Vide (Xu), faible (Ruo), parfois irrégulier. Position superficielle gauche (Cœur) vide.',
    langue: 'Pâle, légèrement gonflée.',
    terrainEmotionnel: 'SHEN (Esprit du Cœur) affaibli. Manque de rayonnement, de présence. Difficulté à "briller".',
    pointsFondamentaux: [
      { code: '7C', technique: 'T', action: 'Shen Men — Yuan Cœur. Tonifie Qi Cœur, calme Shen.' },
      { code: '15V', technique: 'T', action: 'Shu dos Cœur. Tonifie directement le Cœur.' },
      { code: '14RM', technique: 'T', action: 'Ju Que — Mu Cœur. Renforce Qi Cœur.' },
      { code: '6P', technique: 'T', action: 'Kong Zui — Rythme Poumon → aide Cœur (Poumon induit le rythme cardiaque).' },
    ],
    distinctions: [
      { avec: 'Vide Yang Cœur', difference: 'Yang Cœur vide : frissons, membres froids, pouls lent et vide.' },
      { avec: 'Vide Sang Cœur', difference: 'Sang Cœur vide : insomnie, rêves perturbants, palpitations nocturnes, teint terne.' },
    ],
    remarqueIeatc: 'Le Cœur est le Souverain Empereur — son vide affecte tous les autres organes. Toujours traiter avec douceur, jamais de dispersion forte sur le Cœur.',
  },
  {
    id: 'chaleur_coeur',
    nom: 'Chaleur du Cœur / Feu du Cœur',
    element: 'Feu', organe: 'Cœur', polarite: 'yang', foyer: 'superieur', nature: 'plein',
    signesCertains: [
      'Agitation mentale, anxiété palpitante, état excité',
      'Insomnie : difficulté à s\'endormir, pensées qui s\'emballent',
      'Palpitations, sensation de chaleur thoracique',
    ],
    signesProbables: [
      'Aphtes buccaux récurrents (Feu monte vers bouche)',
      'Urines foncées, parfois brûlures urinaires (Feu descend vers Petit Intestin)',
      'Parole rapide, rires fréquents ou inappropriés',
      'Soif marquée, désir de boissons froides',
    ],
    signesAccessoires: [
      'Épistaxis', 'Visage rouge vif', 'Transpiration de la tête et du thorax',
    ],
    pouls: 'Rapide (Shuo) et plein (Shi) à la position superficielle gauche (Cœur). Fort.',
    langue: 'Corps rouge vif, pointe extrêmement rouge (signe pathognomonique). Enduit jaune fin à la pointe.',
    terrainEmotionnel: 'SHEN perturbé — joie excessive, agitation, hyperactivité mentale. L\'Esprit ne se repose pas.',
    pathogenie: 'Le Cœur est le Souverain Empereur (Yang du Yang). Son Feu s\'embrase par excès de joie, de travail mental intensif ou de drogues excitantes. Le Feu monte vers la bouche, descend vers Petit Intestin via le luo.',
    pointsFondamentaux: [
      { code: '7C', technique: 'D', action: 'Shen Men — Yuan Cœur. Calme le Shen, disperse Feu du Cœur.', justificationIeatc: 'Penn Terre du Cœur = porte de la calme.' },
      { code: '8C', technique: 'D', action: 'Shao Fu — Iong (Feu) du Cœur. Yang du Yang — disperse directement le Feu.', justificationIeatc: 'Penn Feu du Cœur = disperser le Feu excédentaire.' },
      { code: '3C', technique: 'D', action: 'Shao Hai — Ro (Eau) du Cœur. Disperse la Chaleur vers le bas.', justificationIeatc: 'Penn Eau du Cœur = ramener eau pour éteindre feu.' },
      { code: '1R', technique: 'D', action: 'Yong Quan — descend Feu, nourrit l\'Eau.', justificationIeatc: 'Puits Rein : Eau du bas éteint Feu du haut.' },
    ],
    distinctions: [
      { avec: 'Chaleur Foie', difference: 'Chaleur Foie : céphalées, yeux rouges, hypocondre — Foyer Inférieur. Chaleur Cœur : agitation, aphtes, pointe langue rouge — Foyer Supérieur.' },
      { avec: 'Feu dû au Vide Yin Cœur', difference: 'Vide Yin : fond de vide, pouls fin ET rapide (pas plein), chaleur vespérale. Feu plein : plénitude franche, pouls plein.' },
    ],
    koVigilance: 'Feu du Cœur peut envahir Petit Intestin (brûlures urinaires). Eau-Rein doit contrôler Feu-Cœur (Ko).',
    remarqueIeatc: 'En IEATC : "Yang du Yang" = 8C est le point le plus chaud du corps. JAMAIS tonifier 8C.',
  },
  {
    id: 'vide_sang_coeur',
    nom: 'Vide de Sang du Cœur',
    element: 'Feu', organe: 'Cœur', polarite: 'yin', foyer: 'superieur', nature: 'vide',
    signesCertains: [
      'Insomnie chronique avec palpitations nocturnes',
      'Mémoire faible, oublis fréquents',
      'Anxiété légère et permanente, sursauts faciles',
    ],
    signesProbables: [
      'Rêves perturbants, nombreux',
      'Teint terne, blafard',
      'Fatigue mentale plus que physique',
      'Vision légèrement trouble',
    ],
    pouls: 'Vide (Xu), fin (Xi), parfois légèrement rapide. Superficiel gauche (Cœur) vide.',
    langue: 'Pâle, sèche légèrement. Pointe moins rouge que normale.',
    terrainEmotionnel: 'SHEN non nourri. Le Cœur héberge le Shen — sans Sang, le Shen n\'a pas de résidence et erre la nuit (rêves).',
    pointsFondamentaux: [
      { code: '7C', technique: 'T', action: 'Shen Men — Yuan Cœur. Nourrit Sang Cœur, calme Shen.' },
      { code: '17V', technique: 'T', action: 'Maître du Sang.' },
      { code: '15V', technique: 'T', action: 'Shu dos Cœur.' },
      { code: '6RP', technique: 'T', action: 'Nourrit Sang via Rate.' },
    ],
    distinctions: [
      { avec: 'Vide Qi Cœur', difference: 'Qi vide : essoufflement à l\'effort, faiblesse physique. Sang vide : insomnie, mémoire, anxiété nocturne.' },
    ],
  },
];

// ─── SYNDROMES RATE (Terre — FM) ──────────────────────────────────────────────

const SYNDROMES_RATE: SyndromeClinique[] = [
  {
    id: 'vide_qi_rate',
    nom: 'Vide de Qi de la Rate',
    element: 'Terre', organe: 'Rate-Pancréas', polarite: 'yin', foyer: 'moyen', nature: 'vide',
    signesCertains: [
      'Fatigue post-prandiale — épuisement après les repas',
      'Digestion lente, ballonnements et pesanteur gastrique après manger',
      'Selles molles, tendance à la diarrhée chronique',
    ],
    signesProbables: [
      'Teint jaunâtre ou terne (manque de rayonnement)',
      'Membres lourds, musculature flasque',
      'Appétit faible ou inconstant',
      'Sensation de lourdeur générale',
    ],
    signesAccessoires: [
      'Prolapsus (estomac, rectum, utérus) dans les cas avancés',
      'Sang dans les selles ou menstrues abondantes (Rate ne retient plus)',
      'Membres froids aux extrémités',
    ],
    pouls: 'Vide (Xu) à la barrière gauche (Rate), lent (Chi), mou (Ruan) possible.',
    langue: 'Pâle ou normale. Enduit blanc humide. Empreintes dentaires sur les bords (signe classique Rate).',
    terrainEmotionnel: 'YI (Discours intérieur/Rate) affaibli. Soucis chroniques, rumination mentale, manque de concentration. Pensées circulaires, difficultés à terminer les projets.',
    terrainConstitutionnel: 'La Rate est Maîtresse du Yin et de la nutrition. Son vide survient par alimentation irrégulière, excès de cru/froid, intellectualisation excessive, soucis chroniques.',
    pathogenie: 'La Rate transforme et transporte les aliments (Yun Hua). Son Qi déficient = la digestion ne monte plus les essences pures vers le Poumon et le Cœur. Le FM se "refroidit" progressivement.',
    pointsFondamentaux: [
      { code: '36E', technique: 'T', action: 'Zu San Li — He-mer Estomac. Tonifie tout le Qi digestif.', justificationIeatc: 'Maître de tout le Yang du FM. Grand point tonique général.' },
      { code: '6RP', technique: 'T', action: 'San Yin Jiao — Réunion 3 Yin. Nourrit Rate, Yin et Sang.', justificationIeatc: 'ATTENTION : ne jamais disperser si menstrues abondantes ou grossesse.' },
      { code: '4RP', technique: 'T', action: 'Gong Sun — Luo Rate. Source Rate, renforce Qi digestif.' },
      { code: '12RM', technique: 'MT', action: 'Zhong Wan — Mu Estomac. Réchauffe et tonifie le FM.', justificationIeatc: 'Point Mu = en face de l\'organe, accès direct à l\'Estomac.' },
      { code: '3RP', technique: 'T', action: 'Tai Bai — Yuan Rate (Penn Terre). Maître de tout Yin, tonifie Yin du FM.' },
    ],
    distinctions: [
      { avec: 'Vide Yang Rate', difference: 'Yang Rate vide : ajouter froid dominant, diarrhée matinale 5h, extrémités très froides, besoin de chaleur externe, Moxa indispensable.' },
      { avec: 'Humidité-Froid Rate', difference: 'Humidité : ajout de lourdeur marquée, enduit très gras et épais, pouls glissant.' },
      { avec: 'Stagnation Qi Estomac', difference: 'Estomac : douleurs gastriques plus nettes, renvois, pyrosis. Rate : fatigue, muscles.' },
    ],
    koVigilance: 'Vide Rate → Bois peut envahir (Foie attaque Rate vulnérable). Surveiller aggravation par stress.',
    remarqueIeatc: 'La Rate est Maîtresse de toutes les énergies Yin. En IEATC : 3RP est le point Maître de tout Yin. L\'empreinte dentaire sur la langue est le signe le plus spécifique du Vide Rate.',
  },
  {
    id: 'vide_yang_rate',
    nom: 'Vide de Yang de la Rate',
    element: 'Terre', organe: 'Rate-Pancréas', polarite: 'yin', foyer: 'moyen', nature: 'vide',
    signesCertains: [
      'Froid abdominal, douleurs gastriques améliorées par chaleur et pression',
      'Diarrhée ou selles très molles avec aliments non digérés',
      'Membres froids, frilosité marquée surtout abdominale',
    ],
    signesProbables: [
      'Nausées, vomissements clairs',
      'Absence totale d\'appétit',
      'Œdèmes, épanchements, ascite (Yang ne transforme plus les fluides)',
    ],
    pouls: 'Profond (Chen), vide (Xu), lent (Chi), mou (Ruan).',
    langue: 'Très pâle, gonflée avec empreintes dentaires profondes. Enduit blanc épais et humide.',
    pointsFondamentaux: [
      { code: '12RM', technique: 'M', action: 'Mu Estomac. Moxa impératif pour réchauffer FM.' },
      { code: '6RM', technique: 'M', action: 'Réchauffe Foyer Inférieur, aide yang à monter.' },
      { code: '36E', technique: 'MT', action: 'Tonifie et réchauffe le Yang digestif.' },
      { code: '4RP', technique: 'T', action: 'Luo Rate, renforce Qi-Yang Rate.' },
      { code: '20V', technique: 'MT', action: 'Shu dos Rate. Tonifie directement le Yang Rate.' },
    ],
    distinctions: [
      { avec: 'Vide Yang Rein', difference: 'Rein Yang vide : lombalgie froide, urines claires, diarrhée aube. Rate Yang vide : froid abdominal FM, digestion dominante.' },
    ],
    koVigilance: 'Vide Yang Rate → Fluides stagnent → Humidité (pathologie principale de la Terre).',
  },
  {
    id: 'humidite_rate',
    nom: 'Humidité de la Rate (envahissement)',
    element: 'Terre', organe: 'Rate', polarite: 'yin', foyer: 'moyen', nature: 'plein',
    signesCertains: [
      'Lourdeur corporelle diffuse, membres pesants',
      'Tête lourde, brume mentale, difficultés de concentration',
      'Selles molles, collantes ou diarrhée',
    ],
    signesProbables: [
      'Nausées, sensation d\'oppression épigastrique',
      'Abdomen ballonné, douloureux en pression douce',
      'Transpiration peu abondante malgré effort',
      'Goût sucré ou fade en bouche',
    ],
    pouls: 'Glissant (Hua) ou mou (Ruan), lent (Chi). Barrières (Rate-Estomac) particulièrement affectées.',
    langue: 'Corps gonflé avec empreintes dentaires. Enduit blanc gras et épais (signe principal).',
    terrainEmotionnel: 'YI encombré. Pensées lourdes, difficultés à s\'exprimer clairement.',
    pathogenie: 'L\'Humidité est la perversité propre à la Terre. La Rate ne transforme plus correctement les fluides → accumulation d\'Humidité au FM.',
    pointsFondamentaux: [
      { code: '9RP', technique: 'D', action: 'Yin Ling Quan — He-mer Rate. Grand point anti-humidité.', justificationIeatc: 'Penn Eau de Rate : drainer l\'humidité vers le bas.' },
      { code: '40E', technique: 'D', action: 'Feng Long — Luo Estomac. Résout Humidité et Mucosités.' },
      { code: '4RP', technique: 'D', action: 'Luo Rate. Libère le blocage de Rate.' },
      { code: '6RP', technique: 'T', action: 'Relance la fonction de transformation de la Rate.' },
      { code: '9RM', technique: 'N', action: 'Shui Fen — dirige les eaux.' },
    ],
    distinctions: [
      { avec: 'Humidité-Chaleur', difference: 'Humidité-Chaleur : enduit jaune gras, pouls rapide, chaleur subjective. Humidité seule : enduit blanc gras, pouls lent, pas de chaleur.' },
    ],
  },
];

// ─── SYNDROMES POUMON (Métal — FS) ────────────────────────────────────────────

const SYNDROMES_POUMON: SyndromeClinique[] = [
  {
    id: 'vide_qi_poumon',
    nom: 'Vide de Qi du Poumon',
    element: 'Métal', organe: 'Poumon', polarite: 'yin', foyer: 'superieur', nature: 'vide',
    signesCertains: [
      'Voix faible, manque d\'amplitude vocale',
      'Essoufflement à l\'effort, respiration courte',
      'Toux chronique faible, peu productive',
    ],
    signesProbables: [
      'Sueurs spontanées diurnes (Wei Qi déficient)',
      'Rhumes fréquents, infections respiratoires répétées',
      'Teint blanc ou terne, peau terne et sèche',
      'Épaules tombantes, posture affaissée',
    ],
    signesAccessoires: [
      'Fatigue après effort physique minimal',
      'Voix qui "tient" mal sur la durée',
      'Sensation de vide thoracique',
    ],
    pouls: 'Vide (Xu), superficiel (Fu) au proximal droit (Poumon).',
    langue: 'Pâle, légèrement flasque. Enduit blanc fin.',
    terrainEmotionnel: 'PO (Âme Corporelle/Poumon) affaibli. Deuil chronique non résolu, nostalgie, mélancolie. Manque de "souffle vital" psychique.',
    terrainConstitutionnel: 'Poumon = Premier Ministre. Son vide affaiblit le Wei Qi (Qi défensif) → infections récidivantes. Causes : deuil, tristesse, infections respiratoires répétées, vieillissement.',
    pathogenie: 'Le Poumon reçoit toutes les énergies en audience à 3h et distribue le Qi de défense (Wei Qi) à la surface. Son vide laisse la surface sans protection. Le Poumon commande le rythme — son affaiblissement ralentit tout le Qi.',
    pointsFondamentaux: [
      { code: '9P', technique: 'T', action: 'Tai Yuan — Yuan Poumon (Penn Terre). Maître de tous les artères et de l\'énergie sanguine.', justificationIeatc: 'Point mère du Poumon (Terre nourrit Métal).' },
      { code: '13V', technique: 'MT', action: 'Fei Shu — Shu dos Poumon. Tonifie directement le Qi du Poumon.' },
      { code: '36E', technique: 'T', action: 'Tonifie le Wei Qi via Rate-Estomac (source de tout Yang).' },
      { code: '7P', technique: 'T', action: 'Lie Que — Maître du Ren Mai (Yin du FS). Tonifie tout le Yin du FS.' },
    ],
    distinctions: [
      { avec: 'Vide Yin Poumon', difference: 'Yin Poumon vide : toux sèche avec sang, chaleurs vespérales, sueurs nocturnes, voix enrouée. Qi vide : sueurs diurnes, sans chaleur.' },
      { avec: 'Invasion Vent-Froid', difference: 'Vent-Froid : aigü, frissons, pas de syndrome chronique de vide.' },
    ],
    koVigilance: 'Poumon (Métal) contrôle Foie (Bois). Si Métal faible → Bois peut s\'emporter sans contrôle (irritabilité, stagnation).',
    remarqueIeatc: 'En IEATC : le Poumon induit le rythme cardiaque (pas l\'inverse). Son insuffisance crée une irrégularité du pouls. 9P est Maître de tous les artères.',
  },
  {
    id: 'vide_yin_poumon',
    nom: 'Vide de Yin du Poumon',
    element: 'Métal', organe: 'Poumon', polarite: 'yin', foyer: 'superieur', nature: 'vide',
    signesCertains: [
      'Toux sèche, persistante, peu de mucosités ou mucosités rares et collantes',
      'Voix enrouée ou extinction de voix',
      'Chaleurs vespérales légères (après-midi/soir)',
    ],
    signesProbables: [
      'Sueurs nocturnes (moins marquées que pour Rein Yin)',
      'Expectoration striée de sang (formes avancées)',
      'Gorge sèche et douloureuse',
      'Sécheresse des muqueuses nasales',
    ],
    pouls: 'Vide (Xu), fin (Xi), rapide (Shuo).',
    langue: 'Rouge, sèche, enduit absent ou mince — souvent fissures centrales verticales.',
    pointsFondamentaux: [
      { code: '9P', technique: 'T', action: 'Nourrit le Yin du Poumon.' },
      { code: '13V', technique: 'T', action: 'Shu dos Poumon.' },
      { code: '6R', technique: 'T', action: 'Nourrit le Yin des Reins pour humidifier le Poumon (Eau monte vers Métal).' },
      { code: '43E', technique: 'T', action: 'Nourrit le Yin de l\'Estomac → humidifie.' },
    ],
    distinctions: [
      { avec: 'Vide Qi Poumon', difference: 'Qi vide : sueurs diurnes, toux productive. Yin vide : chaleurs vespérales, toux sèche, sueurs nocturnes.' },
    ],
  },
  {
    id: 'invasion_vent_froid',
    nom: 'Invasion Vent-Froid (Wei Qi, surface)',
    element: 'Métal', organe: 'Poumon/GI', polarite: 'yang', foyer: 'superieur', nature: 'plein',
    signesCertains: [
      'Frissons marqués > fièvre (Froid dominant)',
      'Absence de transpiration',
      'Douleurs musculaires diffuses',
    ],
    signesProbables: [
      'Toux avec expectorations blanches claires',
      'Congestion nasale avec sécrétions claires',
      'Nuque et épaules raides et douloureuses',
      'Mal de tête diffus',
    ],
    pouls: 'Superficiel (Fu) et tendu (Jin) — caractéristique.',
    langue: 'Enduit blanc fin.',
    pathogenie: 'Le Vent-Froid externe bloque le Wei Qi à la surface du corps. La transpiration ne peut pas s\'ouvrir → accumulation de Froid sous la peau. Porte d\'entrée : nuque (Feng Men 12V, Feng Chi 20VB).',
    pointsFondamentaux: [
      { code: '4GI', technique: 'D', action: 'He Gu — Yuan GI. Ouvre la surface, expulse le Vent-Froid.', justificationIeatc: 'Grand point anti-Vent, ouvre les pores.' },
      { code: '7P', technique: 'D', action: 'Lie Que — Maître surface Poumon. Ouvre Wei Qi.' },
      { code: '12V', technique: 'D', action: 'Feng Men — Porte du Vent. Expulse Vent de la surface.', justificationIeatc: 'Moxa si Froid dominant pour réchauffer.' },
      { code: '60V', technique: 'D', action: 'Kun Lun — libère la nuque, anti-céphalée Tae Yang.' },
    ],
    distinctions: [
      { avec: 'Invasion Vent-Chaleur', difference: 'Vent-Chaleur : fièvre > frissons, soif, gorge rouge douloureuse, pouls superficiel ET rapide, sueurs possibles.' },
      { avec: 'Vide Qi Poumon', difference: 'Vent-Froid : aigü (< 1 semaine). Vide Poumon : chronique.' },
    ],
    remarqueIeatc: 'Traitement urgent et superficiel. Ne pas tonifier en phase aiguë.',
  },
];

// ─── SYNDROMES COMPLEXES ET PATHOLOGIES ──────────────────────────────────────

const SYNDROMES_COMPLEXES: SyndromeClinique[] = [
  {
    id: 'stagnation_sang_foie_uterin',
    nom: 'Stagnation du Sang (syndrome douloureux/utérin)',
    element: 'Bois/Eau', organe: 'Foie/Utérus', polarite: 'yin', foyer: 'inferieur', nature: 'plein',
    signesCertains: [
      'Douleurs fixes, intenses — aggravées par la pression, améliorées par chaleur',
      'Menstrues avec caillots sombres (brun-noir)',
      'Teint terne ou violacé, lèvres violacées',
    ],
    signesProbables: [
      'Dysménorrhée intense avant les règles',
      'Masses abdominales palpables (kystes, fibromes)',
      'Douleurs intercostales ou sous-costales fixes',
      'Endométriose, polypes utérins',
    ],
    pouls: 'Corde-arc (Xian) et choppy/rugueux (Se) — irrégulier, comme scié. Caractéristique.',
    langue: 'Corps violacé ou avec taches violettes sur les côtés. Enduit fin.',
    terrainEmotionnel: 'HUN entravé physiquement — les visions ne se réalisent pas, blocage concret.',
    pathogenie: 'La Stagnation Sang est l\'évolution de la Stagnation Qi (Qi bloqué → Sang stagne) ou due à Froid (Froid fige le Sang) ou traumatisme. Le Foie commande la circulation sanguine — son atteinte crée la stagnation.',
    pointsFondamentaux: [
      { code: '10RP', technique: 'D', action: 'Xue Hai — Mer du Sang. Meilleur point pour mobiliser et purifier le Sang.', justificationIeatc: 'Grand point de mouvement du Sang = disperse stagnation.' },
      { code: '3F', technique: 'D', action: 'Tai Chong — mobilise le Sang utérin, libère stagnation Foie.' },
      { code: '6RP', technique: 'D', action: 'San Yin Jiao — régule les menstrues, mobilise Sang. ATTENTION : ne jamais disperser en grossesse.', justificationIeatc: 'Réunion 3 Yin = action sur Foie, Rate, Rein → action sur Sang.' },
      { code: '29E', technique: 'M', action: 'Gui Lai — Retour. Moxa pour réchauffer et mobiliser Sang utérin.' },
      { code: '17V', technique: 'D', action: 'Maître du Sang — mobilise Sang général.' },
    ],
    distinctions: [
      { avec: 'Stagnation Qi Foie', difference: 'Qi stagnation : douleurs variables, sans caillots, sans masses. Sang stagnation : douleurs fixes, caillots, masses possibles.' },
      { avec: 'Froid utérin', difference: 'Froid externe dominant, tout amélioré par chaleur externe forte, moxa prioritaire, sans caillots sombres.' },
    ],
    koVigilance: 'La Stagnation Sang vient souvent d\'une Stagnation Qi non traitée. Traiter d\'abord Qi, puis Sang.',
    remarqueIeatc: 'CONTRE-INDICATION ABSOLUE : 6RP, 4GI dispersés pendant la grossesse. 10RP est un point central à ne pas négliger.',
  },
  {
    id: 'mucosites_chaleur',
    nom: 'Mucosités-Chaleur (Tan-Re)',
    element: 'multiple', organe: 'Poumon/Cœur', polarite: 'yang', foyer: 'superieur', nature: 'plein',
    signesCertains: [
      'Expectorations jaunes ou vertes épaisses',
      'Oppression thoracique avec chaleur',
      'Fièvre ou chaleur interne franche',
    ],
    signesProbables: [
      'Confusion mentale, parole incohérente (si Cœur atteint)',
      'Sécrétion nasale jaune',
      'Gorge rouge et douloureuse',
    ],
    pouls: 'Glissant (Hua) et rapide (Shuo).',
    langue: 'Rouge, enduit jaune gras épais.',
    pointsFondamentaux: [
      { code: '40E', technique: 'D', action: 'Feng Long — grand point résolvant Mucosités.' },
      { code: '5P', technique: 'D', action: 'Chi Ze — He-mer Poumon. Draine chaleur du Poumon.' },
      { code: '7C', technique: 'D', action: 'Si Mucosités obstruent Cœur (confusion).' },
    ],
    distinctions: [
      { avec: 'Mucosités-Froid', difference: 'Froid : expectorations blanches claires, pouls lent, pas de fièvre.' },
    ],
  },
  {
    id: 'vide_qi_sang_general',
    nom: 'Vide de Qi et de Sang (syndrome double)',
    element: 'Terre/Bois', organe: 'Rate/Foie', polarite: 'yin', foyer: 'multiple', nature: 'vide',
    signesCertains: [
      'Fatigue profonde, tant physique que mentale',
      'Pâleur globale : teint, lèvres, ongles pâles',
      'Palpitations et essoufflement à l\'effort',
    ],
    signesProbables: [
      'Vertiges à l\'orthostatisme',
      'Insomnie légère avec anxiété',
      'Membres engourdis ou lourds',
      'Appétit diminué',
    ],
    pouls: 'Vide (Xu), fin (Xi), parfois légèrement rapide.',
    langue: 'Très pâle, sèche légèrement.',
    pointsFondamentaux: [
      { code: '36E', technique: 'T', action: 'Source Qi digestif → source Sang.' },
      { code: '17V', technique: 'T', action: 'Maître du Sang.' },
      { code: '6RP', technique: 'T', action: 'Nourrit Sang et Yin via 3 Yin.' },
      { code: '20V', technique: 'T', action: 'Shu dos Rate — tonifie Rate.' },
      { code: '7C', technique: 'T', action: 'Nourrit Sang Cœur, calme Shen.' },
    ],
    distinctions: [],
  },
  {
    id: 'hypertension_vide_yin',
    nom: 'Hypertension par Vide Yin / Prospérité Yang (Foie-Rein)',
    element: 'Bois/Eau', organe: 'Foie/Rein', polarite: 'yin', foyer: 'multiple', nature: 'vide-plein',
    signesCertains: [
      'Hypertension artérielle chronique',
      'Céphalées temporales ou occipitales',
      'Vertiges, bourdonnements d\'oreilles',
    ],
    signesProbables: [
      'Insomnie, palpitations',
      'Corps amaigri, SHEN malades (fatigués)',
      'Vue trouble, yeux secs',
      'Irritabilité avec fond de fatigue',
    ],
    pouls: 'Corde-arc (Xian) en surface, vide (Xu) en profondeur. Contrasté.',
    langue: 'Rouge sur les bords, enduit mince.',
    pathogenie: 'Soucis/épuisement détériorent le Sang. Eau ne contient plus Bois. Rein vide = moins de fluides en circulation → vasoconstriction, déséquilibre, Yang monte. Mécanisme : vide Yin crée excès apparent Yang.',
    pointsFondamentaux: [
      { code: '3R', technique: 'T', action: 'Nourrit Yin Rein pour ancrer Yang Foie.' },
      { code: '23V', technique: 'T', action: 'Shu dos Rein.' },
      { code: '15V', technique: 'T', action: 'Shu dos Cœur — soutient Cœur affaibli.' },
      { code: '2F', technique: 'D', action: 'Disperse Feu Foie, abaisse Yang.' },
      { code: '3F', technique: 'D', action: 'Abaisse Yang du Foie.' },
      { code: '20VB', technique: 'D', action: 'Feng Chi — sédatif Yang, libère Vent.' },
    ],
    distinctions: [
      { avec: 'HTA par Feu Phlegme', difference: 'Phlegme : aime manger gras, E40 prioritaire, enduit gras, pouls glissant.' },
    ],
    koVigilance: 'Traiter d\'abord Vide Yin Rein (cause racine) avant de disperser Yang Foie (symptôme).',
    remarqueIeatc: 'En IEATC, l\'HTA est lue selon ses mécanismes — il peut y avoir 4-5 types différents de même HTA selon le patient.',
  },
  {
    id: 'constipation_souffles',
    nom: 'Constipation par Stagnation des Souffles (psychique)',
    element: 'Bois', organe: 'Foie/GI', polarite: 'yang', foyer: 'moyen', nature: 'plein',
    signesCertains: [
      'Constipation liée aux états émotionnels (stress, contrainte, mélancolie)',
      'Ventre tantôt ballonné tantôt dégonflé selon l\'état psychique',
      'Côtés oppressés, sensation de plénitude sans selles',
    ],
    signesProbables: [
      'Soupirs fréquents', 'Alternance diarrhée/constipation',
      'Aggravation lors des périodes de stress ou avant événements stressants',
    ],
    pouls: 'Corde-arc (Xian).',
    langue: 'Normale ou légèrement violacée sur les bords.',
    pathogenie: 'État soucieux, oppressé, mélancolique → Qi bloqué → Foie-Bois perd sa fonction pénétrante (impetus printanier) → cycle pervers Terre→Bois = Foie envahit Rate → transit bloqué.',
    pointsFondamentaux: [
      { code: '4RM', technique: 'N', action: 'Libère le Renmai — débloque la contrainte.' },
      { code: '6RP', technique: 'MT', action: 'Relance la Terre, débloque le cycle Rate.' },
      { code: '3F', technique: 'D', action: 'Libère la stagnation du Foie.' },
    ],
    distinctions: [
      { avec: 'Constipation par Chaleur', difference: 'Chaleur : selles compactes, soif, pouls rapide. Souffles : variable selon état émotionnel, pouls corde.' },
      { avec: 'Constipation par Vide Yang', difference: 'Yang vide : froid, langue pâle, chronique, pouls profond lent.' },
    ],
  },
  {
    id: 'diarrhee_bois_terre',
    nom: 'Diarrhée par Bois qui envahit Terre (cycle Ko)',
    element: 'Bois/Terre', organe: 'Foie/Rate-Estomac', polarite: 'yang', foyer: 'moyen', nature: 'vide-plein',
    signesCertains: [
      'Diarrhée déclenchée ou aggravée par le stress émotionnel',
      'Intestins gargouillants avec douleurs abdominales',
      'Selles avec aliments non digérés (Bois envahit Terre)',
    ],
    signesProbables: [
      'Alternance douleur abdominale avant la selle puis soulagement',
      'Nausées au stress',
      'Aggravation lors de repas pris sous tension',
    ],
    pouls: 'Corde-arc (Xian) — Foie dominant.',
    langue: 'Normale ou légèrement rouge sur les bords.',
    pathogenie: 'Le Bois-Foie profite de la faiblesse de la Terre-Rate pour l\'envahir (mécanisme Ko d\'attaque). Qi du Vent pénètre dans Rate. Estomac n\'accomplit plus putréfaction et maturation correctement.',
    pointsFondamentaux: [
      { code: '20V', technique: 'T', action: 'Shu dos Rate — soutenir et renforcer la Terre.' },
      { code: '36E', technique: 'T', action: 'He-mer Estomac — soutenir la Terre.' },
      { code: '3F', technique: 'D', action: 'Affaiblir le Bois envahisseur.' },
      { code: '2F', technique: 'D', action: 'Disperser l\'excès du Foie.' },
    ],
    distinctions: [
      { avec: 'Diarrhée par Froid', difference: 'Froid : ventre douloureux sans cause, selles froides claires, pas de relation avec stress.' },
      { avec: 'Diarrhée par Humidité', difference: 'Humidité : lourdeur, enduit blanc gras, sans lien émotionnel fort.' },
    ],
    remarqueIeatc: 'Règle Ko : tonifier l\'élément dominateur (Métal/Poumon contrôle Bois) plutôt qu\'attaquer directement Foie.',
  },
  {
    id: 'chaleur_humidite_foyer_moyen',
    nom: 'Humidité-Chaleur du Foyer Moyen',
    element: 'Terre', organe: 'Rate/Estomac', polarite: 'yang', foyer: 'moyen', nature: 'plein',
    signesCertains: [
      'Lourdeur abdominale avec chaleur interne',
      'Selles molles ou diarrhée avec mucosités jaunes',
      'Nausées, anorexie, goût amer ou fade',
    ],
    signesProbables: [
      'Teint jaunâtre ou huileux',
      'Urines foncées, jaunes',
      'Fièvre vespérale légère',
      'Corps lourd et chaud',
    ],
    pouls: 'Glissant (Hua) et rapide (Shuo), surtout aux barrières.',
    langue: 'Corps rouge, enduit jaune gras — caractéristique.',
    pointsFondamentaux: [
      { code: '34VB', technique: 'D', action: 'He-mer VB. Draine Humidité-Chaleur Foie-VB.' },
      { code: '9RP', technique: 'D', action: 'He-mer Rate. Transforme Humidité.' },
      { code: '40E', technique: 'D', action: 'Luo Estomac. Résout Humidité, clarifie Chaleur.' },
      { code: '8RP', technique: 'D', action: 'Di Ji — Xi Rate. Anti-inflammatoire puissant.' },
    ],
    distinctions: [
      { avec: 'Humidité-Froid', difference: 'Froid : enduit blanc gras, pouls lent, pas de chaleur subjective.' },
    ],
  },
];

// ─── SYNDROMES ESTOMAC (Terre — FM) ──────────────────────────────────────────

const SYNDROMES_ESTOMAC: SyndromeClinique[] = [
  {
    id: 'vide_yang_estomac',
    nom: 'Vide de Yang de l\'Estomac (Foyer Moyen froid)',
    element: 'Terre', organe: 'Estomac', polarite: 'yin', foyer: 'moyen', nature: 'vide',
    signesCertains: [
      'Douleurs épigastriques froides, soulagées par chaleur externe et pression',
      'Nausées et vomissements de liquide clair',
      'Appétit nul ou très faible',
    ],
    signesProbables: [
      'Digestion inexistante, aliments non transformés',
      'Fatigue extrême après repas, voire impossibilité de manger',
      'Membres froids, frilosité abdominale',
    ],
    pouls: 'Profond (Chen), vide (Xu), lent (Chi). Position barrière gauche (Estomac).',
    langue: 'Pâle, corps gonflé. Enduit blanc épais et humide.',
    terrainEmotionnel: 'YI (Rate) épuisé. Pensées creuses, incapacité à "digérer" les événements.',
    terrainConstitutionnel: 'L\'Estomac fabrique le Yang quotidien. Sans Yang du Rein, l\'Estomac est vide. Protocole IEATC : restaurer l\'Estomac AVANT de traiter le Rein Yang.',
    pathogenie: 'Vide Yang Rein → Estomac ne reçoit plus l\'impulsion Yang → cycle vicieux. RÈGLE IEATC : toujours restaurer le Yang de l\'Estomac en 1ère séance avant de tonifier le Rein Yang.',
    pointsFondamentaux: [
      { code: '36E', technique: 'MT', action: 'Maître de tout Yang. Tonifie Yang Estomac-Rate. Séance 1 obligatoire.', justificationIeatc: 'Grande sérénité, tire le Sang vers le bas. Ne pas utiliser si règles hémorragiques.' },
      { code: '12RM', technique: 'M', action: 'Mu Estomac. Réchauffe FM, active Yuan Qi digestif.' },
      { code: '4GI', technique: 'MT', action: 'Ouverture surface, tonification Yang général.' },
      { code: '25E', technique: 'MT', action: 'Pivot du Ciel. Purifie et relance Yang GI.' },
      { code: '23V', technique: 'MT', action: 'Shu Rein — SÉANCE 2 seulement, après avoir restauré E.', justificationIeatc: 'Protocole Vide Rein Yang : E avant R.' },
    ],
    distinctions: [
      { avec: 'Vide Yang Rate', difference: 'Rate Yang : dominante digestive, selles très molles. Estomac Yang : douleurs épigastriques froides, nausées, vomissements clairs.' },
      { avec: 'Froid pénétration externe', difference: 'Froid externe : aigü après exposition au froid. Vide Yang E : chronique, lié à vide de fond.' },
    ],
    remarqueIeatc: 'PROTOCOLE VY REIN (IEATC) — Séance 1 : 4GI t + 12RM t + 25E t + 36E t (moxa). Séance 2 : 2R t + 8MC t OU 4VG t + 23V t.',
  },
  {
    id: 'stagnation_qi_estomac',
    nom: 'Stagnation du Qi de l\'Estomac (barrière FM bloquée)',
    element: 'Terre', organe: 'Estomac', polarite: 'yang', foyer: 'moyen', nature: 'plein',
    signesCertains: [
      'Douleurs épigastriques distendantes, aggravées après repas',
      'Renvois, éructations, régurgitations acides',
      'Nausées, vomissements possibles',
    ],
    signesProbables: [
      'Plénitude épigastrique constante',
      'Aérophagie, flatulences au-dessus du nombril',
      'Reflux acides (barrière FM bloquée côté Yang)',
    ],
    signesAccessoires: ['Anorexie', 'Goût acide ou amer'],
    pouls: 'Corde-arc (Xian) ou glissant (Hua), barrière gauche en plénitude.',
    langue: 'Enduit blanc épais ou jaune si chaleur associée.',
    pathogenie: 'Barrière FM bloquée côté Yang (E+VB en excès). Le Yang Ming contrarié ne descend plus. YUN HUA bloqué = le transit ne se fait pas.',
    pointsFondamentaux: [
      { code: '12RM', technique: 'D', action: 'Mu Estomac. Disperse stagnation FM.', justificationIeatc: 'Barrière Yang : 12RM d + 6MC t + 13F t.' },
      { code: '6MC', technique: 'T', action: 'Nei Guan — Maître de la barrière FM. Triple fonction : psychique, digestif, barrière.', justificationIeatc: 'Ouvre la barrière dans les 2 sens.' },
      { code: '36E', technique: 'D', action: 'Disperse Yang Estomac, relance descente Yang Ming.' },
      { code: '34VB', technique: 'D', action: 'He-mer VB. Draine si VB impliquée (reflux biliaire).' },
    ],
    distinctions: [
      { avec: 'Stagnation Qi Foie envahissant E', difference: 'Foie→E : fort lien émotionnel-stress. E seul : alimentation, surmenage digestif.' },
      { avec: 'Chaleur Estomac', difference: 'Chaleur E : polyphagie, soif froide, gingivites. Stagnation seule : sans chaleur franche.' },
    ],
    koVigilance: 'Aérophagie = gaz au-dessus nombril. Ne JAMAIS retenir éructations/vents (bloque Yang Ming).',
    remarqueIeatc: 'Barrière FM Yang bloquée : 6MC t + 13F t + 12RM d. Barrière Yin bloquée : 12RM t + 6MC d + 4GI t + 36E t.',
  },
  {
    id: 'chaleur_estomac',
    nom: 'Chaleur de l\'Estomac',
    element: 'Terre', organe: 'Estomac', polarite: 'yang', foyer: 'moyen', nature: 'plein',
    signesCertains: [
      'Polyphagie (faim intense et rapide)',
      'Soif marquée avec désir de boissons froides',
      'Gingivites, aphtes gingivaux, gencives douloureuses',
    ],
    signesProbables: [
      'Constipation avec selles sèches et odorantes',
      'Mauvaise haleine (odeur acide ou aigre)',
      'Nausées ou vomissements acides',
    ],
    pouls: 'Rapide (Shuo), glissant (Hua) à la barrière gauche.',
    langue: 'Corps rouge, enduit jaune épais — particulièrement au milieu (FM).',
    pointsFondamentaux: [
      { code: '44E', technique: 'D', action: 'Iong (Eau) Estomac. Disperse Chaleur Estomac.', justificationIeatc: 'Penn Eau de E = éteint la Chaleur.' },
      { code: '43E', technique: 'D', action: 'Iu (Bois) Estomac. Draine Chaleur FM.' },
      { code: '12RM', technique: 'D', action: 'Mu Estomac. Disperse Chaleur locale.' },
      { code: '25V', technique: 'D', action: 'Shu dos GI. Draine chaleur vers le bas.' },
    ],
    distinctions: [
      { avec: 'Humidité-Chaleur FM', difference: 'Humidité-Chaleur : lourdeur, enduit gras épais. Chaleur seule : sans lourdeur excessive.' },
    ],
    remarqueIeatc: 'Selles décolorées ou odorantes spécifiques signent l\'élément déréglé dans le corps (odeur acide = Bois, fade = Terre, âcre = Métal).',
  },
];

// ─── SYNDROMES VÉSICULE BILIAIRE (Bois — FI/FM) ──────────────────────────────

const SYNDROMES_VB: SyndromeClinique[] = [
  {
    id: 'stagnation_vb_indecision',
    nom: 'Stagnation de la Vésicule Biliaire (indécision, timidité)',
    element: 'Bois', organe: 'Vésicule Biliaire', polarite: 'yang', foyer: 'inferieur', nature: 'vide',
    signesCertains: [
      'Indécision chronique, incapacité à "trancher"',
      'Timidité excessive, peur de passer à l\'acte',
      'Palpitations ou tressaillements faciles',
    ],
    signesProbables: [
      'Cauchemars (signe propre à la VB)',
      'Insomnie avec rumination nocturne',
      'Sensation d\'oppression latérale thoracique',
      'Crises d\'acide urique récidivantes',
    ],
    signesAccessoires: ['Sensation de "plum-stone" décisionnel', 'Migraines temporales intermittentes'],
    pouls: 'Corde-arc (Xian) légèrement vide en profondeur. Position barrière droite (VB).',
    langue: 'Normale ou légèrement rouge sur les bords.',
    terrainEmotionnel: 'HUN entravé au niveau de la décision-action. "Avoir des projets et passer à l\'acte ne sont pas la même chose" — VB donne l\'impetus du passage à l\'acte.',
    pathogenie: 'La VB est le Chef d\'orchestre de tous les organes et le Ministre de la Rectitude Médiane. Elle décide pour les 11 viscères. Sa stagnation = paralysie décisionnelle générale de l\'organisme.',
    pointsFondamentaux: [
      { code: '40VB', technique: 'T', action: 'Qiu Xu — Yuan VB. Tonifie la Vésicule Biliaire.', justificationIeatc: 'Accès direct au Yuan Qi de la VB.' },
      { code: '34VB', technique: 'T', action: 'Yang Ling Quan — He-mer VB. Renforce la décision.' },
      { code: '43VB', technique: 'T', action: 'Xia Xi — Iong (Eau) VB. Renforce VB.' },
      { code: '20VB', technique: 'N', action: 'Feng Chi — libère la stagnation VB, ouvre le Shaoyang.' },
    ],
    distinctions: [
      { avec: 'Feu VB', difference: 'Feu VB : colère explosive, yeux rouges, pouls corde ET rapide. Stagnation : indécision, timidité, pouls corde-vide.' },
      { avec: 'Stagnation Qi Foie', difference: 'Foie stagnation : frustration, hypocondre. VB : indécision, cauchemars, passage à l\'acte impossible.' },
    ],
    koVigilance: 'VB faible → Estomac sans Yang → Rate sans équilibre → Rein Yang épuisé (cascade).',
    remarqueIeatc: 'IEATC : "Cauchemars = VB, rêves = Foie". La VB est chef d\'orchestre — son atteinte perturbe tous les organes. Café au lait bloque VB pour toute la matinée.',
  },
  {
    id: 'feu_vb',
    nom: 'Feu de la Vésicule Biliaire (montée de bile)',
    element: 'Bois', organe: 'Vésicule Biliaire', polarite: 'yang', foyer: 'inferieur', nature: 'plein',
    signesCertains: [
      'Migraines temporales intenses, soudaines',
      'Vertiges rotatoires violents',
      'Oreilles bourdonnantes, surdité du plein',
    ],
    signesProbables: [
      'Visage rouge, yeux rouges',
      'Amertume en bouche',
      'Colère explosive avec décision brutale',
      'Douleurs latérales thoraciques ou axillaires',
    ],
    pouls: 'Corde-arc (Xian) et rapide (Shuo), plein en surface droite (VB).',
    langue: 'Corps rouge, enduit jaune sur les bords.',
    pathogenie: 'Le Feu de la VB monte à contre-courant (inverse du trajet méridien descendant) → chaleur vers tête, oreilles, yeux. La bile devient "Feu liquide destructeur".',
    pointsFondamentaux: [
      { code: '43VB', technique: 'D', action: 'Xia Xi — Iong (Eau) VB. Disperse Feu VB, descend Yang.', justificationIeatc: 'Penn Eau de VB = éteint le Feu.' },
      { code: '38VB', technique: 'D', action: 'Yang Fu — King (Métal) VB. Disperse Chaleur VB.' },
      { code: '20VB', technique: 'D', action: 'Feng Chi — libère Vent-Chaleur, sédatif Yang.' },
      { code: '1VB', technique: 'D', action: 'Point migraines VB — urgence.', justificationIeatc: 'Migraines VB : 1VB d + 20VB d + 21VB d + 23TR d.' },
      { code: '21R', technique: 'D', action: 'Urgence colique hépatique : ouvre le cholédoque.', justificationIeatc: 'Colique hépatique : 34VB d + 21R d + 25V\' d (ARRÊT INSTANTANÉ).' },
    ],
    distinctions: [
      { avec: 'Feu Foie', difference: 'Feu Foie : colère diffuse, céphalées, constipation. Feu VB : vertiges intenses, oreilles, décision brutale.' },
    ],
    remarqueIeatc: 'Acide urique = TOUJOURS d\'origine VB qui ne se draine pas. La chaleur VB non drainée reflue dans Foie → pénètre le sang → cristaux urates.',
  },
];

// ─── SYNDROMES MAÎTRE DU CŒUR (Feu Ministre — FS) ────────────────────────────

const SYNDROMES_MC: SyndromeClinique[] = [
  {
    id: 'vide_mc_troubles_emotionnels',
    nom: 'Vide du Maître du Cœur (troubles émotionnels-sentimentaux)',
    element: 'Feu Ministre', organe: 'Maître du Cœur', polarite: 'yang', foyer: 'superieur', nature: 'vide',
    signesCertains: [
      'Troubles émotionnels disproportionnés aux événements',
      'Palpitations déclenchées par émotions',
      'Sensation d\'oppression thoracique lors de stress émotionnel',
    ],
    signesProbables: [
      'Anxiété émotionnelle (distincte de l\'anxiété de fond du Poumon)',
      'Instabilité sentimentale, attachements-détachements brutaux',
      'Douleur "comme un coup de poignard" en région thoracique',
    ],
    pouls: 'Vide ou irrégulier à la position superficielle gauche (MC).',
    langue: 'Légèrement pâle ou rouge selon composante dominante.',
    terrainEmotionnel: 'MC = réceptacle-filtre de toutes les émotions. Son épuisement laisse les émotions brutes accéder au Cœur sans filtre. "Quand le Cœur est faible, le MC commande — le sujet est soumis à ses passions."',
    terrainConstitutionnel: 'MC = Feu Ministre — protège le Cœur Souverain. Sa fragilité expose le Cœur à toutes les émotions extérieures.',
    pathogenie: 'MC gère la vie affective (sentiments) comme le Cœur gère la vie spirituelle (Chen). Vide MC = les émotions ne sont plus filtrées → impact direct sur Cœur.',
    pointsFondamentaux: [
      { code: '6MC', technique: 'T', action: 'Nei Guan — Triple fonction : calme Shen émotionnel, maître FM, ouvre barrière.', justificationIeatc: 'Urgence douleur thoracique : 6MC d = efficacité immédiate et définitive.' },
      { code: '7MC', technique: 'T', action: 'Da Ling — Yuan MC (Penn Terre). Calme les émotions, stabilise MC.', justificationIeatc: 'Alternative à 7C pour les troubles émotionnels.' },
      { code: '17RM', technique: 'N', action: 'Shan Zhong — Mer des Souffles, 17JM. Centre de réunion des émotions (Tan Zhong).', justificationIeatc: 'Centre de commandement de Zong Qi, là où se concentrent tous les sentiments.' },
      { code: '14JM', technique: 'N', action: 'Ju Que — Mu Cœur. Action sur complexe Cœur-MC si douleur thoracique.' },
    ],
    distinctions: [
      { avec: 'Vide Qi Cœur', difference: 'Vide Qi C : essoufflement, palpitations effort. Vide MC : déclenchement émotionnel spécifique, dimension sentimentale.' },
      { avec: 'Chaleur Cœur', difference: 'Chaleur C : agitation Yang, aphtes. MC : dimension émotionnelle-sentimentale.' },
    ],
    remarqueIeatc: 'Axe Tsiué Yin = Foie (bas) + MC (haut). Si Foie en plénitude → énergie Yin remonte → MC en plénitude → 6MC d. 18RM d régularise l\'axe Tsiué Yin.',
  },
];

// ─── Catalogue complet ────────────────────────────────────────────────────────

export const SYNDROMES: SyndromeClinique[] = [
  ...SYNDROMES_REIN,
  ...SYNDROMES_FOIE,
  ...SYNDROMES_COEUR,
  ...SYNDROMES_RATE,
  ...SYNDROMES_POUMON,
  ...SYNDROMES_COMPLEXES,
  ...SYNDROMES_ESTOMAC,
  ...SYNDROMES_VB,
  ...SYNDROMES_MC,
];

// ─── Formules de points classiques IEATC ─────────────────────────────────────

export const FORMULES_CLASSIQUES = `
FORMULES DE POINTS CLASSIQUES IEATC

══ TONIFICATION GÉNÉRALE ══
Qi digestif (FM) : 36E(T) + 6RP(T) + 4RP(T) + 12RM(Moxa)
Yang général : 4VG(Moxa) + 4RM(Moxa) + 36E(T)
Yin général : 3R(T) + 6R(T) + 6RP(T)

══ NOURRIR LE SANG ══
Base : 17V(T) + 6RP(T) + 10RP(T) + 36E(T)
Sang Foie spécifique : 8F(T) + 6RP(T) + 17V(T)

══ CALMER LE SHEN ══
Standard : 7C(D/N) + 6RP(T) + 3R(T) → harmonie Eau-Feu
Profond : 7C(T) + 4C(D) + 15V(T)

══ LIBÉRER STAGNATION QI FOIE ══
Base : 3F(D) + 34VB(D) + 17RM(N)
Renforcé : + 14F(D) + 4GI(D)

══ CHALEUR FOIE/FEU ══
Feu Foie : 2F(D) + 43VB(D) + 5TF(D)
Feu Cœur : 8C(D) + 3C(D) + 1R(D)

══ RÉCHAUFFE YANG FONDAMENTAL ══
Yang Rein : 4VG(Moxa) + 23V(Moxa) + 7R(T)
Yang Rate : 12RM(Moxa) + 36E(MT) + 20V(MT)

══ NOURRIR YIN PROFOND ══
Base : 3R(T) + 6R(T) + 7C(T)
Foie-Rein : 3R(T) + 8F(T) + 6RP(T)

══ TRAITEMENT HUMIDITÉ ══
Rate : 9RP(D) + 40E(D) + 4RP(D)
FM global : 9RM(N) + 40E(D) + 9RP(D)

══ ANTI-DOULEUR CLASSIQUES ══
4GI + 3F : anti-douleur du haut et du bas
Principe : 4GI (tête, face, membres sup) | 3F (thorax, abdomen, membres inf)

══ CINQ POINTS SHU — LOGIQUE MÈRE-FILS ══
Foie : Mère=8F(Eau→Bois) | Fils=2F(Bois→Feu)
Cœur : Mère=9C(Bois→Feu) | Fils=7C(Feu→Terre)
Rate : Mère=2RP(Feu→Terre) | Fils=5RP(Terre→Métal)
Poumon : Mère=9P(Terre→Métal) | Fils=5P(Métal→Eau)
Rein : Mère=8F? → 10R(Métal→Eau) | Fils=1R(Eau→Bois)

══ POINTS DE COMMANDEMENT SYSTÉMIQUES ══
9P = Maître de tous les artères et énergie sanguine
17V = Maître du Sang
12RM = Maître des viscères / Foyer Moyen
34VB = Maître muscles, tendons, ligaments
4GI = Ouvre la surface, anti-vent, anti-douleur
`;

// ─── Router de corpus — sélection contextuelle ───────────────────────────────

export function getCorpusForAgent(
  agentId: 'ZHI' | 'HUN' | 'SHEN' | 'PO',
  caseText: string,
): string {
  const textLower = caseText.toLowerCase();
  const sections: string[] = [];

  // Philosophie clinique — toujours incluse
  sections.push(PHILOSOPHIE_CLINIQUE);

  if (agentId === 'PO') {
    // PO prescrit : syndromes complets + formules
    const pertinents = filterSyndromesForCase(textLower);
    if (pertinents.length > 0) {
      sections.push('\n═══ SYNDROMES CLINIQUES PERTINENTS (corpus IEATC) ═══\n');
      pertinents.forEach(s => sections.push(formatSyndromeForPrompt(s)));
    }
    sections.push(FORMULES_CLASSIQUES);
  } else if (agentId === 'HUN') {
    // HUN explore : liste syndromes pour hypothèses
    sections.push('\n═══ SYNDROMES IEATC — liste pour exploration ═══\n');
    SYNDROMES.forEach(s => {
      const certains = s.signesCertains.slice(0, 2).join(' / ');
      sections.push(`• ${s.nom} [${s.element ?? 'multiple'} — ${s.nature}] : ${certains}`);
    });
  } else if (agentId === 'SHEN') {
    // SHEN discrimine : syndromes pertinents + distinctions
    const pertinents = filterSyndromesForCase(textLower);
    if (pertinents.length > 0) {
      sections.push('\n═══ SYNDROMES PERTINENTS POUR DISCRIMINATION ═══\n');
      pertinents.forEach(s => {
        const certains = s.signesCertains.join(' | ');
        const distinctions = s.distinctions.map(d => `≠ ${d.avec}`).join(', ');
        sections.push(`${s.nom} (${s.element ?? 'multiple'}, ${s.nature})\n  → ${certains}\n  Distinctions : ${distinctions}\n  Pouls : ${s.pouls}\n  Langue : ${s.langue}\n`);
      });
    }
    sections.push(FORMULES_CLASSIQUES);
  }
  // ZHI : philosophie seulement suffit pour l'ancrage

  return sections.join('\n');
}

// ─── Filtrage des syndromes par pertinence ────────────────────────────────────

function filterSyndromesForCase(caseTextLower: string): SyndromeClinique[] {
  const keywords: Record<string, string[]> = {
    vide_yang_rein: ['froid', 'lombaire', 'urine', 'matin', 'frilosit', 'rein'],
    vide_yin_rein: ['chaleur', 'sueur', 'nuit', 'lomba', 'acouphène', 'vertige', 'rein', 'soif'],
    vide_jing_rein: ['os', 'dents', 'cheveux', 'infertil', 'memoire', 'vieilliss', 'ancestral'],
    stagnation_qi_foie: ['stress', 'colere', 'hypocondre', 'douleur', 'règle', 'menstr', 'foie', 'côte', 'soupir'],
    chaleur_foie: ['cephale', 'yeux', 'amertume', 'hypertens', 'rouge', 'constip'],
    remontee_yang_foie: ['cephale', 'vertige', 'hypertens', 'irrit', 'tête'],
    vide_sang_foie: ['ongles', 'vision', 'fourmil', 'crampe', 'cheveux', 'règle', 'pale'],
    humidite_chaleur_foie_vb: ['ictere', 'jaune', 'nausse', 'biliaire', 'cholecyst'],
    vide_qi_coeur: ['palpit', 'essouf', 'coeur', 'cardiaque'],
    chaleur_coeur: ['insomnie', 'anxiet', 'palpit', 'agit', 'aphtes', 'urine', 'agitation'],
    vide_sang_coeur: ['insomnie', 'reves', 'memoire', 'anxiet', 'pâleur'],
    vide_qi_rate: ['fatigue', 'digestion', 'selles', 'ballonne', 'repas', 'rate'],
    vide_yang_rate: ['froid', 'abdomen', 'selles', 'nausse', 'oedeme'],
    humidite_rate: ['lourd', 'tête lourde', 'nause', 'humide', 'gras'],
    vide_qi_poumon: ['toux', 'souffle', 'voix', 'transpire', 'rhume', 'poumon'],
    vide_yin_poumon: ['toux seche', 'enroue', 'gorge seche'],
    invasion_vent_froid: ['grippe', 'rhume', 'frisson', 'fievre', 'nuque'],
    stagnation_sang_foie_uterin: ['douleur', 'menstr', 'caillots', 'fibrome', 'endometrios', 'fixe'],
    mucosites_chaleur: ['expectora', 'mucus', 'jaune', 'fievre', 'toux'],
    vide_qi_sang_general: ['fatigue', 'paleur', 'palpit', 'essouf', 'vertiges'],
    hypertension_vide_yin: ['hypertens', 'cephale', 'vertige', 'tete'],
    constipation_souffles: ['constip', 'stress', 'ballonn', 'cote'],
    diarrhee_bois_terre: ['diarrhee', 'stress', 'gargoui', 'tension'],
    chaleur_humidite_foyer_moyen: ['lourd', 'abdomen', 'jaune', 'nausse', 'chaleur'],
    vide_yang_estomac: ['estomac', 'epigastre', 'vomit', 'matin', 'froid', 'digestion', 'nausse', 'rein yang'],
    stagnation_qi_estomac: ['estomac', 'epigastre', 'eructation', 'reflux', 'ballonne', 'aerophagie', 'barriere'],
    chaleur_estomac: ['polyphagie', 'faim', 'gencive', 'aphtes', 'soif', 'constip', 'haleine'],
    stagnation_vb_indecision: ['indecision', 'timide', 'cauchemar', 'vesicule', 'acide urique', 'decision', 'palpitat'],
    feu_vb: ['migraine', 'vertige', 'oreille', 'colere', 'biliaire', 'amertume', 'vesicule'],
    vide_mc_troubles_emotionnels: ['emotion', 'sentimental', 'palpitat', 'oppression', 'thorax', 'anxiet', 'instabilit'],
  };

  const scores: Record<string, number> = {};
  for (const [id, kws] of Object.entries(keywords)) {
    scores[id] = kws.filter(kw => caseTextLower.includes(kw)).length;
  }

  return SYNDROMES
    .filter(s => (scores[s.id] ?? 0) > 0)
    .sort((a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0))
    .slice(0, 6);
}

// ─── Formatage d'un syndrome pour le prompt ──────────────────────────────────

function formatSyndromeForPrompt(s: SyndromeClinique): string {
  const lines: string[] = [];
  lines.push(`\n┌─ ${s.nom.toUpperCase()} (${s.element ?? 'multiple'} — ${s.organe} — ${s.polarite} — ${s.nature}) ─`);
  if (s.pathogenie) lines.push(`│ Mécanisme : ${s.pathogenie}`);
  lines.push(`│ Signes certains : ${s.signesCertains.join(' / ')}`);
  lines.push(`│ Signes probables : ${s.signesProbables.join(' / ')}`);
  if (s.signesAccessoires?.length) lines.push(`│ Accessoires : ${s.signesAccessoires.join(' / ')}`);
  lines.push(`│ Pouls : ${s.pouls}`);
  lines.push(`│ Langue : ${s.langue}`);
  if (s.terrainEmotionnel) lines.push(`│ Terrain psychique : ${s.terrainEmotionnel}`);
  if (s.terrainConstitutionnel) lines.push(`│ Terrain constitutionnel : ${s.terrainConstitutionnel}`);
  if (s.pointsFondamentaux.length > 0) {
    lines.push(`│ Points fondamentaux :`);
    s.pointsFondamentaux.forEach(p => {
      lines.push(`│   ${p.code} (${p.technique}) — ${p.action}${p.justificationIeatc ? ` [IEATC: ${p.justificationIeatc}]` : ''}`);
    });
  }
  if (s.distinctions.length > 0) {
    lines.push(`│ Distinguer de :`);
    s.distinctions.forEach(d => lines.push(`│   ≠ ${d.avec} : ${d.difference}`));
  }
  if (s.koVigilance) lines.push(`│ Ko-vigilance : ${s.koVigilance}`);
  if (s.progressionPossible) lines.push(`│ Évolution possible : ${s.progressionPossible}`);
  if (s.remarqueIeatc) lines.push(`│ Note IEATC : ${s.remarqueIeatc}`);
  lines.push(`└${'─'.repeat(60)}`);
  return lines.join('\n');
}

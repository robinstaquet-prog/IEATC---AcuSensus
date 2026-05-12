import type { Term } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// LEXIQUE DES TERMES IEATC
// Source : Corpus IEATC — LEXIQUE/lexique_termes_ieatc.yaml
// Terminologie propre à l'école IEATC, avec correspondances MTC classique
// ─────────────────────────────────────────────────────────────────────────────

export const LEXIQUE: Term[] = [
  // ── Énergies fondamentales ─────────────────────────────────────────────────
  {
    id: 'iong',
    terme: 'Iong',
    definition: "Énergie nutritive. Circule à l'intérieur des méridiens. Nourrit et relie les structures internes. INDISSOCIABLE du Sang : Iong = énergie du Sang, Sang = matérialité de l'Iong. Deux faces d'une même réalité. Contient les Tsing de TOUS les Tsang — la Rate les trie, les Fu couplés les captent pour les transmettre à leur Tsang.",
    synonymes: ['Ying Qi', 'Énergie nutritive'],
    correspondanceMtc: 'Ying Qi',
    categorie: 'energie',
    sourceIeatc: 'CP3-t1',
    voirAussi: ['oe', 'tsing', 'sang'],
    alerteHomonymie: "Iong désigne AUSSI le 2ème point des méridiens (Ying-Spring point). Toujours préciser le contexte : Iong (énergie) ou Iong (point de méridien).",
    importance: 'fondamental',
  },
  {
    id: 'oe',
    terme: 'Oé',
    definition: "Énergie défensive et adaptative. Circule en surface. Protège les échanges avec l'extérieur. Amène chaleur et lubrification à la surface, aux articulations superficielles, aux muscles superficiels. Distincte des Grands Méridiens qui assurent aussi une protection mais SANS notion d'énergie Oé.",
    synonymes: ['Wei Qi', 'Énergie défensive'],
    correspondanceMtc: 'Wei Qi',
    categorie: 'energie',
    sourceIeatc: 'CP3-t1-p22',
    voirAussi: ['iong', 'tt'],
    importance: 'fondamental',
  },
  {
    id: 'tsing',
    terme: 'Tsing (Ancestrale)',
    definition: "Énergie ancestrale, héréditaire. Stockée principalement dans le Rein. Distribuée par le Tchrong Mo à chaque cellule. Fondement de la vie et de la constitution. On ne peut qu'en économiser l'usage — elle ne se reconstitue pas en intégralité.",
    synonymes: ['Ancestrale', 'Jing', 'Essence'],
    correspondanceMtc: 'Jing',
    categorie: 'energie',
    sourceIeatc: 'CP3-t1-p17',
    voirAussi: ['iong', 'rein', 'mingmen'],
    importance: 'fondamental',
  },
  {
    id: 'tchi',
    terme: 'Tchi',
    definition: "Le Qi au sens général — Souffle, énergie vitale dans sa manifestation dynamique. En IEATC, le Tchi se décline en de nombreuses formes (Iong, Oé, Yuan, Zong...) selon sa localisation et sa fonction. C'est le mouvement lui-même, la transformation en acte.",
    synonymes: ['Qi', 'Chi', 'Souffle', 'Énergie vitale'],
    correspondanceMtc: 'Qi',
    categorie: 'energie',
    importance: 'fondamental',
  },

  // ── Méridiens et voies ─────────────────────────────────────────────────────
  {
    id: 'tt',
    terme: 'TT (Tching Tcheng)',
    definition: "Méridien principal. Voie de circulation de l'énergie Iong dans les téguments. Les 12 TT constituent le système de base de la circulation énergétique. Chaque TT est associé à un organe Tsang ou viscère Fu.",
    synonymes: ['Méridien principal', 'Jing Mai', 'Tching Tcheng'],
    correspondanceMtc: 'Jing (méridien principal)',
    categorie: 'concept_fondamental',
    voirAussi: ['iong', 'tsang_fu'],
    importance: 'fondamental',
  },

  // ── Organes (Tsang/Fu) ─────────────────────────────────────────────────────
  {
    id: 'tsang_fu',
    terme: 'Tsang / Fu',
    definition: "Les Tsang (Zang) sont les organes Yin pleins : Cœur, Foie, Rate, Poumon, Rein, Maître du Cœur. Les Fu (Fu) sont les viscères Yang creux : Intestin Grêle, Vésicule Biliaire, Estomac, Gros Intestin, Vessie, Triple Réchauffeur. Chaque Tsang est couplé à un Fu de même élément.",
    synonymes: ['Zang Fu', 'Organes et viscères'],
    correspondanceMtc: 'Zang Fu',
    categorie: 'concept_fondamental',
    importance: 'fondamental',
  },
  {
    id: 'mingmen',
    terme: 'Ming Men (Porte de la Vie)',
    definition: "Le Feu de la Porte de la Vie — situé entre les deux Reins (point VG4 au dos). Centre vital Yang profond. Gouverne le Yang constitutionnel, la chaleur interne, la puissance reproductive, l'énergie de fond du Réchauffeur Inférieur. Son insuffisance entraîne le vide de Yang du Rein avec tous les signes de froid interne.",
    synonymes: ['Feu du Rein', 'Feu originel', 'Porte de la Vie'],
    correspondanceMtc: 'Ming Men',
    categorie: 'concept_fondamental',
    sourceIeatc: 'PV-3F-t1',
    voirAussi: ['tsing', 'rein_organe', 'trois_foyers'],
    importance: 'fondamental',
  },

  // ── Grilles de lecture ─────────────────────────────────────────────────────
  {
    id: 'polarite_yy',
    terme: 'Polarité Yin/Yang',
    definition: "Premier acte diagnostique en IEATC — TOUJOURS. La polarité détermine si le trouble est Yin (vide, froid, interne, repos aggrave) ou Yang (plein, chaleur, externe, mouvement aggrave). Elle oriente TOUT le traitement. Un symptôme Yin ne se traite pas comme un symptôme Yang.",
    synonymes: ['Bilan Yin/Yang', 'Polarité globale'],
    correspondanceMtc: 'Ba Gang — Yin/Yang',
    categorie: 'grille',
    sourceIeatc: 'PIV-YY-t4',
    voirAussi: ['vide_plenitude', 'froid_chaleur'],
    importance: 'fondamental',
  },
  {
    id: 'vide_plenitude',
    terme: 'Vide / Plénitude (Xu/Shi)',
    definition: "L'une des 8 règles diagnostiques. Le Vide (Xu) indique une insuffisance fonctionnelle ou substantielle. La Plénitude (Shi) indique un excès ou une obstruction. La technique d'aiguille est inversée : tonifier dans le vide, disperser dans la plénitude. Erreur = aggravation.",
    synonymes: ['Xu Shi', 'Déficience/Excès', 'Vide/Excès'],
    correspondanceMtc: 'Xu Shi',
    categorie: 'grille',
    sourceIeatc: 'PIV-YY-t4',
    voirAussi: ['polarite_yy', 'froid_chaleur'],
    importance: 'fondamental',
  },
  {
    id: 'froid_chaleur',
    terme: 'Froid / Chaleur (Han/Re)',
    definition: "L'une des 8 règles diagnostiques. Le Froid ralentit, contracte, épaissit les liquides. La Chaleur accélère, dilate, assèche. Important : il existe des froids internes et des chaleurs du vide — ne pas confondre avec les facteurs pathogènes externes de même nom.",
    synonymes: ['Han Re', 'Froid-Chaleur'],
    correspondanceMtc: 'Han Re',
    categorie: 'grille',
    sourceIeatc: 'PIV-YY-t4',
    voirAussi: ['polarite_yy', 'vide_plenitude'],
    importance: 'fondamental',
  },
  {
    id: 'shao_yang',
    terme: 'Chao Yang',
    definition: "Axe de la vie de relation — Triple Réchauffeur et Vésicule Biliaire. Gère les échanges entre l'intérieur et l'extérieur, la circulation dans les demi-surfaces. Joue un rôle dans l'oreille (TR et VB passent par l'oreille). Très sollicité dans les états de tension et de stress.",
    synonymes: ['Chao Yang de pied (VB)', 'Chao Yang de main (TR)'],
    correspondanceMtc: 'Shao Yang',
    categorie: 'concept_fondamental',
    voirAussi: ['tt', 'tsang_fu'],
    importance: 'important',
  },
  {
    id: 'yang_ming',
    terme: 'Yang Ming',
    definition: "Axe de descente Yang — Estomac et Gros Intestin. Gère le mouvement de descente du Yang, la digestion, l'assimilation. Quand le Yang Ming est bloqué, les Souffles ne descendent plus et les troubles digestifs s'accumulent au Foyer Moyen.",
    synonymes: ['Yang Ming de pied (E)', 'Yang Ming de main (GI)'],
    correspondanceMtc: 'Yang Ming',
    categorie: 'concept_fondamental',
    voirAussi: ['tt', 'trois_foyers'],
    importance: 'important',
  },

  // ── Pouls ──────────────────────────────────────────────────────────────────
  {
    id: 'pouls_corde_arc',
    terme: 'Pouls Corde-arc (Xian)',
    definition: "Qualité de pouls : tendu, résistant sous le doigt, comme une corde de guitare ou un arc bandé. Signe classique du Yang du Foie montant, de la tension, du Bois en excès. Souvent associé à l'hypertension, aux migraines temporales, à l'anxiété de tension.",
    synonymes: ['Pouls tendu', 'Xian Mai', 'Pouls en corde'],
    correspondanceMtc: 'Xian Mai',
    categorie: 'concept_fondamental',
    sourceIeatc: 'PIV-YY-t4',
    voirAussi: ['polarite_yy'],
    importance: 'important',
  },

  // ── Points spéciaux ────────────────────────────────────────────────────────
  {
    id: 'points_shu_dos',
    terme: 'Points Shu du Dos (Bei Shu)',
    definition: "Points de transport des organes sur le méridien Vessie au dos. Chaque Tsang et Fu possède son point Shu dorsal qui permet d'agir directement sur l'organe. Utilisés en tonification (moxa possible) ou dispersion selon la polarité.",
    synonymes: ['Points Iou', 'Points Shu dorsaux', 'Bei Shu', 'Points de consentement'],
    correspondanceMtc: 'Bei Shu — points Shu dorsaux',
    categorie: 'point_type',
    importance: 'important',
  },
  {
    id: 'points_mo',
    terme: 'Points Mo (Mu/Alarme)',
    definition: "Points d'alarme des organes, situés en face antérieure du corps sur les vaisseaux médians (JM/VC) ou sur les méridiens proches. Réagissent en cas de trouble de leur organe. Utilisés en complément des points Shu dos.",
    synonymes: ['Points Mu', 'Points alarme', 'Points de rassemblement', 'Mo'],
    correspondanceMtc: 'Mu — points alarme',
    categorie: 'point_type',
    importance: 'important',
  },
  {
    id: 'feu_du_vide',
    terme: 'Yang apparent / Feu apparent',
    definition: "En IEATC : chaleur interne qui provient NON d'un excès mais d'un vide de Yin. Quand le Yin est insuffisant, le Yang n'est plus ancré et monte librement — produisant une chaleur apparente. Signes : chaleur vespérale, sueurs nocturnes, langue rouge sans enduit, bourdonnements. Se traite en nourrissant le Yin — JAMAIS en dispersant la chaleur.",
    synonymes: ['Chaleur apparente', 'Feu apparent', 'Yang non ancré'],
    correspondanceMtc: 'Xu Huo (Feu du vide)',
    categorie: 'pathologie',
    sourceIeatc: 'PVI-t3',
    voirAussi: ['vide_plenitude', 'tsing', 'mingmen'],
    importance: 'fondamental',
  },
  {
    id: 'protocole_yy',
    terme: 'Protocole Yin/Yang (4 étapes)',
    definition: "Protocole de traitement IEATC en 4 temps : 1. YY (équilibre Yin/Yang général) — 2. Cinq Éléments (si pertinent) — 3. Vide/Plénitude — 4. Froid/Chaleur. L'ordre est obligatoire : on ne traite pas le local (Froid/Chaleur) avant d'avoir équilibré le général (YY). Sinon l'effet est absorbé par le déséquilibre profond.",
    synonymes: ['Protocole 4 étapes', 'Protocole CP I'],
    correspondanceMtc: 'Non applicable — spécifique IEATC',
    categorie: 'technique',
    sourceIeatc: 'PIV-YY-t5-CP1-partie2',
    importance: 'fondamental',
  },
];

export const getTermById = (id: string): Term | undefined =>
  LEXIQUE.find((t) => t.id === id);

export const getTermesByCategorie = (categorie: string): Term[] =>
  LEXIQUE.filter((t) => t.categorie === categorie);

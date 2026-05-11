// ─── Grilles de lecture IEATC ─────────────────────────────────────────────────
// Note terminologique : "grille" est le terme IEATC propre (pas "cadre" ou "framework")

export type ReadingGridId =
  | 'yin_yang'
  | 'trois_foyers'
  | 'cinq_elements'
  | 'zang_fu'
  | 'meridiens'
  | 'quatre_energies'
  | 'merveilleux_vaisseaux'
  | 'grands_meridiens_climats';

export interface ReadingGrid {
  id: ReadingGridId;
  nom: string;
  nomCourt: string;
  description: string;
  ordre: number;         // YY = 1, toujours en premier
  colorClass: string;
  textClass: string;
  borderClass: string;
  dotClass: string;
}

// ─── Polarité ─────────────────────────────────────────────────────────────────

export type Polarite = 'yin' | 'yang' | 'mixte';

// ─── Foyer (Trois Réchauffeurs) ───────────────────────────────────────────────

export type Foyer = 'superieur' | 'moyen' | 'inferieur' | 'multiple' | 'non_applicable';

// ─── Statut de cas ────────────────────────────────────────────────────────────

export type StatutCas = 'brouillon' | 'en_validation' | 'publie' | 'archive';

// ─── Niveau de complexité ─────────────────────────────────────────────────────

export type NiveauComplexite = 1 | 2 | 3;

// ─── Pouls structuré ─────────────────────────────────────────────────────────
// La prise de pouls est l'acte CENTRAL en IEATC — traitement spécifique

export type PositionPouls =
  | 'foyer_superieur_gauche'   // 9C — Cœur
  | 'foyer_moyen_gauche'       // méridiens médians gauches
  | 'foyer_inferieur_gauche'   // Rein gauche (Yang)
  | 'foyer_superieur_droit'    // 9P — Poumon
  | 'foyer_moyen_droit'        // méridiens médians droits
  | 'foyer_inferieur_droit'    // Rein droit (Yin)
  | 'global_superficiel'
  | 'global_profond'
  | 'specifique';              // position nommée libre

export type QualitePouls =
  | 'vide'
  | 'plein'
  | 'faible'
  | 'vide_plus'
  | 'plein_plus'
  | 'large'
  | 'etroit'
  | 'mou'
  | 'dur'
  | 'corde_arc'
  | 'rapide'
  | 'lent'
  | 'superficiel'
  | 'profond'
  | 'normal'
  | 'absent';

export interface LecturePouls {
  position: PositionPouls;
  positionLabel?: string;      // label libre si position = 'specifique'
  qualites: QualitePouls[];
  interpretation: string;      // interprétation clinique de cette lecture
}

export interface PrisePouls {
  condition: string;           // ex: "patient allongé, décubitus dorsal"
  lectures: LecturePouls[];
  synthese?: string;           // synthèse globale de la prise de pouls
}

// ─── Point d'acupuncture ──────────────────────────────────────────────────────
// Trois éléments TOUJOURS affichés ensemble : code + nom + technique

export type TechniquePoint =
  | 'tonification'
  | 'dispersion'
  | 'neutre'
  | 'moxa'
  | 'moxa_tonification'
  | 'moxa_dispersion'
  | 'harmonisation'
  | 'tonification_chauffee'
  | 'dispersion_puis_tonification';

// Action pédagogique (plus fine que TechniquePoint côté saisie utilisateur)
export type PointAction =
  | 'tonification'
  | 'dispersion'
  | 'harmonisation'
  | 'tonification_chauffee'
  | 'dispersion_puis_tonification'
  | 'gros_sel';           // spécial 8JM uniquement

export interface PointUsage {
  code: string;                // ex: "3R", "33VB", "4GI", "62V", "30VB"
  nomIeatc?: string;           // nom IEATC (si connu)
  technique: TechniquePoint;
  action?: PointAction;        // action normalisée (utilisée par les participations)
  justification?: string;      // pourquoi ce point dans ce traitement
  ordre?: number;
}

// ─── Élément wuxing + état de palpation abdominale ───────────────────────────
export type ElementWuxing = 'bois' | 'feu' | 'terre' | 'metal' | 'eau';
export type EtatPalpationAbdo = 'bloque' | 'douloureux' | 'vide' | 'plein' | 'chaud' | 'froid';

export interface PalpationAbdoEntry {
  element: ElementWuxing;
  etats: EtatPalpationAbdo[];
}

// ─── Examen clinique supplémentaire libre ────────────────────────────────────
export interface ExamenSupplementaire {
  titre: string;
  texte: string;
  annotations: Annotation[];
}

// ─── Interrogatoire structuré ─────────────────────────────────────────────────

export interface ItemInterrogatoire {
  cle: string;                 // ex: "douleur", "preferences", "antecedents"
  valeur: string;
}

// ─── Contenu clinique du cas ──────────────────────────────────────────────────

export interface CaseContent {
  motif: string;               // obligatoire
  interrogatoire: ItemInterrogatoire[];  // obligatoire — structuré
  prisePouls: PrisePouls;      // obligatoire — central en IEATC
  observation?: string;        // optionnel
  palpation?: string;          // optionnel
  contexteVie?: string;        // optionnel
  antecedents?: string;        // optionnel
  langueTexte?: string;           // examen de la langue (texte libre)
  examensTexte?: string;          // examens complémentaires (texte libre)
  palpationAbdo?: PalpationAbdoEntry[];  // palpation abdominale 5 éléments
  publicationMode?: PublicationMode;     // 'public' | 'anonyme'
  auteurNom?: string;             // nom affiché si publication non anonyme
}

// ─── Annotation (plage de caractères sur un texte) ───────────────────────────
// Utilisée pour commenter une portion d'interrogatoire ou de prise de pouls.
// Les annotations peuvent se chevaucher (plusieurs commentaires sur la même zone).

export interface Annotation {
  id: string;
  start: number;     // index du premier caractère annoté
  length: number;    // nombre de caractères
  comment: string;   // commentaire libre
  auteurId?: string;
  createdAt?: string;
}

// ─── Mode de publication d'une participation ─────────────────────────────────

export type PublicationMode = 'public' | 'anonyme';

// ─── Statut du praticien (définit le ratio de poids des votes) ───────────────
// Le ratio sert à pondérer le poids d'un vote dans le calcul de la "valeur"
// d'une participation : value = 1.0 + Σ(ratio × 0.1)

export type StatutPraticien =
  | 'etudiant'               // Étudiant — ratio 1
  | 'etudiant_4e_annee'      // Étudiant 4e année — ratio 1.5
  | 'jeune_praticien'        // Jeune praticien — ratio 2.5
  | 'praticien_experimente'  // Praticien expérimenté — ratio 5
  | 'expert';                // Expert — ratio 10

export const RATIO_STATUT: Record<StatutPraticien, number> = {
  etudiant: 1,
  etudiant_4e_annee: 1.5,
  jeune_praticien: 2.5,
  praticien_experimente: 5,
  expert: 10,
};

export const LABEL_STATUT: Record<StatutPraticien, string> = {
  etudiant: 'Étudiant',
  etudiant_4e_annee: 'Étudiant 4e année',
  jeune_praticien: 'Jeune praticien',
  praticien_experimente: 'Praticien expérimenté',
  expert: 'Expert',
};

// ─── Vote sur une participation ──────────────────────────────────────────────
// Un vote peut porter sur un élément précis (ex: un point, une catégorie)
// ou sur la participation entière (2 points).

export type VoteCible =
  | 'participation'   // vote sur la participation entière (= 2 pts)
  | 'element';        // vote sur un élément précis (= 1 pt)

export interface Vote {
  id: string;
  voterId: string;
  voterStatut: StatutPraticien;
  cible: VoteCible;
  elementKey?: string;     // identifiant de l'élément (ex: "point:3R", "categorie:0")
  createdAt: string;
}

// ─── Deuxième séance (optionnelle) ────────────────────────────────────────────

export interface DeuxiemeSeance {
  commentaire: string;
  strategie: string;
  pointsProposer: Partial<PointUsage>[];
}

// ─── Analyse clinique ─────────────────────────────────────────────────────────
// NOTE : dans le nouveau modèle, toute analyse attachée à un cas est en réalité
// une ParticipationUtilisateur (d'un expert, d'un étudiant…). Le type est conservé
// sous le nom ClinicalAnalysis pour compatibilité — il constitue l'entité unifiée.

export type TypeAnalyse = 'officielle' | 'variante' | 'ia_generee';
export type NiveauConfiance = 'standard' | 'expert' | 'a_valider';
export type SourceType = 'humaine' | 'ia' | 'mixte' | 'editoriale';

export interface ClinicalAnalysis {
  id: string;
  caseId: string;
  type: TypeAnalyse;
  grillePrincipale: ReadingGridId;
  grillesSecondaires?: ReadingGridId[];
  polarite: Polarite;
  localisationFoyer?: Foyer;
  raisonnement: string;                   // le cœur — texte long riche
  categoriesDiagnostiques: string[];      // libellés IEATC précis
  strategieTherapeutique?: string;
  traitementPropose?: string;
  pointsUtilises: PointUsage[];
  niveauConfiance: NiveauConfiance;
  sourceType: SourceType;
  auteurId?: string;
  version: number;
  enseignementCle?: string;               // leçon pédagogique du cas
  variantes?: string;                     // autres lectures possibles
  iaMetadata?: Record<string, unknown>;   // réservé V2 IA

  // ─── Nouveaux champs (modèle unifié de participation) ───────────────────────
  auteurPseudo?: string;                  // pseudo affiché (ou "Anonyme")
  auteurStatut?: StatutPraticien;         // statut du contributeur
  role?: 'expert' | 'praticien' | 'etudiant'; // rôle éditorial (expert = liseré ambre/or)
  publicationMode?: PublicationMode;       // 'public' | 'anonyme'
  annotationsInterrogatoire?: Annotation[]; // annotations sur le texte d'interrogatoire
  annotationsPouls?: Annotation[];          // annotations sur la prise de pouls
  langueTexte?: string;
  annotationsLangue?: Annotation[];
  examensSupp?: ExamenSupplementaire[];
  palpationAbdo?: PalpationAbdoEntry[];
  bilanEnergetique?: string;               // texte libre, normalisé (≤ 600 char)
  strategie?: string;                      // stratégie thérapeutique (points numérotés)
  pointsProposer?: Partial<PointUsage>[];  // points proposés (modèle unifié participation)
  commentaireLibre?: string;
  deuxiemeSeance?: DeuxiemeSeance;            // deuxième séance optionnelle
  votes?: Vote[];                           // liste des votes reçus
  votePoints?: number;                      // total accumulé (cache)
  valeur?: number;                          // 1.0 + Σ(ratio × 0.1)
  difficultéEstimee?: DifficulteEstimee;   // évaluation subjective de la difficulté du cas
}

// Alias explicite : dans le nouveau modèle, une "analyse" EST une participation.
export type CaseParticipation = ClinicalAnalysis;

// ─── Cas clinique ─────────────────────────────────────────────────────────────

export interface ClinicalCase {
  id: string;
  slug: string;
  titre: string;               // court, clinique — ex: "Florence, 28 ans — genou droit"
  statut: StatutCas;
  niveauComplexite: NiveauComplexite;
  age?: number;
  trancheAge?: 'enfant' | 'adolescent' | 'jeune_adulte' | 'adulte' | 'senior';
  sexe?: 'masculin' | 'feminin' | 'non_precise';
  dateCreation: string;
  datePublication?: string;
  auteurId?: string;
  casComplet: boolean;         // tous champs obligatoires présents
  exemplaire: boolean;         // marqué par un éditeur
  qualifieApprentissage?: boolean; // atteint le seuil communautaire (valeur >= 50)
  grillePrincipale: ReadingGridId;
  tags: string[];
  content: CaseContent;
  analyses: ClinicalAnalysis[];
  viewCount: number;
}

// ─── Difficulté estimée d'un cas ──────────────────────────────────────────────
// Évaluation subjective par le participant — optionnelle, non bloquante.
export type DifficulteEstimee =
  | 'niveau_1ere'
  | 'niveau_intermediaire'
  | 'niveau_4e'
  | 'niveau_difficile';

export const DIFFICULTE_LABELS: Record<DifficulteEstimee, string> = {
  niveau_1ere: '1ère année',
  niveau_intermediaire: 'Intermédiaire',
  niveau_4e: '4ème année',
  niveau_difficile: 'Avancé',
};

// ─── Participation utilisateur ────────────────────────────────────────────────
// PRIVÉE — jamais exposée à d'autres utilisateurs
// Stockée dans Supabase avec RLS strict

export interface UserParticipation {
  id: string;
  userId: string;
  caseId: string;
  grilleChoisie?: ReadingGridId;
  grilleSecondaire?: ReadingGridId;  // au max une grille secondaire (optionnelle)
  polariteIdentifiee?: Polarite;
  localisationIdentifiee?: Foyer;
  categoriesRetenues: string[];
  pointsProposer: Partial<PointUsage>[];
  commentaireLibre?: string;
  revelationFaite: boolean;    // a-t-il vu l'analyse officielle
  createdAt: string;
  updatedAt: string;

  // ─── Nouveau modèle : annotations, bilan, stratégie ─────────────────────────
  annotationsInterrogatoire?: Annotation[];
  annotationsPouls?: Annotation[];
  langueTexte?: string;                       // saisie libre de l'examen de langue
  annotationsLangue?: Annotation[];
  examensSupp?: ExamenSupplementaire[];       // max 3
  palpationAbdo?: PalpationAbdoEntry[];
  bilanEnergetique?: string;         // texte libre, ≤ 600 caractères
  strategie?: string;                // points numérotés
  deuxiemeSeance?: DeuxiemeSeance;    // deuxième séance optionnelle
  // ─── Publication et vote ──────────────────────────────────────────────────
  publicationMode?: PublicationMode; // 'public' | 'anonyme'
  publiee?: boolean;                 // soumise et visible
  votes?: Vote[];
  votePoints?: number;
  valeur?: number;                   // 1.0 + Σ(ratio × 0.1)
  difficultéEstimee?: DifficulteEstimee; // évaluation subjective de la difficulté du cas
}

// ─── Utilisateur ─────────────────────────────────────────────────────────────

export type RoleUtilisateur = 'visiteur' | 'etudiant' | 'contributeur' | 'editeur' | 'admin';
export type NiveauProfil = 'debutant' | 'intermediaire' | 'confirme' | 'expert';

export interface User {
  id: string;
  email: string;
  pseudo: string;
  role: RoleUtilisateur;
  niveauProfil: NiveauProfil;
  dateInscription: string;

  // ─── Nouveau modèle : statut, ratio, points de vote ─────────────────────────
  statut?: StatutPraticien;   // définit le ratio dans le calcul de valeur
  votePoints?: number;        // solde affiché dans la navbar

  // ─── Profil étendu ──────────────────────────────────────────────────────────
  nom?: string;
  prenom?: string;
  anneePromotion?: number;     // → "Volée 2023"
  lieu?: string;
  photoUrl?: string;
  emailPublic?: string;
  telephone?: string;
}

// ─── Terme du Lexique IEATC ───────────────────────────────────────────────────

export type CategorieTerm =
  | 'grille'
  | 'organe_tsang'
  | 'organe_fu'
  | 'energie'
  | 'point_type'
  | 'technique'
  | 'pathologie'
  | 'physiologie'
  | 'concept_fondamental';

export interface Term {
  id: string;
  terme: string;
  definition: string;
  synonymes: string[];
  correspondanceMtc?: string;
  categorie: CategorieTerm;
  sourceIeatc?: string;
  voirAussi?: string[];
  alerteHomonymie?: string;
  importance: 'fondamental' | 'important' | 'complementaire';
}

// ─── Statistiques globales ────────────────────────────────────────────────────

export interface FrequencyEntry {
  id: string;
  count: number;
  label?: string;
}

export interface GlobalStats {
  totalCas: number;
  casPublies: number;
  casExemplaires: number;
  totalAnalyses: number;
  pointsDistincts: number;            // nombre de codes de points uniques référencés
  topPoints: FrequencyEntry[];
  topGrilles: FrequencyEntry[];
  topFoyers: FrequencyEntry[];        // distribution localisationFoyer (Sup/Moy/Inf)
  topTechniques: FrequencyEntry[];    // distribution des techniques de traitement
  topFamillesDiag: FrequencyEntry[];  // familles diag normalisées (couche 1)
  topSyndromes: FrequencyEntry[];     // syndromes nommés spécifiques (couche 2)
  topOrganes: FrequencyEntry[];       // organes/localisations (couche 3)
  topStrategies: FrequencyEntry[];    // stratégies thérapeutiques (couche 4)
  topPathologies: FrequencyEntry[];   // motifs de consultation normalisés (couche 5)
  repartitionComplexite: Record<NiveauComplexite, number>;
  repartitionSexe: Record<string, number>;
}

// ─── Types Zod (validation) ───────────────────────────────────────────────────
// Définis dans lib/validators.ts

// ─── Types Supabase (DB) ──────────────────────────────────────────────────────
// Définis dans lib/supabase.ts — les types DB correspondent à ces entités
// La couche de données (data/) abstrait la source (locale ou Supabase)

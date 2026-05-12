import type { ClinicalCase } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// BASE DE CAS CLINIQUES IEATC
// Sources : Corpus IEATC (PIV YY tome 5, PVI EEA tome 3)
// Données cliniques fidèles au corpus — noms/prénoms de démonstration
// ─────────────────────────────────────────────────────────────────────────────

export const CLINICAL_CASES: ClinicalCase[] = [

  // ───────────────────────────────────────────────────────────────────────────
  // CAS 1 — FLORENCE, 28 ANS — Genou droit
  // Source : PIV YY tome 5, CP I Partie 2 — Cas 1
  // Grille principale : Yin/Yang → Méridiens
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'cas-001',
    slug: 'florence-28-ans-genou-droit',
    titre: 'Florence, 28 ans — Genou droit craquant et douloureux',
    statut: 'publie',
    niveauComplexite: 2,
    age: 28,
    trancheAge: 'jeune_adulte',
    sexe: 'feminin',
    dateCreation: '2025-09-01',
    datePublication: '2025-09-15',
    casComplet: true,
    exemplaire: true,
    grillePrincipale: 'yin_yang',
    tags: ['genou', 'méridien VB', 'mononucléose', 'danse', 'Yin/Yang', 'séquelles'],
    viewCount: 312,
    content: {
      motif: "Genou droit qui craque et est douloureux depuis 2 mois.",
      interrogatoire: [
        { cle: 'douleur', valeur: "Craquement sonore à la marche uniquement — pas en sautant ni en courant. Amélioration quand la jambe est repliée (torsion légère)." },
        { cle: 'horaire', valeur: "Douleur la nuit au repos. Pas de gêne en marchant ni en dansant." },
        { cle: 'activite', valeur: "Danseuse classique et contemporaine — 6 à 10h de pratique par semaine, en 3 séances." },
        { cle: 'traumatisme', valeur: "Aucun traumatisme identifié." },
        { cle: 'preferences', valeur: "Aime la pluie. N'aime pas le ski. Aime la montagne." },
        { cle: 'antecedents', valeur: "Mononucléose avec atteinte hépatique il y a 7 ans. Fatiguée pendant 2 ans. Fatigabilité persistante depuis." },
      ],
      observation: "Aspect du genou strictement normal, identique à l'autre. Pas de gonflement visible.",
      palpation: "Nombreux ganglions le long du sterno-cléido-mastoïdien (trajets TR et VB). Température normale au genou. Aucun point douloureux à la pression locale.",
      prisePouls: {
        condition: "Patient allongé, bras détendu",
        lectures: [
          {
            position: 'foyer_inferieur_gauche',
            qualites: ['vide'],
            interpretation: "Vide de Yang au Foyer Inférieur gauche — insuffisance Yang générale.",
          },
          {
            position: 'foyer_moyen_droit',
            qualites: ['large', 'mou'],
            interpretation: "Pouls trop large et mou à droite en profond : Yin en excès avec vide de Yang.",
          },
          {
            position: 'specifique',
            positionLabel: '9P (Poumon en surface)',
            qualites: ['vide'],
            interpretation: "9P vide : énergie interne et bas du corps insuffisante.",
          },
          {
            position: 'foyer_moyen_gauche',
            qualites: ['plein'],
            interpretation: "Rate forte : Yin en excès au Foyer Moyen.",
          },
        ],
        synthese: "Tableau de vide de Yang général avec excès de Yin. Foyer moyen chargé. Le Yang ne monte pas correctement vers les membres inférieurs.",
      },
      contexteVie: "Pratique intense de la danse depuis l'adolescence. Antécédent de mononucléose ayant affaibli l'axe hépatique (Foie/Vésicule Biliaire).",
    },
    analyses: [
      {
        id: 'a001-yy-meridiens',
        caseId: 'cas-001',
        type: 'officielle',
        auteurPseudo: 'Dr Laurent Mercier',
        auteurStatut: 'expert',
        role: 'expert',
        publicationMode: 'public',
        votePoints: 42,
        valeur: 4.2,
        grillePrincipale: 'yin_yang',
        grillesSecondaires: ['meridiens'],
        polarite: 'yin',
        localisationFoyer: 'inferieur',
        raisonnement: `La douleur est Yin : elle apparaît au repos (la nuit), en inactivité, et disparaît lors du mouvement Yang (danse, marche active). Un problème Yin sur le système locomoteur oriente vers le méridien plutôt que l'articulation elle-même.

La Vésicule Biliaire apporte la tonicité à la capsule et aux ligaments externes du genou. La mononucléose — pathologie qui touche le méridien VB au niveau du cou (les ganglions palpés le confirment) — a consommé l'énergie du méridien VB sur de longues années.

Cinq ans de résistance, puis lâchage dans la région la plus sollicitée : le genou chez une danseuse. C'est un mécanisme de fatigue progressive du méridien.

**Contradiction diagnostique importante** : Florence aime la pluie alors qu'elle présente un tableau d'excès d'humidité. Cette contradiction entre le questionnaire et les pouls indique un blocage Yin/Yang — le patient "aime" ce qui lui manque ou ce qui compense. Ici, il faut d'abord lever le blocage du Foyer Moyen (Rate/Estomac) avant de traiter localement.

**Règle clinique** : Si les pouls révèlent un vide de Yang général, traiter d'abord le Yang général. Sinon, le Yang local apporté aux points du genou serait immédiatement absorbé par le vide général, sans effet durable.`,
        categoriesDiagnostiques: [
          "Vide de Yang général — Foyer Inférieur",
          "Excès de Yin — Foyer Moyen (Rate)",
          "Atteinte du méridien Vésicule Biliaire par séquelles de mononucléose",
          "Insuffisance Yang dans les membres inférieurs",
        ],
        strategieTherapeutique: "1. Traiter le YY général (équilibrer la base). 2. Abaisser l'excès de Yin au Foyer Moyen. 3. Apporter le Yang au méridien VB local. 4. Consolider le complexe ligamentaire du genou par les points VB distaux.",
        traitementPropose: `Traitement en quatre temps selon le protocole Yin/Yang :

**Étape 1 — Équilibrer le Yin/Yang général**
62V bilatéral (tonification) — équilibre les deux jambes et le bassin.

**Étape 2 — Yang général et méridien VB**
30VB bilatéral + moxas (tonification) — équilibre le bassin, amène le Yang vers les membres inférieurs.
41VB bilatéral (tonification) — problèmes polyarticulaires du train inférieur (indication danseuse).

**Étape 3 — Lever la stagnation locale**
31VB dispersion — libère la circulation de l'énergie VB depuis la hanche vers le genou.
33VB dispersion + 7F dispersion — synergie ligaments et drainage local.

**Étape 4 — Renforcer le complexe articulaire**
44VB tonification — renforce le complexe ligamentaire du genou.
9Rte dispersion — Yin du bas du corps, remontée des liquides, stabilité ligament latéral interne.
36E tonification + moxas — Yang local genou + état général post-mononucléose.`,
        pointsUtilises: [
          { code: '62V', nomIeatc: 'Yang Chiao Mo', technique: 'tonification', justification: "Équilibre les deux membres inférieurs et le bassin — YY général", ordre: 1 },
          { code: '30VB', technique: 'moxa_tonification', justification: "Équilibre bassin, amène Yang vers membres inférieurs", ordre: 2 },
          { code: '41VB', technique: 'tonification', justification: "Polyarticulaire train inférieur — indication danseuse", ordre: 3 },
          { code: '31VB', technique: 'dispersion', justification: "Libère la circulation VB hanche → genou", ordre: 4 },
          { code: '33VB', technique: 'dispersion', justification: "Synergie ligaments et drainage local genou", ordre: 5 },
          { code: '7F', technique: 'dispersion', justification: "Synergie avec 33VB pour liquides et ligaments", ordre: 6 },
          { code: '44VB', technique: 'tonification', justification: "Renforce complexe ligamentaire genou", ordre: 7 },
          { code: '9Rte', technique: 'dispersion', justification: "Yin bas du corps, remontée liquides, ligament latéral interne", ordre: 8 },
          { code: '36E', nomIeatc: 'Zu San Li', technique: 'moxa_tonification', justification: "Yang local genou + état général post-mononucléose", ordre: 9 },
        ],
        niveauConfiance: 'expert',
        sourceType: 'editoriale',
        version: 1,
        enseignementCle: "Si les pouls révèlent un vide de Yang général : traiter le Yang général D'ABORD. Le Yang local apporté serait sinon absorbé par le vide général. Toujours conseiller de poursuivre même après amélioration locale.",
        variantes: "Une lecture par les Cinq Éléments soulignerait le lien Bois (séquelles VB/F par mononucléose) et l'insuffisance du cycle Eau-Bois. La contradiction questionnaire/pouls peut être explorée via la grille constitutionnelle.",
      },

      // ── Participations variantes — 8 analyses (offsets calculés par script Node) ──
      // interrogatoireText exact (join '\n\n') — longueur 740 :
      //   start=0  "Genou droit qui craque..." (motif)
      //   start=57 "douleur : Craquement sonore..." → "Craquement sonore" à start=67
      //   start=199 "horaire : Douleur la nuit..." → "Douleur la nuit" à start=209
      //   start=275 "activite : Danseuse classique..." → "Danseuse classique" à start=286
      //   start=372 "traumatisme : Aucun..." → "Aucun traumatisme" à start=386
      //   start=416 "preferences : Aime la pluie..." → "Aime la pluie" à start=430
      //   start=483 "antecedents : Mononucléose..." → "Mononucléose avec atteinte" à start=497
      //   start=548 "Fatiguée pendant 2 ans" ; start=572 "Fatigabilité persistante"
      //   start=606 "Pratique intense de la danse..." (contexteVie)
      // poulsText exact (longueur 117) :
      //   start=0  "foyer_inferieur_gauche — vide" (len 29)
      //   start=30 "foyer_moyen_droit — large, mou" (len 30)
      //   start=61 "9P (Poumon en surface) — vide" (len 29)
      //   start=91 "foyer_moyen_gauche — plein" (len 26)

      // [E1] Expert 1 — grille Méridiens + Yin/Yang
      {
        id: 'p001-expert-isabelle',
        caseId: 'cas-001',
        auteurId: 'user-expert-isabelle',
        type: 'variante',
        auteurPseudo: 'Dr Isabelle Fontaine',
        auteurStatut: 'expert',
        role: 'expert',
        publicationMode: 'public',
        votePoints: 510,
        valeur: 51.0,
        grillePrincipale: 'meridiens',
        grillesSecondaires: ['yin_yang'],
        polarite: 'yin',
        localisationFoyer: 'inferieur',
        raisonnement: `Lecture par les méridiens avec ancrage Yin/Yang. Le trajet VB passe par le cou (ganglions palpables), traverse la hanche (30VB) et descend jusqu'au genou (34VB, 33VB). La mononucléose a créé une obstruction chronique au niveau du cou — blocage qui remonte à 7 ans.

La danseuse sollicite massivement le méridien VB par ses rotations de hanche et ses positions en turnout. Sur un méridien déjà fragilisé par les séquelles de mononucléose, cette sur-sollicitation a fini par produire un foyer de stagnation au genou.

Pourquoi la nuit ? La douleur nocturne au repos est un signal Yin pur : le Yang ne circule plus dans le méridien. La danse (activité Yang) mobilise suffisamment l'énergie pour masquer le problème. La nuit, le silence révèle la carence.`,
        categoriesDiagnostiques: [
          "Obstruction chronique du méridien VB — séquelles de mononucléose au cou",
          "Stagnation d'énergie Yang au genou — douleur Yin nocturne",
          "Vide de Yang au Foyer Inférieur confirmé par les pouls",
        ],
        strategieTherapeutique: `1. Libérer le méridien VB en amont (20VB, 21VB — cou/épaule).\n2. Faire descendre le Yang depuis la hanche (30VB, moxas).\n3. Renforcer le complexe genou (33VB, 34VB, 44VB).\n4. Consolidation générale Yin/Yang (62V, 36E).`,
        pointsUtilises: [
          { code: '20VB', technique: 'dispersion', justification: "Libère le méridien VB au cou — zone des séquelles ganglionnaires", ordre: 1 },
          { code: '21VB', technique: 'dispersion', justification: "Libère la descente du Yang dans le méridien VB", ordre: 2 },
          { code: '30VB', technique: 'moxa_tonification', justification: "Fait descendre le Yang depuis la hanche vers le genou", ordre: 3 },
          { code: '33VB', technique: 'dispersion', justification: "Stagnation locale au-dessus du genou", ordre: 4 },
          { code: '34VB', technique: 'tonification', justification: "Point d'influence des tendons — renforce le complexe ligamentaire", ordre: 5 },
          { code: '44VB', technique: 'tonification', justification: "Distal — renforce le méridien en profondeur", ordre: 6 },
          { code: '62V', technique: 'tonification', justification: "Yang Qiao Mo — équilibre Yin/Yang des membres inférieurs", ordre: 7 },
          { code: '36E', technique: 'moxa_tonification', justification: "Yang local genou et état général post-séquellaire", ordre: 8 },
        ],
        bilanEnergetique: `1. Vide de Yang Foyer Inférieur — pouls vide gauche, insuffisance Yang générale\n2. Méridien VB obstrué depuis le cou — séquelles mononucléose 7 ans\n3. Stagnation Yang locale au genou sur terrain de vide méridien\n4. Sur-sollicitation du trajet VB chez la danseuse (rotations, turnout)`,
        strategie: `1. Libérer le méridien VB en amont (cou : 20VB, 21VB)\n2. Faire descendre le Yang depuis la hanche (30VB moxas)\n3. Renforcer et débloquer localement au genou (33VB, 34VB, 44VB)`,
        pointsProposer: [
          { code: '20VB', action: 'dispersion', justification: "Libère le méridien VB au cou — zone des séquelles ganglionnaires" },
          { code: '30VB', action: 'tonification', justification: "Fait descendre le Yang depuis la hanche — moxa recommandé" },
          { code: '33VB', action: 'dispersion', justification: "Stagnation locale au-dessus du genou" },
          { code: '34VB', action: 'tonification', justification: "Point d'influence des tendons — renforce le complexe ligamentaire" },
          { code: '62V', action: 'tonification', justification: "Yang Qiao Mo — équilibre Yin/Yang des membres inférieurs" },
        ],
        // langueTexte : longueur 84 — "Langue pâle, légèrement humide..."
        // annotations : start=0 len=12 "Langue pâle,", start=14 len=21 "légèrement humide,"
        langueTexte: "Langue pâle, légèrement humide, corps légèrement bouffi aux bords, enduit blanc fin.",
        annotationsLangue: [
          { id: 'ann-p001e-isab-l1', start: 0, length: 12, comment: "Langue pâle = vide de Yang ou de Sang — confirme l'insuffisance Yang générale.", createdAt: '2026-01-10T09:15:00.000Z' },
          { id: 'ann-p001e-isab-l2', start: 13, length: 18, comment: "Légèrement humide = humidité résiduelle Rate — Foyer Moyen encore chargé.", createdAt: '2026-01-10T09:16:00.000Z' },
        ],
        commentaireLibre: "Cas emblématique de la lecture méridienne : la pathologie locale révèle un problème de trajet. Remonter toujours jusqu'à la cause (mononucléose, cou) avant d'agir localement.",
        // Offsets calculés exactement sur interrogatoireText (longueur 740) :
        // start=67 "Craquement sonore" (len 17)
        // start=209 "Douleur la nuit" (len 15)
        // start=497 "Mononucléose avec atteinte hépatique" (len 36)
        // start=430 "Aime la pluie" (len 13)
        annotationsInterrogatoire: [
          { id: 'ann-p001e-isab-i1', start: 67, length: 17, comment: "Craquement sonore à la marche = signe de stagnation méridienne VB — pas de lésion articulaire.", createdAt: '2026-01-10T09:00:00.000Z' },
          { id: 'ann-p001e-isab-i2', start: 209, length: 15, comment: "Douleur la nuit au repos = signal Yin pur → vide de Yang dans le méridien.", createdAt: '2026-01-10T09:05:00.000Z' },
          { id: 'ann-p001e-isab-i3', start: 497, length: 36, comment: "Mononucléose avec atteinte hépatique = cause primaire de l'obstruction du méridien VB au cou.", createdAt: '2026-01-10T09:10:00.000Z' },
          { id: 'ann-p001e-isab-i4', start: 430, length: 13, comment: "Aime la pluie = signe paradoxal — attraction pour ce qui aggrave l'humidité (Yin en excès).", createdAt: '2026-01-10T09:11:00.000Z' },
        ],
        // Offsets pouls : start=0 len=29 "foyer_inferieur_gauche — vide"
        // start=30 len=30 "foyer_moyen_droit — large, mou"
        annotationsPouls: [
          { id: 'ann-p001e-isab-p1', start: 0, length: 29, comment: "Vide au Foyer Inférieur gauche = Yang insuffisant dans le méridien VB — carence de fond.", createdAt: '2026-01-10T09:12:00.000Z' },
          { id: 'ann-p001e-isab-p2', start: 30, length: 30, comment: "Large et mou à droite = Rate en excès de Yin — confirme le blocage de descente vers les membres.", createdAt: '2026-01-10T09:13:00.000Z' },
        ],
        niveauConfiance: 'expert',
        sourceType: 'humaine',
        version: 1,
        votes: [],
        difficultéEstimee: 'niveau_difficile',
      },

      // [E2] Expert 2 — grille Zang/Fu + Cinq Éléments
      {
        id: 'p001-expert-jeanmarc',
        caseId: 'cas-001',
        auteurId: 'user-expert-jeanmarc',
        type: 'variante',
        auteurPseudo: 'Jean-Marc Pellerin',
        auteurStatut: 'expert',
        role: 'expert',
        publicationMode: 'public',
        grillePrincipale: 'zang_fu',
        grillesSecondaires: ['cinq_elements'],
        polarite: 'yin',
        localisationFoyer: 'moyen',
        raisonnement: `Lecture Zang/Fu avec angle 5 Éléments. La mononucléose a atteint le méridien VB (Bois Yang) et secondairement le Foie (Bois Yin). La fatigabilité persistante depuis 7 ans témoigne d'un vide du Zang Foie jamais traité.

Le genou est gouverné par les tendons — gouvernés par le Foie (Su Wen, chap. 44). Un Foie vide ne peut plus nourrir les tendons. La danseuse a compensé par la force musculaire, mais le vide tendineux finit par se révéler.

Le cycle 5 Éléments explique la chaîne : Eau faible → Bois mal nourri → Bois ne soutient plus la Terre → Rate en excès de Yin → blocage général.`,
        categoriesDiagnostiques: [
          "Vide du Zang Foie — séquelles de mononucléose non résolues",
          "Tendons insuffisamment nourris par le Foie — genou vulnérable",
          "Vide de Yin du Rein — Eau ne nourrit plus le Bois",
          "Rate en excès de Yin — Foyer Moyen bloqué (cycle Ko inversé)",
        ],
        strategieTherapeutique: `1. Nourrir l'Eau (Rein) — base du cycle Sheng.\n2. Tonifier le Foie (Zang) pour qu'il nourrisse les tendons.\n3. Lever l'excès de Yin de la Rate (Foyer Moyen).\n4. Traitement local secondaire.`,
        pointsUtilises: [
          { code: '3R', nomIeatc: 'Tai Xi', technique: 'tonification', justification: "Tonifie le Yin du Rein — base du cycle Eau→Bois", ordre: 1 },
          { code: '8F', technique: 'tonification', justification: "Source du Foie — nourrit le Foie et les tendons", ordre: 2 },
          { code: '6Rte', technique: 'dispersion', justification: "Disperse l'humidité de la Rate — Foyer Moyen", ordre: 3 },
          { code: '36E', technique: 'tonification', justification: "Soutient la Terre — stabilise après dispersion Rate", ordre: 4 },
          { code: '34VB', technique: 'tonification', justification: "Point hui des tendons — après avoir nourri la source", ordre: 5 },
        ],
        bilanEnergetique: `1. Vide du Zang Foie — séquelles mononucléose non résolues depuis 7 ans\n2. Vide de Yin du Rein — Eau ne nourrit plus le Bois (cycle Sheng insuffisant)\n3. Tendons non nourris par le Foie — genou vulnérable chez danseuse\n4. Rate en excès de Yin — Foyer Moyen bloqué (cycle Ko inversé)`,
        strategie: `1. Nourrir l'Eau (Rein) pour relancer le cycle Sheng vers le Bois\n2. Tonifier le Zang Foie pour qu'il nourrisse les tendons\n3. Disperser la Rate (Foyer Moyen) pour lever le blocage`,
        pointsProposer: [
          { code: '3R', action: 'tonification', justification: "Tai Xi — source Yin du Rein, nourrit le cycle Eau→Bois" },
          { code: '8F', action: 'tonification', justification: "Source du Foie — nourrit le Foie et gouverne les tendons" },
          { code: '6Rte', action: 'dispersion', justification: "Disperse l'humidité de la Rate — lève le blocage du Foyer Moyen" },
          { code: '36E', action: 'tonification', justification: "Soutient la Terre après dispersion — relance le Yang" },
          { code: '34VB', action: 'tonification', justification: "Point hui des tendons — action directe sur les ligaments" },
        ],
        // langueTexte : longueur 84 — "Langue rouge sur les bords (zones Foie-VB)..."
        // start=0 len=43 "Langue rouge sur les bords (zones Foie-VB),"
        // start=63 len=20 "Enduit gras mince."
        langueTexte: "Langue rouge sur les bords (zones Foie-VB), corps pâle au centre. Enduit gras mince.",
        annotationsLangue: [
          { id: 'ann-p001e-jm-l1', start: 0, length: 43, comment: "Bords rouges zones Foie-VB = Yang du Bois en légère plénitude — confirme le vide de Yin profond.", createdAt: '2026-01-11T10:00:00.000Z' },
          { id: 'ann-p001e-jm-l2', start: 65, length: 18, comment: "Enduit gras = humidité résiduelle Rate — Foyer Moyen encombré (cycle Ko brisé).", createdAt: '2026-01-11T10:02:00.000Z' },
        ],
        commentaireLibre: "La fatigabilité persistante depuis la mononucléose date l'insuffisance hépatique. On ne peut traiter le genou sans résoudre cette séquelle profonde — Eau→Bois→tendons.",
        // Offsets interrogatoireText :
        // start=0 len=56 (motif entier)
        // start=286 len=18 "Danseuse classique"
        // start=497 len=36 "Mononucléose avec atteinte hépatique"
        // start=572 len=24 "Fatigabilité persistante"
        annotationsInterrogatoire: [
          { id: 'ann-p001e-jm-i1', start: 0, length: 56, comment: "Motif de craquement = signe objectif de dysfonction méridienne VB — chercher la cause en amont.", createdAt: '2026-01-11T09:55:00.000Z' },
          { id: 'ann-p001e-jm-i2', start: 286, length: 18, comment: "Danseuse = sur-sollicitation méridien VB (rotations, turnout) → aggrave le vide Foie/tendons.", createdAt: '2026-01-11T09:57:00.000Z' },
          { id: 'ann-p001e-jm-i3', start: 497, length: 36, comment: "Mononucléose hépatique → vide du Zang Foie datant de 7 ans : racine du problème 5 Éléments.", createdAt: '2026-01-11T10:00:00.000Z' },
          { id: 'ann-p001e-jm-i4', start: 572, length: 24, comment: "Fatigabilité persistante = signe direct du vide de Yin du Foie non résolu sur 7 ans.", createdAt: '2026-01-11T10:01:00.000Z' },
        ],
        // Pouls : start=30 len=30 "foyer_moyen_droit — large, mou"
        // start=91 len=26 "foyer_moyen_gauche — plein"
        annotationsPouls: [
          { id: 'ann-p001e-jm-p1', start: 30, length: 30, comment: "Large et mou à droite = Rate en excès de Yin → Foyer Moyen bloqué, cycle Ko brisé.", createdAt: '2026-01-11T10:01:00.000Z' },
          { id: 'ann-p001e-jm-p2', start: 91, length: 26, comment: "Foyer Moyen gauche plein = Rate forte — confirme l'invasion Bois sur Terre.", createdAt: '2026-01-11T10:02:00.000Z' },
        ],
        niveauConfiance: 'expert',
        sourceType: 'humaine',
        version: 1,
        votePoints: 31,
        valeur: 1.0,
        votes: [],
        difficultéEstimee: 'niveau_difficile',
      },

      // [PE1] Praticien expérimenté 1 — grille Trois Foyers + Yin/Yang
      {
        id: 'p001-praticien-marie',
        caseId: 'cas-001',
        auteurId: 'user-praticien-marie',
        type: 'variante',
        auteurPseudo: 'Marie-Anne T.',
        auteurStatut: 'praticien_experimente',
        role: 'praticien',
        publicationMode: 'public',
        grillePrincipale: 'trois_foyers',
        grillesSecondaires: ['yin_yang'],
        polarite: 'yin',
        localisationFoyer: 'moyen',
        raisonnement: "Le blocage au Foyer Moyen (Rate en excès, pouls trop large et mou à droite) est la priorité absolue. La règle des 3 Foyers : traiter du haut vers le bas quand il y a plein. Ici le Foyer Moyen est plein de Yin — on le disperse d'abord. Sinon, tout traitement local du Foyer Inférieur sera inefficace.",
        categoriesDiagnostiques: [
          "Plénitude de Yin au Foyer Moyen (Rate)",
          "Vide de Yang au Foyer Inférieur (Rein/VB)",
          "Blocage de la circulation Foyer Moyen → Foyer Inférieur",
        ],
        strategieTherapeutique: `1. Disperser la plénitude du Foyer Moyen.\n2. Tonifier le Yang du Foyer Inférieur.\n3. Traiter localement le genou en dernier.`,
        pointsUtilises: [
          { code: '6Rte', technique: 'dispersion', justification: "Disperse l'humidité au Foyer Moyen — priorité absolue", ordre: 1 },
          { code: '36E', technique: 'tonification', justification: "Stabilise la Terre après dispersion — relance le Yang", ordre: 2 },
          { code: '62V', technique: 'tonification', justification: "Yang Qiao Mo — équilibre les membres inférieurs", ordre: 3 },
          { code: '41VB', technique: 'tonification', justification: "Train inférieur — indication danseuse polyarticulaire", ordre: 4 },
        ],
        bilanEnergetique: `1. Plénitude de Yin au Foyer Moyen — Rate trop forte, blocage de descente\n2. Vide de Yang au Foyer Inférieur — Rein/VB insuffisant\n3. Le Foyer Moyen bouché empêche la descente du Yang vers les membres inférieurs\n4. Danseuse = sollicitation intense du Foyer Inférieur sur fond de blocage supérieur`,
        strategie: `1. Disperser la plénitude du Foyer Moyen (6Rte) en priorité\n2. Relancer la Terre après dispersion (36E)\n3. Tonifier le Yang des membres inférieurs (62V, 41VB)`,
        pointsProposer: [
          { code: '6Rte', action: 'dispersion', justification: "Disperse l'humidité au Foyer Moyen — priorité des 3 Foyers" },
          { code: '36E', action: 'tonification_chauffee', justification: "Relance la Terre après dispersion — tonifié chauffé pour activer le Yang digestif" },
          { code: '62V', action: 'tonification', justification: "Yang Qiao Mo — équilibre général des membres inférieurs" },
          { code: '41VB', action: 'tonification', justification: "Polyarticulaire train inférieur — indication danseuse" },
          { code: '33VB', action: 'dispersion', justification: "Stagnation locale au genou — traitement en dernier temps" },
        ],
        // langueTexte longueur 83 — "Langue légèrement violacée sur les bords..."
        // start=0 len=39 "Langue légèrement violacée sur les bords"
        // start=41 len=40 "Enduit blanc épais en zone centrale Rate."
        langueTexte: "Langue légèrement violacée sur les bords. Enduit blanc épais en zone centrale Rate.",
        annotationsLangue: [
          { id: 'ann-p001pe-marie-l1', start: 41, length: 40, comment: "Enduit épais au centre = Foyer Moyen chargé d'humidité — clé du diagnostic Trois Foyers.", createdAt: '2026-01-12T14:05:00.000Z' },
        ],
        commentaireLibre: "La règle des 3 Foyers est fondamentale : le Foyer Moyen plein de Yin bloque toute la circulation descendante. Sans le lever, le genou ne peut pas guérir.",
        // Offsets interrogatoireText :
        // start=430 len=13 "Aime la pluie"
        // start=209 len=15 "Douleur la nuit"
        // start=67 len=17 "Craquement sonore"
        // start=606 len=28 "Pratique intense de la danse"
        annotationsInterrogatoire: [
          { id: 'ann-p001pe-marie-i1', start: 430, length: 13, comment: "Aime la pluie = signe paradoxal d'appel — confirme l'excès d'humidité au Foyer Moyen.", createdAt: '2026-01-12T14:00:00.000Z' },
          { id: 'ann-p001pe-marie-i2', start: 209, length: 15, comment: "Douleur la nuit au repos = Foyer Inférieur vide de Yang — la nuit révèle le manque.", createdAt: '2026-01-12T14:01:00.000Z' },
          { id: 'ann-p001pe-marie-i3', start: 67, length: 17, comment: "Craquement à la marche uniquement = signe Yin sur fond de vide — pas de lésion articulaire Yang.", createdAt: '2026-01-12T14:02:00.000Z' },
          { id: 'ann-p001pe-marie-i4', start: 606, length: 28, comment: "Pratique intense de la danse = sollicitation intense du Foyer Inférieur sur fond de blocage du Foyer Moyen.", createdAt: '2026-01-12T14:03:00.000Z' },
        ],
        // Pouls : start=30 len=30 "foyer_moyen_droit — large, mou"
        annotationsPouls: [
          { id: 'ann-p001pe-marie-p1', start: 30, length: 30, comment: "Large et mou à droite = Rate en excès de Yin, Foyer Moyen saturé — clé du diagnostic Trois Foyers.", createdAt: '2026-01-12T14:04:00.000Z' },
          { id: 'ann-p001pe-marie-p2', start: 0, length: 29, comment: "Vide au Foyer Inférieur = Yang insuffisant — confirme la règle : traiter le Foyer Moyen plein d'abord.", createdAt: '2026-01-12T14:05:00.000Z' },
        ],
        niveauConfiance: 'standard',
        sourceType: 'humaine',
        version: 1,
        votePoints: 19,
        valeur: 1.0,
        votes: [],
        difficultéEstimee: 'niveau_4e',
      },

      // [PE2] Praticien expérimenté 2 — grille Cinq Éléments + Zang/Fu
      {
        id: 'p001-praticien-thomas',
        caseId: 'cas-001',
        auteurId: 'user-praticien-thomas',
        type: 'variante',
        auteurPseudo: 'Thomas B.',
        auteurStatut: 'praticien_experimente',
        role: 'praticien',
        publicationMode: 'public',
        grillePrincipale: 'cinq_elements',
        grillesSecondaires: ['zang_fu'],
        polarite: 'yin',
        localisationFoyer: 'inferieur',
        raisonnement: "Lecture Cinq Éléments : l'Eau (Rein) ne nourrit plus le Bois (Foie/VB) depuis la mononucléose. Le Foie affaibli ne gouverne plus les tendons — genou vulnérable. La Rate (Terre) est envahie par l'humidité car le Bois ne contrôle plus correctement la Terre (cycle Ko affaibli).",
        categoriesDiagnostiques: [
          "Insuffisance Eau → Bois — cycle Sheng brisé depuis la mononucléose",
          "Foie-VB ne gouverne plus les tendons — genou vulnérable",
          "Terre envahie par l'humidité — Rate surchargée",
        ],
        strategieTherapeutique: `1. Nourrir l'Eau (Rein) pour relancer le cycle Sheng.\n2. Soutenir le Bois (Foie/VB) pour qu'il nourrisse les tendons.\n3. Lever l'humidité de la Terre (Rate).`,
        pointsUtilises: [
          { code: '3R', nomIeatc: 'Tai Xi', technique: 'tonification', justification: "Source Yin du Rein — nourrit la base Eau", ordre: 1 },
          { code: '8F', technique: 'tonification', justification: "Source du Foie — nourrit le Bois et les tendons", ordre: 2 },
          { code: '34VB', technique: 'tonification', justification: "Point hui des tendons — renforce localement", ordre: 3 },
          { code: '6Rte', technique: 'dispersion', justification: "Disperse l'humidité de la Terre (Rate)", ordre: 4 },
          { code: '36E', technique: 'tonification', justification: "Stabilise la Terre après dispersion", ordre: 5 },
        ],
        bilanEnergetique: `1. Insuffisance Eau (Rein) — base du cycle Sheng défaillante depuis mononucléose\n2. Foie-VB (Bois) mal nourri — ne gouverne plus les tendons du genou\n3. Rate (Terre) envahie par humidité — cycle Ko affaibli par le Bois\n4. Tendons vulnérables chez danseuse sur fond de vide Eau→Bois`,
        strategie: `1. Nourrir l'Eau (R3 Tai Xi) pour relancer le cycle Sheng vers le Bois\n2. Soutenir le Bois (8F, 34VB) pour gouverner les tendons\n3. Lever l'humidité de la Terre (6Rte dispersion)`,
        pointsProposer: [
          { code: '3R', action: 'tonification', justification: "Tai Xi — source Yin du Rein, base Eau du cycle Sheng" },
          { code: '8F', action: 'tonification', justification: "Source du Foie — nourrit les tendons via le Bois" },
          { code: '34VB', action: 'tonification', justification: "Point hui des tendons — rôle clé dans le Bois" },
          { code: '6Rte', action: 'dispersion', justification: "Disperse l'humidité de la Rate (Terre)" },
          { code: '36E', action: 'tonification', justification: "Stabilise la Terre après dispersion — relance le Yang" },
        ],
        // langueTexte longueur 76 — "Langue pâle avec bords légèrement rouges..."
        // start=0 len=27 "Langue pâle avec bords légg"
        // start=42 len=23 "Enduit blanc fin."
        langueTexte: "Langue pâle avec bords légèrement rouges. Enduit blanc fin. Corps souple.",
        annotationsLangue: [
          { id: 'ann-p001pe-thomas-l1', start: 0, length: 40, comment: "Pâle avec bords rouges = Yin insuffisant + Yang du Bois en tension — confirme vide Eau→Bois.", createdAt: '2026-02-03T11:05:00.000Z' },
        ],
        commentaireLibre: "Le cycle Eau→Bois est la clé de ce cas. La mononucléose a affaibli l'Eau et le Bois ensemble — les tendons du genou en sont la manifestation terminale.",
        // Offsets interrogatoireText :
        // start=67 len=17 "Craquement sonore"
        // start=209 len=15 "Douleur la nuit"
        // start=497 len=36 "Mononucléose avec atteinte hépatique"
        // start=548 len=22 "Fatiguée pendant 2 ans"
        annotationsInterrogatoire: [
          { id: 'ann-p001pe-thomas-i1', start: 67, length: 17, comment: "Craquement à la marche = stagnation méridienne VB — Bois bloqué dans son trajet local.", createdAt: '2026-02-03T11:00:00.000Z' },
          { id: 'ann-p001pe-thomas-i2', start: 209, length: 15, comment: "Douleur nocturne = manque de Yang — le Bois ne circule plus la nuit, vide de fond.", createdAt: '2026-02-03T11:01:00.000Z' },
          { id: 'ann-p001pe-thomas-i3', start: 497, length: 36, comment: "Mononucléose hépatique = atteinte directe du Bois — racine du cycle Eau→Bois brisé.", createdAt: '2026-02-03T11:02:00.000Z' },
          { id: 'ann-p001pe-thomas-i4', start: 548, length: 22, comment: "Fatiguée pendant 2 ans = épuisement progressif du Yin et du Yang du Rein — Eau insuffisante.", createdAt: '2026-02-03T11:03:00.000Z' },
        ],
        // Pouls : start=30 len=30, start=91 len=26
        annotationsPouls: [
          { id: 'ann-p001pe-thomas-p1', start: 30, length: 30, comment: "Large et mou à droite = Rate envahie par humidité (Bois ne contrôle plus la Terre).", createdAt: '2026-02-03T11:10:00.000Z' },
          { id: 'ann-p001pe-thomas-p2', start: 0, length: 29, comment: "Vide Foyer Inférieur gauche = Rein Yang insuffisant — base Eau défaillante du cycle Sheng.", createdAt: '2026-02-03T11:11:00.000Z' },
        ],
        niveauConfiance: 'standard',
        sourceType: 'humaine',
        version: 1,
        votePoints: 22,
        valeur: 1.0,
        votes: [],
        difficultéEstimee: 'niveau_intermediaire',
      },

      // [JP1] Jeune praticien 1 — grille Méridiens (approche simplifiée)
      {
        id: 'p001-jeune-claire',
        caseId: 'cas-001',
        auteurId: 'user-jeune-claire',
        type: 'variante',
        auteurPseudo: 'Claire M.',
        auteurStatut: 'jeune_praticien',
        role: 'praticien',
        publicationMode: 'public',
        grillePrincipale: 'meridiens',
        polarite: 'yin',
        localisationFoyer: 'inferieur',
        raisonnement: "Approche méridienne directe : le trajet VB est atteint depuis la mononucléose (ganglions au cou) jusqu'au genou. La douleur nocturne confirme le vide Yang dans le méridien. Traiter VB de bout en bout pour restaurer la circulation.",
        categoriesDiagnostiques: [
          "Atteinte du méridien VB de la tête au genou",
          "Stagnation locale au genou sur terrain de vide méridien",
        ],
        strategieTherapeutique: `1. Libérer le méridien VB en amont (20VB).\n2. Tonifier le Yang du méridien depuis la hanche (30VB).\n3. Renforcer localement au genou (34VB, 44VB).`,
        pointsUtilises: [
          { code: '20VB', technique: 'dispersion', justification: "Libère le haut du méridien VB au cou", ordre: 1 },
          { code: '30VB', technique: 'moxa_tonification', justification: "Apporte le Yang vers les membres inférieurs", ordre: 2 },
          { code: '34VB', technique: 'tonification', justification: "Point hui des tendons — renforce le genou", ordre: 3 },
          { code: '44VB', technique: 'tonification', justification: "Point distal — renforce le méridien en profondeur", ordre: 4 },
          { code: '36E', technique: 'tonification', justification: "Yang local et état général", ordre: 5 },
        ],
        bilanEnergetique: `1. Obstruction méridienne VB — séquelles mononucléose au cou\n2. Vide de Yang dans le trajet VB vers les membres inférieurs\n3. Stagnation locale au genou — danseuse sur méridien fragilisé`,
        strategie: `1. Libérer le trajet supérieur du méridien VB (20VB cou)\n2. Faire descendre le Yang dans le méridien (30VB moxas)\n3. Renforcer localement le genou (34VB, 44VB, 36E)`,
        pointsProposer: [
          { code: '20VB', action: 'dispersion', justification: "Point de la nuque — libère le méridien VB au cou" },
          { code: '30VB', action: 'tonification', justification: "Point de la hanche — amène le Yang vers les membres" },
          { code: '34VB', action: 'tonification', justification: "Point hui des tendons — renforce localement" },
          { code: '44VB', action: 'tonification', justification: "Point distal — libère la descente méridienne" },
          { code: '36E', action: 'tonification_chauffee', justification: "Soutien général + Yang local du genou — tonifié chauffé" },
        ],
        // langueTexte longueur 76 — "Langue normale, légèrement humide..."
        // start=0 len=16 "Langue normale,"
        langueTexte: "Langue normale, légèrement humide. Enduit blanc fin. Corps légèrement bombé.",
        annotationsLangue: [
          { id: 'ann-p001jp-claire-l1', start: 0, length: 14, comment: "Langue normale = pas de chaleur interne — confirme que la pathologie est méridienne, pas Zang/Fu.", createdAt: '2026-02-01T10:15:00.000Z' },
        ],
        commentaireLibre: "J'ai choisi la lecture méridienne car le trajet VB depuis le cou jusqu'au genou m'a semblé être le fil conducteur le plus direct de ce cas.",
        // Offsets interrogatoireText :
        // start=67 len=17 "Craquement sonore"
        // start=497 len=12 "Mononucléose"
        // start=209 len=15 "Douleur la nuit"
        // start=430 len=13 "Aime la pluie"
        annotationsInterrogatoire: [
          { id: 'ann-p001jp-claire-i1', start: 67, length: 17, comment: "Craquement à la marche = signal Yin : Yang bloqué dans le méridien VB.", createdAt: '2026-02-01T10:00:00.000Z' },
          { id: 'ann-p001jp-claire-i2', start: 497, length: 12, comment: "Mononucléose = pathologie méridienne VB — séquelles ganglionnaires au cou confirment.", createdAt: '2026-02-01T10:05:00.000Z' },
          { id: 'ann-p001jp-claire-i3', start: 209, length: 15, comment: "Douleur nocturne = manque de circulation Yang dans le méridien — signe méridien Yin.", createdAt: '2026-02-01T10:07:00.000Z' },
          { id: 'ann-p001jp-claire-i4', start: 430, length: 13, comment: "Aime la pluie = indice d'humidité interne — Yin en excès dans le méridien.", createdAt: '2026-02-01T10:09:00.000Z' },
        ],
        // Pouls : start=0 len=29, start=61 len=29
        annotationsPouls: [
          { id: 'ann-p001jp-claire-p1', start: 0, length: 29, comment: "Vide Foyer Inférieur gauche = Yang insuffisant dans le méridien VB — confirme la lecture méridienne.", createdAt: '2026-02-01T10:10:00.000Z' },
          { id: 'ann-p001jp-claire-p2', start: 61, length: 29, comment: "9P vide = énergie du bas insuffisante — Yang du méridien ne descend pas correctement.", createdAt: '2026-02-01T10:11:00.000Z' },
        ],
        niveauConfiance: 'standard',
        sourceType: 'humaine',
        version: 1,
        votePoints: 12,
        valeur: 1.0,
        votes: [],
        difficultéEstimee: 'niveau_intermediaire',
      },

      // [JP2] Jeune praticien 2 — grille Yin/Yang (anonyme)
      {
        id: 'p001-jeune-anon',
        caseId: 'cas-001',
        auteurId: 'user-jeune-anon-1',
        type: 'variante',
        auteurPseudo: 'Anonyme',
        auteurStatut: 'jeune_praticien',
        role: 'praticien',
        publicationMode: 'anonyme',
        grillePrincipale: 'yin_yang',
        polarite: 'yin',
        localisationFoyer: 'inferieur',
        raisonnement: "Lecture Yin/Yang directe : la douleur est Yin (repos, nuit), les signes indiquent un vide de Yang général (pouls vide Foyer Inférieur, large et mou à droite). Traiter le Yang général d'abord, puis localement.",
        categoriesDiagnostiques: [
          "Vide de Yang général — Foyer Inférieur",
          "Excès de Yin — Foyer Moyen (Rate)",
        ],
        strategieTherapeutique: `1. Tonifier le Yang général.\n2. Lever l'excès de Yin au Foyer Moyen.\n3. Traitement local secondaire.`,
        pointsUtilises: [
          { code: '62V', technique: 'tonification', justification: "Yang Qiao Mo — équilibre général Yin/Yang", ordre: 1 },
          { code: '36E', technique: 'moxa_tonification', justification: "Yang général et local", ordre: 2 },
          { code: '6Rte', technique: 'dispersion', justification: "Disperse le Yin en excès au Foyer Moyen", ordre: 3 },
          { code: '41VB', technique: 'tonification', justification: "Polyarticulaire train inférieur", ordre: 4 },
        ],
        bilanEnergetique: `1. Vide de Yang général — pouls vide Foyer Inférieur gauche\n2. Excès de Yin au Foyer Moyen — Rate trop forte, blocage de la descente\n3. Douleur Yin au genou — manque de Yang local`,
        strategie: `1. Tonifier le Yang général (62V, 36E moxas)\n2. Lever l'excès de Yin Foyer Moyen (6Rte dispersion)\n3. Renforcer localement le genou (41VB)`,
        pointsProposer: [
          { code: '62V', action: 'tonification', justification: "Yang Qiao Mo — Yang général des membres inférieurs" },
          { code: '36E', action: 'tonification', justification: "Yang général et local du genou — moxa recommandé" },
          { code: '6Rte', action: 'dispersion', justification: "Disperse le Yin en excès au Foyer Moyen" },
          { code: '41VB', action: 'tonification', justification: "Polyarticulaire train inférieur" },
        ],
        // langueTexte longueur 76 — "Langue pâle, corps légèrement flasque..."
        // start=0 len=12 "Langue pâle,"
        langueTexte: "Langue pâle, corps légèrement flasque. Bords fins. Enduit blanc translucide.",
        annotationsLangue: [
          { id: 'ann-p001jp-anon-l1', start: 0, length: 12, comment: "Pâle et flasque = vide de Yang et de Sang — confirme le tableau Yin/Yang de vide.", createdAt: '2026-02-02T09:15:00.000Z' },
        ],
        commentaireLibre: "Première approche en Yin/Yang pur — j'ai privilégié la simplicité du diagnostic avant de chercher les grilles secondaires.",
        // Offsets interrogatoireText :
        // start=0 len=22 "Genou droit qui craque"
        // start=209 len=15 "Douleur la nuit"
        // start=430 len=13 "Aime la pluie"
        // start=386 len=17 "Aucun traumatisme"
        annotationsInterrogatoire: [
          { id: 'ann-p001jp-anon-i1', start: 0, length: 22, comment: "Genou qui craque = manifestation Yin — le Yang ne circule plus dans le méridien au repos.", createdAt: '2026-02-02T09:00:00.000Z' },
          { id: 'ann-p001jp-anon-i2', start: 209, length: 15, comment: "Douleur nocturne = Yin dominant, Yang absent au repos — confirme le vide de Yang.", createdAt: '2026-02-02T09:05:00.000Z' },
          { id: 'ann-p001jp-anon-i3', start: 430, length: 13, comment: "Aime la pluie = Yin en excès (paradoxe d'appel ou confirmation de l'excès d'humidité).", createdAt: '2026-02-02T09:07:00.000Z' },
          { id: 'ann-p001jp-anon-i4', start: 386, length: 17, comment: "Aucun traumatisme identifié = élimine la cause Yang (choc) — confirme l'origine Yin/vide.", createdAt: '2026-02-02T09:09:00.000Z' },
        ],
        // Pouls : start=30 len=30, start=0 len=29
        annotationsPouls: [
          { id: 'ann-p001jp-anon-p1', start: 30, length: 30, comment: "Large et mou à droite = Yin en excès Rate — Foyer Moyen chargé d'humidité.", createdAt: '2026-02-02T09:10:00.000Z' },
          { id: 'ann-p001jp-anon-p2', start: 0, length: 29, comment: "Vide Foyer Inférieur = Yang général insuffisant — traiter le Yang d'abord.", createdAt: '2026-02-02T09:11:00.000Z' },
        ],
        niveauConfiance: 'standard',
        sourceType: 'humaine',
        version: 1,
        votePoints: 8,
        valeur: 1.0,
        votes: [],
        difficultéEstimee: 'niveau_4e',
      },

      // [Et1] Étudiant 4e année 1 — grille Cinq Éléments
      {
        id: 'p001-etudiant4-sophie',
        caseId: 'cas-001',
        auteurId: 'user-etudiant4-sophie',
        type: 'variante',
        auteurPseudo: 'Sophie L.',
        auteurStatut: 'etudiant_4e_annee',
        role: 'etudiant',
        publicationMode: 'public',
        grillePrincipale: 'cinq_elements',
        grillesSecondaires: ['zang_fu'],
        polarite: 'yin',
        localisationFoyer: 'inferieur',
        raisonnement: "Lecture 5 Éléments : insuffisance Eau qui ne nourrit pas le Bois. Le Foie/VB, affaibli par les séquelles de mononucléose, ne peut plus soutenir les tendons et ligaments du genou. La fatigabilité depuis 7 ans est le signe le plus important du vide de fond.",
        categoriesDiagnostiques: [
          "Insuffisance Eau → Bois (cycle Sheng) depuis mononucléose",
          "Foie-VB ne gouverne plus les tendons — genou vulnérable",
        ],
        strategieTherapeutique: `1. Nourrir l'Eau (Rein).\n2. Soutenir le Bois (Foie/VB).\n3. Traiter localement les tendons.`,
        pointsUtilises: [
          { code: '3R', technique: 'tonification', justification: "Source Yin du Rein — nourrit la base Eau", ordre: 1 },
          { code: '8F', technique: 'tonification', justification: "Source du Foie — nourrit le Bois et les tendons", ordre: 2 },
          { code: '34VB', technique: 'tonification', justification: "Point hui des tendons — renforce les tendons du genou", ordre: 3 },
          { code: '7F', technique: 'dispersion', justification: "Libère la stagnation locale méridien Foie", ordre: 4 },
        ],
        bilanEnergetique: `1. Vide de Yin du Rein (Eau) — base insuffisante du cycle Sheng\n2. Foie-VB (Bois) mal nourri par l'Eau — séquelles mononucléose 7 ans\n3. Tendons insuffisamment alimentés — genou vulnérable chez danseuse`,
        strategie: `1. Tonifier le Rein (Eau) pour nourrir le Bois\n2. Soutenir le Foie-VB (Bois) via ses points source\n3. Renforcer localement les tendons du genou`,
        pointsProposer: [
          { code: '3R', action: 'tonification', justification: "Source Yin du Rein — nourrit la base Eau du cycle Sheng" },
          { code: '8F', action: 'tonification', justification: "Source du Foie — nourrit les tendons via le Bois" },
          { code: '34VB', action: 'tonification', justification: "Point hui des tendons — rôle clé dans le Bois" },
          { code: '7F', action: 'dispersion', justification: "Libère la stagnation locale du méridien Foie" },
        ],
        // langueTexte longueur 70 — "Langue légèrement pâle, bords normaux..."
        // start=0 len=24 "Langue légèrement pâle,"
        langueTexte: "Langue légèrement pâle, bords normaux. Enduit blanc fin. Corps souple.",
        annotationsLangue: [
          { id: 'ann-p001et4-sophie-l1', start: 0, length: 23, comment: "Légèrement pâle = vide de Yin-Sang (Eau/Bois insuffisants) — confirme la lecture 5 Éléments.", createdAt: '2026-02-01T10:15:00.000Z' },
        ],
        commentaireLibre: "La clé de ce cas est dans les séquelles de mononucléose — sans traiter l'insuffisance Eau-Bois, le genou ne guérira pas durablement. C'est mon premier cas de lecture 5 Éléments en clinique.",
        // Offsets interrogatoireText :
        // start=67 len=17 "Craquement sonore"
        // start=497 len=36 "Mononucléose avec atteinte hépatique"
        // start=572 len=24 "Fatigabilité persistante"
        // start=286 len=18 "Danseuse classique"
        annotationsInterrogatoire: [
          { id: 'ann-p001et4-sophie-i1', start: 67, length: 17, comment: "Craquement = stagnation Bois — VB bloqué dans son trajet au genou.", createdAt: '2026-02-01T10:00:00.000Z' },
          { id: 'ann-p001et4-sophie-i2', start: 497, length: 36, comment: "Mononucléose hépatique → séquelles du Bois (Foie/VB) depuis 7 ans : clé du diagnostic 5 Éléments.", createdAt: '2026-02-01T10:05:00.000Z' },
          { id: 'ann-p001et4-sophie-i3', start: 572, length: 24, comment: "Fatigabilité persistante = signe le plus important — vide de Yin du Foie non résolu.", createdAt: '2026-02-01T10:06:00.000Z' },
          { id: 'ann-p001et4-sophie-i4', start: 286, length: 18, comment: "Danseuse = sur-sollicitation des tendons (domaine du Bois) sur fond de vide.", createdAt: '2026-02-01T10:07:00.000Z' },
        ],
        // Pouls : start=0 len=29
        annotationsPouls: [
          { id: 'ann-p001et4-sophie-p1', start: 0, length: 29, comment: "Vide Foyer Inférieur = insuffisance de l'Eau — confirme le vide Rein dans la grille 5 Éléments.", createdAt: '2026-02-01T10:10:00.000Z' },
          { id: 'ann-p001et4-sophie-p2', start: 91, length: 26, comment: "Foyer Moyen gauche plein = Rate forte — confirme la pression sur la Terre par manque de contrôle Bois.", createdAt: '2026-02-01T10:11:00.000Z' },
        ],
        niveauConfiance: 'standard',
        sourceType: 'humaine',
        version: 1,
        votePoints: 5,
        valeur: 1.0,
        votes: [],
        difficultéEstimee: 'niveau_intermediaire',
      },

      // [Et2] Étudiant 4e année 2 — grille Trois Foyers (anonyme)
      {
        id: 'p001-etudiant4-anon',
        caseId: 'cas-001',
        auteurId: 'user-etudiant4-anon-2',
        type: 'variante',
        auteurPseudo: 'Anonyme',
        auteurStatut: 'etudiant_4e_annee',
        role: 'etudiant',
        publicationMode: 'anonyme',
        grillePrincipale: 'trois_foyers',
        grillesSecondaires: ['yin_yang'],
        polarite: 'yin',
        localisationFoyer: 'moyen',
        raisonnement: "Lecture Trois Foyers : le Foyer Moyen est bloqué (Rate trop forte, pouls large et mou à droite). Le Foyer Inférieur est vide de Yang. Le blocage du Foyer Moyen empêche la descente du Yang vers les membres. Traiter d'abord le Foyer Moyen, puis le Foyer Inférieur.",
        categoriesDiagnostiques: [
          "Plénitude Yin au Foyer Moyen — Rate chargée",
          "Vide de Yang au Foyer Inférieur",
          "Blocage de la descente du Yang vers les membres inférieurs",
        ],
        strategieTherapeutique: `1. Disperser le Foyer Moyen (Rate) en priorité.\n2. Tonifier le Foyer Inférieur (VB, Rein).\n3. Traitement local du genou en dernier.`,
        pointsUtilises: [
          { code: '6Rte', technique: 'dispersion', justification: "Disperse l'humidité du Foyer Moyen — priorité", ordre: 1 },
          { code: '36E', technique: 'tonification', justification: "Relance la Terre après dispersion", ordre: 2 },
          { code: '62V', technique: 'tonification', justification: "Yang Qiao Mo — équilibre Foyer Inférieur", ordre: 3 },
          { code: '41VB', technique: 'tonification', justification: "Polyarticulaire — Foyer Inférieur/membres", ordre: 4 },
        ],
        bilanEnergetique: `1. Foyer Moyen bloqué par excès de Yin (Rate trop forte)\n2. Vide de Yang du Foyer Inférieur (Rein/VB)\n3. Blocage de la descente du Yang vers les membres inférieurs`,
        strategie: `1. Disperser la plénitude du Foyer Moyen (Rate — 6Rte)\n2. Relancer la Terre après dispersion (36E)\n3. Tonifier le Foyer Inférieur (62V, 41VB)`,
        pointsProposer: [
          { code: '6Rte', action: 'dispersion', justification: "Clé du Foyer Moyen — élimine l'humidité de la Rate" },
          { code: '36E', action: 'tonification', justification: "Stabilise la Terre après dispersion" },
          { code: '62V', action: 'tonification', justification: "Yang Qiao Mo — équilibre Foyer Inférieur" },
          { code: '41VB', action: 'tonification', justification: "Polyarticulaire train inférieur" },
        ],
        // langueTexte longueur 71 — "Langue pâle avec légère teinte violacée..."
        // start=0 len=28 "Langue pâle avec légère tein"
        langueTexte: "Langue pâle avec légère teinte violacée aux bords. Enduit blanc-humide.",
        annotationsLangue: [
          { id: 'ann-p001et4-anon-l1', start: 0, length: 50, comment: "Pâle + teinte violacée aux bords = vide de Yang + stagnation du Foyer Moyen — confirme les Trois Foyers.", createdAt: '2026-02-03T11:15:00.000Z' },
        ],
        commentaireLibre: "Première lecture Trois Foyers sur un cas locomoteur — difficile d'identifier le Foyer Moyen comme responsable d'un problème de genou. Les pouls m'ont guidé.",
        // Offsets interrogatoireText :
        // start=209 len=15 "Douleur la nuit"
        // start=430 len=13 "Aime la pluie"
        // start=67 len=17 "Craquement sonore"
        // start=606 len=28 "Pratique intense de la danse"
        annotationsInterrogatoire: [
          { id: 'ann-p001et4-anon-i1', start: 209, length: 15, comment: "Douleur nocturne = Foyer Inférieur vide de Yang — la nuit révèle le manque.", createdAt: '2026-02-03T11:00:00.000Z' },
          { id: 'ann-p001et4-anon-i2', start: 430, length: 13, comment: "Aime la pluie = excès d'humidité Foyer Moyen — la Rate ne transforme plus.", createdAt: '2026-02-03T11:01:00.000Z' },
          { id: 'ann-p001et4-anon-i3', start: 67, length: 17, comment: "Craquement = stagnation locale — cause au Foyer Moyen bloqué, pas au genou lui-même.", createdAt: '2026-02-03T11:02:00.000Z' },
          { id: 'ann-p001et4-anon-i4', start: 606, length: 28, comment: "Pratique intense de la danse = sollicitation du Foyer Inférieur sur fond de blocage du Foyer Moyen.", createdAt: '2026-02-03T11:03:00.000Z' },
        ],
        // Pouls : start=30 len=30
        annotationsPouls: [
          { id: 'ann-p001et4-anon-p1', start: 30, length: 30, comment: "Large et mou à droite en profond = Rate trop chargée de Yin — clé du Foyer Moyen.", createdAt: '2026-02-03T11:10:00.000Z' },
          { id: 'ann-p001et4-anon-p2', start: 0, length: 29, comment: "Vide Foyer Inférieur = Yang insuffisant — confirme la règle des 3 Foyers.", createdAt: '2026-02-03T11:11:00.000Z' },
        ],
        niveauConfiance: 'standard',
        sourceType: 'humaine',
        version: 1,
        votePoints: 3,
        valeur: 1.0,
        votes: [],
        difficultéEstimee: 'niveau_4e',
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // CAS 2 — JEAN-CHARLES — Crise de goutte
  // Source : PIV YY tome 5, CP I Partie 2 — Cas 2
  // Grille principale : Yin/Yang (Yang local sur vide de Yang général)
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'cas-002',
    slug: 'jean-charles-crise-goutte-orteil',
    titre: 'Jean-Charles — Goutte : orteil gauche douloureux',
    statut: 'publie',
    niveauComplexite: 2,
    sexe: 'masculin',
    dateCreation: '2025-09-05',
    datePublication: '2025-09-20',
    casComplet: true,
    exemplaire: false,
    grillePrincipale: 'yin_yang',
    tags: ['goutte', 'orteil', 'acide urique', 'Vésicule Biliaire', 'Foie', 'Rate', 'psychisme'],
    viewCount: 178,
    content: {
      motif: "Crise de goutte il y a 1 an au gros orteil gauche. État latent de douleur persistant.",
      interrogatoire: [
        { cle: 'declencheur', valeur: "Crise à chaque période difficile ou lors de problèmes — lien direct avec l'état émotionnel." },
        { cle: 'localisation', valeur: "Gros orteil gauche, douleur persistante à bas bruit entre les crises." },
        { cle: 'historique', valeur: "Première crise diagnostiquée il y a 1 an, acide urique confirmé à l'analyse." },
      ],
      observation: "Orteil rouge, gonflé, congestif dans la zone douloureuse. Aspect inflammatoire.",
      palpation: "Tous les points locaux sensibles et douloureux à faible pression → aspect Yang et plénitude. Orteil chaud à la palpation.",
      prisePouls: {
        condition: "Patient assis, bras détendu",
        lectures: [
          {
            position: 'foyer_inferieur_droit',
            qualites: ['plein', 'profond'],
            interpretation: "Plus fort en profondeur à droite — Yin plus fort.",
          },
          {
            position: 'global_superficiel',
            qualites: ['absent'],
            interpretation: "Pas de Yang, absence de pouls superficiels — vide de Yang général.",
          },
        ],
        synthese: "Yang local (inflammation, chaleur, plénitude locale) sur fond de vide de Yang général. Paradoxe diagnostique classique : Yang local bruyant masquant le vide profond.",
      },
    },
    analyses: [
      {
        id: 'a002-yy',
        caseId: 'cas-002',
        type: 'officielle',
        auteurPseudo: 'Dr Sylvie Arnaud',
        auteurStatut: 'expert',
        role: 'expert',
        publicationMode: 'public',
        votePoints: 31,
        valeur: 3.1,
        grillePrincipale: 'yin_yang',
        grillesSecondaires: ['zang_fu', 'meridiens'],
        polarite: 'yang',
        localisationFoyer: 'inferieur',
        raisonnement: `**Latéralité et méridiens** : Le pied gauche correspond au Bois — Foie et Vésicule Biliaire. Le gros orteil est l'interface entre le méridien du Foie (Bois) et celui de la Rate (Terre).

**Mécanisme de la chaleur** : Une chaleur ne peut JAMAIS se développer d'elle-même sur la Rate/Terre — c'est le Yin le plus important du corps. La chaleur présente vient nécessairement d'un autre méridien : ici, la Vésicule Biliaire via le Foie.

**Acide urique** : En IEATC, les crises d'acide urique sont TOUJOURS d'origine Vésicule Biliaire qui ne se draine pas suffisamment. La bile ne se déverse pas → reflue vers le Foie → pénètre dans le sang filtré → précipitation en cristaux d'urate.

**Lien psychique** : Les crises surviennent lors de périodes difficiles. Le méridien de Rate est le méridien des soucis et de l'anxiété. Le lien stress → crise de goutte s'explique ainsi : le soin psychique non traité affaiblit la Rate (Terre), favorisant l'invasion du Bois sur la Terre.

**Diagnostic final** : Yang local (inflammation, chaleur, plénitude locale) sur fond de vide de Yang général. Traiter selon ce diagnostic binaire : tonifier le Yang partout sauf en local, disperser le Yang local.`,
        categoriesDiagnostiques: [
          "Yang local sur vide de Yang général",
          "Plénitude chaleur locale sur méridien Foie/Vésicule Biliaire",
          "Vésicule Biliaire qui ne se draine pas — refluence vers le Foie",
          "Conflit Bois-Terre (Rate affaiblie par les soucis)",
        ],
        strategieTherapeutique: "Tonifier le Yang général. Disperser le Yang local. Vider la VB de sa chaleur. Apaiser la Rate pour couper le lien stress-crise.",
        traitementPropose: `Protocole YY étapes 1, 3, 4 (pas 5 Éléments en première séance) :

**Étape 1 — Tonifier le Yang général**
4GI bilatéral (tonification) — tonification du Yang général.
12JM tonification — tonifier le Yang organique.

**Étape 3 — Vide/Plénitude locale**
3Rte dispersion avec saignée locale — disperse en aval de la douleur, déblocage du méridien Yin ascendant.

**Étape 4 — Froid/Chaleur**
2Rte dispersion avec saignée — traite la chaleur du méridien.
2F dispersion — vide/plénitude du Foie, traite la chaleur du méridien.
3F dispersion — point douloureux, en aval, libère la circulation et vide la plénitude en amont.
38VB dispersion + 40VB dispersion — vider la VB de chaleur et plénitude.

Tous les points en unilatéral gauche sauf 4GI. Possibilité de piqûre en étoile autour de l'inflammation locale.`,
        pointsUtilises: [
          { code: '4GI', nomIeatc: 'He Gu', technique: 'tonification', justification: "Tonification Yang général — bilatéral", ordre: 1 },
          { code: '12JM', technique: 'tonification', justification: "Tonification Yang organique", ordre: 2 },
          { code: '3Rte', technique: 'dispersion', justification: "Disperse en aval — déblocage méridien Yin ascendant", ordre: 3 },
          { code: '2Rte', technique: 'dispersion', justification: "Chaleur du méridien (saignée)", ordre: 4 },
          { code: '2F', technique: 'dispersion', justification: "Vide/plénitude Foie — chaleur méridien", ordre: 5 },
          { code: '3F', nomIeatc: 'Tai Chong', technique: 'dispersion', justification: "Point douloureux en aval — libère et vide la plénitude en amont", ordre: 6 },
          { code: '38VB', technique: 'dispersion', justification: "Vider la VB de chaleur et plénitude", ordre: 7 },
          { code: '40VB', technique: 'dispersion', justification: "Vider la VB de chaleur et plénitude", ordre: 8 },
        ],
        niveauConfiance: 'expert',
        sourceType: 'editoriale',
        version: 1,
        enseignementCle: "Tonifier le Yang partout SAUF en local. Disperser le Yang local. Un même symptôme (goutte) nécessite d'identifier la chaîne causale complète : VB → F → E/Rte + dimension psychique. Ne jamais traiter uniquement le local.",
      },

      // ── Participations enrichies — Cas 002 ────────────────────────────────
      // Interrogatoire aplati positions :
      // 0 : motif "Crise de goutte il y a 1 an au gros orteil gauche..." (83c)
      // 85 : "declencheur : Crise à chaque période difficile..." → "Crise à chaque" at 99
      // 184 : "localisation : Gros orteil gauche..." → "Gros orteil" at 199
      // 259 : "historique : Première crise diagnostiquée..." → "acide urique" at ca. 295
      {
        id: 'p002-demo-1',
        caseId: 'cas-002',
        type: 'variante',
        auteurPseudo: 'Léa D.',
        auteurStatut: 'etudiant',
        role: 'etudiant',
        publicationMode: 'public',
        grillePrincipale: 'cinq_elements',
        polarite: 'yang',
        localisationFoyer: 'inferieur',
        raisonnement: "Lecture 5 Éléments : Bois (F/VB) envahit la Terre (Rte). Les crises au stress confirment la voie Bois-Terre. La chaleur locale vient du Bois qui déborde sur la Terre — le gros orteil est la zone d'interface Foie/Rate. Le lien émotionnel (crises aux moments de stress) ancre cette lecture : le Foie gouverne les émotions, et quand il est trop chargé, il attaque la Rate.",
        categoriesDiagnostiques: [
          "Bois (F/VB) envahit Terre (Rate) — cycle Ko pathologique",
          "Chaleur du Bois débordant sur la Rate",
          "Lien stress-crise = Foie en plénitude Yang",
        ],
        strategieTherapeutique: "Calmer le Bois, soutenir la Terre, drainer la chaleur locale.",
        pointsUtilises: [
          { code: '3F', technique: 'dispersion', justification: "Calmer le Bois — point source du Foie", ordre: 1 },
          { code: '3Rte', technique: 'dispersion', justification: "Drainer la chaleur locale Rate/Foie", ordre: 2 },
          { code: '36E', technique: 'tonification', justification: "Soutenir la Terre après dispersion", ordre: 3 },
        ],
        bilanEnergetique: `1. Foie-VB (Bois) en plénitude Yang — envahit la Rate (Terre)\n2. Rate (Terre) agressée — chaleur locale au gros orteil gauche\n3. Lien stress-crise confirme le Foie en excès (émotions = domaine du Bois)`,
        strategie: `1. Disperser la plénitude du Bois (3F — source Foie)\n2. Drainer la chaleur Rate/Foie locale (3Rte dispersion)\n3. Soutenir la Terre après dispersion (36E tonification)`,
        pointsProposer: [
          { code: '3F', action: 'dispersion', justification: "Point source du Foie — calme le Bois en excès" },
          { code: '3Rte', action: 'dispersion', justification: "Drainer la chaleur locale sur méridien Rte" },
          { code: '36E', action: 'tonification', justification: "Soutenir la Terre après la dispersion" },
        ],
        langueTexte: "Langue rouge sur les bords et la pointe. Enduit jaune fin. Corps normal.",
        annotationsLangue: [
          { id: 'ann-d002-1-l1', start: 0, length: 29, comment: "Rouge sur bords et pointe = Bois-Feu en excès — confirme la chaleur Foie/VB.", createdAt: '2026-02-10T10:00:00.000Z' },
        ],
        niveauConfiance: 'standard',
        sourceType: 'humaine',
        version: 1,
        annotationsInterrogatoire: [
          { id: 'ann-p002d1-1', start: 99, length: 52, comment: "Crises au stress = Foie en plénitude (émotion → Yang du Bois) — confirme 5 Éléments.", createdAt: '2026-02-10T09:55:00.000Z' },
          { id: 'ann-p002d1-2', start: 199, length: 20, comment: "Gros orteil gauche = interface Foie/Rate dans la grille 5 Éléments.", createdAt: '2026-02-10T09:57:00.000Z' },
          { id: 'ann-p002d1-3', start: 0, length: 83, comment: "Crise de goutte + état latent = forme Yang aiguë sur fond de plénitude chronique Bois.", createdAt: '2026-02-10T09:58:00.000Z' },
        ],
        annotationsPouls: [
          { id: 'ann-p002d1-p1', start: 0, length: 38, comment: "Plus fort en profondeur à droite = Yin fort — base Terre solide mais Bois l'envahit.", createdAt: '2026-02-10T09:59:00.000Z' },
        ],
        commentaireLibre: "Première participation — je suis encore en apprentissage des liens climatiques. Le lien stress-crise est l'indice le plus clair pour la grille 5 Éléments.",
        votePoints: 3,
        valeur: 1.0,
        difficultéEstimee: 'niveau_1ere',
      },
      {
        id: 'p002-demo-2',
        caseId: 'cas-002',
        type: 'variante',
        auteurPseudo: 'Anonyme',
        auteurStatut: 'praticien_experimente',
        role: 'praticien',
        publicationMode: 'anonyme',
        grillePrincipale: 'quatre_energies',
        grillesSecondaires: ['meridiens'],
        polarite: 'yang',
        raisonnement: "Lecture par les 4 Énergies : la chaleur locale relève d'une perturbation Iong/Oé — Oé agressive localement, Iong insuffisante à éteindre le foyer. Le Yang local (inflammation, chaleur, rougeur) masque un vide de Yang général (pouls superficiels absents). C'est la règle de paradoxe : Oé Yang bruyante localement sur fond d'Iong insuffisante.",
        categoriesDiagnostiques: [
          "Oé en plénitude locale — chaleur au gros orteil",
          "Iong insuffisante — vide de Yang général (pouls superficiels absents)",
          "Paradoxe Yang local / Vide Yang général",
        ],
        strategieTherapeutique: "Tonifier l'Iong générale. Disperser l'Oé locale. Agir sur le Foie/VB pour couper la source de chaleur.",
        pointsUtilises: [
          { code: '4GI', technique: 'tonification', justification: "Tonifie l'Oé générale (Iong)", ordre: 1 },
          { code: '36E', technique: 'tonification', justification: "Nourrit l'Iong — Yang général", ordre: 2 },
          { code: '2F', technique: 'dispersion', justification: "Chaleur locale du méridien Foie", ordre: 3 },
          { code: '38VB', technique: 'dispersion', justification: "Vide la VB de sa plénitude chaleur", ordre: 4 },
        ],
        bilanEnergetique: `1. Oé (Wei Qi) en plénitude locale au gros orteil — chaleur, rougeur, inflammation\n2. Iong (Ying Qi) insuffisante — vide de Yang général, pouls superficiels absents\n3. Vésicule Biliaire chargée de chaleur — source de la précipitation d'acide urique`,
        strategie: `1. Tonifier l'Iong générale (4GI, 36E) — traiter le vide de fond\n2. Disperser l'Oé en excès local (2F, 38VB)\n3. Éteindre la source de chaleur VB`,
        pointsProposer: [
          { code: '4GI', action: 'tonification', justification: "He Gu — tonifie l'Oé/Iong générale" },
          { code: '36E', action: 'tonification', justification: "Zu San Li — nourrit l'Iong et le Yang général" },
          { code: '2F', action: 'dispersion', justification: "Disperse la chaleur locale du méridien Foie" },
          { code: '38VB', action: 'dispersion', justification: "Vide la VB de sa chaleur et plénitude" },
        ],
        langueTexte: "Langue rouge avec enduit jaune-gras au centre. Corps rouge dans les zones Foie/VB (bords gauches).",
        annotationsLangue: [
          { id: 'ann-d002-2-l1', start: 0, length: 26, comment: "Rouge + enduit jaune = chaleur interne — confirme le tableau Oé en excès.", createdAt: '2026-02-11T09:00:00.000Z' },
        ],
        niveauConfiance: 'standard',
        sourceType: 'humaine',
        version: 1,
        annotationsInterrogatoire: [
          { id: 'ann-p002d2-1', start: 99, length: 83, comment: "Lien émotionnel direct = état Iong perturbée par les soucis (Rate/Estomac, psychisme).", createdAt: '2026-02-11T08:55:00.000Z' },
          { id: 'ann-p002d2-2', start: 0, length: 83, comment: "Crise il y a 1 an + état latent = tableau de plénitude chronique passée à la phase sub-aiguë.", createdAt: '2026-02-11T08:57:00.000Z' },
          { id: 'ann-p002d2-3', start: 272, length: 63, comment: "Acide urique confirmé = manifestation physique d'une plénitude VB non drainée (lectures 4 Énergies).", createdAt: '2026-02-11T08:58:00.000Z' },
        ],
        annotationsPouls: [
          { id: 'ann-p002d2-p1', start: 39, length: 27, comment: "Pouls superficiels absents = vide de Yang général — paradoxe avec le Yang local.", createdAt: '2026-02-11T08:59:00.000Z' },
        ],
        votePoints: 15,
        valeur: 1.0,
        difficultéEstimee: 'niveau_intermediaire',
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // CAS 3 — DIARRHÉES CHRONIQUES DU PETIT MATIN
  // Source : PVI EEA tome 3 — Tableau 6 (Diarrhées)
  // Grille principale : Zang/Fu — Yang de Ming Men décroît
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'cas-003',
    slug: 'diarrhees-petit-matin-vide-yang-rein',
    titre: 'Diarrhées chroniques du petit matin — vide de Yang Rein',
    statut: 'publie',
    niveauComplexite: 2,
    trancheAge: 'adulte',
    dateCreation: '2025-10-10',
    datePublication: '2025-10-25',
    casComplet: true,
    exemplaire: true,
    grillePrincipale: 'zang_fu',
    tags: ['diarrhées', 'petit matin', 'Rein', 'Yang', 'Ming Men', 'Foyer Inférieur'],
    viewCount: 224,
    content: {
      motif: "Diarrhées persistantes depuis plusieurs mois, survenant systématiquement au petit matin, entre 5h et 7h.",
      interrogatoire: [
        { cle: 'horaire', valeur: "Diarrhées exclusivement au petit matin (5h-7h), au moment où les Souffles Yang doivent monter en puissance." },
        { cle: 'selles', valeur: "Selles semi-liquides, peu douloureuses. Pas de crampes violentes." },
        { cle: 'general', valeur: "Visage terne, teint légèrement noirâtre. Esprit fatigué, manque d'entrain matinal." },
        { cle: 'traitement_froid_chaleur', valeur: "Amélioration avec la chaleur. Aggravation au froid et en hiver." },
        { cle: 'urine', valeur: "Urines claires, abondantes, parfois nocturies." },
        { cle: 'lombalgie', valeur: "Sensation de froid et faiblesse lombaire chronique, aggravée par le froid." },
      ],
      prisePouls: {
        condition: "Patient allongé, début de matinée",
        lectures: [
          {
            position: 'foyer_inferieur_gauche',
            qualites: ['vide', 'profond'],
            interpretation: "Pouls submergé, profond, fin au Foyer Inférieur — vide du Yang de Ming Men.",
          },
          {
            position: 'global_profond',
            qualites: ['vide', 'lent'],
            interpretation: "Pouls global profond, vide, lent — confirme le tableau de vide de Yang.",
          },
        ],
        synthese: "Vide profond du Yang du Rein — Ming Men insuffisant. Les Souffles Yang ne montent pas au petit matin (heure Yang Ming), laissant le Froid envahir le Réchauffeur Moyen.",
      },
      contexteVie: "Surmenage chronique depuis plusieurs années. Exposition répétée au froid. Alimentation irrégulière.",
    },
    analyses: [
      {
        id: 'a003-zangfu',
        caseId: 'cas-003',
        type: 'officielle',
        auteurPseudo: 'Dr Philippe Rochet',
        auteurStatut: 'expert',
        role: 'expert',
        publicationMode: 'public',
        votePoints: 28,
        valeur: 2.8,
        grillePrincipale: 'zang_fu',
        grillesSecondaires: ['yin_yang', 'trois_foyers'],
        polarite: 'yin',
        localisationFoyer: 'inferieur',
        raisonnement: `**Mécanisme central** : Le Rein est la racine de ce qui est thésaurisé — l'énergie ancestrale, le Tsing. Si le Yang authentique au milieu des Reins (Ming Men — Porte de la Vie) décroît, le Réchauffeur Moyen perd la solidité de sa défense. Les Souffles Yang ne peuvent plus stimuler la Rate et l'Estomac.

**Pourquoi le petit matin** : C'est le moment (5h-7h) où les Souffles Yang doivent monter en puissance pour lancer l'activité du Gros Intestin et la digestion matinale. Avec un vide de Yang du Rein, ce mouvement ascendant ne se fait pas. Le Yin et le Froid sont vainqueurs — le Réchauffeur Inférieur n'est pas assez réchauffé, il perd son pouvoir de retenir.

**Selles semi-liquides, peu douloureuses** : Cohérent avec le vide (pas d'attaque violente, pas de froid pervers externe). La pathologie est interne et chronique — elle s'est installée progressivement.

**Visage noirâtre** : Signe classique du vide de Yang du Rein en IEATC. Le noir correspond à l'élément Eau, dont le Rein est l'organe maître.

**Distinguer de la diarrhée par froid externe** : Ici, pas d'épisode aigu, pas de crampes violentes, pas de relation à un repas. C'est une défaillance de fond du Yang constitutif.`,
        categoriesDiagnostiques: [
          "Vide de Yang du Rein — Ming Men insuffisant",
          "Foyer Inférieur non réchauffé — Yin et Froid vainqueurs",
          "Souffles Yang ne montent plus au petit matin",
          "Réchauffeur Moyen non soutenu par le Feu du Ming Men",
        ],
        strategieTherapeutique: "Augmenter le Feu du Ming Men. Soutenir le Yang du Rein. Relancer la montée des Souffles Yang vers le Foyer Moyen. Tonifier la Terre (Rate/Estomac).",
        traitementPropose: `**Reconstituer le Yang du Rein et relancer le Feu de Ming Men :**

VG4 (Ming Men) — augmenter le Feu, Yang du Rein. Moxas recommandés.
V23 (Shu du Rein) — augmenter le Yang du Rein, tonifier directement.
VC4 (Guan Yuan) — tonifie l'origine du Rein, sépare le clair du trouble — action sur l'Intestin Grêle (Mo de IG).

**Relancer les Souffles Yang ascendants :**
VG20 avec moxas — fait monter les Souffles Yang vers la Rate et l'Estomac.

**Soutenir la Terre :**
V20 (Shu de la Rate) tonification — soutenir la Terre, consolider le Réchauffeur Moyen.`,
        pointsUtilises: [
          { code: '4TM', nomIeatc: 'Ming Men', technique: 'moxa_tonification', justification: "Feu de Ming Men — Yang du Rein", ordre: 1 },
          { code: '23V', technique: 'moxa_tonification', justification: "Shu du Rein — tonification directe Yang Rein", ordre: 2 },
          { code: '4JM', nomIeatc: 'Guan Yuan', technique: 'tonification', justification: "Origine Rein — Intestin Grêle — sépare clair et trouble", ordre: 3 },
          { code: '20TM', nomIeatc: 'Bai Hui', technique: 'moxa_tonification', justification: "Fait monter les Souffles Yang — action sur E/Rte", ordre: 4 },
          { code: '20V', technique: 'tonification', justification: "Shu de la Rate — soutient le Réchauffeur Moyen", ordre: 5 },
        ],
        niveauConfiance: 'expert',
        sourceType: 'editoriale',
        version: 1,
        enseignementCle: "Les diarrhées qui traînent, au petit matin, avec visage noirâtre et froid lombaire : penser immédiatement au vide de Yang du Rein. L'horaire 5h-7h est un signe diagnostique direct en IEATC.",
      },

      // ── Participations variantes — 8 analyses (offsets calculés par script Node) ──
      // interrogatoireText exact (longueur 730) :
      //   start=0   "Diarrhées persistantes depuis plusieurs mois..." (len 22)
      //   start=116 "Diarrhées exclusivement au petit matin (5h-7h)" (len 38)
      //   start=234 "Selles semi-liquides" (len 20)
      //   start=311 "Visage terne" (len 12)
      //   start=342 "noirâtre" (len 8)
      //   start=422 "Amélioration avec la chaleur" (len 28)
      //   start=452 "Aggravation au froid" (len 20)
      //   start=495 "Urines claires" (len 14)
      //   start=555 "Sensation de froid et faiblesse lombaire" (len 40)
      //   start=631 "Surmenage chronique" (len 19)
      // poulsText exact (longueur 66) :
      //   start=0  "foyer_inferieur_gauche — vide, profond" (len 38)
      //   start=39 "global_profond — vide, lent" (len 27)

      // [E1] Expert 1 — Zang/Fu + Cinq Éléments (offsets recalculés)
      {
        id: 'p003-expert-martine',
        caseId: 'cas-003',
        auteurId: 'user-expert-martine',
        type: 'variante',
        auteurPseudo: 'Dr Martine Soulier',
        auteurStatut: 'expert',
        role: 'expert',
        publicationMode: 'public',
        grillePrincipale: 'zang_fu',
        grillesSecondaires: ['cinq_elements'],
        polarite: 'yin',
        localisationFoyer: 'inferieur',
        raisonnement: `Lecture Zang/Fu centrée sur le Rein comme organe-racine. Le Ming Men est la Porte de la Vie — sa chaleur réchauffante monte depuis le bas du dos pour activer la Rate et permettre la transformation des aliments. Quand ce feu baisse, la Rate est froide, la digestion ralentit, et les aliments non transformés passent directement dans le Gros Intestin sous forme semi-liquide.

L'horaire 5h-7h est le temps du Yang Ming (Gros Intestin) — le moment où le Yang devrait être en plein essor pour activer l'évacuation des selles. Un vide de Yang du Rein signifie que le Yang Ming ne reçoit pas son stimulus énergétique.

La lecture 5 Éléments enrichit : l'Eau (Rein) faible ne nourrit plus le Bois (Foie) — le cycle Sheng est brisé dès la base. Le visage noirâtre est le signe classique de l'élément Eau en souffrance.`,
        categoriesDiagnostiques: [
          "Vide de Yang du Rein — Ming Men éteint",
          "Rate non réchauffée par le Feu du Rein — digestion défaillante",
          "Yang Ming sans stimulus — Gros Intestin non activé au petit matin",
          "Eau faible → cycle Sheng brisé (Eau ne nourrit plus Bois)",
        ],
        strategieTherapeutique: `1. Ranimer le Feu du Ming Men (VG4, V23 avec moxas).
2. Réchauffer la Rate/Estomac (V20, VC12 tonification).
3. Soutenir le Yang Ming (36E, 25E bilatéral).`,
        pointsUtilises: [
          { code: '4TM', nomIeatc: 'Ming Men', technique: 'moxa_tonification', justification: "Ranime le Feu de Ming Men — racine du Yang", ordre: 1 },
          { code: '23V', technique: 'moxa_tonification', justification: "Shu du Rein — tonifie directement le Yang du Rein", ordre: 2 },
          { code: '20V', technique: 'tonification', justification: "Shu de la Rate — réchauffer la Terre", ordre: 3 },
          { code: '12JM', technique: 'tonification', justification: "Mo de l'Estomac — relancer le Foyer Moyen", ordre: 4 },
          { code: '36E', technique: 'moxa_tonification', justification: "Yang Ming — stimuler le Yang de la digestion", ordre: 5 },
        ],
        bilanEnergetique: `1. Vide de Yang du Rein — Ming Men éteint (racine profonde du tableau)\n2. Rate non réchauffée — le Feu du Rein ne monte plus, digestion froide\n3. Yang Ming (GI) sans stimulus — diarrhées au petit matin (heure GI)\n4. Visage noirâtre — signe clinique d'insuffisance de l'élément Eau`,
        strategie: `1. Ranimer le Feu du Ming Men avec moxas (VG4, V23)\n2. Réchauffer la Rate/Estomac pour relancer la transformation (V20, VC12)\n3. Consolider le Yang Ming pour activer le GI au petit matin (36E, 25E)`,
        pointsProposer: [
          { code: '4TM', action: 'tonification', justification: "Ming Men — Porte de la Vie, racine du Yang — moxa indispensable" },
          { code: '23V', action: 'tonification', justification: "Shu du Rein — tonification directe du Yang profond" },
          { code: '20V', action: 'tonification', justification: "Shu de la Rate — réchauffer la Terre depuis le dos" },
          { code: '12JM', action: 'tonification', justification: "Mo de l'Estomac — relancer le Foyer Moyen" },
          { code: '36E', action: 'tonification', justification: "Zu San Li — Yang Ming, digestion, état général" },
        ],
        // Offsets calculés sur langueTexte "Langue pâle avec teinte légèrement noirâtre à la racine (zone Rein). Enduit blanc épais et humide. Corps légèrement gonflé." :
        // start=0 len=44 "Langue pâle avec teinte légèrement noirâtre"
        // start=69 len=31 "Enduit blanc épais et humide."
        langueTexte: "Langue pâle avec teinte légèrement noirâtre à la racine (zone Rein). Enduit blanc épais et humide. Corps légèrement gonflé.",
        annotationsLangue: [
          { id: 'ann-p003e1-l1', start: 0, length: 43, comment: "Pâle avec teinte noirâtre = vide de Yang du Rein — signe de l'élément Eau (Su Wen).", createdAt: '2026-03-01T09:00:00.000Z' },
          { id: 'ann-p003e1-l2', start: 70, length: 28, comment: "Enduit blanc épais et humide = Froid-Humidité interne — Rate non transformante.", createdAt: '2026-03-01T09:02:00.000Z' },
        ],
        // Offsets calculés sur interrogatoireText (longueur 730) :
        // start=116 len=38 "Diarrhées exclusivement au petit matin (5h-7h)"
        // start=342 len=8  "noirâtre"
        // start=422 len=28 "Amélioration avec la chaleur"
        // start=555 len=40 "Sensation de froid et faiblesse lombaire"
        annotationsInterrogatoire: [
          { id: 'ann-p003e1-i1', start: 116, length: 38, comment: "Diarrhées exclusivement au petit matin = heure Yang Ming (GI 5h-7h) — vide de Yang ne stimule pas GI.", createdAt: '2026-03-01T08:55:00.000Z' },
          { id: 'ann-p003e1-i2', start: 342, length: 8, comment: "Noirâtre = signe classique de l'élément Eau en souffrance (IEATC, Su Wen chap. 24).", createdAt: '2026-03-01T08:57:00.000Z' },
          { id: 'ann-p003e1-i3', start: 422, length: 28, comment: "Amélioration à la chaleur = vide de Yang confirmé — le Yang externe compense le manque interne.", createdAt: '2026-03-01T08:59:00.000Z' },
          { id: 'ann-p003e1-i4', start: 555, length: 40, comment: "Froid et faiblesse lombaire = siège du Rein (Ming Men) — confirme l'insuffisance de Yang Rein.", createdAt: '2026-03-01T09:00:00.000Z' },
        ],
        // Pouls : start=0 len=38, start=39 len=27
        annotationsPouls: [
          { id: 'ann-p003e1-p1', start: 0, length: 38, comment: "Vide profond au Foyer Inférieur = insuffisance Yang du Rein — Ming Men déclinant.", createdAt: '2026-03-01T09:01:00.000Z' },
          { id: 'ann-p003e1-p2', start: 39, length: 27, comment: "Pouls global vide et lent = vide Yang général — confirme le tableau de fond Zang/Fu.", createdAt: '2026-03-01T09:02:00.000Z' },
        ],
        commentaireLibre: "Ce cas illustre la règle de Ming Men : sans Feu à la racine, aucune transformation n'est possible. Les moxas sur VG4 et V23 sont indispensables — pas d'acupuncture seule ici.",
        niveauConfiance: 'expert',
        sourceType: 'humaine',
        version: 1,
        votePoints: 29,
        valeur: 1.0,
        votes: [],
        difficultéEstimee: 'niveau_4e',
      },

      // [E2] Expert 2 — Yin/Yang + focus constitutionnel
      {
        id: 'p003-expert-anneclaire',
        caseId: 'cas-003',
        auteurId: 'user-expert-anneclaire',
        type: 'variante',
        auteurPseudo: 'Dr Anne-Claire Renard',
        auteurStatut: 'expert',
        role: 'expert',
        publicationMode: 'public',
        grillePrincipale: 'yin_yang',
        grillesSecondaires: ['zang_fu'],
        polarite: 'yin',
        localisationFoyer: 'inferieur',
        raisonnement: `Lecture Yin/Yang fondamentale : le Yang global est insuffisant. Tout le tableau est Yin en excès et Yang en déficit : diarrhées (humidité = Yin), horaire matinal (le Yang ne monte pas), lombaires froids (Yin domine), urines claires (Yang ne retient pas).

La règle en Yin/Yang : si le Yang général est vide, tonifier le Yang partout — on n'isole jamais le traitement local. Les moxas sont ici fondamentaux : c'est la technique Yang par excellence.

Le surmenage chronique est l'étiologie typique : la sur-utilisation épuise le Yang du Rein sur des années. Tableau constitutionnel — la guérison prendra plusieurs séries.`,
        categoriesDiagnostiques: [
          "Vide de Yang global — tableau constitutionnel",
          "Yin en excès au Foyer Inférieur (froid, humidité, rétention)",
          "Yang insuffisant pour activer le GI et réchauffer le Foyer Moyen",
        ],
        strategieTherapeutique: `1. Tonifier le Yang global (VG4, 4GI, 36E en moxas).\n2. Réchauffer spécifiquement le Foyer Inférieur (VC4, VC6 moxas).\n3. Consolider la Terre (V20 tonification).`,
        pointsUtilises: [
          { code: '4TM', nomIeatc: 'Ming Men', technique: 'moxa_tonification', justification: "Yang du Rein — point majeur du Yang du dos", ordre: 1 },
          { code: '4GI', nomIeatc: 'He Gu', technique: 'moxa_tonification', justification: "Yang général — tonifier le Yang dans l'ensemble du corps", ordre: 2 },
          { code: '36E', technique: 'moxa_tonification', justification: "Yang général et digestion", ordre: 3 },
          { code: '4JM', nomIeatc: 'Guan Yuan', technique: 'moxa_tonification', justification: "Réchauffer le Foyer Inférieur — Yin et Yang du Rein", ordre: 4 },
          { code: '20V', technique: 'tonification', justification: "Shu de la Rate — consolide le Foyer Moyen", ordre: 5 },
        ],
        bilanEnergetique: `1. Vide de Yang global — constitutionnel, aggravé par surmenage chronique\n2. Yin en excès au Foyer Inférieur — froid, humidité, urines claires\n3. Foyer Moyen non réchauffé par le Yang du bas — digestion défaillante le matin\n4. Surmenage = épuisement progressif du Yang constitutionnel du Rein`,
        strategie: `1. Tonifier le Yang global avec moxas (VG4, 4GI, 36E)\n2. Réchauffer spécifiquement le Foyer Inférieur (VC4, VC6 moxas)\n3. Consolider la Rate/Estomac (V20 tonification)`,
        pointsProposer: [
          { code: '4TM', action: 'tonification', justification: "Ming Men — Yang du Rein, indispensable avec moxas" },
          { code: '4GI', action: 'tonification', justification: "He Gu — tonifie le Yang général dans tout le corps" },
          { code: '36E', action: 'tonification', justification: "Yang général + digestion + état de fond" },
          { code: '4JM', action: 'tonification', justification: "Réchauffer le Foyer Inférieur — Yin/Yang du Rein" },
          { code: '20V', action: 'tonification', justification: "Shu de la Rate — consolide le Foyer Moyen" },
        ],
        // langueTexte longueur 95 — "Langue pâle, légèrement humide. Corps flasque. Enduit blanc fin."
        // start=0 len=26 "Langue pâle, légèrement humide."
        langueTexte: "Langue pâle, légèrement humide. Corps flasque. Enduit blanc fin. Absence de chaleur à la pointe.",
        annotationsLangue: [
          { id: 'ann-p003e2-l1', start: 0, length: 30, comment: "Pâle et humide = Yang vide, Yin en excès — confirme le tableau Yin/Yang fondamental.", createdAt: '2026-03-02T09:00:00.000Z' },
        ],
        // Offsets calculés :
        // start=422 len=28 "Amélioration avec la chaleur"
        // start=452 len=20 "Aggravation au froid"
        // start=555 len=40 "Sensation de froid et faiblesse lombaire"
        // start=631 len=19 "Surmenage chronique"
        annotationsInterrogatoire: [
          { id: 'ann-p003e2-i1', start: 422, length: 28, comment: "Amélioration à la chaleur = Yang apporté de l'extérieur compense le vide interne — confirme vide Yang.", createdAt: '2026-03-02T08:55:00.000Z' },
          { id: 'ann-p003e2-i2', start: 452, length: 20, comment: "Aggravation au froid = Yin en excès aggravé par le Yin externe — confirme la polarité.", createdAt: '2026-03-02T08:57:00.000Z' },
          { id: 'ann-p003e2-i3', start: 555, length: 40, comment: "Froid et faiblesse lombaire = siège du vide de Yang du Rein (Ming Men) — signe clé.", createdAt: '2026-03-02T08:59:00.000Z' },
          { id: 'ann-p003e2-i4', start: 631, length: 19, comment: "Surmenage chronique = étiologie classique du vide Yang constitutionnel du Rein.", createdAt: '2026-03-02T09:00:00.000Z' },
        ],
        // Pouls : start=0 len=38 (total du poulsText = 66)
        annotationsPouls: [
          { id: 'ann-p003e2-p1', start: 0, length: 66, comment: "Vide profond + global vide et lent = tableau de vide Yang global constitutionnel — moxas indispensables.", createdAt: '2026-03-02T09:01:00.000Z' },
        ],
        commentaireLibre: "Le traitement Yin/Yang est ici le plus simple et le plus direct. Tonifier le Yang général avec moxas sur plusieurs séries. La guérison sera lente mais profonde.",
        niveauConfiance: 'expert',
        sourceType: 'humaine',
        version: 1,
        votePoints: 24,
        valeur: 1.0,
        votes: [],
        difficultéEstimee: 'niveau_intermediaire',
      },

      // [PE1] Praticien expérimenté 1 — Vaisseaux Merveilleux + Zang/Fu
      {
        id: 'p003-praticien-bernard',
        caseId: 'cas-003',
        auteurId: 'user-praticien-bernard',
        type: 'variante',
        auteurPseudo: 'Bernard C.',
        auteurStatut: 'praticien_experimente',
        role: 'praticien',
        publicationMode: 'public',
        grillePrincipale: 'merveilleux_vaisseaux',
        grillesSecondaires: ['zang_fu'],
        polarite: 'yin',
        localisationFoyer: 'inferieur',
        raisonnement: "Approche par les Vaisseaux Merveilleux : Ren Mai et Du Mai sont le nœud de la problématique Yin/Yang verticale. Le Du Mai gouverne le Yang — si le Feu de Ming Men s'affaiblit, c'est le Du Mai qui ne soutient plus le Yang ascendant. Traiter VG4 comme entrée Du Mai, VC4 comme entrée Ren Mai.",
        categoriesDiagnostiques: [
          "Du Mai insuffisant — Feu de Ming Men déclinant",
          "Yang ne monte plus le long du Du Mai",
          "Ren Mai fragilisé — Yin insuffisant pour ancrer le Yang",
        ],
        strategieTherapeutique: `1. Tonifier Ming Men (VG4) — restaurer le Feu via Du Mai.\n2. Tonifier Guan Yuan (VC4) — nourrir le Yin de base via Ren Mai.\n3. Shu du Rein (V23) pour soutenir directement le Rein.`,
        pointsUtilises: [
          { code: '4TM', nomIeatc: 'Ming Men', technique: 'moxa_tonification', justification: "Feu de Ming Men — entrée Du Mai — Yang ascendant", ordre: 1 },
          { code: '4JM', nomIeatc: 'Guan Yuan', technique: 'tonification', justification: "Ren Mai — Yin de base — ancre le Yang", ordre: 2 },
          { code: '23V', technique: 'moxa_tonification', justification: "Shu du Rein — soutien direct", ordre: 3 },
          { code: '12JM', technique: 'tonification', justification: "Foyer Moyen — soutenir la Rate/Estomac", ordre: 4 },
        ],
        bilanEnergetique: `1. Du Mai insuffisant — Feu de Ming Men déclinant, Yang ne monte plus\n2. Ren Mai fragilisé — Yin insuffisant pour ancrer le Yang ascendant\n3. Foyer Inférieur non réchauffé → Foyer Moyen sans soutien énergétique\n4. Diarrhées matinales = Du Mai ne soutient plus le Yang Ming au petit matin`,
        strategie: `1. Restaurer le Feu de Ming Men via Du Mai (VG4 moxas)\n2. Nourrir le Yin de base via Ren Mai (VC4 tonification)\n3. Soutenir directement le Rein (V23 moxas)`,
        pointsProposer: [
          { code: '4TM', action: 'tonification', justification: "Ming Men — entrée Du Mai — restaure le Yang ascendant" },
          { code: '4JM', action: 'tonification', justification: "Guan Yuan — entrée Ren Mai — ancre le Yin de base" },
          { code: '23V', action: 'tonification', justification: "Shu du Rein — soutien direct du Rein (moxas)" },
          { code: '12JM', action: 'tonification', justification: "Foyer Moyen — relancer la Rate/Estomac" },
        ],
        // langueTexte longueur 79 — "Langue pâle, corps légèrement gonflé. Enduit blanc épais et humide à la racine."
        // start=0 len=37 "Langue pâle, corps légèrement gonflé."
        langueTexte: "Langue pâle, corps légèrement gonflé. Enduit blanc épais et humide à la racine.",
        annotationsLangue: [
          { id: 'ann-p003pe-ber-l1', start: 0, length: 36, comment: "Pâle avec corps gonflé = vide Yang Rein + Froid interne — Du/Ren Mai insuffisants.", createdAt: '2026-03-03T10:00:00.000Z' },
        ],
        // Offsets calculés :
        // start=0  len=22 "Diarrhées persistantes"
        // start=555 len=40 "Sensation de froid et faiblesse lombaire"
        // start=631 len=19 "Surmenage chronique"
        // start=495 len=14 "Urines claires"
        annotationsInterrogatoire: [
          { id: 'ann-p003pe-ber-i1', start: 0, length: 22, comment: "Diarrhées persistantes depuis plusieurs mois = vide de fond — Du Mai chroniquement insuffisant.", createdAt: '2026-03-03T09:55:00.000Z' },
          { id: 'ann-p003pe-ber-i2', start: 555, length: 40, comment: "Froid lombaire = siège du Du Mai et du Rein — confirme l'insuffisance de Ming Men.", createdAt: '2026-03-03T09:57:00.000Z' },
          { id: 'ann-p003pe-ber-i3', start: 631, length: 19, comment: "Surmenage chronique = dépense excessive du Yang ancestral (Rein) — étiologie classique.", createdAt: '2026-03-03T09:59:00.000Z' },
          { id: 'ann-p003pe-ber-i4', start: 495, length: 14, comment: "Urines claires = Yang du Rein ne retient plus les liquides — Du Mai insuffisant.", createdAt: '2026-03-03T10:00:00.000Z' },
        ],
        // Pouls : start=0 len=38
        annotationsPouls: [
          { id: 'ann-p003pe-ber-p1', start: 0, length: 38, comment: "Vide profond Foyer Inférieur = Du Mai insuffisant — racine Yang défaillante.", createdAt: '2026-03-03T10:01:00.000Z' },
          { id: 'ann-p003pe-ber-p2', start: 39, length: 27, comment: "Global vide et lent = Ren Mai fragilisé — Yin insuffisant pour ancrer le Yang.", createdAt: '2026-03-03T10:02:00.000Z' },
        ],
        commentaireLibre: "Les Vaisseaux Merveilleux sur les tableaux de vide profond agissent sur les racines énergétiques — plus profond que l'action des méridiens simples.",
        niveauConfiance: 'standard',
        sourceType: 'humaine',
        version: 1,
        votePoints: 16,
        valeur: 1.0,
        votes: [],
        difficultéEstimee: 'niveau_4e',
      },

      // [PE2] Praticien expérimenté 2 — Trois Foyers + Zang/Fu (anonyme)
      {
        id: 'p003-praticien-anon',
        caseId: 'cas-003',
        auteurId: 'user-praticien-anon-3',
        type: 'variante',
        auteurPseudo: 'Anonyme',
        auteurStatut: 'praticien_experimente',
        role: 'praticien',
        publicationMode: 'anonyme',
        grillePrincipale: 'trois_foyers',
        grillesSecondaires: ['zang_fu'],
        polarite: 'yin',
        localisationFoyer: 'inferieur',
        raisonnement: "Lecture Trois Foyers : le Foyer Inférieur est en vide de Yang profond (diarrhées matinales, froid lombaire, urines claires). Ce vide ne soutient plus le Foyer Moyen — d'où la faiblesse digestive générale. La règle des 3 Foyers : traiter toujours du bas vers le haut quand il y a vide.",
        categoriesDiagnostiques: [
          "Foyer Inférieur en vide de Yang — Rein/Ming Men insuffisants",
          "Foyer Moyen non soutenu par le Foyer Inférieur",
          "Diarrhées = Foyer Inférieur ne retient plus (Yang insuffisant)",
        ],
        strategieTherapeutique: `1. Tonifier le Yang du Foyer Inférieur en priorité (VG4, V23).\n2. Consolider le Foyer Moyen secondairement (V20, VC12).`,
        pointsUtilises: [
          { code: '4TM', nomIeatc: 'Ming Men', technique: 'moxa_tonification', justification: "Yang du Foyer Inférieur — Ming Men en priorité", ordre: 1 },
          { code: '23V', technique: 'moxa_tonification', justification: "Shu du Rein — tonification directe Foyer Inférieur", ordre: 2 },
          { code: '20V', technique: 'tonification', justification: "Shu de la Rate — consolide Foyer Moyen", ordre: 3 },
          { code: '12JM', technique: 'tonification', justification: "Mo de l'Estomac — renforce la digestion", ordre: 4 },
          { code: '6JM', technique: 'moxa_tonification', justification: "Réchauffer le Foyer Inférieur directement", ordre: 5 },
        ],
        bilanEnergetique: `1. Foyer Inférieur vide de Yang — Rein insuffisant, froid lombaire\n2. Foyer Moyen fragilisé secondairement — Rate/Estomac sans soutien\n3. Diarrhées matinales = Foyer Inférieur ne retient plus les liquides\n4. Urines claires = Yang du Rein ne retient plus l'Eau`,
        strategie: `1. Tonifier le Yang du Foyer Inférieur en priorité (VG4, V23 moxas)\n2. Consolider ensuite le Foyer Moyen (V20, VC12)\n3. Traitement sur plusieurs séries — vide constitutionnel`,
        pointsProposer: [
          { code: '4TM', action: 'tonification', justification: "Yang du Foyer Inférieur — Ming Men, moxas indispensables" },
          { code: '23V', action: 'tonification', justification: "Shu du Rein — tonification directe Foyer Inférieur" },
          { code: '20V', action: 'tonification', justification: "Shu de la Rate — consolide Foyer Moyen" },
          { code: '12JM', action: 'tonification', justification: "Mo de l'Estomac — relancer la digestion" },
          { code: '6JM', action: 'tonification', justification: "Réchauffer directement le Foyer Inférieur" },
        ],
        // langueTexte longueur 87 — "Langue pâle avec teinte noirâtre discrète à la racine (zone Rein)..."
        // start=0 len=52 "Langue pâle avec teinte noirâtre discrète à la racine (zone Rein)."
        langueTexte: "Langue pâle avec teinte noirâtre discrète à la racine (zone Rein). Enduit blanc-humide.",
        annotationsLangue: [
          { id: 'ann-p003pe-anon-l1', start: 0, length: 66, comment: "Pâle + teinte noirâtre à la racine = vide de Yang du Rein — signe diagnostique Trois Foyers Inférieur.", createdAt: '2026-03-06T10:00:00.000Z' },
        ],
        // Offsets calculés :
        // start=116 len=38 "Diarrhées exclusivement au petit matin (5h-7h)"
        // start=555 len=40 "Sensation de froid et faiblesse lombaire"
        // start=495 len=14 "Urines claires"
        // start=422 len=28 "Amélioration avec la chaleur"
        annotationsInterrogatoire: [
          { id: 'ann-p003pe-anon-i1', start: 116, length: 38, comment: "5h-7h = heure Yang Ming (GI) — vide du Foyer Inférieur ne stimule pas le Yang Ming.", createdAt: '2026-03-06T09:55:00.000Z' },
          { id: 'ann-p003pe-anon-i2', start: 555, length: 40, comment: "Froid et faiblesse lombaire = siège du Foyer Inférieur — localisation du vide Yang.", createdAt: '2026-03-06T09:57:00.000Z' },
          { id: 'ann-p003pe-anon-i3', start: 495, length: 14, comment: "Urines claires = Yang du Rein ne retient plus les liquides (Foyer Inférieur défaillant).", createdAt: '2026-03-06T09:58:00.000Z' },
          { id: 'ann-p003pe-anon-i4', start: 422, length: 28, comment: "Amélioration à la chaleur = vide de Yang du Foyer Inférieur — le Yang externe compense.", createdAt: '2026-03-06T09:59:00.000Z' },
        ],
        // Pouls : start=0 len=38
        annotationsPouls: [
          { id: 'ann-p003pe-anon-p1', start: 0, length: 38, comment: "Vide profond Foyer Inférieur = Rein Yang insuffisant — confirme le diagnostic Trois Foyers.", createdAt: '2026-03-06T10:01:00.000Z' },
          { id: 'ann-p003pe-anon-p2', start: 39, length: 27, comment: "Global vide et lent = vide Yang général — Foyer Moyen sans soutien par le bas.", createdAt: '2026-03-06T10:02:00.000Z' },
        ],
        commentaireLibre: "La règle des 3 Foyers est claire ici : traiter toujours du bas vers le haut quand il y a vide. Le Foyer Inférieur vide est la cause primaire — le Foyer Moyen faible en est la conséquence.",
        niveauConfiance: 'standard',
        sourceType: 'humaine',
        version: 1,
        votePoints: 11,
        valeur: 1.0,
        votes: [],
        difficultéEstimee: 'niveau_4e',
      },

      // [JP1] Jeune praticien 1 — Yin/Yang simple
      {
        id: 'p003-jeune-paul',
        caseId: 'cas-003',
        auteurId: 'user-jeune-paul',
        type: 'variante',
        auteurPseudo: 'Paul R.',
        auteurStatut: 'jeune_praticien',
        role: 'praticien',
        publicationMode: 'public',
        grillePrincipale: 'yin_yang',
        polarite: 'yin',
        localisationFoyer: 'inferieur',
        raisonnement: "Lecture Yin/Yang directe : le Yang est insuffisant — il ne réchauffe plus le Foyer Inférieur. Les selles fluides et peu douloureuses confirment le vide (pas de crampes = pas de plein Yang). L'amélioration à la chaleur est la preuve diagnostique de vide Yang.",
        categoriesDiagnostiques: [
          "Vide de Yang au Foyer Inférieur",
          "Froid interne — manque de chaleur Yang",
        ],
        strategieTherapeutique: `1. Tonifier le Yang du Rein (VG4, moxas).\n2. Réchauffer directement le Foyer Inférieur (VC6, moxas).\n3. Soutenir le Yang général (36E moxas).`,
        pointsUtilises: [
          { code: '4TM', nomIeatc: 'Ming Men', technique: 'moxa_tonification', justification: "Yang du Rein — Ming Men essentiel avec moxas", ordre: 1 },
          { code: '36E', technique: 'moxa_tonification', justification: "Yang général et digestion", ordre: 2 },
          { code: '6JM', technique: 'moxa_tonification', justification: "Réchauffer le Foyer Inférieur directement", ordre: 3 },
          { code: '23V', technique: 'moxa_tonification', justification: "Shu du Rein — tonification directe", ordre: 4 },
        ],
        bilanEnergetique: `1. Vide de Yang au Foyer Inférieur — Ming Men insuffisant\n2. Froid interne — manque de chaleur Yang pour réchauffer le Foyer Moyen\n3. Digestion défaillante le matin — Yang ne monte pas à l'heure GI (5h-7h)`,
        strategie: `1. Tonifier le Yang du Rein (VG4 moxas)\n2. Réchauffer le Foyer Inférieur (VC6 moxas)\n3. Soutenir le Yang général (36E moxas)`,
        pointsProposer: [
          { code: '4TM', action: 'tonification', justification: "Ming Men — Yang du Rein, indispensable avec moxas" },
          { code: '36E', action: 'tonification', justification: "Yang général + activation digestive matinale" },
          { code: '6JM', action: 'tonification', justification: "Réchauffer le Foyer Inférieur directement" },
          { code: '23V', action: 'tonification', justification: "Shu du Rein — soutient le Ming Men" },
        ],
        // langueTexte longueur 63 — "Langue pâle, légèrement humide. Corps normal. Enduit blanc fin."
        // start=0 len=12 "Langue pâle,"
        langueTexte: "Langue pâle, légèrement humide. Corps normal. Enduit blanc fin.",
        annotationsLangue: [
          { id: 'ann-p003jp-paul-l1', start: 0, length: 12, comment: "Pâle = vide de Yang — confirme le tableau Yin/Yang de vide.", createdAt: '2026-03-07T09:55:00.000Z' },
        ],
        commentaireLibre: "Premier cas de diarrhée chronique — l'horaire (5h-7h) est un indice diagnostique que je n'avais pas encore bien intégré. L'amélioration à la chaleur est la clé.",
        // Offsets calculés :
        // start=422 len=28 "Amélioration avec la chaleur"
        // start=495 len=14 "Urines claires"
        // start=234 len=20 "Selles semi-liquides"
        // start=116 len=38 "Diarrhées exclusivement au petit matin (5h-7h)"
        annotationsInterrogatoire: [
          { id: 'ann-p003jp-paul-i1', start: 422, length: 28, comment: "Amélioration à la chaleur = preuve de vide Yang — c'est l'indice le plus direct.", createdAt: '2026-03-07T09:50:00.000Z' },
          { id: 'ann-p003jp-paul-i2', start: 495, length: 14, comment: "Urines claires = Yang ne retient plus les liquides — vide de Yang du Rein confirmé.", createdAt: '2026-03-07T09:51:00.000Z' },
          { id: 'ann-p003jp-paul-i3', start: 234, length: 20, comment: "Selles semi-liquides peu douloureuses = vide (pas de crampes = pas de plein) — Yang insuffisant.", createdAt: '2026-03-07T09:52:00.000Z' },
          { id: 'ann-p003jp-paul-i4', start: 116, length: 38, comment: "Petit matin = heure Yang Ming — vide de Yang ne stimule pas le GI à son heure.", createdAt: '2026-03-07T09:53:00.000Z' },
        ],
        // Pouls : start=39 len=27
        annotationsPouls: [
          { id: 'ann-p003jp-paul-p1', start: 39, length: 27, comment: "Vide et lent global = vide de Yang général — confirme le tableau Yin/Yang.", createdAt: '2026-03-07T09:54:00.000Z' },
          { id: 'ann-p003jp-paul-p2', start: 0, length: 38, comment: "Vide profond Foyer Inférieur = Yang Rein insuffisant — racine du tableau.", createdAt: '2026-03-07T09:55:00.000Z' },
        ],
        niveauConfiance: 'standard',
        sourceType: 'humaine',
        version: 1,
        votePoints: 4,
        valeur: 1.0,
        votes: [],
        difficultéEstimee: 'niveau_intermediaire',
      },

      // [JP2] Jeune praticien 2 — Cinq Éléments (anonyme)
      {
        id: 'p003-jeune-anon',
        caseId: 'cas-003',
        auteurId: 'user-jeune-anon-3',
        type: 'variante',
        auteurPseudo: 'Anonyme',
        auteurStatut: 'jeune_praticien',
        role: 'praticien',
        publicationMode: 'anonyme',
        grillePrincipale: 'cinq_elements',
        grillesSecondaires: ['zang_fu'],
        polarite: 'yin',
        localisationFoyer: 'inferieur',
        raisonnement: "Lecture Cinq Éléments : l'Eau (Rein) est en vide profond. Le visage noirâtre est le signe de l'élément Eau en souffrance. Le Bois (Foie) mal nourri par l'Eau ne peut plus soutenir la Terre (Rate/Estomac) — d'où les diarrhées chroniques par faiblesse digestive.",
        categoriesDiagnostiques: [
          "Vide profond de l'Eau (Rein) — élément noirâtre",
          "Bois mal nourri par l'Eau — cycle Sheng insuffisant",
          "Terre (Rate/Estomac) fragilisée secondairement",
        ],
        strategieTherapeutique: `1. Nourrir l'Eau (Rein) — base du cycle Sheng.\n2. Soutenir le Bois (Foie) pour relancer le cycle.\n3. Consolider la Terre (Rate/Estomac).`,
        pointsUtilises: [
          { code: '4TM', nomIeatc: 'Ming Men', technique: 'moxa_tonification', justification: "Yang du Rein — Feu de l'Eau dans les 5 Éléments", ordre: 1 },
          { code: '3R', nomIeatc: 'Tai Xi', technique: 'tonification', justification: "Source Yin du Rein — nourrit la base Eau", ordre: 2 },
          { code: '36E', technique: 'moxa_tonification', justification: "Soutient la Terre — relance la digestion", ordre: 3 },
          { code: '20V', technique: 'tonification', justification: "Shu de la Rate — consolide la Terre", ordre: 4 },
        ],
        bilanEnergetique: `1. Vide profond de l'Eau (Rein) — visage noirâtre, signe de l'élément Eau\n2. Bois mal nourri par l'Eau — cycle Sheng brisé dès la base\n3. Terre fragilisée secondairement — Rate/Estomac sans soutien`,
        strategie: `1. Nourrir l'Eau (VG4 moxas, R3 Tai Xi)\n2. Relancer le cycle Sheng Eau→Bois→Terre\n3. Consolider la Terre (36E moxas, V20)`,
        pointsProposer: [
          { code: '4TM', action: 'tonification', justification: "Feu de l'Eau (Ming Men) — Yang du Rein" },
          { code: '3R', action: 'tonification', justification: "Tai Xi — source Yin du Rein, base Eau du cycle Sheng" },
          { code: '36E', action: 'tonification', justification: "Soutient la Terre — relance la digestion" },
          { code: '20V', action: 'tonification', justification: "Shu de la Rate — consolide la Terre" },
        ],
        // langueTexte longueur 65 — "Langue pâle avec enduit blanc-crémeux en zone centrale et racine."
        // start=0 len=12 "Langue pâle"
        langueTexte: "Langue pâle avec enduit blanc-crémeux en zone centrale et racine.",
        annotationsLangue: [
          { id: 'ann-p003jp-anon-l1', start: 0, length: 11, comment: "Langue pâle = vide Yin de l'Eau (Rein) — confirme la grille 5 Éléments.", createdAt: '2026-03-08T10:00:00.000Z' },
        ],
        commentaireLibre: "Le visage noirâtre m'a guidé vers la lecture 5 Éléments — c'est le signe le plus direct de l'Eau en souffrance selon l'IEATC.",
        // Offsets calculés :
        // start=311 len=12 "Visage terne"
        // start=342 len=8  "noirâtre"
        // start=116 len=38 "Diarrhées exclusivement au petit matin (5h-7h)"
        // start=555 len=40 "Sensation de froid et faiblesse lombaire"
        annotationsInterrogatoire: [
          { id: 'ann-p003jp-anon-i1', start: 311, length: 12, comment: "Visage terne = signe de l'Eau insuffisante — premier indice 5 Éléments.", createdAt: '2026-03-08T09:55:00.000Z' },
          { id: 'ann-p003jp-anon-i2', start: 342, length: 8, comment: "Noirâtre = couleur de l'Eau (Rein) — signe diagnostique 5 Éléments classique.", createdAt: '2026-03-08T09:56:00.000Z' },
          { id: 'ann-p003jp-anon-i3', start: 116, length: 38, comment: "Petit matin = heure Yang Ming — l'Eau ne soutient plus le Yang Ming.", createdAt: '2026-03-08T09:57:00.000Z' },
          { id: 'ann-p003jp-anon-i4', start: 555, length: 40, comment: "Froid et faiblesse lombaire = siège du Rein (Eau) — confirme le vide de l'élément.", createdAt: '2026-03-08T09:58:00.000Z' },
        ],
        // Pouls : start=0 len=38
        annotationsPouls: [
          { id: 'ann-p003jp-anon-p1', start: 0, length: 38, comment: "Vide profond Foyer Inférieur = insuffisance de l'Eau — confirme le diagnostic 5 Éléments.", createdAt: '2026-03-08T09:59:00.000Z' },
          { id: 'ann-p003jp-anon-p2', start: 39, length: 27, comment: "Vide et lent global = tableau de fond de l'Eau insuffisante — tout le cycle Sheng est affecté.", createdAt: '2026-03-08T10:00:00.000Z' },
        ],
        niveauConfiance: 'standard',
        sourceType: 'humaine',
        version: 1,
        votePoints: 3,
        valeur: 1.0,
        votes: [],
        difficultéEstimee: 'niveau_intermediaire',
      },

      // [Et1] Étudiant 4e année 1 — Yin/Yang simple
      {
        id: 'p003-etudiant4-martin',
        caseId: 'cas-003',
        auteurId: 'user-etudiant4-martin',
        type: 'variante',
        auteurPseudo: 'Martin D.',
        auteurStatut: 'etudiant_4e_annee',
        role: 'etudiant',
        publicationMode: 'public',
        grillePrincipale: 'yin_yang',
        polarite: 'yin',
        localisationFoyer: 'inferieur',
        raisonnement: "Vide de Yang évident : diarrhées au froid, amélioration à la chaleur, urines claires, lombaires froids. Yang insuffisant = il ne réchauffe plus le Foyer Inférieur. Selles peu douloureuses confirment le vide (pas de crampes = pas de plein).",
        categoriesDiagnostiques: [
          "Vide de Yang au Foyer Inférieur — Ming Men insuffisant",
          "Froid interne — manque de chaleur Yang",
          "Yang insuffisant — Yin en excès secondaire",
        ],
        strategieTherapeutique: `1. Tonifier le Yang du Rein (VG4 moxas).\n2. Soutenir le Yang général (36E moxas).\n3. Réchauffer le Foyer Inférieur (VC6 moxas).`,
        pointsUtilises: [
          { code: '4TM', nomIeatc: 'Ming Men', technique: 'moxa_tonification', justification: "Yang du Rein", ordre: 1 },
          { code: '36E', technique: 'moxa_tonification', justification: "Yang général et digestion", ordre: 2 },
          { code: '6JM', technique: 'moxa_tonification', justification: "Réchauffer le Foyer Inférieur", ordre: 3 },
        ],
        bilanEnergetique: `1. Vide de Yang au Foyer Inférieur — Ming Men insuffisant\n2. Froid interne — manque de chaleur Yang pour réchauffer le Foyer Moyen\n3. Digestion défaillante le matin — Yang ne monte pas à l'heure GI (5h-7h)`,
        strategie: `1. Tonifier le Yang du Rein (VG4 moxas — Ming Men)\n2. Soutenir le Yang général et la digestion (36E moxas)\n3. Réchauffer directement le Foyer Inférieur (VC6 moxas)`,
        pointsProposer: [
          { code: '4TM', action: 'tonification', justification: "Ming Men — Yang du Rein, indispensable avec moxas" },
          { code: '36E', action: 'tonification', justification: "Yang général + activation digestive matinale" },
          { code: '6JM', action: 'tonification', justification: "Réchauffer le Foyer Inférieur directement" },
        ],
        // langueTexte longueur 69 — "Langue pâle avec corps légèrement gonflé. Enduit blanc épais central."
        // start=0 len=12 "Langue pâle"
        langueTexte: "Langue pâle avec corps légèrement gonflé. Enduit blanc épais central.",
        annotationsLangue: [
          { id: 'ann-p003et4-martin-l1', start: 0, length: 12, comment: "Langue pâle = vide de Yang — confirme le tableau Yin/Yang de vide.", createdAt: '2026-03-04T10:00:00.000Z' },
        ],
        commentaireLibre: "Premier cas de diarrhée chronique — l'horaire (5h-7h) comme signe diagnostique est un concept nouveau pour moi. Les moxas sont indispensables sur ce type de tableau.",
        // Offsets calculés :
        // start=422 len=28 "Amélioration avec la chaleur"
        // start=495 len=14 "Urines claires"
        // start=234 len=20 "Selles semi-liquides"
        // start=631 len=19 "Surmenage chronique"
        annotationsInterrogatoire: [
          { id: 'ann-p003et4-martin-i1', start: 422, length: 28, comment: "Amélioration à la chaleur = preuve de vide Yang — le Yang externe compense le vide.", createdAt: '2026-03-04T09:55:00.000Z' },
          { id: 'ann-p003et4-martin-i2', start: 495, length: 14, comment: "Urines claires et abondantes = Yang ne retient pas les liquides — vide de Yang du Rein.", createdAt: '2026-03-04T09:57:00.000Z' },
          { id: 'ann-p003et4-martin-i3', start: 234, length: 20, comment: "Selles semi-liquides peu douloureuses = vide (pas de plein) — Yang ne tient pas.", createdAt: '2026-03-04T09:59:00.000Z' },
          { id: 'ann-p003et4-martin-i4', start: 631, length: 19, comment: "Surmenage chronique = étiologie principale du vide Yang — épuisement progressif.", createdAt: '2026-03-04T10:00:00.000Z' },
        ],
        // Pouls : start=39 len=27
        annotationsPouls: [
          { id: 'ann-p003et4-martin-p1', start: 39, length: 27, comment: "Vide et lent global = vide de Yang global — confirme le tableau Yin/Yang.", createdAt: '2026-03-04T10:01:00.000Z' },
          { id: 'ann-p003et4-martin-p2', start: 0, length: 38, comment: "Vide profond Foyer Inférieur = Yang Rein insuffisant — Ming Men déclinant.", createdAt: '2026-03-04T10:02:00.000Z' },
        ],
        niveauConfiance: 'standard',
        sourceType: 'humaine',
        version: 1,
        votePoints: 4,
        valeur: 1.0,
        votes: [],
        difficultéEstimee: 'niveau_intermediaire',
      },

      // [Et2] Étudiant 4e année 2 — Trois Foyers + Zang/Fu (anonyme)
      {
        id: 'p003-etudiant4-anon',
        caseId: 'cas-003',
        auteurId: 'user-etudiant4-anon-3',
        type: 'variante',
        auteurPseudo: 'Anonyme',
        auteurStatut: 'etudiant_4e_annee',
        role: 'etudiant',
        publicationMode: 'anonyme',
        grillePrincipale: 'trois_foyers',
        grillesSecondaires: ['zang_fu'],
        polarite: 'yin',
        localisationFoyer: 'inferieur',
        raisonnement: "Lecture Trois Foyers : le Foyer Inférieur est vide de Yang. Ce vide ne soutient plus le Foyer Moyen — faiblesse digestive. Traiter du bas vers le haut : Foyer Inférieur (Rein, Ming Men) en priorité, puis Foyer Moyen (Rate/Estomac).",
        categoriesDiagnostiques: [
          "Foyer Inférieur vide de Yang — Rein/Ming Men défaillants",
          "Foyer Moyen fragilisé secondairement — Rate non soutenue",
        ],
        strategieTherapeutique: `1. Tonifier le Yang du Foyer Inférieur (VG4, V23 moxas).\n2. Consolider le Foyer Moyen (V20, VC12).`,
        pointsUtilises: [
          { code: '4TM', nomIeatc: 'Ming Men', technique: 'moxa_tonification', justification: "Yang du Foyer Inférieur — priorité absolue", ordre: 1 },
          { code: '23V', technique: 'moxa_tonification', justification: "Shu du Rein — tonification directe", ordre: 2 },
          { code: '20V', technique: 'tonification', justification: "Shu de la Rate — consolide Foyer Moyen", ordre: 3 },
          { code: '12JM', technique: 'tonification', justification: "Mo de l'Estomac — renforce la digestion", ordre: 4 },
        ],
        bilanEnergetique: `1. Foyer Inférieur vide de Yang — Rein insuffisant, froid lombaire\n2. Foyer Moyen fragilisé secondairement — Rate/Estomac sans soutien\n3. Diarrhées matinales = Foyer Inférieur ne retient plus les liquides`,
        strategie: `1. Tonifier le Yang du Foyer Inférieur (VG4, V23 moxas)\n2. Consolider le Foyer Moyen ensuite (V20, VC12)\n3. Traitement sur plusieurs séries`,
        pointsProposer: [
          { code: '4TM', action: 'tonification', justification: "Ming Men — Yang du Foyer Inférieur" },
          { code: '23V', action: 'tonification', justification: "Shu du Rein — tonification directe Foyer Inférieur" },
          { code: '20V', action: 'tonification', justification: "Shu de la Rate — consolide Foyer Moyen" },
          { code: '12JM', action: 'tonification', justification: "Mo de l'Estomac — relancer la digestion" },
        ],
        // langueTexte longueur 74 — "Langue pâle, corps humide. Enduit blanc fin à la racine. Léger gonflement."
        // start=0 len=12 "Langue pâle,"
        langueTexte: "Langue pâle, corps humide. Enduit blanc fin à la racine. Léger gonflement.",
        annotationsLangue: [
          { id: 'ann-p003et4-anon-l1', start: 0, length: 25, comment: "Pâle et humide = Froid-Humidité interne — Foyer Inférieur et Moyen insuffisants.", createdAt: '2026-03-05T10:00:00.000Z' },
        ],
        commentaireLibre: "La règle des 3 Foyers est le cadre le plus logique ici : vide au bas, faiblesse au milieu. Traiter du bas vers le haut.",
        // Offsets calculés :
        // start=116 len=38 "Diarrhées exclusivement au petit matin (5h-7h)"
        // start=555 len=40 "Sensation de froid et faiblesse lombaire"
        // start=631 len=19 "Surmenage chronique"
        // start=422 len=28 "Amélioration avec la chaleur"
        annotationsInterrogatoire: [
          { id: 'ann-p003et4-anon-i1', start: 116, length: 38, comment: "5h-7h = heure GI (Yang Ming) — vide du Foyer Inférieur ne stimule pas le Yang Ming.", createdAt: '2026-03-05T09:55:00.000Z' },
          { id: 'ann-p003et4-anon-i2', start: 555, length: 40, comment: "Froid et faiblesse lombaire = siège du Foyer Inférieur (Rein) — localisation du vide.", createdAt: '2026-03-05T09:57:00.000Z' },
          { id: 'ann-p003et4-anon-i3', start: 631, length: 19, comment: "Surmenage chronique = épuisement du Yang ancestral (Rein) — cause étiopathogénique.", createdAt: '2026-03-05T09:59:00.000Z' },
          { id: 'ann-p003et4-anon-i4', start: 422, length: 28, comment: "Amélioration à la chaleur = preuve de vide Yang — chaleur externe compense le vide interne.", createdAt: '2026-03-05T10:00:00.000Z' },
        ],
        // Pouls : start=0 len=38
        annotationsPouls: [
          { id: 'ann-p003et4-anon-p1', start: 0, length: 38, comment: "Vide profond Foyer Inférieur = Rein Yang insuffisant — confirme le diagnostic Trois Foyers.", createdAt: '2026-03-05T10:01:00.000Z' },
          { id: 'ann-p003et4-anon-p2', start: 39, length: 27, comment: "Global vide et lent = vide Yang général — Foyer Moyen sans soutien par le bas.", createdAt: '2026-03-05T10:02:00.000Z' },
        ],
        niveauConfiance: 'standard',
        sourceType: 'humaine',
        version: 1,
        votePoints: 7,
        valeur: 1.0,
        votes: [],
        difficultéEstimee: 'niveau_4e',
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // CAS 4 — HYPERTENSION — Vide de Yin, prospérité de Yang
  // Source : PVI EEA tome 3 — Tableau 1 (Hypertension)
  // Grille principale : Cinq Éléments (Eau/Bois) puis Zang/Fu
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'cas-004',
    slug: 'hypertension-vide-yin-rein-yang-foie',
    titre: 'Hypertension — Vide de Yin Rein, prospérité du Yang Foie',
    statut: 'publie',
    niveauComplexite: 3,
    trancheAge: 'adulte',
    dateCreation: '2025-10-20',
    datePublication: '2025-11-05',
    casComplet: true,
    exemplaire: true,
    grillePrincipale: 'cinq_elements',
    tags: ['hypertension', 'Rein', 'Foie', 'Yin', 'Yang', 'Cinq Éléments', 'Eau/Bois'],
    viewCount: 287,
    content: {
      motif: "Hypertension artérielle diagnostiquée et suivie. Maux de tête, vertiges, bourdonnements d'oreille, insomnies.",
      interrogatoire: [
        { cle: 'symptomes_tete', valeur: "Maux de tête frontaux et temporaux. Vertiges à l'effort, sensation de tête qui tourne." },
        { cle: 'oreilles', valeur: "Bourdonnements d'oreille permanents, aggravés à la fatigue." },
        { cle: 'sommeil', valeur: "Insomnies : endormissement difficile, réveils nocturnes avec agitation." },
        { cle: 'coeur', valeur: "Palpitations cardiaques intermittentes, sans anomalie organique." },
        { cle: 'aspect', valeur: "Corps amaigri. Visage rouge. Yeux parfois rouges." },
        { cle: 'psychisme', valeur: "Esprit (Shen) fatigué — difficultés de concentration, irritabilité." },
        { cle: 'desirs', valeur: "Désirs sexuels marqués dans les antécédents. Soucis et détérioration du Sang par surcharge émotionnelle prolongée." },
      ],
      prisePouls: {
        condition: "Patient assis, bras détendus",
        lectures: [
          {
            position: 'foyer_inferieur_gauche',
            qualites: ['vide', 'profond'],
            interpretation: "Vide profond au Rein gauche — insuffisance du Yin du Rein.",
          },
          {
            position: 'foyer_superieur_gauche',
            qualites: ['rapide', 'corde_arc'],
            interpretation: "Pouls corde-arc au Foie, rapide — Yang du Foie montant, Fong interne.",
          },
          {
            position: 'global_superficiel',
            qualites: ['plein', 'rapide'],
            interpretation: "Pouls superficiel plein et rapide — Yang monté en surface, chaleur.",
          },
        ],
        synthese: "Vide de Yin du Rein laissant le Yang du Foie monter en usurpateur. L'Eau ne contient plus le Bois. Tableau classique d'hypertension par vide.",
      },
      contexteVie: "Vie active avec surcharge émotionnelle chronique. Antécédents de détérioration du Sang (soucis, fatigues prolongées). L'hypertension s'est installée progressivement.",
    },
    analyses: [
      {
        id: 'a004-5elements',
        caseId: 'cas-004',
        type: 'officielle',
        auteurPseudo: 'Dr Marie-Claude Jacquet',
        auteurStatut: 'expert',
        role: 'expert',
        publicationMode: 'public',
        votePoints: 37,
        valeur: 3.7,
        grillePrincipale: 'cinq_elements',
        grillesSecondaires: ['zang_fu', 'yin_yang'],
        polarite: 'yang',
        localisationFoyer: 'superieur',
        raisonnement: `**Lecture par les Cinq Éléments — relation Eau/Bois** :
L'Eau (Rein) est le fondement du Bois (Foie). Dans le cycle d'engendrement (Sheng), l'Eau nourrit le Bois. Si l'Eau est insuffisante, elle ne peut plus contenir le Bois. Le Bois (Yang du Foie) monte alors librement, sans frein.

**Physiopathologie selon le Nei Jing** : "Si l'Eau ne peut contenir le Bois, le Sang ne peut nourrir le Foie. Le Yin est vide et le Yang prospère — le Fong du Foie monte en usurpateur." C'est l'hypertension d'apparence Yang avec une cause profonde Yin.

**Mécanisme vasculaire** : La faiblesse du Rein (Yin insuffisant) signifie moins de liquides circulants dans l'organisme. Ce déséquilibre induit une vasoconstriction réflexe — d'où l'hypertension. C'est une forme de "séchage" de l'arbre vasculaire.

**Le Yang monte** : Maux de tête, visage rouge, yeux rouges, vertiges — tous signes que le Yang du Foie monte vers le haut du corps (Foyer Supérieur) sans pouvoir redescendre, faute d'ancrage dans le Rein.

**Stratégie d'ensemble** : Nourrir le Yin du Rein pour retenir le Yang du Foie. C'est une stratégie indirecte mais fondamentale : on traite la cause (vide de Yin du Rein) et non le symptôme (Yang montant).`,
        categoriesDiagnostiques: [
          "Vide de Yin du Rein — Eau insuffisante",
          "Prospérité du Yang du Foie — Bois non contenu",
          "Fong interne du Foie — Yang monte en usurpateur",
          "Insuffisance Eau-Bois dans le cycle Sheng",
          "Sang non nourri → Foie non nourri → Yang monte",
        ],
        strategieTherapeutique: "Tonifier le Yin du Rein pour ancrer et descendre le Yang du Foie. Ne jamais disperser agressivement le Yang du Foie sans avoir d'abord nourri le Yin du Rein.",
        traitementPropose: `**Nourrir le Yin du Rein (traiter la cause) :**
R3 tonification — nourrir le Yin des Reins, point source du méridien Rein.
V23 tonification — renforcer le Rein (Shu du Rein).

**Soutenir le Cœur (Shen perturbé) :**
V15 tonification — soutenir le Cœur, calmer les palpitations et les insomnies.

**Descendre le Yang du Foie :**
F2 dispersion — disperser le Yang du Foie.
F3 dispersion — disperser le Yang du Foie, libère la montée.`,
        pointsUtilises: [
          { code: '3R', nomIeatc: 'Tai Xi', technique: 'tonification', justification: "Nourrit le Yin du Rein — point source", ordre: 1 },
          { code: '23V', technique: 'tonification', justification: "Renforcer le Rein (Shu du Rein)", ordre: 2 },
          { code: '15V', technique: 'tonification', justification: "Soutenir le Cœur — palpitations, insomnies", ordre: 3 },
          { code: '2F', technique: 'dispersion', justification: "Disperser le Yang du Foie", ordre: 4 },
          { code: '3F', nomIeatc: 'Tai Chong', technique: 'dispersion', justification: "Disperser le Yang montant du Foie", ordre: 5 },
        ],
        niveauConfiance: 'expert',
        sourceType: 'editoriale',
        version: 1,
        enseignementCle: "L'hypertension en IEATC est d'apparence Yang mais de cause Yin. Traiter la cause (vide Yin Rein) et non le symptôme (Yang Foie montant). Sans nourrir l'Eau, toute dispersion du Bois est provisoire.",
        variantes: "Une deuxième lecture identifie un tableau de Feu du Phlegme avec Vent et Yang (Tableau 2), qui se traite différemment avec E40, MC6, VB20. La différenciation repose sur la présence ou absence de phlegme et la qualité du pouls.",
      },

      // ── Participations factices riches — Cas 004 ────────────────────────────

      // Praticien expérimenté — grille Zang/Fu + focus Cœur/Shen
      {
        id: 'p004-praticien-1',
        caseId: 'cas-004',
        type: 'variante',
        auteurPseudo: 'Frédéric M.',
        auteurStatut: 'praticien_experimente',
        role: 'praticien',
        publicationMode: 'public',
        grillePrincipale: 'zang_fu',
        grillesSecondaires: ['cinq_elements'],
        polarite: 'yang',
        localisationFoyer: 'superieur',
        raisonnement: "Ma lecture priorise la perturbation du Shen (Cœur). Les insomnies, palpitations et irritabilité sont des signes que le Cœur est atteint secondairement par l'excès de Yang du Foie. Le Foie en excès produit du Feu qui monte au Cœur et perturbe le Shen. Sans calmer le Cœur, le patient ne récupère pas et l'hypertension s'aggrave par l'insomnie chronique. Je traite donc Cœur + Foie ensemble, en nourrissant le Rein comme base.",
        categoriesDiagnostiques: [
          "Yang du Foie en excès — Feu montant au Cœur",
          "Shen perturbé — insomnie, palpitations, irritabilité",
          "Vide de Yin du Rein — cause profonde",
          "Cycle Eau→Bois→Feu : défaillance en cascade",
        ],
        strategieTherapeutique: `1. Nourrir le Yin du Rein (base).
2. Calmer le Feu du Foie et du Cœur.
3. Pacifier le Shen.
4. Points Shu du dos pour soutenir Rein et Cœur.`,
        pointsUtilises: [
          { code: '3R', nomIeatc: 'Tai Xi', technique: 'tonification', justification: "Yin du Rein — nourrit la base du cycle", ordre: 1 },
          { code: '23V', technique: 'tonification', justification: "Shu du Rein — renforce le Yin profond", ordre: 2 },
          { code: '15V', technique: 'tonification', justification: "Shu du Cœur — pacifie le Shen, calme les palpitations", ordre: 3 },
          { code: '7C', nomIeatc: 'Shen Men', technique: 'harmonisation', justification: "Porte du Shen — calme le Cœur et l'anxiété", ordre: 4 },
          { code: '3F', nomIeatc: 'Tai Chong', technique: 'dispersion', justification: "Disperse le Yang du Foie", ordre: 5 },
          { code: '2F', technique: 'dispersion', justification: "Clarifie le Feu du Foie", ordre: 6 },
          { code: '20VB', technique: 'dispersion', justification: "Fait descendre le Yang montant du Foie — céphalées, vertiges", ordre: 7 },
        ],
        bilanEnergetique: `Vide de Yin du Rein (cause profonde).
Foie en excès de Yang — Feu montant au Cœur.
Shen perturbé : insomnie, palpitations, irritabilité.
Cascade Eau→Bois→Feu défaillante.`,
        annotationsInterrogatoire: [
          { id: 'ann-p004p1-1', start: 0, length: 70, comment: "Maux de tête frontaux/temporaux = Yang du Foie qui monte — confirmation du diagnostic.", createdAt: '2026-02-05T10:00:00.000Z' },
          { id: 'ann-p004p1-2', start: 150, length: 50, comment: "Insomnies = Cœur atteint par le Feu du Foie — à traiter en priorité.", createdAt: '2026-02-05T10:05:00.000Z' },
        ],
        commentaireLibre: "Je ne peux pas ignorer les insomnies et palpitations — ce sont les signes que le Cœur est impliqué. Traiter le Foie seul ne résoudrait pas la perturbation du Shen.",
        niveauConfiance: 'standard',
        sourceType: 'humaine',
        version: 1,
        votePoints: 21,
        valeur: 1.0,
        difficultéEstimee: 'niveau_difficile',
      },

      // Praticien — grille Grands Méridiens/Climats
      {
        id: 'p004-praticien-2',
        caseId: 'cas-004',
        type: 'variante',
        auteurPseudo: 'Anonyme',
        auteurStatut: 'praticien_experimente',
        role: 'praticien',
        publicationMode: 'anonyme',
        grillePrincipale: 'grands_meridiens_climats',
        grillesSecondaires: ['zang_fu'],
        polarite: 'yang',
        localisationFoyer: 'superieur',
        raisonnement: "Lecture climatique : le Fong interne (pouls corde-arc) est le facteur pathogène principal. Le Fong interne du Foie monte vers la tête, produisant vertiges, maux de tête et instabilité. En grille Grands Méridiens/Climats, le Fong interne est toujours secondaire à un vide de Yin ou de Sang du Foie. Ici : vide de Yin du Rein → Eau ne nourrit plus le Foie → Foie dessèche → Fong interne. Traiter le Fong en le dispersant et en nourrissant le Yin du Foie.",
        categoriesDiagnostiques: [
          "Fong interne du Foie (pouls corde-arc, vertiges, maux de tête)",
          "Vide de Yin du Rein — source du Fong interne",
          "Feu du Foie montant en usurpateur",
        ],
        strategieTherapeutique: `1. Disperser le Fong interne du Foie.
2. Nourrir le Yin du Rein.
3. Abaisser le Yang montant.`,
        pointsUtilises: [
          { code: '20VB', technique: 'dispersion', justification: "Disperse le Fong du Foie — point clé du Fong interne", ordre: 1 },
          { code: '3F', nomIeatc: 'Tai Chong', technique: 'dispersion', justification: "Disperse le Foie et le Fong interne", ordre: 2 },
          { code: '3R', nomIeatc: 'Tai Xi', technique: 'tonification', justification: "Nourrit le Yin du Rein — traite la cause", ordre: 3 },
          { code: '6Rte', technique: 'tonification', justification: "Nourrit le Yin en général — soutien du Sang", ordre: 4 },
          { code: '20TM', technique: 'dispersion', justification: "Abaisser le Yang en excès au sommet — utiliser avec précaution", ordre: 5 },
        ],
        bilanEnergetique: `Fong interne du Foie (pouls corde-arc).
Vide de Yin du Rein → Foie desséché.
Yang montant en usurpateur.`,
        niveauConfiance: 'standard',
        sourceType: 'humaine',
        version: 1,
        votePoints: 14,
        valeur: 1.0,
        difficultéEstimee: 'niveau_4e',
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // CAS 5 — BOURDONNEMENTS ET SURDITÉ — Vide de Yin du Rein
  // Source : PVI EEA tome 3 — Pathologies de l'Oreille
  // Grille principale : Zang/Fu + Méridiens (Chao Yang)
  // CAS PARTIEL — motif + interrogatoire + pouls uniquement
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'cas-005',
    slug: 'bourdonnements-oreille-surdite-vide-yin-rein',
    titre: 'Bourdonnements d\'oreille chroniques — vide de Yin Rein',
    statut: 'publie',
    niveauComplexite: 3,
    trancheAge: 'adulte',
    dateCreation: '2025-11-15',
    datePublication: '2025-12-01',
    casComplet: false,  // Cas partiel : pas de traitement fourni par le rédacteur
    exemplaire: false,
    grillePrincipale: 'zang_fu',
    tags: ['surdité', 'bourdonnements', 'oreille', 'Rein', 'Vésicule Biliaire', 'Chao Yang', 'Yin'],
    viewCount: 143,
    content: {
      motif: "Bourdonnements d'oreille chroniques et intermittents depuis 2 ans. Légère diminution de l'acuité auditive.",
      interrogatoire: [
        { cle: 'caracteristiques_son', valeur: "Bruits continus mais tenus, type bruit de cigale ou flûte. Pas de flux/reflux (exclut la plénitude)." },
        { cle: 'aggravation', valeur: "S'accroissent nettement à la fatigue. Présents depuis un épisode de forte surcharge professionnelle." },
        { cle: 'vertiges', valeur: "Étourdissements légers, vertiges doux — pas de vertige rotatoire." },
        { cle: 'lombaires', valeur: "Lombalgies de fond, sensation de froid dans le bas du dos." },
        { cle: 'fatigue', valeur: "Fatigue profonde, surtout en fin de journée. Se sent 'vide'." },
        { cle: 'historique', valeur: "Début progressif, lié à une période d'épuisement. Pas d'épisode infectieux ni traumatique." },
      ],
      prisePouls: {
        condition: "Patient allongé, en début de séance",
        lectures: [
          {
            position: 'foyer_inferieur_gauche',
            qualites: ['vide', 'profond', 'etroit'],
            interpretation: "Vide profond et étroit au Rein gauche — vide de Yin du Rein, Yang apparent (Feu apparent).",
          },
          {
            position: 'foyer_superieur_gauche',
            qualites: ['vide'],
            interpretation: "Foyer Supérieur gauche léger — Shen perturbé par l'insuffisance du Yin.",
          },
        ],
        synthese: "Vide de Yin du Rein avec montée de la chaleur du vide. Le Yin des Reins est insuffisant — les liquides ne peuvent plus ancrer le Yang ascendant. Tableau de bourdonnements par vide (différentiel : bourdonnements continus, tenus, aggravés à la fatigue).",
      },
      contexteVie: "Professionnel en surmenage chronique. Épisode d'épuisement sévère il y a 3 ans, sans récupération complète.",
      antecedents: "Aucun traumatisme auditif. Pas d'otite chronique. Pas d'antécédents familiaux de surdité.",
    },
    analyses: [
      {
        id: 'a005-zangfu-meridiens',
        caseId: 'cas-005',
        type: 'officielle',
        auteurPseudo: 'Dr Henri Beaumont',
        auteurStatut: 'expert',
        role: 'expert',
        publicationMode: 'public',
        votePoints: 19,
        valeur: 1.9,
        grillePrincipale: 'zang_fu',
        grillesSecondaires: ['meridiens', 'yin_yang'],
        polarite: 'yin',
        localisationFoyer: 'inferieur',
        raisonnement: `**L'oreille et le Rein** : En IEATC, l'oreille est l'orifice extérieur des Reins (Su Wen). Les méridiens du Triple Réchauffeur et de la Vésicule Biliaire (Chao Yang) se rassemblent au milieu de l'oreille. La relation oreille-Rein est directe.

**Différentiation vide/plénitude** : Le caractère du son est déterminant.
- Vide : bruits de cigale, flûte, continus mais tenus, s'aggravent à la fatigue, bourdonnements intermittents.
- Plein : croassements, flux/reflux, brusques et violents, accompagnés de tête gonflée.

**Ici** : Le son est tenu, les bourdonnements s'aggravent à la fatigue et non lors de crises de colère. C'est un tableau de Vide.

**Mécanisme du Yang apparent** : La chaleur qui provient d'un manque de Yin du Rein monte faire des inflammations. C'est le Yang apparent — un Feu apparent issu de la déficience du Yin du Rein. Ce Yang apparent ascendant irrite le Chao Yang (méridiens TR et VB) qui passent dans l'oreille.

**Distinction avec le plein** : Un tableau de plein aurait : brusques surdités, tête lourde, bouche amère, côtes douloureuses, colères — ce qui est absent ici.`,
        categoriesDiagnostiques: [
          "Vide de Yin du Rein",
          "Yang apparent (Feu apparent) ascendant — irrite l'oreille via le Chao Yang",
          "Oreille interne atteinte (domaine Rein)",
          "Bourdonnements par vide — différencié du plein",
        ],
        strategieTherapeutique: "Tonifier le Yin du Rein et du Foie. Traiter le Yang apparent (Feu apparent) — nourrir le Yin pour éteindre la chaleur, jamais disperser. Éviter les moxas (chaleur par vide de Yin).",
        traitementPropose: `**Tonifier Rein et Yin du Foie :**
23VB tonification — tonifier les Souffles des Reins.
4VG tonification — renforcer le Yang des Reins (base du Yin).
R3 tonification — tonifier directement le Yin du Rein.
6Rte tonification — augmenter le Yin du Foie et des Reins.
2F tonification — augmenter le Yin du Foie et traiter le Yang apparent (Feu apparent).

Note : 2F est ici en tonification pour nourrir le Yin — à distinguer de la dispersion 2F pour vider le Yang (hypertension).`,
        pointsUtilises: [
          { code: '23VB', technique: 'tonification', justification: "Tonifie les Souffles des Reins", ordre: 1 },
          { code: '4TM', nomIeatc: 'Ming Men', technique: 'tonification', justification: "Renforce le Yang des Reins (base du Yin)", ordre: 2 },
          { code: '3R', nomIeatc: 'Tai Xi', technique: 'tonification', justification: "Tonifie directement le Yin du Rein", ordre: 3 },
          { code: '6Rte', technique: 'tonification', justification: "Augmente le Yin du Foie et des Reins", ordre: 4 },
          { code: '2F', technique: 'tonification', justification: "Augmente le Yin du Foie — traite le Yang apparent (Feu apparent)", ordre: 5 },
        ],
        niveauConfiance: 'standard',
        sourceType: 'editoriale',
        version: 1,
        enseignementCle: "Différencier absolument bourdonnements vide (tenus, intermittents, aggraves par fatigue) des bourdonnements plein (violents, brusques, aggraves par colères). Le traitement est opposé. Une erreur ici = aggravation.",
        variantes: "En cas de plénitude : disperser 3F, 41VB, TR16. En cas de Vent pervers externe : TR5, P7, GI4, VB20, TR17.",
      },
    ],
  },
  // ───────────────────────────────────────────────────────────────────────────
  // CAS 006 — THOMAS, 45 ANS — Lombalgie chronique
  // Grille principale : Yin/Yang → Zang/Fu (Rein)
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'cas-006',
    slug: 'thomas-45-ans-lombalgie-chronique',
    titre: 'Thomas, 45 ans — Lombalgie chronique et grande fatigue',
    statut: 'publie',
    niveauComplexite: 1,
    age: 45,
    trancheAge: 'adulte',
    sexe: 'masculin',
    dateCreation: '2025-10-01',
    datePublication: '2025-10-15',
    casComplet: true,
    exemplaire: false,
    grillePrincipale: 'yin_yang',
    tags: ['lombalgie', 'rein', 'fatigue', 'Yang vide', 'Ming Men'],
    viewCount: 187,
    content: {
      motif: "Lombalgie chronique depuis 4 ans avec irradiation dans la fesse droite. Grande fatigue en fin de journée.",
      interrogatoire: [
        { cle: 'douleur', valeur: "Douleur sourde et profonde dans le bas du dos. Aggravée au repos prolongé et le matin au réveil. Améliorée par la chaleur et le mouvement." },
        { cle: 'horaire', valeur: "Pire le matin au lever. Mieux après activité douce. Rechutes en hiver et par temps froid." },
        { cle: 'urines', valeur: "Urines claires et abondantes, surtout la nuit (2-3 levées). Légère incontinence d'effort." },
        { cle: 'froid', valeur: "Froid aux pieds et aux genoux. Aime les bains chauds. Frileuse." },
        { cle: 'antecedents', valeur: "Surmenage professionnel depuis 10 ans. Père opéré du dos (hernie discale L4-L5)." },
      ],
      observation: "Patient pâle, voix basse. Dos courbé légèrement en avant. Pas de déficit neurologique.",
      prisePouls: {
        condition: "Patient allongé, bras détendu",
        lectures: [
          { position: 'foyer_inferieur_gauche', qualites: ['vide', 'profond'], interpretation: "Vide profond au Foyer Inférieur gauche — Yang du Rein insuffisant." },
          { position: 'foyer_inferieur_droit', qualites: ['vide', 'profond'], interpretation: "Vide profond bilatéral confirmant le vide Yang général du Rein." },
          { position: 'global_profond', qualites: ['lent', 'faible'], interpretation: "Pouls global lent et faible — vide de Yang constitutionnel profond." },
        ],
        synthese: "Vide de Yang du Rein et du Ming Men. La lenteur globale confirme le froid interne. Traiter le Yang du Foyer Inférieur en priorité absolue.",
      },
    },
    analyses: [
      {
        id: 'a006-yy-officielle',
        caseId: 'cas-006',
        type: 'officielle',
        auteurPseudo: 'Dr Laurent Mercier',
        auteurStatut: 'expert',
        role: 'expert',
        publicationMode: 'public',
        votePoints: 38,
        valeur: 3.8,
        grillePrincipale: 'yin_yang',
        polarite: 'yang',
        localisationFoyer: 'inferieur',
        raisonnement: `Tableau classique de Vide de Yang du Rein avec insuffisance du Ming Men. La lombalgie chronique en IEATC n'est jamais purement mécanique — le dos lombaire est le territoire du Rein. La douleur améliorée par la chaleur, les urines claires nocturnes, le froid aux membres inférieurs et la fatigue profonde dessinent le portrait du Yang vide profond.

Le Ming Men (VG4) est le foyer du Yang constitutionnel. Son insuffisance se lit sur les deux pouls du Foyer Inférieur, vides et profonds. Les moxas sur VG4 et V23 sont le traitement de choix.`,
        categoriesDiagnostiques: [
          "Vide de Yang du Rein — Ming Men insuffisant",
          "Froid interne au Foyer Inférieur",
          "Vide de Yang général — fatigue profonde",
        ],
        strategieTherapeutique: "1. Ranimer le Feu du Ming Men (VG4 moxas). 2. Tonifier le Yang du Rein (V23, R3). 3. Réchauffer le Foyer Inférieur. 4. Soutenir le Yang général (36E).",
        traitementPropose: `VG4 moxas (Ming Men — clé du Yang constitutionnel). V23 bilatéral tonification + moxas (point Shu du Rein). R3 bilatéral tonification (source Rein). V40 dispersion (lombes locales). 36E bilatéral tonification (soutien Yang général).`,
        pointsUtilises: [
          { code: '4TM', nomIeatc: 'Ming Men', technique: 'moxa_tonification', justification: "Feu du Ming Men — Yang constitutionnel", ordre: 1 },
          { code: '23V', technique: 'moxa_tonification', justification: "Point Shu du Rein — tonifie Yang du Rein", ordre: 2 },
          { code: '3R', nomIeatc: 'Tai Xi', technique: 'tonification', justification: "Source du Rein — Yin et Yang du Rein", ordre: 3 },
          { code: '40V', technique: 'dispersion', justification: "Point commande des lombes", ordre: 4 },
          { code: '36E', nomIeatc: 'Zu San Li', technique: 'moxa_tonification', justification: "Yang général — soutien énergétique global", ordre: 5 },
        ],
        niveauConfiance: 'expert',
        sourceType: 'editoriale',
        version: 1,
        enseignementCle: "Lombalgie chronique = Vide de Yang du Rein jusqu'à preuve du contraire. Les moxas sur VG4 sont indispensables — l'aiguille seule ne suffit pas pour ranimer le Ming Men.",
      },
      {
        id: 'a006-cinq-elements',
        caseId: 'cas-006',
        type: 'variante',
        auteurPseudo: 'Martine L.',
        auteurStatut: 'praticien_experimente',
        role: 'praticien',
        publicationMode: 'public',
        votePoints: 22,
        valeur: 1.0,
        grillePrincipale: 'cinq_elements',
        grillesSecondaires: ['yin_yang'],
        polarite: 'yang',
        localisationFoyer: 'inferieur',
        raisonnement: "L'Eau (Rein) est la base de tout — insuffisance constitutionnelle aggravée par le surmenage. Le cycle Sheng est brisé vers le bas : Eau insuffisante → Bois mal nourri → tendons et dos fragilisés. Traiter d'abord l'Eau pour relancer toute la chaîne.",
        categoriesDiagnostiques: [
          "Vide de Yang du Rein (Eau) — racine constitutionnelle",
          "Vide de Jing du Rein — épuisement par surmenage",
          "Cycle Sheng Eau → Bois insuffisant",
        ],
        strategieTherapeutique: "1. Nourrir l'Eau (Rein Yang et Jing). 2. Relancer le cycle Sheng. 3. Traiter la lombalgie secondairement.",
        bilanEnergetique: "Vide de Yang du Rein et vide de Jing — surmenage chronique a vidé les réserves ancestrales. Lombalgie = expression locale d'un vide profond du Foyer Inférieur.",
        strategie: "1. VG4 + V23 moxas (Yang Rein et Ming Men)\n2. R3 + R7 tonification (Yin et Yang Rein)\n3. 39VB (moelle, os, Jing) en soutien",
        pointsUtilises: [
          { code: '4TM', technique: 'moxa_tonification', justification: "Ming Men — Yang constitutionnel", ordre: 1 },
          { code: '7R', technique: 'tonification', justification: "Tonifie le Yang du Rein — complément de R3", ordre: 2 },
          { code: '3R', nomIeatc: 'Tai Xi', technique: 'tonification', justification: "Source du Rein", ordre: 3 },
          { code: '39VB', technique: 'tonification', justification: "Réunion des moelles — soutient le Jing", ordre: 4 },
        ],
        niveauConfiance: 'standard',
        sourceType: 'humaine',
        version: 1,
        votes: [],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // CAS 007 — SOPHIE, 42 ANS — Cervicalgies + céphalées + insomnie
  // Grille principale : Yin/Yang → Zang/Fu (Foie/Rein)
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'cas-007',
    slug: 'sophie-42-ans-cervicalgies-cephalees',
    titre: 'Sophie, 42 ans — Cervicalgies, céphalées temporales et insomnie',
    statut: 'publie',
    niveauComplexite: 2,
    age: 42,
    trancheAge: 'adulte',
    sexe: 'feminin',
    dateCreation: '2025-10-20',
    datePublication: '2025-11-05',
    casComplet: true,
    exemplaire: false,
    grillePrincipale: 'yin_yang',
    tags: ['céphalées', 'cervicalgies', 'insomnie', 'Yang Foie montant', 'Yin Rein'],
    viewCount: 143,
    content: {
      motif: "Cervicalgies persistantes avec céphalées temporales récurrentes et insomnie depuis 8 mois.",
      interrogatoire: [
        { cle: 'cephalees', valeur: "Céphalées temporales bilatérales, pulsatiles. Aggravées par le stress et les menstruations. Soulagées par la pression froide." },
        { cle: 'cervicalgies', valeur: "Raideur cervicale matinale. Tension dans la nuque et les épaules. Pas de névralgie cervico-brachiale." },
        { cle: 'sommeil', valeur: "Endormissement difficile. Réveils nocturnes entre 1h et 3h. Rêves agités, parfois cauchemars. Fatigue matinale persistante." },
        { cle: 'emotionnel', valeur: "Stress professionnel important. Irritabilité. Difficultés à décompresser en soirée." },
        { cle: 'regles', valeur: "Cycle raccourci (23-24 jours). Saignements plus abondants depuis 1 an. Céphalées systématiques J2-J3." },
      ],
      observation: "Teint rouge, yeux brillants. Tension dans les trapèzes et les muscles sous-occipitaux.",
      prisePouls: {
        condition: "Patient allongé après 5 min de repos",
        lectures: [
          { position: 'foyer_moyen_gauche', qualites: ['corde_arc', 'rapide'], interpretation: "Pouls en corde-arc rapide au Foyer Moyen gauche — Yang du Foie montant." },
          { position: 'foyer_inferieur_gauche', qualites: ['vide', 'profond'], interpretation: "Foyer Inférieur gauche vide profond — Yin du Rein insuffisant (cause profonde)." },
          { position: 'foyer_superieur_gauche', qualites: ['rapide'], interpretation: "Cœur rapide — Shen légèrement perturbé par le manque de Yin." },
        ],
        synthese: "Vide de Yin du Rein → Yang du Foie non ancré → monte vers le haut. Traiter le Rein en premier, le Foie en second.",
      },
    },
    analyses: [
      {
        id: 'a007-yy-officielle',
        caseId: 'cas-007',
        type: 'officielle',
        auteurPseudo: 'Dr Isabelle Fontaine',
        auteurStatut: 'expert',
        role: 'expert',
        publicationMode: 'public',
        votePoints: 47,
        valeur: 4.7,
        grillePrincipale: 'yin_yang',
        grillesSecondaires: ['zang_fu'],
        polarite: 'yin',
        localisationFoyer: 'superieur',
        raisonnement: `Tableau classique de Vide de Yin du Rein → Yang du Foie montant. La règle R4 s'applique ici pleinement : traiter le Rein (cause), pas le Foie (conséquence).

Les céphalées temporales pulsatiles = Yang du Foie monte vers le haut par le méridien VB (trajet temporal). L'insomnie avec réveils 1h-3h est l'heure du Foie — le Yang ne peut redescendre faute de Yin pour l'ancrer. Les cervicalgies sont la stagnation du Yang du Foie bloqué en Foyer Supérieur.`,
        categoriesDiagnostiques: [
          "Vide de Yin du Rein — cause profonde",
          "Yang du Foie montant — conséquence directe",
          "Shen légèrement perturbé — insomnie secondaire",
          "Stagnation Yang en Foyer Supérieur — cervicalgies et céphalées",
        ],
        strategieTherapeutique: "1. Nourrir le Yin du Rein (R3, R6, R7). 2. Abaisser le Yang du Foie (3F, 2F). 3. Pacifier le Shen (C7). 4. Libérer localement le Foyer Supérieur (20VB, VG20).",
        traitementPropose: `R3 + R6 tonification (nourrit le Yin du Rein — cause profonde). 3F dispersion (abaisse le Yang du Foie). VG20 dispersion (fait descendre le Yang depuis le sommet). 20VB dispersion (libère le Foyer Supérieur et le méridien VB). C7 tonification (pacifie le Shen).`,
        pointsUtilises: [
          { code: '3R', nomIeatc: 'Tai Xi', technique: 'tonification', justification: "Nourrit le Yin du Rein — cause profonde des céphalées", ordre: 1 },
          { code: '6R', nomIeatc: 'Zhao Hai', technique: 'tonification', justification: "Renforce le Yin du Rein, pacifie le Shen", ordre: 2 },
          { code: '3F', nomIeatc: 'Tai Chong', technique: 'dispersion', justification: "Abaisse le Yang du Foie — traitement secondaire", ordre: 3 },
          { code: '20TM', technique: 'dispersion', justification: "Fait descendre le Yang depuis le sommet du crâne", ordre: 4 },
          { code: '20VB', technique: 'dispersion', justification: "Libère le méridien VB au cou — céphalées temporales", ordre: 5 },
          { code: '7C', nomIeatc: 'Shen Men', technique: 'tonification', justification: "Pacifie le Shen — insomnie", ordre: 6 },
        ],
        niveauConfiance: 'expert',
        sourceType: 'editoriale',
        version: 1,
        enseignementCle: "Règle R4 : céphalées par Yang du Foie montant → traiter le Yin du Rein D'ABORD. Ne pas disperser le Foie sans avoir nourri le Rein — inefficace et épuisant.",
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // CAS 008 — MARIE, 36 ANS — Fatigue chronique + anxiété + insomnie
  // Grille principale : Zang/Fu (Cœur / Rein)
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'cas-008',
    slug: 'marie-36-ans-fatigue-anxiete-insomnie',
    titre: 'Marie, 36 ans — Fatigue profonde, anxiété et insomnie',
    statut: 'publie',
    niveauComplexite: 2,
    age: 36,
    trancheAge: 'adulte',
    sexe: 'feminin',
    dateCreation: '2025-11-01',
    datePublication: '2025-11-20',
    casComplet: true,
    exemplaire: false,
    grillePrincipale: 'zang_fu',
    tags: ['fatigue', 'anxiété', 'insomnie', 'Shen', 'Cœur', 'Rein', 'vide Yin'],
    viewCount: 98,
    content: {
      motif: "Fatigue chronique profonde avec anxiété permanente et difficultés d'endormissement depuis 1 an. Épuisement après effort minime.",
      interrogatoire: [
        { cle: 'fatigue', valeur: "Fatigue dès le matin au lever. Coup de pompe entre 11h et 13h. Épuisement total en soirée. Pas améliorée par le repos." },
        { cle: 'sommeil', valeur: "Endormissement difficile (1-2h). Réveils entre 3h et 5h avec ruminations. Jamais de sommeil réparateur." },
        { cle: 'anxiete', valeur: "Anxiété diffuse, permanente. Palpitations fréquentes au stress. Difficultés de concentration." },
        { cle: 'chaleur', valeur: "Chaleur dans la poitrine le soir. Sueurs nocturnes. Mains et pieds chauds. Bouche sèche la nuit." },
        { cle: 'antecedents', valeur: "Burn-out professionnel il y a 18 mois. Jamais complètement récupérée depuis." },
      ],
      observation: "Regard anxieux, voix hésitante. Teint légèrement rouge sur les pommettes. Agitation des mains.",
      prisePouls: {
        condition: "Patient allongé, respiration calmée",
        lectures: [
          { position: 'foyer_superieur_gauche', qualites: ['vide', 'rapide'], interpretation: "Cœur vide et rapide — Shen sans ancrage, Yin insuffisant." },
          { position: 'foyer_inferieur_gauche', qualites: ['vide', 'profond'], interpretation: "Yin du Rein vide profond — cause du vide de Yin général et du Yang apparent (Feu apparent)." },
          { position: 'foyer_superieur_droit', qualites: ['vide', 'faible'], interpretation: "Poumon vide — Qi général insuffisant." },
        ],
        synthese: "Vide de Yin du Rein → Yang apparent (Feu apparent) irrite le Cœur → Shen perturbé. Tableau post-burn-out classique : épuisement du Yin par surmenage chronique.",
      },
    },
    analyses: [
      {
        id: 'a008-zangfu-officielle',
        caseId: 'cas-008',
        type: 'officielle',
        auteurPseudo: 'Dr Laurent Mercier',
        auteurStatut: 'expert',
        role: 'expert',
        publicationMode: 'public',
        votePoints: 41,
        valeur: 4.1,
        grillePrincipale: 'zang_fu',
        grillesSecondaires: ['yin_yang'],
        polarite: 'yin',
        localisationFoyer: 'superieur',
        raisonnement: `Tableau de Vide de Yin du Rein → Yang apparent (Feu apparent) → Shen perturbé. C'est la séquence classique du burn-out en IEATC.

La chaleur vespérale, les sueurs nocturnes, la bouche sèche la nuit, le pouls vide et rapide au Cœur — tout indique le Yang apparent / Feu apparent (Xu Huo). Règle R3 absolue : ne jamais disperser cette chaleur, elle n'est pas réelle. Il faut NOURRIR le Yin pour que le Yang apparent s'éteigne de lui-même.

Le Cœur héberge le Shen. Sans Yin pour l'ancrer, le Shen erre → anxiété, insomnie, palpitations.`,
        categoriesDiagnostiques: [
          "Vide de Yin du Rein — épuisement post burn-out",
          "Yang apparent / Feu apparent (Xu Huo) — chaleur vespérale, sueurs nocturnes",
          "Shen perturbé par vide de Yin du Cœur — insomnie, anxiété",
          "Vide de Qi du Poumon — fatigue profonde, souffle insuffisant",
        ],
        strategieTherapeutique: "1. Nourrir le Yin du Rein et du Cœur (R3, R6, MC6). 2. Traiter le Yang apparent / Feu apparent (Xu Huo) — NOURRIR le Yin, jamais disperser. 3. Pacifier le Shen (C7, R6). 4. Soutenir le Qi (36E, P7).",
        traitementPropose: `R3 + R6 tonification (nourrit le Yin du Rein — source du Yang apparent). MC6 tonification (pacifie le Shen, nourrit le Yin du Cœur). C7 tonification (Shen Men — porte du Shen). R6 + C7 tonification (paire de MV : Yin Qiao Mo — excellent pour l'insomnie). 36E tonification (Qi général).`,
        pointsUtilises: [
          { code: '3R', nomIeatc: 'Tai Xi', technique: 'tonification', justification: "Nourrit le Yin du Rein — source profonde du Yang apparent (Feu apparent)", ordre: 1 },
          { code: '6R', nomIeatc: 'Zhao Hai', technique: 'tonification', justification: "Yin Qiao Mo + Yin Rein — insomnie et anxiété", ordre: 2 },
          { code: '6MC', nomIeatc: 'Nei Guan', technique: 'tonification', justification: "Pacifie le Shen, calme les palpitations, nourrit le Yin Cœur", ordre: 3 },
          { code: '7C', nomIeatc: 'Shen Men', technique: 'tonification', justification: "Porte du Shen — ancrage direct du Shen dans le Cœur", ordre: 4 },
          { code: '36E', nomIeatc: 'Zu San Li', technique: 'tonification', justification: "Soutient le Qi général post-burn-out", ordre: 5 },
        ],
        niveauConfiance: 'expert',
        sourceType: 'editoriale',
        version: 1,
        enseignementCle: "Yang apparent (Feu apparent) post burn-out : NOURRIR le Yin, jamais disperser la chaleur. La paire R6 + C7 est le traitement de fond de l'insomnie par vide de Yin.",
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // CAS 009 — LUCIE, 22 ANS — Dysménorrhée + SPM
  // Grille principale : Cinq Éléments (Bois/Sang)
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'cas-009',
    slug: 'lucie-22-ans-dysmenorrhee-spm',
    titre: 'Lucie, 22 ans — Dysménorrhée invalidante et syndrome prémenstruel',
    statut: 'publie',
    niveauComplexite: 2,
    age: 22,
    trancheAge: 'jeune_adulte',
    sexe: 'feminin',
    dateCreation: '2025-11-15',
    datePublication: '2025-12-01',
    casComplet: true,
    exemplaire: false,
    grillePrincipale: 'cinq_elements',
    tags: ['dysménorrhée', 'SPM', 'Foie', 'stagnation Qi', 'vide Sang', 'règles'],
    viewCount: 76,
    content: {
      motif: "Dysménorrhée invalidante depuis 4 ans avec syndrome prémenstruel marqué — règles douloureuses, ballonnements et anxiété prémenstruelle.",
      interrogatoire: [
        { cle: 'regles', valeur: "Douleurs intenses J1-J2, obligeant à l'alitement. Sang rouge foncé avec caillots. Cycle de 28 jours régulier mais douloureux depuis l'adolescence." },
        { cle: 'spm', valeur: "Les 5-7 jours précédant les règles : seins douloureux, irritabilité majeure, pleurs faciles, ballonnements, envie de sucre." },
        { cle: 'digestif', valeur: "Ballonnements fréquents en dehors des règles. Alternance diarrhées/constipation selon le stress." },
        { cle: 'emotionnel', valeur: "Grande sensibilité émotionnelle. Frustration facile. Se sent mieux après avoir pleuré ou après les règles." },
        { cle: 'froid', valeur: "Appuyer fort sur le ventre soulage. La chaleur (bouillotte) améliore." },
      ],
      observation: "Teint légèrement jaune-verdâtre. Ongles fragiles. Légère tension dans les hypocondres.",
      prisePouls: {
        condition: "J14 du cycle (mi-cycle)",
        lectures: [
          { position: 'foyer_moyen_gauche', qualites: ['corde_arc'], interpretation: "Corde-arc au Foyer Moyen gauche — Foie en tension, Qi stagnant." },
          { position: 'foyer_superieur_gauche', qualites: ['vide', 'faible'], interpretation: "Cœur faible — Sang insuffisant (vide de Sang du Foie)." },
          { position: 'foyer_inferieur_gauche', qualites: ['vide'], interpretation: "Foyer Inférieur gauche légèrement vide — Sang du Rein insuffisant." },
        ],
        synthese: "Stagnation de Qi du Foie sur fond de Vide de Sang. Le Qi stagnant bloque la circulation du Sang à la menstruation → douleurs et caillots.",
      },
    },
    analyses: [
      {
        id: 'a009-cinq-elements-officielle',
        caseId: 'cas-009',
        type: 'officielle',
        auteurPseudo: 'Dr Isabelle Fontaine',
        auteurStatut: 'expert',
        role: 'expert',
        publicationMode: 'public',
        votePoints: 35,
        valeur: 3.5,
        grillePrincipale: 'cinq_elements',
        grillesSecondaires: ['zang_fu'],
        polarite: 'yin',
        localisationFoyer: 'inferieur',
        raisonnement: `Stagnation de Qi du Foie (Bois) sur fond de Vide de Sang — tableau classique de dysménorrhée IEATC.

Le Foie gouverne la libre circulation du Qi et stocke le Sang. En vide de Sang, le Foie ne peut plus assurer la circulation fluide → tension, caillots, douleurs spasmodiques. Le SPM (irritabilité, seins douloureux) est la manifestation de la stagnation de Qi du Foie dans la semaine précédant les règles.

Stratégie : nourrir le Sang du Foie EN PREMIER, puis lever la stagnation de Qi. Dans le sens inverse → on libère sans avoir nourri → aggravation.`,
        categoriesDiagnostiques: [
          "Stagnation de Qi du Foie — dysménorrhée et SPM",
          "Vide de Sang du Foie — ongles fragiles, vide Cœur",
          "Stagnation de Sang au Foyer Inférieur — caillots, douleurs fixes",
        ],
        strategieTherapeutique: "1. Nourrir le Sang du Foie (8F, 6Rte). 2. Lever la stagnation de Qi du Foie (3F, 4GI). 3. Lever la stagnation de Sang (10Rte). 4. Calmer le Bois (2F).",
        traitementPropose: `8F tonification (nourrit le Sang du Foie — source). 6Rte tonification (nourrit le Sang général, régularise les menstruations). 3F dispersion (lève la stagnation de Qi du Foie). 10Rte dispersion (lève la stagnation de Sang). 4GI dispersion (lève la stagnation de Qi général, antidouleur). 29VC (R25) : réchauffer l'utérus si froid.`,
        pointsUtilises: [
          { code: '8F', technique: 'tonification', justification: "Source Foie — nourrit le Sang du Foie, régularise le cycle", ordre: 1 },
          { code: '6Rte', technique: 'tonification', justification: "Réunion des 3 Yin — nourrit le Sang, régularise les menstruations", ordre: 2 },
          { code: '3F', nomIeatc: 'Tai Chong', technique: 'dispersion', justification: "Lève la stagnation de Qi du Foie — SPM et douleurs prémenstruelles", ordre: 3 },
          { code: '10Rte', technique: 'dispersion', justification: "Lève la stagnation de Sang — caillots et douleurs fixes", ordre: 4 },
          { code: '4GI', nomIeatc: 'He Gu', technique: 'dispersion', justification: "Lève la stagnation de Qi général — antidouleur puissant", ordre: 5 },
        ],
        niveauConfiance: 'expert',
        sourceType: 'editoriale',
        version: 1,
        enseignementCle: "Dysménorrhée à caillots = stagnation de Sang sur fond de stagnation de Qi du Foie. Nourrir le Sang D'ABORD, lever la stagnation ensuite. L'inverse aggrave.",
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // CAS 010 — PIERRE, 50 ANS — Tendinite épicondyle + stress
  // Grille principale : Méridiens (GI/TR)
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'cas-010',
    slug: 'pierre-50-ans-tendinite-epicondyle',
    titre: 'Pierre, 50 ans — Tendinite épicondyle latéral bras droit',
    statut: 'publie',
    niveauComplexite: 1,
    age: 50,
    trancheAge: 'adulte',
    sexe: 'masculin',
    dateCreation: '2025-12-01',
    datePublication: '2025-12-15',
    casComplet: true,
    exemplaire: false,
    grillePrincipale: 'meridiens',
    tags: ['tendinite', 'épicondylite', 'méridien GI', 'TR', 'coude', 'Oé/Iong'],
    viewCount: 64,
    content: {
      motif: "Tendinite épicondyle latéral au coude droit depuis 3 mois — douleur irradiant dans l'avant-bras lors de la prise en pronation.",
      interrogatoire: [
        { cle: 'douleur', valeur: "Douleur vive à la pression de l'épicondyle latéral. Irradiation vers le poignet lors de la serrage. Aggravée par le geste répété (tennis, travail informatique)." },
        { cle: 'horaire', valeur: "Mieux le matin, pire en cours de journée. Aggravée par le froid humide." },
        { cle: 'general', valeur: "Stress professionnel important. Fatigue générale. Travaille 60h/semaine depuis 6 mois." },
        { cle: 'antecedents', valeur: "Joueur de tennis (3-4h/semaine). Aucun traumatisme. Apparition progressive et insidieuse." },
      ],
      observation: "Douleur reproductible à la pression de l'épicondyle latéral. Test de Cozen positif. Pas d'atteinte neurologique.",
      prisePouls: {
        condition: "Patient assis, bras droit examiné",
        lectures: [
          { position: 'foyer_superieur_droit', qualites: ['vide', 'superficiel'], interpretation: "Pouls superficiel vide à droite — Oé en plénitude locale sur fond d'Iong insuffisante." },
          { position: 'foyer_moyen_droit', qualites: ['large', 'mou'], interpretation: "Rate légèrement large et mou — Foyer Moyen un peu chargé." },
          { position: 'global_superficiel', qualites: ['vide'], interpretation: "Pouls global superficiel vide — vide Yang général, fatigue de fond." },
        ],
        synthese: "Paradoxe Oé/Iong : chaleur/inflammation locale (Oé en excès) sur fond de vide Yang général (Iong insuffisante). Traiter l'Iong générale ET disperser l'Oé locale.",
      },
    },
    analyses: [
      {
        id: 'a010-meridiens-officielle',
        caseId: 'cas-010',
        type: 'officielle',
        auteurPseudo: 'Jean-Marc Pellerin',
        auteurStatut: 'expert',
        role: 'expert',
        publicationMode: 'public',
        votePoints: 29,
        valeur: 2.9,
        grillePrincipale: 'meridiens',
        grillesSecondaires: ['yin_yang'],
        polarite: 'yang',
        localisationFoyer: 'superieur',
        raisonnement: `Tendinite de l'épicondyle latéral = atteinte du méridien Gros Intestin (Yang Ming du bras). Le méridien GI passe exactement sur l'épicondyle latéral. La stagnation locale d'Oé (chaleur-inflammation) est réelle mais superficielle.

Règle R6 : paradoxe Oé/Iong. Le vide Yang général (surmenage, Iong insuffisante) crée un déséquilibre où l'Oé stagne en surface. Si on disperse seulement l'Oé locale sans tonifier l'Iong générale, l'effet sera fugace — la stagnation reviendra.

La double action est nécessaire : tonifier l'Iong (Yang général) + disperser l'Oé locale (méridien GI au coude).`,
        categoriesDiagnostiques: [
          "Obstruction du méridien Gros Intestin — Oé en plénitude locale",
          "Paradoxe Oé plénitude locale / Iong insuffisante générale",
          "Vide de Yang général — surmenage, Iong affaiblie",
        ],
        strategieTherapeutique: "1. Tonifier l'Iong générale (Yang général). 2. Disperser l'Oé au méridien GI local. 3. Traitement local de l'épicondyle.",
        traitementPropose: `36E tonification + moxas (Yang général — tonifie l'Iong). 11GI dispersion (point local épicondyle — lève la stagnation d'Oé). 4GI dispersion (distal GI — renforce l'action de 11GI). 5TR dispersion (méridien TR — adjacent à GI au coude). 41VB tonification (tendon-ligaments général).`,
        pointsUtilises: [
          { code: '36E', nomIeatc: 'Zu San Li', technique: 'moxa_tonification', justification: "Tonifie l'Iong générale — traitement de fond du vide Yang", ordre: 1 },
          { code: '11GI', nomIeatc: 'Qu Chi', technique: 'dispersion', justification: "Point local de l'épicondyle — disperse l'Oé dans le méridien GI", ordre: 2 },
          { code: '4GI', nomIeatc: 'He Gu', technique: 'dispersion', justification: "Distal GI — renforce la dispersion de l'Oé locale", ordre: 3 },
          { code: '5TR', technique: 'dispersion', justification: "Méridien Triple Réchauffeur au coude — complémentaire de GI", ordre: 4 },
          { code: '34VB', technique: 'tonification', justification: "Point Hui des tendons — action globale sur les tendons", ordre: 5 },
        ],
        niveauConfiance: 'expert',
        sourceType: 'editoriale',
        version: 1,
        enseignementCle: "Règle R6 — paradoxe Oé/Iong : toujours tonifier l'Iong générale EN MÊME TEMPS que disperser l'Oé locale. L'un sans l'autre = rechutes.",
      },
    ],
  },
];

// ─── Utilitaires ─────────────────────────────────────────────────────────────

export const getCaseById = (id: string): ClinicalCase | undefined =>
  CLINICAL_CASES.find((c) => c.id === id);

export const getCaseBySlug = (slug: string): ClinicalCase | undefined =>
  CLINICAL_CASES.find((c) => c.slug === slug);

export const getCasesPublies = (): ClinicalCase[] =>
  CLINICAL_CASES.filter((c) => c.statut === 'publie');

export const getCasesExemplaires = (): ClinicalCase[] =>
  CLINICAL_CASES.filter((c) => c.exemplaire && c.statut === 'publie');

export const getCasesRecents = (limit = 4): ClinicalCase[] =>
  [...CLINICAL_CASES]
    .filter((c) => c.statut === 'publie')
    .sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime())
    .slice(0, limit);

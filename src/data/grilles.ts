import type { ReadingGrid, ReadingGridId } from '@/types';

// Les grilles de lecture IEATC — dans l'ordre d'utilisation clinique
// Yin/Yang TOUJOURS en premier — oriente tout

export const GRILLES: ReadingGrid[] = [
  {
    id: 'yin_yang',
    nom: 'Yin / Yang',
    nomCourt: 'Yin/Yang',
    description:
      "Grille fondatrice. Oriente TOUT le raisonnement. Détermine la polarité générale du patient et du trouble avant toute autre lecture. Distingue vide/plénitude, froid/chaleur, interne/externe.",
    ordre: 1,
    colorClass: 'bg-slate-800',
    textClass: 'text-white',
    borderClass: 'border-slate-700',
    dotClass: 'bg-slate-600',
  },
  {
    id: 'trois_foyers',
    nom: 'Trois Foyers',
    nomCourt: '3 Foyers',
    description:
      "Localisation du déséquilibre : Foyer Supérieur (Cœur, Poumon), Foyer Moyen (Rate, Estomac), Foyer Inférieur (Foie, Rein, intestins). Indique où intervenir en priorité.",
    ordre: 2,
    colorClass: 'bg-teal-700',
    textClass: 'text-white',
    borderClass: 'border-teal-600',
    dotClass: 'bg-teal-500',
  },
  {
    id: 'cinq_elements',
    nom: 'Cinq Éléments',
    nomCourt: '5 Éléments',
    description:
      "Bois, Feu, Terre, Métal, Eau. Cycles d'engendrement (Tcheng) et de contrôle (Ko). Lecture constitutionnelle, saisonnière, émotionnelle. Points Su.",
    ordre: 3,
    colorClass: 'bg-amber-600',
    textClass: 'text-white',
    borderClass: 'border-amber-500',
    dotClass: 'bg-amber-400',
  },
  {
    id: 'zang_fu',
    nom: 'Tsang / Fu',
    nomCourt: 'Tsang/Fu',
    description:
      "Organes Tsang (pleins, Yin : Cœur, Foie, Rate, Poumon, Rein) et viscères Fu (creux, Yang). Leurs fonctions, pathologies et traitements.",
    ordre: 4,
    colorClass: 'bg-indigo-600',
    textClass: 'text-white',
    borderClass: 'border-indigo-500',
    dotClass: 'bg-indigo-400',
  },
  {
    id: 'meridiens',
    nom: 'Méridiens',
    nomCourt: 'Méridiens',
    description:
      "Lecture par les trajets méridiens. Indiquée quand la douleur ou le symptôme suit un trajet, quand la localisation est précise. Points locaux et distaux selon le méridien atteint.",
    ordre: 5,
    colorClass: 'bg-emerald-700',
    textClass: 'text-white',
    borderClass: 'border-emerald-600',
    dotClass: 'bg-emerald-500',
  },
  {
    id: 'quatre_energies',
    nom: '4 Énergies (Iong/Oé/Tsing/TT)',
    nomCourt: '4 Énergies',
    description:
      "Lecture par les quatre types d'énergie : Iong (nutritive), Oé (défensive), Tsing (ancestrale), TT (grands méridiens). Oriente la stratégie selon la nature énergétique du déséquilibre.",
    ordre: 6,
    colorClass: 'bg-cyan-700',
    textClass: 'text-white',
    borderClass: 'border-cyan-600',
    dotClass: 'bg-cyan-500',
  },
  {
    id: 'merveilleux_vaisseaux',
    nom: 'Merveilleux Vaisseaux',
    nomCourt: 'Merv. Vaisseaux',
    description:
      "Les 8 vaisseaux extraordinaires (Qi Jing Ba Mai). Réservoirs d'énergie ancestrale, régulateurs des cycles profonds. Indiqués dans les pathologies chroniques, constitutionnelles ou répétitives.",
    ordre: 7,
    colorClass: 'bg-violet-700',
    textClass: 'text-white',
    borderClass: 'border-violet-600',
    dotClass: 'bg-violet-500',
  },
  {
    id: 'grands_meridiens_climats',
    nom: 'Grands Méridiens & Climats',
    nomCourt: 'Gr. Méridiens',
    description:
      "Les six grands méridiens (Taé Yang, Chao Yang, Yang Ming, Taé Yin, Tsiué Yin, Chao Yin) et leur rapport aux six facteurs climatiques pathogènes (Vent/Fong, Froid, Chaleur-Été, Humidité, Sécheresse, Chaleur-Feu).",
    ordre: 8,
    colorClass: 'bg-rose-700',
    textClass: 'text-white',
    borderClass: 'border-rose-600',
    dotClass: 'bg-rose-500',
  },
];

export const getGrille = (id: ReadingGridId): ReadingGrid | undefined =>
  GRILLES.find((g) => g.id === id);

export const getGrilleLabel = (id: ReadingGridId): string =>
  GRILLES.find((g) => g.id === id)?.nomCourt ?? id;

// Grilles disponibles pour la participation (toutes)
export const GRILLES_PARTICIPATION = GRILLES;

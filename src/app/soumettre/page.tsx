'use client';

// ─── Page de soumission d'un nouveau cas clinique ────────────────────────────
// Formulaire complet : titre, motif, interrogatoire (6 rubriques IEATC),
// observation, palpation, pouls structures (4 principes IEATC), langue,
// examens complementaires.
// PAS de section therapie (bilan, strategie, points).
// Stocke dans localStorage via user-cases-store.

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { addUserCase } from '@/lib/user-cases-store';
import { Button } from '@/components/ui/button';
import type {
  ClinicalCase,
  QualitePouls,
  LecturePouls,
  ItemInterrogatoire,
  PublicationMode,
  PalpationAbdoEntry,
  ElementWuxing,
  EtatPalpationAbdo,
} from '@/types';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  Plus,
  X,
  FileText,
  LogIn,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// ─── Constantes ──────────────────────────────────────────────────────────────

// Qualites de pouls IEATC (15 qualites + "autre" texte libre)
const QUALITES_POULS: { id: QualitePouls; label: string }[] = [
  { id: 'vide', label: 'Vide' },
  { id: 'plein', label: 'Plein' },
  { id: 'vide_plus' as QualitePouls, label: 'Vide+' },
  { id: 'plein_plus' as QualitePouls, label: 'Plein+' },
  { id: 'faible' as QualitePouls, label: 'Faible' },
  { id: 'rapide', label: 'Rapide' },
  { id: 'lent', label: 'Lent' },
  { id: 'profond', label: 'Profond' },
  { id: 'superficiel', label: 'Superficiel' },
  { id: 'large', label: 'Large' },
  { id: 'mou', label: 'Mou' },
  { id: 'dur', label: 'Tendu' },
  { id: 'etroit', label: 'Fin' },
  { id: 'corde_arc', label: 'Glissant' },
  { id: 'normal', label: 'Rugueux' },
  { id: 'absent', label: 'Serre' },
];

// Qualites supplementaires representees par des cles textuelles
// (flottant, noye — pas dans le type QualitePouls, donc geres via "autre")
const QUALITES_EXTRA_LABELS = ['Flottant', 'Noye'];

const RUBRIQUES_INTERROGATOIRE_SUGGEREES = [
  { cle: 'symptomes', label: 'Comment se manifestent les symptômes' },
  { cle: 'aggravation_amelioration', label: 'Aggravation / amélioration' },
  { cle: 'temporalite', label: 'Temporalité' },
  { cle: 'antecedents', label: 'Antécédents' },
  { cle: 'traitements_en_cours', label: 'Traitements en cours' },
  { cle: 'episodes_de_vie', label: 'Épisodes de vie' },
];

const INTERROGATOIRE_PLACEHOLDERS: Record<string, string> = {
  symptomes: "Ex : douleur lombaire irradiant vers la fesse droite, pire à la station debout prolongée, depuis 3 semaines...",
  aggravation_amelioration: "Ex : aggravé par le froid et l'humidité, amélioré par la chaleur et le repos...",
  temporalite: "Ex : apparu progressivement depuis 3 semaines, recrudescence nocturne entre 1h et 3h du matin...",
  antecedents: "Ex : appendicite à 20 ans, entorse de cheville récidivante, mononucléose il y a 7 ans avec fatigue prolongée...",
  traitements_en_cours: "Ex : ibuprofène 400mg si besoin, kinésithérapie 2×/semaine depuis 1 mois...",
  episodes_de_vie: "Ex : séparation il y a 6 mois, surcharge professionnelle depuis 1 an, déménagement récent...",
};

const ELEMENTS_WUXING: { id: ElementWuxing; label: string }[] = [
  { id: 'bois', label: 'Bois' },
  { id: 'feu', label: 'Feu' },
  { id: 'terre', label: 'Terre' },
  { id: 'metal', label: 'Metal' },
  { id: 'eau', label: 'Eau' },
];

const ETATS_PALPATION: { id: EtatPalpationAbdo; label: string }[] = [
  { id: 'bloque', label: 'Bloque' },
  { id: 'douloureux', label: 'Douloureux' },
  { id: 'vide', label: 'Vide' },
  { id: 'plein', label: 'Plein' },
  { id: 'chaud' as EtatPalpationAbdo, label: 'Chaud' },
  { id: 'froid' as EtatPalpationAbdo, label: 'Froid' },
];

// ─── Types internes pour le systeme de pouls 4 principes ────────────────────

interface PoulsPositionData {
  qualites: QualitePouls[];
  autre: string;
}

function emptyPosition(): PoulsPositionData {
  return { qualites: [], autre: '' };
}

interface OrganeEntry {
  id: string;
  nom: string;
  data: PoulsPositionData;
}

// ─── Section pliable ────────────────────────────────────────────────────────

function Section({
  title,
  children,
  defaultOpen = true,
  optional = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  optional?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <span className="text-sm font-semibold text-slate-700">
          {title}
          {optional && <span className="text-slate-400 font-normal ml-2">(optionnel)</span>}
        </span>
        <span className="text-slate-400 text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="px-5 py-4 space-y-3">{children}</div>}
    </div>
  );
}

// ─── Section depliable/repliable pour les principes de pouls ────────────────

function PrincipeSection({
  title,
  subtitle,
  children,
  defaultOpen = false,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-100 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50/50 hover:bg-slate-100/50 transition-colors"
      >
        <div className="text-left">
          <span className="text-xs font-bold text-slate-700">{title}</span>
          {subtitle && <span className="text-[10px] text-slate-400 ml-2">{subtitle}</span>}
        </div>
        {open ? (
          <ChevronUp size={14} className="text-slate-400" />
        ) : (
          <ChevronDown size={14} className="text-slate-400" />
        )}
      </button>
      {open && <div className="px-4 py-3 space-y-3">{children}</div>}
    </div>
  );
}

// ─── Composant selecteur de qualites de pouls ──────────────────────────────

function QualitesSelector({
  label,
  data,
  onChange,
}: {
  label: string;
  data: PoulsPositionData;
  onChange: (d: PoulsPositionData) => void;
}) {
  const toggleQualite = (q: QualitePouls) => {
    if (data.qualites.includes(q)) {
      onChange({ ...data, qualites: data.qualites.filter((x) => x !== q) });
    } else {
      onChange({ ...data, qualites: [...data.qualites, q] });
    }
  };

  return (
    <div className="border border-slate-100 rounded-lg p-3 space-y-2">
      <p className="text-xs font-semibold text-slate-700">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {QUALITES_POULS.map((q) => (
          <button
            key={q.id}
            type="button"
            onClick={() => toggleQualite(q.id)}
            className={cn(
              'text-xs px-2 py-1 rounded-full border transition-colors',
              data.qualites.includes(q.id)
                ? 'bg-teal-600 text-white border-teal-600'
                : 'border-slate-200 text-slate-600 hover:border-slate-300',
            )}
          >
            {q.label}
          </button>
        ))}
      </div>
      <input
        type="text"
        value={data.autre}
        onChange={(e) => onChange({ ...data, autre: e.target.value })}
        placeholder="Autre qualite (texte libre)..."
        className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
    </div>
  );
}

// ─── Page principale ────────────────────────────────────────────────────────

export default function SoumettreCasPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Champs du formulaire
  const [titre, setTitre] = useState('');
  const [motif, setMotif] = useState('');
  const [observation, setObservation] = useState('');
  const [palpation, setPalpation] = useState('');
  const [langue, setLangue] = useState('');
  const [examens, setExamens] = useState('');
  const [saved, setSaved] = useState(false);

  // Interrogatoire : 6 rubriques suggerees + rubriques libres
  const [interrogatoire, setInterrogatoire] = useState<ItemInterrogatoire[]>(
    RUBRIQUES_INTERROGATOIRE_SUGGEREES.map((r) => ({ cle: r.cle, valeur: '' })),
  );
  const [rubriquesLibres, setRubriquesLibres] = useState<ItemInterrogatoire[]>([]);

  // ─── Pouls structures — 4 principes IEATC ─────────────────────────────────

  // Principe I — Yin/Yang Gauche/Droite
  const [p1Gauche, setP1Gauche] = useState<PoulsPositionData>(emptyPosition());
  const [p1Droit, setP1Droit] = useState<PoulsPositionData>(emptyPosition());
  const [p1Comparaison, setP1Comparaison] = useState<string>('');

  // Principe II — Superficie/Profondeur
  const [p2SuperficieGauche, setP2SuperficieGauche] = useState<PoulsPositionData>(emptyPosition());
  const [p2ProfondeurGauche, setP2ProfondeurGauche] = useState<PoulsPositionData>(emptyPosition());
  const [p2SuperficieDroite, setP2SuperficieDroite] = useState<PoulsPositionData>(emptyPosition());
  const [p2ProfondeurDroite, setP2ProfondeurDroite] = useState<PoulsPositionData>(emptyPosition());

  // Principe III — Les 3 Foyers
  const [p3FoyerSup, setP3FoyerSup] = useState<PoulsPositionData>(emptyPosition());
  const [p3FoyerMoy, setP3FoyerMoy] = useState<PoulsPositionData>(emptyPosition());
  const [p3FoyerInf, setP3FoyerInf] = useState<PoulsPositionData>(emptyPosition());

  // Principe IV — Les organes (Zang/Fu)
  const [p4Organes, setP4Organes] = useState<OrganeEntry[]>([]);

  // Pouls peripheriques
  const [poulsPeripheriques, setPoulsPeripheriques] = useState<
    { id: string; titre: string; texte: string }[]
  >([]);

  const [poulsSynthese, setPoulsSynthese] = useState('');

  // Palpation abdominale (optionnelle)
  const [showPalpAbdo, setShowPalpAbdo] = useState(false);
  const [palpAbdo, setPalpAbdo] = useState<PalpationAbdoEntry[]>([]);

  // Erreur
  const [error, setError] = useState<string | null>(null);

  // Ajouter une rubrique libre a l'interrogatoire
  const addRubriqueLibre = () => {
    setRubriquesLibres([...rubriquesLibres, { cle: '', valeur: '' }]);
  };

  // Organes Principe IV
  const addOrgane = () => {
    setP4Organes((prev) => [...prev, { id: `org-${Date.now()}`, nom: '', data: emptyPosition() }]);
  };
  const removeOrgane = (id: string) => {
    setP4Organes((prev) => prev.filter((o) => o.id !== id));
  };
  const updateOrgane = (id: string, patch: Partial<OrganeEntry>) => {
    setP4Organes((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  };

  // Ajouter un pouls peripherique
  const addPoulsPeripherique = () => {
    setPoulsPeripheriques([
      ...poulsPeripheriques,
      { id: `pp-${Date.now()}`, titre: '', texte: '' },
    ]);
  };

  // Toggle palpation abdominale
  const togglePalpAbdoElement = (element: ElementWuxing, etat: EtatPalpationAbdo) => {
    setPalpAbdo((prev) => {
      const existing = prev.find((e) => e.element === element);
      if (existing) {
        const hasEtat = existing.etats.includes(etat);
        const newEtats = hasEtat
          ? existing.etats.filter((e) => e !== etat)
          : [...existing.etats, etat];
        if (newEtats.length === 0) {
          return prev.filter((e) => e.element !== element);
        }
        return prev.map((e) => (e.element === element ? { ...e, etats: newEtats } : e));
      }
      return [...prev, { element, etats: [etat] }];
    });
  };

  // Verifier si une position de pouls a des donnees
  const positionHasData = (d: PoulsPositionData) => d.qualites.length > 0 || d.autre.trim().length > 0;

  // Construire les lectures de pouls a partir des 4 principes
  const buildLectures = useCallback((): LecturePouls[] => {
    const lectures: LecturePouls[] = [];

    // Helper pour ajouter une lecture
    const add = (posLabel: string, data: PoulsPositionData) => {
      if (!positionHasData(data)) return;
      const qualites = [...data.qualites];
      const interpretation = data.autre.trim();
      lectures.push({
        position: 'specifique',
        positionLabel: posLabel,
        qualites,
        interpretation,
      });
    };

    // Principe I
    if (p1Comparaison) {
      lectures.push({
        position: 'specifique',
        positionLabel: `Principe I — ${p1Comparaison}`,
        qualites: [],
        interpretation: `Comparaison quantitative : ${p1Comparaison}`,
      });
    }
    add('Pouls gauche (qualitatif)', p1Gauche);
    add('Pouls droit (qualitatif)', p1Droit);

    // Principe II
    add('Superficie gauche (energie externe)', p2SuperficieGauche);
    add('Profondeur gauche (sang externe)', p2ProfondeurGauche);
    add('Superficie droite (energie interne)', p2SuperficieDroite);
    add('Profondeur droite (sang interne)', p2ProfondeurDroite);

    // Principe III
    add('Foyer Supérieur (bilatéral)', p3FoyerSup);
    add('Foyer Moyen (bilatéral)', p3FoyerMoy);
    add('Foyer Inférieur (bilatéral)', p3FoyerInf);

    // Principe IV
    for (const organe of p4Organes) {
      if (organe.nom.trim() || positionHasData(organe.data)) {
        add(organe.nom.trim() || 'Organe non nommé', organe.data);
      }
    }

    // Pouls peripheriques
    for (const pp of poulsPeripheriques) {
      if (pp.titre.trim() && pp.texte.trim()) {
        lectures.push({
          position: 'specifique',
          positionLabel: pp.titre.trim(),
          qualites: [],
          interpretation: pp.texte.trim(),
        });
      }
    }

    return lectures;
  }, [
    p1Comparaison, p1Gauche, p1Droit,
    p2SuperficieGauche, p2ProfondeurGauche, p2SuperficieDroite, p2ProfondeurDroite,
    p3FoyerSup, p3FoyerMoy, p3FoyerInf,
    p4Organes,
    poulsPeripheriques,
  ]);

  // Soumission
  const handleSubmit = useCallback(
    async (publicationMode: PublicationMode) => {
      setError(null);

      if (!user) {
        setError('Vous devez etre connecte pour soumettre un cas.');
        return;
      }
      if (!titre.trim()) {
        setError('Le titre du cas est obligatoire.');
        return;
      }
      if (!motif.trim()) {
        setError('Le motif de consultation est obligatoire.');
        return;
      }

      // Construire l'interrogatoire
      const allInterrogatoire = [
        ...interrogatoire.filter((i) => i.valeur.trim()),
        ...rubriquesLibres.filter((i) => i.cle.trim() && i.valeur.trim()),
      ];

      if (allInterrogatoire.length === 0) {
        setError("L'interrogatoire doit contenir au moins une rubrique remplie.");
        return;
      }

      // Construire les lectures de pouls
      const lectures = buildLectures();

      if (lectures.length === 0) {
        setError('Veuillez renseigner au moins une position de pouls.');
        return;
      }

      // Construire le cas
      const now = new Date().toISOString();
      const casId = `user-cas-${Date.now()}`;
      const slug = titre
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 60);

      const newCas: ClinicalCase = {
        id: casId,
        slug,
        titre: titre.trim(),
        statut: 'publie',
        niveauComplexite: 2, // defaut
        dateCreation: now,
        datePublication: now,
        auteurId: user.id,
        casComplet: true,
        exemplaire: false,
        grillePrincipale: 'yin_yang',
        tags: [],
        viewCount: 0,
        content: {
          motif: motif.trim(),
          interrogatoire: allInterrogatoire,
          observation: observation.trim() || undefined,
          palpation: palpation.trim() || undefined,
          prisePouls: {
            condition: 'Non precise',
            lectures,
            synthese: poulsSynthese.trim() || undefined,
          },
        },
        analyses: [],
      };

      const { error: saveError } = await addUserCase(newCas);
      if (saveError) {
        setError('Erreur lors de la sauvegarde : ' + saveError);
        return;
      }
      setSaved(true);
      setTimeout(() => {
        router.push(`/mes-cas/${casId}`);
      }, 1500);
    },
    [
      user, titre, motif, observation, palpation, interrogatoire,
      rubriquesLibres, buildLectures, poulsSynthese, router, p4Organes,
    ],
  );

  // Utilisateur non connecte
  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10">
          <FileText size={36} className="text-slate-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-900 mb-2">Soumettre un cas</h1>
          <p className="text-slate-500 text-sm mb-6">
            Connectez-vous pour soumettre un cas clinique.
          </p>
          <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-teal-600 text-white hover:bg-teal-500 font-semibold text-sm transition-colors">
            <LogIn size={16} />
            Connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <FileText size={22} className="text-teal-600" />
          <h1 className="text-2xl font-bold text-slate-900">Soumettre un cas clinique</h1>
        </div>
        <p className="text-slate-500 text-sm">
          Partagez un cas clinique avec la communauté IEATC.
        </p>
      </div>

      {/* Avertissement anonymisation */}
      <div className="bg-amber-50 border border-amber-300 rounded-xl px-5 py-4 mb-8 flex items-start gap-3">
        <AlertTriangle size={18} className="text-amber-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-amber-800 mb-1">Anonymisation obligatoire</p>
          <p className="text-sm text-amber-700">
            Ne mentionnez jamais le vrai prenom du patient, pas d&apos;adresse exacte,
            pas de date de naissance precise, pas de nom d&apos;etablissement ni
            d&apos;information permettant d&apos;identifier la personne.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {/* 1. Titre */}
        <Section title="Titre du cas">
          <input
            type="text"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            placeholder="Ex : Marie, 52 ans, femme — douleurs lombaires chroniques"
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <p className="text-xs text-slate-400">Prenom FICTIF + age + sexe + motif principal</p>
        </Section>

        {/* 2. Motif */}
        <Section title="Motif de consultation">
          <textarea
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            rows={3}
            placeholder="Decrivez le motif de consultation principal..."
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          />
        </Section>

        {/* 3. Interrogatoire — 6 rubriques IEATC */}
        <Section title="Interrogatoire">
          <p className="text-xs text-slate-500 mb-2">
            Remplissez les rubriques suggerees et/ou ajoutez des rubriques libres.
          </p>
          {/* Rubriques suggerees */}
          {interrogatoire.map((item, idx) => {
            const label = RUBRIQUES_INTERROGATOIRE_SUGGEREES.find((r) => r.cle === item.cle)?.label ?? item.cle;
            return (
              <div key={item.cle} className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">{label}</label>
                <textarea
                  value={item.valeur}
                  onChange={(e) => {
                    const next = [...interrogatoire];
                    next[idx] = { ...item, valeur: e.target.value };
                    setInterrogatoire(next);
                  }}
                  rows={2}
                  placeholder={INTERROGATOIRE_PLACEHOLDERS[item.cle] ?? `${label}...`}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>
            );
          })}

          {/* Rubriques libres */}
          {rubriquesLibres.map((item, idx) => (
            <div key={idx} className="flex gap-2 items-start">
              <input
                type="text"
                value={item.cle}
                onChange={(e) => {
                  const next = [...rubriquesLibres];
                  next[idx] = { ...item, cle: e.target.value };
                  setRubriquesLibres(next);
                }}
                placeholder="Rubrique..."
                className="w-32 px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 shrink-0"
              />
              <textarea
                value={item.valeur}
                onChange={(e) => {
                  const next = [...rubriquesLibres];
                  next[idx] = { ...item, valeur: e.target.value };
                  setRubriquesLibres(next);
                }}
                rows={2}
                placeholder="Contenu..."
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />
              <button
                type="button"
                onClick={() => setRubriquesLibres(rubriquesLibres.filter((_, i) => i !== idx))}
                className="text-slate-400 hover:text-red-500 p-1.5 mt-1"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addRubriqueLibre}>
            <Plus size={12} /> Ajouter une rubrique
          </Button>
        </Section>

        {/* 4. Observation */}
        <Section title="Observation" optional>
          <textarea
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            rows={3}
            placeholder="Aspect general, teint, morphologie, attitude..."
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          />
        </Section>

        {/* 5. Palpation */}
        <Section title="Palpation" optional>
          <textarea
            value={palpation}
            onChange={(e) => setPalpation(e.target.value)}
            rows={3}
            placeholder="Points douloureux, ganglions, temperature locale..."
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          />
        </Section>

        {/* 6. Pouls — 4 Principes IEATC */}
        <Section title="Pouls (4 Principes IEATC)">
          <p className="text-xs text-slate-500 mb-2">
            Renseignez les qualites de pouls selon les 4 principes IEATC.
            Au moins 1 position doit etre remplie.
          </p>

          <div className="space-y-3">
            {/* PRINCIPE I — Yin/Yang Gauche/Droite */}
            <PrincipeSection title="PRINCIPE I — Yin/Yang Gauche/Droite" defaultOpen>
              {/* Comparaison quantitative */}
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-2">Comparaison quantitative gauche / droite</p>
                <div className="flex flex-wrap gap-2">
                  {['G=D', 'G>D', 'G>>D', 'G<D', 'G<<D'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setP1Comparaison(p1Comparaison === opt ? '' : opt)}
                      className={cn(
                        'text-sm font-mono px-3 py-1.5 rounded-lg border-2 transition-colors',
                        p1Comparaison === opt
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300',
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              {/* Qualités optionnelles par côté */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <QualitesSelector label="Qualité gauche (optionnel)" data={p1Gauche} onChange={setP1Gauche} />
                <QualitesSelector label="Qualité droite (optionnel)" data={p1Droit} onChange={setP1Droit} />
              </div>
            </PrincipeSection>

            {/* PRINCIPE II — Superficie/Profondeur */}
            <PrincipeSection
              title="PRINCIPE II — Superficie/Profondeur"
            >
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">
                Poignet gauche (externe)
              </p>
              <QualitesSelector
                label="Superficie gauche (energie externe — meridiens)"
                data={p2SuperficieGauche}
                onChange={setP2SuperficieGauche}
              />
              <QualitesSelector
                label="Profondeur gauche (sang externe — meridiens)"
                data={p2ProfondeurGauche}
                onChange={setP2ProfondeurGauche}
              />
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide pt-2">
                Poignet droit (interne)
              </p>
              <QualitesSelector
                label="Superficie droite (energie interne — organique)"
                data={p2SuperficieDroite}
                onChange={setP2SuperficieDroite}
              />
              <QualitesSelector
                label="Profondeur droite (sang interne — organique)"
                data={p2ProfondeurDroite}
                onChange={setP2ProfondeurDroite}
              />
            </PrincipeSection>

            {/* PRINCIPE III — Les 3 Foyers */}
            <PrincipeSection
              title="PRINCIPE III — Les 3 Foyers"
              subtitle="Prise bilatérale — état global du foyer"
            >
              <QualitesSelector label="Loge I (Pouce) — Foyer Supérieur" data={p3FoyerSup} onChange={setP3FoyerSup} />
              <QualitesSelector label="Loge II (Barrière) — Foyer Moyen" data={p3FoyerMoy} onChange={setP3FoyerMoy} />
              <QualitesSelector label="Loge III (Pied) — Foyer Inférieur" data={p3FoyerInf} onChange={setP3FoyerInf} />
            </PrincipeSection>

            {/* PRINCIPE IV — Les organes (Zang/Fu) */}
            <PrincipeSection title="PRINCIPE IV — Organes (Zang/Fu)" subtitle="Ajoutez les organes observés">
              {p4Organes.map((organe) => (
                <div key={organe.id} className="border border-slate-100 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={organe.nom}
                      onChange={(e) => updateOrgane(organe.id, { nom: e.target.value })}
                      placeholder="Nom de l'organe (ex : Foie, Rein, Rate, Poumon...)"
                      className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeOrgane(organe.id)}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <QualitesSelector
                    label={organe.nom ? `Qualité — ${organe.nom}` : 'Qualité'}
                    data={organe.data}
                    onChange={(d) => updateOrgane(organe.id, { data: d })}
                  />
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addOrgane}>
                <Plus size={12} /> Ajouter un organe
              </Button>
            </PrincipeSection>

            {/* Pouls peripheriques */}
            {poulsPeripheriques.map((pp, idx) => (
              <div key={pp.id} className="border border-slate-100 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={pp.titre}
                    onChange={(e) => {
                      const next = [...poulsPeripheriques];
                      next[idx] = { ...pp, titre: e.target.value };
                      setPoulsPeripheriques(next);
                    }}
                    placeholder="Titre du pouls peripherique..."
                    className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    type="button"
                    onClick={() => setPoulsPeripheriques(poulsPeripheriques.filter((_, i) => i !== idx))}
                    className="text-slate-400 hover:text-red-500 p-1"
                  >
                    <X size={14} />
                  </button>
                </div>
                <textarea
                  value={pp.texte}
                  onChange={(e) => {
                    const next = [...poulsPeripheriques];
                    next[idx] = { ...pp, texte: e.target.value };
                    setPoulsPeripheriques(next);
                  }}
                  rows={2}
                  placeholder="Description du pouls peripherique..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>
            ))}

            <Button variant="outline" size="sm" onClick={addPoulsPeripherique}>
              <Plus size={12} /> Ajouter un pouls peripherique
            </Button>
          </div>

          <div className="mt-3 space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">
              Commentaire supplémentaire sur les pouls
              <span className="text-slate-400 font-normal ml-1">(optionnel)</span>
            </label>
            <textarea
              value={poulsSynthese}
              onChange={(e) => setPoulsSynthese(e.target.value)}
              rows={2}
              placeholder="Notes complémentaires, observations globales sur la prise de pouls... (optionnel)"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>
        </Section>

        {/* 7. Langue */}
        <Section title="Langue" optional>
          <textarea
            value={langue}
            onChange={(e) => setLangue(e.target.value)}
            rows={3}
            placeholder="Description de la langue : couleur, forme, enduit, humidite..."
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          />
        </Section>

        {/* 8. Examens complementaires + palpation abdominale */}
        <Section title="Examens complementaires" optional>
          <textarea
            value={examens}
            onChange={(e) => setExamens(e.target.value)}
            rows={3}
            placeholder="Resultats d'examens complementaires, bilans biologiques..."
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          />

          {/* Palpation abdominale */}
          <div className="pt-2">
            <label className="inline-flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={showPalpAbdo}
                onChange={(e) => setShowPalpAbdo(e.target.checked)}
                className="accent-teal-600"
              />
              Inclure une palpation abdominale (5 elements)
            </label>
          </div>

          {showPalpAbdo && (
            <div className="space-y-2 pt-2">
              <p className="text-xs text-slate-500">Cochez les etats de palpation pour chaque element.</p>
              {ELEMENTS_WUXING.map((el) => {
                const entry = palpAbdo.find((e) => e.element === el.id);
                return (
                  <div key={el.id} className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-600 w-16">{el.label}</span>
                    <div className="flex gap-1.5 flex-wrap">
                      {ETATS_PALPATION.map((etat) => (
                        <button
                          key={etat.id}
                          type="button"
                          onClick={() => togglePalpAbdoElement(el.id, etat.id)}
                          className={cn(
                            'text-xs px-2 py-1 rounded-full border transition-colors',
                            entry?.etats.includes(etat.id)
                              ? 'bg-teal-600 text-white border-teal-600'
                              : 'border-slate-200 text-slate-600 hover:border-slate-300',
                          )}
                        >
                          {etat.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Section>

        {/* Erreur */}
        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-center gap-2">
            <AlertTriangle size={14} /> {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 sticky bottom-0 bg-white py-4 border-t border-slate-100">
          <Button
            onClick={() => handleSubmit('public')}
            variant="primary"
            className={cn('flex-1 gap-2', saved && 'bg-emerald-600')}
          >
            {saved ? (
              <>
                <CheckCircle2 size={16} /> Publie !
              </>
            ) : (
              'Publier'
            )}
          </Button>
          <Button onClick={() => handleSubmit('anonyme')} variant="outline" className="gap-2">
            Publier anonyme
          </Button>
          <Link href="/cas">
            <Button variant="ghost">Annuler</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

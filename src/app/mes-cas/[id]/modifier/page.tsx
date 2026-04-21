'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getUserCaseById, updateUserCase } from '@/lib/user-cases-store';
import { getParticipationsByCase } from '@/lib/participation-store';
import { Button } from '@/components/ui/button';
import type {
  ClinicalCase,
  QualitePouls,
  LecturePouls,
  ItemInterrogatoire,
  PalpationAbdoEntry,
  ElementWuxing,
  EtatPalpationAbdo,
} from '@/types';
import { cn } from '@/lib/utils';
import { AlertTriangle, Plus, X, FileText, ChevronDown, ChevronUp, CheckCircle2, Loader2 } from 'lucide-react';

// ─── Mêmes constantes que soumettre/page.tsx ─────────────────────────────────

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

const RUBRIQUES_INTERROGATOIRE_SUGGEREES = [
  { cle: 'symptomes', label: 'Comment se manifestent les symptômes' },
  { cle: 'aggravation_amelioration', label: 'Aggravation / amélioration' },
  { cle: 'temporalite', label: 'Temporalité' },
  { cle: 'antecedents', label: 'Antécédents' },
  { cle: 'traitements_en_cours', label: 'Traitements en cours' },
  { cle: 'episodes_de_vie', label: 'Épisodes de vie' },
];

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

interface PoulsPositionData {
  qualites: QualitePouls[];
  autre: string;
}

function emptyPosition(): PoulsPositionData {
  return { qualites: [], autre: '' };
}

function lectureToPositionData(lectures: LecturePouls[], label: string): PoulsPositionData {
  const l = lectures.find((x) => x.positionLabel === label);
  if (!l) return emptyPosition();
  return { qualites: l.qualites ?? [], autre: l.interpretation ?? '' };
}

// ─── Composants partagés ──────────────────────────────────────────────────────

function Section({ title, children, defaultOpen = true, optional = false }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean; optional?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3 bg-slate-50 hover:bg-slate-100 transition-colors">
        <span className="text-sm font-semibold text-slate-700">
          {title}{optional && <span className="text-slate-400 font-normal ml-2">(optionnel)</span>}
        </span>
        <span className="text-slate-400 text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="px-5 py-4 space-y-3">{children}</div>}
    </div>
  );
}

function PrincipeSection({ title, subtitle, children, defaultOpen = false }: {
  title: string; subtitle?: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-100 rounded-lg overflow-hidden">
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50/50 hover:bg-slate-100/50 transition-colors">
        <div className="text-left">
          <span className="text-xs font-bold text-slate-700">{title}</span>
          {subtitle && <span className="text-[10px] text-slate-400 ml-2">{subtitle}</span>}
        </div>
        {open ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
      </button>
      {open && <div className="px-4 py-3 space-y-3">{children}</div>}
    </div>
  );
}

function QualitesSelector({ label, data, onChange }: {
  label: string; data: PoulsPositionData; onChange: (d: PoulsPositionData) => void;
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
          <button key={q.id} type="button" onClick={() => toggleQualite(q.id)}
            className={cn('text-xs px-2 py-1 rounded-full border transition-colors',
              data.qualites.includes(q.id) ? 'bg-teal-600 text-white border-teal-600' : 'border-slate-200 text-slate-600 hover:border-slate-300')}>
            {q.label}
          </button>
        ))}
      </div>
      <input type="text" value={data.autre} onChange={(e) => onChange({ ...data, autre: e.target.value })}
        placeholder="Autre qualite (texte libre)..."
        className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500" />
    </div>
  );
}

// ─── Expansion des références de motifs (même logique que soumettre) ──────────

function handleMotifKeyDown(
  e: React.KeyboardEvent<HTMLTextAreaElement>,
  motifsList: string[],
  currentValue: string,
  setValue: (v: string) => void,
) {
  if (e.key !== ' ') return;
  const textarea = e.currentTarget;
  const cursorPos = textarea.selectionStart ?? currentValue.length;
  const textBefore = currentValue.slice(0, cursorPos);
  const match = textBefore.match(/(\d+)\)$/);
  if (!match) return;
  const num = parseInt(match[1]) - 1;
  if (num < 0 || num >= motifsList.length || !motifsList[num].trim()) return;
  e.preventDefault();
  const prefix = textBefore.slice(0, textBefore.length - match[0].length);
  const suffix = currentValue.slice(cursorPos);
  const replacement = motifsList[num].trim() + ' : ';
  const newValue = prefix + replacement + suffix;
  const newCursorPos = prefix.length + replacement.length;
  setValue(newValue);
  requestAnimationFrame(() => { textarea.setSelectionRange(newCursorPos, newCursorPos); });
}

// ─── Page d'édition ───────────────────────────────────────────────────────────

export default function ModifierCasPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const caseId = params.id as string;

  const [cas, setCas] = useState<ClinicalCase | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);

  // Champs de base
  const [titre, setTitre] = useState('');
  const [motifs, setMotifs] = useState<string[]>(['']);
  const [observation, setObservation] = useState('');
  const [palpation, setPalpation] = useState('');
  const [langue, setLangue] = useState('');
  const [examens, setExamens] = useState('');
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Interrogatoire
  const [interrogatoire, setInterrogatoire] = useState<ItemInterrogatoire[]>(
    RUBRIQUES_INTERROGATOIRE_SUGGEREES.map((r) => ({ cle: r.cle, valeur: '' })),
  );
  const [rubriquesLibres, setRubriquesLibres] = useState<ItemInterrogatoire[]>([]);

  // Pouls — Principe I
  const [p1Gauche, setP1Gauche] = useState<PoulsPositionData>(emptyPosition());
  const [p1Droit, setP1Droit] = useState<PoulsPositionData>(emptyPosition());
  const [p1Comparaison, setP1Comparaison] = useState('');

  // Pouls — Principe II
  const [p2SuperficieGauche, setP2SuperficieGauche] = useState<PoulsPositionData>(emptyPosition());
  const [p2ProfondeurGauche, setP2ProfondeurGauche] = useState<PoulsPositionData>(emptyPosition());
  const [p2SuperficieDroite, setP2SuperficieDroite] = useState<PoulsPositionData>(emptyPosition());
  const [p2ProfondeurDroite, setP2ProfondeurDroite] = useState<PoulsPositionData>(emptyPosition());

  // Pouls — Principe III
  const [p3FoyerSup, setP3FoyerSup] = useState<PoulsPositionData>(emptyPosition());
  const [p3FoyerMoy, setP3FoyerMoy] = useState<PoulsPositionData>(emptyPosition());
  const [p3FoyerInf, setP3FoyerInf] = useState<PoulsPositionData>(emptyPosition());

  // Pouls — Principe IV
  const [p4Organes, setP4Organes] = useState<{ id: string; nom: string; data: PoulsPositionData }[]>([]);
  const [poulsPeripheriques, setPoulsPeripheriques] = useState<{ id: string; titre: string; texte: string }[]>([]);
  const [poulsSynthese, setPoulsSynthese] = useState('');

  // Palpation abdominale
  const [showPalpAbdo, setShowPalpAbdo] = useState(false);
  const [palpAbdo, setPalpAbdo] = useState<PalpationAbdoEntry[]>([]);

  // Chargement et hydration du cas existant
  useEffect(() => {
    getUserCaseById(caseId).then(async (found) => {
      if (!found) { setNotFound(true); return; }
      if (found.auteurId !== user?.id) { setLoadError('Vous ne pouvez modifier que vos propres cas.'); return; }

      // Bloquer la modification si le cas a déjà reçu des analyses
      const parts = await getParticipationsByCase(caseId);
      if (parts.length > 0) { setBlocked(true); setCas(found); return; }

      setCas(found);

      // Hydration des champs
      setTitre(found.titre);

      // Motifs
      const motifRaw = found.content.motif ?? '';
      const motifLines = motifRaw.split('\n').filter(Boolean);
      const parsedMotifs = motifLines.map((l) => l.replace(/^\d+\)\s*/, ''));
      setMotifs(parsedMotifs.length > 0 ? parsedMotifs : ['']);

      setObservation(found.content.observation ?? '');
      setPalpation(found.content.palpation ?? '');
      setLangue(found.content.langueTexte ?? '');
      setExamens(found.content.examensTexte ?? '');

      // Interrogatoire
      const existingInterro = found.content.interrogatoire ?? [];
      const suggested = RUBRIQUES_INTERROGATOIRE_SUGGEREES.map((r) => ({
        cle: r.cle,
        valeur: existingInterro.find((i) => i.cle === r.cle)?.valeur ?? '',
      }));
      const libres = existingInterro.filter((i) => !RUBRIQUES_INTERROGATOIRE_SUGGEREES.some((r) => r.cle === i.cle));
      setInterrogatoire(suggested);
      setRubriquesLibres(libres);

      // Pouls
      const lectures = found.content.prisePouls?.lectures ?? [];
      setP1Gauche(lectureToPositionData(lectures, 'Pouls gauche (qualitatif)'));
      setP1Droit(lectureToPositionData(lectures, 'Pouls droit (qualitatif)'));
      const p1Lect = lectures.find((l) => l.positionLabel?.startsWith('Principe I —'));
      if (p1Lect) {
        const val = p1Lect.positionLabel?.replace('Principe I — ', '') ?? '';
        setP1Comparaison(val);
      }
      setP2SuperficieGauche(lectureToPositionData(lectures, 'Superficie gauche (energie externe)'));
      setP2ProfondeurGauche(lectureToPositionData(lectures, 'Profondeur gauche (sang externe)'));
      setP2SuperficieDroite(lectureToPositionData(lectures, 'Superficie droite (energie interne)'));
      setP2ProfondeurDroite(lectureToPositionData(lectures, 'Profondeur droite (sang interne)'));
      setP3FoyerSup(lectureToPositionData(lectures, 'Foyer Supérieur (bilatéral)'));
      setP3FoyerMoy(lectureToPositionData(lectures, 'Foyer Moyen (bilatéral)'));
      setP3FoyerInf(lectureToPositionData(lectures, 'Foyer Inférieur (bilatéral)'));

      // Organes Principe IV
      const knownLabels = new Set([
        'Pouls gauche (qualitatif)', 'Pouls droit (qualitatif)',
        'Superficie gauche (energie externe)', 'Profondeur gauche (sang externe)',
        'Superficie droite (energie interne)', 'Profondeur droite (sang interne)',
        'Foyer Supérieur (bilatéral)', 'Foyer Moyen (bilatéral)', 'Foyer Inférieur (bilatéral)',
      ]);
      const organeLectures = lectures.filter((l) =>
        l.positionLabel && !knownLabels.has(l.positionLabel) && !l.positionLabel.startsWith('Principe I —')
      );
      setP4Organes(organeLectures.map((l, i) => ({
        id: `org-${i}`,
        nom: l.positionLabel ?? '',
        data: { qualites: l.qualites ?? [], autre: l.interpretation ?? '' },
      })));

      setPoulsSynthese(found.content.prisePouls?.synthese ?? '');

      // Palpation abdominale
      if (found.content.palpationAbdo && found.content.palpationAbdo.length > 0) {
        setShowPalpAbdo(true);
        setPalpAbdo(found.content.palpationAbdo);
      }
    });
  }, [caseId, user?.id]);

  const positionHasData = (d: PoulsPositionData) => d.qualites.length > 0 || d.autre.trim().length > 0;

  const buildLectures = useCallback((): LecturePouls[] => {
    const lectures: LecturePouls[] = [];
    const add = (posLabel: string, data: PoulsPositionData) => {
      if (!positionHasData(data)) return;
      lectures.push({ position: 'specifique', positionLabel: posLabel, qualites: data.qualites, interpretation: data.autre.trim() });
    };
    if (p1Comparaison) {
      lectures.push({ position: 'specifique', positionLabel: `Principe I — ${p1Comparaison}`, qualites: [], interpretation: `Comparaison quantitative : ${p1Comparaison}` });
    }
    add('Pouls gauche (qualitatif)', p1Gauche);
    add('Pouls droit (qualitatif)', p1Droit);
    add('Superficie gauche (energie externe)', p2SuperficieGauche);
    add('Profondeur gauche (sang externe)', p2ProfondeurGauche);
    add('Superficie droite (energie interne)', p2SuperficieDroite);
    add('Profondeur droite (sang interne)', p2ProfondeurDroite);
    add('Foyer Supérieur (bilatéral)', p3FoyerSup);
    add('Foyer Moyen (bilatéral)', p3FoyerMoy);
    add('Foyer Inférieur (bilatéral)', p3FoyerInf);
    for (const organe of p4Organes) {
      if (organe.nom.trim() || positionHasData(organe.data)) {
        add(organe.nom.trim() || 'Organe non nommé', organe.data);
      }
    }
    for (const pp of poulsPeripheriques) {
      if (pp.titre.trim() && pp.texte.trim()) {
        lectures.push({ position: 'specifique', positionLabel: pp.titre.trim(), qualites: [], interpretation: pp.texte.trim() });
      }
    }
    return lectures;
  }, [p1Comparaison, p1Gauche, p1Droit, p2SuperficieGauche, p2ProfondeurGauche, p2SuperficieDroite, p2ProfondeurDroite, p3FoyerSup, p3FoyerMoy, p3FoyerInf, p4Organes, poulsPeripheriques]);

  const togglePalpAbdoElement = (element: ElementWuxing, etat: EtatPalpationAbdo) => {
    setPalpAbdo((prev) => {
      const existing = prev.find((e) => e.element === element);
      if (existing) {
        const newEtats = existing.etats.includes(etat) ? existing.etats.filter((e) => e !== etat) : [...existing.etats, etat];
        if (newEtats.length === 0) return prev.filter((e) => e.element !== element);
        return prev.map((e) => (e.element === element ? { ...e, etats: newEtats } : e));
      }
      return [...prev, { element, etats: [etat] }];
    });
  };

  const handleSave = useCallback(async () => {
    setError(null);
    setSubmitting(true);

    if (!titre.trim()) { setError('Le titre est obligatoire.'); setSubmitting(false); return; }
    if (motifs.every((m) => !m.trim())) { setError('Le motif de consultation est obligatoire.'); setSubmitting(false); return; }

    const allInterrogatoire = [
      ...interrogatoire.filter((i) => i.valeur.trim()),
      ...rubriquesLibres.filter((i) => i.cle.trim() && i.valeur.trim()),
    ];
    if (allInterrogatoire.length === 0) { setError("L'interrogatoire doit contenir au moins une rubrique remplie."); setSubmitting(false); return; }

    const lectures = buildLectures();
    if (lectures.length === 0) { setError('Veuillez renseigner au moins une position de pouls.'); setSubmitting(false); return; }

    const motifStr = motifs.filter((m) => m.trim()).length === 1
      ? motifs[0].trim()
      : motifs.map((m, i) => (m.trim() ? `${i + 1}) ${m.trim()}` : null)).filter(Boolean).join('\n');

    const slug = titre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

    const newContent = {
      motif: motifStr,
      interrogatoire: allInterrogatoire,
      observation: observation.trim() || undefined,
      palpation: palpation.trim() || undefined,
      langueTexte: langue.trim() || undefined,
      examensTexte: examens.trim() || undefined,
      palpationAbdo: showPalpAbdo && palpAbdo.length > 0 ? palpAbdo : undefined,
      prisePouls: { condition: cas?.content.prisePouls.condition ?? 'Non precise', lectures, synthese: poulsSynthese.trim() || undefined },
      publicationMode: cas?.content.publicationMode,
      auteurNom: cas?.content.auteurNom,
    };

    const { error: saveError } = await updateUserCase(caseId, { titre: titre.trim(), slug, content: newContent });
    if (saveError) {
      console.error('[modifier] Erreur Supabase :', saveError);
      setError('Erreur lors de la mise à jour : ' + saveError);
      setSubmitting(false);
      return;
    }
    setSaved(true);
    setTimeout(() => { router.push(`/mes-cas/${caseId}`); }, 1200);
  }, [titre, motifs, observation, palpation, langue, examens, interrogatoire, rubriquesLibres, buildLectures, poulsSynthese, showPalpAbdo, palpAbdo, caseId, cas, router]);

  if (notFound) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-slate-900 mb-2">Cas introuvable</h1>
        <Link href="/profil" className="text-teal-600 hover:underline text-sm">Retour au profil</Link>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-red-600 text-sm mb-4">{loadError}</p>
        <Link href="/profil" className="text-teal-600 hover:underline text-sm">Retour au profil</Link>
      </div>
    );
  }

  if (!cas) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 flex justify-center">
        <Loader2 size={28} className="text-teal-500 animate-spin" />
      </div>
    );
  }

  if (blocked) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-100 text-amber-600 mb-2">
          <AlertTriangle size={26} />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Modification impossible</h1>
        <p className="text-slate-600 text-sm leading-relaxed max-w-sm mx-auto">
          Ce cas a déjà reçu des analyses de la communauté. Pour préserver la cohérence de ces
          analyses, il ne peut plus être modifié.
        </p>
        <p className="text-slate-400 text-xs">
          Si une correction est indispensable, contactez un administrateur.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link
            href={`/mes-cas/${caseId}`}
            className="text-sm px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Voir le cas
          </Link>
          <Link
            href="/profil"
            className="text-sm px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-500 transition-colors font-semibold"
          >
            Mon profil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <FileText size={22} className="text-teal-600" />
          <h1 className="text-2xl font-bold text-slate-900">Modifier le cas</h1>
        </div>
        <p className="text-slate-500 text-sm">{cas.titre}</p>
      </div>

      <div className="space-y-5">
        {/* Titre */}
        <Section title="Titre du cas">
          <input type="text" value={titre} onChange={(e) => setTitre(e.target.value)}
            placeholder="Ex : Marie, 52 ans, femme — douleurs lombaires chroniques"
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </Section>

        {/* Motifs */}
        <Section title="Motif de consultation">
          <div className="space-y-3">
            {motifs.map((m, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-600">Motif {idx + 1}</label>
                  {motifs.length > 1 && (
                    <button type="button" onClick={() => setMotifs(motifs.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-red-500 p-1">
                      <X size={13} />
                    </button>
                  )}
                </div>
                <input type="text" value={m} onChange={(e) => { const next = [...motifs]; next[idx] = e.target.value; setMotifs(next); }}
                  placeholder={idx === 0 ? 'Ex : Epicondylite' : 'Ex : Préménopause'}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={() => setMotifs([...motifs, ''])}>
            <Plus size={12} /> Ajouter un motif de consultation
          </Button>
          <p className="text-xs text-slate-400 mt-1">
            Dans l&apos;interrogatoire, tapez <span className="font-mono bg-slate-100 px-1 rounded">1)</span> suivi d&apos;un espace pour insérer automatiquement.
          </p>
        </Section>

        {/* Interrogatoire */}
        <Section title="Interrogatoire">
          {motifs.some((m) => m.trim()) && (
            <div className="text-xs bg-teal-50 border border-teal-100 rounded-lg px-3 py-2 mb-2 space-y-0.5">
              <p className="font-semibold text-teal-700">Raccourcis :</p>
              <div className="flex flex-wrap gap-x-4">
                {motifs.map((m, i) => m.trim() ? <span key={i} className="text-teal-600"><span className="font-mono bg-teal-100 px-1 rounded">{i + 1})</span> → {m.trim()}</span> : null)}
              </div>
            </div>
          )}
          {interrogatoire.map((item, idx) => {
            const label = RUBRIQUES_INTERROGATOIRE_SUGGEREES.find((r) => r.cle === item.cle)?.label ?? item.cle;
            return (
              <div key={item.cle} className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">{label}</label>
                <textarea value={item.valeur}
                  onChange={(e) => { const next = [...interrogatoire]; next[idx] = { ...item, valeur: e.target.value }; setInterrogatoire(next); }}
                  onKeyDown={(e) => handleMotifKeyDown(e, motifs, item.valeur, (v) => { const next = [...interrogatoire]; next[idx] = { ...item, valeur: v }; setInterrogatoire(next); })}
                  rows={2} placeholder={`${label}...`}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
              </div>
            );
          })}
          {rubriquesLibres.map((item, idx) => (
            <div key={idx} className="flex gap-2 items-start">
              <input type="text" value={item.cle} onChange={(e) => { const next = [...rubriquesLibres]; next[idx] = { ...item, cle: e.target.value }; setRubriquesLibres(next); }}
                placeholder="Rubrique..." className="w-32 px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 shrink-0" />
              <textarea value={item.valeur}
                onChange={(e) => { const next = [...rubriquesLibres]; next[idx] = { ...item, valeur: e.target.value }; setRubriquesLibres(next); }}
                onKeyDown={(e) => handleMotifKeyDown(e, motifs, item.valeur, (v) => { const next = [...rubriquesLibres]; next[idx] = { ...item, valeur: v }; setRubriquesLibres(next); })}
                rows={2} placeholder="Contenu..."
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
              <button type="button" onClick={() => setRubriquesLibres(rubriquesLibres.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-red-500 p-1.5 mt-1">
                <X size={14} />
              </button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => setRubriquesLibres([...rubriquesLibres, { cle: '', valeur: '' }])}>
            <Plus size={12} /> Ajouter une rubrique
          </Button>
        </Section>

        {/* Observation */}
        <Section title="Observation" optional>
          <textarea value={observation} onChange={(e) => setObservation(e.target.value)} rows={3}
            placeholder="Aspect général, teint, morphologie, attitude..."
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
        </Section>

        {/* Palpation */}
        <Section title="Palpation" optional>
          <textarea value={palpation} onChange={(e) => setPalpation(e.target.value)} rows={3}
            placeholder="Points douloureux, ganglions, température locale..."
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
        </Section>

        {/* Pouls */}
        <Section title="Pouls (4 Principes IEATC)">
          <div className="space-y-3">
            <PrincipeSection title="PRINCIPE I — Yin/Yang Gauche/Droite" defaultOpen>
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-2">Comparaison quantitative gauche / droite</p>
                <div className="flex flex-wrap gap-2">
                  {['G=D', 'G>D', 'G>>D', 'G<D', 'G<<D'].map((opt) => (
                    <button key={opt} type="button" onClick={() => setP1Comparaison(p1Comparaison === opt ? '' : opt)}
                      className={cn('text-sm font-mono px-3 py-1.5 rounded-lg border-2 transition-colors',
                        p1Comparaison === opt ? 'bg-teal-600 text-white border-teal-600' : 'border-slate-200 text-slate-600 hover:border-slate-300')}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <QualitesSelector label="Qualité gauche" data={p1Gauche} onChange={setP1Gauche} />
                <QualitesSelector label="Qualité droite" data={p1Droit} onChange={setP1Droit} />
              </div>
            </PrincipeSection>
            <PrincipeSection title="PRINCIPE II — Superficie/Profondeur">
              <QualitesSelector label="Superficie gauche" data={p2SuperficieGauche} onChange={setP2SuperficieGauche} />
              <QualitesSelector label="Profondeur gauche" data={p2ProfondeurGauche} onChange={setP2ProfondeurGauche} />
              <QualitesSelector label="Superficie droite" data={p2SuperficieDroite} onChange={setP2SuperficieDroite} />
              <QualitesSelector label="Profondeur droite" data={p2ProfondeurDroite} onChange={setP2ProfondeurDroite} />
            </PrincipeSection>
            <PrincipeSection title="PRINCIPE III — Les 3 Foyers">
              <QualitesSelector label="Foyer Supérieur" data={p3FoyerSup} onChange={setP3FoyerSup} />
              <QualitesSelector label="Foyer Moyen" data={p3FoyerMoy} onChange={setP3FoyerMoy} />
              <QualitesSelector label="Foyer Inférieur" data={p3FoyerInf} onChange={setP3FoyerInf} />
            </PrincipeSection>
            <PrincipeSection title="PRINCIPE IV — Organes (Zang/Fu)">
              {p4Organes.map((organe) => (
                <div key={organe.id} className="border border-slate-100 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <input type="text" value={organe.nom}
                      onChange={(e) => setP4Organes((prev) => prev.map((o) => o.id === organe.id ? { ...o, nom: e.target.value } : o))}
                      placeholder="Nom de l'organe..." className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    <button type="button" onClick={() => setP4Organes((prev) => prev.filter((o) => o.id !== organe.id))} className="text-slate-400 hover:text-red-500 p-1">
                      <X size={14} />
                    </button>
                  </div>
                  <QualitesSelector label={organe.nom || 'Qualité'} data={organe.data}
                    onChange={(d) => setP4Organes((prev) => prev.map((o) => o.id === organe.id ? { ...o, data: d } : o))} />
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => setP4Organes((prev) => [...prev, { id: `org-${Date.now()}`, nom: '', data: emptyPosition() }])}>
                <Plus size={12} /> Ajouter un organe
              </Button>
            </PrincipeSection>
          </div>
          <div className="mt-3 space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">Commentaire sur les pouls <span className="text-slate-400 font-normal">(optionnel)</span></label>
            <textarea value={poulsSynthese} onChange={(e) => setPoulsSynthese(e.target.value)} rows={2}
              placeholder="Notes complémentaires sur la prise de pouls..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
          </div>
        </Section>

        {/* Langue */}
        <Section title="Langue" optional>
          <textarea value={langue} onChange={(e) => setLangue(e.target.value)} rows={3}
            placeholder="Description de la langue : couleur, forme, enduit, humidité..."
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
        </Section>

        {/* Examens + palpation abdominale */}
        <Section title="Examens complémentaires" optional>
          <textarea value={examens} onChange={(e) => setExamens(e.target.value)} rows={3}
            placeholder="Résultats d'examens complémentaires, bilans biologiques..."
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
          <div className="pt-2">
            <label className="inline-flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input type="checkbox" checked={showPalpAbdo} onChange={(e) => setShowPalpAbdo(e.target.checked)} className="accent-teal-600" />
              Inclure une palpation abdominale (5 éléments)
            </label>
          </div>
          {showPalpAbdo && (
            <div className="space-y-2 pt-2">
              {ELEMENTS_WUXING.map((el) => {
                const entry = palpAbdo.find((e) => e.element === el.id);
                return (
                  <div key={el.id} className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-600 w-16">{el.label}</span>
                    <div className="flex gap-1.5 flex-wrap">
                      {ETATS_PALPATION.map((etat) => (
                        <button key={etat.id} type="button" onClick={() => togglePalpAbdoElement(el.id, etat.id)}
                          className={cn('text-xs px-2 py-1 rounded-full border transition-colors',
                            entry?.etats.includes(etat.id) ? 'bg-teal-600 text-white border-teal-600' : 'border-slate-200 text-slate-600 hover:border-slate-300')}>
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
          <Button onClick={handleSave} variant="primary" disabled={submitting || saved}
            className={cn('flex-1 gap-2', saved && 'bg-emerald-600')}>
            {saved ? <><CheckCircle2 size={16} /> Mis à jour !</> : submitting ? 'Enregistrement...' : 'Mettre à jour'}
          </Button>
          <Link href={`/mes-cas/${caseId}`}>
            <Button variant="ghost" disabled={submitting}>Annuler</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

'use client';

// ─── ParticipationForm — refonte Phase 2 (modèle unifié) ─────────────────────
// Ce formulaire est utilisé pour DEUX usages :
//   - mode='participation' : un utilisateur participe à un cas existant
//   - mode='cas'           : un utilisateur soumet son propre cas + analyse
// La section "thérapie" (stratégie + points) est optionnelle en mode 'cas'.

import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { GRILLES } from '@/data/grilles';
import { Button } from '@/components/ui/button';
import type {
  ReadingGridId,
  UserParticipation,
  Annotation,
  LecturePouls,
  PublicationMode,
  DifficulteEstimee,
  DeuxiemeSeance,
} from '@/types';
import { DIFFICULTE_LABELS } from '@/types';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  Plus,
  X,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Pencil,
} from 'lucide-react';
import {
  normalizePoint,
  type PointAction,
  type NormalizedPoint,
} from '@/lib/point-normalize';
import { useAuth } from '@/lib/auth-context';
import { upsertParticipation } from '@/lib/participation-store';

// ─── Types internes ───────────────────────────────────────────────────────────

type FormMode = 'participation' | 'cas';

interface ExamSupplementaire {
  id: string;
  titre: string;
  texte: string;
  annotations: Annotation[];
}

type ElementWuxing = 'bois' | 'feu' | 'terre' | 'metal' | 'eau';
type EtatPalpation = 'bloque' | 'douloureux' | 'vide' | 'plein' | 'chaud' | 'froid';

interface PalpationEntry {
  element: ElementWuxing;
  etats: EtatPalpation[];
}

interface BilanPoint {
  id: string;
  texte: string;
}

interface PointRow {
  id: string;
  pointBrut: string;
  normalized: NormalizedPoint;
  pointNormalise: string; // ce qu'on stocke (ex: "11V")
  action: PointAction | '';
  justification: string;
  showJustification: boolean;
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ParticipationFormProps {
  /** Mode d'utilisation : participation à un cas, ou soumission d'un nouveau cas. */
  mode?: FormMode;
  /** Identifiant du cas (optionnel en mode 'cas' : sera créé). */
  caseId: string;
  /** Texte de l'interrogatoire à afficher / annoter (déjà aplati). */
  interrogatoireText: string;
  /** Lectures de pouls à afficher / annoter. */
  pulses?: LecturePouls[];
  /** Conditions de la prise de pouls (texte bref). */
  pulsesCondition?: string;
  /**
   * Texte de langue du cas (mode 'participation' uniquement).
   * En mode participation, la langue est affichée en lecture seule avec annotations.
   * En mode 'cas', l'utilisateur saisit lui-même la langue.
   */
  langueTexteCas?: string;
  /** Données existantes pour reprise. */
  existingParticipation?: Partial<UserParticipation>;
  /** Callback de fermeture (annulation). */
  onCancel?: () => void;
  /** Callback après soumission réussie (reçoit la participation enregistrée). */
  onSave?: (data: Partial<UserParticipation>) => void;
  /**
   * Si true, ne persiste pas dans le store de participation et n'ajoute pas de points de vote.
   * Utilise pour le mode apprentissage (exercice prive).
   */
  skipPersist?: boolean;
  /**
   * Texte personnalise pour le bouton de soumission unique.
   * Utilise quand hidePublicationChoice=true (mode apprentissage).
   */
  submitLabel?: string;
  /**
   * Si true, masque le choix publier/publier anonyme et affiche un seul bouton
   * avec le texte de submitLabel.
   */
  hidePublicationChoice?: boolean;
}

// ─── Helpers d'annotation (range de caractères) ───────────────────────────────

function uid(prefix = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// Trouve l'offset texte d'un nœud DOM dans un conteneur (text only)
function getTextOffset(root: HTMLElement, node: Node, offset: number): number {
  let total = 0;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let cur: Node | null = walker.nextNode();
  while (cur) {
    if (cur === node) return total + offset;
    total += (cur.textContent ?? '').length;
    cur = walker.nextNode();
  }
  return total;
}

// ─── Sous-composant : <AnnotatableText> ───────────────────────────────────────

interface AnnotatableTextProps {
  texte: string;
  annotations: Annotation[];
  onAdd: (a: Annotation) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, comment: string) => void;
  activeId: string | null;
  onHover: (id: string | null) => void;
}

// Position du popover d'annotation (coordonnées fixes en viewport)
interface PopoverPos {
  top: number;
  left: number;
  above: boolean; // true = popover au-dessus de la sélection
}

function AnnotatableText({
  texte,
  annotations,
  onAdd,
  onRemove,
  onUpdate,
  activeId,
  onHover,
}: AnnotatableTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [pendingRange, setPendingRange] = useState<{ start: number; length: number } | null>(null);
  const [pendingComment, setPendingComment] = useState('');
  // Position fixe du popover de commentaire — ancrée à la sélection
  const [popoverPos, setPopoverPos] = useState<PopoverPos | null>(null);
  // Édition en ligne d'un commentaire existant
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');

  // Calcule la position du popover à partir du bounding rect de la sélection active.
  const computePopoverPos = useCallback((): PopoverPos | null => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    const rect = sel.getRangeAt(0).getBoundingClientRect();
    if (!rect || rect.width === 0) return null;

    const POPOVER_HEIGHT = 160; // hauteur estimée du popover (px)
    const POPOVER_WIDTH = 300;
    const MARGIN = 8;           // marge par rapport à la sélection

    const above = rect.top > POPOVER_HEIGHT + MARGIN;
    const top = above
      ? rect.top - POPOVER_HEIGHT - MARGIN
      : rect.bottom + MARGIN;

    // Centré horizontalement sur la sélection, contraint dans le viewport
    const centerX = rect.left + rect.width / 2;
    const left = Math.max(
      MARGIN,
      Math.min(window.innerWidth - POPOVER_WIDTH - MARGIN, centerX - POPOVER_WIDTH / 2),
    );

    return { top, left, above };
  }, []);

  const handleMouseUp = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !containerRef.current) return;
    const range = sel.getRangeAt(0);
    if (!containerRef.current.contains(range.startContainer)) return;
    const start = getTextOffset(containerRef.current, range.startContainer, range.startOffset);
    const end = getTextOffset(containerRef.current, range.endContainer, range.endOffset);
    const a = Math.min(start, end);
    const b = Math.max(start, end);
    if (b - a < 1) return;

    // Calcul de la position AVANT de retirer la sélection
    const pos = computePopoverPos();
    setPendingRange({ start: a, length: b - a });
    setPendingComment('');
    setPopoverPos(pos);
    sel.removeAllRanges();
  }, [computePopoverPos]);

  // Fermer le popover au clic extérieur
  useEffect(() => {
    if (!pendingRange) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPendingRange(null);
        setPopoverPos(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [pendingRange]);

  const validate = () => {
    if (!pendingRange) return;
    onAdd({
      id: uid('ann'),
      start: pendingRange.start,
      length: pendingRange.length,
      comment: pendingComment.trim(),
      createdAt: new Date().toISOString(),
    });
    setPendingRange(null);
    setPendingComment('');
    setPopoverPos(null);
  };

  const cancelPending = () => {
    setPendingRange(null);
    setPopoverPos(null);
  };

  // Construit les segments à afficher avec gestion du chevauchement.
  const segments = useMemo(() => buildSegments(texte, annotations), [texte, annotations]);

  return (
    <>
      {/* Popover de saisie — position: fixed, ancré à la sélection */}
      {pendingRange && popoverPos && (
        <div
          ref={popoverRef}
          style={{
            position: 'fixed',
            top: popoverPos.top,
            left: popoverPos.left,
            width: 300,
            zIndex: 9999,
          }}
          className="bg-white border border-teal-200 rounded-xl shadow-xl p-3"
        >
          {/* Petite flèche indicative */}
          <p className="text-xs text-slate-500 mb-2 leading-snug">
            <span className="font-medium text-slate-800">
              « {texte.slice(pendingRange.start, pendingRange.start + pendingRange.length).slice(0, 60)}
              {pendingRange.length > 60 ? '…' : ''} »
            </span>
          </p>
          <textarea
            autoFocus
            value={pendingComment}
            onChange={(e) => setPendingComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') cancelPending();
            }}
            placeholder="Votre remarque clinique…"
            rows={3}
            className="w-full text-sm px-2 py-1.5 rounded border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={validate}
              className="text-xs px-3 py-1 rounded bg-teal-600 text-white hover:bg-teal-500 font-medium"
            >
              Ajouter
            </button>
            <button
              onClick={cancelPending}
              className="text-xs px-3 py-1 rounded border border-slate-200 text-slate-500 hover:bg-slate-50"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <div
            ref={containerRef}
            onMouseUp={handleMouseUp}
            onTouchEnd={handleMouseUp}
            className="text-sm text-slate-700 leading-relaxed select-text cursor-text p-3 rounded-lg border border-slate-200 bg-slate-50 whitespace-pre-wrap"
            style={{ userSelect: 'text' }}
          >
            {segments.map((seg, i) => {
              if (seg.ids.length === 0) {
                return <span key={i}>{seg.text}</span>;
              }
              const isActive = activeId !== null && seg.ids.includes(activeId);
              // Empilement visuel : plus il y a d'annotations, plus le fond est sombre
              const depth = Math.min(seg.ids.length, 3);
              const bg =
                isActive
                  ? 'bg-amber-200 text-amber-900'
                  : depth === 1
                    ? 'bg-teal-100 text-teal-900'
                    : depth === 2
                      ? 'bg-teal-200 text-teal-900'
                      : 'bg-teal-300 text-teal-950';
              return (
                <mark
                  key={i}
                  className={cn('rounded-sm px-0.5 cursor-pointer transition-colors', bg)}
                  onMouseEnter={() => onHover(seg.ids[0]!)}
                  onMouseLeave={() => onHover(null)}
                >
                  {seg.text}
                </mark>
              );
            })}
          </div>
        </div>

        {/* Panneau latéral des annotations */}
        <div className="md:col-span-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
            Remarques ({annotations.length})
          </p>
          {annotations.length === 0 && (
            <p className="text-xs text-slate-400 italic">Sélectionnez du texte pour annoter.</p>
          )}
          <div className="space-y-1.5">
            {annotations.map((a) => {
              const extrait = texte.slice(a.start, a.start + a.length);
              const isActive = activeId === a.id;
              const isEditing = editingId === a.id;
              return (
                <div
                  key={a.id}
                  onMouseEnter={() => !isEditing && onHover(a.id)}
                  onMouseLeave={() => !isEditing && onHover(null)}
                  className={cn(
                    'rounded-lg p-2 border text-xs transition-colors cursor-default',
                    isActive ? 'bg-amber-50 border-amber-300' : 'bg-white border-slate-200',
                  )}
                >
                  <div className="flex items-start gap-1">
                    <MessageSquare size={11} className="text-teal-500 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="italic text-slate-500 line-clamp-1">« {extrait} »</p>
                      {isEditing ? (
                        <div className="mt-1 space-y-1">
                          <textarea
                            autoFocus
                            value={editDraft}
                            onChange={(e) => setEditDraft(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                            rows={2}
                            className="w-full text-xs px-2 py-1 rounded border border-teal-300 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none"
                          />
                          <div className="flex gap-1">
                            <button
                              onClick={() => { onUpdate(a.id, editDraft); setEditingId(null); }}
                              className="text-[11px] px-2 py-0.5 rounded bg-teal-600 text-white hover:bg-teal-500"
                            >
                              OK
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-[11px] px-2 py-0.5 rounded border border-slate-200 text-slate-500 hover:bg-slate-50"
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-slate-700 mt-0.5">
                          {a.comment
                            ? a.comment.split('\n').map(l => l.trim()).filter(Boolean).join(' — ')
                            : <span className="italic text-slate-400">sans commentaire</span>}
                        </p>
                      )}
                    </div>
                    {!isEditing && (
                      <div className="flex gap-0.5 shrink-0">
                        <button
                          onClick={() => { setEditDraft(a.comment); setEditingId(a.id); }}
                          className="text-slate-300 hover:text-teal-500"
                          title="Modifier"
                        >
                          <Pencil size={11} />
                        </button>
                        <button
                          onClick={() => onRemove(a.id)}
                          className="text-slate-300 hover:text-red-400"
                          title="Supprimer"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

// Construit des segments [start, end) avec la liste des annotations qui les couvrent.
function buildSegments(
  texte: string,
  annotations: Annotation[],
): { text: string; ids: string[] }[] {
  if (annotations.length === 0) return [{ text: texte, ids: [] }];
  const breakpoints = new Set<number>([0, texte.length]);
  for (const a of annotations) {
    breakpoints.add(Math.max(0, a.start));
    breakpoints.add(Math.min(texte.length, a.start + a.length));
  }
  const sorted = Array.from(breakpoints).sort((a, b) => a - b);
  const segs: { text: string; ids: string[] }[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const s = sorted[i]!;
    const e = sorted[i + 1]!;
    if (e <= s) continue;
    const ids = annotations
      .filter((a) => a.start < e && a.start + a.length > s)
      .map((a) => a.id);
    segs.push({ text: texte.slice(s, e), ids });
  }
  return segs;
}

// ─── Sous-composant : <PalpationAbdoSchema> ───────────────────────────────────

const ELEMENTS: { id: ElementWuxing; nom: string; color: string }[] = [
  { id: 'bois', nom: 'Bois', color: 'bg-emerald-100 border-emerald-400 text-emerald-900' },
  { id: 'feu', nom: 'Feu', color: 'bg-red-100 border-red-400 text-red-900' },
  { id: 'terre', nom: 'Terre', color: 'bg-amber-100 border-amber-500 text-amber-900' },
  { id: 'metal', nom: 'Métal', color: 'bg-slate-100 border-slate-400 text-slate-800' },
  { id: 'eau', nom: 'Eau', color: 'bg-blue-100 border-blue-400 text-blue-900' },
];

const ETATS: { id: EtatPalpation; label: string }[] = [
  { id: 'bloque', label: 'bloqué' },
  { id: 'douloureux', label: 'douloureux' },
  { id: 'vide', label: 'vide' },
  { id: 'plein', label: 'plein' },
  { id: 'chaud', label: 'chaud' },
  { id: 'froid', label: 'froid' },
];

function PalpationAbdoSchema({
  value,
  onChange,
  onClose,
}: {
  value: PalpationEntry[];
  onChange: (v: PalpationEntry[]) => void;
  onClose: () => void;
}) {
  const toggle = (el: ElementWuxing, etat: EtatPalpation) => {
    const idx = value.findIndex((v) => v.element === el);
    if (idx === -1) {
      onChange([...value, { element: el, etats: [etat] }]);
      return;
    }
    const cur = value[idx]!;
    const has = cur.etats.includes(etat);
    const next: PalpationEntry = {
      element: el,
      etats: has ? cur.etats.filter((e) => e !== etat) : [...cur.etats, etat],
    };
    const arr = [...value];
    if (next.etats.length === 0) arr.splice(idx, 1);
    else arr[idx] = next;
    onChange(arr);
  };

  const getEtats = (el: ElementWuxing): EtatPalpation[] =>
    value.find((v) => v.element === el)?.etats ?? [];

  return (
    <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-700">Palpation abdominale (5 éléments)</h4>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X size={14} />
        </button>
      </div>
      <p className="text-xs text-slate-500">
        Cliquez sur un état pour chaque élément. Les états sont combinables (ex : « plein et bloqué »).
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
        {ELEMENTS.map((el) => {
          const etats = getEtats(el.id);
          return (
            <div
              key={el.id}
              className={cn('rounded-lg border-2 p-2 flex flex-col gap-1.5', el.color)}
            >
              <div className="font-semibold text-center text-sm">{el.nom}</div>
              <div className="flex flex-col gap-1">
                {ETATS.map((e) => {
                  const active = etats.includes(e.id);
                  return (
                    <button
                      key={e.id}
                      onClick={() => toggle(el.id, e.id)}
                      className={cn(
                        'text-[11px] rounded px-1.5 py-0.5 border transition-colors',
                        active
                          ? 'bg-slate-800 text-white border-slate-800'
                          : 'bg-white/70 text-slate-700 border-slate-300 hover:bg-white',
                      )}
                    >
                      {e.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Sous-composant : <NumberedPoints> ────────────────────────────────────────

function NumberedPoints({
  points,
  onChange,
  maxPoints = 7,
  maxTotalChars,
  placeholder,
}: {
  points: BilanPoint[];
  onChange: (v: BilanPoint[]) => void;
  maxPoints?: number;
  maxTotalChars?: number;
  placeholder?: string;
}) {
  const totalChars = points.reduce((acc, p) => acc + p.texte.length, 0);
  const canAdd = points.length < maxPoints && (!maxTotalChars || totalChars < maxTotalChars);

  const update = (id: string, texte: string) => {
    if (maxTotalChars) {
      const others = points.filter((p) => p.id !== id).reduce((a, p) => a + p.texte.length, 0);
      if (others + texte.length > maxTotalChars) return;
    }
    onChange(points.map((p) => (p.id === id ? { ...p, texte } : p)));
  };

  const add = () => {
    if (!canAdd) return;
    onChange([...points, { id: uid('bp'), texte: '' }]);
  };

  const remove = (id: string) => {
    onChange(points.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-2">
      {points.length === 0 && (
        <p className="text-xs text-slate-400 italic">Aucun point — cliquez sur « Ajouter ».</p>
      )}
      {points.map((p, i) => (
        <div key={p.id} className="flex items-start gap-2">
          <span className="text-sm font-semibold text-slate-400 w-5 text-right pt-1.5">{i + 1}.</span>
          <input
            type="text"
            value={p.texte}
            onChange={(e) => update(p.id, e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-2 py-1.5 text-sm rounded border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            onClick={() => remove(p.id)}
            className="text-slate-300 hover:text-red-400 mt-1.5"
          >
            <X size={13} />
          </button>
        </div>
      ))}
      <div className="flex items-center justify-between pt-1">
        <Button variant="outline" size="sm" onClick={add} disabled={!canAdd}>
          <Plus size={12} /> Ajouter un point
        </Button>
        {maxTotalChars && (
          <span
            className={cn(
              'text-xs',
              totalChars > maxTotalChars * 0.95 ? 'text-red-500' : 'text-slate-400',
            )}
          >
            {totalChars}/{maxTotalChars} car.
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Sous-composant : <PointRowEditor> ────────────────────────────────────────

const ACTION_OPTIONS: { value: PointAction; label: string; color: string; onlyFor?: string }[] = [
  { value: 'tonification', label: 'Tonification', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { value: 'dispersion', label: 'Dispersion', color: 'bg-red-100 text-red-800 border-red-300' },
  { value: 'harmonisation', label: 'Harmonisation', color: 'bg-slate-100 text-slate-700 border-slate-300' },
  { value: 'tonification_chauffee', label: 'Tonifié chauffé', color: 'bg-orange-200 text-orange-900 border-orange-300' },
  {
    value: 'dispersion_puis_tonification',
    label: 'Dispersion puis tonification',
    color: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  {
    value: 'gros_sel',
    label: 'Gros sel',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    onlyFor: '8JM',  // visible uniquement pour le point 8JM
  },
];

// Labels d'action pour l'affichage normalisé (doit rester synchronisé avec point-normalize)
const POINT_ACTION_LABELS: Record<PointAction, string> = {
  tonification: 'tonifié',
  dispersion: 'dispersé',
  harmonisation: 'harmonisé',
  tonification_chauffee: 'tonifié chauffé',
  dispersion_puis_tonification: 'dispersé puis tonifié',
  gros_sel: 'gros sel',
};

function PointRowEditor({
  row,
  onChange,
  onRemove,
}: {
  row: PointRow;
  onChange: (r: PointRow) => void;
  onRemove: () => void;
}) {
  const handleBrutChange = (v: string) => {
    const norm = normalizePoint(v);
    onChange({
      ...row,
      pointBrut: v,
      normalized: norm,
      pointNormalise: norm.code,
      action: row.action || norm.action || '',
    });
  };

  // Le texte normalisé affiché reflète l'action du select, pas celle détectée dans le texte brut
  const displayText = row.normalized.code
    ? row.action
      ? `${row.normalized.code} ${POINT_ACTION_LABELS[row.action]}`
      : row.normalized.code
    : '';

  return (
    <div className="bg-slate-50 rounded-lg border border-slate-200 p-3 space-y-2">
      <div className="flex items-end gap-2 flex-wrap">
        <div className="flex-1 min-w-32">
          <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
            Saisie
          </label>
          <input
            type="text"
            value={row.pointBrut}
            onChange={(e) => handleBrutChange(e.target.value)}
            placeholder="Ex : 11Vt, R3, 9C dt…"
            className="w-full h-9 px-2 text-sm rounded border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
          />
          {row.normalized.code && row.normalized.code !== row.pointBrut.trim().toUpperCase() && (
            <p
              className={cn(
                'text-xs mt-1 flex items-center gap-1',
                row.normalized.ambigu ? 'text-amber-600' : 'text-teal-600',
              )}
            >
              {row.normalized.ambigu ? <AlertCircle size={10} /> : <CheckCircle2 size={10} />}
              {row.normalized.ambigu ? 'Ambigu : ' : 'Normalisé : '}
              <span className="font-mono font-bold">{displayText}</span>
            </p>
          )}
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
            Action <span className="text-red-400">*</span>
          </label>
          <select
            value={row.action}
            onChange={(e) => onChange({ ...row, action: e.target.value as PointAction })}
            className={cn(
              'h-9 px-2 text-sm rounded border font-medium',
              row.action
                ? ACTION_OPTIONS.find((o) => o.value === row.action)?.color
                : 'bg-white text-slate-500 border-slate-200',
            )}
          >
            <option value="">— Choisir —</option>
            {ACTION_OPTIONS.filter(
              (o) => !o.onlyFor || o.onlyFor === row.normalized.code,
            ).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() =>
            onChange({ ...row, showJustification: !row.showJustification })
          }
          className="text-xs text-slate-500 hover:text-teal-600 flex items-center gap-1 h-9 px-2"
        >
          <MessageSquare size={11} />
          {row.showJustification ? 'Masquer' : 'Justifier'}
        </button>
        <button onClick={onRemove} className="text-slate-300 hover:text-red-400 h-9 px-1">
          <X size={14} />
        </button>
      </div>
      {row.showJustification && (
        <input
          type="text"
          value={row.justification}
          onChange={(e) => onChange({ ...row, justification: e.target.value })}
          placeholder="Justification du choix de ce point…"
          className="w-full h-8 px-2 text-xs rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
      )}
    </div>
  );
}

// ─── Section accordéon ────────────────────────────────────────────────────────

function Section({
  title,
  children,
  defaultOpen = true,
  badge,
  hasError,
  forceOpen,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: number;
  hasError?: boolean;
  forceOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  // Forcer l'ouverture quand une erreur de validation est détectée
  useEffect(() => {
    if (forceOpen) setOpen(true);
  }, [forceOpen]);

  return (
    <div className={cn('rounded-xl overflow-hidden border-2', hasError ? 'border-red-400' : 'border-slate-200')}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-50 hover:bg-slate-100/70 transition-colors text-left"
      >
        <span className="font-semibold text-slate-800 text-sm flex items-center gap-2">
          {title}
          {badge !== undefined && badge > 0 && (
            <span className="text-xs px-1.5 py-0.5 bg-teal-100 text-teal-700 rounded-full font-medium">
              {badge}
            </span>
          )}
        </span>
        {open ? (
          <ChevronUp size={15} className="text-slate-400" />
        ) : (
          <ChevronDown size={15} className="text-slate-400" />
        )}
      </button>
      {open && <div className="p-5 space-y-4">{children}</div>}
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

export function ParticipationForm({
  mode = 'participation',
  caseId,
  interrogatoireText,
  pulses = [],
  pulsesCondition,
  langueTexteCas,
  existingParticipation,
  onCancel,
  onSave,
  skipPersist = false,
  submitLabel,
  hidePublicationChoice = false,
}: ParticipationFormProps) {
  const { user, addVotePoints } = useAuth();

  // ── 1. Grilles ─────────────────────────────────────────────────────────────
  const [grillePrincipale, setGrillePrincipale] = useState<ReadingGridId | ''>(
    existingParticipation?.grilleChoisie ?? '',
  );
  const [grilleSecondaire, setGrilleSecondaire] = useState<ReadingGridId | ''>(
    existingParticipation?.grilleSecondaire ?? '',
  );
  // Deuxieme grille secondaire (max 2 grilles secondaires)
  const [grilleSecondaire2, setGrilleSecondaire2] = useState<ReadingGridId | ''>('');

  // ── 2. Annotations interrogatoire ──────────────────────────────────────────
  const [annInterrogatoire, setAnnInterrogatoire] = useState<Annotation[]>(
    existingParticipation?.annotationsInterrogatoire ?? [],
  );

  // ── 3. Langue + examens supplémentaires + palpation abdo ───────────────────
  const [langueTexte, setLangueTexte] = useState(existingParticipation?.langueTexte ?? '');
  const [annLangue, setAnnLangue] = useState<Annotation[]>(
    existingParticipation?.annotationsLangue ?? [],
  );
  const [examensSupp, setExamensSupp] = useState<ExamSupplementaire[]>(
    (existingParticipation?.examensSupp ?? []).map((e) => ({
      id: uid('ex'),
      titre: e.titre,
      texte: e.texte,
      annotations: e.annotations,
    })),
  );
  const [palpationAbdo, setPalpationAbdo] = useState<PalpationEntry[] | null>(
    existingParticipation?.palpationAbdo ?? null,
  );

  // ── 4. Pouls ───────────────────────────────────────────────────────────────
  const poulsTexte = useMemo(
    () =>
      pulses
        .map((l) => `${l.positionLabel ?? l.position} — ${l.qualites.join(', ')}`)
        .join('\n'),
    [pulses],
  );
  const [annPouls, setAnnPouls] = useState<Annotation[]>(
    existingParticipation?.annotationsPouls ?? [],
  );

  // ── 5. Bilan énergétique (≤7 points, ≤600 chars total) ────────────────────
  const [bilan, setBilan] = useState<BilanPoint[]>(() => {
    const ex = existingParticipation?.bilanEnergetique;
    if (!ex) return [];
    return ex
      .split('\n')
      .map((l) => l.replace(/^\d+\.\s*/, '').trim())
      .filter(Boolean)
      .map((t) => ({ id: uid('bp'), texte: t }));
  });

  // ── 6. Stratégie thérapeutique ─────────────────────────────────────────────
  const [strategie, setStrategie] = useState<BilanPoint[]>(() => {
    const ex = existingParticipation?.strategie;
    if (!ex) return [];
    return ex
      .split('\n')
      .map((l) => l.replace(/^\d+\.\s*/, '').trim())
      .filter(Boolean)
      .map((t) => ({ id: uid('sp'), texte: t }));
  });

  // ── 7. Points proposés ─────────────────────────────────────────────────────
  const [pointRows, setPointRows] = useState<PointRow[]>(() => {
    const existing = existingParticipation?.pointsProposer ?? [];
    return existing.map((p) => {
      const code = p.code ?? '';
      const norm = normalizePoint(code);
      // action peut être sur p.action (nouveau) ou inférée depuis p.technique
      const action: PointAction | '' =
        (p as { action?: PointAction }).action ??
        (p.technique === 'tonification'
          ? 'tonification'
          : p.technique === 'dispersion'
            ? 'dispersion'
            : p.technique === 'harmonisation'
              ? 'harmonisation'
              : p.technique === 'tonification_chauffee'
                ? 'tonification_chauffee'
                : p.technique === 'dispersion_puis_tonification'
                  ? 'dispersion_puis_tonification'
                  : '');
      return {
        id: uid('pt'),
        pointBrut: code,
        normalized: norm,
        pointNormalise: code,
        action,
        justification: p.justification ?? '',
        showJustification: !!p.justification,
      } as PointRow;
    });
  });

  // ── 8. Difficulté estimée ──────────────────────────────────────────────────
  const [difficultéEstimee, setDifficultéEstimee] = useState<DifficulteEstimee | ''>(
    existingParticipation?.difficultéEstimee ?? '',
  );

  // ── 8bis. Deuxième séance (optionnelle) ─────────────────────────────────────
  const [showDeuxiemeSeance, setShowDeuxiemeSeance] = useState(
    !!existingParticipation?.deuxiemeSeance,
  );
  const [deuxiemeCommentaire, setDeuxiemeCommentaire] = useState(
    existingParticipation?.deuxiemeSeance?.commentaire ?? '',
  );
  const [deuxiemeStrategie, setDeuxiemeStrategie] = useState<BilanPoint[]>(() => {
    const ex = existingParticipation?.deuxiemeSeance?.strategie;
    if (!ex) return [];
    return ex
      .split('\n')
      .map((l) => l.replace(/^\d+\.\s*/, '').trim())
      .filter(Boolean)
      .map((t) => ({ id: uid('ds'), texte: t }));
  });
  const [deuxiemePoints, setDeuxiemePoints] = useState<PointRow[]>(() => {
    const existing = existingParticipation?.deuxiemeSeance?.pointsProposer ?? [];
    return existing.map((p) => {
      const code = p.code ?? '';
      const norm = normalizePoint(code);
      const action: PointAction | '' =
        (p as { action?: PointAction }).action ??
        (p.technique === 'tonification'
          ? 'tonification'
          : p.technique === 'dispersion'
            ? 'dispersion'
            : p.technique === 'harmonisation'
              ? 'harmonisation'
              : p.technique === 'tonification_chauffee'
                ? 'tonification_chauffee'
                : p.technique === 'dispersion_puis_tonification'
                  ? 'dispersion_puis_tonification'
                  : '');
      return {
        id: uid('d2'),
        pointBrut: code,
        normalized: norm,
        pointNormalise: code,
        action,
        justification: p.justification ?? '',
        showJustification: !!p.justification,
      } as PointRow;
    });
  });

  const addDeuxiemePointRow = () => {
    setDeuxiemePoints([
      ...deuxiemePoints,
      {
        id: uid('d2'),
        pointBrut: '',
        normalized: { code: '', display: '', ambigu: false, raw: '' },
        pointNormalise: '',
        action: '',
        justification: '',
        showJustification: false,
      },
    ]);
  };

  const updateDeuxiemePointRow = (id: string, next: PointRow) => {
    setDeuxiemePoints(deuxiemePoints.map((r) => (r.id === id ? next : r)));
  };

  const removeDeuxiemePointRow = (id: string) => {
    setDeuxiemePoints(deuxiemePoints.filter((r) => r.id !== id));
  };

  const handleRemoveDeuxiemeSeance = () => {
    setShowDeuxiemeSeance(false);
    setDeuxiemeCommentaire('');
    setDeuxiemeStrategie([]);
    setDeuxiemePoints([]);
  };

  // ── 9. Commentaire libre ───────────────────────────────────────────────────
  const [commentaire, setCommentaire] = useState(existingParticipation?.commentaireLibre ?? '');

  // ── 10. Titre du cas (mode 'cas' uniquement) ───────────────────────────────
  const [titreCas, setTitreCas] = useState('');

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Liste d'erreurs de validation affichées en banner (multi-lignes)
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  // Sections en erreur (pour la bordure rouge)
  const [errorSections, setErrorSections] = useState<Set<string>>(new Set());
  // Refs pour le scroll automatique vers les sections manquantes
  const errorBannerRef = useRef<HTMLDivElement>(null);
  const sectionInterrogatoireRef = useRef<HTMLDivElement>(null);
  const sectionPoulsRef = useRef<HTMLDivElement>(null);
  const sectionBilanRef = useRef<HTMLDivElement>(null);
  const sectionStrategieRef = useRef<HTMLDivElement>(null);
  const sectionGrilleRef = useRef<HTMLDivElement>(null);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const addPointRow = () => {
    setPointRows([
      ...pointRows,
      {
        id: uid('pt'),
        pointBrut: '',
        normalized: { code: '', display: '', ambigu: false, raw: '' },
        pointNormalise: '',
        action: '',
        justification: '',
        showJustification: false,
      },
    ]);
  };

  const updatePointRow = (id: string, next: PointRow) => {
    setPointRows(pointRows.map((r) => (r.id === id ? next : r)));
  };

  const removePointRow = (id: string) => {
    setPointRows(pointRows.filter((r) => r.id !== id));
  };

  const addExamen = () => {
    if (examensSupp.length >= 3) return;
    setExamensSupp([
      ...examensSupp,
      { id: uid('ex'), titre: '', texte: '', annotations: [] },
    ]);
  };

  const updateExamen = (id: string, patch: Partial<ExamSupplementaire>) => {
    setExamensSupp(examensSupp.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  };

  const removeExamen = (id: string) => {
    setExamensSupp(examensSupp.filter((e) => e.id !== id));
  };

  // ── Soumission ─────────────────────────────────────────────────────────────

  const submit = useCallback(
    async (publication: PublicationMode) => {
      setError(null);
      setValidationErrors([]);
      setErrorSections(new Set());

      if (!user) {
        setError('Vous devez être connecté pour publier.');
        return;
      }

      // ── Validation complète avant soumission ──────────────────────────────
      const errors: string[] = [];
      const errSections = new Set<string>();
      let firstErrorRef: React.RefObject<HTMLDivElement | null> | null = null;

      // 1. Grille principale obligatoire
      if (!grillePrincipale) {
        errors.push('Veuillez choisir une grille de lecture principale.');
        errSections.add('grille');
        if (!firstErrorRef) firstErrorRef = sectionGrilleRef;
      }

      // 2. Minimum 3 annotations dans l'interrogatoire
      if (annInterrogatoire.length < 3) {
        errors.push(
          `Ajoutez au moins 3 commentaires dans l'interrogatoire (${annInterrogatoire.length}/3 actuellement).`,
        );
        errSections.add('interrogatoire');
        if (!firstErrorRef) firstErrorRef = sectionInterrogatoireRef;
      }

      // 3. Minimum 1 annotation dans pouls + langue + examens + palpation
      const examensAnnotations = examensSupp.reduce((acc, e) => acc + e.annotations.length, 0);
      const palpationPresente = palpationAbdo !== null && palpationAbdo.length > 0;
      const totalAnnotationsPoulsExamens =
        annPouls.length + annLangue.length + examensAnnotations + (palpationPresente ? 1 : 0);
      if (totalAnnotationsPoulsExamens < 1) {
        errors.push(
          'Ajoutez au moins 1 commentaire dans la section Pouls, Langue ou Examens (0 actuellement).',
        );
        errSections.add('pouls');
        if (!firstErrorRef) firstErrorRef = sectionPoulsRef;
      }

      // 4. Bilan énergétique obligatoire (au moins un point non vide)
      const bilanNonVide = bilan.some((b) => b.texte.trim().length > 0);
      if (!bilanNonVide) {
        errors.push('Le bilan énergétique est obligatoire (ajoutez au moins un point).');
        errSections.add('bilan');
        if (!firstErrorRef) firstErrorRef = sectionBilanRef;
      }

      // 5. Stratégie thérapeutique obligatoire (au moins un point)
      // En mode 'cas', la stratégie est optionnelle — validation uniquement en mode 'participation'
      if (mode === 'participation') {
        const strategieNonVide = strategie.some((s) => s.texte.trim().length > 0);
        if (!strategieNonVide) {
          errors.push('La stratégie thérapeutique est obligatoire (ajoutez au moins un point).');
          errSections.add('strategie');
          if (!firstErrorRef) firstErrorRef = sectionStrategieRef;
        }
      }

      // Afficher les erreurs, bordures rouges, et scroller vers la première section en erreur
      if (errors.length > 0) {
        setValidationErrors(errors);
        setErrorSections(errSections);
        setTimeout(() => {
          // Scroll vers la première section problématique (pas le banner) pour guider l'utilisateur
          const target = firstErrorRef?.current ?? errorBannerRef.current;
          target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);
        return;
      }

      // ── Validation points (existante) ─────────────────────────────────────
      if (mode === 'participation') {
        const pointsInvalides = pointRows.filter((r) => r.pointBrut && !r.action);
        if (pointsInvalides.length > 0) {
          setError('Chaque point doit avoir une action.');
          return;
        }
      }

      const bilanText = bilan.map((b, i) => `${i + 1}. ${b.texte}`).join('\n');
      const strategieText = strategie.map((b, i) => `${i + 1}. ${b.texte}`).join('\n');

      const data: Partial<UserParticipation> & { caseId: string } = {
        caseId,
        grilleChoisie: grillePrincipale || undefined,
        grilleSecondaire: grilleSecondaire || undefined,
        categoriesRetenues: bilan.map((b) => b.texte).filter(Boolean),
        pointsProposer: pointRows
          .filter((r) => r.pointNormalise)
          .map((r) => ({
            code: r.pointNormalise,
            justification: r.justification || undefined,
            // action pédagogique = vérité source
            action: (r.action || undefined) as PointAction | undefined,
            // technique IEATC : désormais on peut stocker 1:1 les 5 actions
            technique:
              r.action === 'tonification'
                ? 'tonification'
                : r.action === 'dispersion'
                  ? 'dispersion'
                  : r.action === 'harmonisation'
                    ? 'harmonisation'
                    : r.action === 'tonification_chauffee'
                      ? 'tonification_chauffee'
                      : r.action === 'dispersion_puis_tonification'
                        ? 'dispersion_puis_tonification'
                        : 'neutre',
          })),
        commentaireLibre: commentaire || undefined,
        deuxiemeSeance: showDeuxiemeSeance
          ? {
              commentaire: deuxiemeCommentaire,
              strategie: deuxiemeStrategie.map((b, i) => `${i + 1}. ${b.texte}`).join('\n'),
              pointsProposer: deuxiemePoints
                .filter((r) => r.pointNormalise)
                .map((r) => ({
                  code: r.pointNormalise,
                  justification: r.justification || undefined,
                  action: (r.action || undefined) as PointAction | undefined,
                  technique:
                    r.action === 'tonification'
                      ? 'tonification'
                      : r.action === 'dispersion'
                        ? 'dispersion'
                        : r.action === 'harmonisation'
                          ? 'harmonisation'
                          : r.action === 'tonification_chauffee'
                            ? 'tonification_chauffee'
                            : r.action === 'dispersion_puis_tonification'
                              ? 'dispersion_puis_tonification'
                              : 'neutre',
                })),
            }
          : undefined,
        revelationFaite: existingParticipation?.revelationFaite ?? false,
        annotationsInterrogatoire: annInterrogatoire,
        annotationsPouls: annPouls,
        langueTexte: langueTexte || undefined,
        annotationsLangue: annLangue,
        examensSupp: examensSupp.map((e) => ({
          titre: e.titre,
          texte: e.texte,
          annotations: e.annotations,
        })),
        palpationAbdo: palpationAbdo ?? undefined,
        bilanEnergetique: bilanText || undefined,
        strategie: strategieText || undefined,
        publicationMode: publication,
        publiee: true,
        difficultéEstimee: difficultéEstimee || undefined,
      };

      // En mode apprentissage (skipPersist), ne pas sauvegarder dans le store
      // de participation et ne pas ajouter de points de vote.
      try {
        if (!skipPersist) {
          await upsertParticipation(user.id, data);
          addVotePoints(2);
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        onSave?.(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors de la publication. Vérifiez votre connexion et réessayez.');
      }
    },
    [
      user,
      mode,
      grillePrincipale,
      grilleSecondaire,
      pointRows,
      bilan,
      strategie,
      commentaire,
      caseId,
      annInterrogatoire,
      annPouls,
      langueTexte,
      annLangue,
      examensSupp,
      palpationAbdo,
      existingParticipation?.revelationFaite,
      difficultéEstimee,
      showDeuxiemeSeance,
      deuxiemeCommentaire,
      deuxiemeStrategie,
      deuxiemePoints,
      addVotePoints,
      skipPersist,
      onSave,
      // Les refs sont stables (useRef) — pas besoin de les lister, mais ESLint pourrait le demander.
      // On les inclut pour être exhaustif sans impact sur les performances.
      sectionGrilleRef,
      sectionInterrogatoireRef,
      sectionPoulsRef,
      sectionBilanRef,
      sectionStrategieRef,
    ],
  );

  // Hover croisé entre annotation/texte (état partagé par section)
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div className="p-6 space-y-4">
      {/* ── Banner de validation (erreurs multiples) — affiché en haut, scroll auto ── */}
      {validationErrors.length > 0 && (
        <div
          ref={errorBannerRef}
          className="bg-red-50 border border-red-300 rounded-xl px-4 py-3 space-y-1"
          role="alert"
        >
          <p className="text-sm font-semibold text-red-800 flex items-center gap-2">
            <AlertCircle size={15} /> Veuillez corriger les points suivants avant de publier :
          </p>
          <ul className="list-disc list-inside space-y-0.5">
            {validationErrors.map((e, i) => (
              <li key={i} className="text-sm text-red-700">{e}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Erreur technique (Supabase / points sans action) ── */}
      {error && (
        <div className="bg-red-50 border border-red-300 rounded-xl px-4 py-3 flex items-start gap-2" role="alert">
          <AlertCircle size={15} className="text-red-600 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <p className="text-sm text-slate-500 bg-slate-50 rounded-lg p-3">
        {mode === 'participation' ? (
          <>
            Votre participation sera publiée selon le mode choisi (publique ou anonyme) et
            rapportera <span className="font-semibold text-teal-700">+2 points de vote</span>.
          </>
        ) : (
          <>
            Vous soumettez votre cas et votre analyse. La partie thérapie est facultative —
            d'autres praticiens pourront ensuite la proposer.
          </>
        )}
      </p>

      {/* ── 0. Titre du cas (mode 'cas' uniquement) ── */}
      {mode === 'cas' && (
        <Section title="Titre du cas" defaultOpen={true}>
          <div className="space-y-2">
            <input
              type="text"
              value={titreCas}
              onChange={(e) => setTitreCas(e.target.value)}
              placeholder='Ex : "Marie, 52 ans, femme — douleurs lombaires chroniques"'
              className="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <p className="text-xs text-slate-500 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 leading-relaxed">
              <span className="font-semibold text-amber-800">Le titre doit contenir :</span>{' '}
              un <strong>prénom fictif</strong> (ne jamais utiliser le vrai prénom du patient),
              l'âge, le sexe, et le motif principal en quelques mots.
              <br />
              Exemple : <em>"Marie, 52 ans, femme — douleurs lombaires chroniques"</em>
            </p>
          </div>
        </Section>
      )}

      {/* ── 1. Interrogatoire ── */}
      <div ref={sectionInterrogatoireRef}>
        <Section title="Interrogatoire" defaultOpen={true} badge={annInterrogatoire.length} hasError={errorSections.has('interrogatoire')} forceOpen={errorSections.has('interrogatoire')}>
          <p className="text-xs text-slate-500 bg-teal-50 border border-teal-100 rounded-lg px-3 py-2">
            Sélectionnez du texte pour ajouter une remarque clinique. Les annotations peuvent se
            chevaucher.
          </p>
          <AnnotatableText
            texte={interrogatoireText}
            annotations={annInterrogatoire}
            onAdd={(a) => setAnnInterrogatoire([...annInterrogatoire, a])}
            onRemove={(id) => setAnnInterrogatoire(annInterrogatoire.filter((x) => x.id !== id))}
            onUpdate={(id, comment) => setAnnInterrogatoire(annInterrogatoire.map((x) => x.id === id ? { ...x, comment } : x))}
            activeId={activeId}
            onHover={setActiveId}
          />
        </Section>
      </div>

      {/* ── 2. Langue & autres examens ── */}
      <Section
        title="Langue & autres examens"
        defaultOpen={true}
        badge={annLangue.length + examensSupp.reduce((a, e) => a + e.annotations.length, 0)}
      >
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
            Examen de la langue
          </label>
          {/* En mode participation : affichage en lecture seule du texte du cas + annotations */}
          {/* En mode cas : saisie libre par l'utilisateur */}
          {mode === 'participation' ? (
            langueTexteCas ? (
              <>
                <p className="text-xs text-slate-500 bg-teal-50 border border-teal-100 rounded-lg px-3 py-2 mb-2">
                  Sélectionnez du texte pour ajouter une remarque clinique sur la langue.
                </p>
                <AnnotatableText
                  texte={langueTexteCas}
                  annotations={annLangue}
                  onAdd={(a) => setAnnLangue([...annLangue, a])}
                  onRemove={(id) => setAnnLangue(annLangue.filter((x) => x.id !== id))}
                  onUpdate={(id, comment) => setAnnLangue(annLangue.map((x) => x.id === id ? { ...x, comment } : x))}
                  activeId={activeId}
                  onHover={setActiveId}
                />
              </>
            ) : (
              <p className="text-xs text-slate-400 italic p-3 rounded-lg border border-slate-200 bg-slate-50">
                Aucune donnée de langue disponible pour ce cas.
              </p>
            )
          ) : (
            <>
              <textarea
                value={langueTexte}
                onChange={(e) => setLangueTexte(e.target.value.slice(0, 800))}
                rows={3}
                placeholder="Couleur, enduit, forme, humidité…"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />
              {langueTexte && (
                <div className="mt-2">
                  <AnnotatableText
                    texte={langueTexte}
                    annotations={annLangue}
                    onAdd={(a) => setAnnLangue([...annLangue, a])}
                    onRemove={(id) => setAnnLangue(annLangue.filter((x) => x.id !== id))}
                    onUpdate={(id, comment) => setAnnLangue(annLangue.map((x) => x.id === id ? { ...x, comment } : x))}
                    activeId={activeId}
                    onHover={setActiveId}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {examensSupp.map((ex) => (
          <div key={ex.id} className="border border-slate-100 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={ex.titre}
                onChange={(e) => updateExamen(ex.id, { titre: e.target.value })}
                placeholder="Titre de l'examen…"
                className="flex-1 h-8 px-2 text-sm rounded border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
              />
              <button
                onClick={() => removeExamen(ex.id)}
                className="text-slate-300 hover:text-red-400"
              >
                <X size={14} />
              </button>
            </div>
            <textarea
              value={ex.texte}
              onChange={(e) => updateExamen(ex.id, { texte: e.target.value.slice(0, 800) })}
              rows={3}
              maxLength={800}
              placeholder="Description (max 800 caractères)…"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
            {ex.texte && (
              <AnnotatableText
                texte={ex.texte}
                annotations={ex.annotations}
                onAdd={(a) => updateExamen(ex.id, { annotations: [...ex.annotations, a] })}
                onRemove={(id) =>
                  updateExamen(ex.id, {
                    annotations: ex.annotations.filter((x) => x.id !== id),
                  })
                }
                onUpdate={(id, comment) =>
                  updateExamen(ex.id, {
                    annotations: ex.annotations.map((x) => x.id === id ? { ...x, comment } : x),
                  })
                }
                activeId={activeId}
                onHover={setActiveId}
              />
            )}
          </div>
        ))}

        {/* Boutons d'ajout uniquement en mode cas (le praticien participant ne cree pas de donnees cliniques) */}
        {mode === 'cas' && (
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={addExamen}
              disabled={examensSupp.length >= 3}
            >
              <Plus size={12} /> Ajouter un examen clinique
              {examensSupp.length >= 3 && ' (max atteint)'}
            </Button>
            {!palpationAbdo && (
              <Button variant="outline" size="sm" onClick={() => setPalpationAbdo([])}>
                <Plus size={12} /> Ajouter palpation abdominale
              </Button>
            )}
          </div>
        )}

        {palpationAbdo !== null && (
          <PalpationAbdoSchema
            value={palpationAbdo}
            onChange={setPalpationAbdo}
            onClose={() => setPalpationAbdo(null)}
          />
        )}
      </Section>

      {/* ── 3. Pouls ── */}
      <div ref={sectionPoulsRef}>
        <Section title="Pouls" defaultOpen={false} badge={annPouls.length} hasError={errorSections.has('pouls')} forceOpen={errorSections.has('pouls')}>
          {pulsesCondition && (
            <p className="text-xs text-slate-400 italic">{pulsesCondition}</p>
          )}
          {poulsTexte ? (
            <AnnotatableText
              texte={poulsTexte}
              annotations={annPouls}
              onAdd={(a) => setAnnPouls([...annPouls, a])}
              onRemove={(id) => setAnnPouls(annPouls.filter((x) => x.id !== id))}
              onUpdate={(id, comment) => setAnnPouls(annPouls.map((x) => x.id === id ? { ...x, comment } : x))}
              activeId={activeId}
              onHover={setActiveId}
            />
          ) : (
            <p className="text-xs text-slate-400 italic">Aucune donnée de pouls disponible.</p>
          )}
        </Section>
      </div>

      {/* ── 4. Grilles de lecture — déplacé ici, après les pouls ── */}
      <div ref={sectionGrilleRef}>
        <Section title="Grilles de lecture" defaultOpen={true} hasError={errorSections.has('grille')} forceOpen={errorSections.has('grille')}>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
              Grille principale <span className="text-red-400">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {GRILLES.map((g) => (
                <button
                  key={g.id}
                  onClick={() => {
                    if (grillePrincipale === g.id) setGrillePrincipale('');
                    else {
                      setGrillePrincipale(g.id);
                      if (grilleSecondaire === g.id) setGrilleSecondaire('');
                    }
                  }}
                  className={cn(
                    'text-sm px-3 py-1.5 rounded-full border-2 font-medium transition-all',
                    grillePrincipale === g.id
                      ? cn(g.colorClass, g.textClass, 'border-transparent')
                      : 'border-slate-200 text-slate-600 hover:border-slate-300',
                  )}
                >
                  {g.nomCourt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
              Grilles secondaires{' '}
              <span className="text-slate-400 font-normal">(optionnelles, max 2)</span>
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {GRILLES.filter((g) => g.id !== grillePrincipale && g.id !== grilleSecondaire2).map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGrilleSecondaire(grilleSecondaire === g.id ? '' : g.id)}
                  className={cn(
                    'text-sm px-3 py-1.5 rounded-full border-2 font-medium transition-all',
                    grilleSecondaire === g.id
                      ? cn(g.colorClass, g.textClass, 'border-transparent opacity-80')
                      : 'border-slate-200 text-slate-500 hover:border-slate-300',
                  )}
                >
                  {g.nomCourt}
                </button>
              ))}
            </div>
            {/* Deuxieme grille secondaire (apparait si la premiere est selectionnee) */}
            {grilleSecondaire && (
              <div className="flex flex-wrap gap-2">
                {GRILLES.filter((g) => g.id !== grillePrincipale && g.id !== grilleSecondaire).map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setGrilleSecondaire2(grilleSecondaire2 === g.id ? '' : g.id)}
                    className={cn(
                      'text-sm px-3 py-1.5 rounded-full border-2 font-medium transition-all',
                      grilleSecondaire2 === g.id
                        ? cn(g.colorClass, g.textClass, 'border-transparent opacity-60')
                        : 'border-slate-200 text-slate-500 hover:border-slate-300',
                    )}
                  >
                    {g.nomCourt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Section>
      </div>

      {/* ── 5. Bilan énergétique ── */}
      <div ref={sectionBilanRef}>
        <Section title="Bilan énergétique" defaultOpen={true} hasError={errorSections.has('bilan')} forceOpen={errorSections.has('bilan')}>
          <p className="text-xs text-slate-500">
            Saisissez votre raisonnement énergétique en points numérotés (max 7 points, 600 caractères au total).
          </p>
          <NumberedPoints
            points={bilan}
            onChange={setBilan}
            maxPoints={7}
            maxTotalChars={600}
            placeholder="Ex : Vide de Yang du Rein, Foyer Inférieur…"
          />
        </Section>
      </div>

      {/* ── 6. Stratégie thérapeutique ── */}
      <div ref={sectionStrategieRef}>
        <Section
          title={`Stratégie thérapeutique${mode === 'cas' ? ' (optionnelle)' : ''}`}
          defaultOpen={mode === 'participation'}
          hasError={errorSections.has('strategie')}
          forceOpen={errorSections.has('strategie')}
        >
          <NumberedPoints
            points={strategie}
            onChange={setStrategie}
            maxPoints={7}
            placeholder="Ex : Réchauffer le Yang du Rein, soutenir le Ming Men…"
          />
        </Section>
      </div>

      {/* ── 7. Points proposés ── */}
      <Section
        title={`Points proposés${mode === 'cas' ? ' (optionnels)' : ''}`}
        defaultOpen={mode === 'participation'}
        badge={pointRows.length}
      >
        <div className="space-y-2">
          {pointRows.map((r) => (
            <PointRowEditor
              key={r.id}
              row={r}
              onChange={(next) => updatePointRow(r.id, next)}
              onRemove={() => removePointRow(r.id)}
            />
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={addPointRow}>
          <Plus size={12} /> Ajouter un point
        </Button>
      </Section>

      {/* ── 7bis. Deuxième séance (optionnelle) ── */}
      {!showDeuxiemeSeance ? (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeuxiemeSeance(true)}
            className="gap-2"
          >
            <Plus size={12} /> Ajouter une deuxième séance
          </Button>
        </div>
      ) : (
        <Section title="Deuxième séance" defaultOpen={true}>
          <div className="space-y-4">
            {/* Commentaire de séance */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
                Commentaire de séance
              </label>
              <textarea
                value={deuxiemeCommentaire}
                onChange={(e) => {
                  if (e.target.value.length <= 200) setDeuxiemeCommentaire(e.target.value);
                }}
                rows={2}
                placeholder="Contexte de cette 2ème séance (max 200 car.)…"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />
              <p className="text-[10px] text-slate-400 text-right">
                {deuxiemeCommentaire.length}/200
              </p>
            </div>

            {/* Stratégie thérapeutique */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
                Stratégie thérapeutique
              </label>
              <NumberedPoints
                points={deuxiemeStrategie}
                onChange={setDeuxiemeStrategie}
                maxPoints={7}
                placeholder="Ex : Consolider le Yang du Rein…"
              />
            </div>

            {/* Points proposés */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
                Points proposés
              </label>
              <div className="space-y-2">
                {deuxiemePoints.map((r) => (
                  <PointRowEditor
                    key={r.id}
                    row={r}
                    onChange={(next) => updateDeuxiemePointRow(r.id, next)}
                    onRemove={() => removeDeuxiemePointRow(r.id)}
                  />
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={addDeuxiemePointRow} className="mt-2">
                <Plus size={12} /> Ajouter un point
              </Button>
            </div>

            {/* Supprimer la deuxième séance */}
            <button
              type="button"
              onClick={handleRemoveDeuxiemeSeance}
              className="text-xs text-red-500 hover:text-red-700 underline"
            >
              Supprimer la deuxième séance
            </button>
          </div>
        </Section>
      )}

      {/* ── 8. Commentaire libre ── */}
      <Section title="Commentaire libre" defaultOpen={false}>
        <textarea
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
          rows={3}
          placeholder="Votre raisonnement global, hésitations, questions…"
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
        />
      </Section>

      {/* ── 9. Difficulté estimée ── */}
      <Section title="Difficulté du cas (optionnel)" defaultOpen={true}>
        <p className="text-xs text-slate-500">
          Comment évaluez-vous la difficulté de ce cas ?
        </p>
        <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
          {(Object.entries(DIFFICULTE_LABELS) as [DifficulteEstimee, string][]).map(([val, label]) => (
            <label
              key={val}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer text-sm transition-colors',
                difficultéEstimee === val
                  ? 'border-teal-500 bg-teal-50 text-teal-900 font-medium'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300',
              )}
            >
              <input
                type="radio"
                name="difficulte"
                value={val}
                checked={difficultéEstimee === val}
                onChange={() => setDifficultéEstimee(val)}
                className="accent-teal-600"
              />
              {label}
            </label>
          ))}
          {difficultéEstimee && (
            <button
              type="button"
              onClick={() => setDifficultéEstimee('')}
              className="text-xs text-slate-400 hover:text-slate-600 underline self-center"
            >
              Effacer
            </button>
          )}
        </div>
      </Section>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-center gap-2">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* ── Actions ── */}
      <div className="flex gap-3 pt-2 sticky bottom-0 bg-white py-4 border-t border-slate-100 -mx-6 px-6 flex-wrap">
        {mode === 'cas' ? (
          <Button
            onClick={() => submit('public')}
            variant="primary"
            className={cn('flex-1 gap-2', saved && 'bg-emerald-600')}
          >
            {saved ? (
              <>
                <CheckCircle2 size={16} /> Soumis
              </>
            ) : (
              'Soumettre votre analyse'
            )}
          </Button>
        ) : hidePublicationChoice ? (
          <Button
            onClick={() => submit('anonyme')}
            variant="primary"
            className={cn('flex-1 gap-2', saved && 'bg-emerald-600')}
          >
            {saved ? (
              <>
                <CheckCircle2 size={16} /> Envoye
              </>
            ) : (
              submitLabel ?? 'Soumettre'
            )}
          </Button>
        ) : (
          <>
            <Button
              onClick={() => submit('public')}
              variant="primary"
              className={cn('flex-1 gap-2', saved && 'bg-emerald-600')}
            >
              {saved ? (
                <>
                  <CheckCircle2 size={16} /> Publié
                </>
              ) : (
                'Publier'
              )}
            </Button>
            <Button onClick={() => submit('anonyme')} variant="outline" className="gap-2">
              Publier anonyme
            </Button>
          </>
        )}
        {onCancel && (
          <Button onClick={onCancel} variant="ghost">
            Fermer
          </Button>
        )}
      </div>
    </div>
  );
}

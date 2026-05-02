'use client';

// ─── Analyse IA 5 Éléments — Composant d'affichage en streaming ──────────────
// Cycle : ZHI (Eau) → HUN (Bois) → [YI] → SHEN (Feu) → [YI] → PO (Métal) → [YI] → SHEN Synthèse

import { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { ClinicalCase } from '@/types';
import {
  Sparkles,
  Droplets,
  Leaf,
  Flame,
  Beaker,
  Circle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Save,
  Copy,
  Check,
  Clock,
  Trash2,
  History,
} from 'lucide-react';

// ─── Types internes ───────────────────────────────────────────────────────────

type SpiritId = 'ZHI' | 'HUN' | 'SHEN' | 'PO';
type AnalysisStatus = 'idle' | 'running' | 'complete' | 'error';
type AnalyseTier = 'standard' | 'expert' | 'supreme';

interface SpiritState {
  text: string;
  complete: boolean;
  active: boolean;
}

interface FiveElementsState {
  status: AnalysisStatus;
  spirits: Record<SpiritId, SpiritState>;
  yi: Record<1 | 2 | 3, { text: string; complete: boolean; active: boolean }>;
  synthesis: string;
  synthesisComplete: boolean;
  synthesisActive: boolean;
  currentStep: string;
  error?: string;
}

// Minimal type for history items (mirrors IaAnalyse from store.ts)
interface HistoryItem {
  id: string;
  cas_id: string;
  tier: AnalyseTier;
  created_at: string;
  spirits: { id: string; label: string; content: string }[];
  yi: { stage: 1 | 2 | 3; content: string }[];
  synthesis: string;
  duration_ms: number | null;
}

// ─── Configuration des esprits ────────────────────────────────────────────────

const SPIRIT_CONFIG: Record<SpiritId, {
  label: string;
  element: string;
  organe: string;
  icon: React.ReactNode;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  dotClass: string;
}> = {
  ZHI: {
    label: 'ZHI', element: 'Eau', organe: 'Rein',
    icon: <Droplets size={16} />,
    colorClass: 'text-sky-600',
    bgClass: 'bg-sky-50',
    borderClass: 'border-sky-200',
    dotClass: 'bg-sky-500',
  },
  HUN: {
    label: 'HUN', element: 'Bois', organe: 'Foie',
    icon: <Leaf size={16} />,
    colorClass: 'text-emerald-600',
    bgClass: 'bg-emerald-50',
    borderClass: 'border-emerald-200',
    dotClass: 'bg-emerald-500',
  },
  SHEN: {
    label: 'SHEN', element: 'Feu', organe: 'Cœur',
    icon: <Flame size={16} />,
    colorClass: 'text-rose-600',
    bgClass: 'bg-rose-50',
    borderClass: 'border-rose-200',
    dotClass: 'bg-rose-500',
  },
  PO: {
    label: 'PO', element: 'Métal', organe: 'Poumon',
    icon: <Beaker size={16} />,
    colorClass: 'text-slate-600',
    bgClass: 'bg-slate-50',
    borderClass: 'border-slate-200',
    dotClass: 'bg-slate-500',
  },
};

const CYCLE_ORDER: SpiritId[] = ['ZHI', 'HUN', 'SHEN', 'PO'];

const TIER_LABELS: Record<AnalyseTier, string> = {
  standard: 'Standard',
  expert: 'Expert',
  supreme: 'Suprême',
};

// ─── État initial ─────────────────────────────────────────────────────────────

function initialState(): FiveElementsState {
  return {
    status: 'idle',
    spirits: {
      ZHI: { text: '', complete: false, active: false },
      HUN: { text: '', complete: false, active: false },
      SHEN: { text: '', complete: false, active: false },
      PO: { text: '', complete: false, active: false },
    },
    yi: {
      1: { text: '', complete: false, active: false },
      2: { text: '', complete: false, active: false },
      3: { text: '', complete: false, active: false },
    },
    synthesis: '',
    synthesisComplete: false,
    synthesisActive: false,
    currentStep: '',
  };
}

// ─── Utilitaire : formater le cas en texte ────────────────────────────────────

function formatCaseForAI(cas: ClinicalCase): string {
  const lines: string[] = [];

  lines.push(`# CAS CLINIQUE : ${cas.titre}`);
  if (cas.age) {
    lines.push(`Patient : ${cas.age} ans${cas.sexe && cas.sexe !== 'non_precise' ? `, ${cas.sexe === 'feminin' ? 'Femme' : 'Homme'}` : ''}`);
  }
  lines.push('');

  lines.push(`## MOTIF DE CONSULTATION`);
  lines.push(cas.content.motif);
  lines.push('');

  lines.push(`## ANAMNÈSE & INTERROGATOIRE`);
  cas.content.interrogatoire.forEach(item => {
    lines.push(`${item.cle} : ${item.valeur}`);
  });
  if (cas.content.contexteVie) lines.push(`Contexte de vie : ${cas.content.contexteVie}`);
  if (cas.content.antecedents) lines.push(`Antécédents : ${cas.content.antecedents}`);
  lines.push('');

  lines.push(`## PRISE DE POULS`);
  lines.push(`Condition : ${cas.content.prisePouls.condition}`);
  cas.content.prisePouls.lectures.forEach(lecture => {
    const pos = lecture.positionLabel ?? lecture.position.replace(/_/g, ' ');
    const quals = lecture.qualites.join(', ');
    lines.push(`${pos} : ${quals} — ${lecture.interpretation}`);
  });
  if (cas.content.prisePouls.synthese) {
    lines.push(`Synthèse pouls : ${cas.content.prisePouls.synthese}`);
  }
  lines.push('');

  if (cas.content.observation) {
    lines.push(`## OBSERVATION`);
    lines.push(cas.content.observation);
    lines.push('');
  }
  if (cas.content.palpation) {
    lines.push(`## PALPATION`);
    lines.push(cas.content.palpation);
    lines.push('');
  }
  if (cas.content.langueTexte) {
    lines.push(`## EXAMEN DE LA LANGUE`);
    lines.push(cas.content.langueTexte);
    lines.push('');
  }
  if (cas.content.palpationAbdo?.length) {
    lines.push(`## PALPATION ABDOMINALE`);
    cas.content.palpationAbdo.forEach(e => {
      lines.push(`${e.element} : ${e.etats.join(', ')}`);
    });
    lines.push('');
  }

  return lines.join('\n');
}

// ─── Formatage date ───────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

// ─── Rendu Markdown léger ─────────────────────────────────────────────────────

function renderSynthesisMarkdown(text: string): React.ReactNode {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let tableBuffer: string[] = [];

  const flushTable = (key: string) => {
    if (tableBuffer.length === 0) return;
    const rows = tableBuffer.filter(r => r.trim() && !r.match(/^[\s|:-]+$/));
    elements.push(
      <div key={`table-${key}`} className="overflow-x-auto my-3">
        <table className="w-full text-sm border-collapse">
          <tbody>
            {rows.map((row, ri) => {
              const cells = row.split('|').filter((_, ci) => ci > 0 && ci < row.split('|').length - 1);
              return (
                <tr key={ri} className={ri === 0 ? 'bg-slate-100 font-semibold' : 'border-t border-slate-100'}>
                  {cells.map((cell, ci) => (
                    <td key={ci} className="px-3 py-1.5 text-slate-700 align-top">{cell.trim()}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
    tableBuffer = [];
  };

  lines.forEach((line, i) => {
    if (line.includes('|') && line.trim().startsWith('|')) {
      tableBuffer.push(line);
      return;
    } else if (tableBuffer.length > 0) {
      flushTable(`${i}`);
    }

    if (line.startsWith('## ')) {
      elements.push(
        <h3 key={i} className="text-base font-bold text-slate-800 mt-5 mb-2 pb-1 border-b border-slate-200">
          {line.slice(3)}
        </h3>
      );
    } else if (line.startsWith('# ')) {
      elements.push(
        <h2 key={i} className="text-lg font-bold text-slate-900 mt-4 mb-2">
          {line.slice(2)}
        </h2>
      );
    } else if (line.startsWith('• ') || line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <div key={i} className="flex gap-2 text-sm text-slate-700 leading-relaxed ml-2">
          <span className="text-teal-500 mt-0.5 shrink-0">•</span>
          <span>{line.slice(2)}</span>
        </div>
      );
    } else if (line.startsWith('— ')) {
      elements.push(
        <div key={i} className="flex gap-2 text-sm text-slate-700 leading-relaxed ml-2">
          <span className="text-indigo-400 mt-0.5 shrink-0">—</span>
          <span>{line.slice(2)}</span>
        </div>
      );
    } else if (line.trim() === '') {
      elements.push(<div key={i} className="h-1" />);
    } else {
      elements.push(
        <p key={i} className="text-sm text-slate-700 leading-relaxed">{line}</p>
      );
    }
  });

  if (tableBuffer.length > 0) flushTable('end');

  return <>{elements}</>;
}

// ─── Composant SpiritCard ─────────────────────────────────────────────────────

function SpiritCard({
  spiritId,
  state,
}: {
  spiritId: SpiritId;
  state: SpiritState;
}) {
  const [expanded, setExpanded] = useState(true);
  const config = SPIRIT_CONFIG[spiritId];
  const isEmpty = !state.text && !state.active;

  return (
    <div
      className={cn(
        'rounded-xl border transition-all duration-300',
        state.active ? `${config.borderClass} shadow-sm` : 'border-slate-100',
        isEmpty ? 'opacity-40' : 'opacity-100',
      )}
    >
      <button
        onClick={() => !isEmpty && setExpanded(!expanded)}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left',
          state.active ? config.bgClass : 'bg-white hover:bg-slate-50',
        )}
        disabled={isEmpty}
      >
        <div className={cn('flex items-center gap-2', config.colorClass)}>
          {config.icon}
          <span className="font-bold text-sm">{config.label}</span>
        </div>
        <div className="text-xs text-slate-400 font-medium">
          {config.element} · {config.organe}
        </div>
        <div className="ml-auto flex items-center gap-2">
          {state.active && !state.complete && (
            <Loader2 size={14} className={cn('animate-spin', config.colorClass)} />
          )}
          {state.complete && (
            <CheckCircle2 size={14} className="text-emerald-500" />
          )}
          {!isEmpty && (
            expanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />
          )}
        </div>
      </button>

      {!isEmpty && expanded && (
        <div className="px-4 pb-4 pt-1">
          <div
            className={cn(
              'text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-mono text-xs',
              state.active && !state.complete ? 'after:content-["▋"] after:animate-pulse' : '',
            )}
          >
            {state.text}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Composant YI Intersaison ─────────────────────────────────────────────────

const YI_LABELS: Record<1 | 2 | 3, string> = {
  1: 'YI — Intersaison 1 · après ZHI & HUN',
  2: 'YI — Intersaison 2 · après SHEN (saison principale)',
  3: 'YI — Intersaison 3 · après PO',
};

function YiStrip({
  stage,
  state,
}: {
  stage: 1 | 2 | 3;
  state: { text: string; complete: boolean; active: boolean };
}) {
  if (!state.text && !state.active) return null;

  return (
    <div className="relative my-2">
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-amber-200" />
      <div className="ml-10 rounded-xl border border-amber-200 bg-amber-50/50">
        <div className="flex items-center gap-2 px-4 py-2.5">
          <Circle size={10} className="text-amber-500 fill-amber-400 shrink-0" />
          <span className="text-xs font-semibold text-amber-700">{YI_LABELS[stage]}</span>
          {state.active && !state.complete && (
            <Loader2 size={12} className="animate-spin text-amber-500 ml-auto" />
          )}
          {state.complete && (
            <CheckCircle2 size={12} className="text-emerald-500 ml-auto" />
          )}
        </div>
        {state.text && (
          <div className="px-4 pb-3 text-xs text-amber-900 leading-relaxed whitespace-pre-wrap">
            {state.text}
            {state.active && !state.complete && <span className="animate-pulse">▋</span>}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

interface FiveElementsAnalysisProps {
  cas: ClinicalCase;
}

export function FiveElementsAnalysis({ cas }: FiveElementsAnalysisProps) {
  const [state, setState] = useState<FiveElementsState>(initialState);
  const [tier, setTier] = useState<AnalyseTier>('expert');
  const [synthExpanded, setSynthExpanded] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const synthRef = useRef<HTMLDivElement>(null);

  // Load history when toggled open
  useEffect(() => {
    if (!showHistory) return;
    setLoadingHistory(true);
    fetch(`/api/ia-analyses?casId=${encodeURIComponent(cas.id)}`)
      .then(r => r.json())
      .then((data: HistoryItem[]) => setHistory(data))
      .catch(() => setHistory([]))
      .finally(() => setLoadingHistory(false));
  }, [showHistory, cas.id]);

  const startAnalysis = useCallback(async () => {
    setState(initialState());
    setSavedId(null);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setStartedAt(Date.now());

    const caseText = formatCaseForAI(cas);
    const url = `/api/analyse-ia?case=${encodeURIComponent(caseText)}&tier=${tier}`;

    setState(prev => ({ ...prev, status: 'running', currentStep: 'Démarrage du cycle...' }));

    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        let eventType = '';
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            eventType = line.slice(7).trim();
          } else if (line.startsWith('data: ') && eventType) {
            try {
              const data = JSON.parse(line.slice(6));
              handleSSEEvent(eventType, data);
            } catch { /* ignore parse errors */ }
            eventType = '';
          }
        }
      }

      setState(prev => ({ ...prev, status: 'complete', currentStep: '' }));

      setTimeout(() => {
        synthRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);

    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setState(prev => ({
        ...prev,
        status: 'error',
        error: err instanceof Error ? err.message : 'Erreur inconnue',
        currentStep: '',
      }));
    }
  }, [cas, tier]);

  const handleSSEEvent = useCallback((eventType: string, data: Record<string, unknown>) => {
    setState(prev => {
      const next = { ...prev };

      switch (eventType) {
        case 'spirit_start': {
          const id = data.spirit_id as SpiritId;
          next.currentStep = `${SPIRIT_CONFIG[id].label} (${SPIRIT_CONFIG[id].element})...`;
          next.spirits = {
            ...next.spirits,
            [id]: { ...next.spirits[id], active: true, complete: false },
          };
          break;
        }
        case 'spirit_token': {
          const id = data.spirit_id as SpiritId;
          next.spirits = {
            ...next.spirits,
            [id]: { ...next.spirits[id], text: (next.spirits[id]?.text ?? '') + (data.text as string) },
          };
          break;
        }
        case 'spirit_complete': {
          const id = data.spirit_id as SpiritId;
          next.spirits = {
            ...next.spirits,
            [id]: { ...next.spirits[id], active: false, complete: true },
          };
          break;
        }
        case 'yi_start': {
          const stage = data.stage as 1 | 2 | 3;
          next.currentStep = `YI — Intersaison ${stage}...`;
          next.yi = {
            ...next.yi,
            [stage]: { ...next.yi[stage], active: true, complete: false },
          };
          break;
        }
        case 'yi_token': {
          const stage = data.stage as 1 | 2 | 3;
          next.yi = {
            ...next.yi,
            [stage]: { ...next.yi[stage], text: (next.yi[stage]?.text ?? '') + (data.text as string) },
          };
          break;
        }
        case 'yi_complete': {
          const stage = data.stage as 1 | 2 | 3;
          next.yi = {
            ...next.yi,
            [stage]: { ...next.yi[stage], active: false, complete: true },
          };
          break;
        }
        case 'synthesis_start':
          next.synthesisActive = true;
          next.currentStep = 'SHEN — Synthèse souveraine...';
          break;
        case 'synthesis_token':
          next.synthesis = (next.synthesis ?? '') + (data.text as string);
          break;
        case 'synthesis_complete':
          next.synthesisActive = false;
          next.synthesisComplete = true;
          break;
        case 'error':
          next.status = 'error';
          next.error = data.message as string;
          break;
      }

      return next;
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (!state.synthesisComplete || isSaving || savedId) return;
    setIsSaving(true);

    const spirits = CYCLE_ORDER.map(id => ({
      id,
      label: SPIRIT_CONFIG[id].label,
      content: state.spirits[id].text,
    }));

    const yi = ([1, 2, 3] as const).map(stage => ({
      stage,
      content: state.yi[stage].text,
    }));

    const duration_ms = startedAt ? Date.now() - startedAt : undefined;

    try {
      const res = await fetch('/api/ia-analyses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cas_id: cas.id,
          tier,
          spirits,
          yi,
          synthesis: state.synthesis,
          duration_ms,
        }),
      });

      if (res.ok) {
        const saved = await res.json() as HistoryItem;
        setSavedId(saved.id);
        // Refresh history if open
        if (showHistory) {
          setHistory(prev => [saved, ...prev]);
        }
      }
    } catch {
      // save silently failed — user can retry
    } finally {
      setIsSaving(false);
    }
  }, [state, cas.id, tier, isSaving, savedId, startedAt, showHistory]);

  const handleCopy = useCallback(async () => {
    if (!state.synthesis) return;
    try {
      await navigator.clipboard.writeText(state.synthesis);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard denied */ }
  }, [state.synthesis]);

  const handleDeleteHistory = useCallback(async (id: string) => {
    setHistory(prev => prev.filter(h => h.id !== id));
    await fetch(`/api/ia-analyses?id=${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => {});
  }, []);

  // Load a past analysis into view
  const handleLoadHistory = useCallback((item: HistoryItem) => {
    const spiritState: Record<SpiritId, SpiritState> = {
      ZHI: { text: '', complete: false, active: false },
      HUN: { text: '', complete: false, active: false },
      SHEN: { text: '', complete: false, active: false },
      PO: { text: '', complete: false, active: false },
    };
    for (const s of item.spirits) {
      if (s.id in spiritState) {
        spiritState[s.id as SpiritId] = { text: s.content, complete: true, active: false };
      }
    }

    const yiState: Record<1 | 2 | 3, { text: string; complete: boolean; active: boolean }> = {
      1: { text: '', complete: false, active: false },
      2: { text: '', complete: false, active: false },
      3: { text: '', complete: false, active: false },
    };
    for (const y of item.yi) {
      yiState[y.stage] = { text: y.content, complete: true, active: false };
    }

    setState({
      status: 'complete',
      spirits: spiritState,
      yi: yiState,
      synthesis: item.synthesis,
      synthesisComplete: true,
      synthesisActive: false,
      currentStep: '',
    });
    setSavedId(item.id);
    setTier(item.tier);
    setShowHistory(false);

    setTimeout(() => {
      synthRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, []);

  const isRunning = state.status === 'running';
  const hasResult = state.status === 'complete' || state.synthesis.length > 0;

  const showYi1 = state.yi[1].text.length > 0 || state.yi[1].active;
  const showYi2 = state.yi[2].text.length > 0 || state.yi[2].active;
  const showYi3 = state.yi[3].text.length > 0 || state.yi[3].active;

  return (
    <div className="space-y-4">
      {/* Header + Trigger */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} className="text-amber-400" />
              <h3 className="text-sm font-bold text-white">Analyse IA 5 Éléments</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                IEATC
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cycle ZHI → HUN → SHEN → PO avec synthèses YI d&apos;intersaison.
              Analyse clinique souveraine par SHEN.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <select
              value={tier}
              onChange={e => setTier(e.target.value as AnalyseTier)}
              disabled={isRunning}
              className="text-xs bg-slate-700 text-slate-200 border border-slate-600 rounded-lg px-2 py-1.5 focus:outline-none focus:border-amber-400"
            >
              <option value="standard">Standard (~€0.05)</option>
              <option value="expert">Expert (~€0.50)</option>
              <option value="supreme">Suprême (~€0.90)</option>
            </select>

            <button
              onClick={startAnalysis}
              disabled={isRunning}
              className={cn(
                'flex items-center gap-2 text-sm px-4 py-2 rounded-lg font-semibold transition-all',
                isRunning
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : hasResult
                    ? 'bg-slate-600 text-white hover:bg-slate-500'
                    : 'bg-amber-400 text-slate-900 hover:bg-amber-300',
              )}
            >
              {isRunning ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  En cours...
                </>
              ) : hasResult ? (
                <>
                  <RefreshCw size={14} />
                  Relancer
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  Analyser
                </>
              )}
            </button>
          </div>
        </div>

        {/* Progress dots */}
        {isRunning && state.currentStep && (
          <div className="mt-3 flex items-center gap-2">
            <div className="flex gap-1">
              {CYCLE_ORDER.map(id => {
                const s = state.spirits[id];
                const cfg = SPIRIT_CONFIG[id];
                return (
                  <div
                    key={id}
                    className={cn(
                      'w-2 h-2 rounded-full transition-all',
                      s.complete ? 'bg-emerald-400' :
                      s.active ? cn(cfg.dotClass, 'animate-pulse') :
                      'bg-slate-600',
                    )}
                  />
                );
              })}
            </div>
            <span className="text-xs text-slate-400">{state.currentStep}</span>
          </div>
        )}
      </div>

      {/* Error */}
      {state.status === 'error' && state.error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
          <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-700">Erreur lors de l&apos;analyse</p>
            <p className="text-xs text-red-600 mt-1">{state.error}</p>
          </div>
        </div>
      )}

      {/* Cycle — Spirits + YI */}
      {(state.spirits.ZHI.text || isRunning) && (
        <div className="space-y-2">
          <SpiritCard spiritId="ZHI" state={state.spirits.ZHI} />

          <SpiritCard spiritId="HUN" state={state.spirits.HUN} />
          {showYi1 && <YiStrip stage={1} state={state.yi[1]} />}

          <SpiritCard spiritId="SHEN" state={state.spirits.SHEN} />
          {showYi2 && <YiStrip stage={2} state={state.yi[2]} />}

          <SpiritCard spiritId="PO" state={state.spirits.PO} />
          {showYi3 && <YiStrip stage={3} state={state.yi[3]} />}
        </div>
      )}

      {/* Synthèse Souveraine */}
      {(state.synthesis || state.synthesisActive) && (
        <div
          ref={synthRef}
          className={cn(
            'rounded-2xl border-2 overflow-hidden transition-all',
            state.synthesisComplete ? 'border-teal-300 shadow-md' : 'border-rose-200',
          )}
        >
          {/* Header synthèse */}
          <button
            onClick={() => setSynthExpanded(!synthExpanded)}
            className={cn(
              'w-full flex items-center gap-3 px-5 py-4 text-left',
              state.synthesisComplete ? 'bg-teal-50' : 'bg-rose-50',
            )}
          >
            <Flame
              size={18}
              className={state.synthesisComplete ? 'text-teal-600' : 'text-rose-500'}
            />
            <div>
              <div className="font-bold text-slate-900 text-sm">SHEN — Synthèse Souveraine</div>
              <div className="text-xs text-slate-500">Analyse clinique intégrée · tier {TIER_LABELS[tier]}</div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {state.synthesisActive && !state.synthesisComplete && (
                <Loader2 size={14} className="animate-spin text-rose-500" />
              )}
              {state.synthesisComplete && (
                <CheckCircle2 size={14} className="text-emerald-500" />
              )}
              {synthExpanded ? (
                <ChevronUp size={14} className="text-slate-400" />
              ) : (
                <ChevronDown size={14} className="text-slate-400" />
              )}
            </div>
          </button>

          {/* Corps synthèse */}
          {synthExpanded && (
            <div className="px-5 py-4 bg-white">
              <div className="prose prose-sm max-w-none">
                {renderSynthesisMarkdown(state.synthesis)}
                {state.synthesisActive && !state.synthesisComplete && (
                  <span className="text-rose-400 animate-pulse ml-1">▋</span>
                )}
              </div>
            </div>
          )}

          {/* Footer : actions post-synthèse */}
          {state.synthesisComplete && (
            <div className="px-5 py-3 bg-teal-50 border-t border-teal-100 flex items-center gap-2 flex-wrap">
              {/* Copier */}
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-teal-200 text-teal-700 hover:bg-teal-100 transition-colors"
              >
                {copied ? (
                  <><Check size={12} className="text-emerald-500" />Copié !</>
                ) : (
                  <><Copy size={12} />Copier la synthèse</>
                )}
              </button>

              {/* Sauvegarder */}
              {!savedId ? (
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors disabled:opacity-60"
                >
                  {isSaving ? (
                    <><Loader2 size={12} className="animate-spin" />Sauvegarde...</>
                  ) : (
                    <><Save size={12} />Sauvegarder</>
                  )}
                </button>
              ) : (
                <span className="flex items-center gap-1.5 text-xs text-teal-600">
                  <CheckCircle2 size={12} />
                  Sauvegardée
                </span>
              )}

              <div className="ml-auto text-xs text-slate-400">
                {startedAt && state.status === 'complete' && (
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {Math.round((Date.now() - startedAt) / 1000)}s
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Historique */}
      <div className="rounded-xl border border-slate-200 overflow-hidden">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center gap-2 px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
        >
          <History size={14} className="text-slate-500" />
          <span className="text-sm font-medium text-slate-700">Historique des analyses</span>
          <div className="ml-auto">
            {showHistory ? (
              <ChevronUp size={14} className="text-slate-400" />
            ) : (
              <ChevronDown size={14} className="text-slate-400" />
            )}
          </div>
        </button>

        {showHistory && (
          <div className="divide-y divide-slate-100">
            {loadingHistory && (
              <div className="flex items-center gap-2 px-4 py-3 text-xs text-slate-500">
                <Loader2 size={12} className="animate-spin" />
                Chargement...
              </div>
            )}

            {!loadingHistory && history.length === 0 && (
              <div className="px-4 py-4 text-xs text-slate-400 text-center">
                Aucune analyse sauvegardée pour ce cas.
              </div>
            )}

            {!loadingHistory && history.map(item => (
              <div key={item.id} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-slate-700">
                      {formatDate(item.created_at)}
                    </span>
                    <span className={cn(
                      'text-xs px-1.5 py-0.5 rounded-full font-medium',
                      item.tier === 'supreme' ? 'bg-purple-100 text-purple-700' :
                      item.tier === 'expert' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-600',
                    )}>
                      {TIER_LABELS[item.tier]}
                    </span>
                    {item.duration_ms && (
                      <span className="text-xs text-slate-400">
                        {Math.round(item.duration_ms / 1000)}s
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate">
                    {item.synthesis.slice(0, 120)}...
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleLoadHistory(item)}
                    className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    Charger
                  </button>
                  <button
                    onClick={() => handleDeleteHistory(item.id)}
                    className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

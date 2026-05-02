/**
 * store.ts — Persistance Supabase pour les analyses IA 5 Éléments
 *
 * Table : ia_analyses
 * Colonnes : id, cas_id, tier, created_at, spirits_json, yi_json, synthesis, duration_ms
 */

import { createClient } from '@supabase/supabase-js';

// ─── Client Supabase (côté serveur uniquement) ────────────────────────────────

function getSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase env vars manquantes');
  return createClient(url, key);
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type AnalyseTier = 'standard' | 'expert' | 'supreme';

export interface SpiritResult {
  id: string;
  label: string;
  content: string;
}

export interface YiResult {
  stage: 1 | 2 | 3;
  content: string;
}

export interface IaAnalyse {
  id: string;
  cas_id: string;
  tier: AnalyseTier;
  created_at: string;
  spirits: SpiritResult[];
  yi: YiResult[];
  synthesis: string;
  duration_ms: number | null;
}

export interface IaAnalyseInsert {
  cas_id: string;
  tier: AnalyseTier;
  spirits: SpiritResult[];
  yi: YiResult[];
  synthesis: string;
  duration_ms?: number;
}

// ─── Sauvegarder une analyse ──────────────────────────────────────────────────

export async function saveAnalyse(data: IaAnalyseInsert): Promise<IaAnalyse | null> {
  const supabase = getSupabaseServer();

  const { data: row, error } = await supabase
    .from('ia_analyses')
    .insert({
      cas_id: data.cas_id,
      tier: data.tier,
      spirits_json: JSON.stringify(data.spirits),
      yi_json: JSON.stringify(data.yi),
      synthesis: data.synthesis,
      duration_ms: data.duration_ms ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error('[store] saveAnalyse error:', error.message);
    return null;
  }

  return rowToAnalyse(row);
}

// ─── Charger les analyses d'un cas (ordre anti-chronologique) ─────────────────

export async function loadAnalysesByCas(casId: string): Promise<IaAnalyse[]> {
  const supabase = getSupabaseServer();

  const { data: rows, error } = await supabase
    .from('ia_analyses')
    .select('*')
    .eq('cas_id', casId)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('[store] loadAnalysesByCas error:', error.message);
    return [];
  }

  return (rows ?? []).map(rowToAnalyse);
}

// ─── Charger une analyse par ID ───────────────────────────────────────────────

export async function loadAnalyseById(id: string): Promise<IaAnalyse | null> {
  const supabase = getSupabaseServer();

  const { data: row, error } = await supabase
    .from('ia_analyses')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('[store] loadAnalyseById error:', error.message);
    return null;
  }

  return rowToAnalyse(row);
}

// ─── Supprimer une analyse ────────────────────────────────────────────────────

export async function deleteAnalyse(id: string): Promise<boolean> {
  const supabase = getSupabaseServer();

  const { error } = await supabase
    .from('ia_analyses')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[store] deleteAnalyse error:', error.message);
    return false;
  }

  return true;
}

// ─── Helper de conversion row → type ─────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToAnalyse(row: any): IaAnalyse {
  return {
    id: row.id,
    cas_id: row.cas_id,
    tier: row.tier as AnalyseTier,
    created_at: row.created_at,
    spirits: safeParseJSON(row.spirits_json, []),
    yi: safeParseJSON(row.yi_json, []),
    synthesis: row.synthesis ?? '',
    duration_ms: row.duration_ms ?? null,
  };
}

function safeParseJSON<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

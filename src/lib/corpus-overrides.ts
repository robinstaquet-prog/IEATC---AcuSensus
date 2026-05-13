// ─── Corpus case visibility overrides (admin-only) ───────────────────────────
// Permet à l'admin de masquer des cas du corpus depuis l'interface.
// Stocké dans Supabase (table corpus_hidden_cases) — global pour tous les users.

import { supabase } from '@/lib/supabase';

/** Charge les IDs des cas masqués depuis Supabase. */
export async function fetchHiddenCorpusCaseIds(): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('corpus_hidden_cases')
    .select('case_id');
  if (error || !data) return new Set();
  return new Set<string>(data.map((r) => r.case_id));
}

/** Masque ou rend visible un cas corpus (insert/delete dans Supabase). */
export async function setCorpusCaseHidden(
  id: string,
  hidden: boolean,
): Promise<void> {
  if (hidden) {
    await supabase
      .from('corpus_hidden_cases')
      .upsert({ case_id: id }, { onConflict: 'case_id' });
  } else {
    await supabase
      .from('corpus_hidden_cases')
      .delete()
      .eq('case_id', id);
  }
}

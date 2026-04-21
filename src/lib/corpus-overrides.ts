// ─── Corpus case visibility overrides (admin-only) ───────────────────────────
// Permet à l'admin de masquer des cas du corpus depuis l'interface.
// Stocké en localStorage — côté client uniquement.
// N'affecte pas les stats (calculées statiquement au build).

const KEY = 'acusensus_hidden_corpus_cases';

export function getHiddenCorpusCaseIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(KEY);
    return new Set<string>(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

export function setCorpusCaseHidden(id: string, hidden: boolean): void {
  const ids = getHiddenCorpusCaseIds();
  if (hidden) ids.add(id);
  else ids.delete(id);
  localStorage.setItem(KEY, JSON.stringify([...ids]));
}

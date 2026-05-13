-- ─── Table corpus_hidden_cases : cas masqués par l'admin ─────────────────────
-- Quand l'admin masque un cas corpus, il disparaît pour TOUT LE MONDE.
-- Simple table avec l'ID du cas masqué.

CREATE TABLE IF NOT EXISTS public.corpus_hidden_cases (
  case_id text PRIMARY KEY,
  hidden_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.corpus_hidden_cases ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut lire (pour filtrer les cas masqués côté client)
DROP POLICY IF EXISTS "corpus_hidden_select_all" ON public.corpus_hidden_cases;
CREATE POLICY "corpus_hidden_select_all" ON public.corpus_hidden_cases
  FOR SELECT USING (true);

-- Seuls les admins peuvent insérer/supprimer
DROP POLICY IF EXISTS "corpus_hidden_insert_admin" ON public.corpus_hidden_cases;
CREATE POLICY "corpus_hidden_insert_admin" ON public.corpus_hidden_cases
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
  );

DROP POLICY IF EXISTS "corpus_hidden_delete_admin" ON public.corpus_hidden_cases;
CREATE POLICY "corpus_hidden_delete_admin" ON public.corpus_hidden_cases
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
  );

GRANT ALL ON public.corpus_hidden_cases TO authenticated;
GRANT SELECT ON public.corpus_hidden_cases TO anon;

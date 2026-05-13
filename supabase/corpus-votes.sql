-- ─── Table corpus_votes : votes sur les analyses du corpus statique ──────────
-- Les analyses statiques (a001-yy-meridiens, etc.) n'ont pas de ligne dans
-- user_participations. Cette table stocke les votes séparément.
-- Les RPC gèrent aussi la déduction/remboursement de points_vote.

-- ─── 1. Table ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.corpus_votes (
  id          text PRIMARY KEY DEFAULT 'cv-' || gen_random_uuid()::text,
  analysis_id text NOT NULL,
  voter_id    uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  voter_statut text NOT NULL DEFAULT 'etudiant',
  cible       text NOT NULL DEFAULT 'participation',
  element_key text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(analysis_id, voter_id, cible, COALESCE(element_key, ''))
);

CREATE INDEX IF NOT EXISTS corpus_votes_analysis_id ON public.corpus_votes(analysis_id);

ALTER TABLE public.corpus_votes ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut lire tous les votes corpus
DROP POLICY IF EXISTS "corpus_votes_select_all" ON public.corpus_votes;
CREATE POLICY "corpus_votes_select_all" ON public.corpus_votes FOR SELECT USING (true);

-- On insère/supprime uniquement via les RPC (SECURITY DEFINER)
DROP POLICY IF EXISTS "corpus_votes_insert_own" ON public.corpus_votes;
CREATE POLICY "corpus_votes_insert_own" ON public.corpus_votes
  FOR INSERT WITH CHECK (auth.uid() = voter_id);

DROP POLICY IF EXISTS "corpus_votes_delete_own" ON public.corpus_votes;
CREATE POLICY "corpus_votes_delete_own" ON public.corpus_votes
  FOR DELETE USING (auth.uid() = voter_id);

GRANT ALL ON public.corpus_votes TO authenticated;
GRANT SELECT ON public.corpus_votes TO anon;

-- ─── 2. RPC cast_corpus_vote ─────────────────────────────────────────────────

DROP FUNCTION IF EXISTS public.cast_corpus_vote(text, text, text, text, text);

CREATE OR REPLACE FUNCTION public.cast_corpus_vote(
  p_analysis_id  text,
  p_voter_id     text,
  p_voter_statut text,
  p_cible        text,
  p_element_key  text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_cost int;
BEGIN
  IF auth.uid() IS NULL OR auth.uid()::text <> p_voter_id THEN
    RETURN json_build_object('ok', false, 'error', 'Non autorisé');
  END IF;

  v_cost := CASE WHEN p_cible = 'participation' THEN 2 ELSE 1 END;

  IF (SELECT points_vote FROM public.users WHERE id = auth.uid()) < v_cost THEN
    RETURN json_build_object('ok', false, 'error', 'Solde insuffisant');
  END IF;

  -- Doublon ?
  IF EXISTS (
    SELECT 1 FROM public.corpus_votes
    WHERE analysis_id = p_analysis_id
      AND voter_id = auth.uid()
      AND cible = p_cible
      AND COALESCE(element_key, '') = COALESCE(p_element_key, '')
  ) THEN
    RETURN json_build_object('ok', false, 'error', 'Déjà voté');
  END IF;

  INSERT INTO public.corpus_votes (analysis_id, voter_id, voter_statut, cible, element_key)
  VALUES (p_analysis_id, auth.uid(), p_voter_statut, p_cible, p_element_key);

  UPDATE public.users SET points_vote = points_vote - v_cost WHERE id = auth.uid();

  RETURN json_build_object('ok', true, 'consumed', v_cost);
END;
$$;

-- ─── 3. RPC cancel_corpus_vote ───────────────────────────────────────────────

DROP FUNCTION IF EXISTS public.cancel_corpus_vote(text, text, text, text);

CREATE OR REPLACE FUNCTION public.cancel_corpus_vote(
  p_analysis_id text,
  p_voter_id    text,
  p_cible       text,
  p_element_key text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_cost    int;
  v_deleted int;
BEGIN
  IF auth.uid() IS NULL OR auth.uid()::text <> p_voter_id THEN
    RETURN json_build_object('ok', false, 'error', 'Non autorisé');
  END IF;

  v_cost := CASE WHEN p_cible = 'participation' THEN 2 ELSE 1 END;

  DELETE FROM public.corpus_votes
  WHERE analysis_id = p_analysis_id
    AND voter_id = auth.uid()
    AND cible = p_cible
    AND COALESCE(element_key, '') = COALESCE(p_element_key, '');

  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  IF v_deleted = 0 THEN
    RETURN json_build_object('ok', false, 'error', 'Vote non trouvé');
  END IF;

  UPDATE public.users SET points_vote = points_vote + v_cost WHERE id = auth.uid();

  RETURN json_build_object('ok', true, 'refunded', v_cost);
END;
$$;

GRANT EXECUTE ON FUNCTION public.cast_corpus_vote(text, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_corpus_vote(text, text, text, text) TO authenticated;

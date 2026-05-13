-- ─── Fix : RLS participations — publication_mode n'est PAS une colonne ───────
-- La valeur est stockée dans extra_data->>'publicationMode' (JSONB).
-- Les anciennes policies référençaient "publication_mode" (colonne inexistante)
-- ce qui faisait que AUCUNE participation publique n'était visible.

-- ─── 1. Recréer la policy SELECT publique ───────────────────────────────────

DROP POLICY IF EXISTS "participations_select_public" ON public.user_participations;

CREATE POLICY "participations_select_public" ON public.user_participations
  FOR SELECT USING (
    -- Participation publiée (publicationMode défini = l'utilisateur a soumis)
    (extra_data->>'publicationMode') IS NOT NULL
    AND (extra_data->>'publicationMode') != ''
    -- Exclure les exercices privés
    AND COALESCE(extra_data->>'isExercice', 'false') != 'true'
  );

-- ─── 2. S'assurer que la policy "own" existe toujours ───────────────────────

DROP POLICY IF EXISTS "participations_select_own" ON public.user_participations;

CREATE POLICY "participations_select_own" ON public.user_participations
  FOR SELECT USING (auth.uid() = user_id);

-- ─── 3. GRANT EXECUTE pour les fonctions de vote ────────────────────────────
-- Par défaut PostgreSQL accorde EXECUTE à PUBLIC, mais au cas où Supabase
-- l'aurait révoqué, on le ré-accorde explicitement.

GRANT EXECUTE ON FUNCTION public.cast_vote(text, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_vote(text, text, text, text) TO authenticated;

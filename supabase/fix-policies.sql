-- ─── Supprimer les policies problématiques ──────────────────────────────────────

DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_select_admin_all" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_update_admin" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;

DROP POLICY IF EXISTS "cases_select_publie" ON public.clinical_cases;
DROP POLICY IF EXISTS "cases_select_own" ON public.clinical_cases;
DROP POLICY IF EXISTS "cases_select_editor" ON public.clinical_cases;
DROP POLICY IF EXISTS "cases_insert_contributor" ON public.clinical_cases;
DROP POLICY IF EXISTS "cases_update_own_or_editor" ON public.clinical_cases;
DROP POLICY IF EXISTS "cases_delete_admin" ON public.clinical_cases;

DROP POLICY IF EXISTS "analyses_select_via_case" ON public.clinical_analyses;
DROP POLICY IF EXISTS "analyses_insert_contributor" ON public.clinical_analyses;
DROP POLICY IF EXISTS "analyses_update_own_or_editor" ON public.clinical_analyses;

DROP POLICY IF EXISTS "participations_select_own" ON public.user_participations;
DROP POLICY IF EXISTS "participations_insert_own" ON public.user_participations;
DROP POLICY IF EXISTS "participations_update_own" ON public.user_participations;
DROP POLICY IF EXISTS "participations_delete_own" ON public.user_participations;

DROP POLICY IF EXISTS "lexique_select_public" ON public.lexique_termes;
DROP POLICY IF EXISTS "lexique_insert_editor" ON public.lexique_termes;


-- ─── Recréer les policies simples ───────────────────────────────────────────

-- Users
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Clinical cases (lecture publique des cas publiés)
CREATE POLICY "cases_select_publie" ON public.clinical_cases
  FOR SELECT USING (statut = 'publie');

-- Clinical analyses (lecture publique des analyses)
CREATE POLICY "analyses_select_publie" ON public.clinical_analyses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.clinical_cases c
      WHERE c.id = case_id AND c.statut = 'publie'
    )
  );

-- User participations (accès privé)
CREATE POLICY "participations_select_own" ON public.user_participations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "participations_insert_own" ON public.user_participations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "participations_update_own" ON public.user_participations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "participations_delete_own" ON public.user_participations
  FOR DELETE USING (auth.uid() = user_id);

-- Lexique (public)
CREATE POLICY "lexique_select_public" ON public.lexique_termes
  FOR SELECT USING (true);


-- ─── Fonction is_admin() sans récursion RLS ──────────────────────────────────
-- SECURITY DEFINER = s'exécute avec les droits du créateur, bypass RLS

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(is_admin, false) FROM public.users WHERE id = auth.uid();
$$;

-- Policy admin : voir tous les utilisateurs
CREATE POLICY "users_select_admin" ON public.users
  FOR SELECT USING (public.is_admin());

-- Policy admin : modifier tous les utilisateurs
CREATE POLICY "users_update_admin" ON public.users
  FOR UPDATE USING (public.is_admin());

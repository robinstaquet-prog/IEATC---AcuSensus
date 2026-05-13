-- ─── Fix : permettre aux utilisateurs connectés de soumettre des cas ────────
-- Problème : seul GRANT SELECT existe sur clinical_cases pour authenticated.
-- Sans GRANT INSERT, toute insertion est bloquée silencieusement.
-- De plus, les policies INSERT/UPDATE/DELETE ont pu être supprimées
-- par fix-policies.sql sans être recréées.

-- ─── 1. GRANTS manquants ────────────────────────────────────────────────────

GRANT INSERT, UPDATE, DELETE ON public.clinical_cases TO authenticated;

-- ─── 2. Policies INSERT/UPDATE/DELETE (idempotent) ──────────────────────────

-- Nettoyer d'abord
DROP POLICY IF EXISTS "cases_insert_contributor" ON public.clinical_cases;
DROP POLICY IF EXISTS "cases_insert_own" ON public.clinical_cases;
DROP POLICY IF EXISTS "cases_update_own_or_editor" ON public.clinical_cases;
DROP POLICY IF EXISTS "cases_update_own" ON public.clinical_cases;
DROP POLICY IF EXISTS "cases_delete_admin" ON public.clinical_cases;
DROP POLICY IF EXISTS "cases_delete_own" ON public.clinical_cases;

-- Tout utilisateur connecté peut insérer un cas (auteur_id = son uid)
CREATE POLICY "cases_insert_own" ON public.clinical_cases
  FOR INSERT WITH CHECK (auth.uid() = auteur_id);

-- Un utilisateur peut modifier ses propres cas
CREATE POLICY "cases_update_own" ON public.clinical_cases
  FOR UPDATE USING (auth.uid() = auteur_id);

-- Un utilisateur peut supprimer ses propres cas
CREATE POLICY "cases_delete_own" ON public.clinical_cases
  FOR DELETE USING (auth.uid() = auteur_id);

-- Admin peut tout faire
CREATE POLICY "cases_admin_all" ON public.clinical_cases
  FOR ALL USING (public.is_admin());

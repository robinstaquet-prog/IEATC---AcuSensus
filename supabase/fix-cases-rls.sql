-- ─── Fix : policies manquantes sur clinical_cases ─────────────────────────────
-- Problème : fix-policies.sql a supprimé toutes les policies INSERT/UPDATE/DELETE
-- sur clinical_cases sans les recréer → tout insert est bloqué par RLS.
-- De plus, l'ancienne policy INSERT exigeait le rôle 'contributeur',
-- excluant les utilisateurs avec le rôle par défaut 'etudiant'.
-- Solution : tout utilisateur connecté peut soumettre un cas (auteur_id = son uid).

-- ─── Nettoyer les policies existantes ────────────────────────────────────────

DROP POLICY IF EXISTS "cases_select_own" ON public.clinical_cases;
DROP POLICY IF EXISTS "cases_select_editor" ON public.clinical_cases;
DROP POLICY IF EXISTS "cases_insert_contributor" ON public.clinical_cases;
DROP POLICY IF EXISTS "cases_insert_own" ON public.clinical_cases;
DROP POLICY IF EXISTS "cases_update_own_or_editor" ON public.clinical_cases;
DROP POLICY IF EXISTS "cases_update_own" ON public.clinical_cases;
DROP POLICY IF EXISTS "cases_delete_admin" ON public.clinical_cases;
DROP POLICY IF EXISTS "cases_delete_own" ON public.clinical_cases;

-- ─── Recréer les policies correctes ──────────────────────────────────────────

-- Tout utilisateur connecté peut voir ses propres cas (tous statuts)
CREATE POLICY "cases_select_own" ON public.clinical_cases
  FOR SELECT USING (auth.uid() = auteur_id);

-- Tout utilisateur connecté peut soumettre un cas (en son nom)
CREATE POLICY "cases_insert_own" ON public.clinical_cases
  FOR INSERT WITH CHECK (auth.uid() = auteur_id);

-- Un utilisateur peut modifier ses propres cas
CREATE POLICY "cases_update_own" ON public.clinical_cases
  FOR UPDATE USING (auth.uid() = auteur_id);

-- Un utilisateur peut supprimer ses propres cas
CREATE POLICY "cases_delete_own" ON public.clinical_cases
  FOR DELETE USING (auth.uid() = auteur_id);

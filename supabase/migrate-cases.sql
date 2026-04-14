-- ─── Mettre à jour l'enum reading_grid_id ────────────────────────────────────
-- Ajouter les grilles manquantes (TypeScript vs SQL)

ALTER TYPE reading_grid_id ADD VALUE IF NOT EXISTS 'quatre_energies';
ALTER TYPE reading_grid_id ADD VALUE IF NOT EXISTS 'merveilleux_vaisseaux';
ALTER TYPE reading_grid_id ADD VALUE IF NOT EXISTS 'grands_meridiens_climats';


-- ─── Policies clinical_cases ─────────────────────────────────────────────────

-- L'auteur peut voir ses propres cas (même non publiés)
DROP POLICY IF EXISTS "cases_select_own" ON public.clinical_cases;
CREATE POLICY "cases_select_own" ON public.clinical_cases
  FOR SELECT USING (auth.uid() = auteur_id);

-- L'auteur peut supprimer ses propres cas
DROP POLICY IF EXISTS "cases_delete_own" ON public.clinical_cases;
CREATE POLICY "cases_delete_own" ON public.clinical_cases
  FOR DELETE USING (auth.uid() = auteur_id);

-- Tout utilisateur connecté peut insérer un cas
DROP POLICY IF EXISTS "cases_insert_contributor" ON public.clinical_cases;
CREATE POLICY "cases_insert_contributor" ON public.clinical_cases
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- L'auteur peut modifier ses propres cas
DROP POLICY IF EXISTS "cases_update_own" ON public.clinical_cases;
CREATE POLICY "cases_update_own" ON public.clinical_cases
  FOR UPDATE USING (auth.uid() = auteur_id);

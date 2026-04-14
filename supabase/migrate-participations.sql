-- ─── Migration participations → Supabase ─────────────────────────────────────

-- Ajouter la colonne extra_data pour les champs non mappés
ALTER TABLE public.user_participations
  ADD COLUMN IF NOT EXISTS extra_data JSONB NOT NULL DEFAULT '{}';

-- ─── Policies ─────────────────────────────────────────────────────────────────

-- Tout le monde peut lire les participations publiées en mode public
DROP POLICY IF EXISTS "participations_select_public" ON public.user_participations;
CREATE POLICY "participations_select_public" ON public.user_participations
  FOR SELECT USING (publication_mode = 'public');

-- L'utilisateur peut lire ses propres participations (anonymes ou publiques)
DROP POLICY IF EXISTS "participations_select_own" ON public.user_participations;
CREATE POLICY "participations_select_own" ON public.user_participations
  FOR SELECT USING (auth.uid() = user_id);

-- L'utilisateur peut créer ses participations
DROP POLICY IF EXISTS "participations_insert_own" ON public.user_participations;
CREATE POLICY "participations_insert_own" ON public.user_participations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- L'utilisateur peut modifier ses participations (et les autres pour les votes)
DROP POLICY IF EXISTS "participations_update_own" ON public.user_participations;
CREATE POLICY "participations_update_own" ON public.user_participations
  FOR UPDATE USING (true);

-- L'utilisateur peut supprimer ses participations
DROP POLICY IF EXISTS "participations_delete_own" ON public.user_participations;
CREATE POLICY "participations_delete_own" ON public.user_participations
  FOR DELETE USING (auth.uid() = user_id);

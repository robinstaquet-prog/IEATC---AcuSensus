-- ─── Fix : cast_vote / cancel_vote — valeur dans extra_data, pas en colonne ──
-- Problème : v_row.valeur crash car la colonne "valeur" n'existe pas dans
-- user_participations (tout est stocké dans extra_data JSONB).
-- Ajout : déduction/remboursement des points_vote du votant côté serveur.

-- ─── 1. Recréer cast_vote ───────────────────────────────────────────────────

DROP FUNCTION IF EXISTS public.cast_vote(text, text, text, text, text);

CREATE OR REPLACE FUNCTION public.cast_vote(
  p_participation_id text,
  p_voter_id         text,
  p_voter_statut     text,
  p_cible            text,
  p_element_key      text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_row          public.user_participations%ROWTYPE;
  v_votes        jsonb;
  v_new_vote     jsonb;
  v_extra        jsonb;
  v_valeur       numeric;
  v_vote_points  int;
  v_cost         int;
  v_result       json;
BEGIN
  -- Vérifier l'appelant
  IF auth.uid() IS NULL OR auth.uid()::text <> p_voter_id THEN
    RETURN json_build_object('ok', false, 'error', 'Non autorisé');
  END IF;

  -- Coût du vote
  v_cost := CASE WHEN p_cible = 'participation' THEN 2 ELSE 1 END;

  -- Vérifier solde du votant
  IF (SELECT points_vote FROM public.users WHERE id = auth.uid()) < v_cost THEN
    RETURN json_build_object('ok', false, 'error', 'Solde insuffisant');
  END IF;

  -- Récupérer la participation
  SELECT * INTO v_row
  FROM public.user_participations
  WHERE id = p_participation_id;

  IF NOT FOUND THEN
    RETURN json_build_object('ok', false, 'error', 'Participation introuvable');
  END IF;

  v_extra := COALESCE(v_row.extra_data, '{}');
  v_votes := COALESCE(v_extra->'votes', '[]');

  -- Vérifier vote en doublon
  IF p_cible = 'participation' THEN
    IF v_votes @> jsonb_build_array(
      jsonb_build_object('voterId', p_voter_id, 'cible', 'participation')
    ) THEN
      RETURN json_build_object('ok', false, 'error', 'Vous avez déjà validé cette participation.');
    END IF;
  ELSE
    IF EXISTS (
      SELECT 1 FROM jsonb_array_elements(v_votes) elem
      WHERE elem->>'voterId' = p_voter_id
        AND elem->>'cible' = 'element'
        AND elem->>'elementKey' = p_element_key
    ) THEN
      RETURN json_build_object('ok', false, 'error', 'Vous avez déjà voté sur cet élément.');
    END IF;
  END IF;

  -- Construire le nouveau vote
  v_new_vote := jsonb_build_object(
    'id',          'v-' || extract(epoch from now())::bigint || '-' || substr(md5(random()::text), 1, 5),
    'voterId',     p_voter_id,
    'voterStatut', p_voter_statut,
    'cible',       p_cible,
    'elementKey',  CASE WHEN p_cible = 'element' THEN p_element_key ELSE NULL END,
    'createdAt',   to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
  );

  v_votes := v_votes || jsonb_build_array(v_new_vote);

  -- Mettre à jour votePoints et valeur — tout dans extra_data
  v_vote_points := COALESCE((v_extra->>'votePoints')::int, 0) + v_cost;
  v_valeur := COALESCE((v_extra->>'valeur')::numeric, 1.0) + 0.1;

  -- Écrire dans Supabase
  UPDATE public.user_participations
  SET
    extra_data = v_extra || jsonb_build_object(
      'votes', v_votes,
      'votePoints', v_vote_points,
      'valeur', v_valeur
    ),
    updated_at = now()
  WHERE id = p_participation_id
  RETURNING to_json(user_participations.*) INTO v_result;

  -- Déduire les points du votant
  UPDATE public.users
  SET points_vote = points_vote - v_cost
  WHERE id = auth.uid();

  RETURN json_build_object('ok', true, 'row', v_result);
END;
$$;

-- ─── 2. Recréer cancel_vote ─────────────────────────────────────────────────

DROP FUNCTION IF EXISTS public.cancel_vote(text, text, text, text);

CREATE OR REPLACE FUNCTION public.cancel_vote(
  p_participation_id text,
  p_voter_id         text,
  p_cible            text,
  p_element_key      text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_row         public.user_participations%ROWTYPE;
  v_votes       jsonb;
  v_extra       jsonb;
  v_valeur      numeric;
  v_vote_points int;
  v_cost        int;
  v_result      json;
BEGIN
  IF auth.uid() IS NULL OR auth.uid()::text <> p_voter_id THEN
    RETURN json_build_object('ok', false, 'error', 'Non autorisé');
  END IF;

  v_cost := CASE WHEN p_cible = 'participation' THEN 2 ELSE 1 END;

  SELECT * INTO v_row
  FROM public.user_participations
  WHERE id = p_participation_id;

  IF NOT FOUND THEN
    RETURN json_build_object('ok', false, 'error', 'Participation introuvable');
  END IF;

  v_extra := COALESCE(v_row.extra_data, '{}');
  v_votes := COALESCE(v_extra->'votes', '[]');

  -- Retirer le vote
  IF p_cible = 'participation' THEN
    SELECT jsonb_agg(elem) INTO v_votes
    FROM jsonb_array_elements(v_votes) elem
    WHERE NOT (elem->>'voterId' = p_voter_id AND elem->>'cible' = 'participation');
  ELSE
    SELECT jsonb_agg(elem) INTO v_votes
    FROM jsonb_array_elements(v_votes) elem
    WHERE NOT (
      elem->>'voterId' = p_voter_id
      AND elem->>'cible' = 'element'
      AND elem->>'elementKey' = p_element_key
    );
  END IF;

  v_votes := COALESCE(v_votes, '[]'::jsonb);

  v_vote_points := GREATEST(0,
    COALESCE((v_extra->>'votePoints')::int, 0) - v_cost
  );
  v_valeur := GREATEST(1.0, COALESCE((v_extra->>'valeur')::numeric, 1.0) - 0.1);

  UPDATE public.user_participations
  SET
    extra_data = v_extra || jsonb_build_object(
      'votes', v_votes,
      'votePoints', v_vote_points,
      'valeur', v_valeur
    ),
    updated_at = now()
  WHERE id = p_participation_id
  RETURNING to_json(user_participations.*) INTO v_result;

  -- Rembourser les points du votant
  UPDATE public.users
  SET points_vote = points_vote + v_cost
  WHERE id = auth.uid();

  RETURN json_build_object('ok', true, 'row', v_result);
END;
$$;

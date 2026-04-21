-- ═══════════════════════════════════════════════════════════════════════════
-- AcuSensus — Nettoyage des comptes démo au lancement
-- ═══════════════════════════════════════════════════════════════════════════
-- À exécuter dans Supabase SQL Editor quand on passe en production réelle.
--
-- Ce script supprime uniquement les comptes de démonstration créés via
-- /admin/seed (Laurent Mercier, Isabelle Fontaine, Marie Dubois, Thomas Bernard).
-- Le compte admin Robin Staquet est exclu par défaut (ligne commentée).
--
-- Grâce au ON DELETE CASCADE du schéma, la suppression d'un compte entraîne
-- automatiquement la suppression de :
--   - Son profil (public.users)
--   - Toutes ses participations (user_participations)
--   - Tous ses cas soumis (clinical_cases.auteur_id → SET NULL, pas CASCADE)
--     → Les cas soumis par des démos restent mais perdent leur auteur_id.
--     → Pour les supprimer aussi, décommenter le bloc DELETE clinical_cases.
-- ═══════════════════════════════════════════════════════════════════════════


-- ─── Étape 0 : vérifier ce qu'on va supprimer (SELECT avant DELETE) ───────────

SELECT
  u.id,
  u.prenom,
  u.nom,
  u.email,
  u.statut_ieatc,
  COUNT(DISTINCT p.id) AS nb_participations,
  COUNT(DISTINCT c.id) AS nb_cas_soumis
FROM public.users u
LEFT JOIN public.user_participations p ON p.user_id = u.id
LEFT JOIN public.clinical_cases c ON c.auteur_id = u.id
WHERE u.email IN (
  'laurent.mercier@acusensus.app',
  'isabelle.fontaine@acusensus.app',
  'marie.dubois@acusensus.app',
  'thomas.bernard@acusensus.app'
  -- 'robin.staquet@acusensus.app'   ← décommenter pour inclure le compte admin démo
)
GROUP BY u.id, u.prenom, u.nom, u.email, u.statut_ieatc;


-- ─── Étape 1 (optionnel) : supprimer les cas soumis par les comptes démo ─────
-- Les cas soumis par des démos (auteur_id = leur UUID) n'ont probablement
-- aucun intérêt. Décommenter pour les supprimer proprement avant de
-- supprimer les comptes.

-- DELETE FROM public.clinical_cases
-- WHERE auteur_id IN (
--   SELECT id FROM public.users
--   WHERE email IN (
--     'laurent.mercier@acusensus.app',
--     'isabelle.fontaine@acusensus.app',
--     'marie.dubois@acusensus.app',
--     'thomas.bernard@acusensus.app'
--   )
-- );


-- ─── Étape 2 : supprimer les comptes démo de auth.users ──────────────────────
-- La suppression dans auth.users entraîne en CASCADE :
--   → suppression dans public.users (FK references auth.users ON DELETE CASCADE)
--   → suppression dans public.user_participations (FK ON DELETE CASCADE)

DELETE FROM auth.users
WHERE email IN (
  'laurent.mercier@acusensus.app',
  'isabelle.fontaine@acusensus.app',
  'marie.dubois@acusensus.app',
  'thomas.bernard@acusensus.app'
  -- 'robin.staquet@acusensus.app'   ← décommenter pour inclure le compte admin démo
);


-- ─── Étape 3 : vérification finale ───────────────────────────────────────────

SELECT COUNT(*) AS comptes_demo_restants
FROM public.users
WHERE email IN (
  'laurent.mercier@acusensus.app',
  'isabelle.fontaine@acusensus.app',
  'marie.dubois@acusensus.app',
  'thomas.bernard@acusensus.app'
);
-- Résultat attendu : 0

-- ─── AcuSensus — Membres, Messagerie, Notifications ─────────────────────────
-- À exécuter dans Supabase SQL Editor (une seule fois)

-- ─── 1. Table messages ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS messages (
  id            TEXT        PRIMARY KEY,
  sender_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_prenom TEXT        NOT NULL DEFAULT '',
  sender_nom    TEXT        NOT NULL DEFAULT '',
  recipient_id  UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content       TEXT        NOT NULL,
  read          BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "messages_select"       ON messages;
DROP POLICY IF EXISTS "messages_insert"       ON messages;
DROP POLICY IF EXISTS "messages_update_read"  ON messages;

-- Expéditeur et destinataire peuvent lire leurs messages
CREATE POLICY "messages_select" ON messages FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Seul l'expéditeur peut créer un message (en son propre nom)
CREATE POLICY "messages_insert" ON messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- Seul le destinataire peut marquer comme lu
CREATE POLICY "messages_update_read" ON messages FOR UPDATE TO authenticated
  USING (auth.uid() = recipient_id);

-- ─── 2. Table notifications ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS notifications (
  id         TEXT        PRIMARY KEY,
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       TEXT        NOT NULL CHECK (type IN ('message', 'vote_analyse')),
  data       JSONB       NOT NULL DEFAULT '{}',
  read       BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifs_select" ON notifications;
DROP POLICY IF EXISTS "notifs_insert" ON notifications;
DROP POLICY IF EXISTS "notifs_update" ON notifications;

CREATE POLICY "notifs_select" ON notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- N'importe quel membre authentifié peut créer une notif pour n'importe qui
-- (nécessaire pour les notifications de vote)
CREATE POLICY "notifs_insert" ON notifications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "notifs_update" ON notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- ─── 3. RLS supplémentaires pour la page Membres ─────────────────────────────

-- Permettre à tous les membres de lire les profils publics (prénom, nom, statut…)
DROP POLICY IF EXISTS "users_select_authenticated" ON users;
CREATE POLICY "users_select_authenticated" ON users FOR SELECT TO authenticated
  USING (TRUE);

-- Permettre de lire les cas soumis publics (publicationMode = 'public')
-- + les propres cas de l'utilisateur
DROP POLICY IF EXISTS "cases_select_public" ON clinical_cases;
CREATE POLICY "cases_select_public" ON clinical_cases FOR SELECT TO authenticated
  USING (
    (content->>'publicationMode') = 'public'
    OR auteur_id = auth.uid()
  );

-- Permettre de lire les participations publiques + les siennes
DROP POLICY IF EXISTS "participations_select_public" ON user_participations;
CREATE POLICY "participations_select_public" ON user_participations FOR SELECT TO authenticated
  USING (
    publication_mode = 'public'
    OR user_id = auth.uid()
  );

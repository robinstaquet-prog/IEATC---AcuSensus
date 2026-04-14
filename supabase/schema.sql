-- ═══════════════════════════════════════════════════════════════════════════════
-- AcuSensus — Schéma Supabase / PostgreSQL
-- Version : 1.1 — Auth réelle + profils étendus
-- ═══════════════════════════════════════════════════════════════════════════════
-- Principes de sécurité :
--   • RLS activé sur TOUTES les tables contenant des données utilisateurs
--   • UserParticipation : visible UNIQUEMENT par son propriétaire (user_id = auth.uid())
--   • Les cas et analyses sont en lecture publique (statut = 'publie')
--   • Les rôles éditeur/admin sont vérifiés via la table users
-- ═══════════════════════════════════════════════════════════════════════════════


-- ─── Extensions ────────────────────────────────────────────────────────────────

create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";  -- recherche fulltext accélérée


-- ─── Types énumérés ────────────────────────────────────────────────────────────

create type statut_cas as enum ('brouillon', 'en_validation', 'publie', 'archive');
create type niveau_complexite as integer;  -- 1 | 2 | 3

create type reading_grid_id as enum (
  'yin_yang', 'cinq_elements', 'zang_fu', 'meridiens',
  'trois_foyers', 'kan_che', 'constitutionnel'
);

create type polarite as enum ('yin', 'yang', 'mixte');

create type foyer as enum (
  'superieur', 'moyen', 'inferieur', 'multiple', 'non_applicable'
);

create type technique_point as enum (
  'tonification', 'dispersion', 'neutre',
  'moxa', 'moxa_tonification', 'moxa_dispersion'
);

create type type_analyse as enum ('officielle', 'variante', 'ia_generee');
create type source_type as enum ('humaine', 'ia', 'mixte', 'editoriale');
create type niveau_confiance as enum ('standard', 'expert', 'a_valider');

create type role_utilisateur as enum (
  'visiteur', 'etudiant', 'contributeur', 'editeur', 'admin'
);
create type niveau_profil as enum ('debutant', 'intermediaire', 'confirme', 'expert');

create type sexe as enum ('masculin', 'feminin', 'non_precise');


-- ─── Table users (profils) ────────────────────────────────────────────────────
-- Liée à auth.users de Supabase Auth via id = auth.uid()

create table if not exists public.users (
  id                uuid primary key references auth.users(id) on delete cascade,
  email             text not null unique,
  pseudo            text not null,
  role              role_utilisateur not null default 'etudiant',
  niveau_profil     niveau_profil not null default 'debutant',
  date_inscription  timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  -- ─── Champs étendus v1.1 ─────────────────────────────────────────────────
  nom               text,
  prenom            text,
  statut_ieatc      text,   -- 'premiere_annee' | 'etudiant' | 'quatrieme_annee' | 'jeune_praticien' | 'praticien_experimente' | 'expert'
  annee_promotion   int,    -- nullable
  annee_diplome     int,    -- nullable — requis si jeune_praticien ou au-dessus
  lieu_pratique     text,   -- nullable
  photo_profil      text,   -- nullable — URL
  mail_public       text,   -- nullable
  telephone         text,   -- nullable
  points_vote       int not null default 10,
  is_admin          boolean not null default false
);

alter table public.users enable row level security;

-- Lecture : visible par l'utilisateur lui-même
create policy "users_select_own" on public.users
  for select using (auth.uid() = id);

-- Lecture admin : les admins voient tous les profils
create policy "users_select_admin_all" on public.users
  for select using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin = true)
  );

-- Mise à jour : uniquement ses propres données
create policy "users_update_own" on public.users
  for update using (auth.uid() = id);

-- Mise à jour admin : les admins peuvent modifier tous les profils
create policy "users_update_admin" on public.users
  for update using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin = true)
  );

-- Insertion automatique lors de l'inscription (trigger)
create policy "users_insert_own" on public.users
  for insert with check (auth.uid() = id);


-- ─── Trigger : créer le profil utilisateur après inscription ──────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.users (
    id,
    email,
    pseudo,
    nom,
    prenom,
    statut_ieatc,
    points_vote,
    is_admin
  )
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'prenom' || ' ' || new.raw_user_meta_data->>'nom',
      new.raw_user_meta_data->>'pseudo',
      split_part(new.email, '@', 1)
    ),
    coalesce(new.raw_user_meta_data->>'nom', ''),
    coalesce(new.raw_user_meta_data->>'prenom', ''),
    coalesce(new.raw_user_meta_data->>'statut_ieatc', 'etudiant'),
    coalesce((new.raw_user_meta_data->>'points_vote')::int, 10),
    coalesce((new.raw_user_meta_data->>'is_admin')::boolean, false)
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ─── Table clinical_cases ─────────────────────────────────────────────────────

create table if not exists public.clinical_cases (
  id                  text primary key,  -- ex: 'cas-001'
  slug                text not null unique,
  titre               text not null,
  statut              statut_cas not null default 'brouillon',
  niveau_complexite   int not null check (niveau_complexite between 1 and 3),
  age                 int,
  sexe                sexe,
  cas_complet         boolean not null default false,
  exemplaire          boolean not null default false,
  grille_principale   reading_grid_id not null,
  tags                text[] not null default '{}',
  -- Contenu clinique (JSONB pour flexibilité)
  content             jsonb not null,
  -- Méta
  auteur_id           uuid references public.users(id) on delete set null,
  date_creation       timestamptz not null default now(),
  date_publication    timestamptz,
  view_count          int not null default 0,
  updated_at          timestamptz not null default now()
);

-- Index fulltext sur les tags et titre
create index if not exists clinical_cases_titre_trgm
  on public.clinical_cases using gin(titre gin_trgm_ops);
create index if not exists clinical_cases_tags_gin
  on public.clinical_cases using gin(tags);
create index if not exists clinical_cases_statut
  on public.clinical_cases(statut);
create index if not exists clinical_cases_grille
  on public.clinical_cases(grille_principale);

alter table public.clinical_cases enable row level security;

-- Lecture publique des cas publiés
create policy "cases_select_publie" on public.clinical_cases
  for select using (statut = 'publie');

-- Lecture de ses propres cas (tous statuts)
create policy "cases_select_own" on public.clinical_cases
  for select using (auth.uid() = auteur_id);

-- Lecture admin / éditeur
create policy "cases_select_editor" on public.clinical_cases
  for select using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role in ('editeur', 'admin')
    )
  );

-- Insertion : contributeurs, éditeurs, admins
create policy "cases_insert_contributor" on public.clinical_cases
  for insert with check (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role in ('contributeur', 'editeur', 'admin')
    )
  );

-- Mise à jour : auteur du cas, ou éditeur/admin
create policy "cases_update_own_or_editor" on public.clinical_cases
  for update using (
    auth.uid() = auteur_id or
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role in ('editeur', 'admin')
    )
  );

-- Suppression : admin uniquement
create policy "cases_delete_admin" on public.clinical_cases
  for delete using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  );


-- ─── Table clinical_analyses ──────────────────────────────────────────────────

create table if not exists public.clinical_analyses (
  id                       text primary key,
  case_id                  text not null references public.clinical_cases(id) on delete cascade,
  type_analyse             type_analyse not null default 'officielle',
  grille_principale        reading_grid_id not null,
  grilles_secondaires      reading_grid_id[] default '{}',
  polarite                 polarite not null,
  localisation_foyer       foyer,
  raisonnement             text not null,
  categories_diagnostiques text[] not null default '{}',
  strategie_therapeutique  text,
  traitement_propose       text,
  -- JSONB pour les points (code, nomIeatc, technique, justification, ordre)
  points_utilises          jsonb not null default '[]',
  niveau_confiance         niveau_confiance not null default 'standard',
  source_type              source_type not null default 'humaine',
  auteur_id                uuid references public.users(id) on delete set null,
  version                  int not null default 1,
  enseignement_cle         text,
  variantes                text,
  ia_metadata              jsonb,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create index if not exists analyses_case_id on public.clinical_analyses(case_id);
create index if not exists analyses_grille on public.clinical_analyses(grille_principale);

alter table public.clinical_analyses enable row level security;

-- Lecture : même logique que le cas parent
create policy "analyses_select_via_case" on public.clinical_analyses
  for select using (
    exists (
      select 1 from public.clinical_cases c
      where c.id = case_id
      and (
        c.statut = 'publie'
        or c.auteur_id = auth.uid()
        or exists (
          select 1 from public.users u
          where u.id = auth.uid() and u.role in ('editeur', 'admin')
        )
      )
    )
  );

create policy "analyses_insert_contributor" on public.clinical_analyses
  for insert with check (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role in ('contributeur', 'editeur', 'admin')
    )
  );

create policy "analyses_update_own_or_editor" on public.clinical_analyses
  for update using (
    auth.uid() = auteur_id or
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role in ('editeur', 'admin')
    )
  );


-- ─── Table user_participations ────────────────────────────────────────────────
-- CRITIQUE : RLS strict — jamais visible par un autre utilisateur

create table if not exists public.user_participations (
  id                      text primary key default 'p-' || gen_random_uuid()::text,
  user_id                 uuid not null references public.users(id) on delete cascade,
  case_id                 text not null references public.clinical_cases(id) on delete cascade,
  grille_choisie          reading_grid_id,
  polarite_identifiee     polarite,
  localisation_identifiee foyer,
  -- JSONB arrays
  categories_retenues     text[] not null default '{}',
  points_proposer         jsonb not null default '[]',
  commentaire_libre       text,
  revelation_faite        boolean not null default false,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),

  -- Un utilisateur ne peut avoir qu'une participation par cas
  unique (user_id, case_id)
);

create index if not exists participations_user_id on public.user_participations(user_id);
create index if not exists participations_case_id on public.user_participations(case_id);

alter table public.user_participations enable row level security;

-- ⚠ RÈGLE ABSOLUE : une participation n'est accessible QUE par son propriétaire
create policy "participations_select_own" on public.user_participations
  for select using (auth.uid() = user_id);

create policy "participations_insert_own" on public.user_participations
  for insert with check (auth.uid() = user_id);

create policy "participations_update_own" on public.user_participations
  for update using (auth.uid() = user_id);

create policy "participations_delete_own" on public.user_participations
  for delete using (auth.uid() = user_id);

-- Pas de policy SELECT admin — même les admins ne voient pas les participations des autres
-- Les statistiques agrégées sont calculées côté application


-- ─── Table lexique_termes ─────────────────────────────────────────────────────

create table if not exists public.lexique_termes (
  id                text primary key,
  terme             text not null,
  definition        text not null,
  synonymes         text[] not null default '{}',
  correspondance_mtc text,
  categorie         text not null,
  source_ieatc      text,
  voir_aussi        text[] default '{}',
  alerte_homonymie  text,
  importance        text not null default 'important' check (importance in ('fondamental', 'important', 'complementaire')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table public.lexique_termes enable row level security;

-- Lexique en lecture publique
create policy "lexique_select_public" on public.lexique_termes
  for select using (true);

create policy "lexique_insert_editor" on public.lexique_termes
  for insert with check (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role in ('editeur', 'admin')
    )
  );


-- ─── Fonction : incrémenter view_count ───────────────────────────────────────
-- Utilisée depuis le client pour incrémenter sans exposer UPDATE direct

create or replace function public.increment_view_count(p_case_id text)
returns void
language sql security definer
set search_path = ''
as $$
  update public.clinical_cases
  set view_count = view_count + 1
  where id = p_case_id and statut = 'publie';
$$;


-- ─── Fonction : upsert participation ─────────────────────────────────────────

create or replace function public.upsert_participation(
  p_case_id          text,
  p_grille_choisie   reading_grid_id default null,
  p_polarite         polarite default null,
  p_foyer            foyer default null,
  p_categories       text[] default '{}',
  p_points           jsonb default '[]',
  p_commentaire      text default null,
  p_revelation_faite boolean default false
)
returns public.user_participations
language plpgsql security definer
set search_path = ''
as $$
declare
  result public.user_participations;
begin
  insert into public.user_participations (
    user_id, case_id,
    grille_choisie, polarite_identifiee, localisation_identifiee,
    categories_retenues, points_proposer, commentaire_libre, revelation_faite
  )
  values (
    auth.uid(), p_case_id,
    p_grille_choisie, p_polarite, p_foyer,
    p_categories, p_points, p_commentaire, p_revelation_faite
  )
  on conflict (user_id, case_id) do update set
    grille_choisie          = coalesce(excluded.grille_choisie, user_participations.grille_choisie),
    polarite_identifiee     = coalesce(excluded.polarite_identifiee, user_participations.polarite_identifiee),
    localisation_identifiee = coalesce(excluded.localisation_identifiee, user_participations.localisation_identifiee),
    categories_retenues     = excluded.categories_retenues,
    points_proposer         = excluded.points_proposer,
    commentaire_libre       = coalesce(excluded.commentaire_libre, user_participations.commentaire_libre),
    revelation_faite        = excluded.revelation_faite or user_participations.revelation_faite,  -- irréversible
    updated_at              = now()
  returning * into result;

  return result;
end;
$$;


-- ─── Trigger : updated_at automatique ────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger set_updated_at_clinical_cases
  before update on public.clinical_cases
  for each row execute procedure public.set_updated_at();

create or replace trigger set_updated_at_analyses
  before update on public.clinical_analyses
  for each row execute procedure public.set_updated_at();

create or replace trigger set_updated_at_participations
  before update on public.user_participations
  for each row execute procedure public.set_updated_at();

create or replace trigger set_updated_at_users
  before update on public.users
  for each row execute procedure public.set_updated_at();


-- ─── Vue : statistiques agrégées (sans exposer les données utilisateurs) ──────

create or replace view public.stats_aggregates as
select
  count(*)                                    as total_cas,
  count(*) filter (where statut = 'publie')  as cas_publies,
  count(*) filter (where exemplaire = true and statut = 'publie') as cas_exemplaires
from public.clinical_cases;

-- Accessible en lecture publique
grant select on public.stats_aggregates to anon, authenticated;


-- ─── Grants de base ──────────────────────────────────────────────────────────

grant usage on schema public to anon, authenticated;
grant select on public.clinical_cases to anon, authenticated;
grant select on public.clinical_analyses to anon, authenticated;
grant select on public.lexique_termes to anon, authenticated;
grant all on public.user_participations to authenticated;
grant all on public.users to authenticated;
grant execute on function public.increment_view_count to anon, authenticated;
grant execute on function public.upsert_participation to authenticated;

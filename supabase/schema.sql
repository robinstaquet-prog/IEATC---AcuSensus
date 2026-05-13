-- ═══════════════════════════════════════════════════════════════════════════════
-- AcuSensus — Schéma Supabase / PostgreSQL — Version 1.1
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── Extensions ────────────────────────────────────────────────────────────────

create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";


-- ─── DROP tout d'abord (dans l'ordre inverse de création) ─────────────────────

drop view if exists public.stats_aggregates;
drop table if exists public.user_participations cascade;
drop table if exists public.lexique_termes cascade;
drop table if exists public.clinical_analyses cascade;
drop table if exists public.clinical_cases cascade;
drop table if exists public.users cascade;

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.set_updated_at();
drop function if exists public.upsert_participation();
drop function if exists public.increment_view_count();
drop function if exists public.handle_new_user();

drop type if exists sexe cascade;
drop type if exists niveau_profil cascade;
drop type if exists role_utilisateur cascade;
drop type if exists niveau_confiance cascade;
drop type if exists source_type cascade;
drop type if exists type_analyse cascade;
drop type if exists technique_point cascade;
drop type if exists foyer cascade;
drop type if exists polarite cascade;
drop type if exists reading_grid_id cascade;
drop domain if exists niveau_complexite cascade;
drop type if exists statut_cas cascade;


-- ─── Types énumérés ────────────────────────────────────────────────────────────

create type statut_cas as enum ('brouillon', 'en_validation', 'publie', 'archive');
create domain niveau_complexite as integer check (value between 1 and 3);

create type reading_grid_id as enum (
  'yin_yang', 'cinq_elements', 'zang_fu', 'meridiens',
  'trois_foyers', 'kan_che', 'constitutionnel'
);

create type polarite as enum ('yin', 'yang', 'mixte');
create type foyer as enum ('superieur', 'moyen', 'inferieur', 'multiple', 'non_applicable');
create type technique_point as enum ('tonification', 'dispersion', 'neutre', 'moxa', 'moxa_tonification', 'moxa_dispersion');
create type type_analyse as enum ('officielle', 'variante', 'ia_generee');
create type source_type as enum ('humaine', 'ia', 'mixte', 'editoriale');
create type niveau_confiance as enum ('standard', 'expert', 'a_valider');
create type role_utilisateur as enum ('visiteur', 'etudiant', 'contributeur', 'editeur', 'admin');
create type niveau_profil as enum ('debutant', 'intermediaire', 'confirme', 'expert');
create type sexe as enum ('masculin', 'feminin', 'non_precise');


-- ─── Table users ──────────────────────────────────────────────────────────────

create table public.users (
  id                uuid primary key references auth.users(id) on delete cascade,
  email             text not null unique,
  pseudo            text not null,
  role              role_utilisateur not null default 'etudiant',
  niveau_profil     niveau_profil not null default 'debutant',
  date_inscription  timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  nom               text,
  prenom            text,
  statut_ieatc      text,
  annee_promotion   int,
  annee_diplome     int,
  lieu_pratique     text,
  photo_profil      text,
  mail_public       text,
  telephone         text,
  points_vote       int not null default 10,
  is_admin          boolean not null default false
);

alter table public.users enable row level security;

create policy "users_select_own" on public.users for select using (auth.uid() = id);
create policy "users_select_admin_all" on public.users for select using (exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin = true));
create policy "users_update_own" on public.users for update using (auth.uid() = id);
create policy "users_update_admin" on public.users for update using (exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin = true));
create policy "users_insert_own" on public.users for insert with check (auth.uid() = id);


-- ─── Trigger users ────────────────────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.users (id, email, pseudo, nom, prenom, statut_ieatc, points_vote, is_admin)
  values (
    new.id, new.email,
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

create or replace trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();


-- ─── Table clinical_cases ────────────────────────────────────────────────────

create table public.clinical_cases (
  id                  text primary key,
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
  content             jsonb not null,
  auteur_id           uuid references public.users(id) on delete set null,
  date_creation       timestamptz not null default now(),
  date_publication    timestamptz,
  view_count          int not null default 0,
  updated_at          timestamptz not null default now()
);

create index clinical_cases_titre_trgm on public.clinical_cases using gin(titre gin_trgm_ops);
create index clinical_cases_tags_gin on public.clinical_cases using gin(tags);
create index clinical_cases_statut on public.clinical_cases(statut);
create index clinical_cases_grille on public.clinical_cases(grille_principale);

alter table public.clinical_cases enable row level security;

create policy "cases_select_publie" on public.clinical_cases for select using (statut = 'publie');
create policy "cases_select_own" on public.clinical_cases for select using (auth.uid() = auteur_id);
create policy "cases_select_editor" on public.clinical_cases for select using (exists (select 1 from public.users u where u.id = auth.uid() and u.role in ('editeur', 'admin')));
create policy "cases_insert_authenticated" on public.clinical_cases for insert with check (auth.uid() = auteur_id);
create policy "cases_update_own_or_editor" on public.clinical_cases for update using (auth.uid() = auteur_id or exists (select 1 from public.users u where u.id = auth.uid() and u.role in ('editeur', 'admin')));
create policy "cases_delete_admin" on public.clinical_cases for delete using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));


-- ─── Table clinical_analyses ──────────────────────────────────────────────────

create table public.clinical_analyses (
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

create index analyses_case_id on public.clinical_analyses(case_id);
create index analyses_grille on public.clinical_analyses(grille_principale);

alter table public.clinical_analyses enable row level security;

create policy "analyses_select_via_case" on public.clinical_analyses for select using (exists (select 1 from public.clinical_cases c where c.id = case_id and (c.statut = 'publie' or c.auteur_id = auth.uid() or exists (select 1 from public.users u where u.id = auth.uid() and u.role in ('editeur', 'admin')))));
create policy "analyses_insert_contributor" on public.clinical_analyses for insert with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role in ('contributeur', 'editeur', 'admin')));
create policy "analyses_update_own_or_editor" on public.clinical_analyses for update using (auth.uid() = auteur_id or exists (select 1 from public.users u where u.id = auth.uid() and u.role in ('editeur', 'admin')));


-- ─── Table user_participations ────────────────────────────────────────────────

create table public.user_participations (
  id                      text primary key default 'p-' || gen_random_uuid()::text,
  user_id                 uuid not null references public.users(id) on delete cascade,
  case_id                 text not null references public.clinical_cases(id) on delete cascade,
  grille_choisie          reading_grid_id,
  polarite_identifiee     polarite,
  localisation_identifiee foyer,
  categories_retenues     text[] not null default '{}',
  points_proposer         jsonb not null default '[]',
  commentaire_libre       text,
  revelation_faite        boolean not null default false,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  unique (user_id, case_id)
);

create index participations_user_id on public.user_participations(user_id);
create index participations_case_id on public.user_participations(case_id);

alter table public.user_participations enable row level security;

create policy "participations_select_own" on public.user_participations for select using (auth.uid() = user_id);
create policy "participations_insert_own" on public.user_participations for insert with check (auth.uid() = user_id);
create policy "participations_update_own" on public.user_participations for update using (auth.uid() = user_id);
create policy "participations_delete_own" on public.user_participations for delete using (auth.uid() = user_id);


-- ─── Table lexique_termes ────────────────────────────────────────────────────

create table public.lexique_termes (
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

create policy "lexique_select_public" on public.lexique_termes for select using (true);
create policy "lexique_insert_editor" on public.lexique_termes for insert with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role in ('editeur', 'admin')));


-- ─── Fonctions ────────────────────────────────────────────────────────────────

create or replace function public.increment_view_count(p_case_id text)
returns void language sql security definer set search_path = ''
as $$ update public.clinical_cases set view_count = view_count + 1 where id = p_case_id and statut = 'publie'; $$;

create or replace function public.upsert_participation(p_case_id text, p_grille_choisie reading_grid_id default null, p_polarite polarite default null, p_foyer foyer default null, p_categories text[] default '{}', p_points jsonb default '[]', p_commentaire text default null, p_revelation_faite boolean default false)
returns public.user_participations language plpgsql security definer set search_path = ''
as $$
declare result public.user_participations;
begin
  insert into public.user_participations (user_id, case_id, grille_choisie, polarite_identifiee, localisation_identifiee, categories_retenues, points_proposer, commentaire_libre, revelation_faite)
  values (auth.uid(), p_case_id, p_grille_choisie, p_polarite, p_foyer, p_categories, p_points, p_commentaire, p_revelation_faite)
  on conflict (user_id, case_id) do update set
    grille_choisie = coalesce(excluded.grille_choisie, user_participations.grille_choisie),
    polarite_identifiee = coalesce(excluded.polarite_identifiee, user_participations.polarite_identifiee),
    localisation_identifiee = coalesce(excluded.localisation_identifiee, user_participations.localisation_identifiee),
    categories_retenues = excluded.categories_retenues,
    points_proposer = excluded.points_proposer,
    commentaire_libre = coalesce(excluded.commentaire_libre, user_participations.commentaire_libre),
    revelation_faite = excluded.revelation_faite or user_participations.revelation_faite,
    updated_at = now()
  returning * into result;
  return result;
end;
$$;

create or replace function public.set_updated_at()
returns trigger language plpgsql
as $$ begin new.updated_at = now(); return new; end; $$;

create or replace trigger set_updated_at_clinical_cases before update on public.clinical_cases for each row execute procedure public.set_updated_at();
create or replace trigger set_updated_at_analyses before update on public.clinical_analyses for each row execute procedure public.set_updated_at();
create or replace trigger set_updated_at_participations before update on public.user_participations for each row execute procedure public.set_updated_at();
create or replace trigger set_updated_at_users before update on public.users for each row execute procedure public.set_updated_at();


-- ─── Vue ──────────────────────────────────────────────────────────────────────

create or replace view public.stats_aggregates as
select
  count(*) as total_cas,
  count(*) filter (where statut = 'publie') as cas_publies,
  count(*) filter (where exemplaire = true and statut = 'publie') as cas_exemplaires
from public.clinical_cases;

grant select on public.stats_aggregates to anon, authenticated;


-- ─── Grants ────────────────────────────────────────────────────────────────────

grant usage on schema public to anon, authenticated;
grant select on public.clinical_cases to anon, authenticated;
grant select on public.clinical_analyses to anon, authenticated;
grant select on public.lexique_termes to anon, authenticated;
grant all on public.user_participations to authenticated;
grant all on public.users to authenticated;
grant execute on function public.increment_view_count to anon, authenticated;
grant execute on function public.upsert_participation to authenticated;

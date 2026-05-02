-- ─── Table ia_analyses ────────────────────────────────────────────────────────
-- Stocke les analyses IA 5 Éléments par cas clinique.
-- À exécuter dans l'éditeur SQL Supabase (SQL Editor > New query).

create table if not exists public.ia_analyses (
  id          uuid primary key default gen_random_uuid(),
  cas_id      uuid not null references public.cases(id) on delete cascade,
  tier        text not null check (tier in ('standard', 'expert', 'supreme')),
  spirits_json text not null default '[]',
  yi_json     text not null default '[]',
  synthesis   text not null default '',
  duration_ms integer,
  created_at  timestamptz not null default now()
);

-- Index pour requêtes par cas
create index if not exists ia_analyses_cas_id_idx on public.ia_analyses (cas_id, created_at desc);

-- ─── RLS ──────────────────────────────────────────────────────────────────────
alter table public.ia_analyses enable row level security;

-- Lecture : membres du groupe propriétaire du cas
create policy "ia_analyses_select" on public.ia_analyses
  for select
  using (
    exists (
      select 1
      from public.cases c
      join public.group_members gm on gm.group_id = c.group_id
      where c.id = ia_analyses.cas_id
        and gm.user_id = auth.uid()
    )
  );

-- Insertion : membres du groupe
create policy "ia_analyses_insert" on public.ia_analyses
  for insert
  with check (
    exists (
      select 1
      from public.cases c
      join public.group_members gm on gm.group_id = c.group_id
      where c.id = ia_analyses.cas_id
        and gm.user_id = auth.uid()
    )
  );

-- Suppression : membres du groupe
create policy "ia_analyses_delete" on public.ia_analyses
  for delete
  using (
    exists (
      select 1
      from public.cases c
      join public.group_members gm on gm.group_id = c.group_id
      where c.id = ia_analyses.cas_id
        and gm.user_id = auth.uid()
    )
  );

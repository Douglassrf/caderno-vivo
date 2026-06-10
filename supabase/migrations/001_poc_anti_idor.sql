-- Caderno Vivo - PoC Anti-IDOR
-- Objetivo: provar que Usuario A nao acessa obras/dossies do Usuario B.
-- Execute no SQL Editor do Supabase ou como migration.

create extension if not exists pgcrypto;

create table if not exists public.works (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  status text not null default 'ideia solta',
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.dossiers (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references public.works(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  content text not null,
  hash text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists works_user_id_idx on public.works(user_id);
create index if not exists dossiers_user_id_idx on public.dossiers(user_id);
create index if not exists dossiers_work_id_idx on public.dossiers(work_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists works_set_updated_at on public.works;
create trigger works_set_updated_at
before update on public.works
for each row execute function public.set_updated_at();

alter table public.works enable row level security;
alter table public.dossiers enable row level security;

drop policy if exists "works_owner_all" on public.works;
drop policy if exists "dossiers_owner_all" on public.dossiers;

create policy "works_owner_all"
on public.works
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "dossiers_owner_all"
on public.dossiers
for all
to authenticated
using (
  auth.uid() = user_id
  and exists (
    select 1
    from public.works w
    where w.id = dossiers.work_id
      and w.user_id = auth.uid()
  )
)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.works w
    where w.id = dossiers.work_id
      and w.user_id = auth.uid()
  )
);

-- Checklist manual depois da migration:
-- 1. Criar Usuario A e Usuario B no Supabase Auth.
-- 2. Logar como B e criar uma obra/dossie.
-- 3. Logar como A e tentar buscar o id da obra/dossie de B.
-- 4. Logar como A e tentar alterar a obra/dossie de B.
-- 5. Logar como A e tentar criar dossie em work_id de B.
-- 6. Esperado: SELECT retorna [], UPDATE nao afeta linhas, INSERT cruzado falha.
-- 7. Se retornar ou alterar dados de B, nao fazer deploy.

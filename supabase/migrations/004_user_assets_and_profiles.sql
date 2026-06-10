-- Caderno Vivo - Missao 1/2/3 atualizada
-- Fundacao Supabase complementar: perfis e assets privados do usuario.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  artist_name text,
  language text default 'pt-BR',
  plan text default 'free' check (plan in ('free','plus','prime')),
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_owner_select" on public.profiles;
drop policy if exists "profiles_owner_insert" on public.profiles;
drop policy if exists "profiles_owner_update" on public.profiles;

create policy "profiles_owner_select"
on public.profiles
for select
to authenticated
using (id = auth.uid());

create policy "profiles_owner_insert"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

create policy "profiles_owner_update"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('audio', 'audio', false, 104857600, array['audio/mpeg','audio/wav','audio/webm','audio/mp4','audio/ogg']),
  ('covers', 'covers', false, 20971520, array['image/jpeg','image/png','image/webp']),
  ('documents', 'documents', false, 52428800, array['application/pdf','application/json','text/plain','application/zip'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "audio_owner_select" on storage.objects;
drop policy if exists "audio_owner_insert" on storage.objects;
drop policy if exists "covers_owner_select" on storage.objects;
drop policy if exists "covers_owner_insert" on storage.objects;
drop policy if exists "documents_owner_select" on storage.objects;
drop policy if exists "documents_owner_insert" on storage.objects;

create policy "audio_owner_select"
on storage.objects
for select
to authenticated
using (bucket_id = 'audio' and owner = auth.uid());

create policy "audio_owner_insert"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'audio' and owner = auth.uid());

create policy "covers_owner_select"
on storage.objects
for select
to authenticated
using (bucket_id = 'covers' and owner = auth.uid());

create policy "covers_owner_insert"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'covers' and owner = auth.uid());

create policy "documents_owner_select"
on storage.objects
for select
to authenticated
using (bucket_id = 'documents' and owner = auth.uid());

create policy "documents_owner_insert"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'documents' and owner = auth.uid());

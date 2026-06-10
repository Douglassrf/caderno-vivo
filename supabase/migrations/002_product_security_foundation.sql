-- Caderno Vivo - Fundacao de seguranca do produto
-- Objetivo: preparar Auth, pagamentos, entitlements, logs e exports protegidos.
-- Regra: o front-end nunca cria pagamento confirmado nem entitlement ativo.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'user',
  plan text not null default 'free',
  billing_customer_id text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.works
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists deleted_at timestamptz;

alter table public.dossiers
  add column if not exists access_level text not null default 'full',
  add column if not exists generated_by uuid default auth.uid() references auth.users(id) on delete set null,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  work_id uuid references public.works(id) on delete cascade,
  provider text not null,
  provider_payment_id text not null,
  product text not null,
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'BRL',
  status text not null,
  paid_at timestamptz,
  raw_event jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique (provider, provider_payment_id)
);

alter table public.payments
  drop constraint if exists payments_provider_check,
  add constraint payments_provider_check
    check (provider in ('mercado_pago')),
  drop constraint if exists payments_product_check,
  add constraint payments_product_check
    check (product in ('dossier', 'professional', 'global', 'plus', 'clip', 'prime', 'mp4', 'publish_pack', 'essential', 'club')),
  drop constraint if exists payments_status_check,
  add constraint payments_status_check
    check (status in ('pending', 'approved', 'authorized', 'in_process', 'in_mediation', 'rejected', 'cancelled', 'refunded', 'charged_back'));

create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  work_id uuid references public.works(id) on delete cascade,
  product text not null,
  source_payment_id uuid references public.payments(id) on delete set null,
  active boolean not null default false,
  created_at timestamptz not null default timezone('utc'::text, now()),
  expires_at timestamptz
);

alter table public.entitlements
  drop constraint if exists entitlements_product_check,
  add constraint entitlements_product_check
    check (product in ('dossier', 'professional', 'global', 'plus', 'clip', 'prime', 'mp4', 'publish_pack', 'essential', 'club')),
  drop constraint if exists entitlements_expiry_check,
  add constraint entitlements_expiry_check
    check (expires_at is null or expires_at > created_at);

create table if not exists public.exports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  work_id uuid not null references public.works(id) on delete cascade,
  entitlement_id uuid references public.entitlements(id) on delete set null,
  kind text not null,
  storage_path text not null,
  content_type text not null,
  size_bytes bigint,
  created_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.exports
  drop constraint if exists exports_kind_check,
  add constraint exports_kind_check
    check (kind in ('dossier', 'webm', 'mp4', 'publish_pack', 'backup')),
  drop constraint if exists exports_storage_path_check,
  add constraint exports_storage_path_check
    check (position('..' in storage_path) = 0 and length(storage_path) > 8);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  work_id uuid references public.works(id) on delete set null,
  action text not null,
  resource text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists profiles_plan_idx on public.profiles(plan);
create index if not exists payments_user_id_idx on public.payments(user_id);
create index if not exists payments_work_id_idx on public.payments(work_id);
create index if not exists entitlements_user_id_idx on public.entitlements(user_id);
create index if not exists entitlements_work_id_idx on public.entitlements(work_id);
create index if not exists entitlements_active_idx on public.entitlements(active);
create unique index if not exists entitlements_active_work_product_idx
  on public.entitlements(user_id, work_id, product)
  where active = true and work_id is not null;
create unique index if not exists entitlements_active_account_product_idx
  on public.entitlements(user_id, product)
  where active = true and work_id is null;
create index if not exists exports_user_id_idx on public.exports(user_id);
create index if not exists exports_work_id_idx on public.exports(work_id);
create index if not exists audit_logs_user_id_idx on public.audit_logs(user_id);
create index if not exists audit_logs_work_id_idx on public.audit_logs(work_id);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.payments enable row level security;
alter table public.entitlements enable row level security;
alter table public.exports enable row level security;
alter table public.audit_logs enable row level security;

alter table public.profiles force row level security;
alter table public.works force row level security;
alter table public.dossiers force row level security;
alter table public.payments force row level security;
alter table public.entitlements force row level security;
alter table public.exports force row level security;
alter table public.audit_logs force row level security;

drop policy if exists "profiles_owner_select_update" on public.profiles;
drop policy if exists "payments_owner_select" on public.payments;
drop policy if exists "entitlements_owner_select" on public.entitlements;
drop policy if exists "exports_owner_select" on public.exports;
drop policy if exists "audit_logs_owner_select" on public.audit_logs;

create policy "profiles_owner_select_update"
on public.profiles
for all
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "payments_owner_select"
on public.payments
for select
to authenticated
using (auth.uid() = user_id);

create policy "entitlements_owner_select"
on public.entitlements
for select
to authenticated
using (auth.uid() = user_id);

create policy "exports_owner_select"
on public.exports
for select
to authenticated
using (
  auth.uid() = user_id
  and exists (
    select 1
    from public.works w
    where w.id = exports.work_id
      and w.user_id = auth.uid()
  )
);

create policy "audit_logs_owner_select"
on public.audit_logs
for select
to authenticated
using (auth.uid() = user_id);

-- Payments, entitlements, exports e audit_logs devem ser inseridos por webhook,
-- Edge Function ou backend com service role, nunca diretamente pelo navegador.

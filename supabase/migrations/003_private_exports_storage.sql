-- Caderno Vivo - Storage privado para exports
-- Objetivo: garantir que dossies, MP4, WEBM e pacotes finais nao fiquem publicos.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'private-exports',
  'private-exports',
  false,
  524288000,
  array[
    'application/json',
    'application/pdf',
    'video/webm',
    'video/mp4',
    'application/zip'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "private_exports_owner_read" on storage.objects;
drop policy if exists "private_exports_no_client_write" on storage.objects;

create policy "private_exports_owner_read"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'private-exports'
  and owner = auth.uid()
);

-- Sem policy de insert/update/delete para authenticated.
-- Uploads e deletes de exports finais devem acontecer por Edge Function/backend
-- com service role depois de validar usuario, obra e entitlement.


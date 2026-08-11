-- Lida/escrita pelo hub-empresas (autenticado, RLS abaixo) e pelo Hurb
-- pessoal (service role direto, sem precisar de policy extra do lado
-- de lá — repo separado, mesmo Supabase).
create table if not exists client_messages (
  id         uuid primary key default gen_random_uuid(),
  client_id  uuid not null references clients(id) on delete cascade,
  sender     text not null check (sender in ('client','agencia')),
  body       text not null,
  created_at timestamptz not null default now(),
  read_at    timestamptz
);

create index if not exists client_messages_client_idx on client_messages(client_id, created_at);
create index if not exists client_messages_unread_idx
  on client_messages(client_id) where sender = 'client' and read_at is null;

alter table client_messages enable row level security;

create policy "service role all" on client_messages for all to service_role using (true);

create policy "own messages" on client_messages for select to authenticated
  using (client_id in (select client_id from client_users where auth_user_id = auth.uid()));

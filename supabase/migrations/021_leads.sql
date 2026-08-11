create table if not exists client_leads (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references clients(id) on delete cascade,
  nome        text,
  email       text,
  telefone    text,
  origem      text not null default 'manual',
  mensagem    text,
  status      text not null default 'novo'
                check (status in ('novo','contatado','qualificado','convertido','descartado')),
  raw_payload jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint client_leads_has_contact check (nome is not null or email is not null or telefone is not null)
);

create index if not exists client_leads_client_idx on client_leads(client_id);
create index if not exists client_leads_status_idx on client_leads(client_id, status);

alter table client_leads enable row level security;

create policy "service role all" on client_leads for all to service_role using (true);

create policy "own leads" on client_leads for select to authenticated
  using (client_id in (select client_id from client_users where auth_user_id = auth.uid()));

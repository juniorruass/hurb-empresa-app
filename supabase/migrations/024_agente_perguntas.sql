create table if not exists agente_perguntas (
  id         uuid primary key default gen_random_uuid(),
  client_id  uuid not null references clients(id) on delete cascade,
  pergunta   text not null,
  resposta   text not null,
  created_at timestamptz not null default now()
);

create index if not exists agente_perguntas_client_idx on agente_perguntas(client_id, created_at);

alter table agente_perguntas enable row level security;

create policy "service role all" on agente_perguntas for all to service_role using (true);

create policy "own perguntas" on agente_perguntas for select to authenticated
  using (client_id in (select client_id from client_users where auth_user_id = auth.uid()));

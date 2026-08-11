-- Briefing (identidade de marca do cliente) + Agente de Conteúdo
-- (copy + roteiro de vídeo, orgânico ou tráfego pago). Mesmo padrão de
-- escrita das migrations anteriores: todo INSERT/UPDATE passa por rota
-- de servidor que resolve o client_id via sessão (getCurrentClient())
-- e grava com o admin client -- por isso só existe policy de select
-- pra authenticated, não de insert/update.

create table if not exists client_briefings (
  client_id   uuid primary key references clients(id) on delete cascade,
  cor         text,
  tom_de_voz  text,
  publico     text,
  objetivos   text,
  updated_at  timestamptz not null default now()
);

create table if not exists content_requests (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid not null references clients(id) on delete cascade,
  objetivo      text not null check (objetivo in ('organico', 'trafego_pago')),
  rede          text,
  tema          text not null,
  copy          text not null,
  hashtags      text,
  variacoes     text[],
  roteiro_video text not null,
  created_at    timestamptz not null default now()
);

create index if not exists content_requests_client_idx on content_requests(client_id);

alter table client_briefings enable row level security;
alter table content_requests enable row level security;

create policy "service role all" on client_briefings for all to service_role using (true);
create policy "service role all" on content_requests for all to service_role using (true);

create policy "own briefing" on client_briefings for select to authenticated
  using (client_id in (select client_id from client_users where auth_user_id = auth.uid()));

create policy "own content requests" on content_requests for select to authenticated
  using (client_id in (select client_id from client_users where auth_user_id = auth.uid()));

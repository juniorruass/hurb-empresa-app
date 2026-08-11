create table if not exists client_webhooks (
  client_id  uuid primary key references clients(id) on delete cascade,
  secret     text not null unique,
  created_at timestamptz not null default now(),
  rotated_at timestamptz
);

alter table client_webhooks enable row level security;

create policy "service role all" on client_webhooks for all to service_role using (true);

create policy "own webhook" on client_webhooks for select to authenticated
  using (client_id in (select client_id from client_users where auth_user_id = auth.uid()));

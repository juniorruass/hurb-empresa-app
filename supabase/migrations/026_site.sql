alter table clients
  add column if not exists site_url text,
  add column if not exists site_status text,
  add column if not exists site_notes text;

create table if not exists client_site_tracking (
  client_id  uuid primary key references clients(id) on delete cascade,
  site_key   text not null unique,
  created_at timestamptz not null default now(),
  rotated_at timestamptz
);

create table if not exists site_visits (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references clients(id) on delete cascade,
  path        text,
  referrer    text,
  visitor_id  text,
  created_at  timestamptz not null default now()
);
create index if not exists site_visits_client_idx on site_visits(client_id, created_at);

alter table client_site_tracking enable row level security;
alter table site_visits enable row level security;

create policy "service role all" on client_site_tracking for all to service_role using (true);
create policy "own site tracking" on client_site_tracking for select to authenticated
  using (client_id in (select client_id from client_users where auth_user_id = auth.uid()));

create policy "service role all" on site_visits for all to service_role using (true);
create policy "own visits" on site_visits for select to authenticated
  using (client_id in (select client_id from client_users where auth_user_id = auth.uid()));

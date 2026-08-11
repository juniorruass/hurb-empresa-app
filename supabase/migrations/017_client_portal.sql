-- Shell do painel multi-cliente (hub-empresas). Antes disso não existia
-- usuário nem empresa no banco — o app inteiro era protegido por uma
-- senha única (ver lib/auth/app-gate.ts, removido). client_users liga
-- um usuário do Supabase Auth a uma linha de `clients` (migration
-- 003_financeiro_mrr.sql); client_modules controla quais módulos cada
-- cliente vê, sem precisar mexer em schema pra módulo novo.

create table if not exists client_users (
  id            uuid primary key default gen_random_uuid(),
  auth_user_id  uuid not null unique references auth.users(id) on delete cascade,
  client_id     uuid not null references clients(id) on delete cascade,
  created_at    timestamptz not null default now()
);

create table if not exists client_modules (
  id         uuid primary key default gen_random_uuid(),
  client_id  uuid not null references clients(id) on delete cascade,
  module_key text not null,
  enabled    boolean not null default true,
  created_at timestamptz not null default now(),
  unique (client_id, module_key)
);

create index if not exists client_users_client_idx on client_users(client_id);
create index if not exists client_modules_client_idx on client_modules(client_id);

alter table client_users enable row level security;
alter table client_modules enable row level security;

-- Mesmo padrão do resto do banco (014_rls_hardening.sql): service role
-- (usado pelo admin client em rotas de servidor/seed) tem acesso total.
create policy "service role all" on client_users for all to service_role using (true);
create policy "service role all" on client_modules for all to service_role using (true);

-- Usuário autenticado (cliente logado) só lê a própria linha e os
-- módulos do próprio client_id -- é a primeira vez que uma policy
-- `to authenticated` existe nesse banco, porque é a primeira vez que
-- alguém além do Júnior loga de verdade via Supabase Auth.
create policy "self read" on client_users for select to authenticated
  using (auth_user_id = auth.uid());

create policy "own client modules" on client_modules for select to authenticated
  using (
    client_id in (select client_id from client_users where auth_user_id = auth.uid())
  );

-- === Seed manual do primeiro cliente de teste (não faz parte da migration) ===
--
-- 1. Criar o cliente (se ainda não existir uma linha pra ele em `clients`):
--    insert into clients (name, status) values ('Empresa Teste', 'active')
--    returning id;  -- guarda esse id
--
-- 2. Criar o usuário no Supabase Auth: Dashboard → Authentication → Users →
--    "Add user" (email + senha, marcar "Auto Confirm User"). Copia o UUID
--    gerado.
--
-- 3. Linkar os dois:
--    insert into client_users (auth_user_id, client_id)
--    values ('<uuid do auth user>', '<id do cliente>');
--
-- 4. Habilitar módulos pra ele testar (chaves em lib/modules.ts):
--    insert into client_modules (client_id, module_key, enabled) values
--      ('<id do cliente>', 'briefing', true),
--      ('<id do cliente>', 'relatorios', true);

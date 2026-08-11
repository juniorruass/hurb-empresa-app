-- Cliente autenticado precisa ler o próprio nome em `clients` -- sem
-- isso, lib/clients/session.ts cai no fallback "Cliente" genérico
-- (RLS de 014_rls_hardening.sql restringe `clients` só a service_role,
-- de antes de existir login de cliente de verdade).
create policy "self read own client" on clients for select to authenticated
  using (
    id in (select client_id from client_users where auth_user_id = auth.uid())
  );

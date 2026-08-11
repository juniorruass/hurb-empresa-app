-- financeiro_payments já existe (criada no Hurb pessoal, migration
-- 003_financeiro_mrr.sql, tem client_id FK) mas só tinha policy pra
-- service_role. Falta a leitura do próprio cliente no hub-empresas.
create policy "own payments" on financeiro_payments for select to authenticated
  using (client_id in (select client_id from client_users where auth_user_id = auth.uid()));

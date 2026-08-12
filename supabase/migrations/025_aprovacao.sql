alter table content_requests
  add column if not exists status text not null default 'pendente'
    check (status in ('pendente','aprovado','ajuste_solicitado')),
  add column if not exists comentario text;

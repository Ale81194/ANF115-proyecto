-- El rol interno necesita leer la empresa para bloquearla y revalidar el
-- contexto antes de una mutacion. La politica de UPDATE no cubre SELECT.
create policy empresas_rpc_select
  on public.empresas
  for select
  to finanzas_rpc
  using (true);

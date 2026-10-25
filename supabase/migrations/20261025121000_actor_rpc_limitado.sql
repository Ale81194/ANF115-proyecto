-- Supabase owns auth schema; postgres cannot always delegate its USAGE grant.
-- Resolve the current JWT actor through a private, narrowly scoped helper.
create function private.anf_actor() returns uuid language sql stable security definer set search_path='' as $$
  select auth.uid()
$$;
revoke all on function private.anf_actor() from public,anon;
grant execute on function private.anf_actor() to anf_writer,authenticated;

create or replace function public.anf_guardar_movimiento(p_tipo text,p_id uuid,p_revision integer,p_solicitud uuid,
  p_fecha date,p_concepto text,p_monto text,p_categoria uuid,p_referencia text) returns uuid
language plpgsql security definer set search_path='' as $$
declare t text; rid uuid; previo record; actor uuid:=private.anf_actor();
begin
  if private.anf_rol() is null then raise exception 'Sin permiso' using errcode='42501'; end if;
  if p_tipo not in ('ingreso','gasto') or p_tipo is null or p_monto is null
    or p_monto!~'^(0|[1-9][0-9]{0,11})(\.[0-9]{1,2})?$' then raise exception 'Entrada inválida' using errcode='22023'; end if;
  t:=case p_tipo when 'ingreso' then 'ingresos' else 'gastos' end;
  if p_id is null then
    perform pg_advisory_xact_lock(hashtextextended(actor::text||p_solicitud::text,0));
    execute format('select * from public.%I where creado_por=$1 and solicitud_id=$2',t) into previo using actor,p_solicitud;
    if previo.id is not null then
      if previo.fecha<>p_fecha or previo.concepto<>btrim(p_concepto) or previo.monto<>p_monto::numeric
        or previo.categoria_id<>p_categoria or previo.referencia is distinct from nullif(btrim(p_referencia),'') then
        raise exception 'Solicitud reutilizada con otro contenido' using errcode='23505'; end if;
      return previo.id;
    end if;
    execute format('insert into public.%I(fecha,concepto,monto,categoria_id,referencia,solicitud_id)
      values($1,btrim($2),$3::numeric,$4,nullif(btrim($5),''''),$6) returning id',t)
      into rid using p_fecha,p_concepto,p_monto,p_categoria,p_referencia,p_solicitud;
  else
    execute format('update public.%I set fecha=$1,concepto=btrim($2),monto=$3::numeric,categoria_id=$4,referencia=nullif(btrim($5),'''')
      where id=$6 and revision=$7 and estado=''vigente'' returning id',t)
      into rid using p_fecha,p_concepto,p_monto,p_categoria,p_referencia,p_id,p_revision;
    if rid is null then raise exception 'Registro no disponible o revisión obsoleta' using errcode='40001'; end if;
  end if;
  return rid;
end $$;

create function private.anf_bitacora_inmutable() returns trigger language plpgsql set search_path='' as $$
begin raise exception 'La bitácora no se modifica ni se elimina' using errcode='42501'; end $$;
revoke all on function private.anf_bitacora_inmutable() from public,anon,authenticated;
create trigger anf_bitacora_inmutable before update or delete on public.bitacora
for each row execute function private.anf_bitacora_inmutable();
notify pgrst,'reload schema';

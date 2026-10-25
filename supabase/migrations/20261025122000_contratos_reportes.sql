-- Compatibility with the three invoker report contracts from context 02.
-- All financial formulas remain centralized in anf_reporte.
create function public.resumen_financiero(p_desde date,p_hasta date) returns jsonb
language sql stable security invoker set search_path='' as $$
  select (public.anf_reporte(p_desde,p_hasta)->'resumen') || jsonb_build_object(
    'desde',p_desde,'hasta',p_hasta,'moneda','USD',
    'cantidad_ingresos',(select count(*) from public.v_movimientos where tipo='ingreso' and estado='vigente' and fecha between p_desde and p_hasta),
    'cantidad_gastos',(select count(*) from public.v_movimientos where tipo='gasto' and estado='vigente' and fecha between p_desde and p_hasta))
$$;
create function public.reporte_movimientos(p_desde date,p_hasta date,p_categoria_id uuid default null,p_tipo text default null)
returns table(id uuid,tipo text,fecha date,concepto text,monto text,categoria_id uuid,codigo_categoria text,categoria text,creado_por uuid)
language plpgsql stable security invoker set search_path='' as $$
begin
  -- The shared report validates authorization and the full filter range.
  perform public.anf_reporte(p_desde,p_hasta,p_categoria_id,p_tipo);
  return query select m.id,m.tipo,m.fecha,m.concepto,m.monto,m.categoria_id,c.codigo,m.categoria,m.creado_por
    from public.v_movimientos m join public.categorias c on c.id=m.categoria_id
    where m.estado='vigente' and m.fecha between p_desde and p_hasta
      and (p_categoria_id is null or m.categoria_id=p_categoria_id) and (p_tipo is null or m.tipo=p_tipo)
    order by m.fecha,m.id;
end $$;
create function public.reporte_periodico(p_desde date,p_hasta date,p_granularidad text default 'mes')
returns table(periodo date,ingresos text,gastos text,resultado text,porcentaje_gastos text)
language sql stable security invoker set search_path='' as $$
  select r.periodo,r.ingresos,r.gastos,r.resultado,r.porcentaje_gastos
    from jsonb_to_recordset(public.anf_reporte(p_desde,p_hasta,null,null,p_granularidad)->'periodos')
      as r(periodo date,ingresos text,gastos text,resultado text,porcentaje_gastos text)
$$;
revoke all on function public.resumen_financiero(date,date),public.reporte_movimientos(date,date,uuid,text),
  public.reporte_periodico(date,date,text) from public,anon;
grant execute on function public.resumen_financiero(date,date),public.reporte_movimientos(date,date,uuid,text),
  public.reporte_periodico(date,date,text) to authenticated;

-- Reject malformed retries before checking their prior content.
create or replace function public.anf_guardar_movimiento(p_tipo text,p_id uuid,p_revision integer,p_solicitud uuid,
  p_fecha date,p_concepto text,p_monto text,p_categoria uuid,p_referencia text) returns uuid
language plpgsql security definer set search_path='' as $$
declare t text; rid uuid; previo record; actor uuid:=private.anf_actor();
begin
  if private.anf_rol() is null then raise exception 'Sin permiso' using errcode='42501'; end if;
  if p_fecha is null or not isfinite(p_fecha) or p_concepto is null or length(btrim(p_concepto)) not between 2 and 250
    or p_categoria is null or p_solicitud is null or length(coalesce(p_referencia,''))>120
    or p_tipo is null or p_tipo not in ('ingreso','gasto') or p_monto is null
    or p_monto!~'^(0|[1-9][0-9]{0,11})(\.[0-9]{1,2})?$'
    or (p_id is not null and (p_revision is null or p_revision<1)) then
    raise exception 'Entrada inválida' using errcode='22023';
  end if;
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

-- Preserve exact monetary strings in all newly appended audit events.
create or replace function private.anf_auditar() returns trigger language plpgsql security definer set search_path='' as $$
declare n jsonb:=to_jsonb(new); anterior jsonb; a text:=tg_op;
begin
  if n ? 'monto' then n:=jsonb_set(n,'{monto}',to_jsonb(n->>'monto')); end if;
  if tg_op='UPDATE' then
    anterior:=to_jsonb(old);
    if anterior ? 'monto' then anterior:=jsonb_set(anterior,'{monto}',to_jsonb(anterior->>'monto')); end if;
    if n->>'estado'='anulado' then a:='ANULAR'; end if;
  end if;
  insert into public.bitacora(actor_id,accion,entidad,registro_id,motivo,antes,despues)
    values(auth.uid(),a,tg_table_name,coalesce(n->>'id',n->>'usuario_id')::uuid,n->>'motivo_anulacion',anterior,n);
  return new;
end $$;
notify pgrst,'reload schema';

-- Local scope replacement. Preserves the previous application tables and Auth.
-- Apply with migration up, never by resetting a database containing user data.
create schema archivo_anf_20261025;
revoke all on schema archivo_anf_20261025 from public, anon, authenticated, service_role;
do $$
declare t text; f record;
begin
  foreach t in array array['empresas','perfiles','roles','permisos','rol_permisos',
    'membresias_empresa','auditoria','rubros_financieros','cuentas','periodos','politicas_calculo']
  loop
    execute format('alter table public.%I set schema archivo_anf_20261025', t);
  end loop;
  for f in select p.oid::regprocedure as firma from pg_proc p
    join pg_namespace n on n.oid=p.pronamespace where n.nspname='public'
    and p.proname in ('mis_permisos','guardar_cuenta','crear_periodo','crear_perfil_nuevo_usuario')
  loop
    execute format('revoke all on function %s from public, anon, authenticated, service_role', f.firma);
  end loop;
end $$;
revoke all on all tables in schema archivo_anf_20261025 from public, anon, authenticated, service_role;
drop trigger if exists on_auth_user_created on auth.users;

do $$ begin
  if not exists(select 1 from pg_roles where rolname='anf_writer') then
    create role anf_writer nologin noinherit;
  end if;
end $$;
grant anf_writer to postgres;
grant usage on schema public, private, auth to anf_writer;
grant execute on function auth.uid() to anf_writer;
grant usage on schema private to authenticated;

create table public.perfiles (
  usuario_id uuid primary key references auth.users(id) on delete restrict,
  nombre text not null check (length(btrim(nombre)) between 2 and 120),
  rol text not null default 'empleado' check(rol in ('administrador','empleado')),
  activo boolean not null default false,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);
create table public.categorias (
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null check(codigo ~ '^[IG][0-9]{2,4}$'),
  nombre text not null check(length(btrim(nombre)) between 2 and 100),
  tipo text not null check(tipo in ('ingreso','gasto')),
  descripcion text not null default '' check(length(descripcion)<=500),
  activo boolean not null default true,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  check(left(codigo,1)=case tipo when 'ingreso' then 'I' else 'G' end)
);
create unique index categorias_nombre_tipo on public.categorias(tipo,lower(btrim(nombre)));

create table public.ingresos (
  id uuid primary key default gen_random_uuid(),
  fecha date not null check(isfinite(fecha)),
  concepto text not null check(length(btrim(concepto)) between 2 and 250),
  monto numeric not null check(monto>0 and monto<=999999999999.99 and scale(monto)<=2),
  categoria_id uuid not null references public.categorias(id) on delete restrict,
  referencia text check(length(referencia)<=120),
  estado text not null default 'vigente' check(estado in ('vigente','anulado')),
  creado_por uuid not null default auth.uid() references public.perfiles(usuario_id),
  creado_en timestamptz not null default now(),
  actualizado_por uuid references public.perfiles(usuario_id),
  actualizado_en timestamptz not null default now(),
  revision integer not null default 1 check(revision>0),
  solicitud_id uuid not null,
  motivo_anulacion text check(length(motivo_anulacion)<=500),
  anulado_por uuid references public.perfiles(usuario_id),
  anulado_en timestamptz,
  unique(creado_por,solicitud_id),
  check((estado='vigente' and motivo_anulacion is null and anulado_por is null and anulado_en is null)
    or (estado='anulado' and motivo_anulacion is not null and length(btrim(motivo_anulacion))>=5
      and anulado_por is not null and anulado_en is not null))
);
create table public.gastos (like public.ingresos including all);
alter table public.gastos add foreign key(categoria_id) references public.categorias(id),
  add foreign key(creado_por) references public.perfiles(usuario_id),
  add foreign key(actualizado_por) references public.perfiles(usuario_id),
  add foreign key(anulado_por) references public.perfiles(usuario_id);
create table public.bitacora (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.perfiles(usuario_id),
  fecha_hora timestamptz not null default clock_timestamp(),
  accion text not null check(accion in ('INSERT','UPDATE','ANULAR','MIGRACION')),
  entidad text not null,
  registro_id uuid,
  motivo text,
  antes jsonb,
  despues jsonb
);

-- Existing identities keep their names but must be explicitly activated.
insert into public.perfiles(usuario_id,nombre)
select id, left(coalesce(nullif(btrim(nombre_visible),''),'Usuario pendiente'),120)
from archivo_anf_20261025.perfiles;

create function private.anf_rol() returns text language sql stable security definer set search_path='' as $$
  select rol from public.perfiles where usuario_id=(select auth.uid()) and activo
$$;
revoke all on function private.anf_rol() from public,anon;
grant execute on function private.anf_rol() to authenticated,anf_writer;

create function private.anf_alta_perfil() returns trigger language plpgsql security definer set search_path='' as $$
begin
  insert into public.perfiles(usuario_id,nombre) values(new.id,
    left(coalesce(nullif(btrim(new.raw_user_meta_data->>'nombre'),''),'Usuario pendiente'),120));
  return new;
end $$;
revoke all on function private.anf_alta_perfil() from public,anon,authenticated;
create trigger anf_alta_perfil after insert on auth.users for each row execute function private.anf_alta_perfil();

create function private.anf_auditar() returns trigger language plpgsql security definer set search_path='' as $$
declare n jsonb:=to_jsonb(new); a text:=tg_op;
begin
  if tg_op='UPDATE' and n->>'estado'='anulado' then a:='ANULAR'; end if;
  insert into public.bitacora(actor_id,accion,entidad,registro_id,motivo,antes,despues)
  values(auth.uid(),a,tg_table_name,coalesce(n->>'id',n->>'usuario_id')::uuid,
    n->>'motivo_anulacion',case when tg_op='UPDATE' then to_jsonb(old) end,n);
  return new;
end $$;
revoke all on function private.anf_auditar() from public,anon,authenticated;

create function private.anf_validar() returns trigger language plpgsql security definer set search_path='' as $$
declare c public.categorias; r text:=private.anf_rol();
begin
  if tg_table_name in ('ingresos','gastos') then
    if r is null then raise exception 'Cuenta no autorizada' using errcode='42501'; end if;
    if tg_op='UPDATE' then
      if old.estado='anulado' then raise exception 'Registro anulado' using errcode='23514'; end if;
      if old.creado_por<>auth.uid() and r<>'administrador' then raise exception 'No disponible' using errcode='42501'; end if;
      if new.id<>old.id or new.creado_por<>old.creado_por or new.solicitud_id<>old.solicitud_id
        or new.creado_en<>old.creado_en then raise exception 'Origen inmutable' using errcode='23514'; end if;
      new.revision:=old.revision+1;
    else
      if new.creado_por<>auth.uid() or new.estado<>'vigente' then raise exception 'Origen no autorizado' using errcode='42501'; end if;
      new.revision:=1; new.creado_en:=clock_timestamp();
    end if;
    if tg_op='INSERT' or new.categoria_id<>old.categoria_id then
      select * into c from public.categorias where id=new.categoria_id for share;
      if not found or not c.activo or c.tipo<>(case tg_table_name when 'ingresos' then 'ingreso' else 'gasto' end)
        then raise exception 'Categoría incompatible o inactiva' using errcode='23514'; end if;
    end if;
    if new.estado='anulado' then
      new.anulado_por:=auth.uid();new.anulado_en:=clock_timestamp();
    end if;
    new.actualizado_por:=auth.uid();
  elsif tg_table_name='categorias' then
    if r is distinct from 'administrador' then raise exception 'Sin permiso' using errcode='42501'; end if;
    if tg_op='UPDATE' and (new.codigo<>old.codigo or new.tipo<>old.tipo) and
      (exists(select 1 from public.ingresos where categoria_id=old.id) or exists(select 1 from public.gastos where categoria_id=old.id))
      then raise exception 'Categoría utilizada: código y tipo inmutables' using errcode='23514'; end if;
  elsif tg_table_name='perfiles' then
    if new.usuario_id<>old.usuario_id or new.creado_en<>old.creado_en then raise exception 'Identidad inmutable'; end if;
    if r is distinct from 'administrador' and not (auth.uid() is null and session_user in ('postgres','supabase_admin'))
      then raise exception 'Sin permiso' using errcode='42501'; end if;
    perform pg_advisory_xact_lock(742061,1);
    if old.rol='administrador' and old.activo and (new.rol<>'administrador' or not new.activo)
      and not exists(select 1 from public.perfiles where usuario_id<>old.usuario_id and rol='administrador' and activo)
      then raise exception 'Debe permanecer un administrador activo' using errcode='23514'; end if;
  end if;
  new.actualizado_en:=clock_timestamp(); return new;
end $$;
revoke all on function private.anf_validar() from public,anon,authenticated;

-- Seed before category guards. No financial movements are fabricated.
insert into public.categorias(codigo,nombre,tipo) values
('I01','Ventas de pan dulce','ingreso'),('I02','Ventas de pan francés','ingreso'),
('I03','Ventas de repostería','ingreso'),('I04','Ventas de pan integral','ingreso'),
('I05','Ventas de galletas','ingreso'),('I06','Pedidos especiales','ingreso'),
('G01','Ingredientes','gasto'),('G02','Empaques','gasto'),('G03','Gas de producción','gasto'),
('G04','Energía eléctrica','gasto'),('G05','Agua','gasto'),('G06','Alquiler','gasto'),
('G07','Pagos de personal','gasto'),('G08','Transporte','gasto'),('G09','Suministros','gasto'),
('G10','Limpieza','gasto'),('G11','Mantenimiento de equipos','gasto'),
('G12','Mantenimiento del local','gasto'),('G13','Publicidad','gasto'),
('G14','Telefonía e internet','gasto'),('G15','Comisiones de cobro','gasto'),
('G16','Permisos y tasas','gasto'),('G17','Seguros','gasto'),
('G18','Servicios profesionales','gasto'),('G19','Uniformes y protección','gasto'),
('G20','Otros gastos operativos','gasto');

do $$ declare t text; begin
  foreach t in array array['perfiles','categorias','ingresos','gastos','bitacora'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('revoke all on public.%I from public,anon,authenticated',t);
    execute format('grant select on public.%I to authenticated,anf_writer',t);
    if t<>'bitacora' then
      execute format('create trigger anf_auditar after insert or update on public.%I for each row execute function private.anf_auditar()',t);
      execute format('create trigger anf_validar before %s on public.%I for each row execute function private.anf_validar()',
        case when t='perfiles' then 'update' else 'insert or update' end,t);
    end if;
  end loop;
end $$;
grant insert,update on public.ingresos,public.gastos,public.categorias to anf_writer;
grant update(nombre,rol,activo) on public.perfiles to anf_writer;

create policy perfiles_leer on public.perfiles for select to authenticated,anf_writer
using(usuario_id=(select auth.uid()) or (select private.anf_rol())='administrador');
create policy perfiles_editar on public.perfiles for update to anf_writer
using((select private.anf_rol())='administrador') with check((select private.anf_rol())='administrador');
create policy categorias_leer on public.categorias for select to authenticated,anf_writer
using((select private.anf_rol()) is not null and (activo or (select private.anf_rol())='administrador'
  or exists(select 1 from public.ingresos where categoria_id=categorias.id and creado_por=(select auth.uid()))
  or exists(select 1 from public.gastos where categoria_id=categorias.id and creado_por=(select auth.uid()))));
create policy categorias_escribir on public.categorias for all to anf_writer
using((select private.anf_rol())='administrador') with check((select private.anf_rol())='administrador');
create policy bitacora_leer on public.bitacora for select to authenticated,anf_writer
using((select private.anf_rol())='administrador');
do $$ declare t text; begin
  foreach t in array array['ingresos','gastos'] loop
    execute format('create policy leer on public.%I for select to authenticated,anf_writer using
      ((select private.anf_rol()) is not null and (creado_por=(select auth.uid()) or (select private.anf_rol())=''administrador''))',t);
    execute format('create policy insertar on public.%I for insert to anf_writer with check
      ((select private.anf_rol()) is not null and creado_por=(select auth.uid()) and estado=''vigente'')',t);
    execute format('create policy editar on public.%I for update to anf_writer using
      ((select private.anf_rol()) is not null and estado=''vigente'' and (creado_por=(select auth.uid()) or (select private.anf_rol())=''administrador''))
      with check ((select private.anf_rol()) is not null and (creado_por=(select auth.uid()) or (select private.anf_rol())=''administrador''))',t);
    execute format('create index on public.%I(creado_por,fecha,id)',t);
    execute format('create index on public.%I(fecha,id) where estado=''vigente''',t);
    execute format('create index on public.%I(categoria_id)',t);
    execute format('create index on public.%I(actualizado_por)',t);
    execute format('create index on public.%I(anulado_por)',t);
  end loop;
end $$;
create index on public.bitacora(fecha_hora desc,id);
create index on public.bitacora(actor_id);

create view public.v_movimientos with(security_invoker=true) as
select i.id,'ingreso'::text tipo,i.fecha,i.concepto,i.monto::text monto,i.categoria_id,c.nombre categoria,
  i.referencia,i.estado,i.creado_por,i.revision,i.motivo_anulacion from public.ingresos i join public.categorias c on c.id=i.categoria_id
union all
select g.id,'gasto'::text,g.fecha,g.concepto,g.monto::text,g.categoria_id,c.nombre,
  g.referencia,g.estado,g.creado_por,g.revision,g.motivo_anulacion from public.gastos g join public.categorias c on c.id=g.categoria_id;
revoke all on public.v_movimientos from public,anon;
grant select on public.v_movimientos to authenticated,anf_writer;

create function public.anf_guardar_movimiento(p_tipo text,p_id uuid,p_revision integer,p_solicitud uuid,
  p_fecha date,p_concepto text,p_monto text,p_categoria uuid,p_referencia text) returns uuid
language plpgsql security definer set search_path='' as $$
declare t text; rid uuid; previo record;
begin
  if private.anf_rol() is null then raise exception 'Sin permiso' using errcode='42501'; end if;
  if p_tipo not in ('ingreso','gasto') or p_tipo is null or p_monto is null
    or p_monto!~'^(0|[1-9][0-9]{0,11})(\.[0-9]{1,2})?$' then raise exception 'Entrada inválida' using errcode='22023'; end if;
  t:=case p_tipo when 'ingreso' then 'ingresos' else 'gastos' end;
  if p_id is null then
    perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text||p_solicitud::text,0));
    execute format('select * from public.%I where creado_por=$1 and solicitud_id=$2',t) into previo using auth.uid(),p_solicitud;
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
create function public.anf_anular_movimiento(p_tipo text,p_id uuid,p_revision integer,p_motivo text) returns uuid
language plpgsql security definer set search_path='' as $$
declare t text; rid uuid;
begin
  if private.anf_rol() is null then raise exception 'Sin permiso' using errcode='42501'; end if;
  if p_tipo is null or p_tipo not in ('ingreso','gasto') or length(btrim(coalesce(p_motivo,''))) not between 5 and 500 then
    raise exception 'Motivo o tipo inválido' using errcode='22023'; end if;
  t:=case p_tipo when 'ingreso' then 'ingresos' else 'gastos' end;
  execute format('update public.%I set estado=''anulado'',motivo_anulacion=btrim($1)
    where id=$2 and revision=$3 and estado=''vigente'' returning id',t) into rid using p_motivo,p_id,p_revision;
  if rid is null then raise exception 'Registro no disponible o revisión obsoleta' using errcode='40001'; end if;
  return rid;
end $$;

create function public.anf_guardar_categoria(p_id uuid,p_version timestamptz,p_codigo text,p_nombre text,p_tipo text,p_descripcion text,p_activo boolean)
returns uuid language plpgsql security definer set search_path='' as $$
declare rid uuid;
begin
  if private.anf_rol() is distinct from 'administrador' then raise exception 'Sin permiso' using errcode='42501'; end if;
  if p_id is null then
    insert into public.categorias(codigo,nombre,tipo,descripcion,activo)
    values(p_codigo,btrim(p_nombre),p_tipo,p_descripcion,p_activo) returning id into rid;
  else
    update public.categorias set codigo=p_codigo,nombre=btrim(p_nombre),tipo=p_tipo,descripcion=p_descripcion,activo=p_activo
    where id=p_id and actualizado_en=p_version returning id into rid;
    if rid is null then raise exception 'Revisión obsoleta' using errcode='40001'; end if;
  end if;
  return rid;
end $$;
create function public.anf_guardar_perfil(p_id uuid,p_version timestamptz,p_nombre text,p_rol text,p_activo boolean)
returns uuid language plpgsql security definer set search_path='' as $$
declare rid uuid;
begin
  if private.anf_rol() is distinct from 'administrador' then raise exception 'Sin permiso' using errcode='42501'; end if;
  perform pg_advisory_xact_lock(742061,1);
  update public.perfiles set nombre=btrim(p_nombre),rol=p_rol,activo=p_activo
  where usuario_id=p_id and actualizado_en=p_version returning usuario_id into rid;
  if rid is null then raise exception 'Revisión obsoleta' using errcode='40001'; end if;
  return rid;
end $$;

-- Full-filter aggregation with string money, including optional category/type.
create function public.anf_reporte(p_desde date,p_hasta date,p_categoria uuid default null,p_tipo text default null,p_granularidad text default 'mes')
returns jsonb language plpgsql stable security invoker set search_path='' as $$
declare result jsonb; unidad text; paso interval;
begin
  if private.anf_rol() is null then raise exception 'Sin permiso' using errcode='42501'; end if;
  if p_desde is null or p_hasta is null or not isfinite(p_desde) or not isfinite(p_hasta)
    or p_desde>p_hasta or p_hasta-p_desde>3660 or p_granularidad is null or p_granularidad not in ('dia','mes','anio')
    or (p_tipo is not null and p_tipo not in ('ingreso','gasto')) then raise exception 'Filtros inválidos' using errcode='22023'; end if;
  unidad:=case p_granularidad when 'dia' then 'day' when 'mes' then 'month' else 'year' end;
  paso:=case p_granularidad when 'dia' then interval '1 day' when 'mes' then interval '1 month' else interval '1 year' end;
  with filtrados as (
    select * from public.v_movimientos where estado='vigente' and fecha between p_desde and p_hasta
      and (p_categoria is null or categoria_id=p_categoria) and (p_tipo is null or tipo=p_tipo)
  ), totales as (
    select coalesce(sum(monto::numeric) filter(where tipo='ingreso'),0) i,
      coalesce(sum(monto::numeric) filter(where tipo='gasto'),0) g,count(*) n from filtrados
  ), series as (
    select generate_series(date_trunc(unidad,p_desde::timestamp),date_trunc(unidad,p_hasta::timestamp),paso)::date periodo
  ), grupos as (
    select date_trunc(unidad,fecha::timestamp)::date periodo,
      coalesce(sum(monto::numeric) filter(where tipo='ingreso'),0) i,
      coalesce(sum(monto::numeric) filter(where tipo='gasto'),0) g,count(*) n from filtrados group by 1
  ) select jsonb_build_object(
    'resumen',(select jsonb_build_object('ingresos',i::text,'gastos',g::text,'resultado',(i-g)::text,
      'porcentaje_gastos',case when i>0 then round(g/i*100,2)::text else null end,'cantidad',n) from totales),
    'periodos',(select coalesce(jsonb_agg(jsonb_build_object('periodo',s.periodo,'ingresos',coalesce(g.i,0)::text,
      'gastos',coalesce(g.g,0)::text,'resultado',(coalesce(g.i,0)-coalesce(g.g,0))::text,
      'porcentaje_gastos',case when g.i>0 then round(g.g/g.i*100,2)::text else null end,'cantidad',coalesce(g.n,0)) order by s.periodo),'[]'::jsonb)
      from series s left join grupos g using(periodo)),
    'categorias',(select coalesce(jsonb_agg(to_jsonb(d)),'[]'::jsonb) from (
      select categoria,sum(monto::numeric)::text monto from filtrados where tipo='gasto' group by categoria order by categoria) d)
  ) into result;
  return result;
end $$;

-- The definer role is narrowly scoped and still subject to RLS.
do $$ declare f record; begin
  for f in select p.oid::regprocedure firma,p.proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname in ('anf_guardar_movimiento','anf_anular_movimiento','anf_guardar_categoria','anf_guardar_perfil','anf_reporte')
  loop
    execute format('revoke all on function %s from public,anon',f.firma);
    execute format('grant execute on function %s to authenticated',f.firma);
    if f.proname<>'anf_reporte' then
      grant create on schema public to anf_writer;
      execute format('alter function %s owner to anf_writer',f.firma);
      revoke create on schema public from anf_writer;
    end if;
  end loop;
end $$;
insert into public.bitacora(accion,entidad,motivo)
values('MIGRACION','sistema','Siete módulos locales; esquema anterior conservado sin acceso API.');
notify pgrst,'reload schema';

-- Fase 01 - catalogo, periodos, politicas y RPC estrechas de escritura.
-- DML directo revocado: las mutaciones pasan por funciones con permisos.

create table public.rubros_financieros (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas (id) on delete cascade,
  codigo text not null check (codigo ~ '^[A-Z0-9_]+$'),
  nombre text not null check (length(btrim(nombre)) between 1 and 120),
  estado_financiero text not null check (estado_financiero in ('resultados', 'balance', 'patrimonio')),
  padre_id uuid,
  signo_presentacion smallint not null default 1 check (signo_presentacion in (-1, 1)),
  version integer not null default 1 check (version >= 1),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  unique (empresa_id, codigo),
  unique (empresa_id, id),
  constraint rubros_padre_fk
    foreign key (empresa_id, padre_id)
    references public.rubros_financieros (empresa_id, id)
    on delete restrict
);

create table public.cuentas (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas (id) on delete cascade,
  codigo text not null check (
    codigo ~ '^[0-9A-Za-z._-]+$'
    and length(codigo) between 1 and 40
  ),
  nombre text not null check (length(btrim(nombre)) between 1 and 160),
  padre_id uuid,
  clase text not null check (clase in ('activo', 'pasivo', 'patrimonio', 'ingreso', 'gasto')),
  naturaleza text not null check (naturaleza in ('deudora', 'acreedora')),
  rubro_id uuid not null,
  es_correctora boolean not null default false,
  permite_movimiento boolean not null default true,
  activa boolean not null default true,
  vigencia_desde date not null default date '2024-01-01',
  vigencia_hasta date,
  version integer not null default 1 check (version >= 1),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  unique (empresa_id, codigo),
  unique (empresa_id, id),
  constraint cuentas_padre_fk
    foreign key (empresa_id, padre_id)
    references public.cuentas (empresa_id, id)
    on delete restrict,
  constraint cuentas_rubro_fk
    foreign key (empresa_id, rubro_id)
    references public.rubros_financieros (empresa_id, id)
    on delete restrict,
  constraint cuentas_vigencia_chk
    check (vigencia_hasta is null or vigencia_hasta >= vigencia_desde)
);

create table public.periodos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas (id) on delete cascade,
  anio integer not null check (anio between 2000 and 2100),
  mes integer not null check (mes between 1 and 12),
  inicio date not null,
  fin date not null,
  estado text not null default 'abierto' check (estado in ('abierto', 'cerrado')),
  revision integer not null default 1 check (revision >= 1),
  siguiente_numero_asiento integer not null default 1 check (siguiente_numero_asiento >= 1),
  version integer not null default 1 check (version >= 1),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  unique (empresa_id, anio, mes),
  unique (empresa_id, id),
  constraint periodos_inicio_chk check (inicio = make_date(anio, mes, 1)),
  constraint periodos_fin_chk check (
    fin = (make_date(anio, mes, 1) + interval '1 month - 1 day')::date
  )
);

create table public.politicas_calculo (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas (id) on delete cascade,
  codigo text not null check (codigo ~ '^[A-Z0-9-]+$'),
  version integer not null check (version >= 1),
  parametros jsonb not null,
  hash text not null check (length(hash) between 1 and 128),
  publicada_en timestamptz not null default now(),
  creada_por uuid references auth.users (id) on delete set null,
  unique (empresa_id, codigo, version),
  unique (empresa_id, id)
);

create index cuentas_empresa_padre_idx
  on public.cuentas (empresa_id, padre_id);
create index cuentas_empresa_rubro_idx
  on public.cuentas (empresa_id, rubro_id);
create index cuentas_empresa_movimiento_idx
  on public.cuentas (empresa_id, permite_movimiento, activa);
create index periodos_empresa_anio_mes_idx
  on public.periodos (empresa_id, anio desc, mes desc);
create index rubros_empresa_estado_idx
  on public.rubros_financieros (empresa_id, estado_financiero);

alter table public.rubros_financieros enable row level security;
alter table public.cuentas enable row level security;
alter table public.periodos enable row level security;
alter table public.politicas_calculo enable row level security;

revoke all on table public.rubros_financieros from anon, authenticated;
revoke all on table public.cuentas from anon, authenticated;
revoke all on table public.periodos from anon, authenticated;
revoke all on table public.politicas_calculo from anon, authenticated;

grant select on table public.rubros_financieros to authenticated;
grant select on table public.cuentas to authenticated;
grant select on table public.periodos to authenticated;
grant select on table public.politicas_calculo to authenticated;

grant select on table public.rubros_financieros to finanzas_rpc;
grant select, insert, update on table public.cuentas to finanzas_rpc;
grant select, insert on table public.periodos to finanzas_rpc;
grant select, update on table public.empresas to finanzas_rpc;

create policy rubros_select
  on public.rubros_financieros
  for select
  to authenticated
  using (private.tiene_membresia(empresa_id));

create policy cuentas_select
  on public.cuentas
  for select
  to authenticated
  using (private.tiene_membresia(empresa_id));

create policy periodos_select
  on public.periodos
  for select
  to authenticated
  using (private.tiene_membresia(empresa_id));

create policy politicas_select
  on public.politicas_calculo
  for select
  to authenticated
  using (private.tiene_membresia(empresa_id));

create policy rubros_rpc_select
  on public.rubros_financieros
  for select
  to finanzas_rpc
  using (true);

create policy cuentas_rpc_all
  on public.cuentas
  for all
  to finanzas_rpc
  using (true)
  with check (true);

create policy periodos_rpc_all
  on public.periodos
  for all
  to finanzas_rpc
  using (true)
  with check (true);

create or replace function public.guardar_cuenta(
  p_empresa_id uuid,
  p_cuenta_id uuid,
  p_codigo text,
  p_nombre text,
  p_padre_id uuid,
  p_clase text,
  p_naturaleza text,
  p_rubro_id uuid,
  p_es_correctora boolean,
  p_permite_movimiento boolean,
  p_activa boolean,
  p_vigencia_desde date,
  p_vigencia_hasta date,
  p_version_esperada integer,
  p_motivo text,
  p_request_id text,
  p_clave_idempotencia text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_cuenta public.cuentas%rowtype;
  v_rubro public.rubros_financieros%rowtype;
  v_codigo text := btrim(p_codigo);
  v_nombre text := btrim(p_nombre);
  v_clave text := nullif(btrim(p_clave_idempotencia), '');
  v_hash text;
  v_payload jsonb;
  v_resultado jsonb;
  v_idempotente private.operaciones_idempotentes%rowtype;
  v_version_anterior integer;
  v_version_nueva integer;
  v_revision_catalogo integer;
  v_padre_actual uuid;
  v_paso integer := 0;
begin
  if v_actor is null then
    return jsonb_build_object(
      'ok', false,
      'codigo', 'NO_AUTENTICADO',
      'mensaje', 'Tu sesion no es valida. Inicia sesion nuevamente.'
    );
  end if;

  if not private.tiene_permiso(p_empresa_id, 'catalogo.publicar') then
    return jsonb_build_object(
      'ok', false,
      'codigo', 'PERMISO_DENEGADO',
      'mensaje', 'No tenes permiso para publicar el catalogo.'
    );
  end if;

  perform 1
  from public.empresas e
  where e.id = p_empresa_id
  for update;

  if not found then
    return jsonb_build_object(
      'ok', false,
      'codigo', 'RECURSO_NO_ENCONTRADO',
      'mensaje', 'La empresa no esta disponible.'
    );
  end if;

  v_payload := jsonb_build_object(
    'empresaId', p_empresa_id,
    'cuentaId', p_cuenta_id,
    'codigo', v_codigo,
    'nombre', v_nombre,
    'padreId', p_padre_id,
    'clase', p_clase,
    'naturaleza', p_naturaleza,
    'rubroId', p_rubro_id,
    'esCorrectora', p_es_correctora,
    'permiteMovimiento', p_permite_movimiento,
    'activa', p_activa,
    'vigenciaDesde', p_vigencia_desde,
    'vigenciaHasta', p_vigencia_hasta,
    'versionEsperada', p_version_esperada,
    'motivo', p_motivo
  );
  v_hash := md5(v_payload::text);

  if v_clave is not null then
    select *
    into v_idempotente
    from private.operaciones_idempotentes oi
    where oi.empresa_id = p_empresa_id
      and oi.operacion = 'guardar_cuenta'
      and oi.clave = v_clave;

    if found then
      if v_idempotente.hash_payload <> v_hash then
        return jsonb_build_object(
          'ok', false,
          'codigo', 'IDEMPOTENCIA_CONFLICTO',
          'mensaje', 'La clave de reintento ya se uso para otra operacion.'
        );
      end if;

      return v_idempotente.resultado_json;
    end if;
  end if;

  if v_codigo is null or v_codigo = '' or length(v_codigo) > 40 then
    return jsonb_build_object(
      'ok', false,
      'codigo', 'VALIDACION_ENTRADA',
      'mensaje', 'El codigo es obligatorio y admite hasta 40 caracteres.',
      'campos', jsonb_build_array(
        jsonb_build_object(
          'ruta', 'codigo',
          'codigo', 'REQUERIDO',
          'mensaje', 'Ingresa un codigo de hasta 40 caracteres.'
        )
      )
    );
  end if;

  if v_nombre is null or v_nombre = '' or length(v_nombre) > 160 then
    return jsonb_build_object(
      'ok', false,
      'codigo', 'VALIDACION_ENTRADA',
      'mensaje', 'El nombre es obligatorio y admite hasta 160 caracteres.',
      'campos', jsonb_build_array(
        jsonb_build_object(
          'ruta', 'nombre',
          'codigo', 'REQUERIDO',
          'mensaje', 'Ingresa un nombre de hasta 160 caracteres.'
        )
      )
    );
  end if;

  if p_clase is null or p_clase not in ('activo', 'pasivo', 'patrimonio', 'ingreso', 'gasto') then
    return jsonb_build_object(
      'ok', false,
      'codigo', 'VALIDACION_ENTRADA',
      'mensaje', 'La clase de cuenta no es valida.'
    );
  end if;

  if p_naturaleza is null or p_naturaleza not in ('deudora', 'acreedora') then
    return jsonb_build_object(
      'ok', false,
      'codigo', 'VALIDACION_ENTRADA',
      'mensaje', 'La naturaleza de cuenta no es valida.'
    );
  end if;

  if p_vigencia_desde is null then
    return jsonb_build_object(
      'ok', false,
      'codigo', 'VALIDACION_ENTRADA',
      'mensaje', 'La vigencia desde es obligatoria.'
    );
  end if;

  if p_vigencia_hasta is not null and p_vigencia_hasta < p_vigencia_desde then
    return jsonb_build_object(
      'ok', false,
      'codigo', 'VALIDACION_ENTRADA',
      'mensaje', 'La vigencia hasta no puede ser anterior a la vigencia desde.'
    );
  end if;

  select *
  into v_rubro
  from public.rubros_financieros r
  where r.id = p_rubro_id
    and r.empresa_id = p_empresa_id;

  if not found then
    return jsonb_build_object(
      'ok', false,
      'codigo', 'RECURSO_NO_ENCONTRADO',
      'mensaje', 'El rubro no pertenece a la empresa.',
      'campos', jsonb_build_array(
        jsonb_build_object(
          'ruta', 'rubroId',
          'codigo', 'INVALIDO',
          'mensaje', 'Selecciona un rubro de la empresa.'
        )
      )
    );
  end if;

  if p_padre_id is not null then
    if p_cuenta_id is not null and p_padre_id = p_cuenta_id then
      return jsonb_build_object(
        'ok', false,
        'codigo', 'VALIDACION_ENTRADA',
        'mensaje', 'Una cuenta no puede ser su propio padre.'
      );
    end if;

    perform 1
    from public.cuentas c
    where c.id = p_padre_id
      and c.empresa_id = p_empresa_id;

    if not found then
      return jsonb_build_object(
        'ok', false,
        'codigo', 'RECURSO_NO_ENCONTRADO',
        'mensaje', 'La cuenta padre no pertenece a la empresa.'
      );
    end if;
  end if;

  if p_cuenta_id is null then
    insert into public.cuentas (
      empresa_id,
      codigo,
      nombre,
      padre_id,
      clase,
      naturaleza,
      rubro_id,
      es_correctora,
      permite_movimiento,
      activa,
      vigencia_desde,
      vigencia_hasta
    )
    values (
      p_empresa_id,
      v_codigo,
      v_nombre,
      p_padre_id,
      p_clase,
      p_naturaleza,
      p_rubro_id,
      coalesce(p_es_correctora, false),
      coalesce(p_permite_movimiento, true),
      coalesce(p_activa, true),
      p_vigencia_desde,
      p_vigencia_hasta
    )
    returning *
    into v_cuenta;

    v_version_anterior := null;
    v_version_nueva := 1;
  else
    select *
    into v_cuenta
    from public.cuentas c
    where c.id = p_cuenta_id
      and c.empresa_id = p_empresa_id
    for update;

    if not found then
      return jsonb_build_object(
        'ok', false,
        'codigo', 'RECURSO_NO_ENCONTRADO',
        'mensaje', 'La cuenta no esta disponible.'
      );
    end if;

    if p_version_esperada is null or p_version_esperada <> v_cuenta.version then
      return jsonb_build_object(
        'ok', false,
        'codigo', 'VERSION_OBSOLETA',
        'mensaje', 'La cuenta cambio desde que la abriste. Recarga y revisa.'
      );
    end if;

    if v_codigo <> v_cuenta.codigo then
      return jsonb_build_object(
        'ok', false,
        'codigo', 'VALIDACION_ENTRADA',
        'mensaje', 'El codigo de una cuenta existente no se edita; crea una cuenta nueva.',
        'campos', jsonb_build_array(
          jsonb_build_object(
            'ruta', 'codigo',
            'codigo', 'INMUTABLE',
            'mensaje', 'El codigo identifica la cuenta y no cambia.'
          )
        )
      );
    end if;

    v_padre_actual := p_padre_id;

    while v_padre_actual is not null loop
      if v_padre_actual = p_cuenta_id then
        return jsonb_build_object(
          'ok', false,
          'codigo', 'VALIDACION_ENTRADA',
          'mensaje', 'La jerarquia no puede formar un ciclo.'
        );
      end if;

      v_paso := v_paso + 1;

      if v_paso > 64 then
        return jsonb_build_object(
          'ok', false,
          'codigo', 'VALIDACION_ENTRADA',
          'mensaje', 'La jerarquia supera la profundidad permitida.'
        );
      end if;

      select c.padre_id
      into v_padre_actual
      from public.cuentas c
      where c.id = v_padre_actual
        and c.empresa_id = p_empresa_id;
    end loop;

    v_version_anterior := v_cuenta.version;
    v_version_nueva := v_cuenta.version + 1;

    update public.cuentas
    set
      nombre = v_nombre,
      padre_id = p_padre_id,
      clase = p_clase,
      naturaleza = p_naturaleza,
      rubro_id = p_rubro_id,
      es_correctora = coalesce(p_es_correctora, false),
      permite_movimiento = coalesce(p_permite_movimiento, true),
      activa = coalesce(p_activa, true),
      vigencia_desde = p_vigencia_desde,
      vigencia_hasta = p_vigencia_hasta,
      version = v_version_nueva,
      actualizado_en = now()
    where id = p_cuenta_id
    returning *
    into v_cuenta;
  end if;

  update public.empresas
  set
    revision_catalogo = revision_catalogo + 1,
    version = version + 1,
    actualizado_en = now()
  where id = p_empresa_id
  returning revision_catalogo
  into v_revision_catalogo;

  perform private.registrar_auditoria(
    p_empresa_id,
    case
      when p_cuenta_id is null then 'catalogo.cuenta_creada'
      else 'catalogo.cuenta_actualizada'
    end,
    'cuenta',
    v_cuenta.id,
    p_request_id,
    p_motivo,
    v_version_anterior,
    v_version_nueva,
    jsonb_build_object(
      'codigo', v_cuenta.codigo,
      'nombre', v_cuenta.nombre,
      'clase', v_cuenta.clase,
      'naturaleza', v_cuenta.naturaleza
    )
  );

  v_resultado := jsonb_build_object(
    'ok', true,
    'datos', jsonb_build_object(
      'id', v_cuenta.id,
      'version', v_cuenta.version,
      'revisionCatalogo', v_revision_catalogo
    )
  );

  if v_clave is not null then
    insert into private.operaciones_idempotentes (
      empresa_id,
      operacion,
      clave,
      hash_payload,
      resultado_json,
      creado_por
    )
    values (
      p_empresa_id,
      'guardar_cuenta',
      v_clave,
      v_hash,
      v_resultado,
      v_actor
    )
    on conflict (empresa_id, operacion, clave) do nothing;
  end if;

  return v_resultado;
exception
  when unique_violation then
    return jsonb_build_object(
      'ok', false,
      'codigo', 'DUPLICADO',
      'mensaje', 'Ya existe una cuenta con ese codigo en la empresa.'
    );
end;
$$;

create or replace function public.crear_periodo(
  p_empresa_id uuid,
  p_anio integer,
  p_mes integer,
  p_request_id text,
  p_clave_idempotencia text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_periodo public.periodos%rowtype;
  v_inicio date;
  v_fin date;
  v_clave text := nullif(btrim(p_clave_idempotencia), '');
  v_hash text;
  v_payload jsonb;
  v_resultado jsonb;
  v_idempotente private.operaciones_idempotentes%rowtype;
begin
  if v_actor is null then
    return jsonb_build_object(
      'ok', false,
      'codigo', 'NO_AUTENTICADO',
      'mensaje', 'Tu sesion no es valida. Inicia sesion nuevamente.'
    );
  end if;

  if not private.tiene_permiso(p_empresa_id, 'periodos.gestionar') then
    return jsonb_build_object(
      'ok', false,
      'codigo', 'PERMISO_DENEGADO',
      'mensaje', 'No tenes permiso para gestionar periodos.'
    );
  end if;

  perform 1
  from public.empresas e
  where e.id = p_empresa_id
  for update;

  if not found then
    return jsonb_build_object(
      'ok', false,
      'codigo', 'RECURSO_NO_ENCONTRADO',
      'mensaje', 'La empresa no esta disponible.'
    );
  end if;

  v_payload := jsonb_build_object(
    'empresaId', p_empresa_id,
    'anio', p_anio,
    'mes', p_mes
  );
  v_hash := md5(v_payload::text);

  if v_clave is not null then
    select *
    into v_idempotente
    from private.operaciones_idempotentes oi
    where oi.empresa_id = p_empresa_id
      and oi.operacion = 'crear_periodo'
      and oi.clave = v_clave;

    if found then
      if v_idempotente.hash_payload <> v_hash then
        return jsonb_build_object(
          'ok', false,
          'codigo', 'IDEMPOTENCIA_CONFLICTO',
          'mensaje', 'La clave de reintento ya se uso para otra operacion.'
        );
      end if;

      return v_idempotente.resultado_json;
    end if;
  end if;

  if p_anio is null or p_anio < 2000 or p_anio > 2100 then
    return jsonb_build_object(
      'ok', false,
      'codigo', 'VALIDACION_ENTRADA',
      'mensaje', 'El año debe estar entre 2000 y 2100.'
    );
  end if;

  if p_mes is null or p_mes < 1 or p_mes > 12 then
    return jsonb_build_object(
      'ok', false,
      'codigo', 'VALIDACION_ENTRADA',
      'mensaje', 'El mes debe estar entre 1 y 12.'
    );
  end if;

  v_inicio := make_date(p_anio, p_mes, 1);
  v_fin := (v_inicio + interval '1 month - 1 day')::date;

  insert into public.periodos (
    empresa_id,
    anio,
    mes,
    inicio,
    fin
  )
  values (
    p_empresa_id,
    p_anio,
    p_mes,
    v_inicio,
    v_fin
  )
  returning *
  into v_periodo;

  update public.empresas
  set
    version = version + 1,
    actualizado_en = now()
  where id = p_empresa_id;

  perform private.registrar_auditoria(
    p_empresa_id,
    'periodo.creado',
    'periodo',
    v_periodo.id,
    p_request_id,
    null,
    null,
    1,
    jsonb_build_object('anio', p_anio, 'mes', p_mes)
  );

  v_resultado := jsonb_build_object(
    'ok', true,
    'datos', jsonb_build_object(
      'id', v_periodo.id,
      'version', v_periodo.version
    )
  );

  if v_clave is not null then
    insert into private.operaciones_idempotentes (
      empresa_id,
      operacion,
      clave,
      hash_payload,
      resultado_json,
      creado_por
    )
    values (
      p_empresa_id,
      'crear_periodo',
      v_clave,
      v_hash,
      v_resultado,
      v_actor
    )
    on conflict (empresa_id, operacion, clave) do nothing;
  end if;

  return v_resultado;
exception
  when unique_violation then
    return jsonb_build_object(
      'ok', false,
      'codigo', 'DUPLICADO',
      'mensaje', 'Ya existe un periodo para ese año y mes.'
    );
end;
$$;

grant finanzas_rpc to postgres;
grant create on schema public to finanzas_rpc;

alter function public.guardar_cuenta(
  uuid, uuid, text, text, uuid, text, text, uuid, boolean, boolean, boolean,
  date, date, integer, text, text, text
) owner to finanzas_rpc;

alter function public.crear_periodo(uuid, integer, integer, text, text)
  owner to finanzas_rpc;

revoke create on schema public from finanzas_rpc;

revoke all on function public.guardar_cuenta(
  uuid, uuid, text, text, uuid, text, text, uuid, boolean, boolean, boolean,
  date, date, integer, text, text, text
) from public, anon;

revoke all on function public.crear_periodo(uuid, integer, integer, text, text)
  from public, anon;

grant execute on function public.guardar_cuenta(
  uuid, uuid, text, text, uuid, text, text, uuid, boolean, boolean, boolean,
  date, date, integer, text, text, text
) to authenticated;

grant execute on function public.crear_periodo(uuid, integer, integer, text, text)
  to authenticated;

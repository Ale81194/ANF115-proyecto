-- La RPC definer se ejecuta como finanzas_rpc, un rol sin acceso al esquema
-- auth. La identidad se obtiene mediante un helper definer propiedad del rol
-- de migracion, que devuelve solo auth.uid().

create or replace function private.actor_actual()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select auth.uid()
$$;

revoke all on function private.actor_actual() from public, anon;
grant execute on function private.actor_actual() to finanzas_rpc;
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
  v_actor uuid := private.actor_actual();
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
  v_actor uuid := private.actor_actual();
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

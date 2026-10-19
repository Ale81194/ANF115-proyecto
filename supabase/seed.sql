-- Semilla inicial reproducible de la Fase 01.
-- Contiene identidad de empresa, roles, permisos, catalogo revisado y periodos.
-- No contiene asientos ni resultados financieros calculados.

insert into public.empresas (id, nombre, moneda, origen_datos, zona_horaria)
values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Panaderia Carlitos',
    'USD',
    'simulado',
    'America/El_Salvador'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Empresa Demo B',
    'USD',
    'simulado',
    'America/El_Salvador'
  )
on conflict (id) do nothing;

insert into public.roles (id, codigo, nombre)
values
  ('11111111-1111-1111-1111-111111111111', 'administrador', 'Administrador'),
  ('22222222-2222-2222-2222-222222222222', 'analista', 'Analista'),
  ('33333333-3333-3333-3333-333333333333', 'gerencia', 'Gerencia')
on conflict (codigo) do nothing;

insert into public.permisos (codigo, descripcion)
values
  ('finanzas.leer', 'Consultar informacion financiera de la empresa'),
  ('usuarios.gestionar', 'Gestionar usuarios, membresias y roles'),
  ('catalogo.publicar', 'Publicar y mantener el catalogo de cuentas'),
  ('periodos.gestionar', 'Crear y administrar periodos contables'),
  ('importaciones.preparar', 'Preparar y validar importaciones'),
  ('asientos.preparar', 'Preparar borradores de asientos'),
  ('asientos.aprobar', 'Aprobar y contabilizar asientos'),
  ('asientos.revertir', 'Revertir asientos contabilizados'),
  ('periodos.cerrar', 'Cerrar periodos contables'),
  ('periodos.reabrir', 'Reabrir periodos contables'),
  ('presupuestos.preparar', 'Preparar versiones de presupuesto'),
  ('presupuestos.aprobar', 'Aprobar o rechazar presupuestos'),
  ('escenarios.ejecutar', 'Crear y ejecutar escenarios'),
  ('reportes.exportar', 'Generar y descargar reportes'),
  ('auditoria.leer', 'Consultar el registro de auditoria')
on conflict (codigo) do nothing;

insert into public.rol_permisos (rol_id, permiso_id)
select r.id, p.id
from public.roles r
join public.permisos p on p.codigo in (
  'finanzas.leer',
  'usuarios.gestionar',
  'catalogo.publicar',
  'periodos.gestionar',
  'asientos.aprobar',
  'asientos.revertir',
  'periodos.cerrar',
  'periodos.reabrir',
  'reportes.exportar',
  'auditoria.leer'
)
where r.codigo = 'administrador'
on conflict do nothing;

insert into public.rol_permisos (rol_id, permiso_id)
select r.id, p.id
from public.roles r
join public.permisos p on p.codigo in (
  'finanzas.leer',
  'importaciones.preparar',
  'asientos.preparar',
  'presupuestos.preparar',
  'escenarios.ejecutar',
  'reportes.exportar'
)
where r.codigo = 'analista'
on conflict do nothing;

insert into public.rol_permisos (rol_id, permiso_id)
select r.id, p.id
from public.roles r
join public.permisos p on p.codigo in (
  'finanzas.leer',
  'presupuestos.aprobar',
  'reportes.exportar'
)
where r.codigo = 'gerencia'
on conflict do nothing;

do $$
declare
  v_empresa uuid := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  v_rubro uuid;
  v_padre uuid;
  v_anio integer;
  v_mes integer;
  r record;
begin
  for r in
    select *
    from (values
      ('ACTIVO_CORRIENTE', 'Activo corriente', 'balance', 1),
      ('ACTIVO_NO_CORRIENTE', 'Activo no corriente', 'balance', 1),
      ('PASIVO_CORRIENTE', 'Pasivo corriente', 'balance', 1),
      ('PASIVO_NO_CORRIENTE', 'Pasivo no corriente', 'balance', 1),
      ('PATRIMONIO', 'Patrimonio', 'patrimonio', 1),
      ('INGRESOS', 'Ingresos', 'resultados', 1),
      ('COSTOS', 'Costos', 'resultados', 1),
      ('GASTOS_OPERATIVOS', 'Gastos operativos', 'resultados', 1),
      ('GASTOS_FINANCIEROS', 'Gastos financieros', 'resultados', 1)
    ) as t(codigo, nombre, estado_financiero, signo_presentacion)
  loop
    insert into public.rubros_financieros (
      empresa_id,
      codigo,
      nombre,
      estado_financiero,
      signo_presentacion
    )
    values (
      v_empresa,
      r.codigo,
      r.nombre,
      r.estado_financiero,
      r.signo_presentacion
    )
    on conflict (empresa_id, codigo) do nothing;
  end loop;

  for r in
    select *
    from (values
      ('1', 'ACTIVO', null::text, 'activo', 'deudora', 'ACTIVO_CORRIENTE', false, false),
      ('1.1', 'ACTIVO CORRIENTE', '1', 'activo', 'deudora', 'ACTIVO_CORRIENTE', false, false),
      ('1.1.1', 'Caja', '1.1', 'activo', 'deudora', 'ACTIVO_CORRIENTE', false, true),
      ('1.1.2', 'Banco', '1.1', 'activo', 'deudora', 'ACTIVO_CORRIENTE', false, true),
      ('1.1.3', 'Cuentas por cobrar', '1.1', 'activo', 'deudora', 'ACTIVO_CORRIENTE', false, true),
      ('1.1.4', 'Inventario de materia prima', '1.1', 'activo', 'deudora', 'ACTIVO_CORRIENTE', false, true),
      ('1.1.5', 'Inventario de producto terminado', '1.1', 'activo', 'deudora', 'ACTIVO_CORRIENTE', false, true),
      ('1.1.6', 'Gastos pagados por anticipado', '1.1', 'activo', 'deudora', 'ACTIVO_CORRIENTE', false, true),
      ('1.2', 'ACTIVO NO CORRIENTE', '1', 'activo', 'deudora', 'ACTIVO_NO_CORRIENTE', false, false),
      ('1.2.1', 'Mobiliario y equipo', '1.2', 'activo', 'deudora', 'ACTIVO_NO_CORRIENTE', false, true),
      ('1.2.2', 'Equipo de reparto', '1.2', 'activo', 'deudora', 'ACTIVO_NO_CORRIENTE', false, true),
      ('1.2.3', 'Depreciacion acumulada mobiliario', '1.2', 'activo', 'acreedora', 'ACTIVO_NO_CORRIENTE', true, true),
      ('1.2.4', 'Depreciacion acumulada equipo de reparto', '1.2', 'activo', 'acreedora', 'ACTIVO_NO_CORRIENTE', true, true),
      ('2', 'PASIVO', null::text, 'pasivo', 'acreedora', 'PASIVO_CORRIENTE', false, false),
      ('2.1', 'PASIVO CORRIENTE', '2', 'pasivo', 'acreedora', 'PASIVO_CORRIENTE', false, false),
      ('2.1.1', 'Proveedores', '2.1', 'pasivo', 'acreedora', 'PASIVO_CORRIENTE', false, true),
      ('2.1.2', 'Sueldos por pagar', '2.1', 'pasivo', 'acreedora', 'PASIVO_CORRIENTE', false, true),
      ('2.1.3', 'Impuestos por pagar', '2.1', 'pasivo', 'acreedora', 'PASIVO_CORRIENTE', false, true),
      ('2.1.4', 'Prestamo bancario corto plazo', '2.1', 'pasivo', 'acreedora', 'PASIVO_CORRIENTE', false, true),
      ('2.2', 'PASIVO NO CORRIENTE', '2', 'pasivo', 'acreedora', 'PASIVO_NO_CORRIENTE', false, false),
      ('2.2.1', 'Prestamo bancario largo plazo', '2.2', 'pasivo', 'acreedora', 'PASIVO_NO_CORRIENTE', false, true),
      ('3', 'PATRIMONIO', null::text, 'patrimonio', 'acreedora', 'PATRIMONIO', false, false),
      ('3.1', 'Capital', '3', 'patrimonio', 'acreedora', 'PATRIMONIO', false, true),
      ('3.2', 'Resultados acumulados', '3', 'patrimonio', 'acreedora', 'PATRIMONIO', false, true),
      ('3.3', 'Resultado del ejercicio', '3', 'patrimonio', 'acreedora', 'PATRIMONIO', false, true),
      ('3.4', 'Retiros del propietario', '3', 'patrimonio', 'deudora', 'PATRIMONIO', true, true),
      ('4', 'INGRESOS', null::text, 'ingreso', 'acreedora', 'INGRESOS', false, false),
      ('4.1', 'Ventas de panaderia', '4', 'ingreso', 'acreedora', 'INGRESOS', false, true),
      ('4.2', 'Ventas de cafeteria', '4', 'ingreso', 'acreedora', 'INGRESOS', false, true),
      ('4.3', 'Descuentos y devoluciones', '4', 'ingreso', 'deudora', 'INGRESOS', true, true),
      ('5', 'COSTOS', null::text, 'gasto', 'deudora', 'COSTOS', false, false),
      ('5.1', 'Costo de materia prima', '5', 'gasto', 'deudora', 'COSTOS', false, true),
      ('5.2', 'Costo de mano de obra directa', '5', 'gasto', 'deudora', 'COSTOS', false, true),
      ('5.3', 'Costos indirectos de fabricacion', '5', 'gasto', 'deudora', 'COSTOS', false, true),
      ('6', 'GASTOS', null::text, 'gasto', 'deudora', 'GASTOS_OPERATIVOS', false, false),
      ('6.1', 'Sueldos y salarios administrativos', '6', 'gasto', 'deudora', 'GASTOS_OPERATIVOS', false, true),
      ('6.2', 'Alquiler', '6', 'gasto', 'deudora', 'GASTOS_OPERATIVOS', false, true),
      ('6.3', 'Servicios basicos', '6', 'gasto', 'deudora', 'GASTOS_OPERATIVOS', false, true),
      ('6.4', 'Mantenimiento', '6', 'gasto', 'deudora', 'GASTOS_OPERATIVOS', false, true),
      ('6.5', 'Depreciacion', '6', 'gasto', 'deudora', 'GASTOS_OPERATIVOS', false, true),
      ('6.6', 'Gastos financieros', '6', 'gasto', 'deudora', 'GASTOS_FINANCIEROS', false, true),
      ('6.7', 'Impuestos y tasas', '6', 'gasto', 'deudora', 'GASTOS_OPERATIVOS', false, true)
    ) as t(
      codigo,
      nombre,
      padre_codigo,
      clase,
      naturaleza,
      rubro_codigo,
      es_correctora,
      permite_movimiento
    )
  loop
    select c.id
    into v_padre
    from public.cuentas c
    where c.empresa_id = v_empresa
      and c.codigo = r.padre_codigo;

    select rf.id
    into v_rubro
    from public.rubros_financieros rf
    where rf.empresa_id = v_empresa
      and rf.codigo = r.rubro_codigo;

    insert into public.cuentas (
      empresa_id,
      codigo,
      nombre,
      padre_id,
      clase,
      naturaleza,
      rubro_id,
      es_correctora,
      permite_movimiento
    )
    values (
      v_empresa,
      r.codigo,
      r.nombre,
      v_padre,
      r.clase,
      r.naturaleza,
      v_rubro,
      r.es_correctora,
      r.permite_movimiento
    )
    on conflict (empresa_id, codigo) do nothing;
  end loop;

  for v_anio in 2024..2026 loop
    for v_mes in 1..12 loop
      insert into public.periodos (empresa_id, anio, mes, inicio, fin)
      values (
        v_empresa,
        v_anio,
        v_mes,
        make_date(v_anio, v_mes, 1),
        (make_date(v_anio, v_mes, 1) + interval '1 month - 1 day')::date
      )
      on conflict (empresa_id, anio, mes) do nothing;
    end loop;
  end loop;

  insert into public.politicas_calculo (
    empresa_id,
    codigo,
    version,
    parametros,
    hash
  )
  select
    v_empresa,
    'P-CARLITOS-1',
    1,
    jsonb_build_object(
      'moneda', 'USD',
      'precision', 40,
      'redondeo', 'ROUND_HALF_UP',
      'escalaMonetaria', 2,
      'baseDias', 365
    ),
    md5(
      jsonb_build_object(
        'moneda', 'USD',
        'precision', 40,
        'redondeo', 'ROUND_HALF_UP',
        'escalaMonetaria', 2,
        'baseDias', 365
      )::text
    )
  where not exists (
    select 1
    from public.politicas_calculo pc
    where pc.empresa_id = v_empresa
      and pc.codigo = 'P-CARLITOS-1'
      and pc.version = 1
  );
end
$$;

-- Segunda empresa minima para pruebas de aislamiento.
do $$
declare
  v_empresa uuid := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  v_rubro uuid;
begin
  insert into public.rubros_financieros (
    empresa_id,
    codigo,
    nombre,
    estado_financiero,
    signo_presentacion
  )
  values (v_empresa, 'ACTIVO_CORRIENTE', 'Activo corriente', 'balance', 1)
  on conflict (empresa_id, codigo) do nothing;

  select rf.id
  into v_rubro
  from public.rubros_financieros rf
  where rf.empresa_id = v_empresa
    and rf.codigo = 'ACTIVO_CORRIENTE';

  insert into public.cuentas (
    empresa_id,
    codigo,
    nombre,
    clase,
    naturaleza,
    rubro_id,
    permite_movimiento
  )
  values (
    v_empresa,
    '1.1.1',
    'Caja empresa B',
    'activo',
    'deudora',
    v_rubro,
    true
  )
  on conflict (empresa_id, codigo) do nothing;

  insert into public.periodos (empresa_id, anio, mes, inicio, fin)
  values (
    v_empresa,
    2026,
    1,
    date '2026-01-01',
    date '2026-01-31'
  )
  on conflict (empresa_id, anio, mes) do nothing;
end
$$;

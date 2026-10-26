-- Expone la trazabilidad de anulacion necesaria para el detalle operativo.
-- La vista conserva security_invoker: RLS sigue limitando movimientos y perfiles.
create or replace view public.v_movimientos
with (security_invoker = true) as
select
  i.id,
  'ingreso'::text as tipo,
  i.fecha,
  i.concepto,
  i.monto::text as monto,
  i.categoria_id,
  c.nombre as categoria,
  i.referencia,
  i.estado,
  i.creado_por,
  i.revision,
  i.motivo_anulacion,
  i.anulado_por,
  i.anulado_en,
  p.nombre as anulador
from public.ingresos i
join public.categorias c on c.id = i.categoria_id
left join public.perfiles p on p.usuario_id = i.anulado_por
union all
select
  g.id,
  'gasto'::text as tipo,
  g.fecha,
  g.concepto,
  g.monto::text as monto,
  g.categoria_id,
  c.nombre as categoria,
  g.referencia,
  g.estado,
  g.creado_por,
  g.revision,
  g.motivo_anulacion,
  g.anulado_por,
  g.anulado_en,
  p.nombre as anulador
from public.gastos g
join public.categorias c on c.id = g.categoria_id
left join public.perfiles p on p.usuario_id = g.anulado_por;

revoke all on public.v_movimientos from public, anon;
grant select on public.v_movimientos to authenticated, anf_writer;

notify pgrst, 'reload schema';

-- Descripciones tomadas del catálogo operativo vigente de los siete módulos.
-- Se cargan como referencia de uso para orientar la selección del empleado.
alter table public.categorias disable trigger anf_validar;
alter table public.categorias disable trigger anf_auditar;

update public.categorias as c
set descripcion = d.descripcion,
    actualizado_en = clock_timestamp()
from (values
  ('I01', 'Cobros por pan dulce vendido.'),
  ('I02', 'Cobros por pan francés vendido.'),
  ('I03', 'Cobros por pasteles y otros productos de repostería.'),
  ('I04', 'Cobros por productos de panadería integral.'),
  ('I05', 'Cobros por galletas elaboradas para la venta.'),
  ('I06', 'Cobros por pedidos identificados como especiales; no duplicar otra venta.'),
  ('G01', 'Harina, levadura, azúcar, manteca y demás ingredientes pagados.'),
  ('G02', 'Bolsas, cajas y otros materiales de empaque pagados.'),
  ('G03', 'Pagos de gas utilizado por los hornos.'),
  ('G04', 'Pagos del suministro de electricidad.'),
  ('G05', 'Pagos del servicio de agua.'),
  ('G06', 'Pagos por el uso del local.'),
  ('G07', 'Pagos operativos al personal; no constituye un módulo de nómina.'),
  ('G08', 'Pagos de entregas y transporte relacionados con la operación.'),
  ('G09', 'Artículos operativos y de oficina distintos de ingredientes y empaques.'),
  ('G10', 'Productos y servicios de limpieza.'),
  ('G11', 'Reparación y mantenimiento ordinario de hornos y equipos.'),
  ('G12', 'Conservación ordinaria de las instalaciones.'),
  ('G13', 'Pagos de publicidad y promoción.'),
  ('G14', 'Pagos de comunicaciones del negocio.'),
  ('G15', 'Comisiones pagadas por medios de cobro.'),
  ('G16', 'Pagos operativos identificados por permisos o tasas.'),
  ('G17', 'Pagos de seguros relacionados con la operación.'),
  ('G18', 'Pagos por servicios profesionales recibidos.'),
  ('G19', 'Pagos por uniformes e implementos de protección.'),
  ('G20', 'Pagos no comprendidos en otra categoría; exige un concepto específico.')
) as d(codigo, descripcion)
where c.codigo = d.codigo
  and c.descripcion = '';

alter table public.categorias enable trigger anf_auditar;
alter table public.categorias enable trigger anf_validar;

notify pgrst, 'reload schema';

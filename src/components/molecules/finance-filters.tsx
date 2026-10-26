import type { Categoria, FiltroFinanciero } from "@/types/finanzas";

export function FinanceFilters({ filtro, categorias, reportes = false }: {
  filtro: FiltroFinanciero; categorias: Categoria[]; reportes?: boolean;
}) {
  const style = "mt-1 block w-full rounded-input border border-borde-fuerte bg-superficie px-3 py-2 text-sm";
  return <form className="grid items-end gap-3 rounded-card border border-borde bg-superficie p-4 sm:grid-cols-2 xl:grid-cols-6">
    <label className="text-xs font-semibold">Desde<input className={style} name="desde" type="date" defaultValue={filtro.desde} required /></label>
    <label className="text-xs font-semibold">Hasta<input className={style} name="hasta" type="date" defaultValue={filtro.hasta} required /></label>
    <label className="text-xs font-semibold">Categoría<select name="categoria" className={style} defaultValue={filtro.categoria ?? ""}>
      <option value="">Todas las categorías</option>{categorias.filter((c) => !filtro.tipo || c.tipo === filtro.tipo).map((c) => <option key={c.id} value={c.id}>{c.codigo} · {c.nombre}{c.activo ? "" : " (inactiva)"}</option>)}
    </select></label>
    <label className="text-xs font-semibold">Estado<select name="estado" className={style} defaultValue={filtro.estado ?? ""}>
      <option value="">Todos los estados</option><option value="vigente">Vigentes</option><option value="anulado">Anulados</option>
    </select></label>
    {reportes ? <label className="text-xs font-semibold">Agrupar por<select name="granularidad" className={style} defaultValue={filtro.granularidad}>
      <option value="dia">Día</option><option value="mes">Mes</option><option value="anio">Año</option>
    </select></label> : <p className="text-xs text-texto-suave">USD · Fechas inclusivas<br />Solo movimientos autorizados</p>}
    {filtro.tipo && <input type="hidden" name="tipo" value={filtro.tipo} />}
    <button className="rounded-input bg-cafe-900 px-4 py-2.5 text-sm font-semibold text-crema-50">Aplicar filtros</button>
  </form>;
}

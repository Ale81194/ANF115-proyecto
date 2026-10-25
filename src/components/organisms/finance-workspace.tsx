import Link from "next/link";
import { formatearUSD } from "@/lib/dinero";
import { rutas } from "@/config/rutas";
import { OperationForm } from "@/components/organisms/operation-form";
import { FinanceFilters } from "@/components/molecules/finance-filters";
import type { AccionOperacion, CampoOperacion, VistaFinanciera, Movimiento } from "@/types/finanzas";

function camposMovimiento(data: VistaFinanciera, tipo: "ingreso" | "gasto", m?: Movimiento): CampoOperacion[] {
  return [
    { nombre: "concepto", etiqueta: "Concepto", requerido: true, valor: m?.concepto, maxLength: 250 },
    { nombre: "monto", etiqueta: "Monto USD (ejemplo: 25.50)", requerido: true, valor: m?.monto },
    { nombre: "fecha", etiqueta: "Fecha", tipo: "date", requerido: true, valor: m?.fecha ?? data.fechaSugerida },
    { nombre: "categoria_id", etiqueta: "Categoría", tipo: "select", requerido: true, valor: m?.categoria_id,
      opciones: [{ valor: "", etiqueta: "Seleccione una categoría" }, ...data.categorias.filter((c) => c.tipo === tipo && (c.activo || c.id === m?.categoria_id))
        .map((c) => ({ valor: c.id, etiqueta: `${c.codigo} · ${c.nombre}${c.activo ? "" : " (histórica)"}` }))] },
    { nombre: "referencia", etiqueta: "Referencia (opcional)", valor: m?.referencia ?? "", maxLength: 120 },
  ];
}

export function FinanceWorkspace({ data, modulo, accion }: {
  data: VistaFinanciera; modulo: "panel" | "ingreso" | "gasto" | "reportes"; accion: AccionOperacion;
}) {
  const movimiento = modulo === "ingreso" || modulo === "gasto";
  const titulo = modulo === "panel" ? "Panel financiero" : modulo === "reportes" ? "Reportes" : modulo === "ingreso" ? "Ingresos" : "Gastos";
  const url = modulo === "ingreso" ? rutas.ingresos : modulo === "gasto" ? rutas.gastos : modulo === "reportes" ? rutas.reportes.lista : rutas.dashboard;
  const paginar = (pagina: number) => {
    const q = new URLSearchParams({ desde: data.filtro.desde, hasta: data.filtro.hasta, granularidad: data.filtro.granularidad, pagina: String(pagina) });
    if (data.filtro.categoria) q.set("categoria", data.filtro.categoria);
    return `${url}?${q}`;
  };
  return <div className="space-y-6">
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-xs font-semibold uppercase tracking-widest text-primario">Panadería Carlitos · Control operativo</p>
        <h1 className="mt-2 font-serif text-4xl">{titulo}</h1>
        <p className="mt-2 text-sm text-texto-suave">Cobros y pagos · {data.perfil.rol === "empleado" ? "Solo tus movimientos" : "Todos los movimientos autorizados"} · Datos simulados</p></div>
      {movimiento && <a href="#nueva-captura" className="rounded-input bg-primario px-5 py-2.5 text-sm font-semibold text-white">Registrar {modulo}</a>}
    </header>
    <FinanceFilters filtro={data.filtro} categorias={data.categorias} reportes={modulo === "reportes"} />
    <p className="text-sm text-texto-suave">Período: <strong>{data.filtro.desde} — {data.filtro.hasta}</strong>. Totales sobre todo el filtro; excluyen anulados.</p>
    <section aria-label="Indicadores financieros" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[
        ["Ingresos totales", formatearUSD(data.resumen.ingresos), "text-exito"],
        ["Gastos totales", formatearUSD(data.resumen.gastos), "text-peligro"],
        ["Resultado financiero", formatearUSD(data.resumen.resultado), data.resumen.resultado.startsWith("-") ? "text-peligro" : "text-texto"],
        ["Porcentaje de gastos", data.resumen.porcentaje_gastos === null ? "No aplica" : `${data.resumen.porcentaje_gastos} %`, "text-texto"],
      ].map(([label, value, color]) => <article key={label} className="rounded-card border border-borde bg-superficie p-5 shadow-card">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-texto-suave">{label}</h2><p className={`mt-3 text-right text-3xl font-semibold tabular-nums ${color}`}>{value}</p>
      </article>)}
    </section>
    {modulo === "panel" && <div className="grid gap-5 lg:grid-cols-2">
      <section className="rounded-card border border-borde bg-superficie p-6"><h2 className="font-serif text-xl">Ingresos y gastos</h2>
        {(["ingresos", "gastos"] as const).map((tipo) => <div key={tipo} className="mt-5"><div className="mb-2 flex justify-between text-sm"><span>{tipo === "ingresos" ? "Ingresos" : "Gastos"}</span><span>{formatearUSD(data.resumen[tipo])}</span></div>
          <div className="h-5 overflow-hidden rounded-input bg-superficie-tenue"><div className={`h-full ${tipo === "ingresos" ? "bg-exito" : "bg-peligro"}`} style={{ width: `${data.barras[tipo]}%` }} /></div></div>)}
      </section>
      <section className="rounded-card border border-borde bg-superficie p-6"><h2 className="font-serif text-xl">Distribución de gastos</h2>
        {data.distribucion.length === 0 && <p className="mt-4 text-sm text-texto-suave">No hay gastos vigentes en este período.</p>}
        {data.distribucion.map((c) => <div key={c.categoria} className="mt-4"><div className="flex justify-between gap-3 text-xs"><span>{c.categoria}</span><span>{formatearUSD(c.monto)} · {c.ancho}%</span></div>
          <div className="mt-2 h-2 rounded bg-superficie-tenue"><div className="h-full rounded bg-primario" style={{ width: `${c.ancho}%` }} /></div></div>)}
      </section>
    </div>}
    {movimiento && <section id="nueva-captura" className="scroll-mt-24 rounded-card border border-borde bg-superficie p-6">
      <h2 className="mb-4 font-serif text-2xl">Registrar {modulo}</h2>
      <OperationForm accion={accion} operacion="movimiento" ocultos={{ tipo: modulo }} solicitud={crypto.randomUUID()}
        campos={camposMovimiento(data, modulo)} texto={`Guardar ${modulo}`} />
    </section>}
    {modulo === "reportes" && <section className="rounded-card border border-borde bg-superficie p-5">
      <h2 className="mb-4 font-serif text-xl">Resumen {data.filtro.granularidad === "dia" ? "diario" : data.filtro.granularidad === "mes" ? "mensual" : "anual"}</h2>
      <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-borde text-left"><th className="p-3">Período</th><th className="p-3 text-right">Ingresos</th><th className="p-3 text-right">Gastos</th><th className="p-3 text-right">Resultado</th><th className="p-3 text-right">% gastos</th></tr></thead>
        <tbody>{data.periodos.map((p) => <tr key={p.periodo} className="border-b border-borde"><td className="p-3">{p.periodo}</td><td className="p-3 text-right tabular-nums">{formatearUSD(p.ingresos)}</td><td className="p-3 text-right tabular-nums">{formatearUSD(p.gastos)}</td><td className="p-3 text-right tabular-nums">{formatearUSD(p.resultado)}</td><td className="p-3 text-right">{p.porcentaje_gastos === null ? "No aplica" : `${p.porcentaje_gastos}%`}</td></tr>)}</tbody></table></div>
    </section>}
    <section className="rounded-card border border-borde bg-superficie p-5">
      <h2 className="font-serif text-xl">Detalle de movimientos</h2>
      <p className="mb-4 mt-1 text-xs text-texto-suave">50 registros por página. Los anulados conservan su historial, pero no forman parte de los indicadores.</p>
      {data.movimientos.length === 0 ? <div className="rounded-input bg-superficie-tenue p-8 text-center"><h3 className="font-serif text-xl">Sin movimientos en este filtro</h3><p className="mt-2 text-sm">Registre una operación o cambie el rango de fechas. No se muestran cifras de ejemplo.</p></div>
        : <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-borde text-left">{["Fecha", "Concepto", "Categoría", "Tipo / estado", "Monto USD", "Acciones"].map((h) => <th className="whitespace-nowrap p-3" key={h}>{h}</th>)}</tr></thead>
          <tbody>{data.movimientos.map((m) => <tr key={`${m.tipo}-${m.id}`} className="border-b border-borde align-top">
            <td className="whitespace-nowrap p-3">{m.fecha}</td><td className="min-w-40 p-3">{m.concepto}{m.referencia && <small className="block text-texto-suave">{m.referencia}</small>}</td><td className="p-3">{m.categoria}</td>
            <td className="p-3"><span className={m.tipo === "ingreso" ? "text-exito" : "text-peligro"}>{m.tipo}</span><br /><span className="text-xs">{m.estado}</span></td>
            <td className="whitespace-nowrap p-3 text-right tabular-nums">{formatearUSD(m.monto)}</td>
            <td className="min-w-40 p-3">{movimiento && m.estado === "vigente" ? <>
              <details><summary className="cursor-pointer font-medium text-primario">Corregir</summary><div className="mt-3 min-w-64 rounded-input border border-borde p-3">
                <OperationForm accion={accion} operacion="movimiento" solicitud={m.id} ocultos={{ tipo: m.tipo, id: m.id, revision: String(m.revision) }} campos={camposMovimiento(data, m.tipo, m)} />
              </div></details>
              <details className="mt-3"><summary className="cursor-pointer text-peligro">Anular</summary><p className="my-2 text-xs">Acción definitiva. El movimiento se conserva y deja de contar en los totales.</p>
                <OperationForm accion={accion} operacion="anular" ocultos={{ tipo: m.tipo, id: m.id, revision: String(m.revision) }}
                  campos={[{ nombre: "motivo", etiqueta: "Motivo de anulación (mínimo 5 caracteres)", requerido: true, tipo: "textarea", maxLength: 500 }]} texto="Confirmar anulación" />
              </details></> : <span className="text-xs text-texto-suave">{m.motivo_anulacion ?? "Solo consulta"}</span>}</td>
          </tr>)}</tbody></table></div>}
      <nav aria-label="Paginación" className="mt-5 flex items-center justify-between text-sm">
        {data.pagina > 1 ? <Link className="underline" href={paginar(data.pagina - 1)}>Anterior</Link> : <span />}
        <span>Página {data.pagina} · {data.total} registros</span>
        {data.pagina * 50 < data.total ? <Link className="underline" href={paginar(data.pagina + 1)}>Siguiente</Link> : <span />}
      </nav>
    </section>
    <p className="text-xs text-texto-suave">El resultado operativo no equivale automáticamente a utilidad contable ni a saldo bancario.</p>
  </div>;
}

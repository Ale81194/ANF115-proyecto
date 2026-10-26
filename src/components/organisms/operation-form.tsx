"use client";

import { useActionState, useId, useState } from "react";
import { CalendarDays, Coins, FileText, Save, Tag } from "lucide-react";
import type { AccionOperacion, CampoOperacion } from "@/types/finanzas";

function IconoCampo({ nombre }: { nombre: string }) {
  const clase = "size-4 text-primario";
  if (nombre === "concepto") return <FileText aria-hidden="true" className={clase} />;
  if (nombre === "monto") return <Coins aria-hidden="true" className={clase} />;
  if (nombre === "fecha") return <CalendarDays aria-hidden="true" className={clase} />;
  if (nombre === "categoria_id") return <Tag aria-hidden="true" className={clase} />;
  return null;
}

export function OperationForm({ accion, operacion, campos, ocultos = {}, texto = "Guardar", solicitud, presentacion = "estandar" }: {
  accion: AccionOperacion; operacion: string; campos: CampoOperacion[];
  ocultos?: Record<string, string>; texto?: string; solicitud?: string;
  presentacion?: "estandar" | "movimiento";
}) {
  const [estado, action, pendiente] = useActionState(accion, { ok: false, mensaje: "" });
  const [valores, setValores] = useState<Record<string, string>>(() => Object.fromEntries(campos.map((c) => [c.nombre, c.valor ?? ""])));
  const [solicitudId, setSolicitudId] = useState(solicitud);
  const uid = useId();
  const financiero = presentacion === "movimiento";
  const clase = `w-full rounded-input border border-borde-fuerte bg-superficie px-3 text-sm text-texto placeholder:text-texto-suave/60 focus-visible:border-primario focus-visible:outline-2 focus-visible:outline-primario/25 ${financiero ? "h-12 py-3" : "py-2.5"}`;
  return <form action={action} className={financiero ? "space-y-6" : "space-y-4"}>
    <input type="hidden" name="operacion" value={operacion} />
    {solicitudId && <input type="hidden" name="solicitud_id" value={solicitudId} />}
    {Object.entries(ocultos).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
    <div className={`grid sm:grid-cols-2 ${financiero ? "gap-x-8 gap-y-5" : "gap-4"}`}>
      {campos.map((c) => {
        const id = `${uid}-${c.nombre}`;
        const error = estado.campos?.[c.nombre];
        const props = { id, name: c.nombre, required: c.requerido, value: valores[c.nombre] ?? "",
          placeholder: c.placeholder,
          "aria-invalid": !!error, "aria-describedby": error ? `${id}-error` : undefined,
          onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            setValores((v) => ({ ...v, [c.nombre]: e.target.value }));
            if (estado.ok && solicitud) setSolicitudId(crypto.randomUUID());
          }, className: clase };
        return <div key={c.nombre} className={c.tipo === "textarea" ? "sm:col-span-2" : ""}>
          <label htmlFor={id} className={`mb-2 text-sm font-semibold ${financiero ? "flex items-center gap-2" : "block"}`}>
            {financiero && <IconoCampo nombre={c.nombre} />}
            <span>{c.etiqueta}{financiero && c.requerido && <span aria-hidden="true" className="ml-1 text-peligro">*</span>}</span>
          </label>
          {c.tipo === "select" ? <select {...props}>{c.opciones?.map((o) => <option key={o.valor} value={o.valor}>{o.etiqueta}</option>)}</select>
            : c.tipo === "textarea" ? <textarea {...props} maxLength={c.maxLength} rows={3} />
              : c.nombre === "monto" && financiero
                ? <div className="relative"><span aria-hidden="true" className="absolute inset-y-0 left-0 flex w-12 items-center justify-center border-r border-borde bg-superficie-tenue font-semibold text-texto-suave">$</span>
                  <input {...props} className={`${clase} pl-16`} type="text" maxLength={c.maxLength} inputMode="decimal" />
                </div>
                : <input {...props} type={c.tipo ?? "text"} maxLength={c.maxLength} autoComplete={c.tipo === "password" ? "new-password" : undefined}
                  inputMode={c.nombre === "monto" ? "decimal" : undefined} />}
          {error && <p id={`${id}-error`} className="mt-1 text-xs text-peligro">{error}</p>}
        </div>;
      })}
    </div>
    <p role="status" aria-live="polite" className={estado.ok ? "text-sm text-exito" : "text-sm text-peligro"}>{estado.mensaje}</p>
    <div className={financiero ? "flex flex-wrap items-center gap-4 border-t border-borde pt-5" : ""}>
      <button disabled={pendiente || (estado.ok && !solicitud)} className={`inline-flex items-center justify-center gap-2 rounded-input bg-primario font-semibold text-white shadow-sm hover:bg-primario-hover disabled:opacity-50 ${financiero ? "h-12 px-7" : "px-5 py-2.5 text-sm"}`}>
        {financiero && <Save aria-hidden="true" className="size-4" />}
        {pendiente ? "Guardando…" : texto}
      </button>
      {estado.ok && <a href="" className="inline-block text-sm text-primario underline">Continuar con una nueva operación</a>}
    </div>
  </form>;
}

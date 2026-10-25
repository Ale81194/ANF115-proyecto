"use client";

import { useActionState, useId, useState } from "react";
import type { AccionOperacion, CampoOperacion } from "@/types/finanzas";

export function OperationForm({ accion, operacion, campos, ocultos = {}, texto = "Guardar", solicitud }: {
  accion: AccionOperacion; operacion: string; campos: CampoOperacion[];
  ocultos?: Record<string, string>; texto?: string; solicitud?: string;
}) {
  const [estado, action, pendiente] = useActionState(accion, { ok: false, mensaje: "" });
  const [valores, setValores] = useState<Record<string, string>>(() => Object.fromEntries(campos.map((c) => [c.nombre, c.valor ?? ""])));
  const [solicitudId, setSolicitudId] = useState(solicitud);
  const uid = useId();
  const clase = "w-full rounded-input border border-borde-fuerte bg-superficie px-3 py-2.5 text-sm text-texto focus-visible:outline-2 focus-visible:outline-primario";
  return <form action={action} className="space-y-4">
    <input type="hidden" name="operacion" value={operacion} />
    {solicitudId && <input type="hidden" name="solicitud_id" value={solicitudId} />}
    {Object.entries(ocultos).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
    <div className="grid gap-4 sm:grid-cols-2">
      {campos.map((c) => {
        const id = `${uid}-${c.nombre}`;
        const error = estado.campos?.[c.nombre];
        const props = { id, name: c.nombre, required: c.requerido, value: valores[c.nombre] ?? "",
          "aria-invalid": !!error, "aria-describedby": error ? `${id}-error` : undefined,
          onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            setValores((v) => ({ ...v, [c.nombre]: e.target.value }));
            if (estado.ok && solicitud) setSolicitudId(crypto.randomUUID());
          }, className: clase };
        return <div key={c.nombre} className={c.tipo === "textarea" ? "sm:col-span-2" : ""}>
          <label htmlFor={id} className="mb-1.5 block text-sm font-medium">{c.etiqueta}</label>
          {c.tipo === "select" ? <select {...props}>{c.opciones?.map((o) => <option key={o.valor} value={o.valor}>{o.etiqueta}</option>)}</select>
            : c.tipo === "textarea" ? <textarea {...props} maxLength={c.maxLength} rows={3} />
              : <input {...props} type={c.tipo ?? "text"} maxLength={c.maxLength} autoComplete={c.tipo === "password" ? "new-password" : undefined}
                inputMode={c.nombre === "monto" ? "decimal" : undefined} />}
          {error && <p id={`${id}-error`} className="mt-1 text-xs text-peligro">{error}</p>}
        </div>;
      })}
    </div>
    <p role="status" aria-live="polite" className={estado.ok ? "text-sm text-exito" : "text-sm text-peligro"}>{estado.mensaje}</p>
    <button disabled={pendiente || (estado.ok && !solicitud)} className="rounded-input bg-primario px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
      {pendiente ? "Guardando…" : texto}
    </button>
    {estado.ok && <a href="" className="ml-4 inline-block text-sm text-primario underline">Continuar con una nueva operación</a>}
  </form>;
}

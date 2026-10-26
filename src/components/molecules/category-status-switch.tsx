"use client";

import { useActionState } from "react";
import type { AccionOperacion, Categoria } from "@/types/finanzas";

export function CategoryStatusSwitch({ categoria, accion }: {
  categoria: Categoria;
  accion: AccionOperacion;
}) {
  const [estado, formAction, pendiente] = useActionState(accion, { ok: false, mensaje: "" });
  const siguienteEstado = !categoria.activo;

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="operacion" value="categoria" />
      <input type="hidden" name="id" value={categoria.id} />
      <input type="hidden" name="versionEsperada" value={categoria.actualizado_en} />
      <input type="hidden" name="codigo" value={categoria.codigo} />
      <input type="hidden" name="nombre" value={categoria.nombre} />
      <input type="hidden" name="tipo" value={categoria.tipo} />
      <input type="hidden" name="descripcion" value={categoria.descripcion} />
      <input type="hidden" name="activo" value={String(siguienteEstado)} />
      <span className="text-xs font-medium text-texto-suave">
        {categoria.activo ? "Activa" : "Inactiva"}
      </span>
      <button
        type="submit"
        role="switch"
        aria-checked={categoria.activo}
        aria-label={`${categoria.activo ? "Desactivar" : "Activar"} ${categoria.nombre}`}
        title={`${categoria.activo ? "Desactivar" : "Activar"} categoría`}
        disabled={pendiente}
        className={`relative inline-flex h-7 w-12 shrink-0 rounded-pill transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primario disabled:cursor-wait disabled:opacity-60 ${
          categoria.activo ? "bg-exito" : "bg-texto-suave/35"
        }`}
      >
        <span
          aria-hidden="true"
          className={`absolute top-1 size-5 rounded-full bg-white shadow-sm transition-transform ${
            categoria.activo ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
      {!estado.ok && estado.mensaje && (
        <span role="alert" className="text-xs text-peligro">{estado.mensaje}</span>
      )}
    </form>
  );
}

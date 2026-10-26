"use client";

import { useActionState } from "react";
import type { AccionOperacion, PerfilAdministrado } from "@/types/finanzas";

export function UserStatusSwitch({ usuario, accion }: {
  usuario: PerfilAdministrado;
  accion: AccionOperacion;
}) {
  const [estado, formAction, pendiente] = useActionState(accion, { ok: false, mensaje: "" });

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="operacion" value="usuario" />
      <input type="hidden" name="id" value={usuario.usuario_id} />
      <input type="hidden" name="versionEsperada" value={usuario.actualizado_en} />
      <input type="hidden" name="nombre" value={usuario.nombre} />
      <input type="hidden" name="rol" value={usuario.rol} />
      <input type="hidden" name="activo" value={String(!usuario.activo)} />
      <button
        type="submit"
        role="switch"
        aria-checked={usuario.activo}
        aria-label={`${usuario.activo ? "Desactivar" : "Activar"} ${usuario.nombre}`}
        title={`${usuario.activo ? "Desactivar" : "Activar"} usuario`}
        disabled={pendiente}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-pill transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primario disabled:cursor-wait disabled:opacity-60 ${
          usuario.activo ? "bg-exito" : "bg-texto-suave/35"
        }`}
      >
        <span aria-hidden="true" className={`absolute top-1 size-4 rounded-full bg-white shadow-sm transition-transform ${usuario.activo ? "translate-x-6" : "translate-x-1"}`} />
      </button>
      <span className={`text-xs font-medium ${usuario.activo ? "text-exito" : "text-texto-suave"}`}>
        {usuario.activo ? "Activo" : "Inactivo"}
      </span>
      {!estado.ok && estado.mensaje && <span role="alert" className="sr-only">{estado.mensaje}</span>}
    </form>
  );
}

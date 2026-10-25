import type * as React from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Button } from "@/components/atoms/button";
import { AppShell } from "@/components/templates/app-shell";
import { AuthTemplate } from "@/components/templates/auth-template";
import { resolverAcceso } from "@/controladores/acceso.controller";
import { cerrarSesionAction } from "./actions";

/**
 * Layout del area privada.
 *
 * Resuelve identidad y membresia antes de componer el AppShell. Cada pagina y
 * cada caso de uso vuelven a comprobar el permiso de su operacion.
 */
export const instant = false;

export default async function LayoutPrivado({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const estado = await resolverAcceso();

  if (estado.estado === "sin_sesion") {
    redirect("/login");
  }

  if (estado.estado === "sin_membresia") {
    return (
      <AuthTemplate
        titulo="Acceso pendiente"
        descripcion="Tu cuenta está autenticada, pero su perfil todavía no está activo."
      >
        <div className="space-y-4">
          <div className="rounded-input border border-advertencia/30 bg-advertencia/10 px-4 py-3 text-sm leading-relaxed text-advertencia">
            <p className="font-semibold">{estado.usuarioNombre}</p>
            <p className="text-xs">{estado.usuarioCorreo}</p>
            <p className="mt-2 text-xs">
              Solicita a un administrador que active tu perfil. Mientras tanto
              no se muestra informacion financiera.
            </p>
          </div>
          <form action={cerrarSesionAction}>
            <Button type="submit" variant="secondary" className="w-full">
              Cerrar sesion
            </Button>
          </form>
        </div>
      </AuthTemplate>
    );
  }

  return (
    <AppShell
      contexto={estado.contexto}
      permisos={estado.contexto.permisos}
      cerrarSesion={cerrarSesionAction}
    >
      {children}
    </AppShell>
  );
}

import type * as React from "react";
import { AppShell } from "@/components/templates/app-shell";

/**
 * Layout del area privada.
 *
 * En la Fase 01 este layout resolvera el contexto de acceso y pasara los
 * permisos efectivos al menu. La autorizacion se repite en cada caso de uso.
 *
 * `instant = false`: las rutas privadas dependen de sesion, empresa y periodo;
 * se acepta una navegacion de bloqueo en lugar de pre-renderizar datos que
 * todavia no existen.
 */
export const instant = false;

export default function LayoutPrivado({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}

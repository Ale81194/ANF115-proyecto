import { redirect } from "next/navigation";

/**
 * La raiz resuelve el destino inicial. Mientras no exista autenticacion,
 * dirige al login del cascaron.
 *
 * `instant = false` evita el aviso de validacion de navegacion mientras el
 * destino dependa de la sesion (Fase 01).
 */
export const instant = false;

export default function InicioPage() {
  redirect("/login");
}

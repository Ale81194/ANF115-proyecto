import { cerrarSesion as cerrarSesionAuth } from "@/auth/cerrar-sesion";
import { iniciarSesion as iniciarSesionAuth } from "@/auth/iniciar-sesion";
import { resolverContextoActual } from "@/auth/resolver-contexto";
import type { EntradaIniciarSesion } from "@/schemas/contabilidad.schema";
import type { EstadoAcceso } from "@/types/contexto";
import type { Resultado } from "@/types/respuestas";

/** CU-01: identidad verificada y membresia resuelta. */
export async function resolverAcceso(): Promise<EstadoAcceso> {
  return resolverContextoActual();
}

export async function iniciarSesion(
  entrada: EntradaIniciarSesion,
): Promise<Resultado<{ usuarioId: string }>> {
  return iniciarSesionAuth(entrada);
}

export async function cerrarSesion(): Promise<void> {
  await cerrarSesionAuth();
}

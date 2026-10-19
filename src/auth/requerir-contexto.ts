import "server-only";

import { fallo, generarRequestId, ok } from "@/lib/resultado";
import { resolverContextoActual } from "@/auth/resolver-contexto";
import type { Permiso } from "@/config/permisos";
import type { ContextoAcceso } from "@/types/contexto";
import type { Resultado } from "@/types/respuestas";

/**
 * Exige un contexto autenticado y con membresia activa.
 *
 * Es la puerta comun de los controladores. La autorizacion por permiso se
 * repite en cada caso de uso.
 */
export async function requerirContexto(): Promise<Resultado<ContextoAcceso>> {
  const estado = await resolverContextoActual();

  if (estado.estado === "ok") {
    return ok(estado.contexto, estado.contexto.requestId);
  }

  const requestId = generarRequestId();

  if (estado.estado === "sin_sesion") {
    return fallo("NO_AUTENTICADO", requestId);
  }

  return fallo("PERMISO_DENEGADO", requestId, {
    mensaje:
      "Tu usuario esta autenticado pero no tiene una membresia activa en una empresa.",
  });
}

export function tienePermiso(
  contexto: ContextoAcceso,
  permiso: Permiso,
): boolean {
  return contexto.permisos.includes(permiso);
}

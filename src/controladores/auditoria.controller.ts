import { PERMISOS } from "@/config/permisos";
import { fallo, ok } from "@/lib/resultado";
import { requerirContexto, tienePermiso } from "@/auth/requerir-contexto";
import { listarAuditoria as listarAuditoriaRepo } from "@/repositorios/auditoria.repository";
import type { AuditoriaDTO } from "@/types/auditoria";
import type { Resultado } from "@/types/respuestas";

export type AuditoriaVistaDTO = {
  eventos: readonly AuditoriaDTO[];
};

/** CU-23: consulta de auditoria con permiso explicito. */
export async function listarAuditoria(): Promise<Resultado<AuditoriaVistaDTO>> {
  const contextoResultado = await requerirContexto();

  if (!contextoResultado.ok) {
    return contextoResultado;
  }

  const contexto = contextoResultado.datos;

  if (!tienePermiso(contexto, PERMISOS.auditoriaLeer)) {
    return fallo("PERMISO_DENEGADO", contexto.requestId);
  }

  const eventosResultado = await listarAuditoriaRepo(contexto);

  if (!eventosResultado.ok) {
    return eventosResultado;
  }

  return ok({ eventos: eventosResultado.datos }, contexto.requestId);
}

import { fallo, ok } from "@/lib/resultado";
import { crearClienteServidor } from "@/supabase/server";
import type { Database } from "@/supabase/database.types";
import type { AuditoriaDTO } from "@/types/auditoria";
import type { ContextoAcceso } from "@/types/contexto";
import type { Resultado } from "@/types/respuestas";

type AuditoriaRow = Database["public"]["Tables"]["auditoria"]["Row"];
type AuditoriaSeleccionada = Pick<
  AuditoriaRow,
  | "id"
  | "accion"
  | "entidad_tipo"
  | "entidad_id"
  | "instante"
  | "motivo"
  | "request_id"
  | "version_anterior"
  | "version_nueva"
>;

function aAuditoriaDTO(fila: AuditoriaSeleccionada): AuditoriaDTO {
  return {
    id: fila.id,
    accion: fila.accion,
    entidadTipo: fila.entidad_tipo,
    entidadId: fila.entidad_id,
    instante: fila.instante,
    motivo: fila.motivo,
    requestId: fila.request_id,
    versionAnterior: fila.version_anterior,
    versionNueva: fila.version_nueva,
  };
}

export async function listarAuditoria(
  contexto: ContextoAcceso,
  limite = 100,
): Promise<Resultado<AuditoriaDTO[]>> {
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase
    .from("auditoria")
    .select(
      "id,accion,entidad_tipo,entidad_id,instante,motivo,request_id,version_anterior,version_nueva",
    )
    .eq("empresa_id", contexto.empresaId)
    .order("instante", { ascending: false })
    .limit(limite);

  if (error) {
    console.error("No se pudo leer la auditoria.", error.message);
    return fallo("ERROR_INTERNO", contexto.requestId);
  }

  return ok((data ?? []).map(aAuditoriaDTO), contexto.requestId);
}

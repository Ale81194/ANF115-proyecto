import type { UUID } from "@/types/contexto";

export type AuditoriaDTO = {
  id: UUID;
  accion: string;
  entidadTipo: string;
  entidadId: UUID | null;
  instante: string;
  motivo: string | null;
  requestId: string;
  versionAnterior: number | null;
  versionNueva: number | null;
};

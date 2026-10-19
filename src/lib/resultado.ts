import { ErrorDominio, MENSAJES_ERROR, type CodigoError } from "@/lib/errores";
import type { CampoInvalido, Resultado } from "@/types/respuestas";

type OpcionesFallo = {
  mensaje?: string;
  campos?: CampoInvalido[];
  reintentable?: boolean;
};

/** Resultado exitoso de un caso de uso. */
export function ok<T>(datos: T, requestId: string): Resultado<T> {
  return { ok: true, datos, requestId };
}

/** Resultado fallido con un codigo del documento 10. */
export function fallo<T = never>(
  codigo: CodigoError,
  requestId: string,
  opciones: OpcionesFallo = {},
): Resultado<T> {
  return {
    ok: false,
    error: {
      codigo,
      mensaje: opciones.mensaje ?? MENSAJES_ERROR[codigo],
      campos: opciones.campos,
      reintentable: opciones.reintentable ?? false,
    },
    requestId,
  };
}

/**
 * Traduce una excepcion a un contrato publico.
 *
 * Un ErrorDominio conserva codigo y mensaje. Cualquier otro error se convierte
 * en ERROR_INTERNO sin filtrar trazas, SQL ni detalles de infraestructura.
 */
export function desdeError<T = never>(
  error: unknown,
  requestId: string,
): Resultado<T> {
  if (error instanceof ErrorDominio) {
    return fallo(error.codigo, requestId, {
      mensaje: error.message,
      reintentable: error.reintentable,
    });
  }

  return fallo("ERROR_INTERNO", requestId);
}

/** Identificador de solicitud para correlacionar logs y respuestas. */
export function generarRequestId(): string {
  return crypto.randomUUID();
}

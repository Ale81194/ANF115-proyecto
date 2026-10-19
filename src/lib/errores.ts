/**
 * Codigos de error de dominio y su traduccion HTTP.
 *
 * Fuente: docs/tecnico/10_CONTRATOS_Y_CASOS_DE_USO.md, seccion 9.
 */
export const CODIGOS_ERROR = {
  validacionEntrada: "VALIDACION_ENTRADA",
  noAutenticado: "NO_AUTENTICADO",
  permisoDenegado: "PERMISO_DENEGADO",
  recursoNoEncontrado: "RECURSO_NO_ENCONTRADO",
  periodoCerrado: "PERIODO_CERRADO",
  versionObsoleta: "VERSION_OBSOLETA",
  duplicado: "DUPLICADO",
  idempotenciaConflicto: "IDEMPOTENCIA_CONFLICTO",
  loteNoListo: "LOTE_NO_LISTO",
  descuadre: "DESCUADRE",
  datosInsuficientes: "DATOS_INSUFICIENTES",
  archivoNoDisponible: "ARCHIVO_NO_DISPONIBLE",
  limiteExcedido: "LIMITE_EXCEDIDO",
  integracionNoDisponible: "INTEGRACION_NO_DISPONIBLE",
  errorInterno: "ERROR_INTERNO",
} as const;

export type CodigoError = (typeof CODIGOS_ERROR)[keyof typeof CODIGOS_ERROR];

export const ESTADO_HTTP: Readonly<Record<CodigoError, number>> = {
  VALIDACION_ENTRADA: 422,
  NO_AUTENTICADO: 401,
  PERMISO_DENEGADO: 403,
  RECURSO_NO_ENCONTRADO: 404,
  PERIODO_CERRADO: 409,
  VERSION_OBSOLETA: 409,
  DUPLICADO: 409,
  IDEMPOTENCIA_CONFLICTO: 409,
  LOTE_NO_LISTO: 409,
  DESCUADRE: 422,
  DATOS_INSUFICIENTES: 422,
  ARCHIVO_NO_DISPONIBLE: 409,
  LIMITE_EXCEDIDO: 413,
  INTEGRACION_NO_DISPONIBLE: 503,
  ERROR_INTERNO: 500,
};

export const MENSAJES_ERROR: Readonly<Record<CodigoError, string>> = {
  VALIDACION_ENTRADA: "Revisa los campos marcados e intentalo de nuevo.",
  NO_AUTENTICADO: "Tu sesion no es valida. Inicia sesion nuevamente.",
  PERMISO_DENEGADO: "No tenes permiso para realizar esta operacion.",
  RECURSO_NO_ENCONTRADO: "El recurso solicitado no esta disponible.",
  PERIODO_CERRADO: "El periodo de destino esta cerrado.",
  VERSION_OBSOLETA: "El registro cambio desde que lo abriste. Recarga y revisa.",
  DUPLICADO: "Ya existe un registro con ese identificador contable.",
  IDEMPOTENCIA_CONFLICTO:
    "La clave de reintento ya se uso para otra operacion. Genera una nueva.",
  LOTE_NO_LISTO: "El lote tiene errores o cambios pendientes de revisar.",
  DESCUADRE: "Las cifras no cumplen la partida doble o la conciliacion.",
  DATOS_INSUFICIENTES: "Faltan datos para completar la operacion.",
  ARCHIVO_NO_DISPONIBLE: "El archivo todavia no esta listo.",
  LIMITE_EXCEDIDO: "La entrada supera un limite permitido.",
  INTEGRACION_NO_DISPONIBLE:
    "Un servicio necesario no esta disponible. Reintenta en unos minutos.",
  ERROR_INTERNO: "Ocurrio un error inesperado. Usa el identificador de solicitud.",
};

export class ErrorDominio extends Error {
  readonly codigo: CodigoError;
  readonly reintentable: boolean;

  constructor(
    codigo: CodigoError,
    mensaje: string = MENSAJES_ERROR[codigo],
    reintentable = false,
  ) {
    super(mensaje);
    this.name = "ErrorDominio";
    this.codigo = codigo;
    this.reintentable = reintentable;
  }
}

export function estadoHttpPara(codigo: CodigoError): number {
  return ESTADO_HTTP[codigo];
}

export function esCodigoError(valor: string): valor is CodigoError {
  return Object.prototype.hasOwnProperty.call(ESTADO_HTTP, valor);
}

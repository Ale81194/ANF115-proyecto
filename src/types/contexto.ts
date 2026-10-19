import type { Permiso, Rol } from "@/config/permisos";

/**
 * Tipos compartidos de contratos.
 *
 * Un importe viaja como string decimal canonico; una fecha contable como
 * YYYY-MM-DD. La conversion a number no forma parte del transporte ni del
 * calculo.
 */
export type UUID = string;
export type FechaContable = string;
export type Importe = string;
export type DecimalTexto = string;

export type OrigenDatos = "simulado" | "real";

export type BaseTemporal =
  | "movimiento_periodo"
  | "acumulado_ejercicio"
  | "saldo_corte";

/** Contexto creado en el servidor a partir de identidad y membresia verificadas. */
export type ContextoServidor = Readonly<{
  usuarioId: UUID;
  empresaId: UUID;
  permisos: readonly string[];
  origenDatos: OrigenDatos;
  requestId: string;
}>;

/**
 * Contexto de acceso que consume la interfaz.
 *
 * Incluye solo datos de presentacion del actor y su empresa. No contiene
 * secretos ni sustituye la autorizacion de cada caso de uso.
 */
export type ContextoAcceso = Readonly<{
  usuarioId: UUID;
  usuarioNombre: string;
  usuarioCorreo: string;
  empresaId: UUID;
  empresaNombre: string;
  moneda: string;
  origenDatos: OrigenDatos;
  rolCodigo: Rol;
  permisos: readonly Permiso[];
  requestId: string;
}>;

export type EstadoAcceso =
  | { estado: "sin_sesion" }
  | {
      estado: "sin_membresia";
      usuarioId: UUID;
      usuarioNombre: string;
      usuarioCorreo: string;
    }
  | { estado: "ok"; contexto: ContextoAcceso };

export type ConsultaFinanciera = {
  desde: FechaContable;
  hasta: FechaContable;
  corte: FechaContable;
  base: BaseTemporal;
  politicaId: UUID;
};

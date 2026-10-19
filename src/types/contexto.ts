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

export type ConsultaFinanciera = {
  desde: FechaContable;
  hasta: FechaContable;
  corte: FechaContable;
  base: BaseTemporal;
  politicaId: UUID;
};

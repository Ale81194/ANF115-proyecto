import type { ContextoAcceso, FechaContable, UUID } from "@/types/contexto";

/**
 * Tipos de dominio del catalogo y los periodos.
 *
 * Los importes no aparecen aqui: esta fase no calcula resultados. Los codigos
 * de cuenta viajan como texto para conservar puntos, letras y ceros.
 */
export const CLASES_CUENTA = [
  "activo",
  "pasivo",
  "patrimonio",
  "ingreso",
  "gasto",
] as const;

export type ClaseCuenta = (typeof CLASES_CUENTA)[number];

export const NATURALEZAS_CUENTA = ["deudora", "acreedora"] as const;

export type NaturalezaCuenta = (typeof NATURALEZAS_CUENTA)[number];

export const ESTADOS_FINANCIEROS = [
  "resultados",
  "balance",
  "patrimonio",
] as const;

export type EstadoFinanciero = (typeof ESTADOS_FINANCIEROS)[number];

export const ESTADOS_PERIODO = ["abierto", "cerrado"] as const;

export type EstadoPeriodo = (typeof ESTADOS_PERIODO)[number];

export type RubroDTO = {
  id: UUID;
  codigo: string;
  nombre: string;
  estadoFinanciero: EstadoFinanciero;
  padreId: UUID | null;
  signoPresentacion: number;
};

export type CuentaDTO = {
  id: UUID;
  codigo: string;
  nombre: string;
  padreId: UUID | null;
  clase: ClaseCuenta;
  naturaleza: NaturalezaCuenta;
  rubroId: UUID;
  rubroNombre: string;
  esCorrectora: boolean;
  permiteMovimiento: boolean;
  activa: boolean;
  vigenciaDesde: FechaContable;
  vigenciaHasta: FechaContable | null;
  version: number;
};

export type FilaCuentaDTO = CuentaDTO & {
  profundidad: number;
};

export type ResumenCatalogo = {
  total: number;
  movimiento: number;
  agrupadoras: number;
  inactivas: number;
  correctoras: number;
};

export type PeriodoDTO = {
  id: UUID;
  anio: number;
  mes: number;
  inicio: FechaContable;
  fin: FechaContable;
  estado: EstadoPeriodo;
  revision: number;
  siguienteNumeroAsiento: number;
  version: number;
};

export type PeriodoVistaDTO = PeriodoDTO & {
  etiqueta: string;
};

export type ResumenPeriodos = {
  total: number;
  abiertos: number;
  cerrados: number;
  ultimoAnio: number | null;
};

export type OpcionCuentaDTO = {
  id: UUID;
  codigo: string;
  nombre: string;
  permiteMovimiento: boolean;
};

export type OpcionesCatalogoDTO = {
  rubros: readonly RubroDTO[];
  cuentasPadre: readonly OpcionCuentaDTO[];
  cuenta?: CuentaDTO;
};

export type ComandoGuardarCuenta = {
  cuentaId: UUID | null;
  codigo: string;
  nombre: string;
  padreId: UUID | null;
  clase: ClaseCuenta;
  naturaleza: NaturalezaCuenta;
  rubroId: UUID;
  esCorrectora: boolean;
  permiteMovimiento: boolean;
  activa: boolean;
  vigenciaDesde: FechaContable;
  vigenciaHasta: FechaContable | null;
  versionEsperada: number | null;
  motivo: string | null;
  claveIdempotencia: string | null;
};

export type CuentaGuardadaDTO = {
  id: UUID;
  version: number;
  revisionCatalogo: number;
};

export type ComandoCrearPeriodo = {
  anio: number;
  mes: number;
  claveIdempotencia: string | null;
};

export type PeriodoCreadoDTO = {
  id: UUID;
  version: number;
};

export type CatalogoVistaDTO = {
  contexto: ContextoAcceso;
  cuentas: readonly CuentaDTO[];
  filas: readonly FilaCuentaDTO[];
  resumen: ResumenCatalogo;
  puedeEditar: boolean;
  busqueda: string;
};

export type CuentaDetalleVistaDTO = {
  contexto: ContextoAcceso;
  cuenta: CuentaDTO;
  puedeEditar: boolean;
};

export type PeriodosVistaDTO = {
  contexto: ContextoAcceso;
  periodos: readonly PeriodoVistaDTO[];
  resumen: ResumenPeriodos;
  puedeGestionar: boolean;
  anioFiltro: number | null;
  aniosDisponibles: readonly number[];
};

export type DashboardVistaDTO = {
  contexto: ContextoAcceso;
  cuentas: ResumenCatalogo;
  periodos: ResumenPeriodos;
  ultimoPeriodo: PeriodoVistaDTO | null;
  puedePublicarCatalogo: boolean;
  puedeGestionarPeriodos: boolean;
};

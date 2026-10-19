/**
 * Presentacion de importes monetarios.
 *
 * Recibe el string canonico del contrato y nunca convierte a number: formatea
 * los digitos para no perder precision. La logica de calculo vive en servicios.
 */
const PATRON_IMPORTE = /^(-)?(\d+)(?:\.(\d{1,2}))?$/;

export function formatearImporte(importe: string): string {
  const coincidencia = PATRON_IMPORTE.exec(importe.trim());

  if (!coincidencia) {
    throw new Error(`Importe no canonico: ${importe}`);
  }

  const [, signo, entero, decimales = ""] = coincidencia;
  const agrupado = entero.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const centavos = decimales.padEnd(2, "0").slice(0, 2);

  return `${signo ?? ""}$${agrupado}.${centavos}`;
}

export function esImporteNegativo(importe: string): boolean {
  return importe.trim().startsWith("-");
}

export const formatearUSD = formatearImporte;

import Decimal from "decimal.js";

/**
 * Configuracion unica de aritmetica decimal del proyecto.
 *
 * Precision 40 y ROUND_HALF_UP segun P-CARLITOS-1. La configuracion es fija:
 * no cambia por usuario, empresa ni formula. Los servicios reciben la politica
 * como argumento cuando necesitan dejarla registrada en una ejecucion.
 */
Decimal.set({
  precision: 40,
  rounding: Decimal.ROUND_HALF_UP,
  toExpNeg: -40,
  toExpPos: 40,
});

export { Decimal };

export const POLITICA_DECIMAL = {
  codigo: "P-CARLITOS-1",
  precision: 40,
  redondeo: "ROUND_HALF_UP",
  escalaMonetaria: 2,
} as const;

/** Convierte un importe canonico a Decimal sin pasar por number. */
export function aDecimal(importe: string): Decimal {
  if (!/^-?\d+(?:\.\d{1,2})?$/.test(importe)) {
    throw new Error(`Importe no canonico: ${importe}`);
  }
  return new Decimal(importe);
}

/** Redondea a la escala monetaria y devuelve string canonico. */
export function aImporteCanonico(valor: Decimal.Value): string {
  return new Decimal(valor).toFixed(POLITICA_DECIMAL.escalaMonetaria);
}

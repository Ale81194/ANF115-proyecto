import { Decimal } from "@/lib/decimal";

/** Presentation ratio only: returns an exact CSS percentage string. */
export function anchoComparativo(importe: string, maximo: string): string {
  const max = new Decimal(maximo);
  return max.gt(0) ? new Decimal(importe).div(max).times(100).toFixed(2) : "0.00";
}

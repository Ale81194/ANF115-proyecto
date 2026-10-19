import { MESES } from "@/config/calendario";
import { esFechaContable } from "@/lib/fechas";
import type {
  PeriodoDTO,
  ResumenPeriodos,
} from "@/types/contabilidad";

function dosDigitos(valor: number): string {
  return valor.toString().padStart(2, "0");
}

/** Calcula el primer y ultimo dia civil del mes sin usar la zona local. */
export function rangoPeriodo(
  anio: number,
  mes: number,
): { inicio: string; fin: string } {
  if (!Number.isInteger(anio) || anio < 2000 || anio > 2100) {
    throw new Error(`Año invalido: ${anio}`);
  }

  if (!Number.isInteger(mes) || mes < 1 || mes > 12) {
    throw new Error(`Mes invalido: ${mes}`);
  }

  const ultimoDia = new Date(Date.UTC(anio, mes, 0)).getUTCDate();
  const inicio = `${anio}-${dosDigitos(mes)}-01`;
  const fin = `${anio}-${dosDigitos(mes)}-${dosDigitos(ultimoDia)}`;

  if (!esFechaContable(inicio) || !esFechaContable(fin)) {
    throw new Error("El rango de periodo no es una fecha contable valida.");
  }

  return { inicio, fin };
}

export function etiquetaPeriodo(anio: number, mes: number): string {
  return `${MESES[mes - 1]} ${anio}`;
}

export function resumirPeriodos(
  periodos: readonly PeriodoDTO[],
): ResumenPeriodos {
  const abiertos = periodos.filter((periodo) => periodo.estado === "abierto")
    .length;
  const cerrados = periodos.filter((periodo) => periodo.estado === "cerrado")
    .length;
  const ultimoAnio =
    periodos.length === 0
      ? null
      : Math.max(...periodos.map((periodo) => periodo.anio));

  return {
    total: periodos.length,
    abiertos,
    cerrados,
    ultimoAnio,
  };
}

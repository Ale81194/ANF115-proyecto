/**
 * Fechas contables.
 *
 * Una fecha contable es un dia real en formato YYYY-MM-DD, sin hora ni zona
 * horaria. Convertirla a Date local puede desplazarla: estas funciones usan
 * UTC solo para validar, nunca para reinterpretar el dia contable.
 */
const PATRON_FECHA = /^(\d{4})-(\d{2})-(\d{2})$/;

export function esFechaContable(valor: string): boolean {
  const coincidencia = PATRON_FECHA.exec(valor);

  if (!coincidencia) {
    return false;
  }

  const anio = Number(coincidencia[1]);
  const mes = Number(coincidencia[2]);
  const dia = Number(coincidencia[3]);

  if (mes < 1 || mes > 12 || dia < 1 || dia > 31) {
    return false;
  }

  const fecha = new Date(Date.UTC(anio, mes - 1, dia));

  return (
    fecha.getUTCFullYear() === anio &&
    fecha.getUTCMonth() === mes - 1 &&
    fecha.getUTCDate() === dia
  );
}

export function exigirFechaContable(valor: string): string {
  if (!esFechaContable(valor)) {
    throw new Error(`Fecha contable invalida: ${valor}`);
  }

  return valor;
}

/** Convierte un instante a su dia UTC; usar solo para auditoria, no para el diario. */
export function fechaContableDesdeDate(fecha: Date): string {
  if (Number.isNaN(fecha.getTime())) {
    throw new Error("Fecha invalida");
  }

  const anio = fecha.getUTCFullYear().toString().padStart(4, "0");
  const mes = (fecha.getUTCMonth() + 1).toString().padStart(2, "0");
  const dia = fecha.getUTCDate().toString().padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

/** Compara dos fechas ISO sin construir Date. */
export function compararFechasContables(a: string, b: string): number {
  return exigirFechaContable(a).localeCompare(exigirFechaContable(b));
}

/** Presenta una fecha contable como DD/MM/AAAA sin cambiar de zona. */
export function formatearFechaCorta(valor: string): string {
  const [anio, mes, dia] = exigirFechaContable(valor).split("-");
  return `${dia}/${mes}/${anio}`;
}

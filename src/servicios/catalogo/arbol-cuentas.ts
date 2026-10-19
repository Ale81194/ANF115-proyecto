import type {
  CuentaDTO,
  FilaCuentaDTO,
  ResumenCatalogo,
} from "@/types/contabilidad";

/**
 * Compara codigos contables por segmentos.
 *
 * El codigo es texto: "1.10" debe ordenarse despues de "1.2" sin convertirlo
 * a numero ni perder puntos, letras o ceros.
 */
export function compararCodigos(a: string, b: string): number {
  const segmentosA = a.split(/(\d+)/).filter(Boolean);
  const segmentosB = b.split(/(\d+)/).filter(Boolean);
  const largo = Math.max(segmentosA.length, segmentosB.length);

  for (let indice = 0; indice < largo; indice += 1) {
    const parteA = segmentosA[indice];
    const parteB = segmentosB[indice];

    if (parteA === undefined) {
      return -1;
    }

    if (parteB === undefined) {
      return 1;
    }

    const numeroA = /^\d+$/.test(parteA) ? Number(parteA) : null;
    const numeroB = /^\d+$/.test(parteB) ? Number(parteB) : null;

    if (numeroA !== null && numeroB !== null) {
      if (numeroA !== numeroB) {
        return numeroA - numeroB;
      }
      continue;
    }

    const comparacion = parteA.localeCompare(parteB, "es", {
      sensitivity: "base",
    });

    if (comparacion !== 0) {
      return comparacion;
    }
  }

  return 0;
}

type NodoCuenta = CuentaDTO & {
  hijos: NodoCuenta[];
};

export type { NodoCuenta };

function ordenarNodos(nodos: NodoCuenta[]): void {
  nodos.sort((a, b) => compararCodigos(a.codigo, b.codigo));

  for (const nodo of nodos) {
    ordenarNodos(nodo.hijos);
  }
}

/**
 * Construye el arbol de cuentas a partir de una lista plana.
 *
 * Una cuenta cuyo padre no esta en la lista se presenta como raiz para no
 * ocultar datos; la integridad de la relacion se valida en PostgreSQL.
 */
export function construirArbolCuentas(
  cuentas: readonly CuentaDTO[],
): NodoCuenta[] {
  const porId = new Map<string, NodoCuenta>();
  const raices: NodoCuenta[] = [];

  for (const cuenta of cuentas) {
    porId.set(cuenta.id, { ...cuenta, hijos: [] });
  }

  for (const cuenta of cuentas) {
    const nodo = porId.get(cuenta.id);

    if (!nodo) {
      continue;
    }

    const padre = cuenta.padreId ? porId.get(cuenta.padreId) : undefined;

    if (padre) {
      padre.hijos.push(nodo);
    } else {
      raices.push(nodo);
    }
  }

  ordenarNodos(raices);
  return raices;
}

/** Aplana el arbol en el orden visual, conservando la profundidad. */
export function aplanarArbol(
  arbol: readonly NodoCuenta[],
  profundidad = 0,
): FilaCuentaDTO[] {
  const filas: FilaCuentaDTO[] = [];

  for (const nodo of arbol) {
    const { hijos, ...cuenta } = nodo;
    filas.push({ ...cuenta, profundidad });
    filas.push(...aplanarArbol(hijos, profundidad + 1));
  }

  return filas;
}

export function construirFilasCatalogo(
  cuentas: readonly CuentaDTO[],
): FilaCuentaDTO[] {
  return aplanarArbol(construirArbolCuentas(cuentas));
}

export function resumirCatalogo(
  cuentas: readonly CuentaDTO[],
): ResumenCatalogo {
  let movimiento = 0;
  let agrupadoras = 0;
  let inactivas = 0;
  let correctoras = 0;

  for (const cuenta of cuentas) {
    if (cuenta.permiteMovimiento) {
      movimiento += 1;
    } else {
      agrupadoras += 1;
    }

    if (!cuenta.activa) {
      inactivas += 1;
    }

    if (cuenta.esCorrectora) {
      correctoras += 1;
    }
  }

  return {
    total: cuentas.length,
    movimiento,
    agrupadoras,
    inactivas,
    correctoras,
  };
}

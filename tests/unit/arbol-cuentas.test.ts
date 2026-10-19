import { describe, expect, it } from "vitest";
import {
  compararCodigos,
  construirArbolCuentas,
  construirFilasCatalogo,
  resumirCatalogo,
} from "@/servicios/catalogo/arbol-cuentas";
import type { CuentaDTO } from "@/types/contabilidad";

function cuenta(
  id: string,
  codigo: string,
  padreId: string | null,
  extra: Partial<CuentaDTO> = {},
): CuentaDTO {
  return {
    id,
    codigo,
    nombre: `Cuenta ${codigo}`,
    padreId,
    clase: "activo",
    naturaleza: "deudora",
    rubroId: "rubro-1",
    rubroNombre: "Activo corriente",
    esCorrectora: false,
    permiteMovimiento: true,
    activa: true,
    vigenciaDesde: "2024-01-01",
    vigenciaHasta: null,
    version: 1,
    ...extra,
  };
}

describe("arbol de cuentas", () => {
  it("ordena codigos por segmentos numericos, no por texto", () => {
    const codigos = ["1.10", "1.2", "1.1.1", "1.1"];

    expect(codigos.sort(compararCodigos)).toEqual([
      "1.1",
      "1.1.1",
      "1.2",
      "1.10",
    ]);
  });

  it("construye jerarquia y calcula profundidad", () => {
    const filas = construirFilasCatalogo([
      cuenta("1", "1", null, { permiteMovimiento: false }),
      cuenta("1.1", "1.1", "1", { permiteMovimiento: false }),
      cuenta("1.1.1", "1.1.1", "1.1"),
      cuenta("1.1.2", "1.1.2", "1.1"),
    ]);

    expect(filas.map((fila) => fila.codigo)).toEqual([
      "1",
      "1.1",
      "1.1.1",
      "1.1.2",
    ]);
    expect(filas.map((fila) => fila.profundidad)).toEqual([0, 1, 2, 2]);
  });

  it("presenta como raiz una cuenta cuyo padre no esta en la lista", () => {
    const arbol = construirArbolCuentas([
      cuenta("hija", "1.1.1", "padre-ausente"),
    ]);

    expect(arbol).toHaveLength(1);
    expect(arbol[0]?.codigo).toBe("1.1.1");
  });

  it("resume movimiento, agrupadoras, inactivas y correctoras", () => {
    const resumen = resumirCatalogo([
      cuenta("1", "1", null, { permiteMovimiento: false }),
      cuenta("2", "1.1", "1"),
      cuenta("3", "1.2", "1", { activa: false, esCorrectora: true }),
    ]);

    expect(resumen).toEqual({
      total: 3,
      movimiento: 2,
      agrupadoras: 1,
      inactivas: 1,
      correctoras: 1,
    });
  });
});

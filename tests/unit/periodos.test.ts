import { describe, expect, it } from "vitest";
import {
  etiquetaPeriodo,
  rangoPeriodo,
  resumirPeriodos,
} from "@/servicios/periodos/calendario";
import type { PeriodoDTO } from "@/types/contabilidad";

function periodo(
  anio: number,
  mes: number,
  estado: PeriodoDTO["estado"] = "abierto",
): PeriodoDTO {
  const rango = rangoPeriodo(anio, mes);

  return {
    id: `${anio}-${mes}`,
    anio,
    mes,
    inicio: rango.inicio,
    fin: rango.fin,
    estado,
    revision: 1,
    siguienteNumeroAsiento: 1,
    version: 1,
  };
}

describe("calendario de periodos", () => {
  it("calcula un mes de 31 dias sin desplazamiento horario", () => {
    expect(rangoPeriodo(2026, 12)).toEqual({
      inicio: "2026-12-01",
      fin: "2026-12-31",
    });
  });

  it("respeta febrero en año bisiesto y no bisiesto", () => {
    expect(rangoPeriodo(2024, 2).fin).toBe("2024-02-29");
    expect(rangoPeriodo(2026, 2).fin).toBe("2026-02-28");
  });

  it("rechaza año y mes fuera de rango", () => {
    expect(() => rangoPeriodo(1999, 1)).toThrow("Año invalido");
    expect(() => rangoPeriodo(2026, 13)).toThrow("Mes invalido");
    expect(() => rangoPeriodo(2026.5, 1)).toThrow("Año invalido");
  });

  it("etiqueta el periodo en espanol", () => {
    expect(etiquetaPeriodo(2026, 10)).toBe("Octubre 2026");
  });

  it("resume estados y ultimo año", () => {
    expect(
      resumirPeriodos([
        periodo(2024, 12, "cerrado"),
        periodo(2025, 1, "cerrado"),
        periodo(2026, 1),
        periodo(2026, 2),
      ]),
    ).toEqual({
      total: 4,
      abiertos: 2,
      cerrados: 2,
      ultimoAnio: 2026,
    });
  });
});

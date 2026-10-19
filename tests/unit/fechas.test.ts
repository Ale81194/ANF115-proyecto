import { describe, expect, it } from "vitest";
import {
  compararFechasContables,
  esFechaContable,
  exigirFechaContable,
  fechaContableDesdeDate,
  formatearFechaCorta,
} from "@/lib/fechas";

describe("fechas contables", () => {
  it("acepta dias reales en formato ISO", () => {
    expect(esFechaContable("2026-10-19")).toBe(true);
    expect(esFechaContable("2024-02-29")).toBe(true);
  });

  it("rechaza dias inexistentes y formatos ambiguos", () => {
    expect(esFechaContable("2023-02-29")).toBe(false);
    expect(esFechaContable("2026-04-31")).toBe(false);
    expect(esFechaContable("2026-13-01")).toBe(false);
    expect(esFechaContable("2026-1-01")).toBe(false);
    expect(esFechaContable("2026-01-01T00:00:00Z")).toBe(false);
    expect(esFechaContable("19/10/2026")).toBe(false);
  });

  it("no desplaza el dia al convertir desde Date", () => {
    expect(fechaContableDesdeDate(new Date(Date.UTC(2026, 9, 19, 23, 30)))).toBe(
      "2026-10-19",
    );
    expect(() => fechaContableDesdeDate(new Date("invalida"))).toThrow(
      "Fecha invalida",
    );
  });

  it("compara y presenta sin construir Date", () => {
    expect(compararFechasContables("2026-01-31", "2026-02-01")).toBeLessThan(0);
    expect(compararFechasContables("2026-02-01", "2026-02-01")).toBe(0);
    expect(formatearFechaCorta("2026-10-19")).toBe("19/10/2026");
  });

  it("exige fechas validas", () => {
    expect(exigirFechaContable("2026-10-19")).toBe("2026-10-19");
    expect(() => exigirFechaContable("2026-02-30")).toThrow(
      "Fecha contable invalida",
    );
  });
});

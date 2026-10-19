import { describe, expect, it } from "vitest";
import {
  crearPeriodoSchema,
  guardarCuentaSchema,
  iniciarSesionSchema,
} from "@/schemas/contabilidad.schema";

const cuentaValida = {
  cuentaId: null,
  codigo: "1.1.7",
  nombre: "Caja chica",
  padreId: null,
  clase: "activo" as const,
  naturaleza: "deudora" as const,
  rubroId: "11111111-1111-4111-8111-111111111111",
  esCorrectora: false,
  permiteMovimiento: true,
  activa: true,
  vigenciaDesde: "2026-01-01",
  vigenciaHasta: null,
  versionEsperada: null,
  motivo: null,
  claveIdempotencia: "22222222-2222-4222-8222-222222222222",
};

describe("esquemas de contabilidad", () => {
  it("acepta una cuenta canonica", () => {
    expect(guardarCuentaSchema.safeParse(cuentaValida).success).toBe(true);
  });

  it("rechaza caracteres ambiguos en el codigo", () => {
    const resultado = guardarCuentaSchema.safeParse({
      ...cuentaValida,
      codigo: "1 1/7",
    });

    expect(resultado.success).toBe(false);
  });

  it("rechaza una fecha contable inexistente", () => {
    const resultado = guardarCuentaSchema.safeParse({
      ...cuentaValida,
      vigenciaDesde: "2026-02-30",
    });

    expect(resultado.success).toBe(false);
  });

  it("rechaza vigencia hasta anterior a vigencia desde", () => {
    const resultado = guardarCuentaSchema.safeParse({
      ...cuentaValida,
      vigenciaDesde: "2026-03-01",
      vigenciaHasta: "2026-02-28",
    });

    expect(resultado.success).toBe(false);
  });

  it("valida año y mes del periodo", () => {
    expect(
      crearPeriodoSchema.safeParse({
        anio: 2026,
        mes: 12,
        claveIdempotencia: null,
      }).success,
    ).toBe(true);

    expect(
      crearPeriodoSchema.safeParse({
        anio: 1999,
        mes: 13,
        claveIdempotencia: null,
      }).success,
    ).toBe(false);
  });

  it("normaliza el correo y exige contrasena", () => {
    const valido = iniciarSesionSchema.safeParse({
      correo: "  admin@carlitos.local ",
      contrasena: "secreta",
    });

    expect(valido.success).toBe(true);
    expect(valido.data?.correo).toBe("admin@carlitos.local");

    expect(
      iniciarSesionSchema.safeParse({
        correo: "no-es-correo",
        contrasena: "",
      }).success,
    ).toBe(false);
  });
});

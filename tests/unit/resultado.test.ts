import { describe, expect, it } from "vitest";
import { ErrorDominio } from "@/lib/errores";
import {
  desdeError,
  fallo,
  generarRequestId,
  ok,
} from "@/lib/resultado";

describe("resultado", () => {
  const requestId = "req-123";

  it("construye un resultado exitoso", () => {
    expect(ok({ total: "10.00" }, requestId)).toEqual({
      ok: true,
      datos: { total: "10.00" },
      requestId,
    });
  });

  it("construye un fallo con mensaje por defecto", () => {
    const resultado = fallo("PERMISO_DENEGADO", requestId);
    expect(resultado.ok).toBe(false);

    if (!resultado.ok) {
      expect(resultado.error.codigo).toBe("PERMISO_DENEGADO");
      expect(resultado.error.reintentable).toBe(false);
      expect(resultado.error.mensaje).toContain("permiso");
    }
  });

  it("acepta campos y reintento explicito", () => {
    const resultado = fallo("VALIDACION_ENTRADA", requestId, {
      campos: [{ ruta: "fecha", codigo: "formato", mensaje: "Invalida" }],
      reintentable: true,
    });

    if (!resultado.ok) {
      expect(resultado.error.campos).toHaveLength(1);
      expect(resultado.error.reintentable).toBe(true);
    }
  });

  it("traduce ErrorDominio sin perder su codigo", () => {
    const resultado = desdeError(
      new ErrorDominio("PERIODO_CERRADO", "Periodo cerrado", true),
      requestId,
    );

    expect(resultado.ok).toBe(false);

    if (!resultado.ok) {
      expect(resultado.error.codigo).toBe("PERIODO_CERRADO");
      expect(resultado.error.mensaje).toBe("Periodo cerrado");
      expect(resultado.error.reintentable).toBe(true);
    }
  });

  it("no filtra detalles de errores inesperados", () => {
    const resultado = desdeError(
      new Error("connection string postgres://secreto"),
      requestId,
    );

    expect(resultado.ok).toBe(false);

    if (!resultado.ok) {
      expect(resultado.error.codigo).toBe("ERROR_INTERNO");
      expect(resultado.error.mensaje).not.toContain("postgres");
    }
  });

  it("genera requestId con formato UUID", () => {
    expect(generarRequestId()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });
});

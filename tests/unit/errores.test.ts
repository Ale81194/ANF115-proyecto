import { describe, expect, it } from "vitest";
import {
  CODIGOS_ERROR,
  ErrorDominio,
  ESTADO_HTTP,
  estadoHttpPara,
  MENSAJES_ERROR,
} from "@/lib/errores";

describe("errores de dominio", () => {
  it("define 15 codigos con estado HTTP y mensaje", () => {
    const codigos = Object.values(CODIGOS_ERROR);
    expect(codigos).toHaveLength(15);
    expect(new Set(codigos).size).toBe(15);

    for (const codigo of codigos) {
      expect(ESTADO_HTTP[codigo]).toBeGreaterThanOrEqual(400);
      expect(MENSAJES_ERROR[codigo].length).toBeGreaterThan(0);
    }
  });

  it("mapea los codigos criticos", () => {
    expect(estadoHttpPara("NO_AUTENTICADO")).toBe(401);
    expect(estadoHttpPara("PERMISO_DENEGADO")).toBe(403);
    expect(estadoHttpPara("VERSION_OBSOLETA")).toBe(409);
    expect(estadoHttpPara("DESCUADRE")).toBe(422);
    expect(estadoHttpPara("ERROR_INTERNO")).toBe(500);
  });

  it("conserva codigo, mensaje y reintento", () => {
    const error = new ErrorDominio("INTEGRACION_NO_DISPONIBLE", undefined, true);
    expect(error.codigo).toBe("INTEGRACION_NO_DISPONIBLE");
    expect(error.message).toBe(MENSAJES_ERROR.INTEGRACION_NO_DISPONIBLE);
    expect(error.reintentable).toBe(true);
  });

  it("usa el mensaje por defecto y no reintenta", () => {
    const error = new ErrorDominio("PERMISO_DENEGADO");
    expect(error.message).toBe("No tenes permiso para realizar esta operacion.");
    expect(error.reintentable).toBe(false);
  });
});

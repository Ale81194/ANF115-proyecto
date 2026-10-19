import { describe, expect, it } from "vitest";
import {
  filtrarNavegacion,
  navegacion,
  navegacionPrincipal,
} from "@/config/navegacion";

describe("navegacion", () => {
  it("agrupa las ocho areas funcionales", () => {
    expect(navegacion).toHaveLength(8);
    expect(new Set(navegacion.map((grupo) => grupo.id)).size).toBe(8);
  });

  it("usa rutas absolutas y sin duplicados", () => {
    const hrefs = [
      navegacionPrincipal.href,
      ...navegacion.flatMap((grupo) => grupo.items.map((item) => item.href)),
    ];

    for (const href of hrefs) {
      expect(href.startsWith("/")).toBe(true);
    }

    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("filtra por permisos y conserva las opciones publicas", () => {
    const grupos = filtrarNavegacion(["finanzas.leer"]);
    const items = grupos.flatMap((grupo) => grupo.items.map((item) => item.href));

    expect(items).toContain("/catalogo");
    expect(items).toContain("/estados");
    expect(items).toContain("/configuracion");
    expect(items).not.toContain("/usuarios");
    expect(items).not.toContain("/auditoria");
  });

  it("sin permisos solo deja opciones sin permiso requerido", () => {
    const grupos = filtrarNavegacion([]);
    const items = grupos.flatMap((grupo) => grupo.items);

    expect(items).toHaveLength(1);
    expect(items[0]?.href).toBe("/configuracion");
  });
});

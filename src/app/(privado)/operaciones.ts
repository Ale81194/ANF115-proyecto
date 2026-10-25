"use server";

import { revalidatePath } from "next/cache";
import { ejecutarOperacion } from "@/controladores/finanzas.controller";
import type { EstadoOperacion } from "@/types/finanzas";

export async function guardarOperacion(_estado: EstadoOperacion, form: FormData): Promise<EstadoOperacion> {
  const input = Object.fromEntries(form.entries());
  const resultado = await ejecutarOperacion(String(input.operacion), {
    ...input, id: input.id || undefined, revision: input.revision || undefined,
    versionEsperada: input.versionEsperada || undefined,
    correo: input.correo || undefined, contrasena: input.contrasena || undefined,
    activo: input.activo === "true",
  });
  if (!resultado.ok) return { ok: false, mensaje: resultado.error.mensaje,
    campos: Object.fromEntries((resultado.error.campos ?? []).map((c) => [c.ruta, c.mensaje])) };
  revalidatePath("/", "layout");
  return { ok: true, mensaje: "Operación confirmada. Los datos se actualizaron." };
}

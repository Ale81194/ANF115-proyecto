"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { rutas } from "@/config/rutas";
import { crearPeriodo } from "@/controladores/periodos.controller";
import { camposDesdeZod } from "@/lib/validacion";
import { crearPeriodoSchema } from "@/schemas/contabilidad.schema";
import type { EstadoFormulario } from "@/types/formularios";

export async function crearPeriodoAction(
  _estado: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const clave = String(formData.get("claveIdempotencia") ?? "").trim();

  const entrada = {
    anio: Number(String(formData.get("anio") ?? "").trim()),
    mes: Number(String(formData.get("mes") ?? "").trim()),
    claveIdempotencia: clave.length > 0 ? clave : null,
  };

  const validacion = crearPeriodoSchema.safeParse(entrada);

  if (!validacion.success) {
    return {
      estado: "error",
      mensaje: "Revisa el año y el mes.",
      campos: camposDesdeZod(validacion.error).map((campo) => ({
        ruta: campo.ruta,
        mensaje: campo.mensaje,
      })),
    };
  }

  const resultado = await crearPeriodo(validacion.data);

  if (!resultado.ok) {
    if (resultado.error.codigo === "NO_AUTENTICADO") {
      redirect(rutas.login);
    }

    return {
      estado: "error",
      mensaje: resultado.error.mensaje,
      campos: resultado.error.campos?.map((campo) => ({
        ruta: campo.ruta,
        mensaje: campo.mensaje,
      })),
    };
  }

  revalidatePath(rutas.periodos.lista);
  revalidatePath(rutas.dashboard);
  redirect(rutas.periodos.lista);
}

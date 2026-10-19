"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { rutas } from "@/config/rutas";
import { guardarCuenta } from "@/controladores/catalogo.controller";
import { camposDesdeZod } from "@/lib/validacion";
import { guardarCuentaSchema } from "@/schemas/contabilidad.schema";
import type { EstadoFormulario } from "@/types/formularios";

function texto(formData: FormData, clave: string): string {
  return String(formData.get(clave) ?? "").trim();
}

function opcional(formData: FormData, clave: string): string | null {
  const valor = texto(formData, clave);
  return valor.length > 0 ? valor : null;
}

function booleano(formData: FormData, clave: string): boolean {
  return formData.get(clave) === "on";
}

export async function guardarCuentaAction(
  _estado: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const versionTexto = texto(formData, "versionEsperada");

  const entrada = {
    cuentaId: opcional(formData, "cuentaId"),
    codigo: texto(formData, "codigo"),
    nombre: texto(formData, "nombre"),
    padreId: opcional(formData, "padreId"),
    clase: texto(formData, "clase"),
    naturaleza: texto(formData, "naturaleza"),
    rubroId: texto(formData, "rubroId"),
    esCorrectora: booleano(formData, "esCorrectora"),
    permiteMovimiento: booleano(formData, "permiteMovimiento"),
    activa: booleano(formData, "activa"),
    vigenciaDesde: texto(formData, "vigenciaDesde"),
    vigenciaHasta: opcional(formData, "vigenciaHasta"),
    versionEsperada: versionTexto.length > 0 ? Number(versionTexto) : null,
    motivo: opcional(formData, "motivo"),
    claveIdempotencia: opcional(formData, "claveIdempotencia"),
  };

  const validacion = guardarCuentaSchema.safeParse(entrada);

  if (!validacion.success) {
    return {
      estado: "error",
      mensaje: "Revisa los campos marcados.",
      campos: camposDesdeZod(validacion.error).map((campo) => ({
        ruta: campo.ruta,
        mensaje: campo.mensaje,
      })),
    };
  }

  if (validacion.data.cuentaId && !validacion.data.motivo) {
    return {
      estado: "error",
      mensaje: "El cambio de una cuenta existente exige un motivo.",
      campos: [
        {
          ruta: "motivo",
          mensaje: "Explica brevemente el cambio para la auditoria.",
        },
      ],
    };
  }

  const resultado = await guardarCuenta(validacion.data);

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

  revalidatePath(rutas.catalogo.lista);
  revalidatePath(rutas.dashboard);
  revalidatePath(rutas.catalogo.detalle(resultado.datos.id));
  redirect(rutas.catalogo.lista);
}

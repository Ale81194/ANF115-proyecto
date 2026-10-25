"use server";
import { solicitarRecuperacion, restablecerContrasena } from "@/controladores/recuperacion.controller";
import type { EstadoOperacion } from "@/types/finanzas";
import { redirect } from "next/navigation";
import { rutas } from "@/config/rutas";

export async function recuperarAccesoAction(_estado: EstadoOperacion, form: FormData): Promise<EstadoOperacion> {
  const r = await solicitarRecuperacion(form.get("correo"));
  return r.ok ? { ok: true, mensaje: "Si la cuenta existe, recibirá un enlace. Revise el correo y espere antes de solicitar otro." }
    : { ok: false, mensaje: r.error.mensaje };
}

export async function restablecerAccesoAction(_estado: EstadoOperacion, form: FormData): Promise<EstadoOperacion> {
  const r = await restablecerContrasena({ contrasena: form.get("contrasena"), confirmacion: form.get("confirmacion") });
  if (r.ok) redirect(rutas.login);
  return { ok: false, mensaje: r.error.mensaje };
}

import "server-only";

import { fallo, generarRequestId, ok } from "@/lib/resultado";
import { crearClienteServidor } from "@/supabase/server";
import type { EntradaIniciarSesion } from "@/schemas/contabilidad.schema";
import type { Resultado } from "@/types/respuestas";

export type SesionIniciadaDTO = {
  usuarioId: string;
};

/**
 * Verifica credenciales con Supabase Auth.
 *
 * Un inicio exitoso no concede datos financieros: la membresia se resuelve
 * despues con `resolverContextoActual`.
 */
export async function iniciarSesion(
  entrada: EntradaIniciarSesion,
): Promise<Resultado<SesionIniciadaDTO>> {
  const requestId = generarRequestId();
  const supabase = await crearClienteServidor();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: entrada.correo,
    password: entrada.contrasena,
  });

  if (error || !data.user) {
    return fallo("NO_AUTENTICADO", requestId, {
      mensaje: "Correo o contrasena incorrectos.",
    });
  }

  return ok({ usuarioId: data.user.id }, requestId);
}

import "server-only";

import { crearClienteServidor } from "@/supabase/server";

/** Cierra la sesion de Supabase y elimina sus cookies. */
export async function cerrarSesion(): Promise<void> {
  const supabase = await crearClienteServidor();
  await supabase.auth.signOut();
}

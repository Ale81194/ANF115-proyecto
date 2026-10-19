import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { obtenerEnvServidor } from "@/config/env.server";

/**
 * Cliente de servidor por solicitud.
 *
 * No se almacena en un singleton: cookies, usuario y permisos no se comparten
 * entre solicitudes. La sesion se verifica ademas en cada caso de uso.
 */
export async function crearClienteServidor() {
  const env = obtenerEnvServidor();
  const cookieStore = await cookies();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Un Server Component no puede escribir cookies. El proxy o una
            // Server Action renuevan la sesion; la lectura sigue siendo valida.
          }
        },
      },
    },
  );
}

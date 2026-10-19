import "server-only";

import { createClient } from "@supabase/supabase-js";
import { obtenerEnvServidor } from "@/config/env.server";
import type { Database } from "@/supabase/database.types";

/**
 * Cliente administrativo reservado a gestion autorizada de Auth y scripts
 * locales. No se importa desde repositorios financieros ni desde componentes.
 */
export function crearClienteAdmin() {
  const env = obtenerEnvServidor();

  if (!env.SUPABASE_ADMIN_KEY) {
    throw new Error(
      "SUPABASE_ADMIN_KEY no esta configurada. Es obligatoria para tareas administrativas locales.",
    );
  }

  return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_ADMIN_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { leerEnvPublico } from "@/config/env.public";
import type { Database } from "@/supabase/database.types";

let cliente: SupabaseClient<Database> | null = null;

/**
 * Cliente de navegador para Auth y operaciones permitidas por RLS.
 *
 * No se usa para DML financiero directo ni recibe credenciales administrativas.
 */
export function obtenerClienteNavegador(): SupabaseClient<Database> {
  if (cliente) {
    return cliente;
  }

  const env = leerEnvPublico();

  if (!env) {
    throw new Error(
      "Supabase no esta configurado: faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  cliente = createBrowserClient<Database>(env.supabaseUrl, env.supabaseKey);
  return cliente;
}

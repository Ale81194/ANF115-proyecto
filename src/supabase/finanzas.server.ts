import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { obtenerEnvServidor } from "@/config/env.server";
import type { FinanzasDatabase } from "./finanzas.types";

export async function crearClienteFinanzas() {
  const env = obtenerEnvServidor();
  const store = await cookies();
  return createServerClient<FinanzasDatabase>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (values) => {
        try { values.forEach(({ name, value, options }) => store.set(name, value, options)); }
        catch { /* Server Components rely on the session proxy to refresh cookies. */ }
      },
    },
  });
}

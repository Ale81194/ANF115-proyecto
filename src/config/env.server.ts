import "server-only";
import { z } from "zod";

/**
 * Variables exclusivas del servidor.
 *
 * La validacion es lazy: importar este modulo no rompe el build ni el
 * cascaron cuando todavia no existe .env.local. El primer acceso a Supabase
 * exige configuracion completa.
 */
const esquemaServidor = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  SUPABASE_ADMIN_KEY: z.string().min(1).optional(),
  APP_ORIGIN: z.url(),
  APP_ENV: z.enum(["local", "test", "desarrollo"]),
  DEMO_SEED_ENABLED: z.enum(["true", "false"]).default("false"),
});

export type EnvServidor = z.infer<typeof esquemaServidor>;

let cache: EnvServidor | null = null;

export function obtenerEnvServidor(): EnvServidor {
  if (cache) {
    return cache;
  }

  const resultado = esquemaServidor.safeParse(process.env);

  if (!resultado.success) {
    const detalle = resultado.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Configuracion del servidor incompleta: ${detalle}`);
  }

  cache = resultado.data;
  return cache;
}

/** Permite distinguir "sin configurar" de "configuracion invalida". */
export function entornoServidorConfigurado(): boolean {
  return esquemaServidor.safeParse(process.env).success;
}

export function esEntornoLocal(): boolean {
  const appEnv = process.env.APP_ENV;
  return appEnv === "local" || appEnv === "test";
}

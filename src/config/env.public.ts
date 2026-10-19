/**
 * Variables publicas disponibles en navegador y servidor.
 *
 * No incluye credenciales administrativas. La clave publica no concede acceso
 * por si sola: PostgreSQL aplica RLS y permisos en cada operacion.
 */
export type EnvPublico = Readonly<{
  supabaseUrl: string;
  supabaseKey: string;
}>;

/** Devuelve null cuando el entorno aun no esta configurado (cascaron). */
export function leerEnvPublico(): EnvPublico | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  return { supabaseUrl, supabaseKey };
}

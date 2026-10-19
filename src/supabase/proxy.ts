import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { leerEnvPublico } from "@/config/env.public";

/**
 * Renueva la sesion de Supabase antes de renderizar.
 *
 * En el cascaron, si el entorno local no esta configurado, deja pasar la
 * solicitud para que las pantallas puedan revisarse sin Docker. La proteccion
 * real de datos empieza en la fase 01: proxy, pagina, controlador y RLS.
 */
export async function actualizarSesion(request: NextRequest) {
  let respuesta = NextResponse.next({ request });
  const env = leerEnvPublico();

  if (!env) {
    return respuesta;
  }

  const supabase = createServerClient(env.supabaseUrl, env.supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        respuesta = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          respuesta.cookies.set(name, value, options);
        });
      },
    },
  });

  try {
    await supabase.auth.getClaims();
  } catch {
    // Sin sesion valida se continua; el caso de uso resolvera el acceso.
  }

  return respuesta;
}

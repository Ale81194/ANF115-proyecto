import "server-only";

import { z } from "zod";
import { esPermisoConocido, esRol, type Permiso } from "@/config/permisos";
import { generarRequestId } from "@/lib/resultado";
import { crearClienteServidor } from "@/supabase/server";
import type { EstadoAcceso, OrigenDatos } from "@/types/contexto";

const origenSchema = z.enum(["simulado", "real"]);
const permisosSchema = z.array(z.object({ codigo: z.string() }));

function nombreDesdeCorreo(correo: string): string {
  const local = correo.split("@")[0]?.trim();
  return local && local.length > 0 ? local : "Usuario";
}

function primerObjeto<T>(valor: T | T[] | null | undefined): T | null {
  if (Array.isArray(valor)) {
    return valor[0] ?? null;
  }

  return valor ?? null;
}

/**
 * Resuelve identidad, empresa, rol y permisos efectivos.
 *
 * La identidad se verifica con Supabase Auth. La membresia y los permisos se
 * leen de PostgreSQL bajo RLS; un rol enviado por el navegador nunca se usa.
 */
export async function resolverContextoActual(): Promise<EstadoAcceso> {
  const supabase = await crearClienteServidor();
  const {
    data: { user },
    error: errorUsuario,
  } = await supabase.auth.getUser();

  if (errorUsuario || !user) {
    return { estado: "sin_sesion" };
  }

  const correo = user.email ?? "";
  const { data: perfil } = await supabase
    .from("perfiles")
    .select("nombre_visible")
    .eq("id", user.id)
    .maybeSingle();

  const nombrePerfil =
    perfil?.nombre_visible ??
    (typeof user.user_metadata?.nombre_visible === "string"
      ? user.user_metadata.nombre_visible.trim()
      : "") ??
    "";

  const nombre =
    nombrePerfil.length > 0 ? nombrePerfil : nombreDesdeCorreo(correo);

  const { data: membresia, error: errorMembresia } = await supabase
    .from("membresias_empresa")
    .select(
      "empresa_id, activa, version, empresas(id, nombre, moneda, origen_datos, zona_horaria, revision_datos, revision_catalogo), roles(codigo, nombre)",
    )
    .eq("usuario_id", user.id)
    .eq("activa", true)
    .order("creado_en", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (errorMembresia) {
    throw new Error("No se pudo resolver la membresia activa.");
  }

  const empresa = primerObjeto(membresia?.empresas);
  const rol = primerObjeto(membresia?.roles);

  if (!membresia || !empresa || !rol) {
    return {
      estado: "sin_membresia",
      usuarioId: user.id,
      usuarioNombre: nombre,
      usuarioCorreo: correo,
    };
  }

  const origen = origenSchema.safeParse(empresa.origen_datos);

  if (!origen.success || !esRol(rol.codigo)) {
    throw new Error("La configuracion de acceso de la empresa no es valida.");
  }

  const { data: permisosData, error: errorPermisos } = await supabase.rpc(
    "mis_permisos",
    { p_empresa_id: membresia.empresa_id },
  );

  if (errorPermisos) {
    throw new Error("No se pudieron resolver los permisos efectivos.");
  }

  const permisosValidados = permisosSchema.safeParse(permisosData);
  const permisos: Permiso[] = (permisosValidados.success
    ? permisosValidados.data
    : []
  )
    .map((permiso) => permiso.codigo)
    .filter(esPermisoConocido);

  return {
    estado: "ok",
    contexto: {
      usuarioId: user.id,
      usuarioNombre: nombre,
      usuarioCorreo: correo,
      empresaId: membresia.empresa_id,
      empresaNombre: empresa.nombre,
      moneda: empresa.moneda,
      origenDatos: origen.data as OrigenDatos,
      rolCodigo: rol.codigo,
      permisos,
      requestId: generarRequestId(),
    },
  };
}

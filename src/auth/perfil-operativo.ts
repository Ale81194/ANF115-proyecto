import "server-only";
import { crearClienteFinanzas } from "@/supabase/finanzas.server";
import { ErrorDominio } from "@/lib/errores";

export async function requerirPerfilOperativo(administrador = false) {
  const cliente = await crearClienteFinanzas();
  const { data: { user }, error } = await cliente.auth.getUser();
  if (error || !user) throw new ErrorDominio("NO_AUTENTICADO");
  const { data: perfil, error: perfilError } = await cliente.from("perfiles")
    .select("usuario_id,nombre,rol,activo,actualizado_en").eq("usuario_id", user.id).maybeSingle();
  if (perfilError) throw new ErrorDominio("INTEGRACION_NO_DISPONIBLE", "No se pudo consultar el perfil. Verifique Supabase local y las migraciones.");
  if (!perfil?.activo || (administrador && perfil.rol !== "administrador")) throw new ErrorDominio("PERMISO_DENEGADO");
  return { cliente, perfil, user };
}

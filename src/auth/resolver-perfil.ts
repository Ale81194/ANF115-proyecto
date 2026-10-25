import "server-only";
import { crearClienteFinanzas } from "@/supabase/finanzas.server";
import { PERMISOS_POR_ROL } from "@/config/permisos";
import { generarRequestId } from "@/lib/resultado";
import type { EstadoAcceso } from "@/types/contexto";

export async function resolverPerfilActual(): Promise<EstadoAcceso> {
  const cliente = await crearClienteFinanzas();
  const { data: { user }, error } = await cliente.auth.getUser();
  if (error || !user) return { estado: "sin_sesion" };
  const { data: perfil, error: perfilError } = await cliente.from("perfiles")
    .select("usuario_id,nombre,rol,activo,actualizado_en").eq("usuario_id", user.id).maybeSingle();
  if (perfilError) throw new Error("No se pudo consultar el modelo operativo. Verifique la migración local.");
  if (!perfil?.activo) return {
    estado: "sin_membresia", usuarioId: user.id,
    usuarioNombre: perfil?.nombre ?? "Usuario", usuarioCorreo: user.email ?? "",
  };
  return { estado: "ok", contexto: {
    usuarioId: user.id, usuarioNombre: perfil.nombre, usuarioCorreo: user.email ?? "",
    empresaId: "carlitos", empresaNombre: "Panadería Carlitos", moneda: "USD",
    origenDatos: "simulado", rolCodigo: perfil.rol, permisos: PERMISOS_POR_ROL[perfil.rol],
    requestId: generarRequestId(),
  } };
}

#!/usr/bin/env tsx
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

/**
 * Prepara usuarios demo locales de forma idempotente.
 *
 * No imprime contraseñas ni claves. Solo debe ejecutarse contra la instancia
 * local descartable y con DEMO_SEED_ENABLED=true.
 */

const EMPRESA_CARLITOS = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const EMPRESA_B = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";

type UsuarioDemo = {
  correo: string;
  nombre: string;
  rol: "administrador" | "analista" | "gerencia";
  empresaId: string;
};

const USUARIOS: readonly UsuarioDemo[] = [
  {
    correo: "admin@carlitos.local",
    nombre: "Administracion Carlitos",
    rol: "administrador",
    empresaId: EMPRESA_CARLITOS,
  },
  {
    correo: "analista@carlitos.local",
    nombre: "Analista Carlitos",
    rol: "analista",
    empresaId: EMPRESA_CARLITOS,
  },
  {
    correo: "gerencia@carlitos.local",
    nombre: "Gerencia Carlitos",
    rol: "gerencia",
    empresaId: EMPRESA_CARLITOS,
  },
  {
    correo: "ajena@demo.local",
    nombre: "Usuaria Empresa B",
    rol: "analista",
    empresaId: EMPRESA_B,
  },
];

function cargarEnvLocal(): void {
  const ruta = join(process.cwd(), ".env.local");

  if (!existsSync(ruta)) {
    throw new Error("Falta .env.local. Copia .env.example y completa las claves.");
  }

  for (const linea of readFileSync(ruta, "utf8").split(/\r?\n/)) {
    const limpia = linea.trim();

    if (!limpia || limpia.startsWith("#") || !limpia.includes("=")) {
      continue;
    }

    const indice = limpia.indexOf("=");
    const clave = limpia.slice(0, indice).trim();
    const valor = limpia.slice(indice + 1).trim();

    if (!(clave in process.env)) {
      process.env[clave] = valor;
    }
  }
}

async function main(): Promise<void> {
  cargarEnvLocal();

  if (process.env.DEMO_SEED_ENABLED !== "true") {
    throw new Error("DEMO_SEED_ENABLED debe ser true para preparar usuarios demo.");
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const claveAdmin = process.env.SUPABASE_ADMIN_KEY;
  const contrasena = process.env.DEMO_USER_PASSWORD;

  if (!url || !claveAdmin || !contrasena) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL, SUPABASE_ADMIN_KEY o DEMO_USER_PASSWORD.",
    );
  }

  const supabase = createClient(url, claveAdmin, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  const { data: roles, error: errorRoles } = await supabase
    .from("roles")
    .select("id, codigo");

  if (errorRoles || !roles) {
    throw new Error(`No se pudieron leer los roles: ${errorRoles?.message ?? "sin datos"}`);
  }

  const rolPorCodigo = new Map(roles.map((rol) => [rol.codigo, rol.id]));

  const { data: listado, error: errorListado } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (errorListado) {
    throw new Error(`No se pudieron listar usuarios: ${errorListado.message}`);
  }

  const usuariosPorCorreo = new Map(
    listado.users.map((usuario) => [usuario.email?.toLowerCase() ?? "", usuario]),
  );

  for (const usuario of USUARIOS) {
    const rolId = rolPorCodigo.get(usuario.rol);

    if (!rolId) {
      throw new Error(`Rol no encontrado en la base: ${usuario.rol}`);
    }

    const existente = usuariosPorCorreo.get(usuario.correo);
    let usuarioId = existente?.id;

    if (!usuarioId) {
      const { data: creado, error: errorCreacion } =
        await supabase.auth.admin.createUser({
          email: usuario.correo,
          password: contrasena,
          email_confirm: true,
          user_metadata: { nombre_visible: usuario.nombre },
        });

      if (errorCreacion || !creado.user) {
        throw new Error(
          `No se pudo crear ${usuario.correo}: ${errorCreacion?.message ?? "sin usuario"}`,
        );
      }

      usuarioId = creado.user.id;
    } else {
      const { error: errorActualizacion } =
        await supabase.auth.admin.updateUserById(usuarioId, {
          password: contrasena,
          email_confirm: true,
          user_metadata: { nombre_visible: usuario.nombre },
        });

      if (errorActualizacion) {
        throw new Error(
          `No se pudo actualizar ${usuario.correo}: ${errorActualizacion.message}`,
        );
      }
    }

    const { error: errorPerfil } = await supabase.from("perfiles").upsert(
      {
        id: usuarioId,
        nombre_visible: usuario.nombre,
        activo: true,
      },
      { onConflict: "id" },
    );

    if (errorPerfil) {
      throw new Error(`No se pudo guardar el perfil de ${usuario.correo}: ${errorPerfil.message}`);
    }

    const { error: errorMembresia } = await supabase
      .from("membresias_empresa")
      .upsert(
        {
          empresa_id: usuario.empresaId,
          usuario_id: usuarioId,
          rol_id: rolId,
          activa: true,
        },
        { onConflict: "empresa_id,usuario_id" },
      );

    if (errorMembresia) {
      throw new Error(
        `No se pudo guardar la membresia de ${usuario.correo}: ${errorMembresia.message}`,
      );
    }

    console.log(`Listo: ${usuario.correo} (${usuario.rol})`);
  }

  console.log("Usuarios demo preparados. La contrasena no se imprime.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Error inesperado.");
  process.exitCode = 1;
});

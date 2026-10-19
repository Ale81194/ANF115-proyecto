#!/usr/bin/env tsx
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Verificacion previa a la Fase 01.
 *
 * No modifica nada y no imprime valores de credenciales. Devuelve codigo 1 si
 * falta un requisito obligatorio para levantar Supabase local.
 */
type Estado = "ok" | "falta" | "pendiente";

type Comprobacion = {
  nombre: string;
  estado: Estado;
  detalle: string;
  obligatorio: boolean;
};

const raiz = process.cwd();

function ejecutar(comando: string): string | null {
  try {
    return execSync(comando, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      timeout: 20_000,
    }).trim();
  } catch {
    return null;
  }
}

function leerEnvLocal(): Map<string, string> {
  const ruta = join(raiz, ".env.local");

  if (!existsSync(ruta)) {
    return new Map();
  }

  const variables = new Map<string, string>();

  for (const linea of readFileSync(ruta, "utf8").split(/\r?\n/)) {
    const limpia = linea.trim();

    if (!limpia || limpia.startsWith("#") || !limpia.includes("=")) {
      continue;
    }

    const indice = limpia.indexOf("=");
    variables.set(limpia.slice(0, indice).trim(), limpia.slice(indice + 1).trim());
  }

  return variables;
}

const versionNode = process.versions.node;
const mayorNode = Number(versionNode.split(".")[0]);
const docker = ejecutar("docker --version");
const dockerActivo = ejecutar("docker info --format {{.ServerVersion}}");
const supabase = ejecutar("npx supabase --version");
const env = leerEnvLocal();

const comprobaciones: Comprobacion[] = [
  {
    nombre: "Node.js 22+",
    estado: mayorNode >= 22 ? "ok" : "falta",
    detalle: `v${versionNode}`,
    obligatorio: true,
  },
  {
    nombre: "Docker instalado",
    estado: docker ? "ok" : "falta",
    detalle: docker ?? "no encontrado en PATH",
    obligatorio: true,
  },
  {
    nombre: "Docker en ejecucion",
    estado: dockerActivo ? "ok" : "falta",
    detalle: dockerActivo ? `server ${dockerActivo}` : "el daemon no responde",
    obligatorio: true,
  },
  {
    nombre: "Supabase CLI",
    estado: supabase ? "ok" : "falta",
    detalle: supabase ? `v${supabase}` : "npx supabase no disponible",
    obligatorio: true,
  },
  {
    nombre: "supabase/config.toml",
    estado: existsSync(join(raiz, "supabase", "config.toml")) ? "ok" : "falta",
    detalle: "configuracion local del proyecto",
    obligatorio: true,
  },
  {
    nombre: ".env.local",
    estado: existsSync(join(raiz, ".env.local")) ? "ok" : "pendiente",
    detalle: existsSync(join(raiz, ".env.local"))
      ? "archivo presente"
      : "copiar .env.example y completar con npx supabase status",
    obligatorio: false,
  },
  {
    nombre: "Variables de Supabase",
    estado:
      env.get("NEXT_PUBLIC_SUPABASE_URL") &&
      env.get("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY")
        ? "ok"
        : "pendiente",
    detalle:
      env.get("NEXT_PUBLIC_SUPABASE_URL") &&
      env.get("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY")
        ? "URL y clave publica definidas"
        : "faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    obligatorio: false,
  },
];

const bloqueos = comprobaciones.filter(
  (item) => item.obligatorio && item.estado !== "ok",
);

if (process.argv.includes("--json")) {
  console.log(
    JSON.stringify(
      {
        listoParaFase01: bloqueos.length === 0,
        comprobaciones,
      },
      null,
      2,
    ),
  );
} else {
  console.log("Verificacion del entorno local - Carlitos Finanzas\n");

  for (const item of comprobaciones) {
    const marca =
      item.estado === "ok" ? "[OK]" : item.estado === "falta" ? "[FALTA]" : "[PENDIENTE]";
    console.log(`${marca.padEnd(12)} ${item.nombre}: ${item.detalle}`);
  }

  console.log("");

  if (bloqueos.length === 0) {
    console.log("Entorno listo para iniciar la Fase 01.");
  } else {
    console.log(
      `Faltan ${bloqueos.length} requisito(s) obligatorio(s) para la Fase 01.`,
    );
  }

  if (!existsSync(join(raiz, ".env.local"))) {
    console.log(
      "Siguiente paso: copiar .env.example a .env.local y completar las claves con `npx supabase status`.",
    );
  }
}

process.exitCode = bloqueos.length === 0 ? 0 : 1;

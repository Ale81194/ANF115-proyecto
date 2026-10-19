import { connection, NextResponse } from "next/server";

/**
 * Diagnostico minimo del cascaron.
 *
 * No consulta Supabase ni datos financieros: confirma que el runtime responde.
 * `connection()` lo resuelve en cada solicitud sin usar segment config.
 */
export async function GET() {
  await connection();

  return NextResponse.json({
    ok: true,
    servicio: "carlitos-finanzas",
    estado: "cascaron",
    faseImplementada: "00",
    timestamp: new Date().toISOString(),
  });
}

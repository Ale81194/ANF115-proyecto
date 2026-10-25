import { NextResponse } from "next/server";
import { confirmarRecuperacion } from "@/controladores/recuperacion.controller";
import { rutas } from "@/config/rutas";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const r = url.searchParams.get("type") === "recovery"
    ? await confirmarRecuperacion(url.searchParams.get("token_hash")) : null;
  const respuesta = NextResponse.redirect(new URL(r?.ok ? rutas.restablecerAcceso : rutas.recuperarAcceso, url.origin));
  respuesta.headers.set("Referrer-Policy", "no-referrer");
  respuesta.headers.set("Cache-Control", "no-store");
  return respuesta;
}

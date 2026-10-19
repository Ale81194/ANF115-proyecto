"use server";

import { redirect } from "next/navigation";
import { cerrarSesion } from "@/controladores/acceso.controller";

export async function cerrarSesionAction(): Promise<void> {
  await cerrarSesion();
  redirect("/login");
}

import { connection } from "next/server";
import { consultarAdministracion } from "@/controladores/finanzas.controller";
import { AdministrationWorkspace } from "@/components/organisms/administration-workspace";
import { OperationError } from "@/components/molecules/operation-error";
import { guardarOperacion } from "../operaciones";

export const metadata = { title: "Categorías" };
export const instant = false;

export default async function Page() {
  await connection();
  const r = await consultarAdministracion("categorias");
  return r.ok ? <AdministrationWorkspace modulo="categorias" {...r.datos} accion={guardarOperacion} /> : <OperationError mensaje={r.error.mensaje} />;
}

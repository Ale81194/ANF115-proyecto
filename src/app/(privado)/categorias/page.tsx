import { connection } from "next/server";
import { consultarAdministracion } from "@/controladores/finanzas.controller";
import { AdministrationWorkspace } from "@/components/organisms/administration-workspace";
import { OperationError } from "@/components/molecules/operation-error";
import { guardarOperacion } from "../operaciones";

export const metadata = { title: "Categorías" };
export const instant = false;

export default async function Page({ searchParams }: {
  searchParams: Promise<{ tipo?: string | string[]; estado?: string | string[] }>;
}) {
  await connection();
  const parametros = await searchParams;
  const tipo = parametros.tipo === "ingreso" || parametros.tipo === "gasto"
    ? parametros.tipo
    : undefined;
  const estado = parametros.estado === "activa" || parametros.estado === "inactiva"
    ? parametros.estado
    : undefined;
  const r = await consultarAdministracion("categorias", 1, tipo, estado);
  return r.ok ? <AdministrationWorkspace modulo="categorias" {...r.datos} accion={guardarOperacion} /> : <OperationError mensaje={r.error.mensaje} />;
}

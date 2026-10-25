import { connection } from "next/server";
import { consultarFinanzas } from "@/controladores/finanzas.controller";
import { FinanceWorkspace } from "@/components/organisms/finance-workspace";
import { OperationError } from "@/components/molecules/operation-error";
import { guardarOperacion } from "../operaciones";

export const metadata = { title: "Panel financiero" };
export const instant = false;

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await connection();
  const r = await consultarFinanzas(await searchParams);
  return r.ok ? <FinanceWorkspace data={r.datos} modulo="panel" accion={guardarOperacion} /> : <OperationError mensaje={r.error.mensaje} />;
}

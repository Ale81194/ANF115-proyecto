import { connection } from "next/server";
import { consultarAdministracion } from "@/controladores/finanzas.controller";
import { OperationError } from "@/components/molecules/operation-error";

export const metadata = { title: "Mi perfil" };
export const instant = false;

export default async function Page() {
  await connection();
  const r = await consultarAdministracion("perfil");
  if (!r.ok) return <OperationError mensaje={r.error.mensaje} />;
  const perfil = r.datos.perfil;
  return <section className="max-w-xl rounded-card border border-borde bg-superficie p-6">
    <h1 className="font-serif text-3xl">Mi perfil</h1>
    <dl className="mt-5 space-y-4 text-sm"><div><dt className="text-texto-suave">Nombre</dt><dd>{perfil.nombre}</dd></div>
      <div><dt className="text-texto-suave">Rol</dt><dd>{perfil.rol}</dd></div>
      <div><dt className="text-texto-suave">Estado</dt><dd>{perfil.activo ? "Activo" : "Inactivo"}</dd></div></dl>
    <p className="mt-5 text-sm text-texto-suave">Para modificar nombre o permisos, solicita el cambio a un administrador. No puedes elevar tu propio acceso.</p>
  </section>;
}

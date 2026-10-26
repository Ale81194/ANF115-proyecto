import { connection } from "next/server";
import { BadgeCheck, CircleCheck, Info, Mail, ShieldCheck, UserRound } from "lucide-react";
import { consultarAdministracion } from "@/controladores/finanzas.controller";
import { OperationError } from "@/components/molecules/operation-error";

export const metadata = { title: "Mi perfil" };
export const instant = false;

export default async function Page() {
  await connection();
  const r = await consultarAdministracion("perfil");
  if (!r.ok) return <OperationError mensaje={r.error.mensaje} />;
  const perfil = r.datos.perfil;
  const rol = perfil.rol === "administrador" ? "Administrador" : "Empleado";
  return <div className="space-y-6">
    <header className="flex items-center gap-4">
      <span className="flex size-12 items-center justify-center rounded-full bg-primario/10 text-primario"><UserRound aria-hidden="true" className="size-6" /></span>
      <div><h1 className="font-serif text-4xl">Mi perfil</h1>
        <p className="mt-1 text-sm text-texto-suave">Información personal y acceso al sistema.</p></div>
    </header>
    <section className="grid overflow-hidden rounded-card border border-borde bg-superficie shadow-card lg:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.4fr)]">
      <div className="flex flex-col items-center justify-center border-b border-borde p-8 text-center lg:border-b-0 lg:border-r">
        <span className="flex size-28 items-center justify-center rounded-full bg-primario/10 text-primario"><UserRound aria-hidden="true" className="size-14" /></span>
        <h2 className="mt-5 font-serif text-2xl">{perfil.nombre}</h2>
        <div className="mt-7 w-full border-t border-borde pt-5 text-left">
          <p className="flex items-center gap-2 text-sm font-semibold text-exito"><CircleCheck aria-hidden="true" className="size-4" />Cuenta activa</p>
          <p className="mt-1 pl-6 text-xs text-texto-suave">Puedes acceder al sistema con normalidad.</p>
        </div>
      </div>
      <div className="space-y-4 p-6 sm:p-8">
        <dl className="space-y-3 text-sm">
          <div className="grid items-center gap-2 rounded-input border border-borde bg-superficie-tenue/50 p-4 sm:grid-cols-[180px_1fr]"><dt className="flex items-center gap-2 text-texto-suave"><UserRound aria-hidden="true" className="size-4" />Nombre</dt><dd className="font-semibold">{perfil.nombre}</dd></div>
          <div className="grid items-center gap-2 rounded-input border border-borde bg-superficie-tenue/50 p-4 sm:grid-cols-[180px_1fr]"><dt className="flex items-center gap-2 text-texto-suave"><Mail aria-hidden="true" className="size-4" />Correo electrónico</dt><dd className="break-all font-semibold">{r.datos.correoPerfil}</dd></div>
          <div className="grid items-center gap-2 rounded-input border border-borde bg-superficie-tenue/50 p-4 sm:grid-cols-[180px_1fr]"><dt className="flex items-center gap-2 text-texto-suave"><ShieldCheck aria-hidden="true" className="size-4" />Rol</dt><dd><span className="inline-flex items-center gap-1.5 rounded-pill bg-primario/10 px-3 py-1 font-semibold text-primario"><BadgeCheck aria-hidden="true" className="size-3.5" />{rol}</span></dd></div>
        </dl>
        <aside className="flex gap-3 rounded-input border border-info/20 bg-info/10 p-4 text-sm"><Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-info" /><div><h3 className="font-semibold text-info">Administración del perfil</h3><p className="mt-1 text-xs leading-relaxed text-texto-suave">Un administrador puede registrar o modificar tu nombre y asignar el rol autorizado. No puedes elevar tus propios permisos.</p></div></aside>
      </div>
    </section>
  </div>;
}

import Image from "next/image";
import type * as React from "react";
import { SourceBadge } from "@/components/molecules/source-badge";

type AuthTemplateProps = {
  titulo: string;
  descripcion: string;
  children: React.ReactNode;
};

const BENEFICIOS = [
  "Estados conciliados con procedencia verificable.",
  "Presupuestos y escenarios versionados.",
  "Permisos por rol y auditoria desde el primer cambio.",
] as const;

/**
 * Plantilla de acceso: marca a la izquierda, formulario a la derecha.
 * En pantallas pequenas conserva el encabezado de marca y prioriza el formulario.
 */
export function AuthTemplate({
  titulo,
  descripcion,
  children,
}: AuthTemplateProps) {
  return (
    <div className="min-h-screen bg-fondo lg:grid lg:grid-cols-[1.05fr_1fr]">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-cafe-900 px-6 py-8 text-crema-50 sm:px-10 lg:flex lg:px-12 lg:py-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-terracota-600/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-20 size-80 rounded-full bg-dorado-400/10 blur-3xl"
        />

        <div className="relative">
          <Image
            src="/branding/logo-blanco.svg"
            alt="Panaderia Carlitos"
            width={560}
            height={180}
            unoptimized
            priority
            className="h-14 w-auto"
          />
        </div>

        <div className="relative mt-12 max-w-lg space-y-6 lg:mt-0">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-dorado-400">
            Analisis financiero academico
          </p>
          <h1 className="font-serif text-3xl leading-tight text-crema-50 sm:text-4xl">
            Decisiones con numeros que se pueden explicar.
          </h1>
          <p className="text-sm leading-relaxed text-crema-100/70">
            Un solo lugar para el diario, los estados historicos, el
            presupuesto y las proyecciones de la panaderia.
          </p>
          <ul className="space-y-2.5 text-sm text-crema-100/80">
            {BENEFICIOS.map((beneficio) => (
              <li key={beneficio} className="flex gap-2.5">
                <span
                  aria-hidden="true"
                  className="mt-1.5 size-1.5 shrink-0 rounded-full bg-dorado-400"
                />
                {beneficio}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mt-12 flex flex-wrap items-center gap-3 text-[11px] text-crema-100/50 lg:mt-0">
          <SourceBadge className="border-dorado-400/30 bg-white/5 text-crema-100/80" />
          <span>Proyecto ANF &middot; 2026</span>
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-md">
          <div className="mb-8 space-y-2 lg:hidden">
            <Image
              src="/branding/logo-principal.svg"
              alt="Panaderia Carlitos"
              width={560}
              height={180}
              unoptimized
              className="h-12 w-auto"
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primario">
              Acceso
            </p>
            <h2 className="text-2xl text-texto sm:text-3xl">{titulo}</h2>
            <p className="text-sm leading-relaxed text-texto-suave">
              {descripcion}
            </p>
          </div>

          <div className="mt-8">{children}</div>

          <p className="mt-8 border-t border-borde pt-4 text-[11px] leading-relaxed text-texto-suave">
            Sistema academico con datos simulados. La autenticacion real, las
            membresias y los permisos se incorporan en la Fase 01.
          </p>
        </div>
      </section>
    </div>
  );
}

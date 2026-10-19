import { Users } from "lucide-react";
import { Suspense } from "react";
import type * as React from "react";
import { SourceBadge } from "@/components/molecules/source-badge";
import { PeriodSelector } from "@/components/molecules/period-selector";
import {
  Sidebar,
} from "@/components/organisms/navegacion/sidebar";
import type { GrupoNavegacion } from "@/config/navegacion";
import type { Permiso } from "@/config/permisos";

/**
 * Fallback mientras el cliente resuelve la ruta activa.
 * Evita que usePathname bloquee el prerender del area privada.
 */
function SidebarFallback() {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 h-14 border-b border-borde bg-crema-50 lg:hidden" />
      <aside
        aria-hidden="true"
        className="hidden w-[var(--ancho-sidebar)] shrink-0 bg-cafe-900 lg:block"
      />
    </>
  );
}

type AppShellProps = {
  children: React.ReactNode;
  permisos?: readonly Permiso[];
  grupos?: readonly GrupoNavegacion[];
};

/**
 * Estructura comun del area privada: navegacion, encabezado financiero,
 * contenido y pie. El contexto mostrado es descriptivo; no calcula cifras.
 */
export function AppShell({ children, permisos, grupos }: AppShellProps) {
  return (
    <div className="min-h-screen bg-fondo lg:flex">
      <a href="#contenido-principal" className="skip-link">
        Saltar al contenido principal
      </a>

      <Suspense fallback={<SidebarFallback />}>
        <Sidebar permisos={permisos} grupos={grupos} />
      </Suspense>

      <div className="flex min-w-0 flex-1 flex-col pt-14 lg:pt-0">
        <header className="sticky top-0 z-30 hidden border-b border-borde bg-crema-50/90 backdrop-blur lg:block">
          <div className="mx-auto flex h-16 w-full max-w-[var(--ancho-contenido)] items-center justify-between gap-4 px-6 lg:px-8">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-texto">
                Panaderia Carlitos
              </p>
              <p className="text-xs text-texto-suave">
                Empresa academica &middot; Moneda USD
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <SourceBadge />
              <PeriodSelector />
              <div className="h-7 w-px bg-borde" aria-hidden="true" />
              <div className="flex items-center gap-2 rounded-input border border-borde bg-superficie px-3 py-1.5">
                <span className="flex size-7 items-center justify-center rounded-full bg-superficie-tenue text-texto-suave">
                  <Users aria-hidden="true" className="size-3.5" />
                </span>
                <div className="leading-tight">
                  <p className="text-xs font-medium text-texto">Sin sesion</p>
                  <p className="text-[10px] text-texto-suave">Acceso en Fase 01</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main
          id="contenido-principal"
          className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
        >
          <div className="mx-auto w-full max-w-[var(--ancho-contenido)]">
            {children}
          </div>
        </main>

        <footer className="border-t border-borde bg-crema-50 px-4 py-4 sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-[var(--ancho-contenido)] flex-col gap-1 text-[11px] text-texto-suave sm:flex-row sm:items-center sm:justify-between">
            <p>Carlitos Finanzas &middot; Proyecto academico ANF</p>
            <p>Cascaron v0.1 &middot; Implementacion por fases</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

import { LogOut, UserRound } from "lucide-react";
import { Suspense } from "react";
import type * as React from "react";
import { SourceBadge } from "@/components/molecules/source-badge";
import { PeriodSelector } from "@/components/molecules/period-selector";
import { Sidebar } from "@/components/organisms/navegacion/sidebar";
import type { GrupoNavegacion } from "@/config/navegacion";
import type { Permiso } from "@/config/permisos";
import type { ContextoAcceso } from "@/types/contexto";

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
  contexto: ContextoAcceso;
  permisos?: readonly Permiso[];
  grupos?: readonly GrupoNavegacion[];
  cerrarSesion: () => Promise<void>;
};

/**
 * Estructura comun del area privada: navegacion, encabezado financiero,
 * contenido y pie. El contexto mostrado viene de la sesion resuelta.
 */
export function AppShell({
  children,
  contexto,
  permisos,
  grupos,
  cerrarSesion,
}: AppShellProps) {
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
                {contexto.empresaNombre}
              </p>
              <p className="text-xs text-texto-suave">
                {contexto.moneda} &middot; Rol {contexto.rolCodigo}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <SourceBadge origen={contexto.origenDatos} />
              <PeriodSelector />
              <div className="h-7 w-px bg-borde" aria-hidden="true" />
              <div className="flex items-center gap-2 rounded-input border border-borde bg-superficie px-3 py-1.5">
                <span className="flex size-7 items-center justify-center rounded-full bg-superficie-tenue text-texto-suave">
                  <UserRound aria-hidden="true" className="size-3.5" />
                </span>
                <div className="max-w-40 leading-tight">
                  <p className="truncate text-xs font-medium text-texto">
                    {contexto.usuarioNombre}
                  </p>
                  <p className="truncate text-[10px] text-texto-suave">
                    {contexto.usuarioCorreo}
                  </p>
                </div>
              </div>
              <form action={cerrarSesion}>
                <button
                  type="submit"
                  className="inline-flex size-9 items-center justify-center rounded-input border border-borde bg-superficie text-texto-suave transition-colors hover:bg-superficie-tenue hover:text-texto"
                  aria-label="Cerrar sesion"
                  title="Cerrar sesion"
                >
                  <LogOut aria-hidden="true" className="size-4" />
                </button>
              </form>
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
            <p>
              Fase 01 &middot; Catalogo y periodos &middot; datos simulados
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  filtrarNavegacion,
  navegacion,
  navegacionPrincipal,
  type GrupoNavegacion,
  type ItemNavegacion,
} from "@/config/navegacion";
import type { Permiso } from "@/config/permisos";
import { cn } from "@/lib/utils";

type SidebarProps = {
  permisos?: readonly Permiso[];
  grupos?: readonly GrupoNavegacion[];
};

function esRutaActiva(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function ItemEnlace({
  item,
  pathname,
  alNavegar,
}: {
  item: ItemNavegacion;
  pathname: string;
  alNavegar?: () => void;
}) {
  const activo = esRutaActiva(pathname, item.href);
  const Icono = item.icono;

  return (
    <Link
      href={item.href}
      onClick={alNavegar}
      aria-current={activo ? "page" : undefined}
      className={cn(
        "group flex items-center gap-3 rounded-input border-l-2 px-3 py-2 text-sm transition-colors",
        activo
          ? "border-dorado-400 bg-white/10 font-semibold text-crema-50"
          : "border-transparent text-crema-100/75 hover:bg-white/5 hover:text-crema-50",
      )}
    >
      <Icono
        aria-hidden="true"
        className={cn(
          "size-4 shrink-0",
          activo ? "text-dorado-400" : "text-crema-100/50",
        )}
      />
      <span className="truncate">{item.titulo}</span>
    </Link>
  );
}

function ContenidoSidebar({
  pathname,
  grupos,
  alNavegar,
}: {
  pathname: string;
  grupos: readonly GrupoNavegacion[];
  alNavegar?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 px-5 pb-5 pt-6">
        <Link
          href="/dashboard"
          onClick={alNavegar}
          className="block rounded-input focus-visible:outline-crema-50"
          aria-label="Panaderia Carlitos Finanzas, ir al dashboard"
        >
          <Image
            src="/branding/logo-blanco.svg"
            alt="Panaderia Carlitos"
            width={560}
            height={180}
            unoptimized
            className="h-12 w-auto"
            priority
          />
        </Link>
        <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-crema-100/50">
          Sistema financiero academico
        </p>
      </div>

      <nav
        aria-label="Navegacion principal"
        className="scrollbar-menu flex-1 space-y-5 overflow-y-auto px-3 py-5"
      >
        <ItemEnlace
          item={navegacionPrincipal}
          pathname={pathname}
          alNavegar={alNavegar}
        />

        {grupos.map((grupo) => (
          <div key={grupo.id} className="space-y-1">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-crema-100/40">
              {grupo.titulo}
            </p>
            {grupo.items.map((item) => (
              <ItemEnlace
                key={item.href}
                item={item}
                pathname={pathname}
                alNavegar={alNavegar}
              />
            ))}
          </div>
        ))}
      </nav>

      <div className="space-y-1 border-t border-white/10 px-5 py-4 text-[11px] text-crema-100/50">
        <p>Fase 01 &middot; Base y acceso</p>
        <p>Datos simulados &middot; uso academico</p>
      </div>
    </div>
  );
}

/**
 * Navegacion lateral del AppShell.
 *
 * En escritorio permanece fija; en pantallas pequenas se abre como dialogo.
 * La visibilidad del menu no sustituye la autorizacion del servidor.
 */
export function Sidebar({ permisos, grupos }: SidebarProps) {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);
  const botonCerrar = useRef<HTMLButtonElement>(null);

  const gruposVisibles = permisos
    ? filtrarNavegacion(permisos)
    : (grupos ?? navegacion);

  useEffect(() => {
    if (!abierto) {
      return;
    }

    botonCerrar.current?.focus();

    const alPresionar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") {
        setAbierto(false);
      }
    };

    document.addEventListener("keydown", alPresionar);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", alPresionar);
      document.body.style.overflow = "";
    };
  }, [abierto]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-3 border-b border-borde bg-crema-50/95 px-4 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => setAbierto(true)}
          className="rounded-input p-2 text-texto transition-colors hover:bg-superficie-tenue"
          aria-label="Abrir menu de navegacion"
          aria-expanded={abierto}
          aria-controls="menu-lateral-movil"
        >
          <Menu aria-hidden="true" className="size-5" />
        </button>
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src="/branding/isotipo.svg"
            alt=""
            width={128}
            height={128}
            unoptimized
            className="size-7 rounded-md"
          />
          <span className="font-serif text-lg text-cafe-900">Carlitos</span>
        </Link>
      </header>

      <aside className="hidden w-[var(--ancho-sidebar)] shrink-0 bg-cafe-900 lg:block">
        <div className="fixed inset-y-0 left-0 w-[var(--ancho-sidebar)]">
          <ContenidoSidebar pathname={pathname} grupos={gruposVisibles} />
        </div>
      </aside>

      {abierto ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-cafe-900/50 backdrop-blur-[2px]"
            aria-label="Cerrar menu de navegacion"
            onClick={() => setAbierto(false)}
          />
          <div
            id="menu-lateral-movil"
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegacion"
            className="relative h-full w-[min(86vw,320px)] bg-cafe-900 shadow-elevada"
          >
            <button
              ref={botonCerrar}
              type="button"
              onClick={() => setAbierto(false)}
              className="absolute right-3 top-4 z-10 rounded-input p-2 text-crema-50/80 transition-colors hover:bg-white/10 hover:text-crema-50"
              aria-label="Cerrar menu"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
            <ContenidoSidebar
              pathname={pathname}
              grupos={gruposVisibles}
              alNavegar={() => setAbierto(false)}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}

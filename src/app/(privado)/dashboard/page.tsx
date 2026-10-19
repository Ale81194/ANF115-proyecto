import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookText,
  CalendarDays,
  Database,
  FileBarChart,
  FolderTree,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { EmptyState } from "@/components/molecules/empty-state";
import { MetricCard } from "@/components/molecules/metric-card";
import { PageHeader } from "@/components/molecules/page-header";
import { SourceBadge } from "@/components/molecules/source-badge";
import { rutas } from "@/config/rutas";

export const metadata: Metadata = {
  title: "Dashboard",
};

const ACCESOS = [
  {
    titulo: "Catalogo de cuentas",
    descripcion: "Rubros, naturaleza y vigencia del catalogo publicado.",
    href: rutas.catalogo.lista,
    icono: FolderTree,
    fase: "01",
  },
  {
    titulo: "Periodos contables",
    descripcion: "Calendario mensual y estado de cada periodo.",
    href: rutas.periodos.lista,
    icono: CalendarDays,
    fase: "01",
  },
  {
    titulo: "Importar diario",
    descripcion: "Carga, validacion y confirmacion de lotes.",
    href: rutas.importaciones.lista,
    icono: Upload,
    fase: "02",
  },
  {
    titulo: "Estados financieros",
    descripcion: "Comprobacion, resultados, balance y patrimonio.",
    href: rutas.estados.indice,
    icono: FileBarChart,
    fase: "03",
  },
] as const;

const ESTADO_SISTEMA = [
  {
    etiqueta: "Base de datos local",
    valor: "No inicializada",
    icono: Database,
    variante: "warning" as const,
  },
  {
    etiqueta: "Autenticacion y membresias",
    valor: "Fase 01",
    icono: ShieldCheck,
    variante: "warning" as const,
  },
  {
    etiqueta: "Diario contabilizado",
    valor: "Sin datos",
    icono: BookText,
    variante: "neutral" as const,
  },
] as const;

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Dashboard"
        descripcion="Contexto de la empresa, origen de datos y estado de la implementacion. Las cifras aparecen cuando existan asientos contabilizados."
        contexto={
          <>
            <Badge variant="outline">Fase 01 &middot; base</Badge>
            <SourceBadge />
            <Badge variant="neutral">Corte: sin seleccionar</Badge>
          </>
        }
        acciones={
          <Button asChild variant="secondary" size="sm">
            <Link href={rutas.periodos.lista}>
              <CalendarDays aria-hidden="true" />
              Revisar periodos
            </Link>
          </Button>
        }
      />

      <section
        aria-label="Indicadores principales"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <MetricCard
          etiqueta="Resultado del periodo"
          valor={<span className="text-texto-suave">&mdash;</span>}
          detalle="Disponible al generar estados historicos."
          fuente="Motor financiero &middot; Fase 03"
        />
        <MetricCard
          etiqueta="Activo total"
          valor={<span className="text-texto-suave">&mdash;</span>}
          detalle="Saldo al corte con base temporal explicita."
          fuente="Balance general &middot; Fase 03"
        />
        <MetricCard
          etiqueta="Patrimonio"
          valor={<span className="text-texto-suave">&mdash;</span>}
          detalle="Incluye conciliacion Activo = Pasivo + Patrimonio."
          fuente="Estado de patrimonio &middot; Fase 03"
        />
        <MetricCard
          etiqueta="Presupuesto vs. real"
          valor={<span className="text-texto-suave">&mdash;</span>}
          detalle="Requiere un presupuesto aprobado y datos reales."
          fuente="Comparativo &middot; Fase 04"
        />
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-4" aria-labelledby="accesos-titulo">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 id="accesos-titulo" className="text-lg text-texto">
                Accesos principales
              </h2>
              <p className="text-xs text-texto-suave">
                Cada destino declara la fase en la que se habilita.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {ACCESOS.map((acceso) => {
              const Icono = acceso.icono;
              return (
                <Link
                  key={acceso.href}
                  href={acceso.href}
                  className="group flex gap-3 rounded-card border border-borde bg-superficie p-4 shadow-card transition-colors hover:border-primario/40 hover:bg-crema-100/40"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-input bg-superficie-tenue text-primario">
                    <Icono aria-hidden="true" className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-texto">
                        {acceso.titulo}
                      </span>
                      <Badge variant="outline">Fase {acceso.fase}</Badge>
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-texto-suave">
                      {acceso.descripcion}
                    </span>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primario">
                      Abrir
                      <ArrowRight
                        aria-hidden="true"
                        className="size-3.5 transition-transform group-hover:translate-x-0.5"
                      />
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>

          <EmptyState
            titulo="Todavia no hay asientos contabilizados"
            descripcion="El dashboard no muestra cifras de ejemplo. Los indicadores se calculan a partir del diario contabilizado y de la politica vigente."
            icono={BookText}
            accion={
              <Button asChild variant="secondary" size="sm">
                <Link href={rutas.estados.indice}>Ver el mapa de estados</Link>
              </Button>
            }
          />
        </section>

        <aside className="space-y-4" aria-labelledby="estado-titulo">
          <div className="rounded-card border border-borde bg-superficie p-5 shadow-card">
            <h2 id="estado-titulo" className="text-lg text-texto">
              Estado del sistema
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-texto-suave">
              El cascaron esta listo; la funcionalidad avanza por fases.
            </p>
            <ul className="mt-4 divide-y divide-borde">
              {ESTADO_SISTEMA.map((item) => {
                const Icono = item.icono;
                return (
                  <li
                    key={item.etiqueta}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <span className="flex items-center gap-2 text-sm text-texto">
                      <Icono
                        aria-hidden="true"
                        className="size-4 text-texto-suave"
                      />
                      {item.etiqueta}
                    </span>
                    <Badge variant={item.variante}>{item.valor}</Badge>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-card border border-borde bg-superficie-tenue p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-texto-suave">
              Recordatorio academico
            </p>
            <p className="mt-2 text-sm leading-relaxed text-texto">
              Los datos de Carlitos son simulados. Un resultado solo se considera
              valido cuando proviene del diario contabilizado, conserva su
              politica y muestra advertencias de conciliacion.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

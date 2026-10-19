import type * as React from "react";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  etiqueta: string;
  valor: React.ReactNode;
  detalle?: string;
  fuente?: string;
  className?: string;
};

/**
 * Tarjeta de indicador. En el cascaron se usa con "—" para no presentar cifras
 * que la aplicacion todavia no calculo.
 */
export function MetricCard({
  etiqueta,
  valor,
  detalle,
  fuente,
  className,
}: MetricCardProps) {
  return (
    <section
      className={cn(
        "flex flex-col gap-3 rounded-card border border-borde bg-superficie p-5 shadow-card",
        className,
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-texto-suave">
        {etiqueta}
      </p>
      <div className="text-2xl tabular-nums text-texto">{valor}</div>
      {detalle ? (
        <p className="text-xs leading-relaxed text-texto-suave">{detalle}</p>
      ) : null}
      {fuente ? (
        <p className="mt-auto border-t border-borde pt-2 text-[11px] text-texto-suave">
          {fuente}
        </p>
      ) : null}
    </section>
  );
}

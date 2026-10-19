import type * as React from "react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  titulo: string;
  descripcion?: string;
  acciones?: React.ReactNode;
  contexto?: React.ReactNode;
  className?: string;
};

export function PageHeader({
  titulo,
  descripcion,
  acciones,
  contexto,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 border-b border-borde pb-5 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="space-y-1.5">
        <h1 className="text-2xl text-texto sm:text-3xl">{titulo}</h1>
        {descripcion ? (
          <p className="max-w-2xl text-sm leading-relaxed text-texto-suave">
            {descripcion}
          </p>
        ) : null}
        {contexto ? (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {contexto}
          </div>
        ) : null}
      </div>
      {acciones ? (
        <div className="flex flex-wrap items-center gap-2">{acciones}</div>
      ) : null}
    </header>
  );
}

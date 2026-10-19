import type * as React from "react";
import { cn } from "@/lib/utils";

type FormFieldProps = {
  id: string;
  etiqueta: string;
  ayuda?: string;
  error?: string;
  requerido?: boolean;
  className?: string;
  children: React.ReactNode;
};

export function FormField({
  id,
  etiqueta,
  ayuda,
  error,
  requerido = false,
  className,
  children,
}: FormFieldProps) {
  const ayudaId = ayuda ? `${id}-ayuda` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={id}
        className="text-sm font-medium text-texto"
      >
        {etiqueta}
        {requerido ? (
          <span className="ml-1 text-peligro" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      {children}
      {ayuda ? (
        <p id={ayudaId} className="text-xs text-texto-suave">
          {ayuda}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-xs font-medium text-peligro">
          {error}
        </p>
      ) : null}
    </div>
  );
}

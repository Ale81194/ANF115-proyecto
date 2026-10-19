import { ChevronDown } from "lucide-react";
import type * as React from "react";
import { cn } from "@/lib/utils";

export type SelectProps = React.ComponentProps<"select">;

/**
 * Select nativo: conserva teclado, lectores de pantalla y comportamiento movil
 * sin agregar una capa de JavaScript en el cascaron.
 */
export function Select({ className, children, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select
        className={cn(
          "h-10 w-full appearance-none rounded-input border border-borde-fuerte bg-superficie pl-3 pr-9 text-sm text-texto transition-colors",
          "focus-visible:border-primario focus-visible:outline-2 focus-visible:outline-primario/25",
          "disabled:cursor-not-allowed disabled:opacity-60",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-texto-suave"
      />
    </div>
  );
}

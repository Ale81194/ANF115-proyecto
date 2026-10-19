import type * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.ComponentProps<"input">;

export function Input({ className, type = "text", ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-input border border-borde-fuerte bg-superficie px-3 py-2 text-sm text-texto shadow-xs transition-colors",
        "placeholder:text-texto-suave/70",
        "focus-visible:border-primario focus-visible:outline-2 focus-visible:outline-primario/25",
        "disabled:cursor-not-allowed disabled:opacity-60",
        "aria-invalid:border-peligro aria-invalid:outline-peligro/30",
        className,
      )}
      {...props}
    />
  );
}

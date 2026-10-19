import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-pill border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
  {
    variants: {
      variant: {
        neutral: "border-borde bg-superficie-tenue text-texto-suave",
        primary: "border-primario/25 bg-primario/10 text-primario",
        success: "border-exito/25 bg-exito/10 text-exito",
        warning: "border-advertencia/30 bg-advertencia/10 text-advertencia",
        danger: "border-peligro/25 bg-peligro/10 text-peligro",
        info: "border-info/25 bg-info/10 text-info",
        outline: "border-borde-fuerte bg-transparent text-texto-suave",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

export type BadgeProps = React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { badgeVariants };

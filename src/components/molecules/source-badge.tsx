import { Badge } from "@/components/atoms/badge";
import { cn } from "@/lib/utils";

type SourceBadgeProps = {
  origen?: "simulado" | "real";
  className?: string;
};

/**
 * Etiqueta obligatoria de procedencia.
 *
 * Un resultado academico nunca se presenta como dato real.
 */
export function SourceBadge({
  origen = "simulado",
  className,
}: SourceBadgeProps) {
  const esSimulado = origen === "simulado";

  return (
    <Badge
      variant={esSimulado ? "warning" : "info"}
      className={cn("font-medium", className)}
      title={
        esSimulado
          ? "Datos simulados con fines academicos"
          : "Datos declarados como reales por la empresa"
      }
    >
      {esSimulado
        ? "Datos simulados \u00b7 uso academico"
        : "Datos reales"}
    </Badge>
  );
}

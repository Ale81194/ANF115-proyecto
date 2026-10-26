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
          ? "Información de demostración"
          : "Datos declarados como reales por la empresa"
      }
    >
      {esSimulado
        ? "Datos simulados"
        : "Datos reales"}
    </Badge>
  );
}

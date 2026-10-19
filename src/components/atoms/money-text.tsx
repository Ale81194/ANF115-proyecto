import { esImporteNegativo, formatearImporte } from "@/lib/dinero";
import { cn } from "@/lib/utils";

type MoneyTextProps = {
  importe: string;
  className?: string;
  tamano?: "sm" | "md" | "lg";
  mostrarSigno?: boolean;
};

const TAMANOS = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-xl font-semibold",
} as const;

/**
 * Presenta un importe canonico alineado a la derecha.
 *
 * No recalcula ni redondea: si el contrato entrega un valor invalido, muestra
 * un marcador visible en lugar de una cifra silenciosamente alterada.
 */
export function MoneyText({
  importe,
  className,
  tamano = "md",
  mostrarSigno = false,
}: MoneyTextProps) {
  let formateado: string;

  try {
    formateado = formatearImporte(importe);
  } catch {
    return (
      <span
        className={cn("tabular-nums text-texto-suave", TAMANOS[tamano], className)}
        title="Importe no disponible"
      >
        &mdash;
      </span>
    );
  }

  const negativo = esImporteNegativo(importe);
  const texto = mostrarSigno && !negativo ? `+${formateado}` : formateado;

  return (
    <span
      className={cn(
        "tabular-nums",
        TAMANOS[tamano],
        negativo && "text-peligro",
        className,
      )}
    >
      {texto}
    </span>
  );
}

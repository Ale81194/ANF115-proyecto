import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ErrorValidacion = {
  ruta: string;
  mensaje: string;
};

type ValidationSummaryProps = {
  errores?: readonly ErrorValidacion[];
  mensajeExito?: string;
  className?: string;
};

export function ValidationSummary({
  errores = [],
  mensajeExito,
  className,
}: ValidationSummaryProps) {
  const hayErrores = errores.length > 0;

  if (!hayErrores && !mensajeExito) {
    return null;
  }

  return (
    <div
      role={hayErrores ? "alert" : "status"}
      aria-live="polite"
      className={cn(
        "flex gap-3 rounded-input border px-4 py-3 text-sm",
        hayErrores
          ? "border-peligro/30 bg-peligro/5 text-peligro"
          : "border-exito/30 bg-exito/5 text-exito",
        className,
      )}
    >
      {hayErrores ? (
        <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      ) : (
        <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      )}
      <div className="space-y-1">
        {hayErrores ? (
          <>
            <p className="font-semibold">Revisa la informacion:</p>
            <ul className="list-disc space-y-0.5 pl-4">
              {errores.map((error) => (
                <li key={`${error.ruta}-${error.mensaje}`}>
                  <span className="font-medium">{error.ruta}:</span>{" "}
                  {error.mensaje}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="font-medium">{mensajeExito}</p>
        )}
      </div>
    </div>
  );
}

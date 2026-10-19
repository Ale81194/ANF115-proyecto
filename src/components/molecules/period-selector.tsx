import { Select } from "@/components/atoms/select";

export type PeriodoOpcion = {
  id: string;
  etiqueta: string;
};

type PeriodSelectorProps = {
  periodos?: readonly PeriodoOpcion[];
  valor?: string;
  id?: string;
};

/**
 * Selector de periodo del encabezado.
 *
 * Sin datos persistidos no inventa un periodo: muestra el estado pendiente.
 * La seleccion real viajara en la URL y se validara en el servidor.
 */
export function PeriodSelector({
  periodos = [],
  valor,
  id = "periodo-activo",
}: PeriodSelectorProps) {
  const sinPeriodos = periodos.length === 0;

  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor={id}
        className="hidden text-xs font-medium text-texto-suave sm:block"
      >
        Periodo
      </label>
      <Select
        id={id}
        defaultValue={valor ?? ""}
        disabled={sinPeriodos}
        className="h-9 min-w-44 bg-superficie text-xs"
        aria-label="Periodo contable activo"
      >
        {sinPeriodos ? (
          <option value="">Sin periodos cargados</option>
        ) : (
          <>
            <option value="">Seleccionar periodo</option>
            {periodos.map((periodo) => (
              <option key={periodo.id} value={periodo.id}>
                {periodo.etiqueta}
              </option>
            ))}
          </>
        )}
      </Select>
    </div>
  );
}

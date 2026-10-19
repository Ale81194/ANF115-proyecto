"use client";

import { CalendarPlus } from "lucide-react";
import { useActionState } from "react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Select } from "@/components/atoms/select";
import { FormField } from "@/components/molecules/form-field";
import { ValidationSummary } from "@/components/molecules/validation-summary";
import { MESES } from "@/config/calendario";
import {
  ESTADO_FORMULARIO_INICIAL,
  type EstadoFormulario,
} from "@/types/formularios";

type PeriodoFormProps = {
  accion: (
    estado: EstadoFormulario,
    formData: FormData,
  ) => Promise<EstadoFormulario>;
  claveIdempotencia: string;
  anioSugerido: number;
};

export function PeriodoForm({
  accion,
  claveIdempotencia,
  anioSugerido,
}: PeriodoFormProps) {
  const [estado, enviar, pendiente] = useActionState(
    accion,
    ESTADO_FORMULARIO_INICIAL,
  );

  return (
    <form action={enviar} className="space-y-4" noValidate>
      <input
        type="hidden"
        name="claveIdempotencia"
        value={claveIdempotencia}
      />

      {estado.estado === "error" ? (
        <ValidationSummary errores={estado.campos ?? []} />
      ) : null}

      {estado.estado === "error" && (!estado.campos || estado.campos.length === 0) ? (
        <p
          role="alert"
          className="rounded-input border border-peligro/30 bg-peligro/5 px-4 py-3 text-sm text-peligro"
        >
          {estado.mensaje ?? "No se pudo crear el periodo."}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-[140px_minmax(0,1fr)_auto] sm:items-end">
        <FormField id="anio" etiqueta="Año" requerido>
          <Input
            id="anio"
            name="anio"
            type="number"
            min={2000}
            max={2100}
            step={1}
            defaultValue={anioSugerido}
            required
          />
        </FormField>

        <FormField id="mes" etiqueta="Mes" requerido>
          <Select id="mes" name="mes" defaultValue="1" required>
            {MESES.map((mes, indice) => (
              <option key={mes} value={indice + 1}>
                {mes}
              </option>
            ))}
          </Select>
        </FormField>

        <Button type="submit" disabled={pendiente}>
          <CalendarPlus aria-hidden="true" />
          {pendiente ? "Creando..." : "Crear periodo"}
        </Button>
      </div>

      <p className="text-xs leading-relaxed text-texto-suave">
        El periodo se crea abierto y con numeracion inicial en 1. El cierre y la
        reapertura corresponden a la Fase 05.
      </p>
    </form>
  );
}

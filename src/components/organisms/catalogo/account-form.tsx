"use client";

import Link from "next/link";
import { Save } from "lucide-react";
import { useActionState } from "react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Select } from "@/components/atoms/select";
import { FormField } from "@/components/molecules/form-field";
import { ValidationSummary } from "@/components/molecules/validation-summary";
import { rutas } from "@/config/rutas";
import {
  CLASES_CUENTA,
  NATURALEZAS_CUENTA,
  type ClaseCuenta,
  type NaturalezaCuenta,
  type OpcionesCatalogoDTO,
} from "@/types/contabilidad";
import {
  ESTADO_FORMULARIO_INICIAL,
  type EstadoFormulario,
} from "@/types/formularios";

const ETIQUETAS_CLASE: Record<ClaseCuenta, string> = {
  activo: "Activo",
  pasivo: "Pasivo",
  patrimonio: "Patrimonio",
  ingreso: "Ingreso",
  gasto: "Gasto",
};

const ETIQUETAS_NATURALEZA: Record<NaturalezaCuenta, string> = {
  deudora: "Deudora (saldo normal debito)",
  acreedora: "Acreedora (saldo normal credito)",
};

type AccountFormProps = {
  accion: (
    estado: EstadoFormulario,
    formData: FormData,
  ) => Promise<EstadoFormulario>;
  opciones: OpcionesCatalogoDTO;
  claveIdempotencia: string;
};

export function AccountForm({
  accion,
  opciones,
  claveIdempotencia,
}: AccountFormProps) {
  const [estado, enviar, pendiente] = useActionState(
    accion,
    ESTADO_FORMULARIO_INICIAL,
  );
  const cuenta = opciones.cuenta;
  const esEdicion = Boolean(cuenta);

  return (
    <form action={enviar} className="space-y-6" noValidate>
      <input type="hidden" name="cuentaId" value={cuenta?.id ?? ""} />
      <input
        type="hidden"
        name="versionEsperada"
        value={cuenta?.version?.toString() ?? ""}
      />
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
          {estado.mensaje ?? "No se pudo guardar la cuenta."}
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          id="codigo"
          etiqueta="Codigo"
          ayuda={
            esEdicion
              ? "El codigo identifica la cuenta y no se edita."
              : "Texto; conserva puntos, letras y ceros a la izquierda."
          }
          requerido
        >
          <Input
            id="codigo"
            name="codigo"
            defaultValue={cuenta?.codigo ?? ""}
            readOnly={esEdicion}
            required
            maxLength={40}
            placeholder="1.1.1"
          />
        </FormField>

        <FormField id="nombre" etiqueta="Nombre" requerido>
          <Input
            id="nombre"
            name="nombre"
            defaultValue={cuenta?.nombre ?? ""}
            required
            maxLength={160}
            placeholder="Caja"
          />
        </FormField>

        <FormField
          id="clase"
          etiqueta="Clase"
          ayuda="La clase no se deduce del primer digito del codigo."
          requerido
        >
          <Select id="clase" name="clase" defaultValue={cuenta?.clase ?? "activo"}>
            {CLASES_CUENTA.map((clase) => (
              <option key={clase} value={clase}>
                {ETIQUETAS_CLASE[clase]}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          id="naturaleza"
          etiqueta="Naturaleza"
          ayuda="Orienta la presentacion; no invierte debe y haber."
          requerido
        >
          <Select
            id="naturaleza"
            name="naturaleza"
            defaultValue={cuenta?.naturaleza ?? "deudora"}
          >
            {NATURALEZAS_CUENTA.map((naturaleza) => (
              <option key={naturaleza} value={naturaleza}>
                {ETIQUETAS_NATURALEZA[naturaleza]}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          id="rubroId"
          etiqueta="Rubro de presentacion"
          ayuda="Determina en que estado financiero se presenta la cuenta."
          requerido
        >
          <Select
            id="rubroId"
            name="rubroId"
            defaultValue={cuenta?.rubroId ?? ""}
            required
          >
            <option value="">Seleccionar rubro</option>
            {opciones.rubros.map((rubro) => (
              <option key={rubro.id} value={rubro.id}>
                {rubro.nombre}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          id="padreId"
          etiqueta="Cuenta padre"
          ayuda="Opcional. Una cuenta raiz no tiene padre."
        >
          <Select
            id="padreId"
            name="padreId"
            defaultValue={cuenta?.padreId ?? ""}
          >
            <option value="">Sin padre (raiz)</option>
            {opciones.cuentasPadre.map((opcion) => (
              <option key={opcion.id} value={opcion.id}>
                {opcion.codigo} - {opcion.nombre}
                {opcion.permiteMovimiento ? "" : " (agrupadora)"}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField id="vigenciaDesde" etiqueta="Vigente desde" requerido>
          <Input
            id="vigenciaDesde"
            name="vigenciaDesde"
            type="date"
            defaultValue={cuenta?.vigenciaDesde ?? "2024-01-01"}
            required
          />
        </FormField>

        <FormField
          id="vigenciaHasta"
          etiqueta="Vigente hasta"
          ayuda="Opcional. Deja vacio si la cuenta sigue vigente."
        >
          <Input
            id="vigenciaHasta"
            name="vigenciaHasta"
            type="date"
            defaultValue={cuenta?.vigenciaHasta ?? ""}
          />
        </FormField>
      </div>

      <fieldset className="space-y-3 rounded-card border border-borde bg-superficie-tenue/60 p-4">
        <legend className="px-1 text-sm font-semibold text-texto">
          Comportamiento contable
        </legend>

        <label className="flex items-start gap-3 text-sm text-texto">
          <input
            type="checkbox"
            name="permiteMovimiento"
            defaultChecked={cuenta?.permiteMovimiento ?? true}
            className="mt-0.5 size-4 rounded border-borde-fuerte text-primario focus-visible:outline-2 focus-visible:outline-primario/25"
          />
          <span>
            Permite movimiento
            <span className="mt-0.5 block text-xs text-texto-suave">
              Solo estas cuentas pueden recibir lineas de asiento.
            </span>
          </span>
        </label>

        <label className="flex items-start gap-3 text-sm text-texto">
          <input
            type="checkbox"
            name="esCorrectora"
            defaultChecked={cuenta?.esCorrectora ?? false}
            className="mt-0.5 size-4 rounded border-borde-fuerte text-primario focus-visible:outline-2 focus-visible:outline-primario/25"
          />
          <span>
            Es cuenta correctora
            <span className="mt-0.5 block text-xs text-texto-suave">
              Reduce el rubro al que pertenece, como la depreciacion acumulada.
            </span>
          </span>
        </label>

        <label className="flex items-start gap-3 text-sm text-texto">
          <input
            type="checkbox"
            name="activa"
            defaultChecked={cuenta?.activa ?? true}
            className="mt-0.5 size-4 rounded border-borde-fuerte text-primario focus-visible:outline-2 focus-visible:outline-primario/25"
          />
          <span>
            Cuenta activa
            <span className="mt-0.5 block text-xs text-texto-suave">
              Una cuenta inactiva conserva su historia pero no admite usos nuevos.
            </span>
          </span>
        </label>
      </fieldset>

      {esEdicion ? (
        <FormField
          id="motivo"
          etiqueta="Motivo del cambio"
          ayuda="Queda registrado en la auditoria del catalogo."
          requerido
        >
          <Input
            id="motivo"
            name="motivo"
            required
            maxLength={240}
            placeholder="Ej.: ajuste de clasificacion revisado"
          />
        </FormField>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" disabled={pendiente}>
          <Save aria-hidden="true" />
          {pendiente ? "Guardando..." : esEdicion ? "Guardar cambios" : "Guardar cuenta"}
        </Button>
        <Button asChild variant="secondary">
          <Link href={rutas.catalogo.lista}>Cancelar</Link>
        </Button>
      </div>
    </form>
  );
}

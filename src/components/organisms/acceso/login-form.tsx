"use client";

import { LogIn } from "lucide-react";
import Link from "next/link";
import { rutas } from "@/config/rutas";
import { useActionState, useState } from "react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { FormField } from "@/components/molecules/form-field";
import { ValidationSummary } from "@/components/molecules/validation-summary";
import {
  ESTADO_FORMULARIO_INICIAL,
  type EstadoFormulario,
} from "@/types/formularios";

type LoginFormProps = {
  accion: (
    estado: EstadoFormulario,
    formData: FormData,
  ) => Promise<EstadoFormulario>;
};

export function LoginForm({ accion }: LoginFormProps) {
  const [estado, enviar, pendiente] = useActionState(
    accion,
    ESTADO_FORMULARIO_INICIAL,
  );
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  return (
    <form action={enviar} className="space-y-5" noValidate>
      {estado.estado === "error" ? (
        <ValidationSummary
          errores={estado.campos ?? []}
          mensajeExito={undefined}
          className="text-xs"
        />
      ) : null}

      {estado.estado === "error" && (!estado.campos || estado.campos.length === 0) ? (
        <p
          role="alert"
          className="rounded-input border border-peligro/30 bg-peligro/5 px-4 py-3 text-sm text-peligro"
        >
          {estado.mensaje ?? "No se pudo iniciar sesion."}
        </p>
      ) : null}

      <FormField
        id="correo"
        etiqueta="Correo electronico"
        ayuda="El correo asociado a tu cuenta. El perfil debe estar activo."
        requerido
      >
        <Input
          id="correo"
          name="correo"
          type="email"
          autoComplete="username"
          placeholder="nombre@carlitos.local"
          required
          aria-describedby="correo-ayuda"
        />
      </FormField>

      <FormField
        id="contrasena"
        etiqueta="Contrasena"
        ayuda="Usa la contraseña asignada a tu cuenta."
        requerido
      >
        <Input
          id="contrasena"
          name="contrasena"
          type={mostrarContrasena ? "text" : "password"}
          autoComplete="current-password"
          placeholder="********"
          required
        />
      </FormField>

      <label className="flex items-center gap-2 text-xs text-texto-suave">
        <input
          type="checkbox"
          checked={mostrarContrasena}
          onChange={(evento) => setMostrarContrasena(evento.target.checked)}
          className="size-3.5 rounded border-borde-fuerte text-primario focus-visible:outline-2 focus-visible:outline-primario/25"
        />
        Mostrar contrasena
      </label>

      <Button type="submit" disabled={pendiente} className="w-full">
        <LogIn aria-hidden="true" />
        {pendiente ? "Ingresando..." : "Entrar al sistema"}
      </Button>

      <p className="text-xs leading-relaxed text-texto-suave">
        Acceso local con Supabase. Si no tenes credenciales demo, pedilas al
        responsable del entorno. No se muestran contrasenas en esta pantalla.
      </p>
      <Link href={rutas.recuperarAcceso} className="inline-block text-sm text-primario underline">¿Olvidó su contraseña?</Link>
    </form>
  );
}

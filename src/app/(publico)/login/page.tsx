import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, LogIn } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { FormField } from "@/components/molecules/form-field";
import { AuthTemplate } from "@/components/templates/auth-template";

export const metadata: Metadata = {
  title: "Acceso",
};

export default function LoginPage() {
  return (
    <AuthTemplate
      titulo="Inicia sesion"
      descripcion="Usa las credenciales asignadas a tu membresia de empresa. El acceso se habilita en la Fase 01."
    >
      <form className="space-y-5" aria-describedby="aviso-acceso">
        <div
          id="aviso-acceso"
          role="status"
          className="rounded-input border border-advertencia/30 bg-advertencia/10 px-4 py-3 text-xs leading-relaxed text-advertencia"
        >
          <span className="font-semibold">En construccion:</span> este formulario
          es visual y no autentica todavia. No ingreses credenciales reales.
        </div>

        <FormField
          id="correo"
          etiqueta="Correo electronico"
          ayuda="El correo asociado a tu membresia activa."
          requerido
        >
          <Input
            id="correo"
            name="correo"
            type="email"
            autoComplete="username"
            placeholder="nombre@carlitos.local"
            disabled
            aria-describedby="correo-ayuda"
          />
        </FormField>

        <FormField
          id="contrasena"
          etiqueta="Contrasena"
          ayuda="Minimo 8 caracteres. La politica definitiva se define en Fase 01."
          requerido
        >
          <Input
            id="contrasena"
            name="contrasena"
            type="password"
            autoComplete="current-password"
            placeholder="********"
            disabled
          />
        </FormField>

        <Button type="submit" disabled className="w-full">
          <LogIn aria-hidden="true" />
          Entrar al sistema
        </Button>

        <div className="flex flex-col gap-2 text-xs text-texto-suave sm:flex-row sm:items-center sm:justify-between">
          <span>Recuperacion de contrasena: Fase 01</span>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 font-medium text-primario hover:underline"
          >
            Revisar el cascaron
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </Link>
        </div>
      </form>
    </AuthTemplate>
  );
}

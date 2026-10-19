import type { Metadata } from "next";
import { LoginForm } from "@/components/organisms/acceso/login-form";
import { AuthTemplate } from "@/components/templates/auth-template";
import { iniciarSesionAction } from "./actions";

export const metadata: Metadata = {
  title: "Acceso",
};

export default function LoginPage() {
  return (
    <AuthTemplate
      titulo="Inicia sesion"
      descripcion="Usa las credenciales asignadas a tu membresia activa. El acceso local ya esta conectado a Supabase."
    >
      <LoginForm accion={iniciarSesionAction} />
    </AuthTemplate>
  );
}

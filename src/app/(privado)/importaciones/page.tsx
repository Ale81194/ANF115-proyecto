import type { Metadata } from "next";
import { ModulePlaceholder } from "@/components/molecules/module-placeholder";
import { pantallas } from "@/config/pantallas";

export const metadata: Metadata = {
  title: "Importaciones",
};

export default function Page() {
  return <ModulePlaceholder pantalla={pantallas.importaciones.lista} />;
}

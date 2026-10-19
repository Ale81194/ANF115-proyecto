import type { Metadata } from "next";
import { ModulePlaceholder } from "@/components/molecules/module-placeholder";
import { pantallas } from "@/config/pantallas";

export const metadata: Metadata = {
  title: "Libro diario",
};

export default function Page() {
  return <ModulePlaceholder pantalla={pantallas.diario.lista} />;
}

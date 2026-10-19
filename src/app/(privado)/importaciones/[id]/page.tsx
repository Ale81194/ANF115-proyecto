import type { Metadata } from "next";
import { ModulePlaceholder } from "@/components/molecules/module-placeholder";
import { pantallas } from "@/config/pantallas";

export const metadata: Metadata = {
  title: "Detalle de importacion",
};

export const instant = false;

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;

  return (
    <ModulePlaceholder pantalla={pantallas.importaciones.detalle} parametros={{ id }} />
  );
}

import type { Metadata, Viewport } from "next";
import type * as React from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Carlitos Finanzas",
    template: "%s \u00b7 Carlitos Finanzas",
  },
  description:
    "Control de ingresos y gastos, indicadores y reportes de Panadería Carlitos. Proyecto académico con datos simulados.",
  applicationName: "Carlitos Finanzas",
  icons: {
    icon: "/branding/favicon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#321B13",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}

import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  BookText,
  CalendarDays,
  FileBarChart,
  FileText,
  FolderTree,
  Landmark,
  LayoutDashboard,
  LineChart,
  Settings,
  ShieldCheck,
  Upload,
  Users,
  Wallet,
} from "lucide-react";
import type { Permiso } from "./permisos";

export type ItemNavegacion = {
  titulo: string;
  href: string;
  icono: LucideIcon;
  permiso: Permiso | null;
};

export type GrupoNavegacion = {
  id: string;
  titulo: string;
  items: readonly ItemNavegacion[];
};

export const navegacionPrincipal: ItemNavegacion = {
  titulo: "Dashboard",
  href: "/dashboard",
  icono: LayoutDashboard,
  permiso: "finanzas.leer",
};

/**
 * Ocho areas funcionales del sistema.
 *
 * El orden y los titulos siguen la referencia de marca. Las rutas provienen
 * de src/config/rutas.ts; aqui se repiten como constantes de navegacion para
 * que el menu no dependa de funciones.
 */
export const navegacion: readonly GrupoNavegacion[] = [
  {
    id: "usuarios",
    titulo: "Usuarios y roles",
    items: [
      {
        titulo: "Usuarios",
        href: "/usuarios",
        icono: Users,
        permiso: "usuarios.gestionar",
      },
    ],
  },
  {
    id: "catalogo-periodos",
    titulo: "Catalogo y periodos",
    items: [
      {
        titulo: "Catalogo de cuentas",
        href: "/catalogo",
        icono: FolderTree,
        permiso: "finanzas.leer",
      },
      {
        titulo: "Periodos",
        href: "/periodos",
        icono: CalendarDays,
        permiso: "finanzas.leer",
      },
    ],
  },
  {
    id: "registros",
    titulo: "Importacion y registros",
    items: [
      {
        titulo: "Importaciones",
        href: "/importaciones",
        icono: Upload,
        permiso: "finanzas.leer",
      },
      {
        titulo: "Libro diario",
        href: "/diario",
        icono: BookText,
        permiso: "finanzas.leer",
      },
    ],
  },
  {
    id: "estados",
    titulo: "Estados historicos",
    items: [
      {
        titulo: "Estados financieros",
        href: "/estados",
        icono: FileBarChart,
        permiso: "finanzas.leer",
      },
    ],
  },
  {
    id: "presupuestos",
    titulo: "Presupuestos",
    items: [
      {
        titulo: "Presupuestos",
        href: "/presupuestos",
        icono: Wallet,
        permiso: "finanzas.leer",
      },
    ],
  },
  {
    id: "escenarios",
    titulo: "Pronosticos y escenarios",
    items: [
      {
        titulo: "Escenarios",
        href: "/escenarios",
        icono: LineChart,
        permiso: "finanzas.leer",
      },
    ],
  },
  {
    id: "proyecciones",
    titulo: "Estados proyectados",
    items: [
      {
        titulo: "Proyecciones",
        href: "/proyecciones",
        icono: Landmark,
        permiso: "finanzas.leer",
      },
    ],
  },
  {
    id: "analisis-reportes",
    titulo: "Analisis y reportes",
    items: [
      {
        titulo: "Indicadores",
        href: "/analisis/indicadores",
        icono: BookOpen,
        permiso: "finanzas.leer",
      },
      {
        titulo: "Analisis comparativo",
        href: "/analisis/comparativo",
        icono: FileText,
        permiso: "finanzas.leer",
      },
      {
        titulo: "Reportes",
        href: "/reportes",
        icono: FileBarChart,
        permiso: "finanzas.leer",
      },
      {
        titulo: "Auditoria",
        href: "/auditoria",
        icono: ShieldCheck,
        permiso: "auditoria.leer",
      },
      {
        titulo: "Configuracion",
        href: "/configuracion",
        icono: Settings,
        permiso: null,
      },
    ],
  },
];

/**
 * Filtra el menu por permisos resueltos en el servidor.
 *
 * Ocultar una opcion no autoriza ni protege la operacion: la pagina, la
 * Action, el controlador y PostgreSQL repiten la verificacion.
 */
export function filtrarNavegacion(
  permisos: readonly Permiso[],
): readonly GrupoNavegacion[] {
  const concedidos = new Set<Permiso>(permisos);

  return navegacion
    .map((grupo) => ({
      ...grupo,
      items: grupo.items.filter(
        (item) => item.permiso === null || concedidos.has(item.permiso),
      ),
    }))
    .filter((grupo) => grupo.items.length > 0);
}

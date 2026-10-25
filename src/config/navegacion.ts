import type { LucideIcon } from "lucide-react";
import { Users, TrendingUp, TrendingDown, Tags, LayoutDashboard, FileBarChart, ShieldCheck } from "lucide-react";
import type { Permiso } from "./permisos";
import { rutas } from "./rutas";

export type ItemNavegacion = { titulo: string; href: string; icono: LucideIcon; permiso: Permiso | null };
export type GrupoNavegacion = { id: string; titulo: string; items: readonly ItemNavegacion[] };

export const navegacionPrincipal: ItemNavegacion = {
  titulo: "Panel financiero", href: rutas.dashboard, icono: LayoutDashboard, permiso: "finanzas.leer",
};

export const navegacion: readonly GrupoNavegacion[] = [{
  id: "operacion", titulo: "Control financiero", items: [
    { titulo: "Usuarios", href: rutas.usuarios.lista, icono: Users, permiso: "usuarios.gestionar" },
    { titulo: "Ingresos", href: rutas.ingresos, icono: TrendingUp, permiso: "finanzas.leer" },
    { titulo: "Gastos", href: rutas.gastos, icono: TrendingDown, permiso: "finanzas.leer" },
    { titulo: "Categorías", href: rutas.categorias, icono: Tags, permiso: "finanzas.leer" },
    navegacionPrincipal,
    { titulo: "Reportes", href: rutas.reportes.lista, icono: FileBarChart, permiso: "finanzas.leer" },
    { titulo: "Seguridad y bitácora", href: rutas.auditoria, icono: ShieldCheck, permiso: "auditoria.leer" },
  ],
}];

export function filtrarNavegacion(permisos: readonly Permiso[]): readonly GrupoNavegacion[] {
  return navegacion.map((g) => ({ ...g, items: g.items.filter((i) => i.permiso === null || permisos.includes(i.permiso)) }))
    .filter((g) => g.items.length > 0);
}

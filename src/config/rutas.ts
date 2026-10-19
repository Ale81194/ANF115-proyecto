/**
 * Fuente unica de URLs de la aplicacion.
 *
 * Las paginas, enlaces y redirecciones usan este mapa. Escapar un segmento no
 * demuestra que el recurso exista ni que pertenezca a la empresa autorizada.
 *
 * Fuente: docs/tecnico/06_DIRECTORIOS_Y_CONVENCIONES.md y 09_PANTALLAS.
 */
export const rutas = {
  inicio: "/",
  login: "/login",
  dashboard: "/dashboard",
  usuarios: {
    lista: "/usuarios",
    nuevo: "/usuarios/nuevo",
    detalle: (id: string) => `/usuarios/${encodeURIComponent(id)}`,
    permisos: "/usuarios/permisos",
  },
  catalogo: {
    lista: "/catalogo",
    nueva: "/catalogo/nueva",
    detalle: (id: string) => `/catalogo/${encodeURIComponent(id)}`,
  },
  periodos: {
    lista: "/periodos",
    cierre: (id: string) => `/periodos/${encodeURIComponent(id)}/cierre`,
  },
  importaciones: {
    lista: "/importaciones",
    detalle: (id: string) => `/importaciones/${encodeURIComponent(id)}`,
  },
  diario: {
    lista: "/diario",
    nuevo: "/diario/nuevo",
    detalle: (id: string) => `/diario/${encodeURIComponent(id)}`,
  },
  estados: {
    indice: "/estados",
    comprobacion: "/estados/comprobacion",
    resultados: "/estados/resultados",
    balance: "/estados/balance",
    patrimonio: "/estados/patrimonio",
  },
  presupuestos: {
    lista: "/presupuestos",
    detalle: (id: string) => `/presupuestos/${encodeURIComponent(id)}`,
    comparativo: (id: string) =>
      `/presupuestos/${encodeURIComponent(id)}/comparativo`,
  },
  escenarios: {
    lista: "/escenarios",
    detalle: (id: string) => `/escenarios/${encodeURIComponent(id)}`,
    comparar: "/escenarios/comparar",
  },
  proyecciones: {
    lista: "/proyecciones",
    resultados: (id: string) =>
      `/proyecciones/${encodeURIComponent(id)}/resultados`,
    balance: (id: string) => `/proyecciones/${encodeURIComponent(id)}/balance`,
    patrimonio: (id: string) =>
      `/proyecciones/${encodeURIComponent(id)}/patrimonio`,
  },
  analisis: {
    indicadores: "/analisis/indicadores",
    comparativo: "/analisis/comparativo",
  },
  reportes: {
    lista: "/reportes",
    detalle: (id: string) => `/reportes/${encodeURIComponent(id)}`,
  },
  auditoria: "/auditoria",
  configuracion: "/configuracion",
  api: {
    health: "/api/health",
  },
} as const;

export type Rutas = typeof rutas;

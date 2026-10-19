/**
 * Catalogo tipado de permisos funcionales.
 *
 * La matriz de este archivo es una referencia de semillas y navegacion.
 * La asignacion efectiva de permisos vive en PostgreSQL (roles, permisos y
 * rol_permisos) y se resuelve por solicitud; nunca se acepta desde el cliente.
 *
 * Fuente: docs/tecnico/08_AUTENTICACION_PERMISOS_Y_AUDITORIA.md
 */
export const PERMISOS = {
  finanzasLeer: "finanzas.leer",
  usuariosGestionar: "usuarios.gestionar",
  catalogoPublicar: "catalogo.publicar",
  periodosGestionar: "periodos.gestionar",
  importacionesPreparar: "importaciones.preparar",
  asientosPreparar: "asientos.preparar",
  asientosAprobar: "asientos.aprobar",
  asientosRevertir: "asientos.revertir",
  periodosCerrar: "periodos.cerrar",
  periodosReabrir: "periodos.reabrir",
  presupuestosPreparar: "presupuestos.preparar",
  presupuestosAprobar: "presupuestos.aprobar",
  escenariosEjecutar: "escenarios.ejecutar",
  reportesExportar: "reportes.exportar",
  auditoriaLeer: "auditoria.leer",
} as const;

export type Permiso = (typeof PERMISOS)[keyof typeof PERMISOS];

export const ROLES = {
  administrador: "administrador",
  analista: "analista",
  gerencia: "gerencia",
} as const;

export type Rol = (typeof ROLES)[keyof typeof ROLES];

/**
 * Permisos concedidos por rol en la propuesta inicial.
 *
 * "Solo asignacion explicita" del documento 08 no se representa aqui: son
 * asignaciones excepcionales que deben existir en la base y quedar auditadas.
 */
export const PERMISOS_POR_ROL: Readonly<Record<Rol, readonly Permiso[]>> = {
  administrador: [
    PERMISOS.finanzasLeer,
    PERMISOS.usuariosGestionar,
    PERMISOS.catalogoPublicar,
    PERMISOS.periodosGestionar,
    PERMISOS.asientosAprobar,
    PERMISOS.asientosRevertir,
    PERMISOS.periodosCerrar,
    PERMISOS.periodosReabrir,
    PERMISOS.reportesExportar,
    PERMISOS.auditoriaLeer,
  ],
  analista: [
    PERMISOS.finanzasLeer,
    PERMISOS.importacionesPreparar,
    PERMISOS.asientosPreparar,
    PERMISOS.presupuestosPreparar,
    PERMISOS.escenariosEjecutar,
    PERMISOS.reportesExportar,
  ],
  gerencia: [
    PERMISOS.finanzasLeer,
    PERMISOS.presupuestosAprobar,
    PERMISOS.reportesExportar,
  ],
};

export function rolTienePermiso(rol: Rol, permiso: Permiso): boolean {
  return PERMISOS_POR_ROL[rol].includes(permiso);
}

export function esPermisoConocido(valor: string): valor is Permiso {
  return (Object.values(PERMISOS) as string[]).includes(valor);
}

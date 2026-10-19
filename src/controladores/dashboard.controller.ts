import { PERMISOS } from "@/config/permisos";
import { fallo, ok } from "@/lib/resultado";
import { requerirContexto, tienePermiso } from "@/auth/requerir-contexto";
import { listarCuentas } from "@/repositorios/catalogo.repository";
import { listarPeriodos } from "@/repositorios/periodos.repository";
import { resumirCatalogo } from "@/servicios/catalogo/arbol-cuentas";
import {
  etiquetaPeriodo,
  resumirPeriodos,
} from "@/servicios/periodos/calendario";
import type { DashboardVistaDTO, PeriodoVistaDTO } from "@/types/contabilidad";
import type { Resultado } from "@/types/respuestas";

/** Resumen real del estado base: catalogo y periodos, sin cifras inventadas. */
export async function obtenerDashboard(): Promise<Resultado<DashboardVistaDTO>> {
  const contextoResultado = await requerirContexto();

  if (!contextoResultado.ok) {
    return contextoResultado;
  }

  const contexto = contextoResultado.datos;

  if (!tienePermiso(contexto, PERMISOS.finanzasLeer)) {
    return fallo("PERMISO_DENEGADO", contexto.requestId);
  }

  const cuentasResultado = await listarCuentas(contexto);
  const periodosResultado = await listarPeriodos(contexto);

  if (!cuentasResultado.ok) {
    return cuentasResultado;
  }

  if (!periodosResultado.ok) {
    return periodosResultado;
  }

  const ultimo = periodosResultado.datos[0];
  const ultimoPeriodo: PeriodoVistaDTO | null = ultimo
    ? { ...ultimo, etiqueta: etiquetaPeriodo(ultimo.anio, ultimo.mes) }
    : null;

  return ok(
    {
      contexto,
      cuentas: resumirCatalogo(cuentasResultado.datos),
      periodos: resumirPeriodos(periodosResultado.datos),
      ultimoPeriodo,
      puedePublicarCatalogo: tienePermiso(contexto, PERMISOS.catalogoPublicar),
      puedeGestionarPeriodos: tienePermiso(
        contexto,
        PERMISOS.periodosGestionar,
      ),
    },
    contexto.requestId,
  );
}

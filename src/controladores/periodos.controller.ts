import { PERMISOS } from "@/config/permisos";
import { fallo, ok } from "@/lib/resultado";
import { requerirContexto, tienePermiso } from "@/auth/requerir-contexto";
import {
  crearPeriodo as crearPeriodoRepo,
  listarPeriodos,
} from "@/repositorios/periodos.repository";
import {
  etiquetaPeriodo,
  resumirPeriodos,
} from "@/servicios/periodos/calendario";
import type {
  ComandoCrearPeriodo,
  PeriodoCreadoDTO,
  PeriodosVistaDTO,
  PeriodoVistaDTO,
} from "@/types/contabilidad";
import type { Resultado } from "@/types/respuestas";

/** CU-04 lectura: calendario autorizado de la empresa. */
export async function listarPeriodosVista(
  anioFiltro?: number | null,
): Promise<Resultado<PeriodosVistaDTO>> {
  const contextoResultado = await requerirContexto();

  if (!contextoResultado.ok) {
    return contextoResultado;
  }

  const contexto = contextoResultado.datos;

  if (!tienePermiso(contexto, PERMISOS.finanzasLeer)) {
    return fallo("PERMISO_DENEGADO", contexto.requestId);
  }

  const periodosResultado = await listarPeriodos(contexto);

  if (!periodosResultado.ok) {
    return periodosResultado;
  }

  const todos = periodosResultado.datos;
  const aniosDisponibles = [
    ...new Set(todos.map((periodo) => periodo.anio)),
  ].sort((a, b) => b - a);

  const filtrados =
    anioFiltro && aniosDisponibles.includes(anioFiltro)
      ? todos.filter((periodo) => periodo.anio === anioFiltro)
      : todos;

  const periodos: PeriodoVistaDTO[] = filtrados.map((periodo) => ({
    ...periodo,
    etiqueta: etiquetaPeriodo(periodo.anio, periodo.mes),
  }));

  return ok(
    {
      contexto,
      periodos,
      resumen: resumirPeriodos(todos),
      puedeGestionar: tienePermiso(contexto, PERMISOS.periodosGestionar),
      anioFiltro: anioFiltro && aniosDisponibles.includes(anioFiltro) ? anioFiltro : null,
      aniosDisponibles,
    },
    contexto.requestId,
  );
}

/** CU-04 mutacion: crear un periodo mensual valido. */
export async function crearPeriodo(
  comando: ComandoCrearPeriodo,
): Promise<Resultado<PeriodoCreadoDTO>> {
  const contextoResultado = await requerirContexto();

  if (!contextoResultado.ok) {
    return contextoResultado;
  }

  const contexto = contextoResultado.datos;

  if (!tienePermiso(contexto, PERMISOS.periodosGestionar)) {
    return fallo("PERMISO_DENEGADO", contexto.requestId);
  }

  return crearPeriodoRepo(contexto, comando);
}

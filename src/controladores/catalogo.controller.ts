import { PERMISOS } from "@/config/permisos";
import { fallo, ok } from "@/lib/resultado";
import { normalizarBusqueda } from "@/lib/texto";
import { requerirContexto, tienePermiso } from "@/auth/requerir-contexto";
import {
  guardarCuenta as guardarCuentaRepo,
  listarCuentas,
  listarOpcionesCuenta,
  listarRubros,
  obtenerCuenta as obtenerCuentaRepo,
} from "@/repositorios/catalogo.repository";
import {
  construirFilasCatalogo,
  resumirCatalogo,
} from "@/servicios/catalogo/arbol-cuentas";
import type {
  CatalogoVistaDTO,
  ComandoGuardarCuenta,
  CuentaDetalleVistaDTO,
  CuentaGuardadaDTO,
  OpcionesCatalogoDTO,
} from "@/types/contabilidad";
import type { Resultado } from "@/types/respuestas";

/** CU-03 lectura: catalogo autorizado y arbol estable. */
export async function listarCatalogo(
  busqueda?: string | null,
): Promise<Resultado<CatalogoVistaDTO>> {
  const contextoResultado = await requerirContexto();

  if (!contextoResultado.ok) {
    return contextoResultado;
  }

  const contexto = contextoResultado.datos;

  if (!tienePermiso(contexto, PERMISOS.finanzasLeer)) {
    return fallo("PERMISO_DENEGADO", contexto.requestId);
  }

  const cuentasResultado = await listarCuentas(contexto, busqueda);

  if (!cuentasResultado.ok) {
    return cuentasResultado;
  }

  const cuentas = cuentasResultado.datos;

  return ok(
    {
      contexto,
      cuentas,
      filas: construirFilasCatalogo(cuentas),
      resumen: resumirCatalogo(cuentas),
      puedeEditar: tienePermiso(contexto, PERMISOS.catalogoPublicar),
      busqueda: normalizarBusqueda(busqueda),
    },
    contexto.requestId,
  );
}

/** Opciones autorizadas para el formulario de cuenta. */
export async function listarOpcionesCatalogo(
  cuentaId?: string,
): Promise<Resultado<OpcionesCatalogoDTO>> {
  const contextoResultado = await requerirContexto();

  if (!contextoResultado.ok) {
    return contextoResultado;
  }

  const contexto = contextoResultado.datos;

  if (!tienePermiso(contexto, PERMISOS.catalogoPublicar)) {
    return fallo("PERMISO_DENEGADO", contexto.requestId);
  }

  const rubrosResultado = await listarRubros(contexto);

  if (!rubrosResultado.ok) {
    return rubrosResultado;
  }

  const cuentasResultado = await listarOpcionesCuenta(contexto);

  if (!cuentasResultado.ok) {
    return cuentasResultado;
  }

  let cuenta;

  if (cuentaId) {
    const cuentaResultado = await obtenerCuentaRepo(contexto, cuentaId);

    if (!cuentaResultado.ok) {
      return cuentaResultado;
    }

    cuenta = cuentaResultado.datos;
  }

  return ok(
    {
      rubros: rubrosResultado.datos,
      cuentasPadre: cuentasResultado.datos.filter(
        (opcion) => opcion.id !== cuentaId,
      ),
      cuenta,
    },
    contexto.requestId,
  );
}

/** CU-03 lectura de una cuenta del catalogo autorizado. */
export async function obtenerCuentaDetalle(
  cuentaId: string,
): Promise<Resultado<CuentaDetalleVistaDTO>> {
  const contextoResultado = await requerirContexto();

  if (!contextoResultado.ok) {
    return contextoResultado;
  }

  const contexto = contextoResultado.datos;

  if (!tienePermiso(contexto, PERMISOS.finanzasLeer)) {
    return fallo("PERMISO_DENEGADO", contexto.requestId);
  }

  const cuentaResultado = await obtenerCuentaRepo(contexto, cuentaId);

  if (!cuentaResultado.ok) {
    return cuentaResultado;
  }

  return ok(
    {
      contexto,
      cuenta: cuentaResultado.datos,
      puedeEditar: tienePermiso(contexto, PERMISOS.catalogoPublicar),
    },
    contexto.requestId,
  );
}

/** CU-03 mutacion: crear o actualizar una cuenta con version e idempotencia. */
export async function guardarCuenta(
  comando: ComandoGuardarCuenta,
): Promise<Resultado<CuentaGuardadaDTO>> {
  const contextoResultado = await requerirContexto();

  if (!contextoResultado.ok) {
    return contextoResultado;
  }

  const contexto = contextoResultado.datos;

  if (!tienePermiso(contexto, PERMISOS.catalogoPublicar)) {
    return fallo("PERMISO_DENEGADO", contexto.requestId);
  }

  return guardarCuentaRepo(contexto, comando);
}

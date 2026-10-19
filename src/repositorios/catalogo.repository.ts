import { z } from "zod";
import { esCodigoError } from "@/lib/errores";
import { fallo, ok } from "@/lib/resultado";
import { normalizarBusqueda } from "@/lib/texto";
import { crearClienteServidor } from "@/supabase/server";
import type { Database } from "@/supabase/database.types";
import {
  CLASES_CUENTA,
  ESTADOS_FINANCIEROS,
  NATURALEZAS_CUENTA,
} from "@/types/contabilidad";
import type {
  ComandoGuardarCuenta,
  CuentaDTO,
  CuentaGuardadaDTO,
  OpcionCuentaDTO,
  RubroDTO,
} from "@/types/contabilidad";
import type { ContextoAcceso } from "@/types/contexto";
import type { Resultado } from "@/types/respuestas";

type CuentaRow = Database["public"]["Tables"]["cuentas"]["Row"];
type RubroRow = Database["public"]["Tables"]["rubros_financieros"]["Row"];
type RubroSeleccionado = Pick<
  RubroRow,
  "id" | "codigo" | "nombre" | "estado_financiero" | "padre_id" | "signo_presentacion"
>;

const claseSchema = z.enum(CLASES_CUENTA);
const naturalezaSchema = z.enum(NATURALEZAS_CUENTA);
const estadoFinancieroSchema = z.enum(ESTADOS_FINANCIEROS);

const campoSchema = z.object({
  ruta: z.string(),
  codigo: z.string(),
  mensaje: z.string(),
});

const respuestaGuardarSchema = z.discriminatedUnion("ok", [
  z.object({
    ok: z.literal(true),
    datos: z.object({
      id: z.string().uuid(),
      version: z.number().int().positive(),
      revisionCatalogo: z.number().int().positive(),
    }),
  }),
  z.object({
    ok: z.literal(false),
    codigo: z.string(),
    mensaje: z.string(),
    campos: z.array(campoSchema).optional(),
  }),
]);

type RubroJoin =
  | { nombre: string }
  | { nombre: string }[]
  | null;

type CuentaConRubro = CuentaRow & {
  rubros_financieros: RubroJoin;
};

function nombreRubro(valor: RubroJoin | undefined): string {
  if (Array.isArray(valor)) {
    return valor[0]?.nombre ?? "Sin rubro";
  }

  return valor?.nombre ?? "Sin rubro";
}

function aCuentaDTO(fila: CuentaConRubro): CuentaDTO {
  return {
    id: fila.id,
    codigo: fila.codigo,
    nombre: fila.nombre,
    padreId: fila.padre_id,
    clase: claseSchema.parse(fila.clase),
    naturaleza: naturalezaSchema.parse(fila.naturaleza),
    rubroId: fila.rubro_id,
    rubroNombre: nombreRubro(fila.rubros_financieros),
    esCorrectora: fila.es_correctora,
    permiteMovimiento: fila.permite_movimiento,
    activa: fila.activa,
    vigenciaDesde: fila.vigencia_desde,
    vigenciaHasta: fila.vigencia_hasta,
    version: fila.version,
  };
}

function aRubroDTO(fila: RubroSeleccionado): RubroDTO {
  return {
    id: fila.id,
    codigo: fila.codigo,
    nombre: fila.nombre,
    estadoFinanciero: estadoFinancieroSchema.parse(fila.estado_financiero),
    padreId: fila.padre_id,
    signoPresentacion: fila.signo_presentacion,
  };
}

export async function listarCuentas(
  contexto: ContextoAcceso,
  busqueda?: string | null,
): Promise<Resultado<CuentaDTO[]>> {
  const supabase = await crearClienteServidor();
  const q = normalizarBusqueda(busqueda);

  let consulta = supabase
    .from("cuentas")
    .select(
      "id,codigo,nombre,padre_id,clase,naturaleza,rubro_id,es_correctora,permite_movimiento,activa,vigencia_desde,vigencia_hasta,version,rubros_financieros(nombre)",
    )
    .eq("empresa_id", contexto.empresaId);

  if (q.length > 0) {
    consulta = consulta.or(`codigo.ilike.%${q}%,nombre.ilike.%${q}%`);
  }

  const { data, error } = await consulta.order("codigo", { ascending: true });

  if (error) {
    console.error("No se pudo listar el catalogo.", error.message);
    return fallo("ERROR_INTERNO", contexto.requestId);
  }

  return ok(
    (data as CuentaConRubro[] | null)?.map(aCuentaDTO) ?? [],
    contexto.requestId,
  );
}

export async function listarRubros(
  contexto: ContextoAcceso,
): Promise<Resultado<RubroDTO[]>> {
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase
    .from("rubros_financieros")
    .select("id,codigo,nombre,estado_financiero,padre_id,signo_presentacion")
    .eq("empresa_id", contexto.empresaId)
    .order("codigo", { ascending: true });

  if (error) {
    console.error("No se pudieron listar los rubros.", error.message);
    return fallo("ERROR_INTERNO", contexto.requestId);
  }

  return ok((data ?? []).map(aRubroDTO), contexto.requestId);
}

export async function listarOpcionesCuenta(
  contexto: ContextoAcceso,
): Promise<Resultado<OpcionCuentaDTO[]>> {
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase
    .from("cuentas")
    .select("id,codigo,nombre,permite_movimiento")
    .eq("empresa_id", contexto.empresaId)
    .order("codigo", { ascending: true });

  if (error) {
    console.error("No se pudieron listar las cuentas padre.", error.message);
    return fallo("ERROR_INTERNO", contexto.requestId);
  }

  return ok(
    (data ?? []).map((fila) => ({
      id: fila.id,
      codigo: fila.codigo,
      nombre: fila.nombre,
      permiteMovimiento: fila.permite_movimiento,
    })),
    contexto.requestId,
  );
}

export async function obtenerCuenta(
  contexto: ContextoAcceso,
  cuentaId: string,
): Promise<Resultado<CuentaDTO>> {
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase
    .from("cuentas")
    .select(
      "id,codigo,nombre,padre_id,clase,naturaleza,rubro_id,es_correctora,permite_movimiento,activa,vigencia_desde,vigencia_hasta,version,rubros_financieros(nombre)",
    )
    .eq("empresa_id", contexto.empresaId)
    .eq("id", cuentaId)
    .maybeSingle();

  if (error) {
    console.error("No se pudo leer la cuenta.", error.message);
    return fallo("ERROR_INTERNO", contexto.requestId);
  }

  if (!data) {
    return fallo("RECURSO_NO_ENCONTRADO", contexto.requestId);
  }

  return ok(aCuentaDTO(data as CuentaConRubro), contexto.requestId);
}

export async function guardarCuenta(
  contexto: ContextoAcceso,
  comando: ComandoGuardarCuenta,
): Promise<Resultado<CuentaGuardadaDTO>> {
  const supabase = await crearClienteServidor();
  // El generador de tipos de Supabase no marca como nullable los argumentos
  // SQL; los campos opcionales se envian como null y la funcion los valida.
  const argumentos = {
    p_empresa_id: contexto.empresaId,
    p_cuenta_id: comando.cuentaId,
    p_codigo: comando.codigo,
    p_nombre: comando.nombre,
    p_padre_id: comando.padreId,
    p_clase: comando.clase,
    p_naturaleza: comando.naturaleza,
    p_rubro_id: comando.rubroId,
    p_es_correctora: comando.esCorrectora,
    p_permite_movimiento: comando.permiteMovimiento,
    p_activa: comando.activa,
    p_vigencia_desde: comando.vigenciaDesde,
    p_vigencia_hasta: comando.vigenciaHasta,
    p_version_esperada: comando.versionEsperada,
    p_motivo: comando.motivo,
    p_request_id: contexto.requestId,
    p_clave_idempotencia: comando.claveIdempotencia,
  } as unknown as Database["public"]["Functions"]["guardar_cuenta"]["Args"];

  const { data, error } = await supabase.rpc("guardar_cuenta", argumentos);

  if (error) {
    console.error("Fallo la RPC guardar_cuenta.", error.message);
    return fallo("ERROR_INTERNO", contexto.requestId);
  }

  const respuesta = respuestaGuardarSchema.safeParse(data);

  if (!respuesta.success) {
    console.error("Respuesta inesperada de guardar_cuenta.");
    return fallo("ERROR_INTERNO", contexto.requestId);
  }

  if (!respuesta.data.ok) {
    return fallo(
      esCodigoError(respuesta.data.codigo)
        ? respuesta.data.codigo
        : "ERROR_INTERNO",
      contexto.requestId,
      {
        mensaje: respuesta.data.mensaje,
        campos: respuesta.data.campos,
      },
    );
  }

  return ok(respuesta.data.datos, contexto.requestId);
}

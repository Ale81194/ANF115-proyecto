import { z } from "zod";
import { esCodigoError } from "@/lib/errores";
import { fallo, ok } from "@/lib/resultado";
import { crearClienteServidor } from "@/supabase/server";
import type { Database } from "@/supabase/database.types";
import { ESTADOS_PERIODO } from "@/types/contabilidad";
import type {
  ComandoCrearPeriodo,
  PeriodoCreadoDTO,
  PeriodoDTO,
} from "@/types/contabilidad";
import type { ContextoAcceso } from "@/types/contexto";
import type { Resultado } from "@/types/respuestas";

type PeriodoRow = Database["public"]["Tables"]["periodos"]["Row"];
type PeriodoSeleccionado = Pick<
  PeriodoRow,
  | "id"
  | "anio"
  | "mes"
  | "inicio"
  | "fin"
  | "estado"
  | "revision"
  | "siguiente_numero_asiento"
  | "version"
>;

const estadoSchema = z.enum(ESTADOS_PERIODO);

const respuestaCrearSchema = z.discriminatedUnion("ok", [
  z.object({
    ok: z.literal(true),
    datos: z.object({
      id: z.string().uuid(),
      version: z.number().int().positive(),
    }),
  }),
  z.object({
    ok: z.literal(false),
    codigo: z.string(),
    mensaje: z.string(),
    campos: z
      .array(
        z.object({
          ruta: z.string(),
          codigo: z.string(),
          mensaje: z.string(),
        }),
      )
      .optional(),
  }),
]);

function aPeriodoDTO(fila: PeriodoSeleccionado): PeriodoDTO {
  return {
    id: fila.id,
    anio: fila.anio,
    mes: fila.mes,
    inicio: fila.inicio,
    fin: fila.fin,
    estado: estadoSchema.parse(fila.estado),
    revision: fila.revision,
    siguienteNumeroAsiento: fila.siguiente_numero_asiento,
    version: fila.version,
  };
}

export async function listarPeriodos(
  contexto: ContextoAcceso,
  anio?: number | null,
): Promise<Resultado<PeriodoDTO[]>> {
  const supabase = await crearClienteServidor();

  let consulta = supabase
    .from("periodos")
    .select(
      "id,anio,mes,inicio,fin,estado,revision,siguiente_numero_asiento,version",
    )
    .eq("empresa_id", contexto.empresaId);

  if (anio !== null && anio !== undefined) {
    consulta = consulta.eq("anio", anio);
  }

  const { data, error } = await consulta
    .order("anio", { ascending: false })
    .order("mes", { ascending: false });

  if (error) {
    console.error("No se pudieron listar los periodos.", error.message);
    return fallo("ERROR_INTERNO", contexto.requestId);
  }

  return ok((data ?? []).map(aPeriodoDTO), contexto.requestId);
}

export async function crearPeriodo(
  contexto: ContextoAcceso,
  comando: ComandoCrearPeriodo,
): Promise<Resultado<PeriodoCreadoDTO>> {
  const supabase = await crearClienteServidor();
  // Los argumentos opcionales se envian como null; el generador de tipos no
  // modela esa nulabilidad.
  const argumentos = {
    p_empresa_id: contexto.empresaId,
    p_anio: comando.anio,
    p_mes: comando.mes,
    p_request_id: contexto.requestId,
    p_clave_idempotencia: comando.claveIdempotencia,
  } as unknown as Database["public"]["Functions"]["crear_periodo"]["Args"];

  const { data, error } = await supabase.rpc("crear_periodo", argumentos);

  if (error) {
    console.error("Fallo la RPC crear_periodo.", error.message);
    return fallo("ERROR_INTERNO", contexto.requestId);
  }

  const respuesta = respuestaCrearSchema.safeParse(data);

  if (!respuesta.success) {
    console.error("Respuesta inesperada de crear_periodo.");
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

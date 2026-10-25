import type { Categoria, Movimiento, Perfil, EventoBitacora } from "@/types/finanzas";

type Table<Row> = { Row: Row; Insert: Partial<Row>; Update: Partial<Row>; Relationships: [] };
type Fn<Args, Returns> = { Args: Args; Returns: Returns };

/** Contract of the local operational migration, separate from archived types. */
export type FinanzasDatabase = {
  public: {
    Tables: {
      perfiles: Table<Perfil>;
      categorias: Table<Categoria>;
      bitacora: Table<EventoBitacora>;
    };
    Views: { v_movimientos: { Row: Movimiento; Relationships: [] } };
    Functions: {
      anf_guardar_movimiento: Fn<{
        p_tipo: string; p_id: string | null; p_revision: number | null;
        p_solicitud: string; p_fecha: string; p_concepto: string; p_monto: string;
        p_categoria: string; p_referencia: string;
      }, string>;
      anf_anular_movimiento: Fn<{ p_tipo: string; p_id: string; p_revision: number; p_motivo: string }, string>;
      anf_guardar_categoria: Fn<{
        p_id: string | null; p_version: string | null; p_codigo: string; p_nombre: string;
        p_tipo: string; p_descripcion: string; p_activo: boolean;
      }, string>;
      anf_guardar_perfil: Fn<{
        p_id: string; p_version: string; p_nombre: string; p_rol: string; p_activo: boolean;
      }, string>;
      anf_reporte: Fn<{
        p_desde: string; p_hasta: string; p_categoria: string | null;
        p_tipo: string | null; p_granularidad: string;
      }, unknown>;
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

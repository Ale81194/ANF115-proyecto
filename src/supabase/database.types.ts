
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "auditoria": {
                  Row: {
                    "accion": string,"actor_id": string | null,"cambio_resumido": NonNullable<Json>,"empresa_id": string,"entidad_id": string | null,"entidad_tipo": string,"id": string,"instante": string,"motivo": string | null,"request_id": string,"version_anterior": number | null,"version_nueva": number | null
                  }
                  ComputedFields: never
                  Insert: {
                    "accion": string,"actor_id"?: string | null,"cambio_resumido"?: NonNullable<Json>,"empresa_id": string,"entidad_id"?: string | null,"entidad_tipo": string,"id"?: string,"instante"?: string,"motivo"?: string | null,"request_id": string,"version_anterior"?: number | null,"version_nueva"?: number | null
                  }
                  Update: {
                    "accion"?: string,"actor_id"?: string | null,"cambio_resumido"?: NonNullable<Json>,"empresa_id"?: string,"entidad_id"?: string | null,"entidad_tipo"?: string,"id"?: string,"instante"?: string,"motivo"?: string | null,"request_id"?: string,"version_anterior"?: number | null,"version_nueva"?: number | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "auditoria_empresa_id_fkey"
      columns: ["empresa_id"]
isOneToOne: false
      referencedRelation: "empresas"
      referencedColumns: ["id"]
    }
                  ]
                },"cuentas": {
                  Row: {
                    "activa": boolean,"actualizado_en": string,"clase": string,"codigo": string,"creado_en": string,"empresa_id": string,"es_correctora": boolean,"id": string,"naturaleza": string,"nombre": string,"padre_id": string | null,"permite_movimiento": boolean,"rubro_id": string,"version": number,"vigencia_desde": string,"vigencia_hasta": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "activa"?: boolean,"actualizado_en"?: string,"clase": string,"codigo": string,"creado_en"?: string,"empresa_id": string,"es_correctora"?: boolean,"id"?: string,"naturaleza": string,"nombre": string,"padre_id"?: string | null,"permite_movimiento"?: boolean,"rubro_id": string,"version"?: number,"vigencia_desde"?: string,"vigencia_hasta"?: string | null
                  }
                  Update: {
                    "activa"?: boolean,"actualizado_en"?: string,"clase"?: string,"codigo"?: string,"creado_en"?: string,"empresa_id"?: string,"es_correctora"?: boolean,"id"?: string,"naturaleza"?: string,"nombre"?: string,"padre_id"?: string | null,"permite_movimiento"?: boolean,"rubro_id"?: string,"version"?: number,"vigencia_desde"?: string,"vigencia_hasta"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "cuentas_empresa_id_fkey"
      columns: ["empresa_id"]
isOneToOne: false
      referencedRelation: "empresas"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "cuentas_padre_fk"
      columns: ["empresa_id","padre_id"]
isOneToOne: false
      referencedRelation: "cuentas"
      referencedColumns: ["empresa_id","id"]
    },{
      foreignKeyName: "cuentas_rubro_fk"
      columns: ["empresa_id","rubro_id"]
isOneToOne: false
      referencedRelation: "rubros_financieros"
      referencedColumns: ["empresa_id","id"]
    }
                  ]
                },"empresas": {
                  Row: {
                    "actualizado_en": string,"creado_en": string,"id": string,"moneda": string,"nombre": string,"origen_datos": string,"revision_catalogo": number,"revision_datos": number,"version": number,"zona_horaria": string
                  }
                  ComputedFields: never
                  Insert: {
                    "actualizado_en"?: string,"creado_en"?: string,"id"?: string,"moneda"?: string,"nombre": string,"origen_datos"?: string,"revision_catalogo"?: number,"revision_datos"?: number,"version"?: number,"zona_horaria"?: string
                  }
                  Update: {
                    "actualizado_en"?: string,"creado_en"?: string,"id"?: string,"moneda"?: string,"nombre"?: string,"origen_datos"?: string,"revision_catalogo"?: number,"revision_datos"?: number,"version"?: number,"zona_horaria"?: string
                  }
                  Relationships: [
                    
                  ]
                },"membresias_empresa": {
                  Row: {
                    "activa": boolean,"actualizado_en": string,"creado_en": string,"empresa_id": string,"id": string,"rol_id": string,"usuario_id": string,"version": number
                  }
                  ComputedFields: never
                  Insert: {
                    "activa"?: boolean,"actualizado_en"?: string,"creado_en"?: string,"empresa_id": string,"id"?: string,"rol_id": string,"usuario_id": string,"version"?: number
                  }
                  Update: {
                    "activa"?: boolean,"actualizado_en"?: string,"creado_en"?: string,"empresa_id"?: string,"id"?: string,"rol_id"?: string,"usuario_id"?: string,"version"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "membresias_empresa_empresa_id_fkey"
      columns: ["empresa_id"]
isOneToOne: false
      referencedRelation: "empresas"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "membresias_empresa_rol_id_fkey"
      columns: ["rol_id"]
isOneToOne: false
      referencedRelation: "roles"
      referencedColumns: ["id"]
    }
                  ]
                },"perfiles": {
                  Row: {
                    "activo": boolean,"actualizado_en": string,"creado_en": string,"id": string,"nombre_visible": string
                  }
                  ComputedFields: never
                  Insert: {
                    "activo"?: boolean,"actualizado_en"?: string,"creado_en"?: string,"id": string,"nombre_visible": string
                  }
                  Update: {
                    "activo"?: boolean,"actualizado_en"?: string,"creado_en"?: string,"id"?: string,"nombre_visible"?: string
                  }
                  Relationships: [
                    
                  ]
                },"periodos": {
                  Row: {
                    "actualizado_en": string,"anio": number,"creado_en": string,"empresa_id": string,"estado": string,"fin": string,"id": string,"inicio": string,"mes": number,"revision": number,"siguiente_numero_asiento": number,"version": number
                  }
                  ComputedFields: never
                  Insert: {
                    "actualizado_en"?: string,"anio": number,"creado_en"?: string,"empresa_id": string,"estado"?: string,"fin": string,"id"?: string,"inicio": string,"mes": number,"revision"?: number,"siguiente_numero_asiento"?: number,"version"?: number
                  }
                  Update: {
                    "actualizado_en"?: string,"anio"?: number,"creado_en"?: string,"empresa_id"?: string,"estado"?: string,"fin"?: string,"id"?: string,"inicio"?: string,"mes"?: number,"revision"?: number,"siguiente_numero_asiento"?: number,"version"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "periodos_empresa_id_fkey"
      columns: ["empresa_id"]
isOneToOne: false
      referencedRelation: "empresas"
      referencedColumns: ["id"]
    }
                  ]
                },"permisos": {
                  Row: {
                    "codigo": string,"creado_en": string,"descripcion": string,"id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "codigo": string,"creado_en"?: string,"descripcion": string,"id"?: string
                  }
                  Update: {
                    "codigo"?: string,"creado_en"?: string,"descripcion"?: string,"id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"politicas_calculo": {
                  Row: {
                    "codigo": string,"creada_por": string | null,"empresa_id": string,"hash": string,"id": string,"parametros": NonNullable<Json>,"publicada_en": string,"version": number
                  }
                  ComputedFields: never
                  Insert: {
                    "codigo": string,"creada_por"?: string | null,"empresa_id": string,"hash": string,"id"?: string,"parametros": NonNullable<Json>,"publicada_en"?: string,"version": number
                  }
                  Update: {
                    "codigo"?: string,"creada_por"?: string | null,"empresa_id"?: string,"hash"?: string,"id"?: string,"parametros"?: NonNullable<Json>,"publicada_en"?: string,"version"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "politicas_calculo_empresa_id_fkey"
      columns: ["empresa_id"]
isOneToOne: false
      referencedRelation: "empresas"
      referencedColumns: ["id"]
    }
                  ]
                },"rol_permisos": {
                  Row: {
                    "permiso_id": string,"rol_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "permiso_id": string,"rol_id": string
                  }
                  Update: {
                    "permiso_id"?: string,"rol_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "rol_permisos_permiso_id_fkey"
      columns: ["permiso_id"]
isOneToOne: false
      referencedRelation: "permisos"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "rol_permisos_rol_id_fkey"
      columns: ["rol_id"]
isOneToOne: false
      referencedRelation: "roles"
      referencedColumns: ["id"]
    }
                  ]
                },"roles": {
                  Row: {
                    "codigo": string,"creado_en": string,"id": string,"nombre": string
                  }
                  ComputedFields: never
                  Insert: {
                    "codigo": string,"creado_en"?: string,"id"?: string,"nombre": string
                  }
                  Update: {
                    "codigo"?: string,"creado_en"?: string,"id"?: string,"nombre"?: string
                  }
                  Relationships: [
                    
                  ]
                },"rubros_financieros": {
                  Row: {
                    "actualizado_en": string,"codigo": string,"creado_en": string,"empresa_id": string,"estado_financiero": string,"id": string,"nombre": string,"padre_id": string | null,"signo_presentacion": number,"version": number
                  }
                  ComputedFields: never
                  Insert: {
                    "actualizado_en"?: string,"codigo": string,"creado_en"?: string,"empresa_id": string,"estado_financiero": string,"id"?: string,"nombre": string,"padre_id"?: string | null,"signo_presentacion"?: number,"version"?: number
                  }
                  Update: {
                    "actualizado_en"?: string,"codigo"?: string,"creado_en"?: string,"empresa_id"?: string,"estado_financiero"?: string,"id"?: string,"nombre"?: string,"padre_id"?: string | null,"signo_presentacion"?: number,"version"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "rubros_financieros_empresa_id_fkey"
      columns: ["empresa_id"]
isOneToOne: false
      referencedRelation: "empresas"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "rubros_padre_fk"
      columns: ["empresa_id","padre_id"]
isOneToOne: false
      referencedRelation: "rubros_financieros"
      referencedColumns: ["empresa_id","id"]
    }
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "crear_periodo":
{ Args: { "p_anio": number,"p_clave_idempotencia": string,"p_empresa_id": string,"p_mes": number,"p_request_id": string }; Returns: Json
                           },
"guardar_cuenta":
{ Args: { "p_activa": boolean,"p_clase": string,"p_clave_idempotencia": string,"p_codigo": string,"p_cuenta_id": string,"p_empresa_id": string,"p_es_correctora": boolean,"p_motivo": string,"p_naturaleza": string,"p_nombre": string,"p_padre_id": string,"p_permite_movimiento": boolean,"p_request_id": string,"p_rubro_id": string,"p_version_esperada": number,"p_vigencia_desde": string,"p_vigencia_hasta": string }; Returns: Json
                           },
"mis_permisos":
{ Args: { "p_empresa_id": string }; Returns: {
              "codigo": string
            }[]
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            
          }
        }
} as const

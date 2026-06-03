export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      beta_tokens: {
        Row: {
          activo: boolean
          created_at: string
          id: string
          max_usos: number
          nota: string | null
          token: string
          updated_at: string
          usado_count: number
        }
        Insert: {
          activo?: boolean
          created_at?: string
          id?: string
          max_usos?: number
          nota?: string | null
          token: string
          updated_at?: string
          usado_count?: number
        }
        Update: {
          activo?: boolean
          created_at?: string
          id?: string
          max_usos?: number
          nota?: string | null
          token?: string
          updated_at?: string
          usado_count?: number
        }
        Relationships: []
      }
      codigos_acceso: {
        Row: {
          activo: boolean
          codigo: string
          created_at: string
          expires_at: string | null
          id: string
          tipo: string
          usos_actuales: number
          usos_maximos: number
        }
        Insert: {
          activo?: boolean
          codigo: string
          created_at?: string
          expires_at?: string | null
          id?: string
          tipo?: string
          usos_actuales?: number
          usos_maximos?: number
        }
        Update: {
          activo?: boolean
          codigo?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          tipo?: string
          usos_actuales?: number
          usos_maximos?: number
        }
        Relationships: []
      }
      diagnosticos: {
        Row: {
          ajustes_inferencia: Json | null
          alcance: string | null
          anos_experiencia_industria: string | null
          anos_experiencia_total: string | null
          anos_puesto_actual: string | null
          beneficios: string[] | null
          certificaciones: string[] | null
          codigo_acceso_usado: string | null
          created_at: string
          datos_extraidos_documento: Json | null
          email_sent: boolean
          email_sent_at: string | null
          enps_feedback: string | null
          enps_score: number | null
          equipo: string | null
          es_dato_seed: boolean
          formacion: string[] | null
          frecuencia_ia: string | null
          funciones: string[] | null
          genero: string | null
          herramientas_ia: Json | null
          id: string
          idiomas: Json | null
          industria: string | null
          inferencia_validada: boolean
          inferencia_valuacion: Json | null
          interaccion_clevel: string | null
          link_unico: string
          linkedin_url: string | null
          mail: string | null
          modo: string | null
          moneda_actual: string | null
          monto_pagado_usd: number | null
          nivel: string | null
          nivel_confianza: string | null
          pago_confirmado: boolean
          pais_rol: string | null
          pdf_enviado: boolean
          plan_elegido: string | null
          puesto_descripcion: string | null
          referido_por: string | null
          resultado_json: Json | null
          salario_actual: number | null
          salario_tipo: string | null
          situacion_laboral: string | null
          stripe_payment_id: string | null
          stripe_session_id: string | null
          tipo_cambio_utilizado: Json | null
          tipo_empresa: string | null
          tipo_usuario: string
          updated_at: string
          uso_ia: string[] | null
          whatsapp: string | null
        }
        Insert: {
          ajustes_inferencia?: Json | null
          alcance?: string | null
          anos_experiencia_industria?: string | null
          anos_experiencia_total?: string | null
          anos_puesto_actual?: string | null
          beneficios?: string[] | null
          certificaciones?: string[] | null
          codigo_acceso_usado?: string | null
          created_at?: string
          datos_extraidos_documento?: Json | null
          email_sent?: boolean
          email_sent_at?: string | null
          enps_feedback?: string | null
          enps_score?: number | null
          equipo?: string | null
          es_dato_seed?: boolean
          formacion?: string[] | null
          frecuencia_ia?: string | null
          funciones?: string[] | null
          genero?: string | null
          herramientas_ia?: Json | null
          id?: string
          idiomas?: Json | null
          industria?: string | null
          inferencia_validada?: boolean
          inferencia_valuacion?: Json | null
          interaccion_clevel?: string | null
          link_unico?: string
          linkedin_url?: string | null
          mail?: string | null
          modo?: string | null
          moneda_actual?: string | null
          monto_pagado_usd?: number | null
          nivel?: string | null
          nivel_confianza?: string | null
          pago_confirmado?: boolean
          pais_rol?: string | null
          pdf_enviado?: boolean
          plan_elegido?: string | null
          puesto_descripcion?: string | null
          referido_por?: string | null
          resultado_json?: Json | null
          salario_actual?: number | null
          salario_tipo?: string | null
          situacion_laboral?: string | null
          stripe_payment_id?: string | null
          stripe_session_id?: string | null
          tipo_cambio_utilizado?: Json | null
          tipo_empresa?: string | null
          tipo_usuario?: string
          updated_at?: string
          uso_ia?: string[] | null
          whatsapp?: string | null
        }
        Update: {
          ajustes_inferencia?: Json | null
          alcance?: string | null
          anos_experiencia_industria?: string | null
          anos_experiencia_total?: string | null
          anos_puesto_actual?: string | null
          beneficios?: string[] | null
          certificaciones?: string[] | null
          codigo_acceso_usado?: string | null
          created_at?: string
          datos_extraidos_documento?: Json | null
          email_sent?: boolean
          email_sent_at?: string | null
          enps_feedback?: string | null
          enps_score?: number | null
          equipo?: string | null
          es_dato_seed?: boolean
          formacion?: string[] | null
          frecuencia_ia?: string | null
          funciones?: string[] | null
          genero?: string | null
          herramientas_ia?: Json | null
          id?: string
          idiomas?: Json | null
          industria?: string | null
          inferencia_validada?: boolean
          inferencia_valuacion?: Json | null
          interaccion_clevel?: string | null
          link_unico?: string
          linkedin_url?: string | null
          mail?: string | null
          modo?: string | null
          moneda_actual?: string | null
          monto_pagado_usd?: number | null
          nivel?: string | null
          nivel_confianza?: string | null
          pago_confirmado?: boolean
          pais_rol?: string | null
          pdf_enviado?: boolean
          plan_elegido?: string | null
          puesto_descripcion?: string | null
          referido_por?: string | null
          resultado_json?: Json | null
          salario_actual?: number | null
          salario_tipo?: string | null
          situacion_laboral?: string | null
          stripe_payment_id?: string | null
          stripe_session_id?: string | null
          tipo_cambio_utilizado?: Json | null
          tipo_empresa?: string | null
          tipo_usuario?: string
          updated_at?: string
          uso_ia?: string[] | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      followup_responses: {
        Row: {
          created_at: string
          dia: number
          diagnostico_id: string | null
          id: string
          resultado: string | null
          tuvo_conversacion: boolean | null
          utilidad_score: number | null
        }
        Insert: {
          created_at?: string
          dia: number
          diagnostico_id?: string | null
          id?: string
          resultado?: string | null
          tuvo_conversacion?: boolean | null
          utilidad_score?: number | null
        }
        Update: {
          created_at?: string
          dia?: number
          diagnostico_id?: string | null
          id?: string
          resultado?: string | null
          tuvo_conversacion?: boolean | null
          utilidad_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "followup_responses_diagnostico_id_fkey"
            columns: ["diagnostico_id"]
            isOneToOne: false
            referencedRelation: "diagnosticos"
            referencedColumns: ["id"]
          },
        ]
      }
      nps_responses: {
        Row: {
          comentario: string | null
          created_at: string
          diagnostico_id: string | null
          id: string
          score: number
        }
        Insert: {
          comentario?: string | null
          created_at?: string
          diagnostico_id?: string | null
          id?: string
          score: number
        }
        Update: {
          comentario?: string | null
          created_at?: string
          diagnostico_id?: string | null
          id?: string
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "nps_responses_diagnostico_id_fkey"
            columns: ["diagnostico_id"]
            isOneToOne: false
            referencedRelation: "diagnosticos"
            referencedColumns: ["id"]
          },
        ]
      }
      pagos: {
        Row: {
          amount: number | null
          created_at: string
          currency: string | null
          diagnostico_id: string | null
          email: string
          id: string
          plan_name: string | null
          price_id: string | null
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          diagnostico_id?: string | null
          email: string
          id?: string
          plan_name?: string | null
          price_id?: string | null
          status: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          diagnostico_id?: string | null
          email?: string
          id?: string
          plan_name?: string | null
          price_id?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pagos_diagnostico_id_fkey"
            columns: ["diagnostico_id"]
            isOneToOne: false
            referencedRelation: "diagnosticos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

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
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
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
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
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
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
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
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

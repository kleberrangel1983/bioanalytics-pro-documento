export type UserRole = "admin" | "medico" | "secretaria" | "paciente" | "suporte"

export type Database = {
  public: {
    Tables: {
      patients: {
        Row: {
          id: string
          name: string
          birth_date: string
          cpf: string
          phone: string | null
          email: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["patients"]["Row"], "id" | "created_at" | "updated_at">
        Update: Partial<Database["public"]["Tables"]["patients"]["Insert"]>
      }
      appointments: {
        Row: {
          id: string
          patient_id: string
          doctor_id: string
          type: string
          scheduled_at: string
          status: "pending" | "confirmed" | "cancelled" | "completed"
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["appointments"]["Row"], "id" | "created_at" | "updated_at">
        Update: Partial<Database["public"]["Tables"]["appointments"]["Insert"]>
      }
      triage_records: {
        Row: {
          id: string
          patient_id: string
          appointment_id: string | null
          risk_score: number       // 0–100
          symptoms: string[]
          notes: string | null
          triaged_by: string
          created_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["triage_records"]["Row"], "id" | "created_at">
        Update: Partial<Database["public"]["Tables"]["triage_records"]["Insert"]>
      }
      audit_logs: {
        Row: {
          id: string
          actor_id: string
          actor_role: UserRole
          action: string
          resource_type: string
          resource_id: string | null
          metadata: Record<string, unknown> | null
          ip_address: string | null
          created_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["audit_logs"]["Row"], "id" | "created_at">
        Update: never
      }
      feature_flags_state: {
        Row: {
          flag_id: string
          environment: "staging" | "production"
          enabled: boolean
          rollout_pct: number
          role_overrides: Record<string, boolean>
          updated_by: string
          updated_at: string
        }
        Insert: Database["public"]["Tables"]["feature_flags_state"]["Row"]
        Update: Partial<Omit<Database["public"]["Tables"]["feature_flags_state"]["Row"], "flag_id" | "environment">>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      user_role: UserRole
    }
  }
}

// Convenience row types
export type Patient    = Database["public"]["Tables"]["patients"]["Row"]
export type Appointment = Database["public"]["Tables"]["appointments"]["Row"]
export type TriageRecord = Database["public"]["Tables"]["triage_records"]["Row"]
export type AuditLog  = Database["public"]["Tables"]["audit_logs"]["Row"]
export type FlagState = Database["public"]["Tables"]["feature_flags_state"]["Row"]

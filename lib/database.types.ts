export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type AppointmentStatus = "aguardando" | "confirmado" | "atendido" | "cancelado"
export type UserRole = "admin" | "medico" | "secretaria" | "convidado"
export type AuditSeverity = "info" | "warning" | "critical"

export interface Database {
  public: {
    Tables: {
      patients: {
        Row: {
          id: string
          name: string
          phone: string
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
          type: string
          scheduled_at: string
          status: AppointmentStatus
          notes: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["appointments"]["Row"], "id" | "created_at" | "updated_at">
        Update: Partial<Database["public"]["Tables"]["appointments"]["Insert"]>
      }
      audit_logs: {
        Row: {
          id: string
          user_email: string
          user_role: UserRole
          action: string
          resource: string
          ip: string
          severity: AuditSeverity
          details: string | null
          success: boolean
          created_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["audit_logs"]["Row"], "id" | "created_at">
        Update: never
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}

// Convenience row types
export type Patient = Database["public"]["Tables"]["patients"]["Row"]
export type Appointment = Database["public"]["Tables"]["appointments"]["Row"]
export type AuditLogRow = Database["public"]["Tables"]["audit_logs"]["Row"]

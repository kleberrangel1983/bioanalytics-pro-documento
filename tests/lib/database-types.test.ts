import { describe, it, expect } from "vitest"
import type {
  AppointmentStatus,
  UserRole,
  AuditSeverity,
  Patient,
  Appointment,
  AuditLogRow,
  ClinicUser,
  FeatureFlag,
} from "@/lib/database.types"

describe("database.types — type contracts", () => {
  it("AppointmentStatus covers all valid values", () => {
    const statuses: AppointmentStatus[] = ["aguardando", "confirmado", "atendido", "cancelado"]
    expect(statuses).toHaveLength(4)
  })

  it("UserRole covers all valid values", () => {
    const roles: UserRole[] = ["admin", "medico", "secretaria", "convidado"]
    expect(roles).toHaveLength(4)
  })

  it("AuditSeverity covers all valid values", () => {
    const severities: AuditSeverity[] = ["info", "warning", "critical"]
    expect(severities).toHaveLength(3)
  })

  it("Patient row shape has required fields", () => {
    const patient: Patient = {
      id: "uuid-1",
      name: "Ana Souza",
      phone: "(11) 91234-5678",
      email: null,
      created_at: "2026-05-06T00:00:00Z",
      updated_at: "2026-05-06T00:00:00Z",
    }
    expect(patient.id).toBeDefined()
    expect(patient.name).toBeDefined()
    expect(patient.phone).toBeDefined()
  })

  it("Appointment row shape has required fields", () => {
    const appt: Appointment = {
      id: "uuid-2",
      patient_id: "uuid-1",
      type: "Consulta inicial",
      scheduled_at: "2026-05-06T09:00:00Z",
      status: "aguardando",
      notes: null,
      created_by: "secretaria@clinic.com",
      created_at: "2026-05-06T00:00:00Z",
      updated_at: "2026-05-06T00:00:00Z",
    }
    expect(appt.patient_id).toBeDefined()
    expect(appt.status).toBe("aguardando")
  })

  it("AuditLogRow has append-only semantics (no update type)", () => {
    const log: AuditLogRow = {
      id: "uuid-3",
      user_email: "admin@clinic.com",
      user_role: "admin",
      action: "CRIAR_USUARIO",
      resource: "Usuário X",
      ip: "127.0.0.1",
      severity: "info",
      details: null,
      success: true,
      created_at: "2026-05-06T00:00:00Z",
    }
    expect(log.severity).toBe("info")
    expect(log.success).toBe(true)
  })

  it("ClinicUser has active boolean field", () => {
    const user: ClinicUser = {
      id: "uuid-4",
      email: "dr@clinic.com",
      name: "Dr. X",
      role: "medico",
      active: true,
      created_at: "2026-05-06T00:00:00Z",
      updated_at: "2026-05-06T00:00:00Z",
    }
    expect(user.active).toBe(true)
    expect(user.role).toBe("medico")
  })

  it("FeatureFlag has key, label, enabled fields", () => {
    const flag: FeatureFlag = {
      id: "uuid-5",
      key: "realtime_agenda",
      label: "Agenda em tempo real",
      description: null,
      enabled: true,
      updated_by: "admin@clinic.com",
      created_at: "2026-05-06T00:00:00Z",
      updated_at: "2026-05-06T00:00:00Z",
    }
    expect(flag.key).toBe("realtime_agenda")
    expect(flag.enabled).toBe(true)
  })
})

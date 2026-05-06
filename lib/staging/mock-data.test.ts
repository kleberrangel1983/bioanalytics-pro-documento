import { describe, it, expect, vi } from "vitest"
import {
  ROLE_PERMISSIONS,
  FLOW_STEP_DEFINITIONS,
  createInitialReport,
} from "./mock-data"
import type { Permission, UserRole } from "./types"

const ALL_PERMISSIONS: Permission[] = [
  "view_patients",
  "edit_patients",
  "create_appointment",
  "cancel_appointment",
  "view_logs",
  "export_data",
  "manage_users",
  "view_reports",
  "triage_patient",
  "confirm_appointment",
  "view_own_appointments",
]

// ─── ROLE_PERMISSIONS ─────────────────────────────────────────────────────────

describe("ROLE_PERMISSIONS", () => {
  it("cobre todas as permissões definidas para todos os perfis", () => {
    const roles: UserRole[] = ["admin", "medico", "secretaria", "paciente", "suporte"]
    for (const role of roles) {
      for (const perm of ALL_PERMISSIONS) {
        expect(
          typeof ROLE_PERMISSIONS[role][perm],
          `${role}.${perm} deve ser boolean`
        ).toBe("boolean")
      }
    }
  })

  describe("admin", () => {
    it("possui todas as permissões", () => {
      for (const perm of ALL_PERMISSIONS) {
        expect(ROLE_PERMISSIONS.admin[perm]).toBe(true)
      }
    })
  })

  describe("paciente", () => {
    it("só pode view_own_appointments", () => {
      const allowed: Permission[] = ["view_own_appointments"]
      const denied = ALL_PERMISSIONS.filter((p) => !allowed.includes(p))
      for (const perm of allowed) {
        expect(ROLE_PERMISSIONS.paciente[perm]).toBe(true)
      }
      for (const perm of denied) {
        expect(ROLE_PERMISSIONS.paciente[perm]).toBe(false)
      }
    })
  })

  describe("suporte", () => {
    it("só pode view_logs e view_reports", () => {
      const allowed: Permission[] = ["view_logs", "view_reports"]
      const denied = ALL_PERMISSIONS.filter((p) => !allowed.includes(p))
      for (const perm of allowed) {
        expect(ROLE_PERMISSIONS.suporte[perm]).toBe(true)
      }
      for (const perm of denied) {
        expect(ROLE_PERMISSIONS.suporte[perm]).toBe(false)
      }
    })
  })

  describe("secretaria", () => {
    it("não pode manage_users nem triage_patient", () => {
      expect(ROLE_PERMISSIONS.secretaria.manage_users).toBe(false)
      expect(ROLE_PERMISSIONS.secretaria.triage_patient).toBe(false)
    })

    it("pode create_appointment e confirm_appointment", () => {
      expect(ROLE_PERMISSIONS.secretaria.create_appointment).toBe(true)
      expect(ROLE_PERMISSIONS.secretaria.confirm_appointment).toBe(true)
    })
  })

  describe("medico", () => {
    it("não pode create_appointment nem export_data", () => {
      expect(ROLE_PERMISSIONS.medico.create_appointment).toBe(false)
      expect(ROLE_PERMISSIONS.medico.export_data).toBe(false)
    })

    it("pode view_patients, triage_patient e cancel_appointment", () => {
      expect(ROLE_PERMISSIONS.medico.view_patients).toBe(true)
      expect(ROLE_PERMISSIONS.medico.triage_patient).toBe(true)
      expect(ROLE_PERMISSIONS.medico.cancel_appointment).toBe(true)
    })
  })
})

// ─── FLOW_STEP_DEFINITIONS ───────────────────────────────────────────────────

describe("FLOW_STEP_DEFINITIONS", () => {
  const EXPECTED_STEPS = ["captacao", "triagem", "agendamento", "confirmacao", "log"] as const

  it("contém as 5 etapas esperadas", () => {
    for (const step of EXPECTED_STEPS) {
      expect(FLOW_STEP_DEFINITIONS[step]).toBeDefined()
    }
  })

  it("cada etapa tem label, description e 4 assertions", () => {
    for (const step of EXPECTED_STEPS) {
      const def = FLOW_STEP_DEFINITIONS[step]
      expect(typeof def.label).toBe("string")
      expect(def.label.length).toBeGreaterThan(0)
      expect(typeof def.description).toBe("string")
      expect(def.assertions).toHaveLength(4)
    }
  })
})

// ─── createInitialReport ──────────────────────────────────────────────────────

describe("createInitialReport()", () => {
  it("retorna overallStatus=pending", () => {
    const report = createInitialReport()
    expect(report.overallStatus).toBe("pending")
  })

  it("retorna environment=staging", () => {
    const report = createInitialReport()
    expect(report.environment).toBe("staging")
  })

  it("runId segue o formato RUN-<número>", () => {
    const report = createInitialReport()
    expect(report.runId).toMatch(/^RUN-\d+$/)
  })

  it("startedAt é uma string ISO 8601 válida", () => {
    const report = createInitialReport()
    expect(new Date(report.startedAt).toISOString()).toBe(report.startedAt)
  })

  it("flowResults contém exatamente 5 etapas na ordem correta", () => {
    const report = createInitialReport()
    expect(report.flowResults).toHaveLength(5)
    const steps = report.flowResults.map((r) => r.step)
    expect(steps).toEqual(["captacao", "triagem", "agendamento", "confirmacao", "log"])
  })

  it("todas as etapas de fluxo iniciam como pending", () => {
    const report = createInitialReport()
    for (const result of report.flowResults) {
      expect(result.status).toBe("pending")
    }
  })

  it("todas as assertions de fluxo iniciam com passed=false", () => {
    const report = createInitialReport()
    for (const result of report.flowResults) {
      for (const assertion of result.assertions) {
        expect(assertion.passed).toBe(false)
      }
    }
  })

  it("profileResults contém os 5 perfis esperados", () => {
    const report = createInitialReport()
    expect(report.profileResults).toHaveLength(5)
    const roles = report.profileResults.map((r) => r.role)
    expect(roles).toEqual(["admin", "medico", "secretaria", "paciente", "suporte"])
  })

  it("todas as permissões de perfil iniciam com passed=true", () => {
    const report = createInitialReport()
    for (const profile of report.profileResults) {
      for (const perm of Object.values(profile.permissions)) {
        expect(perm.passed).toBe(true)
        expect(perm.expected).toBe(perm.actual)
      }
    }
  })

  it("cada chamada gera um runId único", () => {
    vi.useFakeTimers()
    vi.setSystemTime(1000)
    const a = createInitialReport()
    vi.setSystemTime(2000)
    const b = createInitialReport()
    vi.useRealTimers()
    expect(a.runId).not.toBe(b.runId)
  })
})

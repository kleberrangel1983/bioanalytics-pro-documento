import { describe, it, expect, beforeEach } from "vitest"
import {
  createInitialReport,
  ROLE_PERMISSIONS,
} from "@/lib/staging/mock-data"
import type { Permission, UserRole } from "@/lib/staging/types"

const ALL_ROLES: UserRole[] = ["admin", "medico", "secretaria", "paciente", "suporte"]
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
const ALL_STEPS = ["captacao", "triagem", "agendamento", "confirmacao", "log"] as const

describe("createInitialReport", () => {
  let report: ReturnType<typeof createInitialReport>

  beforeEach(() => {
    report = createInitialReport()
  })

  describe("runId", () => {
    it("starts with 'RUN-'", () => {
      expect(report.runId).toMatch(/^RUN-/)
    })

    it("contains a numeric timestamp after the prefix", () => {
      const timestamp = report.runId.slice("RUN-".length)
      expect(Number(timestamp)).toBeGreaterThan(0)
      expect(String(Number(timestamp))).toBe(timestamp)
    })

    it("embeds a timestamp close to now", () => {
      const ts = Number(report.runId.slice("RUN-".length))
      expect(ts).toBeGreaterThan(Date.now() - 5_000)
      expect(ts).toBeLessThanOrEqual(Date.now())
    })
  })

  describe("top-level fields", () => {
    it("environment is 'staging'", () => {
      expect(report.environment).toBe("staging")
    })

    it("overallStatus is 'pending'", () => {
      expect(report.overallStatus).toBe("pending")
    })

    it("startedAt is a valid ISO string close to now", () => {
      const diff = Date.now() - new Date(report.startedAt).getTime()
      expect(diff).toBeGreaterThanOrEqual(0)
      expect(diff).toBeLessThan(5_000)
    })
  })

  describe("flowResults", () => {
    it("contains exactly 5 steps", () => {
      expect(report.flowResults).toHaveLength(5)
    })

    it("contains all expected step names in order", () => {
      const names = report.flowResults.map((r) => r.step)
      expect(names).toEqual([...ALL_STEPS])
    })

    it("every step starts with status 'pending'", () => {
      for (const step of report.flowResults) {
        expect(step.status).toBe("pending")
      }
    })

    it("every step has at least one assertion", () => {
      for (const step of report.flowResults) {
        expect(step.assertions.length).toBeGreaterThan(0)
      }
    })

    it("all assertions start as not passed", () => {
      for (const step of report.flowResults) {
        for (const assertion of step.assertions) {
          expect(assertion.passed).toBe(false)
        }
      }
    })
  })

  describe("profileResults", () => {
    it("contains exactly 5 roles", () => {
      expect(report.profileResults).toHaveLength(5)
    })

    it("contains all expected roles", () => {
      const roles = report.profileResults.map((r) => r.role).sort()
      expect(roles).toEqual([...ALL_ROLES].sort())
    })

    it("every role starts with status 'pending'", () => {
      for (const profile of report.profileResults) {
        expect(profile.status).toBe("pending")
      }
    })

    it("every role has all 11 permissions", () => {
      for (const profile of report.profileResults) {
        const keys = Object.keys(profile.permissions).sort()
        expect(keys).toEqual([...ALL_PERMISSIONS].sort())
      }
    })

    it("every permission entry initializes with passed: true", () => {
      for (const profile of report.profileResults) {
        for (const perm of ALL_PERMISSIONS) {
          expect(profile.permissions[perm].passed).toBe(true)
        }
      }
    })

    it("every permission entry has actual === expected", () => {
      for (const profile of report.profileResults) {
        for (const perm of ALL_PERMISSIONS) {
          const entry = profile.permissions[perm]
          expect(entry.actual).toBe(entry.expected)
        }
      }
    })

    it("permission values match ROLE_PERMISSIONS matrix", () => {
      for (const profile of report.profileResults) {
        for (const perm of ALL_PERMISSIONS) {
          expect(profile.permissions[perm].expected).toBe(
            ROLE_PERMISSIONS[profile.role][perm]
          )
        }
      }
    })
  })
})

describe("ROLE_PERMISSIONS", () => {
  it("defines all 5 roles", () => {
    expect(Object.keys(ROLE_PERMISSIONS).sort()).toEqual([...ALL_ROLES].sort())
  })

  it("every role has all 11 permissions", () => {
    for (const role of ALL_ROLES) {
      expect(Object.keys(ROLE_PERMISSIONS[role]).sort()).toEqual(
        [...ALL_PERMISSIONS].sort()
      )
    }
  })

  describe("paciente — restricted role", () => {
    it("cannot create_appointment", () => {
      expect(ROLE_PERMISSIONS.paciente.create_appointment).toBe(false)
    })

    it("cannot cancel_appointment", () => {
      expect(ROLE_PERMISSIONS.paciente.cancel_appointment).toBe(false)
    })

    it("cannot view_patients", () => {
      expect(ROLE_PERMISSIONS.paciente.view_patients).toBe(false)
    })

    it("cannot manage_users", () => {
      expect(ROLE_PERMISSIONS.paciente.manage_users).toBe(false)
    })

    it("can only view_own_appointments", () => {
      expect(ROLE_PERMISSIONS.paciente.view_own_appointments).toBe(true)
    })
  })

  describe("suporte — audit-only role", () => {
    it("can view_logs", () => {
      expect(ROLE_PERMISSIONS.suporte.view_logs).toBe(true)
    })

    it("cannot manage_users", () => {
      expect(ROLE_PERMISSIONS.suporte.manage_users).toBe(false)
    })

    it("cannot create_appointment", () => {
      expect(ROLE_PERMISSIONS.suporte.create_appointment).toBe(false)
    })

    it("cannot edit_patients", () => {
      expect(ROLE_PERMISSIONS.suporte.edit_patients).toBe(false)
    })

    it("cannot view_patients", () => {
      expect(ROLE_PERMISSIONS.suporte.view_patients).toBe(false)
    })
  })

  describe("admin — full access", () => {
    it("has all permissions enabled", () => {
      for (const perm of ALL_PERMISSIONS) {
        expect(ROLE_PERMISSIONS.admin[perm]).toBe(true)
      }
    })
  })

  describe("medico — clinical role", () => {
    it("can view and edit patients", () => {
      expect(ROLE_PERMISSIONS.medico.view_patients).toBe(true)
      expect(ROLE_PERMISSIONS.medico.edit_patients).toBe(true)
    })

    it("cannot create_appointment (scheduling is secretaria's role)", () => {
      expect(ROLE_PERMISSIONS.medico.create_appointment).toBe(false)
    })

    it("cannot manage_users", () => {
      expect(ROLE_PERMISSIONS.medico.manage_users).toBe(false)
    })
  })

  describe("secretaria — scheduling role", () => {
    it("can create and cancel appointments", () => {
      expect(ROLE_PERMISSIONS.secretaria.create_appointment).toBe(true)
      expect(ROLE_PERMISSIONS.secretaria.cancel_appointment).toBe(true)
    })

    it("cannot edit_patients", () => {
      expect(ROLE_PERMISSIONS.secretaria.edit_patients).toBe(false)
    })

    it("cannot manage_users", () => {
      expect(ROLE_PERMISSIONS.secretaria.manage_users).toBe(false)
    })
  })
})

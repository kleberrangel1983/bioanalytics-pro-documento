import { describe, it, expect } from "vitest"
import {
  MOCK_PATIENT,
  MOCK_DOCTOR,
  MOCK_APPOINTMENT,
  ROLE_PERMISSIONS,
  FLOW_STEP_DEFINITIONS,
  ROLLBACK_RUNBOOK,
  createInitialReport,
} from "@/lib/staging/mock-data"
import type { UserRole, Permission } from "@/lib/staging/types"

const ALL_ROLES: UserRole[] = ["admin", "medico", "secretaria", "paciente", "suporte"]
const ALL_PERMISSIONS = Object.keys(ROLE_PERMISSIONS.admin) as Permission[]

// ─── Mock entities ────────────────────────────────────────────────────────────

describe("MOCK_PATIENT", () => {
  it("has the expected staging id prefix", () => {
    expect(MOCK_PATIENT.id).toMatch(/^PAT-STAGING-/)
  })

  it("contains no real PII — CPF is all zeros", () => {
    expect(MOCK_PATIENT.cpf).toBe("000.000.000-00")
  })

  it("email is scoped to homologacao.local domain", () => {
    expect(MOCK_PATIENT.email).toMatch(/@homologacao\.local$/)
  })

  it("has all required fields", () => {
    expect(MOCK_PATIENT).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
      cpf: expect.any(String),
      birthDate: expect.any(String),
      phone: expect.any(String),
      email: expect.any(String),
      healthInsurance: expect.any(String),
    })
  })
})

describe("MOCK_DOCTOR", () => {
  it("has the expected staging id prefix", () => {
    expect(MOCK_DOCTOR.id).toMatch(/^MED-STAGING-/)
  })

  it("has all required fields", () => {
    expect(MOCK_DOCTOR).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
      crm: expect.any(String),
      specialty: expect.any(String),
    })
  })
})

describe("MOCK_APPOINTMENT", () => {
  it("has the expected staging id prefix", () => {
    expect(MOCK_APPOINTMENT.id).toMatch(/^AGD-STAGING-/)
  })

  it("references MOCK_PATIENT and MOCK_DOCTOR", () => {
    expect(MOCK_APPOINTMENT.patientId).toBe(MOCK_PATIENT.id)
    expect(MOCK_APPOINTMENT.doctorId).toBe(MOCK_DOCTOR.id)
  })

  it("scheduledAt is a valid ISO 8601 date string", () => {
    expect(new Date(MOCK_APPOINTMENT.scheduledAt).toISOString()).toBeTruthy()
  })
})

// ─── ROLE_PERMISSIONS ─────────────────────────────────────────────────────────

describe("ROLE_PERMISSIONS — structure", () => {
  it("covers all 5 roles", () => {
    expect(Object.keys(ROLE_PERMISSIONS).sort()).toEqual(ALL_ROLES.slice().sort())
  })

  it("every role has exactly the same set of permission keys", () => {
    const adminKeys = ALL_PERMISSIONS.slice().sort()
    for (const role of ALL_ROLES) {
      expect(Object.keys(ROLE_PERMISSIONS[role]).sort()).toEqual(adminKeys)
    }
  })

  it("all values are booleans", () => {
    for (const role of ALL_ROLES) {
      for (const perm of ALL_PERMISSIONS) {
        expect(typeof ROLE_PERMISSIONS[role][perm]).toBe("boolean")
      }
    }
  })
})

describe("ROLE_PERMISSIONS — admin (superuser)", () => {
  it("has every permission set to true", () => {
    for (const perm of ALL_PERMISSIONS) {
      expect(ROLE_PERMISSIONS.admin[perm]).toBe(true)
    }
  })
})

describe("ROLE_PERMISSIONS — paciente (most restricted)", () => {
  it("can only view own appointments", () => {
    const granted = ALL_PERMISSIONS.filter((p) => ROLE_PERMISSIONS.paciente[p])
    expect(granted).toEqual(["view_own_appointments"])
  })

  it("cannot access patient data, logs or reports", () => {
    expect(ROLE_PERMISSIONS.paciente.view_patients).toBe(false)
    expect(ROLE_PERMISSIONS.paciente.view_logs).toBe(false)
    expect(ROLE_PERMISSIONS.paciente.view_reports).toBe(false)
  })
})

describe("ROLE_PERMISSIONS — medico", () => {
  it("can triage patients", () => {
    expect(ROLE_PERMISSIONS.medico.triage_patient).toBe(true)
  })

  it("cannot create appointments (done by secretaria)", () => {
    expect(ROLE_PERMISSIONS.medico.create_appointment).toBe(false)
  })

  it("cannot manage users or export data", () => {
    expect(ROLE_PERMISSIONS.medico.manage_users).toBe(false)
    expect(ROLE_PERMISSIONS.medico.export_data).toBe(false)
  })
})

describe("ROLE_PERMISSIONS — secretaria", () => {
  it("can create and cancel appointments", () => {
    expect(ROLE_PERMISSIONS.secretaria.create_appointment).toBe(true)
    expect(ROLE_PERMISSIONS.secretaria.cancel_appointment).toBe(true)
    expect(ROLE_PERMISSIONS.secretaria.confirm_appointment).toBe(true)
  })

  it("cannot edit patient records or perform triage", () => {
    expect(ROLE_PERMISSIONS.secretaria.edit_patients).toBe(false)
    expect(ROLE_PERMISSIONS.secretaria.triage_patient).toBe(false)
  })

  it("cannot access audit logs or reports", () => {
    expect(ROLE_PERMISSIONS.secretaria.view_logs).toBe(false)
    expect(ROLE_PERMISSIONS.secretaria.view_reports).toBe(false)
  })
})

describe("ROLE_PERMISSIONS — suporte", () => {
  it("can view logs and reports (for debugging)", () => {
    expect(ROLE_PERMISSIONS.suporte.view_logs).toBe(true)
    expect(ROLE_PERMISSIONS.suporte.view_reports).toBe(true)
  })

  it("has no access to patient data or appointments", () => {
    expect(ROLE_PERMISSIONS.suporte.view_patients).toBe(false)
    expect(ROLE_PERMISSIONS.suporte.create_appointment).toBe(false)
    expect(ROLE_PERMISSIONS.suporte.triage_patient).toBe(false)
    expect(ROLE_PERMISSIONS.suporte.view_own_appointments).toBe(false)
  })

  it("cannot manage users or export data", () => {
    expect(ROLE_PERMISSIONS.suporte.manage_users).toBe(false)
    expect(ROLE_PERMISSIONS.suporte.export_data).toBe(false)
  })
})

describe("ROLE_PERMISSIONS — privilege ordering", () => {
  it("no role has more permissions than admin", () => {
    for (const role of ALL_ROLES) {
      for (const perm of ALL_PERMISSIONS) {
        if (ROLE_PERMISSIONS[role][perm]) {
          expect(ROLE_PERMISSIONS.admin[perm]).toBe(true)
        }
      }
    }
  })
})

// ─── FLOW_STEP_DEFINITIONS ────────────────────────────────────────────────────

describe("FLOW_STEP_DEFINITIONS", () => {
  const EXPECTED_STEPS = ["captacao", "triagem", "agendamento", "confirmacao", "log"] as const

  it("covers all 5 flow steps", () => {
    expect(Object.keys(FLOW_STEP_DEFINITIONS).sort()).toEqual(EXPECTED_STEPS.slice().sort())
  })

  it("each step has a non-empty label and description", () => {
    for (const step of EXPECTED_STEPS) {
      expect(FLOW_STEP_DEFINITIONS[step].label.length).toBeGreaterThan(0)
      expect(FLOW_STEP_DEFINITIONS[step].description.length).toBeGreaterThan(0)
    }
  })

  it("each step has at least one assertion", () => {
    for (const step of EXPECTED_STEPS) {
      expect(FLOW_STEP_DEFINITIONS[step].assertions.length).toBeGreaterThan(0)
    }
  })

  it("no assertion label is duplicated within a step", () => {
    for (const step of EXPECTED_STEPS) {
      const labels = FLOW_STEP_DEFINITIONS[step].assertions
      expect(new Set(labels).size).toBe(labels.length)
    }
  })

  it("no assertion label is empty", () => {
    for (const step of EXPECTED_STEPS) {
      for (const label of FLOW_STEP_DEFINITIONS[step].assertions) {
        expect(label.trim().length).toBeGreaterThan(0)
      }
    }
  })
})

// ─── ROLLBACK_RUNBOOK ─────────────────────────────────────────────────────────

describe("ROLLBACK_RUNBOOK", () => {
  it("has a valid incident id", () => {
    expect(ROLLBACK_RUNBOOK.id).toMatch(/^INC-/)
  })

  it("type is service_down", () => {
    expect(ROLLBACK_RUNBOOK.type).toBe("service_down")
  })

  it("has exactly 8 rollback steps", () => {
    expect(ROLLBACK_RUNBOOK.rollbackSteps).toHaveLength(8)
  })

  it("steps are ordered sequentially from 1 to 8", () => {
    const orders = ROLLBACK_RUNBOOK.rollbackSteps.map((s) => s.order)
    expect(orders).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })

  it("all steps start as pending", () => {
    for (const step of ROLLBACK_RUNBOOK.rollbackSteps) {
      expect(step.status).toBe("pending")
    }
  })

  it("each step has a non-empty action", () => {
    for (const step of ROLLBACK_RUNBOOK.rollbackSteps) {
      expect(step.action.trim().length).toBeGreaterThan(0)
    }
  })

  it("triggeredAt is a valid ISO date string", () => {
    expect(new Date(ROLLBACK_RUNBOOK.triggeredAt).toISOString()).toBeTruthy()
  })
})

// ─── createInitialReport ──────────────────────────────────────────────────────

describe("createInitialReport", () => {
  it("returns runId with RUN- prefix and random suffix", () => {
    const report = createInitialReport()
    expect(report.runId).toMatch(/^RUN-\d+-[a-z0-9]+$/)
  })

  it("startedAt is a recent valid ISO string", () => {
    const before = Date.now()
    const report = createInitialReport()
    const after = Date.now()
    const ts = new Date(report.startedAt).getTime()
    expect(ts).toBeGreaterThanOrEqual(before)
    expect(ts).toBeLessThanOrEqual(after)
  })

  it("environment is staging", () => {
    expect(createInitialReport().environment).toBe("staging")
  })

  it("overallStatus starts as pending", () => {
    expect(createInitialReport().overallStatus).toBe("pending")
  })

  it("flowResults has one entry per flow step (5 total)", () => {
    const { flowResults } = createInitialReport()
    expect(flowResults).toHaveLength(5)
  })

  it("flowResults steps appear in the correct order", () => {
    const { flowResults } = createInitialReport()
    const steps = flowResults.map((r) => r.step)
    expect(steps).toEqual(["captacao", "triagem", "agendamento", "confirmacao", "log"])
  })

  it("every flowResult starts as pending with all assertions not passed", () => {
    const { flowResults } = createInitialReport()
    for (const result of flowResults) {
      expect(result.status).toBe("pending")
      for (const assertion of result.assertions) {
        expect(assertion.passed).toBe(false)
      }
    }
  })

  it("each flowResult's assertions match FLOW_STEP_DEFINITIONS labels", () => {
    const { flowResults } = createInitialReport()
    for (const result of flowResults) {
      const expectedLabels = FLOW_STEP_DEFINITIONS[result.step].assertions
      const actualLabels = result.assertions.map((a) => a.label)
      expect(actualLabels).toEqual(expectedLabels)
    }
  })

  it("profileResults has one entry per role (5 total)", () => {
    const { profileResults } = createInitialReport()
    expect(profileResults).toHaveLength(5)
  })

  it("profileResults covers all roles", () => {
    const { profileResults } = createInitialReport()
    const roles = profileResults.map((r) => r.role).sort()
    expect(roles).toEqual(ALL_ROLES.slice().sort())
  })

  it("every profileResult starts as pending", () => {
    const { profileResults } = createInitialReport()
    for (const result of profileResults) {
      expect(result.status).toBe("pending")
    }
  })

  it("each permission in profileResults matches ROLE_PERMISSIONS (expected === actual, passed = true)", () => {
    const { profileResults } = createInitialReport()
    for (const result of profileResults) {
      for (const perm of ALL_PERMISSIONS) {
        const cell = result.permissions[perm]
        const canonical = ROLE_PERMISSIONS[result.role][perm]
        expect(cell.expected).toBe(canonical)
        expect(cell.actual).toBe(canonical)
        expect(cell.passed).toBe(true)
      }
    }
  })

  it("each call produces a distinct runId", () => {
    const ids = Array.from({ length: 5 }, () => createInitialReport().runId)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

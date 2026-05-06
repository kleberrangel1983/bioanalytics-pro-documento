import { describe, it, expect } from "vitest"
import { evaluateFlag, evaluateAll, ALL_FLAGS } from "@/lib/feature-flags/flags"
import type { FeatureFlag } from "@/lib/feature-flags/types"
import type { UserRole } from "@/lib/staging/types"

const BASE_FLAG: FeatureFlag = {
  id: "test-flag",
  name: "Test",
  description: "Test flag",
  category: "ui",
  owner: "test",
  createdAt: "2026-01-01",
  tags: [],
  targeting: [{ type: "roles", allowedRoles: ["admin", "medico"] }],
  environments: {
    staging: { enabled: true, rolloutPct: 100, roleOverrides: {} },
    production: { enabled: true, rolloutPct: 50, roleOverrides: {} },
  },
}

describe("evaluateFlag", () => {
  it("returns flag_disabled when environment is disabled", () => {
    const flag: FeatureFlag = {
      ...BASE_FLAG,
      environments: {
        ...BASE_FLAG.environments,
        staging: { enabled: false, rolloutPct: 0, roleOverrides: {} },
      },
    }
    const result = evaluateFlag(flag, "u1", "admin", "staging")
    expect(result.enabled).toBe(false)
    expect(result.reason).toBe("flag_disabled")
  })

  it("returns role_override_on when role is explicitly overridden to true", () => {
    const flag: FeatureFlag = {
      ...BASE_FLAG,
      environments: {
        ...BASE_FLAG.environments,
        staging: { enabled: true, rolloutPct: 0, roleOverrides: { admin: true } },
      },
    }
    const result = evaluateFlag(flag, "u1", "admin", "staging")
    expect(result.enabled).toBe(true)
    expect(result.reason).toBe("role_override_on")
  })

  it("returns role_override_off when role is explicitly overridden to false", () => {
    const flag: FeatureFlag = {
      ...BASE_FLAG,
      environments: {
        ...BASE_FLAG.environments,
        staging: { enabled: true, rolloutPct: 100, roleOverrides: { suporte: false } },
      },
    }
    const result = evaluateFlag(flag, "u1", "suporte", "staging")
    expect(result.enabled).toBe(false)
    expect(result.reason).toBe("role_override_off")
  })

  it("returns role_not_targeted when role is not in allowedRoles", () => {
    const result = evaluateFlag(BASE_FLAG, "u1", "paciente", "staging")
    expect(result.enabled).toBe(false)
    expect(result.reason).toBe("role_not_targeted")
  })

  it("returns rollout_in when user hash falls within rolloutPct", () => {
    // "admin-user" charCodes: sum % 100 gives a known bucket
    const userId = "admin-user"
    const hash = userId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
    const bucket = hash % 100
    const flag: FeatureFlag = {
      ...BASE_FLAG,
      targeting: [],
      environments: {
        ...BASE_FLAG.environments,
        production: { enabled: true, rolloutPct: bucket + 1, roleOverrides: {} },
      },
    }
    const result = evaluateFlag(flag, userId, "admin", "production")
    expect(result.enabled).toBe(true)
    expect(result.reason).toBe("rollout_in")
  })

  it("returns rollout_out when user hash exceeds rolloutPct", () => {
    const userId = "admin-user"
    const hash = userId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
    const bucket = hash % 100
    const flag: FeatureFlag = {
      ...BASE_FLAG,
      targeting: [],
      environments: {
        ...BASE_FLAG.environments,
        production: { enabled: true, rolloutPct: bucket, roleOverrides: {} },
      },
    }
    const result = evaluateFlag(flag, userId, "admin", "production")
    expect(result.enabled).toBe(false)
    expect(result.reason).toBe("rollout_out")
  })

  it("evaluateAll returns one result per flag", () => {
    const results = evaluateAll("u1", "admin", "staging")
    expect(results).toHaveLength(ALL_FLAGS.length)
    results.forEach((r) => expect(r.flagId).toBeTruthy())
  })

  // ── percentage-only targeting (no roles rule) ────────────────────────────

  it("flag with only a percentage rule routes every role to rollout evaluation", () => {
    // No roles rule → roleRule is undefined → role check is skipped entirely
    const flag: FeatureFlag = {
      ...BASE_FLAG,
      targeting: [{ type: "percentage", value: 50 }],
      environments: {
        ...BASE_FLAG.environments,
        staging: { enabled: true, rolloutPct: 100, roleOverrides: {} },
      },
    }
    const roles: UserRole[] = ["admin", "medico", "secretaria", "paciente", "suporte"]
    for (const role of roles) {
      const result = evaluateFlag(flag, "any-user", role, "staging")
      // 100% rollout → every user must be in
      expect(result.enabled).toBe(true)
      expect(result.reason).toBe("rollout_in")
    }
  })

  it("notificacoes-whatsapp (real flag, percentage-only) reaches rollout for paciente in staging", () => {
    // This flag has targeting: [{ type: "percentage", value: 5 }] — no roles rule.
    // In staging rolloutPct is 100, so any user should be rollout_in regardless of role.
    const flag = ALL_FLAGS.find((f) => f.id === "notificacoes-whatsapp")!
    expect(flag).toBeDefined()
    const result = evaluateFlag(flag, "any-user", "paciente", "staging")
    expect(result.reason).toBe("rollout_in")
    expect(result.enabled).toBe(true)
  })

  // ── empty targeting array ────────────────────────────────────────────────

  it("flag with targeting:[] routes every role straight to rollout", () => {
    const flag: FeatureFlag = {
      ...BASE_FLAG,
      targeting: [],
      environments: {
        ...BASE_FLAG.environments,
        staging: { enabled: true, rolloutPct: 100, roleOverrides: {} },
      },
    }
    const roles: UserRole[] = ["admin", "medico", "secretaria", "paciente", "suporte"]
    for (const role of roles) {
      const result = evaluateFlag(flag, "any-user", role, "staging")
      expect(result.reason).toBe("rollout_in")
    }
  })

  it("flag with targeting:[] and rolloutPct=0 excludes everyone", () => {
    const flag: FeatureFlag = {
      ...BASE_FLAG,
      targeting: [],
      environments: {
        ...BASE_FLAG.environments,
        staging: { enabled: true, rolloutPct: 0, roleOverrides: {} },
      },
    }
    const roles: UserRole[] = ["admin", "medico", "secretaria", "paciente", "suporte"]
    for (const role of roles) {
      const result = evaluateFlag(flag, "any-user", role, "staging")
      expect(result.reason).toBe("rollout_out")
      expect(result.enabled).toBe(false)
    }
  })
})

// ── evaluateAll — result completeness ──────────────────────────────────────────

describe("evaluateAll — result completeness", () => {
  it("returns exactly the IDs of every flag in ALL_FLAGS", () => {
    const results = evaluateAll("usr_admin_001", "admin", "staging")
    const resultIds = results.map((r) => r.flagId).sort()
    const definedIds = ALL_FLAGS.map((f) => f.id).sort()
    expect(resultIds).toEqual(definedIds)
  })

  it("each result carries the queried userId and role", () => {
    const results = evaluateAll("usr_med_017", "medico", "production")
    results.forEach((r) => {
      expect(r.userId).toBe("usr_med_017")
      expect(r.role).toBe("medico")
      expect(r.environment).toBe("production")
    })
  })

  it("every result has a valid reason string", () => {
    const validReasons = new Set([
      "flag_disabled",
      "role_not_targeted",
      "role_override_on",
      "role_override_off",
      "rollout_in",
      "rollout_out",
    ])
    const results = evaluateAll("u1", "admin", "staging")
    results.forEach((r) => {
      expect(validReasons.has(r.reason)).toBe(true)
    })
  })
})

// ── ALL_FLAGS catalogue — production roleOverrides end-to-end ─────────────────

describe("ALL_FLAGS — production roleOverrides", () => {
  const dashboardFlag = ALL_FLAGS.find((f) => f.id === "novo-dashboard-analitico")!

  it("novo-dashboard-analitico: admin gets role_override_on in production", () => {
    // production.roleOverrides: { admin: true, suporte: false }
    const result = evaluateFlag(dashboardFlag, "any-id", "admin", "production")
    expect(result.enabled).toBe(true)
    expect(result.reason).toBe("role_override_on")
  })

  it("novo-dashboard-analitico: suporte gets role_override_off in production", () => {
    const result = evaluateFlag(dashboardFlag, "any-id", "suporte", "production")
    expect(result.enabled).toBe(false)
    expect(result.reason).toBe("role_override_off")
  })

  it("novo-dashboard-analitico: paciente is role_not_targeted in production (no override, not in allowedRoles)", () => {
    // No role override for paciente; allowedRoles: ["admin", "medico"] → paciente is excluded
    const result = evaluateFlag(dashboardFlag, "any-id", "paciente", "production")
    expect(result.enabled).toBe(false)
    expect(result.reason).toBe("role_not_targeted")
  })

  it("exportacao-pdf-avancada: suporte gets role_override_off in production", () => {
    // production.roleOverrides: { suporte: false, paciente: false }
    const flag = ALL_FLAGS.find((f) => f.id === "exportacao-pdf-avancada")!
    const result = evaluateFlag(flag, "any-id", "suporte", "production")
    expect(result.enabled).toBe(false)
    expect(result.reason).toBe("role_override_off")
  })

  it("exportacao-pdf-avancada: paciente gets role_override_off in production", () => {
    const flag = ALL_FLAGS.find((f) => f.id === "exportacao-pdf-avancada")!
    const result = evaluateFlag(flag, "any-id", "paciente", "production")
    expect(result.enabled).toBe(false)
    expect(result.reason).toBe("role_override_off")
  })

  it("triagem-ia: medico gets role_override_on in staging", () => {
    // staging.roleOverrides: { medico: true }
    const flag = ALL_FLAGS.find((f) => f.id === "triagem-ia")!
    const result = evaluateFlag(flag, "any-id", "medico", "staging")
    expect(result.enabled).toBe(true)
    expect(result.reason).toBe("role_override_on")
  })
})

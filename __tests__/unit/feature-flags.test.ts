import { describe, it, expect } from "vitest"
import { evaluateFlag, evaluateAll, ALL_FLAGS } from "@/lib/feature-flags/flags"
import type { FeatureFlag } from "@/lib/feature-flags/types"

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
})

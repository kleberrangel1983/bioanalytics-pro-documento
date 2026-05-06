import { describe, it, expect, vi, beforeEach } from "vitest"

function makeChain(finalData: unknown = null) {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {}
  const asyncTerminal = Promise.resolve({ data: finalData, error: null })
  const methods = ["select","insert","update","delete","eq","neq","gte","lte",
    "order","limit","in","or","single","maybeSingle"]
  for (const m of methods) {
    chain[m] = vi.fn(() => m === "single" || m === "maybeSingle" ? asyncTerminal : chain)
  }
  return chain
}

const mockFrom = vi.fn()

vi.mock("@/lib/supabase-admin", () => ({
  createAdminClient: () => ({ from: mockFrom }),
}))

let chain: ReturnType<typeof makeChain>

const MOCK_USER = { id: "u1", email: "admin@clinic.com", name: "Admin", role: "admin", active: true,
  created_at: "2026-05-01T00:00:00Z", updated_at: "2026-05-01T00:00:00Z" }
const MOCK_FLAG = { id: "f1", key: "realtime_agenda", label: "Agenda em tempo real",
  description: null, enabled: true, updated_by: "sistema",
  created_at: "2026-05-01T00:00:00Z", updated_at: "2026-05-01T00:00:00Z" }

beforeEach(() => {
  vi.clearAllMocks()
  vi.resetModules()
  chain = makeChain(MOCK_USER)
  mockFrom.mockReturnValue(chain)
})

describe("listClinicUsers", () => {
  it("queries clinic_users table", async () => {
    const { listClinicUsers } = await import("@/lib/services/admin")
    await listClinicUsers()
    expect(mockFrom).toHaveBeenCalledWith("clinic_users")
  })

  it("calls select and order", async () => {
    const { listClinicUsers } = await import("@/lib/services/admin")
    await listClinicUsers()
    expect(chain.select).toHaveBeenCalled()
    expect(chain.order).toHaveBeenCalled()
  })
})

describe("updateUserRole", () => {
  it("calls update with correct role", async () => {
    const { updateUserRole } = await import("@/lib/services/admin")
    await updateUserRole("u1", "medico")
    expect(chain.update).toHaveBeenCalledWith({ role: "medico" })
  })

  it("calls eq with user id", async () => {
    const { updateUserRole } = await import("@/lib/services/admin")
    await updateUserRole("u-99", "secretaria")
    expect(chain.eq).toHaveBeenCalledWith("id", "u-99")
  })

  it("queries clinic_users table", async () => {
    const { updateUserRole } = await import("@/lib/services/admin")
    await updateUserRole("u1", "admin")
    expect(mockFrom).toHaveBeenCalledWith("clinic_users")
  })
})

describe("toggleUserActive", () => {
  it("calls update with active: true", async () => {
    const { toggleUserActive } = await import("@/lib/services/admin")
    await toggleUserActive("u1", true)
    expect(chain.update).toHaveBeenCalledWith({ active: true })
  })

  it("calls update with active: false", async () => {
    const { toggleUserActive } = await import("@/lib/services/admin")
    await toggleUserActive("u1", false)
    expect(chain.update).toHaveBeenCalledWith({ active: false })
  })

  it("calls eq with user id", async () => {
    const { toggleUserActive } = await import("@/lib/services/admin")
    await toggleUserActive("u-77", true)
    expect(chain.eq).toHaveBeenCalledWith("id", "u-77")
  })
})

describe("createClinicUser", () => {
  it("calls insert with user data", async () => {
    const { createClinicUser } = await import("@/lib/services/admin")
    await createClinicUser({ email: "new@clinic.com", name: "Nova", role: "secretaria", active: true })
    expect(chain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ email: "new@clinic.com", role: "secretaria" }),
    )
  })

  it("queries clinic_users table", async () => {
    const { createClinicUser } = await import("@/lib/services/admin")
    await createClinicUser({ email: "x@y.com", name: "X", role: "convidado", active: true })
    expect(mockFrom).toHaveBeenCalledWith("clinic_users")
  })
})

describe("listFeatureFlags", () => {
  beforeEach(() => {
    chain = makeChain(MOCK_FLAG)
    mockFrom.mockReturnValue(chain)
  })

  it("queries feature_flags table", async () => {
    const { listFeatureFlags } = await import("@/lib/services/admin")
    await listFeatureFlags()
    expect(mockFrom).toHaveBeenCalledWith("feature_flags")
  })

  it("calls order by key", async () => {
    const { listFeatureFlags } = await import("@/lib/services/admin")
    await listFeatureFlags()
    expect(chain.order).toHaveBeenCalledWith("key")
  })
})

describe("toggleFeatureFlag", () => {
  beforeEach(() => {
    chain = makeChain(MOCK_FLAG)
    mockFrom.mockReturnValue(chain)
  })

  it("calls update with enabled and updated_by", async () => {
    const { toggleFeatureFlag } = await import("@/lib/services/admin")
    await toggleFeatureFlag("f1", false, "admin@clinic.com")
    expect(chain.update).toHaveBeenCalledWith({ enabled: false, updated_by: "admin@clinic.com" })
  })

  it("calls eq with flag id", async () => {
    const { toggleFeatureFlag } = await import("@/lib/services/admin")
    await toggleFeatureFlag("f-99", true, "admin@clinic.com")
    expect(chain.eq).toHaveBeenCalledWith("id", "f-99")
  })

  it("queries feature_flags table", async () => {
    const { toggleFeatureFlag } = await import("@/lib/services/admin")
    await toggleFeatureFlag("f1", true, "admin@clinic.com")
    expect(mockFrom).toHaveBeenCalledWith("feature_flags")
  })
})

describe("getFeatureFlagByKey", () => {
  beforeEach(() => {
    chain = makeChain(MOCK_FLAG)
    mockFrom.mockReturnValue(chain)
  })

  it("queries feature_flags by key", async () => {
    const { getFeatureFlagByKey } = await import("@/lib/services/admin")
    await getFeatureFlagByKey("realtime_agenda")
    expect(chain.eq).toHaveBeenCalledWith("key", "realtime_agenda")
  })
})

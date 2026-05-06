import { describe, it, expect, vi, beforeEach } from "vitest"

// Stable admin cookie mock — not reset between tests
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({ get: vi.fn(() => ({ value: "admin" })) })),
}))

vi.mock("@/lib/services/admin", () => ({
  listClinicUsers:   vi.fn().mockResolvedValue([]),
  createClinicUser:  vi.fn().mockResolvedValue({ id: "u-new", email: "new@clinic.com", role: "secretaria", active: true }),
  updateUserRole:    vi.fn().mockResolvedValue({ id: "u1", role: "medico" }),
  toggleUserActive:  vi.fn().mockResolvedValue({ id: "u1", active: false }),
  listFeatureFlags:  vi.fn().mockResolvedValue([]),
  toggleFeatureFlag: vi.fn().mockResolvedValue({ id: "f1", enabled: false, key: "realtime_agenda" }),
}))

vi.mock("@/lib/services/audit", () => ({
  writeAudit: vi.fn().mockResolvedValue(undefined),
}))

// Helper to call routes without Supabase configured
function withoutSupabase<T>(fn: () => Promise<T>): Promise<T> {
  const orig = process.env.SUPABASE_SERVICE_ROLE_KEY
  delete process.env.SUPABASE_SERVICE_ROLE_KEY
  return fn().finally(() => { process.env.SUPABASE_SERVICE_ROLE_KEY = orig })
}

beforeEach(() => vi.clearAllMocks())

describe("GET /api/admin/users", () => {
  it("returns 200 in mock mode for admin", async () => {
    const { GET } = await import("@/app/api/admin/users/route")
    const res = await withoutSupabase(() => GET())
    expect(res.status).toBe(200)
  })

  it("response is JSON array", async () => {
    const { GET } = await import("@/app/api/admin/users/route")
    const res = await withoutSupabase(() => GET())
    const data = await res.json()
    expect(Array.isArray(data)).toBe(true)
  })
})

describe("POST /api/admin/users", () => {
  function makeReq(body: object) {
    return new Request("http://localhost/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  }

  it("returns 422 when email missing", async () => {
    const { POST } = await import("@/app/api/admin/users/route")
    const res = await withoutSupabase(() => POST(makeReq({ name: "Test", role: "secretaria" }) as any))
    expect(res.status).toBe(422)
  })

  it("returns 422 when name missing", async () => {
    const { POST } = await import("@/app/api/admin/users/route")
    const res = await withoutSupabase(() => POST(makeReq({ email: "x@y.com", role: "secretaria" }) as any))
    expect(res.status).toBe(422)
  })

  it("returns 201 with valid payload in mock mode", async () => {
    const { POST } = await import("@/app/api/admin/users/route")
    const res = await withoutSupabase(() =>
      POST(makeReq({ email: "new@clinic.com", name: "Nova", role: "secretaria" }) as any)
    )
    expect(res.status).toBe(201)
  })

  it("mock response includes id and email", async () => {
    const { POST } = await import("@/app/api/admin/users/route")
    const res = await withoutSupabase(() =>
      POST(makeReq({ email: "new@clinic.com", name: "Nova", role: "secretaria" }) as any)
    )
    const data = await res.json()
    expect(data).toMatchObject({ email: "new@clinic.com" })
  })
})

describe("PATCH /api/admin/users/[id]", () => {
  function makeReq(body: object) {
    return new Request("http://localhost/api/admin/users/u1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  }
  const params = { params: Promise.resolve({ id: "u1" }) }

  it("returns 422 when neither role nor active provided", async () => {
    const { PATCH } = await import("@/app/api/admin/users/[id]/route")
    const res = await withoutSupabase(() => PATCH(makeReq({}) as any, params))
    expect(res.status).toBe(422)
  })

  it("returns 200 when role provided in mock mode", async () => {
    const { PATCH } = await import("@/app/api/admin/users/[id]/route")
    const res = await withoutSupabase(() => PATCH(makeReq({ role: "medico" }) as any, params))
    expect(res.status).toBe(200)
  })

  it("returns 200 when active: false provided in mock mode", async () => {
    const { PATCH } = await import("@/app/api/admin/users/[id]/route")
    const res = await withoutSupabase(() => PATCH(makeReq({ active: false }) as any, params))
    expect(res.status).toBe(200)
  })

  it("response includes id when active toggled", async () => {
    const { PATCH } = await import("@/app/api/admin/users/[id]/route")
    const res = await withoutSupabase(() => PATCH(makeReq({ active: true }) as any, params))
    const data = await res.json()
    expect(data).toHaveProperty("id")
  })
})

describe("GET /api/admin/flags", () => {
  it("returns 200 in mock mode", async () => {
    const { GET } = await import("@/app/api/admin/flags/route")
    const res = await withoutSupabase(() => GET())
    expect(res.status).toBe(200)
  })

  it("returns array of flags", async () => {
    const { GET } = await import("@/app/api/admin/flags/route")
    const res = await withoutSupabase(() => GET())
    const data = await res.json()
    expect(Array.isArray(data)).toBe(true)
  })

  it("mock flags have expected keys", async () => {
    const { GET } = await import("@/app/api/admin/flags/route")
    const res = await withoutSupabase(() => GET())
    const data = await res.json()
    if (data.length > 0) {
      expect(data[0]).toHaveProperty("key")
      expect(data[0]).toHaveProperty("enabled")
    }
  })
})

describe("PATCH /api/admin/flags/[id]", () => {
  function makeReq(body: object) {
    return new Request("http://localhost/api/admin/flags/f1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  }
  const params = { params: Promise.resolve({ id: "f1" }) }

  it("returns 422 when enabled is string instead of boolean", async () => {
    const { PATCH } = await import("@/app/api/admin/flags/[id]/route")
    const res = await withoutSupabase(() => PATCH(makeReq({ enabled: "yes" }) as any, params))
    expect(res.status).toBe(422)
  })

  it("returns 422 when enabled is number", async () => {
    const { PATCH } = await import("@/app/api/admin/flags/[id]/route")
    const res = await withoutSupabase(() => PATCH(makeReq({ enabled: 1 }) as any, params))
    expect(res.status).toBe(422)
  })

  it("returns 200 with enabled: false in mock mode", async () => {
    const { PATCH } = await import("@/app/api/admin/flags/[id]/route")
    const res = await withoutSupabase(() => PATCH(makeReq({ enabled: false }) as any, params))
    expect(res.status).toBe(200)
  })

  it("returns 200 with enabled: true in mock mode", async () => {
    const { PATCH } = await import("@/app/api/admin/flags/[id]/route")
    const res = await withoutSupabase(() => PATCH(makeReq({ enabled: true }) as any, params))
    expect(res.status).toBe(200)
  })
})

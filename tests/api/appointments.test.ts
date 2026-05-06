import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/services/appointments", () => ({
  listAppointmentsByDate:    vi.fn().mockResolvedValue([]),
  createAppointment:         vi.fn().mockResolvedValue({ id: "new-appt", patients: { name: "Ana", phone: "(11) 91234-5678" } }),
  updateAppointmentStatus:   vi.fn().mockResolvedValue({ id: "appt-1", status: "confirmado" }),
  deleteAppointment:         vi.fn().mockResolvedValue(undefined),
}))

vi.mock("@/lib/services/audit", () => ({
  writeAudit: vi.fn().mockResolvedValue(undefined),
}))

vi.mock("@/lib/services/whatsapp", () => ({
  sendAppointmentConfirmation: vi.fn().mockResolvedValue({ status: "simulated" }),
}))

function makeRequest(method: string, body?: object, searchParams = "") {
  return new Request(`http://localhost/api/appointments${searchParams}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  })
}

beforeEach(() => vi.clearAllMocks())

describe("GET /api/appointments", () => {
  it("returns 200 with mock data when Supabase not configured", async () => {
    const origUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    vi.resetModules()
    const { GET } = await import("@/app/api/appointments/route")
    const res = await GET(makeRequest("GET") as any)
    expect(res.status).toBe(200)
    process.env.NEXT_PUBLIC_SUPABASE_URL = origUrl
  })

  it("returns 200 and calls listAppointmentsByDate when configured", async () => {
    const { GET } = await import("@/app/api/appointments/route")
    const req = makeRequest("GET", undefined, "?date=2026-05-06")
    const res = await GET(req as any)
    expect(res.status).toBe(200)
  })
})

describe("POST /api/appointments", () => {
  it("returns 422 when required fields missing", async () => {
    const { POST } = await import("@/app/api/appointments/route")
    const res = await POST(makeRequest("POST", { type: "Consulta" }) as any)
    expect(res.status).toBe(422)
  })

  it("returns 201 with valid payload when Supabase configured", async () => {
    const { POST } = await import("@/app/api/appointments/route")
    const res = await POST(makeRequest("POST", {
      patient_id: "pat-1",
      type: "Consulta inicial",
      scheduled_at: "2026-05-06T09:00:00Z",
      created_by: "julia@clinic.com",
    }) as any)
    expect(res.status).toBe(201)
  })

  it("returns 201 in mock mode when Supabase not configured", async () => {
    const origKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
    vi.resetModules()
    const { POST } = await import("@/app/api/appointments/route")
    const res = await POST(makeRequest("POST", {
      patient_id: "pat-1",
      type: "Retorno",
      scheduled_at: "2026-05-06T10:00:00Z",
      created_by: "julia@clinic.com",
    }) as any)
    expect(res.status).toBe(201)
    process.env.SUPABASE_SERVICE_ROLE_KEY = origKey
  })
})

describe("PATCH /api/appointments/[id]", () => {
  it("returns 422 when status missing", async () => {
    const { PATCH } = await import("@/app/api/appointments/[id]/route")
    const req = new Request("http://localhost/api/appointments/appt-1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
    const res = await PATCH(req as any, { params: Promise.resolve({ id: "appt-1" }) })
    expect(res.status).toBe(422)
  })

  it("returns 422 for invalid status", async () => {
    const { PATCH } = await import("@/app/api/appointments/[id]/route")
    const req = new Request("http://localhost/api/appointments/appt-1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "invalid_status" }),
    })
    const res = await PATCH(req as any, { params: Promise.resolve({ id: "appt-1" }) })
    expect(res.status).toBe(422)
  })

  it("returns 200 with valid status in mock mode", async () => {
    const origKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
    vi.resetModules()
    const { PATCH } = await import("@/app/api/appointments/[id]/route")
    const req = new Request("http://localhost/api/appointments/appt-1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "confirmado" }),
    })
    const res = await PATCH(req as any, { params: Promise.resolve({ id: "appt-1" }) })
    expect(res.status).toBe(200)
    process.env.SUPABASE_SERVICE_ROLE_KEY = origKey
  })

  it("accepts all valid statuses", async () => {
    const origKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
    vi.resetModules()
    const { PATCH } = await import("@/app/api/appointments/[id]/route")

    for (const status of ["aguardando", "confirmado", "atendido", "cancelado"]) {
      const req = new Request("http://localhost/api/appointments/appt-1", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      const res = await PATCH(req as any, { params: Promise.resolve({ id: "appt-1" }) })
      expect(res.status).toBe(200)
    }
    process.env.SUPABASE_SERVICE_ROLE_KEY = origKey
  })
})

describe("DELETE /api/appointments/[id]", () => {
  it("returns 200 in mock mode", async () => {
    const origKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
    vi.resetModules()
    const { DELETE } = await import("@/app/api/appointments/[id]/route")
    const req = new Request("http://localhost/api/appointments/appt-1", { method: "DELETE" })
    const res = await DELETE(req as any, { params: Promise.resolve({ id: "appt-1" }) })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.deleted).toBe("appt-1")
    process.env.SUPABASE_SERVICE_ROLE_KEY = origKey
  })
})

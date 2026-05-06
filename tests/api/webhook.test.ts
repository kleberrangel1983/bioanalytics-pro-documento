import { describe, it, expect, vi, beforeEach } from "vitest"
import { createHmac } from "crypto"

const mockFindPending = vi.fn()
const mockUpdateStatus = vi.fn().mockResolvedValue({})
const mockWriteAudit   = vi.fn().mockResolvedValue(undefined)

vi.mock("@/lib/services/appointments", () => ({
  findPendingAppointmentByPhone: mockFindPending,
  updateAppointmentStatus: mockUpdateStatus,
}))

vi.mock("@/lib/services/audit", () => ({
  writeAudit: mockWriteAudit,
}))

function makeSignedRequest(body: string, secret: string) {
  const sig = "sha256=" + createHmac("sha256", secret).update(body).digest("hex")
  return new Request("http://localhost/api/whatsapp/webhook", {
    method: "POST",
    headers: {
      "x-hub-signature-256": sig,
      "Content-Type": "application/json",
      "x-forwarded-for": "1.2.3.4",
    },
    body,
  })
}

function makePayload(from: string, text: string) {
  return JSON.stringify({
    entry: [{ changes: [{ value: {
      messages: [{ from, id: "m1", timestamp: "1", type: "text", text: { body: text } }],
    } }] }],
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  mockFindPending.mockResolvedValue(null)
})

function makeNextRequest(url: string) {
  const req = new Request(url) as any
  req.nextUrl = new URL(url)
  return req
}

describe("GET /api/whatsapp/webhook — hub challenge", () => {
  it("returns challenge when token matches", async () => {
    const { GET } = await import("@/app/api/whatsapp/webhook/route")
    const url = "http://localhost/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=test-verify-token&hub.challenge=abc123"
    const res = await GET(makeNextRequest(url))
    expect(res.status).toBe(200)
    expect(await res.text()).toBe("abc123")
  })

  it("returns 403 when token does not match", async () => {
    const { GET } = await import("@/app/api/whatsapp/webhook/route")
    const url = "http://localhost/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=abc123"
    const res = await GET(makeNextRequest(url))
    expect(res.status).toBe(403)
  })

  it("returns 403 when mode is not subscribe", async () => {
    const { GET } = await import("@/app/api/whatsapp/webhook/route")
    const url = "http://localhost/api/whatsapp/webhook?hub.mode=other&hub.verify_token=test-verify-token&hub.challenge=abc123"
    const res = await GET(makeNextRequest(url))
    expect(res.status).toBe(403)
  })
})

describe("POST /api/whatsapp/webhook — HMAC validation", () => {
  it("returns 401 when signature header is missing", async () => {
    const { POST } = await import("@/app/api/whatsapp/webhook/route")
    const req = new Request("http://localhost/api/whatsapp/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    })
    const res = await POST(req as any)
    expect(res.status).toBe(401)
  })

  it("returns 401 when signature is invalid", async () => {
    const { POST } = await import("@/app/api/whatsapp/webhook/route")
    const req = new Request("http://localhost/api/whatsapp/webhook", {
      method: "POST",
      headers: {
        "x-hub-signature-256": "sha256=badsignature",
        "Content-Type": "application/json",
      },
      body: "{}",
    })
    const res = await POST(req as any)
    expect(res.status).toBe(401)
  })

  it("returns 200 with valid HMAC and empty entry list", async () => {
    const { POST } = await import("@/app/api/whatsapp/webhook/route")
    const body = JSON.stringify({ entry: [] })
    const res = await POST(makeSignedRequest(body, "test-wa-secret") as any)
    expect(res.status).toBe(200)
  })

  it("returns 400 for invalid JSON body", async () => {
    const { POST } = await import("@/app/api/whatsapp/webhook/route")
    const res = await POST(makeSignedRequest("not-json", "test-wa-secret") as any)
    expect(res.status).toBe(400)
  })
})

describe("POST /api/whatsapp/webhook — message handling", () => {
  it("calls updateAppointmentStatus with confirmado on SIM", async () => {
    mockFindPending.mockResolvedValueOnce({
      id: "appt-1",
      patients: { name: "Ana", phone: "+5511999990000" },
    })
    const { POST } = await import("@/app/api/whatsapp/webhook/route")
    const body = makePayload("+5511999990000", "SIM")
    await POST(makeSignedRequest(body, "test-wa-secret") as any)
    expect(mockUpdateStatus).toHaveBeenCalledWith("appt-1", "confirmado")
  })

  it("calls updateAppointmentStatus with cancelado on CANCELAR", async () => {
    mockFindPending.mockResolvedValueOnce({
      id: "appt-2",
      patients: { name: "Carlos", phone: "+5511999991111" },
    })
    const { POST } = await import("@/app/api/whatsapp/webhook/route")
    const body = makePayload("+5511999991111", "CANCELAR")
    await POST(makeSignedRequest(body, "test-wa-secret") as any)
    expect(mockUpdateStatus).toHaveBeenCalledWith("appt-2", "cancelado", expect.any(String))
  })

  it("does not call updateStatus for free text when no appointment found", async () => {
    mockFindPending.mockResolvedValueOnce(null)
    const { POST } = await import("@/app/api/whatsapp/webhook/route")
    const body = makePayload("+5511999992222", "Preciso remarcar")
    await POST(makeSignedRequest(body, "test-wa-secret") as any)
    expect(mockUpdateStatus).not.toHaveBeenCalled()
  })

  it("writes audit for SIM confirmation", async () => {
    mockFindPending.mockResolvedValueOnce({
      id: "appt-3",
      patients: { name: "Fernanda", phone: "+5511999993333" },
    })
    const { POST } = await import("@/app/api/whatsapp/webhook/route")
    const body = makePayload("+5511999993333", "SIM")
    await POST(makeSignedRequest(body, "test-wa-secret") as any)
    expect(mockWriteAudit).toHaveBeenCalledWith(
      expect.objectContaining({ action: "CONFIRMAR_AGENDAMENTO" }),
    )
  })

  it("writes audit for free text messages", async () => {
    const { POST } = await import("@/app/api/whatsapp/webhook/route")
    const body = makePayload("+5511999994444", "Oi tudo bem?")
    await POST(makeSignedRequest(body, "test-wa-secret") as any)
    expect(mockWriteAudit).toHaveBeenCalledWith(
      expect.objectContaining({ action: "MENSAGEM_LIVRE_WHATSAPP" }),
    )
  })

  it("returns 200 ok after processing", async () => {
    const { POST } = await import("@/app/api/whatsapp/webhook/route")
    const body = JSON.stringify({ entry: [] })
    const res = await POST(makeSignedRequest(body, "test-wa-secret") as any)
    const data = await res.json()
    expect(data.status).toBe("ok")
  })
})

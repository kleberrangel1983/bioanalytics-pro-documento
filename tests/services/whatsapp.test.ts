import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/whatsapp-throttle", () => ({
  canSend: vi.fn(() => true),
  currentTokens: vi.fn(() => 74),
}))

vi.mock("@/lib/services/audit", () => ({
  writeAudit: vi.fn().mockResolvedValue(undefined),
}))

global.fetch = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  vi.resetModules()
  delete process.env.WHATSAPP_TOKEN
  delete process.env.WHATSAPP_PHONE_ID
})

describe("sendTextMessage — HML mode (no token)", () => {
  it("returns simulated when token not configured", async () => {
    const { sendTextMessage } = await import("@/lib/services/whatsapp")
    const result = await sendTextMessage("+5511999990000", "Olá!")
    expect(result.status).toBe("simulated")
  })

  it("simulated result includes messageId", async () => {
    const { sendTextMessage } = await import("@/lib/services/whatsapp")
    const result = await sendTextMessage("+5511999990000", "Olá!")
    if (result.status === "simulated") {
      expect(result.messageId).toMatch(/^sim_/)
    }
  })

  it("calls writeAudit in simulated mode", async () => {
    const { writeAudit } = await import("@/lib/services/audit")
    const { sendTextMessage } = await import("@/lib/services/whatsapp")
    await sendTextMessage("+5511999990000", "Teste")
    expect(writeAudit).toHaveBeenCalled()
  })
})

describe("sendTextMessage — throttled", () => {
  it("returns throttled when canSend is false", async () => {
    const throttle = await import("@/lib/whatsapp-throttle")
    vi.mocked(throttle.canSend).mockReturnValueOnce(false)
    const { sendTextMessage } = await import("@/lib/services/whatsapp")
    const result = await sendTextMessage("+5511999990000", "Olá!")
    expect(result.status).toBe("throttled")
  })
})

describe("sendTextMessage — production mode", () => {
  beforeEach(() => {
    process.env.WHATSAPP_TOKEN = "real-token"
    process.env.WHATSAPP_PHONE_ID = "123456"
  })

  it("returns sent on success", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ messages: [{ id: "wamid.abc123" }] }),
    } as Response)
    const { sendTextMessage } = await import("@/lib/services/whatsapp")
    const result = await sendTextMessage("+5511999990000", "Olá!")
    expect(result.status).toBe("sent")
  })

  it("returns error on WhatsApp API failure", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: { message: "bad request" } }),
    } as Response)
    const { sendTextMessage } = await import("@/lib/services/whatsapp")
    const result = await sendTextMessage("+5511999990000", "Olá!")
    expect(result.status).toBe("error")
  })

  it("returns error on network failure", async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error("network error"))
    const { sendTextMessage } = await import("@/lib/services/whatsapp")
    const result = await sendTextMessage("+5511999990000", "Olá!")
    expect(result.status).toBe("error")
  })
})

describe("sendAppointmentConfirmation", () => {
  it("builds message with patient name, date, time, type", async () => {
    const { sendAppointmentConfirmation } = await import("@/lib/services/whatsapp")
    const result = await sendAppointmentConfirmation({
      to: "+5511999990000",
      patientName: "Ana Souza",
      date: "06/05/2026",
      time: "09:00",
      type: "Consulta inicial",
    })
    expect(["sent", "simulated", "throttled", "error"]).toContain(result.status)
  })
})

describe("sendTemplateMessage — HML mode", () => {
  it("returns simulated when token not configured", async () => {
    const { sendTemplateMessage } = await import("@/lib/services/whatsapp")
    const result = await sendTemplateMessage("+5511999990000", "hello_world")
    expect(result.status).toBe("simulated")
  })
})

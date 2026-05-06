import { describe, it, expect, vi, beforeEach } from "vitest"

const mockInsert = vi.fn().mockReturnValue({ error: null })
const mockSelect = vi.fn().mockReturnValue({ data: [], error: null })
const mockOrder  = vi.fn().mockReturnValue({ data: [], error: null })
const mockLimit  = vi.fn().mockReturnValue({ data: [], error: null })
const mockEq     = vi.fn()
const mockFrom   = vi.fn()

vi.mock("@/lib/supabase-admin", () => ({
  createAdminClient: () => ({
    from: mockFrom,
  }),
}))

beforeEach(() => {
  vi.clearAllMocks()
  mockEq.mockReturnValue({ data: [], error: null })
  mockLimit.mockReturnValue({ data: [], error: null })
  mockOrder.mockReturnValue({ limit: mockLimit, data: [], error: null })
  mockSelect.mockReturnValue({ order: mockOrder, data: [], error: null })
  mockInsert.mockReturnValue({ error: null })
  mockFrom.mockReturnValue({
    insert: mockInsert,
    select: mockSelect,
    order: mockOrder,
  })
})

describe("writeAudit", () => {
  it("calls supabase insert with correct fields", async () => {
    const { writeAudit } = await import("@/lib/services/audit")
    await writeAudit({
      userEmail: "admin@clinic.com",
      userRole: "admin",
      action: "CRIAR_USUARIO",
      resource: "Usuário X",
      ip: "127.0.0.1",
      severity: "info",
    })
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_email: "admin@clinic.com",
        user_role: "admin",
        action: "CRIAR_USUARIO",
        resource: "Usuário X",
        ip: "127.0.0.1",
        severity: "info",
        success: true,
      }),
    )
  })

  it("does not throw when supabase returns error", async () => {
    mockInsert.mockReturnValueOnce({ error: new Error("DB error") })
    const { writeAudit } = await import("@/lib/services/audit")
    await expect(writeAudit({
      userEmail: "x@y.com",
      userRole: "convidado",
      action: "TEST",
      resource: "test",
      ip: "0.0.0.0",
    })).resolves.toBeUndefined()
  })

  it("defaults severity to info", async () => {
    const { writeAudit } = await import("@/lib/services/audit")
    await writeAudit({
      userEmail: "a@b.com",
      userRole: "secretaria",
      action: "CONFIRMAR_AGENDAMENTO",
      resource: "Agendamento 1",
      ip: "1.2.3.4",
    })
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "info" }),
    )
  })

  it("defaults success to true", async () => {
    const { writeAudit } = await import("@/lib/services/audit")
    await writeAudit({
      userEmail: "a@b.com",
      userRole: "medico",
      action: "VISUALIZAR_PRONTUARIO",
      resource: "Paciente 1",
      ip: "1.2.3.4",
    })
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ success: true }),
    )
  })

  it("passes success: false when provided", async () => {
    const { writeAudit } = await import("@/lib/services/audit")
    await writeAudit({
      userEmail: "a@b.com",
      userRole: "convidado",
      action: "ACESSO_NEGADO",
      resource: "Auditoria",
      ip: "1.2.3.4",
      success: false,
      severity: "critical",
    })
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, severity: "critical" }),
    )
  })
})

describe("listAuditLogs", () => {
  it("returns empty array when no logs", async () => {
    const { listAuditLogs } = await import("@/lib/services/audit")
    const result = await listAuditLogs({})
    expect(Array.isArray(result)).toBe(true)
  })

  it("calls supabase select on audit_logs", async () => {
    const { listAuditLogs } = await import("@/lib/services/audit")
    await listAuditLogs({})
    expect(mockFrom).toHaveBeenCalledWith("audit_logs")
  })
})

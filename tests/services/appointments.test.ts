import { describe, it, expect, vi, beforeEach } from "vitest"

// Build a complete chainable Supabase mock
function makeChain(finalData: unknown = null) {
  const chain: Record<string, unknown> = {}
  const terminal = { data: finalData, error: null }
  const asyncTerminal = Promise.resolve(terminal)

  // Every method returns the chain, terminal methods resolve to { data, error }
  const methods = ["select", "insert", "update", "delete", "upsert",
    "eq", "neq", "gte", "lte", "gt", "lt", "in", "or",
    "order", "limit", "single", "maybeSingle", "range"]

  for (const m of methods) {
    chain[m] = vi.fn(() => {
      if (m === "single" || m === "maybeSingle") return asyncTerminal
      return chain
    })
  }
  // insert/update need a nested select chain
  ;(chain["insert"] as ReturnType<typeof vi.fn>).mockImplementation(() => chain)
  ;(chain["update"] as ReturnType<typeof vi.fn>).mockImplementation(() => chain)

  return chain
}

const mockFrom = vi.fn()

vi.mock("@/lib/supabase-admin", () => ({
  createAdminClient: () => ({ from: mockFrom }),
}))

let chain: ReturnType<typeof makeChain>

beforeEach(() => {
  vi.clearAllMocks()
  vi.resetModules()
  chain = makeChain({ id: "appt-1", patient_id: "pat-1", type: "Consulta inicial",
    scheduled_at: "2026-05-06T09:00:00Z", status: "aguardando", notes: null,
    created_by: "julia@clinic.com", patients: { name: "Ana Souza", phone: "(11) 91234-5678" } })
  mockFrom.mockReturnValue(chain)
})

describe("listAppointmentsByDate", () => {
  it("calls supabase with appointments table", async () => {
    const { listAppointmentsByDate } = await import("@/lib/services/appointments")
    await listAppointmentsByDate("2026-05-06")
    expect(mockFrom).toHaveBeenCalledWith("appointments")
  })

  it("calls select with patients join", async () => {
    const { listAppointmentsByDate } = await import("@/lib/services/appointments")
    await listAppointmentsByDate("2026-05-06")
    expect(chain.select).toHaveBeenCalledWith("*, patients(name, phone)")
  })
})

describe("createAppointment", () => {
  it("calls insert with correct payload", async () => {
    const { createAppointment } = await import("@/lib/services/appointments")
    await createAppointment({
      patient_id: "pat-1",
      type: "Consulta inicial",
      scheduled_at: "2026-05-06T09:00:00Z",
      created_by: "julia@clinic.com",
    })
    expect(mockFrom).toHaveBeenCalledWith("appointments")
    expect(chain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ patient_id: "pat-1", type: "Consulta inicial" }),
    )
  })

  it("passes notes when provided", async () => {
    const { createAppointment } = await import("@/lib/services/appointments")
    await createAppointment({
      patient_id: "pat-1",
      type: "Retorno",
      scheduled_at: "2026-05-06T10:00:00Z",
      notes: "Trazer exames",
      created_by: "julia@clinic.com",
    })
    expect(chain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ notes: "Trazer exames" }),
    )
  })
})

describe("updateAppointmentStatus", () => {
  it("calls update with correct status", async () => {
    const { updateAppointmentStatus } = await import("@/lib/services/appointments")
    await updateAppointmentStatus("appt-1", "confirmado")
    expect(chain.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: "confirmado" }),
    )
  })

  it("passes notes when provided", async () => {
    const { updateAppointmentStatus } = await import("@/lib/services/appointments")
    await updateAppointmentStatus("appt-1", "cancelado", "Paciente solicitou")
    expect(chain.update).toHaveBeenCalledWith(
      expect.objectContaining({ notes: "Paciente solicitou" }),
    )
  })

  it("calls eq with the appointment id", async () => {
    const { updateAppointmentStatus } = await import("@/lib/services/appointments")
    await updateAppointmentStatus("appt-99", "atendido")
    expect(chain.eq).toHaveBeenCalledWith("id", "appt-99")
  })

  it("includes status in the update payload", async () => {
    const { updateAppointmentStatus } = await import("@/lib/services/appointments")
    await updateAppointmentStatus("appt-1", "confirmado")
    const call = vi.mocked(chain.update as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(call).toHaveProperty("status", "confirmado")
  })
})

describe("deleteAppointment", () => {
  it("calls from appointments and delete", async () => {
    const { deleteAppointment } = await import("@/lib/services/appointments")
    await deleteAppointment("appt-1")
    expect(mockFrom).toHaveBeenCalledWith("appointments")
    expect(chain.delete).toHaveBeenCalled()
  })

  it("calls eq with id", async () => {
    const { deleteAppointment } = await import("@/lib/services/appointments")
    await deleteAppointment("appt-1")
    expect(chain.eq).toHaveBeenCalledWith("id", "appt-1")
  })
})

describe("findPendingAppointmentByPhone", () => {
  it("queries appointments table", async () => {
    const { findPendingAppointmentByPhone } = await import("@/lib/services/appointments")
    await findPendingAppointmentByPhone("+5511912345678")
    expect(mockFrom).toHaveBeenCalledWith("appointments")
  })

  it("uses patients inner join", async () => {
    const { findPendingAppointmentByPhone } = await import("@/lib/services/appointments")
    await findPendingAppointmentByPhone("+5511912345678")
    expect(chain.select).toHaveBeenCalledWith("*, patients!inner(name, phone)")
  })
})

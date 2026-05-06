import { NextRequest, NextResponse } from "next/server"
import { updateAppointmentStatus, deleteAppointment } from "@/lib/services/appointments"
import { writeAudit } from "@/lib/services/audit"
import { AppointmentStatus } from "@/lib/database.types"

const isConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)

type Params = { params: Promise<{ id: string }> }

// ─── PATCH /api/appointments/[id] ────────────────────────────────────────────
export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params
  const body = await request.json()
  const { status, notes, updated_by } = body as {
    status?: AppointmentStatus
    notes?: string
    updated_by?: string
  }

  if (!status) {
    return NextResponse.json({ error: "Campo 'status' é obrigatório" }, { status: 422 })
  }

  const VALID: AppointmentStatus[] = ["aguardando", "confirmado", "atendido", "cancelado"]
  if (!VALID.includes(status)) {
    return NextResponse.json({ error: `Status inválido: ${status}` }, { status: 422 })
  }

  if (!isConfigured) {
    return NextResponse.json({ id, status, notes: notes ?? null, updated_at: new Date().toISOString() })
  }

  try {
    const data = await updateAppointmentStatus(id, status, notes)

    await writeAudit({
      userEmail: updated_by ?? "sistema",
      userRole: "secretaria",
      action: `${STATUS_ACTION[status]}`,
      resource: `Agendamento ${id}`,
      ip: request.headers.get("x-forwarded-for") ?? "unknown",
      severity: status === "cancelado" ? "warning" : "info",
      details: notes,
    })

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// ─── DELETE /api/appointments/[id] ───────────────────────────────────────────
export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params

  if (!isConfigured) return NextResponse.json({ deleted: id })

  try {
    await deleteAppointment(id)

    await writeAudit({
      userEmail: "sistema",
      userRole: "admin",
      action: "DELETAR_AGENDAMENTO",
      resource: `Agendamento ${id}`,
      ip: request.headers.get("x-forwarded-for") ?? "unknown",
      severity: "warning",
    })

    return NextResponse.json({ deleted: id })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

const STATUS_ACTION: Record<AppointmentStatus, string> = {
  confirmado: "CONFIRMAR_AGENDAMENTO",
  cancelado:  "CANCELAR_AGENDAMENTO",
  atendido:   "REGISTRAR_ATENDIMENTO",
  aguardando: "REABRIR_AGENDAMENTO",
}

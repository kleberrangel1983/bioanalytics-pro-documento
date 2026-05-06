import { NextRequest, NextResponse } from "next/server"
import { listAppointmentsByDate, createAppointment } from "@/lib/services/appointments"
import { writeAudit } from "@/lib/services/audit"
import { AppointmentStatus } from "@/lib/database.types"

const isConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)

// ─── GET /api/appointments ────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  if (!isConfigured) return NextResponse.json(MOCK_APPOINTMENTS)

  const { searchParams } = request.nextUrl
  const date = searchParams.get("date") ?? new Date().toISOString().slice(0, 10)
  const status = searchParams.get("status") as AppointmentStatus | null

  try {
    const data = await listAppointmentsByDate(date, status ?? undefined)
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// ─── POST /api/appointments ───────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { patient_id, type, scheduled_at, notes, created_by } = body

  if (!patient_id || !type || !scheduled_at || !created_by) {
    return NextResponse.json(
      { error: "Campos obrigatórios: patient_id, type, scheduled_at, created_by" },
      { status: 422 },
    )
  }

  if (!isConfigured) {
    return NextResponse.json({ id: `mock_${Date.now()}`, status: "aguardando" }, { status: 201 })
  }

  try {
    const data = await createAppointment({ patient_id, type, scheduled_at, notes, created_by })

    await writeAudit({
      userEmail: created_by,
      userRole: "secretaria",
      action: "CRIAR_AGENDAMENTO",
      resource: `Agendamento ${data.id} — ${type}`,
      ip: request.headers.get("x-forwarded-for") ?? "unknown",
      severity: "info",
    })

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// ─── Mock (HML sem Supabase configurado) ─────────────────────────────────────
const MOCK_APPOINTMENTS = [
  { id: "1", patients: { name: "Ana Souza",        phone: "(11) 91234-5678" }, scheduled_at: "2026-05-06T08:00:00", type: "Consulta inicial",   status: "atendido",   notes: null },
  { id: "2", patients: { name: "Carlos Mendes",    phone: "(11) 98765-4321" }, scheduled_at: "2026-05-06T08:30:00", type: "Retorno",            status: "atendido",   notes: null },
  { id: "3", patients: { name: "Fernanda Lima",    phone: "(21) 93456-7890" }, scheduled_at: "2026-05-06T09:00:00", type: "Exame laboratorial", status: "confirmado",  notes: null },
  { id: "4", patients: { name: "Roberto Silva",    phone: "(11) 94567-8901" }, scheduled_at: "2026-05-06T09:30:00", type: "Consulta inicial",   status: "aguardando",  notes: null },
  { id: "5", patients: { name: "Juliana Costa",    phone: "(31) 95678-9012" }, scheduled_at: "2026-05-06T10:00:00", type: "Retorno",            status: "aguardando",  notes: null },
  { id: "6", patients: { name: "Marcos Oliveira",  phone: "(11) 96789-0123" }, scheduled_at: "2026-05-06T10:30:00", type: "Exame laboratorial", status: "confirmado",  notes: null },
  { id: "7", patients: { name: "Patricia Rocha",   phone: "(21) 97890-1234" }, scheduled_at: "2026-05-06T11:00:00", type: "Consulta inicial",   status: "cancelado",   notes: "Paciente solicitou reagendamento via WhatsApp" },
  { id: "8", patients: { name: "Eduardo Ferreira", phone: "(11) 98901-2345" }, scheduled_at: "2026-05-06T11:30:00", type: "Retorno",            status: "aguardando",  notes: null },
]

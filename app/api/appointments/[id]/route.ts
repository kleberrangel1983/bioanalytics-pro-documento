import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { AppointmentStatus } from "@/lib/database.types"

const HML_FALLBACK = !process.env.NEXT_PUBLIC_SUPABASE_URL

type Params = { params: Promise<{ id: string }> }

// ─── PATCH /api/appointments/[id] ────────────────────────────────────────────
// Body: { status, notes }
export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params
  const body = await request.json()
  const { status, notes } = body as { status?: AppointmentStatus; notes?: string }

  if (!status) {
    return NextResponse.json({ error: "Campo 'status' é obrigatório" }, { status: 422 })
  }

  const VALID_STATUSES: AppointmentStatus[] = ["aguardando", "confirmado", "atendido", "cancelado"]
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: `Status inválido: ${status}` }, { status: 422 })
  }

  if (HML_FALLBACK) {
    return NextResponse.json({ id, status, notes: notes ?? null, updated_at: new Date().toISOString() })
  }

  const supabase = await createClient()
  const update: Record<string, unknown> = { status }
  if (notes !== undefined) update.notes = notes

  const { data, error } = await supabase
    .from("appointments")
    .update(update)
    .eq("id", id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 })

  return NextResponse.json(data)
}

// ─── DELETE /api/appointments/[id] ───────────────────────────────────────────
export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params

  if (HML_FALLBACK) {
    return NextResponse.json({ deleted: id })
  }

  const supabase = await createClient()
  const { error } = await supabase.from("appointments").delete().eq("id", id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ deleted: id })
}

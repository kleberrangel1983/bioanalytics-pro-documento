import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-admin"

const isConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)

// ─── POST /api/uat/feedback ───────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  let body: FeedbackPayload
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { scenario_id, scenario_title, tester_name, tester_role, rating, notes, is_blocker } = body

  if (!scenario_id || !tester_name || !tester_role || !rating) {
    return NextResponse.json(
      { error: "Campos obrigatórios: scenario_id, tester_name, tester_role, rating" },
      { status: 422 },
    )
  }

  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: "rating deve ser entre 1 e 5" }, { status: 422 })
  }

  if (!isConfigured) {
    return NextResponse.json(
      { id: `mock_${Date.now()}`, created_at: new Date().toISOString() },
      { status: 201 },
    )
  }

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("uat_feedback")
      .insert({
        scenario_id,
        scenario_title: scenario_title ?? scenario_id,
        tester_name,
        tester_role,
        rating,
        notes: notes ?? null,
        is_blocker: is_blocker ?? false,
      })
      .select("id, created_at")
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// ─── GET /api/uat/feedback ────────────────────────────────────────────────────
export async function GET() {
  if (!isConfigured) return NextResponse.json(MOCK_FEEDBACK)

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("uat_feedback")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200)

    if (error) throw error
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface FeedbackPayload {
  scenario_id: string
  scenario_title?: string
  tester_name: string
  tester_role: string
  rating: number
  notes?: string
  is_blocker?: boolean
}

// ─── Mock ─────────────────────────────────────────────────────────────────────
const MOCK_FEEDBACK = [
  { id: "f1", scenario_id: "sec-01", scenario_title: "Agendar consulta",    tester_name: "Julia Alves",  tester_role: "Secretária", rating: 5, notes: null,                               is_blocker: false, created_at: "2026-05-06T10:00:00Z" },
  { id: "f2", scenario_id: "med-01", scenario_title: "Visualizar prontuário", tester_name: "Dr. Carlos",  tester_role: "Médico",     rating: 4, notes: "Filtro de datas poderia ser mais rápido", is_blocker: false, created_at: "2026-05-06T10:05:00Z" },
  { id: "f3", scenario_id: "wa-01",  scenario_title: "Confirmar via WhatsApp", tester_name: "Julia Alves",  tester_role: "Secretária", rating: 3, notes: "Demora ~5s para receber a mensagem",    is_blocker: false, created_at: "2026-05-06T10:10:00Z" },
]

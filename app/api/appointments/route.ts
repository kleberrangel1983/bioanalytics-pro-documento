import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { parsePagination } from "@/lib/supabase/pagination"
import { requireAuth } from "@/lib/supabase/require-auth"
import { z } from "zod"

const CreateSchema = z.object({
  patient_id:   z.string().uuid(),
  doctor_id:    z.string().uuid(),
  type:         z.string().min(1).max(120),
  scheduled_at: z.string().datetime(),
  notes:        z.string().max(1000).optional(),
})

// Roles that may see the patient CPF in appointment responses
const CPF_ALLOWED_ROLES = new Set(["admin", "medico"])

export async function GET(request: Request) {
  const auth = await requireAuth()
  if (auth.response) return auth.response
  const { role } = auth.ctx

  if (!["admin", "medico", "secretaria"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const page = parsePagination(searchParams)
  if ("error" in page) return NextResponse.json({ error: page.error }, { status: page.status })
  const { limit, offset } = page

  const supabase = await createClient()
  let query = supabase
    .from("appointments")
    .select("*, patients(name, cpf)", { count: "exact" })
    .order("scheduled_at")
    .range(offset, offset + limit - 1)

  if (status) {
    query = query.eq("status", status)
  }

  const { data, error, count } = await query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Mask CPF for roles without explicit access (Finding #11)
  const masked = CPF_ALLOWED_ROLES.has(role)
    ? data
    : data?.map((appt) => ({
        ...appt,
        patients: appt.patients
          ? { ...appt.patients, cpf: "***.***.***-**" }
          : appt.patients,
      }))

  return NextResponse.json({ data: masked, count, limit, offset })
}

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (auth.response) return auth.response
  if (!["admin", "medico", "secretaria"].includes(auth.ctx.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("appointments")
    .insert(parsed.data)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}

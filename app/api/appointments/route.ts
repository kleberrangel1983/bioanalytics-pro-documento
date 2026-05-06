import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const CreateSchema = z.object({
  patient_id:   z.string().uuid(),
  doctor_id:    z.string().uuid(),
  type:         z.string().min(1).max(120),
  scheduled_at: z.string().datetime(),
  notes:        z.string().max(1000).optional(),
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const limit = Math.min(Number(searchParams.get("limit") ?? 50), 200)
  const offset = Number(searchParams.get("offset") ?? 0)

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

  return NextResponse.json({ data, count, limit, offset })
}

export async function POST(request: Request) {
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

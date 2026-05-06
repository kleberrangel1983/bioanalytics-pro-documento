import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/supabase/require-auth"
import { z } from "zod"

const TriageSchema = z.object({
  patient_id:     z.string().uuid(),
  appointment_id: z.string().uuid().optional(),
  risk_score:     z.number().int().min(0).max(100),
  symptoms:       z.array(z.string().min(1)).min(1),
  notes:          z.string().max(2000).optional(),
})

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (auth.response) return auth.response
  const { userId, role } = auth.ctx

  if (role !== "medico" && role !== "admin") {
    return NextResponse.json({ error: "Forbidden: only medico or admin may triage" }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const parsed = TriageSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("triage_records")
    .insert({ ...parsed.data, triaged_by: userId })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Audit log — actor derived from authenticated session, never from request body
  const { error: auditError } = await supabase.from("audit_logs").insert({
    actor_id:      userId,
    actor_role:    role,
    action:        "triage.create",
    resource_type: "triage_record",
    resource_id:   data.id,
    metadata:      { risk_score: parsed.data.risk_score, symptom_count: parsed.data.symptoms.length },
  })

  if (auditError) {
    return NextResponse.json(
      { error: "Triage created but audit log failed", detail: auditError.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ data }, { status: 201 })
}

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const TriageSchema = z.object({
  patient_id:     z.string().uuid(),
  appointment_id: z.string().uuid().optional(),
  risk_score:     z.number().int().min(0).max(100),
  symptoms:       z.array(z.string().min(1)).min(1),
  notes:          z.string().max(2000).optional(),
  triaged_by:     z.string().uuid(),
})

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = TriageSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("triage_records")
    .insert(parsed.data)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // append audit log
  await supabase.from("audit_logs").insert({
    actor_id:      parsed.data.triaged_by,
    actor_role:    "medico",
    action:        "triage.create",
    resource_type: "triage_record",
    resource_id:   data.id,
    metadata:      { risk_score: parsed.data.risk_score, symptom_count: parsed.data.symptoms.length },
  })

  return NextResponse.json({ data }, { status: 201 })
}

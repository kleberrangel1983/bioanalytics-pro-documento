import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { toggleFeatureFlag } from "@/lib/services/admin"
import { writeAudit } from "@/lib/services/audit"

const isConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)

async function adminGuard() {
  const cookieStore = await cookies()
  return cookieStore.get("bioanalytics-role")?.value === "admin"
}

type Params = { params: Promise<{ id: string }> }

// ─── PATCH /api/admin/flags/[id] ──────────────────────────────────────────────
export async function PATCH(request: NextRequest, { params }: Params) {
  if (!(await adminGuard())) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  const { enabled, updated_by } = await request.json()

  if (typeof enabled !== "boolean") {
    return NextResponse.json({ error: "'enabled' deve ser boolean" }, { status: 422 })
  }

  if (!isConfigured) {
    return NextResponse.json({ id, enabled, updated_by, updated_at: new Date().toISOString() })
  }

  try {
    const actor = updated_by ?? "admin@clinic.com"
    const data = await toggleFeatureFlag(id, enabled, actor)
    await writeAudit({
      userEmail: actor,
      userRole: "admin",
      action: enabled ? "ATIVAR_FEATURE_FLAG" : "DESATIVAR_FEATURE_FLAG",
      resource: `Feature flag ${id}`,
      ip: request.headers.get("x-forwarded-for") ?? "unknown",
      severity: "warning",
      details: `Flag ${data.key} → ${enabled ? "ativada" : "desativada"}`,
    })
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

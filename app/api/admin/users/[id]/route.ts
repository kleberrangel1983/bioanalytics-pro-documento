import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { updateUserRole, toggleUserActive } from "@/lib/services/admin"
import { writeAudit } from "@/lib/services/audit"
import type { UserRole } from "@/lib/database.types"

const isConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)

async function adminGuard() {
  const cookieStore = await cookies()
  return cookieStore.get("bioanalytics-role")?.value === "admin"
}

type Params = { params: Promise<{ id: string }> }

// ─── PATCH /api/admin/users/[id] ───────────────────────────────────────────────
export async function PATCH(request: NextRequest, { params }: Params) {
  if (!(await adminGuard())) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  const body = await request.json()
  const { role, active } = body as { role?: UserRole; active?: boolean }

  if (!isConfigured) {
    return NextResponse.json({ id, role, active, updated_at: new Date().toISOString() })
  }

  try {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown"

    if (role !== undefined) {
      const data = await updateUserRole(id, role)
      await writeAudit({
        userEmail: "admin@clinic.com",
        userRole: "admin",
        action: "ALTERAR_PERMISSAO",
        resource: `Usuário ${id} → role: ${role}`,
        ip,
        severity: "critical",
        details: `Role alterada para ${role}`,
      })
      return NextResponse.json(data)
    }

    if (active !== undefined) {
      const data = await toggleUserActive(id, active)
      await writeAudit({
        userEmail: "admin@clinic.com",
        userRole: "admin",
        action: active ? "ATIVAR_USUARIO" : "DESATIVAR_USUARIO",
        resource: `Usuário ${id}`,
        ip,
        severity: "warning",
      })
      return NextResponse.json(data)
    }

    return NextResponse.json({ error: "Informe 'role' ou 'active'" }, { status: 422 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

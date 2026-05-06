import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { listClinicUsers, createClinicUser } from "@/lib/services/admin"
import { writeAudit } from "@/lib/services/audit"
import type { UserRole } from "@/lib/database.types"

const isConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)

async function adminGuard() {
  const cookieStore = await cookies()
  const role = cookieStore.get("bioanalytics-role")?.value
  return role === "admin"
}

// ─── GET /api/admin/users ──────────────────────────────────────────────────────
export async function GET() {
  if (!(await adminGuard())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  if (!isConfigured) return NextResponse.json(MOCK_USERS)
  try {
    const data = await listClinicUsers()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// ─── POST /api/admin/users ─────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  if (!(await adminGuard())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()
  const { email, name, role } = body as { email: string; name: string; role: UserRole }

  if (!email || !name || !role) {
    return NextResponse.json({ error: "email, name e role são obrigatórios" }, { status: 422 })
  }

  if (!isConfigured) {
    return NextResponse.json({ id: `mock_${Date.now()}`, email, name, role, active: true }, { status: 201 })
  }

  try {
    const data = await createClinicUser({ email, name, role, active: true })
    await writeAudit({
      userEmail: email,
      userRole: "admin",
      action: "CRIAR_USUARIO",
      resource: email,
      ip: request.headers.get("x-forwarded-for") ?? "unknown",
      severity: "warning",
    })
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// ─── Mock ─────────────────────────────────────────────────────────────────────
const MOCK_USERS = [
  { id: "u1", email: "admin@clinic.com",            name: "Administrador",     role: "admin",      active: true,  created_at: "2026-05-01T00:00:00Z", updated_at: "2026-05-01T00:00:00Z" },
  { id: "u2", email: "dr.carlos@clinic.com",        name: "Dr. Carlos Mendes", role: "medico",     active: true,  created_at: "2026-05-01T00:00:00Z", updated_at: "2026-05-01T00:00:00Z" },
  { id: "u3", email: "secretaria.julia@clinic.com", name: "Julia Alves",       role: "secretaria", active: true,  created_at: "2026-05-01T00:00:00Z", updated_at: "2026-05-01T00:00:00Z" },
  { id: "u4", email: "nova.secretaria@clinic.com",  name: "Nova Secretária",   role: "secretaria", active: true,  created_at: "2026-05-02T00:00:00Z", updated_at: "2026-05-02T00:00:00Z" },
  { id: "u5", email: "guest.teste@clinic.com",      name: "Usuário Teste",     role: "convidado",  active: false, created_at: "2026-05-03T00:00:00Z", updated_at: "2026-05-03T00:00:00Z" },
]

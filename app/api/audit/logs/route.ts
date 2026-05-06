import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { listAuditLogs, writeAudit } from "@/lib/services/audit"
import type { AuditSeverity, UserRole } from "@/lib/database.types"

const AUTHORIZED_ROLES = ["admin"]
const isConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)

// ─── GET /api/audit/logs ──────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const role = cookieStore.get("bioanalytics-role")?.value

  if (!role || !AUTHORIZED_ROLES.includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  if (!isConfigured) return NextResponse.json(MOCK_AUDIT_LOGS)

  const { searchParams } = request.nextUrl

  try {
    const logs = await listAuditLogs({
      severity: searchParams.get("severity") as AuditSeverity | undefined ?? undefined,
      userRole: searchParams.get("role") as UserRole | undefined ?? undefined,
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
      limit: parseInt(searchParams.get("limit") ?? "100"),
    })
    return NextResponse.json(logs)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// ─── POST /api/audit/logs ─────────────────────────────────────────────────────
// Internal endpoint — protected by shared AUDIT_SECRET header
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-audit-secret")
  if (secret !== process.env.AUDIT_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { user_email, user_role, action, resource, ip, severity, details, success } = body

  if (!user_email || !user_role || !action || !resource || !ip) {
    return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 422 })
  }

  if (!isConfigured) {
    return NextResponse.json({ id: `mock_${Date.now()}`, created_at: new Date().toISOString() }, { status: 201 })
  }

  try {
    await writeAudit({ userEmail: user_email, userRole: user_role, action, resource, ip, severity, details, success })
    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// ─── Mock ─────────────────────────────────────────────────────────────────────
const MOCK_AUDIT_LOGS = [
  { id: "a1",  created_at: "2026-05-06T09:01:12Z", user_email: "dr.carlos@clinic.com",        user_role: "medico",     action: "VISUALIZAR_PRONTUARIO",  resource: "Paciente #1042 — Ana Souza",                ip: "192.168.1.10",  severity: "info",     success: true,  details: null },
  { id: "a2",  created_at: "2026-05-06T09:03:44Z", user_email: "secretaria.julia@clinic.com", user_role: "secretaria", action: "CONFIRMAR_AGENDAMENTO",   resource: "Agendamento #5021",                         ip: "192.168.1.15",  severity: "info",     success: true,  details: null },
  { id: "a3",  created_at: "2026-05-06T09:08:22Z", user_email: "admin@clinic.com",            user_role: "admin",      action: "EXPORTAR_RELATORIO",      resource: "Relatório de pacientes — Mai/2026",         ip: "192.168.1.2",   severity: "warning",  success: true,  details: "Exportação de 342 registros de pacientes" },
  { id: "a4",  created_at: "2026-05-06T09:12:05Z", user_email: "guest.teste@clinic.com",      user_role: "convidado",  action: "ACESSO_NEGADO",           resource: "Painel de Auditoria",                       ip: "177.34.201.88", severity: "critical", success: false, details: "Tentativa de acesso por perfil não autorizado" },
  { id: "a5",  created_at: "2026-05-06T09:14:33Z", user_email: "secretaria.julia@clinic.com", user_role: "secretaria", action: "CANCELAR_AGENDAMENTO",    resource: "Agendamento #5019 — Patricia Rocha",        ip: "192.168.1.15",  severity: "warning",  success: true,  details: "Cancelamento via WhatsApp" },
  { id: "a6",  created_at: "2026-05-06T09:17:51Z", user_email: "dr.carlos@clinic.com",        user_role: "medico",     action: "EDITAR_PRONTUARIO",       resource: "Paciente #1038 — Roberto Silva",            ip: "192.168.1.10",  severity: "warning",  success: true,  details: null },
  { id: "a7",  created_at: "2026-05-06T09:21:04Z", user_email: "unknown@external.com",        user_role: "convidado",  action: "LOGIN_FALHOU",             resource: "Sistema de autenticação",                   ip: "45.33.32.156",  severity: "critical", success: false, details: "3ª tentativa — IP bloqueado por 30 min" },
  { id: "a8",  created_at: "2026-05-06T09:24:17Z", user_email: "admin@clinic.com",            user_role: "admin",      action: "CRIAR_USUARIO",           resource: "nova.secretaria@clinic.com",                ip: "192.168.1.2",   severity: "warning",  success: true,  details: null },
  { id: "a9",  created_at: "2026-05-06T09:28:39Z", user_email: "dr.carlos@clinic.com",        user_role: "medico",     action: "VISUALIZAR_EXAME",        resource: "Exame Lab #8834 — Carlos Mendes",           ip: "192.168.1.10",  severity: "info",     success: true,  details: null },
  { id: "a10", created_at: "2026-05-06T09:31:02Z", user_email: "secretaria.julia@clinic.com", user_role: "secretaria", action: "ENVIAR_WHATSAPP",         resource: "Confirmação → (11) 94567-8901",             ip: "192.168.1.15",  severity: "info",     success: true,  details: null },
  { id: "a11", created_at: "2026-05-06T09:35:14Z", user_email: "secretaria.julia@clinic.com", user_role: "secretaria", action: "ACESSO_NEGADO",           resource: "Painel de Auditoria",                       ip: "192.168.1.15",  severity: "critical", success: false, details: "Perfil Secretária sem permissão" },
  { id: "a12", created_at: "2026-05-06T09:42:58Z", user_email: "admin@clinic.com",            user_role: "admin",      action: "ALTERAR_PERMISSAO",       resource: "Permissões do perfil Médico",               ip: "192.168.1.2",   severity: "critical", success: true,  details: "EXPORTAR_RELATORIO removida" },
]

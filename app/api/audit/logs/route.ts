import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase-server"

const AUTHORIZED_ROLES = ["admin"]
const HML_FALLBACK = !process.env.NEXT_PUBLIC_SUPABASE_URL

// ─── GET /api/audit/logs ──────────────────────────────────────────────────────
// Query params: severity, role, from (ISO date), to (ISO date), limit
export async function GET(request: NextRequest) {
  // Server-side role check — defense-in-depth beyond middleware
  const cookieStore = await cookies()
  const role = cookieStore.get("bioanalytics-role")?.value

  if (!role || !AUTHORIZED_ROLES.includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  if (HML_FALLBACK) return NextResponse.json(MOCK_AUDIT_LOGS)

  const { searchParams } = request.nextUrl
  const severity = searchParams.get("severity")
  const userRole = searchParams.get("role")
  const from = searchParams.get("from")
  const to = searchParams.get("to")
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "100"), 500)

  const supabase = await createClient()

  let query = supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (severity) query = query.eq("severity", severity)
  if (userRole) query = query.eq("user_role", userRole)
  if (from) query = query.gte("created_at", from)
  if (to) query = query.lte("created_at", to)

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// ─── POST /api/audit/logs ─────────────────────────────────────────────────────
// Internal endpoint — called by server-side code to persist audit events
export async function POST(request: NextRequest) {
  // Only service_role calls (internal) — validate shared secret header
  const secret = request.headers.get("x-audit-secret")
  if (secret !== process.env.AUDIT_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { user_email, user_role, action, resource, ip, severity, details, success } = body

  if (!user_email || !user_role || !action || !resource || !ip) {
    return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 422 })
  }

  if (HML_FALLBACK) {
    return NextResponse.json({ id: `mock_${Date.now()}`, created_at: new Date().toISOString() }, { status: 201 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("audit_logs")
    .insert({ user_email, user_role, action, resource, ip, severity: severity ?? "info", details, success: success ?? true })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

// ─── Mock fallback ────────────────────────────────────────────────────────────
const MOCK_AUDIT_LOGS = [
  { id: "a1",  created_at: "2026-05-06T09:01:12Z", user_email: "dr.carlos@clinic.com",        user_role: "medico",    action: "VISUALIZAR_PRONTUARIO",  resource: "Paciente #1042 — Ana Souza",                  ip: "192.168.1.10",  severity: "info",     success: true,  details: null },
  { id: "a2",  created_at: "2026-05-06T09:03:44Z", user_email: "secretaria.julia@clinic.com", user_role: "secretaria",action: "CONFIRMAR_AGENDAMENTO",   resource: "Agendamento #5021",                           ip: "192.168.1.15",  severity: "info",     success: true,  details: null },
  { id: "a3",  created_at: "2026-05-06T09:08:22Z", user_email: "admin@clinic.com",            user_role: "admin",     action: "EXPORTAR_RELATORIO",      resource: "Relatório de pacientes — Mai/2026",           ip: "192.168.1.2",   severity: "warning",  success: true,  details: "Exportação de 342 registros de pacientes" },
  { id: "a4",  created_at: "2026-05-06T09:12:05Z", user_email: "guest.teste@clinic.com",      user_role: "convidado", action: "ACESSO_NEGADO",           resource: "Painel de Auditoria",                         ip: "177.34.201.88", severity: "critical", success: false, details: "Tentativa de acesso ao painel de auditoria por perfil não autorizado" },
  { id: "a5",  created_at: "2026-05-06T09:14:33Z", user_email: "secretaria.julia@clinic.com", user_role: "secretaria",action: "CANCELAR_AGENDAMENTO",    resource: "Agendamento #5019 — Patricia Rocha",          ip: "192.168.1.15",  severity: "warning",  success: true,  details: "Cancelamento solicitado pelo paciente via WhatsApp" },
  { id: "a6",  created_at: "2026-05-06T09:17:51Z", user_email: "dr.carlos@clinic.com",        user_role: "medico",    action: "EDITAR_PRONTUARIO",       resource: "Paciente #1038 — Roberto Silva",              ip: "192.168.1.10",  severity: "warning",  success: true,  details: null },
  { id: "a7",  created_at: "2026-05-06T09:21:04Z", user_email: "unknown@external.com",        user_role: "convidado", action: "LOGIN_FALHOU",             resource: "Sistema de autenticação",                     ip: "45.33.32.156",  severity: "critical", success: false, details: "3ª tentativa de login — IP bloqueado por 30 min" },
  { id: "a8",  created_at: "2026-05-06T09:24:17Z", user_email: "admin@clinic.com",            user_role: "admin",     action: "CRIAR_USUARIO",           resource: "Usuário: nova.secretaria@clinic.com",         ip: "192.168.1.2",   severity: "warning",  success: true,  details: null },
  { id: "a9",  created_at: "2026-05-06T09:28:39Z", user_email: "dr.carlos@clinic.com",        user_role: "medico",    action: "VISUALIZAR_EXAME",        resource: "Exame Lab #8834 — Carlos Mendes",             ip: "192.168.1.10",  severity: "info",     success: true,  details: null },
  { id: "a10", created_at: "2026-05-06T09:31:02Z", user_email: "secretaria.julia@clinic.com", user_role: "secretaria",action: "ENVIAR_WHATSAPP",         resource: "Confirmação → (11) 94567-8901",               ip: "192.168.1.15",  severity: "info",     success: true,  details: null },
  { id: "a11", created_at: "2026-05-06T09:35:14Z", user_email: "secretaria.julia@clinic.com", user_role: "secretaria",action: "ACESSO_NEGADO",           resource: "Painel de Auditoria",                         ip: "192.168.1.15",  severity: "critical", success: false, details: "Perfil Secretária não tem permissão" },
  { id: "a12", created_at: "2026-05-06T09:42:58Z", user_email: "admin@clinic.com",            user_role: "admin",     action: "ALTERAR_PERMISSAO",       resource: "Permissões do perfil Médico",                 ip: "192.168.1.2",   severity: "critical", success: true,  details: "Permissão EXPORTAR_RELATORIO removida" },
]

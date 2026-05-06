import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { AuditTable } from "./audit-table"

type Role = "admin" | "medico" | "secretaria" | "convidado"
type Severity = "info" | "warning" | "critical"

export interface AuditLog {
  id: string
  timestamp: string
  user: string
  role: Role
  action: string
  resource: string
  ip: string
  severity: Severity
  details?: string
  success: boolean
}

// Data lives only in the server — never shipped to the client bundle.
const AUDIT_LOGS: AuditLog[] = [
  { id: "a1", timestamp: "2026-05-06 09:01:12", user: "dr.carlos@clinic.com", role: "medico", action: "VISUALIZAR_PRONTUARIO", resource: "Paciente #1042 — Ana Souza", ip: "192.168.1.10", severity: "info", success: true },
  { id: "a2", timestamp: "2026-05-06 09:03:44", user: "secretaria.julia@clinic.com", role: "secretaria", action: "CONFIRMAR_AGENDAMENTO", resource: "Agendamento #5021", ip: "192.168.1.15", severity: "info", success: true },
  { id: "a3", timestamp: "2026-05-06 09:08:22", user: "admin@clinic.com", role: "admin", action: "EXPORTAR_RELATORIO", resource: "Relatório de pacientes — Mai/2026", ip: "192.168.1.2", severity: "warning", success: true, details: "Exportação de 342 registros de pacientes" },
  { id: "a4", timestamp: "2026-05-06 09:12:05", user: "guest.teste@clinic.com", role: "convidado", action: "ACESSO_NEGADO", resource: "Painel de Auditoria", ip: "177.34.201.88", severity: "critical", success: false, details: "Tentativa de acesso ao painel de auditoria por perfil não autorizado (Convidado)" },
  { id: "a5", timestamp: "2026-05-06 09:14:33", user: "secretaria.julia@clinic.com", role: "secretaria", action: "CANCELAR_AGENDAMENTO", resource: "Agendamento #5019 — Patricia Rocha", ip: "192.168.1.15", severity: "warning", success: true, details: "Cancelamento solicitado pelo paciente via WhatsApp" },
  { id: "a6", timestamp: "2026-05-06 09:17:51", user: "dr.carlos@clinic.com", role: "medico", action: "EDITAR_PRONTUARIO", resource: "Paciente #1038 — Roberto Silva", ip: "192.168.1.10", severity: "warning", success: true },
  { id: "a7", timestamp: "2026-05-06 09:21:04", user: "unknown@external.com", role: "convidado", action: "LOGIN_FALHOU", resource: "Sistema de autenticação", ip: "45.33.32.156", severity: "critical", success: false, details: "3ª tentativa de login com credenciais inválidas — IP bloqueado por 30 min" },
  { id: "a8", timestamp: "2026-05-06 09:24:17", user: "admin@clinic.com", role: "admin", action: "CRIAR_USUARIO", resource: "Usuário: nova.secretaria@clinic.com (Secretária)", ip: "192.168.1.2", severity: "warning", success: true },
  { id: "a9", timestamp: "2026-05-06 09:28:39", user: "dr.carlos@clinic.com", role: "medico", action: "VISUALIZAR_EXAME", resource: "Exame Lab #8834 — Carlos Mendes", ip: "192.168.1.10", severity: "info", success: true },
  { id: "a10", timestamp: "2026-05-06 09:31:02", user: "secretaria.julia@clinic.com", role: "secretaria", action: "ENVIAR_WHATSAPP", resource: "Mensagem de confirmação → (11) 94567-8901", ip: "192.168.1.15", severity: "info", success: true },
  { id: "a11", timestamp: "2026-05-06 09:35:14", user: "secretaria.julia@clinic.com", role: "secretaria", action: "ACESSO_NEGADO", resource: "Painel de Auditoria", ip: "192.168.1.15", severity: "critical", success: false, details: "Perfil Secretária não tem permissão para acessar logs de auditoria" },
  { id: "a12", timestamp: "2026-05-06 09:42:58", user: "admin@clinic.com", role: "admin", action: "ALTERAR_PERMISSAO", resource: "Permissões do perfil Médico", ip: "192.168.1.2", severity: "critical", success: true, details: "Permissão EXPORTAR_RELATORIO removida do perfil Médico" },
]

const AUTHORIZED_ROLES: Role[] = ["admin"]

export default async function AuditoriaPage() {
  const cookieStore = await cookies()
  const role = cookieStore.get("bioanalytics-role")?.value as Role | undefined

  // Defense-in-depth: middleware already blocks, but server component double-checks
  // so data is never serialized into the response for unauthorized requests.
  if (!role || !AUTHORIZED_ROLES.includes(role)) {
    redirect("/acesso-negado?from=/auditoria")
  }

  // In production: replace with a DB query here (Supabase, Prisma, etc.)
  const logs = AUDIT_LOGS

  return <AuditTable logs={logs} />
}

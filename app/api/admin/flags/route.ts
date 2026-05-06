import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { listFeatureFlags } from "@/lib/services/admin"

const isConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)

async function adminGuard() {
  const cookieStore = await cookies()
  return cookieStore.get("bioanalytics-role")?.value === "admin"
}

export async function GET() {
  if (!(await adminGuard())) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  if (!isConfigured) return NextResponse.json(MOCK_FLAGS)
  try {
    const data = await listFeatureFlags()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

const MOCK_FLAGS = [
  { id: "f1", key: "whatsapp_confirmacao",  label: "Confirmação via WhatsApp",  description: "Envia mensagem automática ao criar agendamento",     enabled: true,  updated_by: "sistema", updated_at: "2026-05-06T00:00:00Z" },
  { id: "f2", key: "whatsapp_cancelamento", label: "Cancelamento via WhatsApp", description: "Permite paciente cancelar via WhatsApp com CANCELAR", enabled: true,  updated_by: "sistema", updated_at: "2026-05-06T00:00:00Z" },
  { id: "f3", key: "realtime_agenda",       label: "Agenda em tempo real",      description: "Supabase Realtime na interface da secretária",         enabled: true,  updated_by: "sistema", updated_at: "2026-05-06T00:00:00Z" },
  { id: "f4", key: "auditoria_detalhada",   label: "Auditoria detalhada",       description: "Registra detalhes extras em ações críticas",           enabled: false, updated_by: "sistema", updated_at: "2026-05-06T00:00:00Z" },
  { id: "f5", key: "uat_modulo",            label: "Módulo UAT",                description: "Exibe módulo de feedback UAT para usuários piloto",    enabled: true,  updated_by: "sistema", updated_at: "2026-05-06T00:00:00Z" },
  { id: "f6", key: "modo_manutencao",       label: "Modo manutenção",           description: "Bloqueia acesso ao sistema para não-admins",           enabled: false, updated_by: "sistema", updated_at: "2026-05-06T00:00:00Z" },
  { id: "f7", key: "exportar_relatorio",    label: "Exportar relatórios",       description: "Permite exportação de relatórios em CSV/PDF",          enabled: false, updated_by: "admin@clinic.com", updated_at: "2026-05-06T00:00:00Z" },
  { id: "f8", key: "integracao_prontuario", label: "Integração prontuário",     description: "Conecta ao sistema de prontuário eletrônico externo",  enabled: false, updated_by: "sistema", updated_at: "2026-05-06T00:00:00Z" },
]

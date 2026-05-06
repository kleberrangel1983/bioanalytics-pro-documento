import type {
  FlowStepResult,
  ProfileTestResult,
  IncidentRecord,
  StagingRunReport,
  Permission,
  UserRole,
} from "./types"

// ─── Mock patient used throughout the flow (no real PII) ─────────────────────
export const MOCK_PATIENT = {
  id: "PAT-STAGING-001",
  name: "João Teste da Silva",
  cpf: "000.000.000-00",
  birthDate: "1985-03-15",
  phone: "(11) 90000-0000",
  email: "joao.teste@homologacao.local",
  healthInsurance: "PLANO-TESTE-HOM",
}

export const MOCK_DOCTOR = {
  id: "MED-STAGING-001",
  name: "Dra. Maria Homologação",
  crm: "CRM-HOM-99999",
  specialty: "Análise Clínica",
}

export const MOCK_APPOINTMENT = {
  id: "AGD-STAGING-001",
  patientId: MOCK_PATIENT.id,
  doctorId: MOCK_DOCTOR.id,
  scheduledAt: "2026-05-10T09:00:00-03:00",
  type: "Consulta de Rotina",
  location: "Sala de Homologação 01",
}

// ─── Permissions matrix per role ─────────────────────────────────────────────
export const ROLE_PERMISSIONS: Record<UserRole, Record<Permission, boolean>> = {
  admin: {
    view_patients: true,
    edit_patients: true,
    create_appointment: true,
    cancel_appointment: true,
    view_logs: true,
    export_data: true,
    manage_users: true,
    view_reports: true,
    triage_patient: true,
    confirm_appointment: true,
    view_own_appointments: true,
  },
  medico: {
    view_patients: true,
    edit_patients: true,
    create_appointment: false,
    cancel_appointment: true,
    view_logs: false,
    export_data: false,
    manage_users: false,
    view_reports: true,
    triage_patient: true,
    confirm_appointment: false,
    view_own_appointments: true,
  },
  secretaria: {
    view_patients: true,
    edit_patients: false,
    create_appointment: true,
    cancel_appointment: true,
    view_logs: false,
    export_data: false,
    manage_users: false,
    view_reports: false,
    triage_patient: false,
    confirm_appointment: true,
    view_own_appointments: true,
  },
  paciente: {
    view_patients: false,
    edit_patients: false,
    create_appointment: false,
    cancel_appointment: false,
    view_logs: false,
    export_data: false,
    manage_users: false,
    view_reports: false,
    triage_patient: false,
    confirm_appointment: false,
    view_own_appointments: true,
  },
  suporte: {
    view_patients: false,
    edit_patients: false,
    create_appointment: false,
    cancel_appointment: false,
    view_logs: true,
    export_data: false,
    manage_users: false,
    view_reports: true,
    triage_patient: false,
    confirm_appointment: false,
    view_own_appointments: false,
  },
}

// ─── Flow step definitions with assertions ────────────────────────────────────
export const FLOW_STEP_DEFINITIONS: Record<
  FlowStepResult["step"],
  { label: string; description: string; assertions: string[] }
> = {
  captacao: {
    label: "Captação",
    description: "Cadastro do paciente e dados iniciais",
    assertions: [
      "Formulário aceita dados mock sem erro de validação",
      "Registro persiste no banco de staging",
      "ID único gerado corretamente (PAT-STAGING-*)",
      "E-mail de boas-vindas enfileirado (mock SMTP)",
    ],
  },
  triagem: {
    label: "Triagem",
    description: "Classificação de risco e prioridade clínica",
    assertions: [
      "Médico visualiza fila de triagem do paciente",
      "Score de risco calculado (mock: nível VERDE)",
      "Status do paciente atualizado para 'Em Triagem'",
      "Histórico de triagem registrado no prontuário",
    ],
  },
  agendamento: {
    label: "Agendamento",
    description: "Criação de consulta na agenda do médico",
    assertions: [
      "Slot disponível retornado pela API de agenda",
      "Agendamento criado sem conflito (AGD-STAGING-*)",
      "Notificação enfileirada para paciente e médico",
      "Agenda do médico reflete o novo horário",
    ],
  },
  confirmacao: {
    label: "Confirmação",
    description: "Confirmação de presença pelo paciente/secretária",
    assertions: [
      "Link de confirmação funcional (token mock)",
      "Status muda de 'Agendado' para 'Confirmado'",
      "Secretária recebe aviso de confirmação",
      "Slot não pode ser realocado após confirmação",
    ],
  },
  log: {
    label: "Log de Auditoria",
    description: "Registro completo de todas as operações do fluxo",
    assertions: [
      "5 eventos registrados (captacao→triagem→agendamento→confirmacao→log)",
      "Cada evento contém user_id, timestamp e payload",
      "Logs imutáveis (tentativa de edição rejeitada)",
      "Admin consegue exportar relatório de auditoria",
    ],
  },
}

// ─── Rollback runbook ─────────────────────────────────────────────────────────
export const ROLLBACK_RUNBOOK: IncidentRecord = {
  id: "INC-STAGING-2026-W2",
  triggeredAt: "2026-05-06T14:30:00-03:00",
  type: "service_down",
  description:
    "Simulação: falha no serviço de agendamento — API retorna 503 por mais de 2 minutos",
  rollbackSteps: [
    {
      order: 1,
      action: "Acionar alerta de incidente no canal #ops-alertas",
      command: "# Slack: /incident create 'API Agendamento 503' P1",
      status: "pending",
    },
    {
      order: 2,
      action: "Verificar logs do serviço de agendamento",
      command: "vercel logs --project bioanalytics-pro --since 10m",
      status: "pending",
    },
    {
      order: 3,
      action: "Identificar último deploy saudável (git SHA)",
      command: "git log --oneline -5",
      status: "pending",
    },
    {
      order: 4,
      action: "Reverter para deploy anterior via Vercel",
      command:
        "vercel rollback --project bioanalytics-pro <DEPLOYMENT_ID>",
      status: "pending",
    },
    {
      order: 5,
      action: "Validar endpoint de saúde pós-rollback",
      command: "curl -f https://staging.bioanalytics.local/api/health",
      status: "pending",
    },
    {
      order: 6,
      action: "Re-executar smoke test do fluxo ponta-a-ponta",
      command: "pnpm test:staging --smoke",
      status: "pending",
    },
    {
      order: 7,
      action: "Registrar RCA (Root Cause Analysis) no Notion/Linear",
      status: "pending",
    },
    {
      order: 8,
      action: "Comunicar resolução no #ops-alertas e fechar incidente",
      status: "pending",
    },
  ],
}

// ─── Initial report skeleton ──────────────────────────────────────────────────
export function createInitialReport(): StagingRunReport {
  const steps: FlowStepResult["step"][] = [
    "captacao",
    "triagem",
    "agendamento",
    "confirmacao",
    "log",
  ]

  const roles: UserRole[] = ["admin", "medico", "secretaria", "paciente", "suporte"]
  const permissions = Object.keys(ROLE_PERMISSIONS.admin) as Permission[]

  return {
    runId: `RUN-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    startedAt: new Date().toISOString(),
    environment: "staging",
    overallStatus: "pending",
    flowResults: steps.map((step) => ({
      step,
      status: "pending",
      assertions: FLOW_STEP_DEFINITIONS[step].assertions.map((label) => ({
        label,
        passed: false,
      })),
    })),
    profileResults: roles.map((role) => ({
      role,
      status: "pending",
      permissions: Object.fromEntries(
        permissions.map((perm) => [
          perm,
          {
            expected: ROLE_PERMISSIONS[role][perm],
            actual: ROLE_PERMISSIONS[role][perm],
            passed: true,
          },
        ])
      ) as ProfileTestResult["permissions"],
    })),
  }
}

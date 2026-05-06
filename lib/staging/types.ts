export type FlowStep =
  | "captacao"
  | "triagem"
  | "agendamento"
  | "confirmacao"
  | "log"

export type StepStatus = "pending" | "running" | "passed" | "failed" | "skipped"

export type UserRole =
  | "admin"
  | "medico"
  | "secretaria"
  | "paciente"
  | "suporte"

export type Permission =
  | "view_patients"
  | "edit_patients"
  | "create_appointment"
  | "cancel_appointment"
  | "view_logs"
  | "export_data"
  | "manage_users"
  | "view_reports"
  | "triage_patient"
  | "confirm_appointment"
  | "view_own_appointments"

export interface FlowStepResult {
  step: FlowStep
  status: StepStatus
  startedAt?: string
  finishedAt?: string
  durationMs?: number
  assertions: AssertionResult[]
  error?: string
}

export interface AssertionResult {
  label: string
  passed: boolean
  detail?: string
}

export interface ProfileTestResult {
  role: UserRole
  status: StepStatus
  permissions: Record<Permission, { expected: boolean; actual: boolean; passed: boolean }>
  testedAt?: string
  notes?: string
}

export interface IncidentRecord {
  id: string
  triggeredAt: string
  type: "service_down" | "data_loss" | "auth_failure" | "performance"
  description: string
  rollbackSteps: RollbackStep[]
  resolvedAt?: string
  totalResponseMs?: number
}

export interface RollbackStep {
  order: number
  action: string
  command?: string
  status: "pending" | "done" | "failed"
  durationMs?: number
}

export interface StagingRunReport {
  runId: string
  startedAt: string
  finishedAt?: string
  environment: string
  flowResults: FlowStepResult[]
  profileResults: ProfileTestResult[]
  incident?: IncidentRecord
  overallStatus: "pending" | "passed" | "failed" | "partial"
}

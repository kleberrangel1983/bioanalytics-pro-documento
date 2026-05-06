export type CheckCategory =
  | "staging"
  | "carga"
  | "flags"
  | "seguranca"
  | "infra"
  | "comunicacao"

export type CheckStatus = "pending" | "ok" | "fail" | "na"

export interface CheckItem {
  id: string
  category: CheckCategory
  label: string
  description: string
  critical: boolean       // se false → blocker de go-live
  link?: string           // rota interna de evidência
  status: CheckStatus
  evidence?: string       // texto livre preenchido pelo executor
  checkedAt?: string
  checkedBy?: string
}

export interface GoLiveReport {
  runId: string
  startedAt: string
  finishedAt?: string
  checkedBy: string
  items: CheckItem[]
  blockers: string[]
  approved: boolean
}

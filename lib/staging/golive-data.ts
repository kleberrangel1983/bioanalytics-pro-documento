import type { CheckItem, CheckCategory } from "./golive-types"

export const CATEGORY_META: Record<CheckCategory, { label: string; color: string }> = {
  staging:      { label: "Homologação",       color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  carga:        { label: "Performance",        color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
  flags:        { label: "Feature Flags",      color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  seguranca:    { label: "Segurança / LGPD",   color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
  infra:        { label: "Infraestrutura",     color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" },
  comunicacao:  { label: "Comunicação",        color: "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200" },
}

export const CHECKLIST: CheckItem[] = [
  // ── Homologação ────────────────────────────────────────────────────────────
  {
    id: "e2e-flow",
    category: "staging",
    label: "Fluxo E2E aprovado em staging",
    description: "Captação → triagem → agendamento → confirmação → log sem falhas (Semana 2).",
    critical: true,
    link: "/staging",
    status: "pending",
  },
  {
    id: "profile-matrix",
    category: "staging",
    label: "Matriz de perfis validada",
    description: "Todos os 5 perfis (admin, médico, secretária, paciente, suporte) com permissões corretas.",
    critical: true,
    link: "/staging/perfis",
    status: "pending",
  },
  {
    id: "rollback-drill",
    category: "staging",
    label: "Simulação de rollback executada",
    description: "Runbook de 8 passos concluído em staging com tempo total < 15 min.",
    critical: true,
    link: "/staging/rollback",
    status: "pending",
  },
  // ── Performance ────────────────────────────────────────────────────────────
  {
    id: "load-smoke",
    category: "carga",
    label: "Smoke test aprovado",
    description: "5 VUs · 30s · P95 < 800ms · erros < 1%.",
    critical: true,
    link: "/staging/carga",
    status: "pending",
  },
  {
    id: "load-normal",
    category: "carga",
    label: "Carga normal aprovada",
    description: "50 VUs · 120s · P95 < 1.000ms · erros < 1%.",
    critical: true,
    link: "/staging/carga",
    status: "pending",
  },
  {
    id: "load-spike",
    category: "carga",
    label: "Pico de acesso aprovado",
    description: "200 VUs · 90s · P95 < 2.000ms · erros < 2%.",
    critical: true,
    link: "/staging/carga",
    status: "pending",
  },
  {
    id: "load-stress",
    category: "carga",
    label: "Stress test documentado",
    description: "Ponto de ruptura identificado e documentado — não é blocker se acima de 500 VUs.",
    critical: false,
    link: "/staging/carga",
    status: "pending",
  },
  // ── Feature Flags ──────────────────────────────────────────────────────────
  {
    id: "flags-staging-100",
    category: "flags",
    label: "Todas as flags ativas a 100% em staging",
    description: "Nenhuma flag deve estar desabilitada no ambiente de staging para go-live.",
    critical: true,
    link: "/staging/flags",
    status: "pending",
  },
  {
    id: "flags-prod-canary",
    category: "flags",
    label: "Flags de produção configuradas para canary",
    description: "Novas flags iniciando com rolloutPct ≤ 20% em produção.",
    critical: true,
    link: "/staging/flags",
    status: "pending",
  },
  {
    id: "flags-rollback",
    category: "flags",
    label: "Rollback via flag testado",
    description: "Setar rolloutPct = 0 em produção remove o acesso em < 30s.",
    critical: true,
    link: "/staging/flags",
    status: "pending",
  },
  // ── Segurança / LGPD ───────────────────────────────────────────────────────
  {
    id: "sec-no-pii-staging",
    category: "seguranca",
    label: "Staging sem dados reais (PII)",
    description: "Confirmado que nenhum dado de paciente real está no banco de staging.",
    critical: true,
    status: "pending",
  },
  {
    id: "sec-logs-immutable",
    category: "seguranca",
    label: "Logs de auditoria imutáveis",
    description: "Tentativa de edição de log retorna 403. Evidência registrada no fluxo E2E.",
    critical: true,
    link: "/staging",
    status: "pending",
  },
  {
    id: "sec-https",
    category: "seguranca",
    label: "HTTPS forçado em produção",
    description: "Redirect HTTP → HTTPS configurado no Vercel. HSTS ativo.",
    critical: true,
    status: "pending",
  },
  {
    id: "sec-auth",
    category: "seguranca",
    label: "Autenticação e sessão revisadas",
    description: "Tokens com expiração adequada. Refresh token rotation ativo.",
    critical: true,
    status: "pending",
  },
  // ── Infraestrutura ─────────────────────────────────────────────────────────
  {
    id: "infra-env-vars",
    category: "infra",
    label: "Variáveis de ambiente de produção configuradas",
    description: "DATABASE_URL, API keys, SMTP e segredos definidos no Vercel (produção).",
    critical: true,
    status: "pending",
  },
  {
    id: "infra-backup",
    category: "infra",
    label: "Backup automático do banco configurado",
    description: "Snapshots diários habilitados com retenção de 7 dias.",
    critical: true,
    status: "pending",
  },
  {
    id: "infra-health",
    category: "infra",
    label: "Health check de produção respondendo",
    description: "/api/health retorna HTTP 200 com payload {status: 'ok'}.",
    critical: true,
    status: "pending",
  },
  {
    id: "infra-domain",
    category: "infra",
    label: "Domínio de produção configurado",
    description: "DNS apontando para Vercel. Certificado SSL ativo.",
    critical: false,
    status: "pending",
  },
  // ── Comunicação ────────────────────────────────────────────────────────────
  {
    id: "comm-stakeholders",
    category: "comunicacao",
    label: "Stakeholders notificados da data de go-live",
    description: "E-mail ou mensagem enviada ao time com data, horário e contato de suporte.",
    critical: false,
    status: "pending",
  },
  {
    id: "comm-oncall",
    category: "comunicacao",
    label: "Engenheiro de plantão definido",
    description: "Responsável pelo on-call nas primeiras 48h após go-live identificado e disponível.",
    critical: true,
    status: "pending",
  },
  {
    id: "comm-rollback-plan",
    category: "comunicacao",
    label: "Plano de rollback comunicado ao time",
    description: "Procedimento de rollback documentado e compartilhado com todos os envolvidos.",
    critical: true,
    link: "/staging/rollback",
    status: "pending",
  },
]

export function computeBlockers(items: CheckItem[]): string[] {
  return items
    .filter((i) => i.critical && i.status === "fail")
    .map((i) => i.label)
}

export function isApproved(items: CheckItem[]): boolean {
  return items
    .filter((i) => i.critical)
    .every((i) => i.status === "ok" || i.status === "na")
}

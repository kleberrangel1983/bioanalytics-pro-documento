import type { FeatureFlag, FlagState, FlagEvaluationResult, Environment } from "./types"
import type { UserRole } from "@/lib/staging/types"

// ─── Flag catalogue ───────────────────────────────────────────────────────────

export const ALL_FLAGS: FeatureFlag[] = [
  {
    id: "novo-dashboard-analitico",
    name: "Novo Dashboard Analítico",
    description: "Substitui a tela de relatórios legacy pelo novo dashboard com gráficos interativos (Recharts).",
    category: "ui",
    owner: "squad-produto",
    createdAt: "2026-05-01",
    tags: ["dashboard", "recharts", "ui"],
    targeting: [
      { type: "percentage", value: 50 },
      { type: "roles", allowedRoles: ["admin", "medico"] },
    ],
    environments: {
      staging: { enabled: true, rolloutPct: 100, roleOverrides: {} },
      production: { enabled: true, rolloutPct: 20, roleOverrides: { admin: true, suporte: false } },
    },
  },
  {
    id: "triagem-ia",
    name: "Triagem por IA",
    description: "Sugestão automática de score de risco clínico via modelo de ML no fluxo de triagem.",
    category: "experimental",
    owner: "squad-clinico",
    createdAt: "2026-05-03",
    tags: ["ia", "triagem", "ml"],
    targeting: [
      { type: "percentage", value: 10 },
      { type: "roles", allowedRoles: ["medico"] },
    ],
    environments: {
      staging: { enabled: true, rolloutPct: 100, roleOverrides: { medico: true } },
      production: { enabled: false, rolloutPct: 0, roleOverrides: {} },
    },
  },
  {
    id: "agendamento-online",
    name: "Agendamento Online pelo Paciente",
    description: "Permite que pacientes agendem consultas diretamente pelo portal, sem intermediação da secretária.",
    category: "rollout",
    owner: "squad-produto",
    createdAt: "2026-04-28",
    tags: ["agendamento", "paciente", "self-service"],
    targeting: [
      { type: "percentage", value: 30 },
      { type: "roles", allowedRoles: ["paciente"] },
    ],
    environments: {
      staging: { enabled: true, rolloutPct: 100, roleOverrides: {} },
      production: { enabled: true, rolloutPct: 30, roleOverrides: { paciente: true, admin: true } },
    },
  },
  {
    id: "exportacao-pdf-avancada",
    name: "Exportação PDF Avançada",
    description: "Relatórios de auditoria e prontuários em PDF com assinatura digital e cabeçalho personalizado.",
    category: "api",
    owner: "squad-engenharia",
    createdAt: "2026-05-02",
    tags: ["pdf", "export", "assinatura"],
    targeting: [
      { type: "percentage", value: 100 },
      { type: "roles", allowedRoles: ["admin", "medico"] },
    ],
    environments: {
      staging: { enabled: true, rolloutPct: 100, roleOverrides: {} },
      production: { enabled: true, rolloutPct: 100, roleOverrides: { suporte: false, paciente: false } },
    },
  },
  {
    id: "notificacoes-whatsapp",
    name: "Notificações via WhatsApp",
    description: "Envio de lembretes de consulta via WhatsApp Business API como alternativa ao SMS.",
    category: "rollout",
    owner: "squad-produto",
    createdAt: "2026-05-05",
    tags: ["whatsapp", "notificacoes", "comunicacao"],
    targeting: [
      { type: "percentage", value: 5 },
    ],
    environments: {
      staging: { enabled: true, rolloutPct: 100, roleOverrides: {} },
      production: { enabled: true, rolloutPct: 5, roleOverrides: {} },
    },
  },
  {
    id: "modo-offline",
    name: "Modo Offline (PWA)",
    description: "Suporte a operação offline com sincronização automática ao reconectar.",
    category: "experimental",
    owner: "squad-engenharia",
    createdAt: "2026-05-06",
    tags: ["pwa", "offline", "sync"],
    targeting: [
      { type: "percentage", value: 0 },
    ],
    environments: {
      staging: { enabled: false, rolloutPct: 0, roleOverrides: {} },
      production: { enabled: false, rolloutPct: 0, roleOverrides: {} },
    },
  },
]

// ─── Evaluation engine ────────────────────────────────────────────────────────

export function evaluateFlag(
  flag: FeatureFlag,
  userId: string,
  role: UserRole,
  env: Environment
): FlagEvaluationResult {
  const state: FlagState = flag.environments[env]

  if (!state.enabled) {
    return { flagId: flag.id, userId, role, environment: env, enabled: false, reason: "flag_disabled", rolloutPct: 0 }
  }

  // role override takes precedence over everything else
  if (state.roleOverrides[role] === true) {
    return { flagId: flag.id, userId, role, environment: env, enabled: true, reason: "role_override_on", rolloutPct: state.rolloutPct }
  }
  if (state.roleOverrides[role] === false) {
    return { flagId: flag.id, userId, role, environment: env, enabled: false, reason: "role_override_off", rolloutPct: state.rolloutPct }
  }

  // enforce allowedRoles targeting rules before rollout evaluation
  const roleRule = flag.targeting.find((r): r is import("./types").RoleRule => r.type === "roles")
  if (roleRule && !roleRule.allowedRoles.includes(role)) {
    return { flagId: flag.id, userId, role, environment: env, enabled: false, reason: "role_not_targeted", rolloutPct: state.rolloutPct }
  }

  // deterministic rollout based on userId hash
  const hash = userId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const bucket = hash % 100
  const inRollout = bucket < state.rolloutPct

  return {
    flagId: flag.id,
    userId,
    role,
    environment: env,
    enabled: inRollout,
    reason: inRollout ? "rollout_in" : "rollout_out",
    rolloutPct: state.rolloutPct,
  }
}

export function evaluateAll(
  userId: string,
  role: UserRole,
  env: Environment
): FlagEvaluationResult[] {
  return ALL_FLAGS.map((flag) => evaluateFlag(flag, userId, role, env))
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const CATEGORY_LABELS: Record<FeatureFlag["category"], string> = {
  ui: "Interface",
  api: "API / Backend",
  experimental: "Experimental",
  rollout: "Rollout Gradual",
}

export const CATEGORY_COLORS: Record<FeatureFlag["category"], string> = {
  ui: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  api: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  experimental: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  rollout: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
}

export const REASON_LABELS: Record<FlagEvaluationResult["reason"], string> = {
  flag_disabled: "Flag desabilitada globalmente",
  role_not_targeted: "Perfil não incluído no targeting da flag",
  role_override_on: "Override de perfil: ativado",
  role_override_off: "Override de perfil: desativado",
  rollout_in: "Incluído no rollout",
  rollout_out: "Fora do rollout",
}

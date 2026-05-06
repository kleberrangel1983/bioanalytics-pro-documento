"use client"

import { useState, useMemo, useEffect } from "react"
import {
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Zap,
  AlertTriangle,
  Info,
  Users,
  Globe,
  FlaskConical,
  LayoutDashboard,
  Server,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ALL_FLAGS,
  evaluateAll,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  REASON_LABELS,
} from "@/lib/feature-flags/flags"
import type { FeatureFlag, Environment, FlagState } from "@/lib/feature-flags/types"
import type { UserRole } from "@/lib/staging/types"

// ─── constants ────────────────────────────────────────────────────────────────

const ROLES: { key: UserRole; label: string }[] = [
  { key: "admin", label: "Admin" },
  { key: "medico", label: "Médico" },
  { key: "secretaria", label: "Secretária" },
  { key: "paciente", label: "Paciente" },
  { key: "suporte", label: "Suporte" },
]

const SAMPLE_USERS: Record<UserRole, string[]> = {
  admin: ["usr_admin_001", "usr_admin_002"],
  medico: ["usr_med_017", "usr_med_043"],
  secretaria: ["usr_sec_008", "usr_sec_022"],
  paciente: ["usr_pat_099", "usr_pat_134"],
  suporte: ["usr_sup_003", "usr_sup_011"],
}

const CATEGORY_ICONS: Record<FeatureFlag["category"], React.ReactNode> = {
  ui: <LayoutDashboard size={13} />,
  api: <Server size={13} />,
  experimental: <FlaskConical size={13} />,
  rollout: <Globe size={13} />,
}

// ─── sub-components ──────────────────────────────────────────────────────────

function RolloutBar({ pct, env }: { pct: number; env: Environment }) {
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-xs text-slate-500">
        <span>{env === "production" ? "Produção" : "Staging"}</span>
        <span className="font-mono font-semibold">{pct}%</span>
      </div>
      <Progress
        value={pct}
        className={`h-1.5 ${env === "production" ? "" : "opacity-60"}`}
      />
    </div>
  )
}

function FlagCard({
  flag,
  env,
  previewRole,
  previewUserId,
}: {
  flag: FeatureFlag
  env: Environment
  previewRole: UserRole
  previewUserId: string
}) {
  const [expanded, setExpanded] = useState(false)
  const state: FlagState = flag.environments[env]

  const evalResult = useMemo(
    () =>
      evaluateAll(previewUserId, previewRole, env).find((r) => r.flagId === flag.id),
    [flag.id, env, previewRole, previewUserId]
  )

  const allRoleEvals = useMemo(
    () =>
      ROLES.map((r) => ({
        role: r,
        result: evaluateAll(SAMPLE_USERS[r.key][0], r.key, env).find(
          (res) => res.flagId === flag.id
        ),
      })),
    [flag.id, env]
  )

  return (
    <div
      className={`rounded-lg border transition-colors ${
        state.enabled
          ? "border-slate-200 dark:border-slate-700"
          : "border-slate-100 dark:border-slate-800 opacity-60"
      } bg-white dark:bg-slate-900`}
    >
      {/* header */}
      <div
        className="flex items-start gap-3 p-4 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-slate-800 dark:text-slate-200">{flag.name}</p>
            <span
              className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[flag.category]}`}
            >
              {CATEGORY_ICONS[flag.category]} {CATEGORY_LABELS[flag.category]}
            </span>
          </div>
          <p className="text-sm text-slate-500">{flag.description}</p>
          <p className="text-xs text-slate-400 font-mono">{flag.id}</p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {/* preview result for selected role */}
          {evalResult?.enabled ? (
            <CheckCircle2 size={20} className="text-emerald-500" />
          ) : (
            <XCircle size={20} className="text-slate-300 dark:text-slate-600" />
          )}
          {/* global state badge */}
          {state.enabled ? (
            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs">Ativo</Badge>
          ) : (
            <Badge variant="secondary" className="text-xs">Inativo</Badge>
          )}
        </div>
      </div>

      {/* rollout bars */}
      <div className="px-4 pb-3 space-y-1">
        <RolloutBar pct={flag.environments.staging.rolloutPct} env="staging" />
        <RolloutBar pct={flag.environments.production.rolloutPct} env="production" />
      </div>

      {/* expanded details */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-4 space-y-4">
          {/* preview result */}
          <div className="rounded-md bg-slate-50 dark:bg-slate-800 p-3 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Avaliação — {ROLES.find((r) => r.key === previewRole)?.label} / {previewUserId}
            </p>
            <div className="flex items-center gap-2">
              {evalResult?.enabled ? (
                <CheckCircle2 size={16} className="text-emerald-500" />
              ) : (
                <XCircle size={16} className="text-red-400" />
              )}
              <span className="text-sm text-slate-700 dark:text-slate-300">
                {evalResult ? REASON_LABELS[evalResult.reason] : "—"}
              </span>
            </div>
          </div>

          {/* per-role matrix */}
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Visibilidade por Perfil ({env === "production" ? "Produção" : "Staging"})
            </p>
            <div className="flex flex-wrap gap-2">
              {allRoleEvals.map(({ role, result }) => (
                <span
                  key={role.key}
                  className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${
                    result?.enabled
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                      : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  {result?.enabled ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                  {role.label}
                </span>
              ))}
            </div>
          </div>

          {/* role overrides */}
          {Object.keys(state.roleOverrides).length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Overrides de Perfil
              </p>
              <div className="flex flex-wrap gap-2">
                {(Object.entries(state.roleOverrides) as [UserRole, boolean][]).map(([role, val]) => (
                  <span
                    key={role}
                    className={`text-xs px-2 py-0.5 rounded font-mono ${
                      val
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {role}: {val ? "✓ forçado ON" : "✗ forçado OFF"}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* metadata */}
          <div className="flex gap-4 text-xs text-slate-400 flex-wrap">
            <span>Owner: {flag.owner}</span>
            <span>Criado: {flag.createdAt}</span>
            {flag.tags.map((t) => (
              <span key={t} className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── page ─────────────────────────────────────────────────────────────────────

// ─── merge DB flag states into static flag definitions ───────────────────────

type DbFlagRow = {
  flag_id: string
  environment: Environment
  enabled: boolean
  rollout_pct: number
  role_overrides: Partial<Record<UserRole, boolean>>
}

function mergeDbState(flags: FeatureFlag[], rows: DbFlagRow[]): FeatureFlag[] {
  if (rows.length === 0) return flags
  const lookup = new Map<string, DbFlagRow>()
  rows.forEach((r) => lookup.set(`${r.flag_id}::${r.environment}`, r))

  return flags.map((flag) => {
    const staging    = lookup.get(`${flag.id}::staging`)
    const production = lookup.get(`${flag.id}::production`)
    return {
      ...flag,
      environments: {
        staging: staging
          ? { enabled: staging.enabled, rolloutPct: staging.rollout_pct, roleOverrides: staging.role_overrides }
          : flag.environments.staging,
        production: production
          ? { enabled: production.enabled, rolloutPct: production.rollout_pct, roleOverrides: production.role_overrides }
          : flag.environments.production,
      },
    }
  })
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function FlagsPage() {
  const [env, setEnv] = useState<Environment>("production")
  const [previewRole, setPreviewRole] = useState<UserRole>("admin")
  const [previewUserId, setPreviewUserId] = useState(SAMPLE_USERS.admin[0])
  const [categoryFilter, setCategoryFilter] = useState<FeatureFlag["category"] | "all">("all")
  const [liveFlags, setLiveFlags] = useState<FeatureFlag[]>(ALL_FLAGS)
  const [dataSource, setDataSource] = useState<"api" | "mock">("mock")

  // Fetch both environments from DB and merge with static definitions
  useEffect(() => {
    async function loadFlags() {
      try {
        const [sRes, pRes] = await Promise.all([
          fetch("/api/feature-flags?env=staging"),
          fetch("/api/feature-flags?env=production"),
        ])
        if (!sRes.ok || !pRes.ok) return
        const [sData, pData] = await Promise.all([sRes.json(), pRes.json()])
        const rows: DbFlagRow[] = [...(sData.data ?? []), ...(pData.data ?? [])]
        if (rows.length === 0) return
        setLiveFlags(mergeDbState(ALL_FLAGS, rows))
        setDataSource("api")
      } catch {
        // API unavailable — keep static definitions
      }
    }
    loadFlags()
  }, [])

  const filteredFlags = useMemo(
    () =>
      categoryFilter === "all"
        ? liveFlags
        : liveFlags.filter((f) => f.category === categoryFilter),
    [categoryFilter, liveFlags]
  )

  const enabledInEnv = liveFlags.filter((f) => f.environments[env].enabled).length
  const activeForRole = useMemo(
    () =>
      evaluateAll(previewUserId, previewRole, env, liveFlags).filter((r) => r.enabled).length,
    [env, previewRole, previewUserId, liveFlags]
  )

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <a href="/staging" className="flex items-center gap-1">
            <ChevronLeft size={16} /> Voltar
          </a>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Semana 4 — Feature Flags & Rollout
          </h1>
          <p className="text-slate-500 text-sm">
            Toggles por perfil · Rollout gradual · Deploy em produção controlado
          </p>
        </div>
      </div>

      {/* env + preview controls */}
      <section className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-4">
        <div className="flex flex-wrap gap-6">
          {/* environment toggle */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Ambiente</p>
            <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden text-sm">
              {(["staging", "production"] as Environment[]).map((e) => (
                <button
                  key={e}
                  onClick={() => setEnv(e)}
                  className={`px-4 py-1.5 font-medium transition-colors ${
                    env === e
                      ? e === "production"
                        ? "bg-red-600 text-white"
                        : "bg-amber-500 text-white"
                      : "bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {e === "production" ? "Produção" : "Staging"}
                </button>
              ))}
            </div>
          </div>

          {/* role preview */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Simular Perfil
            </p>
            <div className="flex gap-1.5 flex-wrap">
              {ROLES.map((r) => (
                <button
                  key={r.key}
                  onClick={() => {
                    setPreviewRole(r.key)
                    setPreviewUserId(SAMPLE_USERS[r.key][0])
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    previewRole === r.key
                      ? "bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 border-transparent"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* user selector */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              User ID (amostra)
            </p>
            <div className="flex gap-1.5">
              {SAMPLE_USERS[previewRole].map((uid) => (
                <button
                  key={uid}
                  onClick={() => setPreviewUserId(uid)}
                  className={`px-2 py-1 rounded text-xs font-mono border transition-colors ${
                    previewUserId === uid
                      ? "bg-blue-600 text-white border-transparent"
                      : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400"
                  }`}
                >
                  {uid}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* summary stats */}
        <div className="flex gap-6 text-sm pt-1 border-t border-slate-100 dark:border-slate-800">
          <span className="text-slate-500">
            Flags ativas no {env === "production" ? "produção" : "staging"}:{" "}
            <strong className="text-slate-800 dark:text-slate-200">{enabledInEnv}/{liveFlags.length}</strong>
          </span>
          <span className="text-slate-500">
            Visíveis para <strong>{ROLES.find((r) => r.key === previewRole)?.label}</strong>{" "}
            <span className="font-mono text-xs text-slate-400">({previewUserId})</span>:{" "}
            <strong className="text-emerald-600">{activeForRole}/{liveFlags.length}</strong>
          </span>
          <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${
            dataSource === "api"
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
              : "bg-slate-100 text-slate-500 dark:bg-slate-800"
          }`}>
            {dataSource === "api" ? "API real" : "mock"}
          </span>
        </div>
      </section>

      {/* category filter */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "ui", "api", "experimental", "rollout"] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              categoryFilter === cat
                ? "bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 border-transparent"
                : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400"
            }`}
          >
            {cat === "all" ? "Todas" : CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* flag cards */}
      <section className="space-y-3">
        {filteredFlags.map((flag) => (
          <FlagCard
            key={flag.id}
            flag={flag}
            env={env}
            previewRole={previewRole}
            previewUserId={previewUserId}
          />
        ))}
      </section>

      {/* rollout guidance */}
      <section className="rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950 p-4 space-y-2">
        <p className="font-semibold text-blue-800 dark:text-blue-200 flex items-center gap-2">
          <Info size={16} /> Estratégia de Rollout Gradual
        </p>
        <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
          <li>Habilitar flag 100% em <strong>staging</strong> e executar fluxo E2E</li>
          <li>Ativar em produção com <strong>5% rollout</strong> — monitorar logs por 24h</li>
          <li>Elevar para <strong>20% → 50% → 100%</strong> com janelas de 48h</li>
          <li>Usar <strong>role overrides</strong> para expor ao time interno antes do rollout público</li>
          <li>Em caso de anomalia: setar rolloutPct = 0 (rollback instantâneo)</li>
        </ol>
      </section>
    </main>
  )
}

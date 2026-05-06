export type ScenarioId = "smoke" | "carga" | "pico" | "stress"

export interface LoadScenario {
  id: ScenarioId
  label: string
  description: string
  virtualUsers: number
  durationSeconds: number
  rampUpSeconds: number
  endpoints: EndpointConfig[]
  slaTargets: SLATargets
}

export interface EndpointConfig {
  path: string
  method: "GET" | "POST" | "PUT"
  weight: number // relative request distribution (0–1)
  label: string
}

export interface SLATargets {
  p95LatencyMs: number
  errorRatePct: number
  minRps: number
}

export interface MetricSnapshot {
  ts: number          // seconds from test start
  rps: number
  p50Ms: number
  p95Ms: number
  p99Ms: number
  errorRatePct: number
  activeUsers: number
}

export interface EndpointSummary {
  path: string
  label: string
  requests: number
  errorsCount: number
  p50Ms: number
  p95Ms: number
  p99Ms: number
  passed: boolean
}

export interface LoadTestReport {
  runId: string
  scenario: LoadScenario
  startedAt: string
  finishedAt?: string
  status: "idle" | "running" | "passed" | "failed" | "aborted"
  snapshots: MetricSnapshot[]
  endpointSummaries: EndpointSummary[]
  peakRps: number
  peakUsers: number
  avgP95Ms: number
  totalRequests: number
  totalErrors: number
  overallErrorPct: number
  slaBreaches: string[]
}

// ─── Scenarios ────────────────────────────────────────────────────────────────

export const ENDPOINTS: EndpointConfig[] = [
  { path: "/api/patients", method: "GET", weight: 0.3, label: "Listar Pacientes" },
  { path: "/api/appointments", method: "GET", weight: 0.25, label: "Listar Agendamentos" },
  { path: "/api/appointments", method: "POST", weight: 0.2, label: "Criar Agendamento" },
  { path: "/api/triage", method: "POST", weight: 0.15, label: "Triagem" },
  { path: "/api/logs", method: "GET", weight: 0.1, label: "Logs de Auditoria" },
]

export const SCENARIOS: Record<ScenarioId, LoadScenario> = {
  smoke: {
    id: "smoke",
    label: "Smoke",
    description: "Validação básica — mínimo de usuários para confirmar que o sistema está funcional",
    virtualUsers: 5,
    durationSeconds: 30,
    rampUpSeconds: 5,
    endpoints: ENDPOINTS,
    slaTargets: { p95LatencyMs: 800, errorRatePct: 1, minRps: 2 },
  },
  carga: {
    id: "carga",
    label: "Carga Normal",
    description: "Carga esperada em horário de pico diário — 50 usuários simultâneos",
    virtualUsers: 50,
    durationSeconds: 120,
    rampUpSeconds: 20,
    endpoints: ENDPOINTS,
    slaTargets: { p95LatencyMs: 1000, errorRatePct: 1, minRps: 20 },
  },
  pico: {
    id: "pico",
    label: "Pico de Acesso",
    description: "Simulação de pico repentino — 200 usuários em ramp-up de 10s",
    virtualUsers: 200,
    durationSeconds: 90,
    rampUpSeconds: 10,
    endpoints: ENDPOINTS,
    slaTargets: { p95LatencyMs: 2000, errorRatePct: 2, minRps: 60 },
  },
  stress: {
    id: "stress",
    label: "Stress",
    description: "Ramp-up agressivo até 500 usuários — identifica ponto de ruptura",
    virtualUsers: 500,
    durationSeconds: 120,
    rampUpSeconds: 30,
    endpoints: ENDPOINTS,
    slaTargets: { p95LatencyMs: 3000, errorRatePct: 5, minRps: 100 },
  },
}

// ─── Simulation engine ────────────────────────────────────────────────────────

function gaussianRandom(mean: number, stdDev: number): number {
  const u = 1 - Math.random()
  const v = Math.random()
  return mean + stdDev * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val))
}

function activeUsersAt(t: number, scenario: LoadScenario): number {
  if (t <= scenario.rampUpSeconds) {
    return Math.round((t / scenario.rampUpSeconds) * scenario.virtualUsers)
  }
  return scenario.virtualUsers
}

export function generateSnapshot(
  t: number,
  scenario: LoadScenario,
  prevSnapshot?: MetricSnapshot
): MetricSnapshot {
  const users = activeUsersAt(t, scenario)
  const loadFactor = users / scenario.virtualUsers

  // Base latency degrades under load
  const baseP50 = 120 + loadFactor * 600
  const jitter = prevSnapshot ? (Math.random() - 0.5) * 80 : 0

  const p50 = clamp(gaussianRandom(baseP50 + jitter, 30), 80, 4000)
  const p95 = clamp(p50 * (1.8 + loadFactor * 0.8), p50 + 50, 8000)
  const p99 = clamp(p95 * (1.3 + loadFactor * 0.4), p95 + 50, 12000)

  // Error rate spikes under heavy load
  const baseErrorPct =
    loadFactor < 0.7
      ? Math.random() * 0.3
      : loadFactor < 0.9
      ? Math.random() * 1.5
      : Math.random() * 6

  const rps = clamp(
    gaussianRandom(users * 1.2, users * 0.15),
    1,
    users * 2
  )

  return {
    ts: t,
    rps: Math.round(rps * 10) / 10,
    p50Ms: Math.round(p50),
    p95Ms: Math.round(p95),
    p99Ms: Math.round(p99),
    errorRatePct: Math.round(baseErrorPct * 10) / 10,
    activeUsers: users,
  }
}

export function buildEndpointSummaries(
  snapshots: MetricSnapshot[],
  scenario: LoadScenario
): EndpointSummary[] {
  if (snapshots.length === 0) return []
  const totalRequests = snapshots.reduce((s, snap) => s + snap.rps * 2, 0)

  return scenario.endpoints.map((ep) => {
    const epRequests = Math.round(totalRequests * ep.weight)
    const avgLoad = snapshots.reduce((s, snap) => s + snap.activeUsers, 0) / snapshots.length / scenario.virtualUsers
    const p50 = Math.round(120 + avgLoad * 500 + Math.random() * 60)
    const p95 = Math.round(p50 * 1.9)
    const p99 = Math.round(p95 * 1.35)
    const errorPct = avgLoad < 0.8 ? Math.random() * 0.5 : Math.random() * 3
    const errors = Math.round(epRequests * errorPct / 100)

    return {
      path: ep.path,
      label: ep.label,
      requests: epRequests,
      errorsCount: errors,
      p50Ms: p50,
      p95Ms: p95,
      p99Ms: p99,
      passed: p95 <= scenario.slaTargets.p95LatencyMs && errorPct <= scenario.slaTargets.errorRatePct,
    }
  })
}

export function computeSlaBreaches(
  snapshots: MetricSnapshot[],
  endpointSummaries: EndpointSummary[],
  scenario: LoadScenario
): string[] {
  if (snapshots.length === 0) return []
  const breaches: string[] = []
  const avgP95 = snapshots.reduce((s, snap) => s + snap.p95Ms, 0) / snapshots.length
  const maxErrorPct = Math.max(...snapshots.map((s) => s.errorRatePct))
  const avgRps = snapshots.reduce((s, snap) => s + snap.rps, 0) / snapshots.length

  if (avgP95 > scenario.slaTargets.p95LatencyMs) {
    breaches.push(`P95 médio (${Math.round(avgP95)}ms) excede SLA (${scenario.slaTargets.p95LatencyMs}ms)`)
  }
  if (maxErrorPct > scenario.slaTargets.errorRatePct) {
    breaches.push(`Taxa de erros máxima (${maxErrorPct}%) excede SLA (${scenario.slaTargets.errorRatePct}%)`)
  }
  if (avgRps < scenario.slaTargets.minRps) {
    breaches.push(`Throughput médio (${Math.round(avgRps)} RPS) abaixo do SLA (${scenario.slaTargets.minRps} RPS)`)
  }
  endpointSummaries.filter((e) => !e.passed).forEach((e) => {
    breaches.push(`Endpoint "${e.label}" fora do SLA de latência ou erros`)
  })

  return breaches
}

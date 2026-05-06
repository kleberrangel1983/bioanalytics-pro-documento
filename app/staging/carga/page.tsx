"use client"

import { useState, useCallback, useRef } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import {
  Play,
  Square,
  RotateCcw,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Zap,
  Users,
  Activity,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  SCENARIOS,
  generateSnapshot,
  buildEndpointSummaries,
  computeSlaBreaches,
} from "@/lib/staging/load-test"
import type {
  ScenarioId,
  LoadTestReport,
  MetricSnapshot,
} from "@/lib/staging/load-test"

// ─── constants ────────────────────────────────────────────────────────────────

const TICK_INTERVAL_MS = 500   // wall-clock ms per simulated 2s tick
const SIM_SECONDS_PER_TICK = 2

const SCENARIO_COLORS: Record<ScenarioId, string> = {
  smoke: "bg-green-100 text-green-800 border-green-300",
  carga: "bg-blue-100 text-blue-800 border-blue-300",
  pico: "bg-amber-100 text-amber-800 border-amber-300",
  stress: "bg-red-100 text-red-800 border-red-300",
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function metricCard(
  label: string,
  value: string | number,
  unit: string,
  icon: React.ReactNode,
  highlight?: "ok" | "warn" | "bad"
) {
  const colorMap = {
    ok: "text-emerald-600 dark:text-emerald-400",
    warn: "text-amber-500 dark:text-amber-400",
    bad: "text-red-500 dark:text-red-400",
    undefined: "text-slate-800 dark:text-slate-200",
  }
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-1">
      <div className="flex items-center gap-2 text-xs text-slate-500">{icon} {label}</div>
      <p className={`text-2xl font-bold font-mono ${colorMap[highlight ?? "undefined"]}`}>
        {value}
        <span className="text-sm font-normal text-slate-400 ml-1">{unit}</span>
      </p>
    </div>
  )
}

function statusBadge(status: LoadTestReport["status"]) {
  if (status === "passed") return <Badge className="bg-emerald-500 text-white">Aprovado</Badge>
  if (status === "failed") return <Badge variant="destructive">Reprovado</Badge>
  if (status === "running") return <Badge variant="default">Executando…</Badge>
  if (status === "aborted") return <Badge variant="outline">Abortado</Badge>
  return <Badge variant="secondary">Aguardando</Badge>
}

// ─── component ────────────────────────────────────────────────────────────────

export default function CargaPage() {
  const [selectedId, setSelectedId] = useState<ScenarioId>("carga")
  const [report, setReport] = useState<LoadTestReport | null>(null)
  const [progress, setProgress] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const snapshotsRef = useRef<MetricSnapshot[]>([])

  const scenario = SCENARIOS[selectedId]

  const latestSnap = report?.snapshots[report.snapshots.length - 1]
  const totalSimSeconds = scenario.durationSeconds

  const stop = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
    setReport((prev) => {
      if (!prev || prev.status !== "running") return prev
      const snaps = snapshotsRef.current
      const summaries = buildEndpointSummaries(snaps, prev.scenario)
      const breaches = computeSlaBreaches(snaps, summaries, prev.scenario)
      const count = snaps.length || 1
      const avgP95 = snaps.reduce((s, x) => s + x.p95Ms, 0) / count
      const totalReqs = Math.round(snaps.reduce((s, x) => s + x.rps * SIM_SECONDS_PER_TICK, 0))
      const overallErrPct = snaps.reduce((s, x) => s + x.errorRatePct, 0) / count
      const totalErrors = Math.round(totalReqs * overallErrPct / 100)
      return {
        ...prev,
        status: "aborted",
        finishedAt: new Date().toISOString(),
        endpointSummaries: summaries,
        slaBreaches: breaches,
        avgP95Ms: Math.round(avgP95),
        totalRequests: totalReqs,
        totalErrors,
        overallErrorPct: Math.round(overallErrPct * 10) / 10,
        peakRps: snaps.length ? Math.max(...snaps.map((x) => x.rps)) : 0,
        peakUsers: snaps.length ? Math.max(...snaps.map((x) => x.activeUsers)) : 0,
      }
    })
  }, [])

  const start = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    snapshotsRef.current = []
    setProgress(0)

    const initial: LoadTestReport = {
      runId: `LOAD-${Date.now()}`,
      scenario,
      startedAt: new Date().toISOString(),
      status: "running",
      snapshots: [],
      endpointSummaries: [],
      peakRps: 0,
      peakUsers: 0,
      avgP95Ms: 0,
      totalRequests: 0,
      totalErrors: 0,
      overallErrorPct: 0,
      slaBreaches: [],
    }
    setReport(initial)

    let simT = 0
    timerRef.current = setInterval(() => {
      simT += SIM_SECONDS_PER_TICK
      const prev = snapshotsRef.current[snapshotsRef.current.length - 1]
      const snap = generateSnapshot(simT, scenario, prev)
      snapshotsRef.current = [...snapshotsRef.current, snap]

      const pct = Math.min((simT / totalSimSeconds) * 100, 100)
      setProgress(pct)

      setReport((r) => {
        if (!r) return r
        return { ...r, snapshots: snapshotsRef.current }
      })

      if (simT >= totalSimSeconds) {
        if (timerRef.current) clearInterval(timerRef.current)
        timerRef.current = null
        const summaries = buildEndpointSummaries(snapshotsRef.current, scenario)
        const breaches = computeSlaBreaches(snapshotsRef.current, summaries, scenario)
        const avgP95 = snapshotsRef.current.reduce((s, x) => s + x.p95Ms, 0) / snapshotsRef.current.length
        const totalReqs = Math.round(snapshotsRef.current.reduce((s, x) => s + x.rps * SIM_SECONDS_PER_TICK, 0))
        const overallErrPct = snapshotsRef.current.reduce((s, x) => s + x.errorRatePct, 0) / snapshotsRef.current.length
        const totalErr = Math.round(totalReqs * overallErrPct / 100)
        setReport((r) => {
          if (!r) return r
          return {
            ...r,
            status: breaches.length === 0 ? "passed" : "failed",
            finishedAt: new Date().toISOString(),
            endpointSummaries: summaries,
            slaBreaches: breaches,
            avgP95Ms: Math.round(avgP95),
            totalRequests: totalReqs,
            totalErrors: totalErr,
            overallErrorPct: Math.round(overallErrPct * 10) / 10,
            peakRps: Math.round(Math.max(...snapshotsRef.current.map((x) => x.rps))),
            peakUsers: Math.max(...snapshotsRef.current.map((x) => x.activeUsers)),
          }
        })
        setProgress(100)
      }
    }, TICK_INTERVAL_MS)
  }, [scenario, totalSimSeconds])

  const reset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
    snapshotsRef.current = []
    setReport(null)
    setProgress(0)
  }, [])

  const isRunning = report?.status === "running"
  const isDone = report?.status === "passed" || report?.status === "failed" || report?.status === "aborted"

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <a href="/staging" className="flex items-center gap-1">
            <ChevronLeft size={16} /> Voltar
          </a>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Semana 3 — Testes de Carga
          </h1>
          <p className="text-slate-500 text-sm">Simulação de picos de acesso e monitoramento de latência</p>
        </div>
        {report && statusBadge(report.status)}
      </div>

      {/* scenario selector */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Cenário</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(Object.values(SCENARIOS)).map((sc) => (
            <button
              key={sc.id}
              onClick={() => { if (!isRunning) { setSelectedId(sc.id); reset() } }}
              disabled={isRunning}
              className={`rounded-lg border-2 p-3 text-left transition-all ${
                selectedId === sc.id
                  ? `${SCENARIO_COLORS[sc.id]} border-current font-semibold shadow-sm`
                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300"
              } ${isRunning ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <p className="font-semibold text-sm">{sc.label}</p>
              <p className="text-xs mt-0.5 opacity-75">{sc.virtualUsers} VUs · {sc.durationSeconds}s</p>
            </button>
          ))}
        </div>
        <p className="text-sm text-slate-500">{scenario.description}</p>
        <div className="flex gap-4 text-xs text-slate-400">
          <span>SLA P95: &lt; {scenario.slaTargets.p95LatencyMs}ms</span>
          <span>Erros: &lt; {scenario.slaTargets.errorRatePct}%</span>
          <span>Mín. throughput: {scenario.slaTargets.minRps} RPS</span>
        </div>
      </section>

      {/* progress */}
      {(isRunning || isDone) && (
        <section className="space-y-1">
          <div className="flex justify-between text-xs text-slate-500">
            <span>
              {isRunning
                ? `${Math.round((progress / 100) * scenario.durationSeconds)}s / ${scenario.durationSeconds}s`
                : `Concluído em ${scenario.durationSeconds}s`}
            </span>
            {latestSnap && (
              <span className="font-mono">{latestSnap.activeUsers} VUs ativos</span>
            )}
          </div>
          <Progress value={progress} className="h-1.5" />
        </section>
      )}

      {/* live metric cards */}
      {latestSnap && (
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {metricCard(
            "Throughput",
            latestSnap.rps,
            "RPS",
            <Activity size={13} />,
            latestSnap.rps >= scenario.slaTargets.minRps ? "ok" : "bad"
          )}
          {metricCard(
            "Latência P95",
            latestSnap.p95Ms,
            "ms",
            <Clock size={13} />,
            latestSnap.p95Ms <= scenario.slaTargets.p95LatencyMs ? "ok" : latestSnap.p95Ms <= scenario.slaTargets.p95LatencyMs * 1.3 ? "warn" : "bad"
          )}
          {metricCard(
            "Taxa de Erros",
            latestSnap.errorRatePct,
            "%",
            <AlertTriangle size={13} />,
            latestSnap.errorRatePct <= scenario.slaTargets.errorRatePct ? "ok" : "bad"
          )}
          {metricCard(
            "Usuários Ativos",
            latestSnap.activeUsers,
            "VUs",
            <Users size={13} />
          )}
        </section>
      )}

      {/* latency chart */}
      {report && report.snapshots.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Latência ao Longo do Tempo
          </h2>
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={report.snapshots} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="ts"
                  tickFormatter={(v) => `${v}s`}
                  tick={{ fontSize: 11 }}
                  stroke="#94a3b8"
                />
                <YAxis
                  tickFormatter={(v) => `${v}ms`}
                  tick={{ fontSize: 11 }}
                  stroke="#94a3b8"
                  width={60}
                />
                <Tooltip
                  formatter={(val: number, name: string) => [`${val}ms`, name]}
                  labelFormatter={(l) => `t = ${l}s`}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <ReferenceLine
                  y={scenario.slaTargets.p95LatencyMs}
                  stroke="#f59e0b"
                  strokeDasharray="4 2"
                  label={{ value: `SLA P95 ${scenario.slaTargets.p95LatencyMs}ms`, position: "insideTopRight", fontSize: 10, fill: "#f59e0b" }}
                />
                <Line type="monotone" dataKey="p50Ms" name="P50" stroke="#10b981" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="p95Ms" name="P95" stroke="#3b82f6" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="p99Ms" name="P99" stroke="#8b5cf6" dot={false} strokeWidth={1.5} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* throughput + users chart */}
      {report && report.snapshots.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Throughput & Usuários Ativos
          </h2>
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={report.snapshots} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="ts" tickFormatter={(v) => `${v}s`} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis yAxisId="rps" tick={{ fontSize: 11 }} stroke="#94a3b8" width={40} />
                <YAxis yAxisId="users" orientation="right" tick={{ fontSize: 11 }} stroke="#94a3b8" width={40} />
                <Tooltip labelFormatter={(l) => `t = ${l}s`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <ReferenceLine
                  yAxisId="rps"
                  y={scenario.slaTargets.minRps}
                  stroke="#f59e0b"
                  strokeDasharray="4 2"
                  label={{ value: `Mín. ${scenario.slaTargets.minRps} RPS`, position: "insideTopRight", fontSize: 10, fill: "#f59e0b" }}
                />
                <Line yAxisId="rps" type="monotone" dataKey="rps" name="RPS" stroke="#f97316" dot={false} strokeWidth={2} />
                <Line yAxisId="users" type="monotone" dataKey="activeUsers" name="VUs" stroke="#64748b" dot={false} strokeWidth={1.5} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* endpoint summary table */}
      {isDone && report.endpointSummaries.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Resultado por Endpoint
          </h2>
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                  <th className="text-left px-4 py-2.5 font-medium text-slate-600 dark:text-slate-400">Endpoint</th>
                  <th className="px-3 py-2.5 text-right font-medium text-slate-600 dark:text-slate-400">Requisições</th>
                  <th className="px-3 py-2.5 text-right font-medium text-slate-600 dark:text-slate-400">P50</th>
                  <th className="px-3 py-2.5 text-right font-medium text-slate-600 dark:text-slate-400">P95</th>
                  <th className="px-3 py-2.5 text-right font-medium text-slate-600 dark:text-slate-400">P99</th>
                  <th className="px-3 py-2.5 text-right font-medium text-slate-600 dark:text-slate-400">Erros</th>
                  <th className="px-3 py-2.5 text-center font-medium text-slate-600 dark:text-slate-400">SLA</th>
                </tr>
              </thead>
              <tbody>
                {report.endpointSummaries.map((ep, i) => (
                  <tr key={ep.path} className={`border-b border-slate-100 dark:border-slate-800 last:border-0 ${i % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50/50 dark:bg-slate-900/50"}`}>
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-slate-700 dark:text-slate-300">{ep.label}</p>
                      <p className="text-xs text-slate-400 font-mono">{ep.path}</p>
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-slate-600 dark:text-slate-400">{ep.requests.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-slate-600 dark:text-slate-400">{ep.p50Ms}ms</td>
                    <td className={`px-3 py-2.5 text-right font-mono font-semibold ${ep.p95Ms <= scenario.slaTargets.p95LatencyMs ? "text-emerald-600" : "text-red-500"}`}>{ep.p95Ms}ms</td>
                    <td className="px-3 py-2.5 text-right font-mono text-slate-600 dark:text-slate-400">{ep.p99Ms}ms</td>
                    <td className="px-3 py-2.5 text-right font-mono text-slate-500">{ep.errorsCount}</td>
                    <td className="px-3 py-2.5 text-center">
                      {ep.passed
                        ? <CheckCircle2 size={16} className="text-emerald-500 mx-auto" />
                        : <XCircle size={16} className="text-red-500 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* SLA breaches */}
      {isDone && report.slaBreaches.length > 0 && (
        <section className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 p-4 space-y-2">
          <p className="font-semibold text-red-800 dark:text-red-200 flex items-center gap-2">
            <AlertTriangle size={16} /> Violações de SLA detectadas
          </p>
          <ul className="space-y-1">
            {report.slaBreaches.map((b, i) => (
              <li key={i} className="text-sm text-red-700 dark:text-red-300 flex items-start gap-2">
                <XCircle size={14} className="flex-shrink-0 mt-0.5" /> {b}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* final evidence stamp */}
      {isDone && (
        <section className={`rounded-lg border p-4 space-y-2 ${report.status === "passed" ? "border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950" : "border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950"}`}>
          <p className={`font-semibold ${report.status === "passed" ? "text-emerald-800 dark:text-emerald-200" : "text-amber-800 dark:text-amber-200"}`}>
            {report.status === "passed" ? "✓ Teste aprovado" : report.status === "aborted" ? "⚠ Teste interrompido" : "✗ Teste reprovado — revisar SLAs"}
          </p>
          <div className={`grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-1 text-sm ${report.status === "passed" ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300"}`}>
            <span>Run ID</span><span className="font-mono text-xs col-span-1">{report.runId}</span>
            <span>Cenário</span><span className="font-semibold">{report.scenario.label}</span>
            <span>Total requisições</span><span className="font-mono">{report.totalRequests.toLocaleString()}</span>
            <span>P95 médio</span><span className="font-mono">{report.avgP95Ms}ms</span>
            <span>Peak RPS</span><span className="font-mono">{report.peakRps}</span>
            <span>Taxa de erros</span><span className="font-mono">{report.overallErrorPct}%</span>
            <span>Violações SLA</span><span className="font-semibold">{report.slaBreaches.length === 0 ? "Nenhuma" : report.slaBreaches.length}</span>
            <span>Início</span><span className="font-mono text-xs">{new Date(report.startedAt).toLocaleString("pt-BR")}</span>
          </div>
        </section>
      )}

      {/* actions */}
      <div className="flex gap-3">
        {!isRunning ? (
          <Button onClick={start} className="gap-2">
            <Play size={16} /> {report ? "Re-executar Teste" : "Executar Teste de Carga"}
          </Button>
        ) : (
          <Button onClick={stop} variant="destructive" className="gap-2">
            <Square size={16} /> Parar
          </Button>
        )}
        {!isRunning && (
          <Button variant="outline" onClick={reset} className="gap-2">
            <RotateCcw size={16} /> Resetar
          </Button>
        )}
      </div>
    </main>
  )
}

"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts"
import {
  Activity, AlertTriangle, Bell, BellOff,
  CheckCircle2, ChevronLeft, Heart, Loader2,
  Server, Thermometer, XCircle, Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// ─── types ────────────────────────────────────────────────────────────────────

type ServiceStatus = "healthy" | "degraded" | "down"

interface ServiceHealth {
  name: string
  status: ServiceStatus
  latencyMs: number
  uptimePct: number
}

interface MetricPoint {
  ts: number
  p95Ms: number
  rps: number
  errorPct: number
  cpuPct: number
}

interface Alert {
  id: string
  severity: "warning" | "critical"
  message: string
  firedAt: string
  resolved: boolean
}

// ─── simulation helpers ───────────────────────────────────────────────────────

let _tick = 0

function nextPoint(prev?: MetricPoint): MetricPoint {
  _tick++
  const jitter = (Math.random() - 0.5) * 40
  const spike = _tick % 30 === 0 ? 600 : 0
  const p95Ms = Math.max(100, (prev?.p95Ms ?? 400) + jitter + spike * 0.3)
  const rps = Math.max(5, (prev?.rps ?? 40) + (Math.random() - 0.5) * 8)
  const errorPct = Math.max(0, (prev?.errorPct ?? 0.3) + (Math.random() - 0.5) * 0.4 + (spike > 0 ? 2 : 0))
  const cpuPct = Math.max(5, Math.min(99, (prev?.cpuPct ?? 35) + (Math.random() - 0.5) * 6 + (spike > 0 ? 20 : 0)))
  return { ts: _tick, p95Ms: Math.round(p95Ms), rps: Math.round(rps * 10) / 10, errorPct: Math.round(errorPct * 10) / 10, cpuPct: Math.round(cpuPct) }
}

function serviceHealth(point: MetricPoint): ServiceHealth[] {
  return [
    { name: "API Gateway",      status: point.errorPct > 5 ? "down" : point.errorPct > 2 ? "degraded" : "healthy", latencyMs: point.p95Ms, uptimePct: point.errorPct > 5 ? 94 : 99.8 },
    { name: "Agendamento",      status: point.p95Ms > 1800 ? "degraded" : "healthy", latencyMs: Math.round(point.p95Ms * 0.8), uptimePct: 99.9 },
    { name: "Triagem",          status: "healthy", latencyMs: Math.round(point.p95Ms * 0.6), uptimePct: 100 },
    { name: "Auth",             status: "healthy", latencyMs: Math.round(point.p95Ms * 0.4), uptimePct: 100 },
    { name: "Banco de Dados",   status: point.cpuPct > 85 ? "degraded" : "healthy", latencyMs: Math.round(point.p95Ms * 0.2), uptimePct: 99.95 },
  ]
}

const SLA_P95 = 1000
const SLA_ERR = 2
const SLA_CPU = 80

function evalAlerts(point: MetricPoint, prev: Alert[]): Alert[] {
  const alerts: Alert[] = prev.map((a) => ({ ...a }))
  const now = new Date().toLocaleTimeString("pt-BR")

  const add = (id: string, severity: Alert["severity"], message: string) => {
    if (!alerts.find((a) => a.id === id && !a.resolved)) {
      alerts.push({ id, severity, message, firedAt: now, resolved: false })
    }
  }
  const resolve = (id: string) => {
    alerts.forEach((a) => { if (a.id === id) a.resolved = true })
  }

  if (point.p95Ms > SLA_P95) add("p95", "warning", `P95 (${point.p95Ms}ms) acima do SLA (${SLA_P95}ms)`)
  else resolve("p95")

  if (point.errorPct > SLA_ERR) add("err", "critical", `Taxa de erros (${point.errorPct}%) acima do SLA (${SLA_ERR}%)`)
  else resolve("err")

  if (point.cpuPct > SLA_CPU) add("cpu", "warning", `CPU (${point.cpuPct}%) acima do limite (${SLA_CPU}%)`)
  else resolve("cpu")

  return alerts.slice(-20)
}

// ─── sub-components ──────────────────────────────────────────────────────────

const STATUS_COLOR: Record<ServiceStatus, string> = {
  healthy:  "text-emerald-500",
  degraded: "text-amber-500",
  down:     "text-red-500",
}
const STATUS_ICON: Record<ServiceStatus, React.ReactNode> = {
  healthy:  <CheckCircle2 size={14} className="text-emerald-500" />,
  degraded: <AlertTriangle size={14} className="text-amber-500" />,
  down:     <XCircle size={14} className="text-red-500" />,
}

function StatCard({ label, value, unit, icon, highlight }: {
  label: string; value: string | number; unit: string
  icon: React.ReactNode; highlight?: "ok" | "warn" | "bad"
}) {
  const c = highlight === "ok" ? "text-emerald-600 dark:text-emerald-400"
    : highlight === "warn" ? "text-amber-500" : highlight === "bad" ? "text-red-500"
    : "text-slate-800 dark:text-slate-200"
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-1">
      <div className="flex items-center gap-1.5 text-xs text-slate-500">{icon}{label}</div>
      <p className={`text-2xl font-bold font-mono ${c}`}>
        {value}<span className="text-sm font-normal text-slate-400 ml-1">{unit}</span>
      </p>
    </div>
  )
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function ObservabilidadePage() {
  const [points, setPoints] = useState<MetricPoint[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [muted, setMuted] = useState(false)
  const [running, setRunning] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const alertsRef = useRef<Alert[]>([])

  const latest = points[points.length - 1]
  const services = latest ? serviceHealth(latest) : []
  const activeAlerts = alerts.filter((a) => !a.resolved)

  const start = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    _tick = 0
    setPoints([])
    setAlerts([])
    alertsRef.current = []
    setRunning(true)
    timerRef.current = setInterval(() => {
      setPoints((prev) => {
        const next = nextPoint(prev[prev.length - 1])
        const updated = [...prev.slice(-59), next]
        const newAlerts = evalAlerts(next, alertsRef.current)
        alertsRef.current = newAlerts
        setAlerts([...newAlerts])
        return updated
      })
    }, 1000)
  }, [])

  const stop = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
    setRunning(false)
  }, [])

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current) }, [])

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <a href="/staging" className="flex items-center gap-1"><ChevronLeft size={16} /> Voltar</a>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Activity size={22} /> Observabilidade & Alertas
          </h1>
          <p className="text-slate-500 text-sm">Semana 5 — Camada 2 · Métricas em tempo real · SLAs monitorados</p>
        </div>
        <div className="flex items-center gap-2">
          {activeAlerts.length > 0 && !muted && (
            <Badge variant="destructive" className="gap-1 animate-pulse">
              <AlertTriangle size={12} /> {activeAlerts.length} alerta{activeAlerts.length > 1 ? "s" : ""}
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={() => setMuted((m) => !m)} title="Silenciar alertas">
            {muted ? <BellOff size={16} className="text-slate-400" /> : <Bell size={16} />}
          </Button>
        </div>
      </div>

      {/* SLA targets */}
      <div className="flex gap-4 text-xs text-slate-500 flex-wrap">
        <span className="flex items-center gap-1"><Zap size={11} /> SLA P95 &lt; {SLA_P95}ms</span>
        <span className="flex items-center gap-1"><AlertTriangle size={11} /> Erros &lt; {SLA_ERR}%</span>
        <span className="flex items-center gap-1"><Thermometer size={11} /> CPU &lt; {SLA_CPU}%</span>
      </div>

      {/* stat cards */}
      {latest && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Latência P95" value={latest.p95Ms} unit="ms" icon={<Zap size={13} />}
            highlight={latest.p95Ms <= SLA_P95 ? "ok" : latest.p95Ms <= SLA_P95 * 1.5 ? "warn" : "bad"} />
          <StatCard label="Throughput" value={latest.rps} unit="RPS" icon={<Activity size={13} />} highlight="ok" />
          <StatCard label="Taxa de Erros" value={latest.errorPct} unit="%" icon={<AlertTriangle size={13} />}
            highlight={latest.errorPct <= SLA_ERR ? "ok" : "bad"} />
          <StatCard label="CPU" value={latest.cpuPct} unit="%" icon={<Thermometer size={13} />}
            highlight={latest.cpuPct <= SLA_CPU ? "ok" : latest.cpuPct <= 90 ? "warn" : "bad"} />
        </div>
      )}

      {/* latency chart */}
      {points.length > 1 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Latência P95 (último minuto)</h2>
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={points}>
                <defs>
                  <linearGradient id="p95grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="ts" tick={{ fontSize: 10 }} stroke="#94a3b8" tickFormatter={(v) => `${v}s`} />
                <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" tickFormatter={(v) => `${v}ms`} width={55} />
                <Tooltip formatter={(v: number) => [`${v}ms`, "P95"]} labelFormatter={(l) => `t=${l}s`} />
                <ReferenceLine y={SLA_P95} stroke="#f59e0b" strokeDasharray="4 2"
                  label={{ value: `SLA ${SLA_P95}ms`, position: "insideTopRight", fontSize: 10, fill: "#f59e0b" }} />
                <Area type="monotone" dataKey="p95Ms" stroke="#3b82f6" fill="url(#p95grad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* error + cpu */}
      {points.length > 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { key: "errorPct" as const, label: "Taxa de Erros (%)", sla: SLA_ERR, color: "#ef4444", unit: "%" },
            { key: "cpuPct" as const,   label: "CPU (%)",           sla: SLA_CPU, color: "#f97316", unit: "%" },
          ].map(({ key, label, sla, color, unit }) => (
            <section key={key} className="space-y-2">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">{label}</h2>
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                <ResponsiveContainer width="100%" height={140}>
                  <LineChart data={points}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="ts" tick={{ fontSize: 10 }} stroke="#94a3b8" tickFormatter={(v) => `${v}s`} />
                    <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" tickFormatter={(v) => `${v}${unit}`} width={40} />
                    <Tooltip formatter={(v: number) => [`${v}${unit}`, label]} labelFormatter={(l) => `t=${l}s`} />
                    <ReferenceLine y={sla} stroke="#f59e0b" strokeDasharray="4 2" />
                    <Line type="monotone" dataKey={key} stroke={color} dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>
          ))}
        </div>
      )}

      {/* service health */}
      {services.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Status dos Serviços</h2>
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                  <th className="text-left px-4 py-2.5 font-medium text-slate-500">Serviço</th>
                  <th className="px-3 py-2.5 text-center font-medium text-slate-500">Status</th>
                  <th className="px-3 py-2.5 text-right font-medium text-slate-500">Latência</th>
                  <th className="px-3 py-2.5 text-right font-medium text-slate-500">Uptime</th>
                </tr>
              </thead>
              <tbody>
                {services.map((svc, i) => (
                  <tr key={svc.name} className={`border-b border-slate-100 dark:border-slate-800 last:border-0 ${i % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50/50 dark:bg-slate-900/50"}`}>
                    <td className="px-4 py-2.5 flex items-center gap-2">
                      <Server size={14} className="text-slate-400" />{svc.name}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${STATUS_COLOR[svc.status]}`}>
                        {STATUS_ICON[svc.status]} {svc.status}
                      </span>
                    </td>
                    <td className={`px-3 py-2.5 text-right font-mono text-sm ${svc.latencyMs > SLA_P95 ? "text-amber-500 font-semibold" : "text-slate-600 dark:text-slate-400"}`}>
                      {svc.latencyMs}ms
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-sm text-slate-500">
                      {svc.uptimePct}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* alert feed */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          Feed de Alertas {alerts.length > 0 && <span className="text-slate-400">({alerts.length})</span>}
        </h2>
        {alerts.length === 0 ? (
          <p className="text-sm text-slate-400 italic">Nenhum alerta disparado ainda.</p>
        ) : (
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {[...alerts].reverse().map((a) => (
              <div key={`${a.id}-${a.firedAt}`}
                className={`flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm border ${
                  a.resolved
                    ? "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 opacity-50"
                    : a.severity === "critical"
                    ? "border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950"
                    : "border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950"
                }`}>
                {a.resolved
                  ? <CheckCircle2 size={15} className="text-slate-400 flex-shrink-0 mt-0.5" />
                  : a.severity === "critical"
                  ? <XCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
                  : <AlertTriangle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />}
                <div className="flex-1">
                  <span className={a.resolved ? "text-slate-400" : a.severity === "critical" ? "text-red-700 dark:text-red-300" : "text-amber-700 dark:text-amber-300"}>
                    {a.message}
                  </span>
                  {a.resolved && <span className="text-slate-400 ml-2 text-xs">— resolvido</span>}
                </div>
                <span className="text-xs text-slate-400 font-mono flex-shrink-0">{a.firedAt}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* actions */}
      <div className="flex gap-3">
        {!running ? (
          <Button onClick={start} className="gap-2"><Activity size={16} /> Iniciar Monitoramento</Button>
        ) : (
          <Button onClick={stop} variant="outline" className="gap-2"><Heart size={16} className="text-red-500" /> Parar</Button>
        )}
        {running && (
          <span className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 size={14} className="animate-spin" /> Atualizando a cada segundo…
          </span>
        )}
      </div>
    </main>
  )
}

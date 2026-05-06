"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  CheckCircle2,
  Star,
  Send,
  User,
  Monitor,
  Clock,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  ChevronRight,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Rating = 1 | 2 | 3 | 4 | 5

interface SessionLog {
  id: string
  user: string
  role: string
  module: string
  action: string
  duration: string
  timestamp: string
  errors: number
}

const SESSION_LOGS: SessionLog[] = [
  { id: "s1", user: "julia.secretaria@clinic.com", role: "Secretária", module: "Agenda", action: "Confirmou 5 agendamentos", duration: "4m 12s", timestamp: "09:05", errors: 0 },
  { id: "s2", user: "julia.secretaria@clinic.com", role: "Secretária", module: "Agenda", action: "Cancelou 1 agendamento", duration: "1m 08s", timestamp: "09:10", errors: 0 },
  { id: "s3", user: "dr.carlos@clinic.com", role: "Médico", module: "WhatsApp", action: "Tentou acessar painel de auditoria", duration: "0m 12s", timestamp: "09:15", errors: 1 },
  { id: "s4", user: "julia.secretaria@clinic.com", role: "Secretária", module: "WhatsApp", action: "Enviou confirmação via simulador", duration: "2m 34s", timestamp: "09:22", errors: 0 },
  { id: "s5", user: "admin@clinic.com", role: "Administrador", module: "Auditoria", action: "Consultou logs do dia", duration: "6m 51s", timestamp: "09:30", errors: 0 },
  { id: "s6", user: "nova.secretaria@clinic.com", role: "Secretária", module: "Agenda", action: "Buscou paciente por nome", duration: "1m 22s", timestamp: "09:41", errors: 0 },
]

const UAT_SCENARIOS = [
  { id: "u1", module: "Secretária", scenario: "Confirmar agendamento do dia", done: true },
  { id: "u2", module: "Secretária", scenario: "Cancelar agendamento com motivo", done: true },
  { id: "u3", module: "Secretária", scenario: "Buscar paciente por nome e telefone", done: true },
  { id: "u4", module: "WhatsApp", scenario: "Receber confirmação 'SIM' do paciente", done: false },
  { id: "u5", module: "WhatsApp", scenario: "Receber 'CANCELAR' e ver status atualizado", done: false },
  { id: "u6", module: "Auditoria", scenario: "Administrador acessa painel e filtra por crítico", done: true },
  { id: "u7", module: "Auditoria", scenario: "Secretária tenta acessar auditoria e recebe negativa", done: true },
  { id: "u8", module: "Geral", scenario: "Trocar de módulo sem perda de dados", done: false },
]

interface FeedbackForm {
  name: string
  role: string
  module: string
  rating: Rating | null
  usability: Rating | null
  comment: string
  blocker: boolean
}

const MODULES = ["Agenda (Secretária)", "WhatsApp Homologação", "Painel de Auditoria", "Dashboard"]
const ROLES = ["Secretária", "Médico", "Administrador", "Outro"]

function StarRating({
  value,
  onChange,
}: {
  value: Rating | null
  onChange: (v: Rating) => void
}) {
  const [hovered, setHovered] = useState<number | null>(null)
  return (
    <div className="flex gap-1">
      {([1, 2, 3, 4, 5] as Rating[]).map((n) => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(null)}
          onClick={() => onChange(n)}
          className="transition-colors"
        >
          <Star
            className={cn(
              "h-6 w-6",
              (hovered ?? value ?? 0) >= n
                ? "fill-yellow-400 text-yellow-400"
                : "text-slate-300",
            )}
          />
        </button>
      ))}
    </div>
  )
}

export default function UATPage() {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<FeedbackForm>({
    name: "",
    role: "",
    module: "",
    rating: null,
    usability: null,
    comment: "",
    blocker: false,
  })

  const scenarios = UAT_SCENARIOS
  const done = scenarios.filter((s) => s.done).length
  const pct = Math.round((done / scenarios.length) * 100)

  const totalSessions = SESSION_LOGS.length
  const totalErrors = SESSION_LOGS.reduce((acc, s) => acc + s.errors, 0)
  const avgDuration = "2m 43s"

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.role || !form.module || !form.rating) return
    setSubmitting(true)
    try {
      await fetch("/api/uat/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario_id: form.module.toLowerCase().replace(/\s+/g, "-"),
          scenario_title: form.module,
          tester_name: form.name,
          tester_role: form.role,
          rating: form.rating,
          notes: form.comment || undefined,
          is_blocker: form.blocker,
        }),
      })
    } finally {
      setSubmitting(false)
      setSubmitted(true)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-slate-400 hover:text-slate-700 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">UAT — Usuários Piloto</h1>
              <p className="text-sm text-slate-500">Feedback, cenários de teste e rastreamento de sessão</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">Sprint 1 — 06/05/2026</Badge>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6 space-y-6">
        {/* Session stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Sessões registradas", value: totalSessions, icon: <Monitor className="h-5 w-5 text-blue-500" /> },
            { label: "Cenários concluídos", value: `${done}/${scenarios.length}`, icon: <CheckCircle2 className="h-5 w-5 text-green-500" /> },
            { label: "Erros detectados", value: totalErrors, icon: <AlertTriangle className="h-5 w-5 text-red-500" /> },
            { label: "Duração média", value: avgDuration, icon: <Clock className="h-5 w-5 text-slate-400" /> },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-start gap-3">
              {stat.icon}
              <div>
                <p className="text-xs text-slate-500">{stat.label}</p>
                <p className="text-xl font-bold text-slate-800 mt-0.5">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* UAT scenarios */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Cenários UAT</h2>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <div className="h-2 w-24 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                {pct}%
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
              {scenarios.map((s) => (
                <div key={s.id} className="flex items-center gap-3 px-4 py-3">
                  {s.done
                    ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    : <div className="h-4 w-4 rounded-full border-2 border-slate-300 shrink-0" />
                  }
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm", s.done ? "text-slate-400 line-through" : "text-slate-800")}>
                      {s.scenario}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 shrink-0 border border-slate-200 rounded px-1.5 py-0.5">
                    {s.module}
                  </span>
                </div>
              ))}
            </div>

            {/* Session log */}
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider pt-2">
              Rastreamento de sessão
            </h2>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
              {SESSION_LOGS.map((log) => (
                <div key={log.id} className="flex items-start gap-3 px-4 py-3">
                  <div className="rounded-full bg-slate-100 p-1.5 shrink-0">
                    <User className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-slate-800">{log.action}</span>
                      {log.errors > 0 && (
                        <span className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-1.5 py-0.5 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> {log.errors} erro
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {log.user} · {log.role} · {log.module} · {log.duration} · {log.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback form */}
          <div>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Formulário de feedback
            </h2>
            {submitted ? (
              <div className="bg-white rounded-xl border border-green-200 shadow-sm p-8 flex flex-col items-center gap-4 text-center">
                <div className="rounded-full bg-green-100 p-4">
                  <ThumbsUp className="h-8 w-8 text-green-500" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-900">Obrigado pelo feedback!</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Sua resposta foi registrada e será analisada pela equipe.
                  </p>
                </div>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: "", role: "", module: "", rating: null, usability: null, comment: "", blocker: false }) }}
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  Enviar outro <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600">Nome *</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="Seu nome"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600">Perfil *</label>
                    <select
                      required
                      value={form.role}
                      onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecionar…</option>
                      {ROLES.map((r) => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Módulo testado *</label>
                  <select
                    required
                    value={form.module}
                    onChange={(e) => setForm((f) => ({ ...f, module: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecionar…</option>
                    {MODULES.map((m) => <option key={m}>{m}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">
                    Satisfação geral *
                  </label>
                  <StarRating
                    value={form.rating}
                    onChange={(v) => setForm((f) => ({ ...f, rating: v }))}
                  />
                  {form.rating && (
                    <p className="text-xs text-slate-400">
                      {["", "Muito insatisfeito", "Insatisfeito", "Neutro", "Satisfeito", "Muito satisfeito"][form.rating]}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Facilidade de uso</label>
                  <StarRating
                    value={form.usability}
                    onChange={(v) => setForm((f) => ({ ...f, usability: v }))}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5" />
                    Comentário / problema encontrado
                  </label>
                  <textarea
                    rows={3}
                    value={form.comment}
                    onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
                    placeholder="Descreva o que funcionou bem ou mal…"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <input
                    type="checkbox"
                    id="blocker"
                    checked={form.blocker}
                    onChange={(e) => setForm((f) => ({ ...f, blocker: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300 accent-red-500"
                  />
                  <label htmlFor="blocker" className="text-sm text-slate-700 flex items-center gap-1.5 cursor-pointer">
                    <ThumbsDown className="h-4 w-4 text-red-500" />
                    Este problema <strong>bloqueia</strong> o uso do sistema
                  </label>
                </div>

                {form.blocker && (
                  <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    Feedback bloqueante será escalado imediatamente para o Tech Lead.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-2.5 text-sm font-medium transition-colors shadow-sm"
                >
                  <Send className="h-4 w-4" />
                  {submitting ? "Enviando…" : "Enviar feedback"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  MessageSquare,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Smartphone,
  Zap,
  FileText,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type TestStatus = "pass" | "fail" | "pending" | "running"

interface TestCase {
  id: string
  name: string
  description: string
  category: string
  status: TestStatus
  latencyMs?: number
  errorMsg?: string
  lastRun?: string
}

interface SimMessage {
  id: string
  direction: "out" | "in"
  body: string
  timestamp: string
  status: "sent" | "delivered" | "read" | "failed"
}

const INITIAL_TESTS: TestCase[] = [
  {
    id: "t1",
    name: "Envio de mensagem de texto",
    description: "Envia uma mensagem de texto simples para número de homologação",
    category: "Envio",
    status: "pass",
    latencyMs: 342,
    lastRun: "2026-05-06 09:15",
  },
  {
    id: "t2",
    name: "Envio de confirmação de agendamento",
    description: "Disparo do template de confirmação com nome e horário do paciente",
    category: "Templates",
    status: "pass",
    latencyMs: 510,
    lastRun: "2026-05-06 09:16",
  },
  {
    id: "t3",
    name: "Recebimento de resposta do paciente",
    description: "Webhook recebe e processa resposta inbound do paciente",
    category: "Recebimento",
    status: "fail",
    errorMsg: "Webhook timeout após 5 000 ms — endpoint /api/whatsapp/webhook não respondeu",
    lastRun: "2026-05-06 09:17",
  },
  {
    id: "t4",
    name: "Reenvio automático em falha",
    description: "Sistema tenta reenvio após falha de entrega (max 3 tentativas)",
    category: "Resiliência",
    status: "pending",
  },
  {
    id: "t5",
    name: "Envio de lembrete 24 h antes",
    description: "Job agendado dispara lembrete no dia anterior ao agendamento",
    category: "Templates",
    status: "pass",
    latencyMs: 390,
    lastRun: "2026-05-06 09:18",
  },
  {
    id: "t6",
    name: "Mensagem de cancelamento",
    description: "Paciente responde CANCELAR e sistema atualiza status do agendamento",
    category: "Recebimento",
    status: "pending",
  },
  {
    id: "t7",
    name: "Rate limit — envio em massa",
    description: "Valida que o sistema respeita o limite de 80 msg/s da API",
    category: "Resiliência",
    status: "fail",
    errorMsg: "429 Too Many Requests após 62 msg/s — ajuste necessário no throttle",
    lastRun: "2026-05-06 09:20",
  },
  {
    id: "t8",
    name: "Autenticação do webhook (HMAC-SHA256)",
    description: "Valida assinatura do payload recebido da API do WhatsApp",
    category: "Segurança",
    status: "pass",
    latencyMs: 28,
    lastRun: "2026-05-06 09:14",
  },
]

const INITIAL_SIM_MESSAGES: SimMessage[] = [
  { id: "m1", direction: "out", body: "Olá, Ana! Lembrando que sua consulta está agendada para amanhã, 07/05 às 09:00. Responda SIM para confirmar ou CANCELAR para reagendar.", timestamp: "09:15", status: "read" },
  { id: "m2", direction: "in", body: "SIM", timestamp: "09:22", status: "read" },
  { id: "m3", direction: "out", body: "Perfeito, Ana! Sua consulta foi confirmada. Até amanhã!", timestamp: "09:22", status: "delivered" },
]

const STATUS_ICON: Record<TestStatus, React.ReactNode> = {
  pass: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  fail: <XCircle className="h-4 w-4 text-red-500" />,
  pending: <Clock className="h-4 w-4 text-slate-400" />,
  running: <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />,
}

const STATUS_BADGE: Record<TestStatus, string> = {
  pass: "bg-green-50 text-green-700 border-green-200",
  fail: "bg-red-50 text-red-700 border-red-200",
  pending: "bg-slate-50 text-slate-600 border-slate-200",
  running: "bg-blue-50 text-blue-700 border-blue-200",
}

const STATUS_LABEL: Record<TestStatus, string> = {
  pass: "OK",
  fail: "Falhou",
  pending: "Pendente",
  running: "Rodando",
}

const CATEGORIES = ["Todos", "Envio", "Recebimento", "Templates", "Resiliência", "Segurança"]

export default function WhatsAppHomologacaoPage() {
  const [tests, setTests] = useState<TestCase[]>(INITIAL_TESTS)
  const [messages, setMessages] = useState<SimMessage[]>(INITIAL_SIM_MESSAGES)
  const [newMessage, setNewMessage] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("Todos")
  const [runningAll, setRunningAll] = useState(false)

  const passed = tests.filter((t) => t.status === "pass").length
  const failed = tests.filter((t) => t.status === "fail").length
  const pending = tests.filter((t) => t.status === "pending").length

  const filtered = tests.filter(
    (t) => categoryFilter === "Todos" || t.category === categoryFilter,
  )

  function runTest(id: string) {
    setTests((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "running" } : t)),
    )
    setTimeout(() => {
      setTests((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t
          const pass = Math.random() > 0.3
          return {
            ...t,
            status: pass ? "pass" : "fail",
            latencyMs: pass ? Math.round(200 + Math.random() * 400) : undefined,
            errorMsg: pass ? undefined : "Simulated error: connection timeout",
            lastRun: new Date().toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
          }
        }),
      )
    }, 1500)
  }

  function runAllTests() {
    setRunningAll(true)
    setTests((prev) => prev.map((t) => ({ ...t, status: "running" })))
    setTimeout(() => {
      setTests((prev) =>
        prev.map((t) => {
          const pass = Math.random() > 0.25
          return {
            ...t,
            status: pass ? "pass" : "fail",
            latencyMs: pass ? Math.round(200 + Math.random() * 500) : undefined,
            errorMsg: pass ? undefined : "Simulated failure during batch run",
            lastRun: new Date().toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
          }
        }),
      )
      setRunningAll(false)
    }, 2500)
  }

  function sendSimMessage() {
    if (!newMessage.trim()) return
    const msg: SimMessage = {
      id: `m${Date.now()}`,
      direction: "out",
      body: newMessage.trim(),
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      status: "sent",
    }
    setMessages((prev) => [...prev, msg])
    setNewMessage("")
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, status: "delivered" } : m)),
      )
      setTimeout(() => {
        const reply: SimMessage = {
          id: `m${Date.now() + 1}`,
          direction: "in",
          body: "OK, entendido!",
          timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
          status: "read",
        }
        setMessages((prev) => [...prev, reply])
      }, 800)
    }, 600)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-slate-400 hover:text-slate-700 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">WhatsApp — Homologação</h1>
              <p className="text-sm text-slate-500">Validação e testes de integração em ambiente controlado</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Ambiente: HML</Badge>
            <Badge variant="secondary" className="text-xs">Perfil: Dev / QA</Badge>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-green-200 p-4 shadow-sm flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-green-500 shrink-0" />
            <div>
              <p className="text-2xl font-bold text-green-600">{passed}</p>
              <p className="text-xs text-slate-500">Testes passando</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-red-200 p-4 shadow-sm flex items-center gap-3">
            <XCircle className="h-8 w-8 text-red-500 shrink-0" />
            <div>
              <p className="text-2xl font-bold text-red-600">{failed}</p>
              <p className="text-xs text-slate-500">Testes falhando</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-3">
            <Clock className="h-8 w-8 text-slate-400 shrink-0" />
            <div>
              <p className="text-2xl font-bold text-slate-600">{pending}</p>
              <p className="text-xs text-slate-500">Pendentes</p>
            </div>
          </div>
        </div>

        {/* Critical warning */}
        {failed > 0 && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700">
              <span className="font-semibold">{failed} teste{failed > 1 ? "s" : ""} crítico{failed > 1 ? "s" : ""} falhando.</span>{" "}
              A integração WhatsApp não está aprovada para produção. Corrija antes do Go/No-Go.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Test suite */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                      categoryFilter === cat
                        ? "bg-blue-600 text-white"
                        : "text-slate-600 bg-white border border-slate-200 hover:bg-slate-50",
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <button
                onClick={runAllTests}
                disabled={runningAll}
                className="flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-3 py-2 text-sm font-medium transition-colors shadow-sm"
              >
                <Zap className="h-4 w-4" />
                {runningAll ? "Rodando…" : "Rodar todos"}
              </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
              {filtered.map((test) => (
                <div key={test.id} className="px-5 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="mt-0.5 shrink-0">{STATUS_ICON[test.status]}</div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-slate-900">{test.name}</span>
                          <span className={cn("text-xs font-medium border rounded px-1.5 py-0.5", STATUS_BADGE[test.status])}>
                            {STATUS_LABEL[test.status]}
                          </span>
                          <span className="text-xs text-slate-400 border border-slate-200 rounded px-1.5 py-0.5">
                            {test.category}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">{test.description}</p>
                        {test.errorMsg && (
                          <p className="mt-1 text-xs text-red-600 font-mono bg-red-50 rounded px-2 py-1">
                            {test.errorMsg}
                          </p>
                        )}
                        <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                          {test.latencyMs && <span>{test.latencyMs} ms</span>}
                          {test.lastRun && <span>Último: {test.lastRun}</span>}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => runTest(test.id)}
                      disabled={test.status === "running"}
                      className="shrink-0 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 px-2 py-1 text-xs text-slate-600 font-medium transition-colors"
                    >
                      {test.status === "running" ? "…" : "Rodar"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Checklist */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-700">Critérios de aprovação para produção</h3>
              </div>
              <ul className="space-y-2 text-sm text-slate-600">
                {[
                  { ok: passed >= 6, text: "≥ 75% dos testes passando (mínimo 6/8)" },
                  { ok: false, text: "Webhook recebimento funcionando sem timeout" },
                  { ok: true, text: "Autenticação HMAC validada" },
                  { ok: false, text: "Rate limit respeitado (≤ 80 msg/s)" },
                  { ok: true, text: "Templates de confirmação e lembrete aprovados" },
                  { ok: false, text: "Logs de envio/recebimento registrados no painel de auditoria" },
                ].map((c, i) => (
                  <li key={i} className="flex items-center gap-2">
                    {c.ok
                      ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      : <XCircle className="h-4 w-4 text-red-400 shrink-0" />
                    }
                    <span className={c.ok ? "text-slate-700" : "text-slate-500"}>{c.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Simulator */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
              <Smartphone className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-semibold text-slate-700">Simulador de conversa</span>
              <Badge variant="outline" className="ml-auto text-xs">HML</Badge>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-80 max-h-96 bg-slate-50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn("flex", msg.direction === "out" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                      msg.direction === "out"
                        ? "bg-green-500 text-white rounded-tr-sm"
                        : "bg-white text-slate-900 border border-slate-200 rounded-tl-sm",
                    )}
                  >
                    <p>{msg.body}</p>
                    <p
                      className={cn(
                        "text-right text-xs mt-0.5",
                        msg.direction === "out" ? "text-green-100" : "text-slate-400",
                      )}
                    >
                      {msg.timestamp}{" "}
                      {msg.direction === "out" && (
                        <span>
                          {msg.status === "read" ? "✓✓" : msg.status === "delivered" ? "✓✓" : "✓"}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 px-3 py-3 border-t border-slate-100">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendSimMessage()}
                placeholder="Simular envio…"
                className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button
                onClick={sendSimMessage}
                disabled={!newMessage.trim()}
                className="rounded-lg bg-green-500 hover:bg-green-600 disabled:opacity-40 text-white p-2 transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

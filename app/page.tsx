"use client"

import Link from "next/link"
import { useState } from "react"
import {
  CheckCircle2,
  Circle,
  AlertTriangle,
  ClipboardList,
  MessageSquare,
  Shield,
  Users,
  ChevronRight,
  Lock,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type CheckStatus = "done" | "pending" | "blocked"

interface CheckItem {
  id: string
  label: string
  owner: string
  deadline: string
  status: CheckStatus
  critical: boolean
}

const CHECKLIST: CheckItem[] = [
  {
    id: "sec-flow",
    label: "Fluxo completo da interface da secretária validado",
    owner: "Equipe Front-end",
    deadline: "2026-05-09",
    status: "pending",
    critical: true,
  },
  {
    id: "wa-homolog",
    label: "Integração WhatsApp aprovada em homologação (mensagens enviadas e recebidas)",
    owner: "Equipe Integração",
    deadline: "2026-05-10",
    status: "pending",
    critical: true,
  },
  {
    id: "audit-panel",
    label: "Painel de auditoria acessível apenas por perfil autorizado",
    owner: "Equipe Segurança",
    deadline: "2026-05-09",
    status: "pending",
    critical: true,
  },
  {
    id: "rbac",
    label: "Controle de acesso por papel (RBAC) implementado e testado",
    owner: "Equipe Back-end",
    deadline: "2026-05-11",
    status: "pending",
    critical: true,
  },
  {
    id: "error-handling",
    label: "Tratamento de erros críticos documentado (WhatsApp timeout, falha de envio)",
    owner: "Equipe Integração",
    deadline: "2026-05-12",
    status: "pending",
    critical: true,
  },
  {
    id: "data-retention",
    label: "Política de retenção de dados de auditoria definida",
    owner: "Equipe Segurança",
    deadline: "2026-05-12",
    status: "pending",
    critical: false,
  },
  {
    id: "scope-freeze",
    label: "Escopo congelado — nenhuma nova feature até fechamento das pendências",
    owner: "Tech Lead",
    deadline: "2026-05-06",
    status: "done",
    critical: true,
  },
  {
    id: "stakeholder",
    label: "Critérios de pronto validados com stakeholder",
    owner: "PM",
    deadline: "2026-05-07",
    status: "pending",
    critical: false,
  },
]

const STATUS_CONFIG: Record<CheckStatus, { icon: React.ReactNode; label: string; color: string }> = {
  done: {
    icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
    label: "Concluído",
    color: "text-green-700 bg-green-50 border-green-200",
  },
  pending: {
    icon: <Circle className="h-5 w-5 text-yellow-500" />,
    label: "Pendente",
    color: "text-yellow-700 bg-yellow-50 border-yellow-200",
  },
  blocked: {
    icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
    label: "Bloqueado",
    color: "text-red-700 bg-red-50 border-red-200",
  },
}

const MODULES = [
  {
    href: "/secretaria",
    icon: <Users className="h-6 w-6" />,
    title: "Interface da Secretária",
    description: "Agendamentos, busca de pacientes e gestão de atendimentos",
    status: "Em desenvolvimento",
    statusVariant: "secondary" as const,
  },
  {
    href: "/whatsapp-homologacao",
    icon: <MessageSquare className="h-6 w-6" />,
    title: "WhatsApp — Homologação",
    description: "Painel de testes e validação da integração WhatsApp",
    status: "Em homologação",
    statusVariant: "outline" as const,
  },
  {
    href: "/auditoria",
    icon: <Shield className="h-6 w-6" />,
    title: "Painel de Auditoria",
    description: "Registro de ações por perfil autorizado",
    status: "Acesso restrito",
    statusVariant: "destructive" as const,
  },
]

function statusCounts(items: CheckItem[]) {
  const done = items.filter((i) => i.status === "done").length
  const critical = items.filter((i) => i.critical && i.status !== "done").length
  const total = items.length
  return { done, critical, total }
}

export default function DashboardPage() {
  const [checklist, setChecklist] = useState<CheckItem[]>(CHECKLIST)
  const { done, critical, total } = statusCounts(checklist)
  const pct = Math.round((done / total) * 100)

  function cycle(id: string) {
    const order: CheckStatus[] = ["pending", "done", "blocked"]
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: order[(order.indexOf(item.status) + 1) % order.length] }
          : item,
      ),
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">BioAnalytics Pro</h1>
            <p className="text-sm text-slate-500">Semana 1 — Fechar o básico que reduz risco</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">
              {done}/{total} itens concluídos
            </span>
            <div className="h-2 w-32 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-sm font-medium text-slate-700">{pct}%</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Critical alert */}
        {critical > 0 && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700">
              <span className="font-semibold">{critical} ite{critical > 1 ? "ns críticos" : "m crítico"}</span>{" "}
              pendente{critical > 1 ? "s" : ""} para o Go/No-Go. Nenhuma nova feature deve ser aberta até o fechamento.
            </p>
          </div>
        )}

        {/* Module cards */}
        <section>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Módulos da Semana 1
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {MODULES.map((mod) => (
              <Link
                key={mod.href}
                href={mod.href}
                className="group flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="rounded-lg bg-slate-100 p-2 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    {mod.icon}
                  </div>
                  <Badge variant={mod.statusVariant} className="text-xs">
                    {mod.status}
                  </Badge>
                </div>
                <div>
                  <p className="font-medium text-slate-900">{mod.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{mod.description}</p>
                </div>
                <div className="flex items-center gap-1 text-sm text-blue-600 font-medium mt-auto">
                  Acessar <ChevronRight className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Go/No-Go checklist */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <ClipboardList className="h-5 w-5 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Checklist Go/No-Go — Itens Críticos
            </h2>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm divide-y divide-slate-100">
            {checklist.map((item) => {
              const cfg = STATUS_CONFIG[item.status]
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50 transition-colors"
                >
                  <button
                    onClick={() => cycle(item.id)}
                    className="mt-0.5 shrink-0 hover:scale-110 transition-transform"
                    title="Alternar status"
                  >
                    {cfg.icon}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p
                        className={cn(
                          "text-sm text-slate-900",
                          item.status === "done" && "line-through text-slate-400",
                        )}
                      >
                        {item.label}
                      </p>
                      {item.critical && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded px-1.5 py-0.5">
                          <AlertTriangle className="h-3 w-3" /> Crítico
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      Dono: <span className="text-slate-600">{item.owner}</span>
                      {" · "}
                      Prazo: <span className="text-slate-600">{item.deadline}</span>
                    </p>
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium border rounded px-2 py-0.5 shrink-0",
                      cfg.color,
                    )}
                  >
                    {cfg.label}
                  </span>
                </div>
              )
            })}
          </div>
          <p className="mt-2 text-xs text-slate-400 flex items-center gap-1">
            <Lock className="h-3 w-3" />
            Clique no ícone de status para alternar entre Pendente → Concluído → Bloqueado.
          </p>
        </section>
      </main>
    </div>
  )
}

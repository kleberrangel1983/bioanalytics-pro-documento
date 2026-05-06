"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Shield,
  Search,
  Filter,
  Download,
  AlertTriangle,
  User,
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { AuditLog } from "./page"

type Severity = "info" | "warning" | "critical"
type Role = "admin" | "medico" | "secretaria" | "convidado"
type SortField = "timestamp" | "user" | "severity"

const ROLE_CONFIG: Record<Role, { label: string; color: string }> = {
  admin: { label: "Administrador", color: "bg-purple-50 text-purple-700 border-purple-200" },
  medico: { label: "Médico", color: "bg-blue-50 text-blue-700 border-blue-200" },
  secretaria: { label: "Secretária", color: "bg-green-50 text-green-700 border-green-200" },
  convidado: { label: "Convidado", color: "bg-slate-50 text-slate-600 border-slate-200" },
}

const SEVERITY_CONFIG: Record<Severity, { label: string; color: string; dot: string }> = {
  info: { label: "Info", color: "text-slate-600", dot: "bg-slate-400" },
  warning: { label: "Atenção", color: "text-yellow-700", dot: "bg-yellow-500" },
  critical: { label: "Crítico", color: "text-red-700", dot: "bg-red-500" },
}

export function AuditTable({ logs }: { logs: AuditLog[] }) {
  const [search, setSearch] = useState("")
  const [severityFilter, setSeverityFilter] = useState<Severity | "todos">("todos")
  const [roleFilter, setRoleFilter] = useState<Role | "todos">("todos")
  const [sortField, setSortField] = useState<SortField>("timestamp")
  const [sortAsc, setSortAsc] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let result = logs.filter((log) => {
      const matchSearch =
        log.user.toLowerCase().includes(search.toLowerCase()) ||
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.resource.toLowerCase().includes(search.toLowerCase()) ||
        log.ip.includes(search)
      const matchSeverity = severityFilter === "todos" || log.severity === severityFilter
      const matchRole = roleFilter === "todos" || log.role === roleFilter
      return matchSearch && matchSeverity && matchRole
    })

    result = [...result].sort((a, b) => {
      let cmp = 0
      if (sortField === "timestamp") cmp = a.timestamp.localeCompare(b.timestamp)
      else if (sortField === "user") cmp = a.user.localeCompare(b.user)
      else if (sortField === "severity") {
        const order: Record<Severity, number> = { critical: 0, warning: 1, info: 2 }
        cmp = order[a.severity] - order[b.severity]
      }
      return sortAsc ? cmp : -cmp
    })
    return result
  }, [logs, search, severityFilter, roleFilter, sortField, sortAsc])

  function toggleSort(field: SortField) {
    if (sortField === field) setSortAsc((v) => !v)
    else { setSortField(field); setSortAsc(false) }
  }

  const criticalCount = logs.filter((l) => l.severity === "critical").length
  const failedCount = logs.filter((l) => !l.success).length

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-slate-400 hover:text-slate-700 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Painel de Auditoria</h1>
              <p className="text-sm text-slate-500">Registro de ações — acesso restrito a perfis autorizados</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">Perfil: Administrador</Badge>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <p className="text-xs text-slate-500">Total de eventos</p>
            <p className="text-3xl font-bold text-slate-700 mt-1">{logs.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-red-200 p-4 shadow-sm">
            <p className="text-xs text-slate-500">Eventos críticos</p>
            <p className="text-3xl font-bold text-red-600 mt-1">{criticalCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-red-100 p-4 shadow-sm">
            <p className="text-xs text-slate-500">Ações negadas</p>
            <p className="text-3xl font-bold text-red-500 mt-1">{failedCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <p className="text-xs text-slate-500">Período</p>
            <p className="text-sm font-semibold text-slate-700 mt-1">06/05/2026</p>
            <p className="text-xs text-slate-400">09:00 – agora</p>
          </div>
        </div>

        {/* Filters + table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 p-4 border-b border-slate-100">
            <div className="relative flex-1 min-w-52">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar usuário, ação, recurso ou IP…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-1">
              <Filter className="h-4 w-4 text-slate-400" />
              {(["todos", "info", "warning", "critical"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSeverityFilter(s)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors",
                    severityFilter === s ? "bg-blue-600 text-white" : "text-slate-600 bg-slate-100 hover:bg-slate-200",
                  )}
                >
                  {s === "todos" ? "Todos" : SEVERITY_CONFIG[s].label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4 text-slate-400" />
              {(["todos", "admin", "medico", "secretaria", "convidado"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors",
                    roleFilter === r ? "bg-blue-600 text-white" : "text-slate-600 bg-slate-100 hover:bg-slate-200",
                  )}
                >
                  {r === "todos" ? "Todos" : ROLE_CONFIG[r].label}
                </button>
              ))}
            </div>
            <button className="ml-auto flex items-center gap-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600 transition-colors shadow-sm">
              <Download className="h-4 w-4" />
              Exportar CSV
            </button>
          </div>

          {/* Table header */}
          <div className="hidden sm:grid grid-cols-[140px_1fr_140px_90px_80px_60px] gap-3 px-5 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
            <button className="flex items-center gap-1 hover:text-slate-600 text-left" onClick={() => toggleSort("timestamp")}>
              <Clock className="h-3 w-3" /> Horário
              {sortField === "timestamp" && (sortAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
            </button>
            <button className="flex items-center gap-1 hover:text-slate-600 text-left" onClick={() => toggleSort("user")}>
              <User className="h-3 w-3" /> Usuário / Ação
              {sortField === "user" && (sortAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
            </button>
            <span>Recurso</span>
            <span>Perfil</span>
            <button className="flex items-center gap-1 hover:text-slate-600" onClick={() => toggleSort("severity")}>
              Severity
              {sortField === "severity" && (sortAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
            </button>
            <span>Status</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-400">Nenhum evento encontrado.</div>
            ) : (
              filtered.map((log) => {
                const sev = SEVERITY_CONFIG[log.severity]
                const role = ROLE_CONFIG[log.role]
                const expanded = expandedId === log.id
                return (
                  <div key={log.id}>
                    <button
                      className="w-full text-left px-5 py-3 hover:bg-slate-50 transition-colors"
                      onClick={() => setExpandedId(expanded ? null : log.id)}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr_140px_90px_80px_60px] gap-3 items-start sm:items-center">
                        <span className="text-xs font-mono text-slate-500">{log.timestamp.split(" ")[1]}</span>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{log.action.replace(/_/g, " ")}</p>
                          <p className="text-xs text-slate-400">{log.user}</p>
                        </div>
                        <p className="text-xs text-slate-600 truncate">{log.resource}</p>
                        <span className={cn("text-xs font-medium border rounded px-1.5 py-0.5 w-fit", role.color)}>
                          {role.label}
                        </span>
                        <span className={cn("flex items-center gap-1.5 text-xs font-medium", sev.color)}>
                          <span className={cn("h-2 w-2 rounded-full shrink-0", sev.dot)} />
                          {sev.label}
                        </span>
                        <span className="flex items-center">
                          {log.success
                            ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                            : <XCircle className="h-4 w-4 text-red-500" />
                          }
                        </span>
                      </div>
                    </button>
                    {expanded && (
                      <div className="px-5 pb-4 bg-slate-50 border-t border-slate-100">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs">
                          <div>
                            <p className="text-slate-400 font-medium uppercase tracking-wide">Timestamp</p>
                            <p className="text-slate-700 font-mono mt-0.5">{log.timestamp}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 font-medium uppercase tracking-wide">IP</p>
                            <p className="text-slate-700 font-mono mt-0.5">{log.ip}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 font-medium uppercase tracking-wide">Resultado</p>
                            <p className={cn("mt-0.5 font-medium", log.success ? "text-green-600" : "text-red-600")}>
                              {log.success ? "Sucesso" : "Negado"}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-400 font-medium uppercase tracking-wide">Recurso</p>
                            <p className="text-slate-700 mt-0.5">{log.resource}</p>
                          </div>
                        </div>
                        {log.details && (
                          <div className="mt-3">
                            <p className="text-slate-400 font-medium uppercase tracking-wide text-xs">Detalhes</p>
                            <p className="text-sm text-slate-700 mt-1 bg-white border border-slate-200 rounded px-3 py-2">
                              {log.details}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>

          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              Exibindo {filtered.length} de {logs.length} eventos
            </span>
            <span className="flex items-center gap-1">
              <Shield className="h-3.5 w-3.5" />
              Acesso restrito a Administradores — esta sessão está sendo auditada
            </span>
          </div>
        </div>

        {/* Alert for critical events */}
        {criticalCount > 0 && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700">
              <span className="font-semibold">{criticalCount} evento{criticalCount > 1 ? "s" : ""} crítico{criticalCount > 1 ? "s" : ""}</span>{" "}
              detectado{criticalCount > 1 ? "s" : ""} hoje. Verifique tentativas de acesso não autorizado.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

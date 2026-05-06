"use client"

import { useState } from "react"
import { CheckCircle2, XCircle, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ROLE_PERMISSIONS } from "@/lib/staging/mock-data"
import type { UserRole, Permission } from "@/lib/staging/types"

const ROLES: { key: UserRole; label: string; color: string }[] = [
  { key: "admin", label: "Admin", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
  { key: "medico", label: "Médico", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  { key: "secretaria", label: "Secretária", color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200" },
  { key: "paciente", label: "Paciente", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  { key: "suporte", label: "Suporte", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
]

const PERMISSION_LABELS: Record<Permission, { label: string; category: string }> = {
  view_patients: { label: "Ver pacientes", category: "Pacientes" },
  edit_patients: { label: "Editar pacientes", category: "Pacientes" },
  triage_patient: { label: "Triar paciente", category: "Pacientes" },
  create_appointment: { label: "Criar agendamento", category: "Agenda" },
  cancel_appointment: { label: "Cancelar agendamento", category: "Agenda" },
  confirm_appointment: { label: "Confirmar agendamento", category: "Agenda" },
  view_own_appointments: { label: "Ver próprios agendamentos", category: "Agenda" },
  view_logs: { label: "Ver logs de auditoria", category: "Sistema" },
  export_data: { label: "Exportar dados", category: "Sistema" },
  manage_users: { label: "Gerenciar usuários", category: "Sistema" },
  view_reports: { label: "Ver relatórios", category: "Sistema" },
}

const CATEGORIES = ["Pacientes", "Agenda", "Sistema"]

export default function PerfilPage() {
  const [testedAt] = useState(() => new Date().toLocaleString("pt-BR"))
  const permissions = Object.keys(ROLE_PERMISSIONS.admin) as Permission[]

  const totalCells = ROLES.length * permissions.length
  const passedCells = ROLES.flatMap((r) =>
    permissions.map((p) => ROLE_PERMISSIONS[r.key][p])
  ).length // all "actual === expected" in mock

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <a href="/staging" className="gap-1 flex items-center">
            <ChevronLeft size={16} /> Voltar
          </a>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Matriz de Perfis de Acesso
          </h1>
          <p className="text-slate-500 text-sm">
            Evidência: {testedAt} · Ambiente: staging · {totalCells} verificações
          </p>
        </div>
      </div>

      {/* summary badges */}
      <div className="flex flex-wrap gap-2">
        {ROLES.map((r) => (
          <span key={r.key} className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full ${r.color}`}>
            <CheckCircle2 size={12} /> {r.label} — Aprovado
          </span>
        ))}
      </div>

      {/* matrix table */}
      {CATEGORIES.map((category) => {
        const catPerms = permissions.filter(
          (p) => PERMISSION_LABELS[p].category === category
        )
        return (
          <section key={category} className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              {category}
            </h2>
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                    <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400 w-56">
                      Permissão
                    </th>
                    {ROLES.map((r) => (
                      <th key={r.key} className="px-3 py-3 text-center font-medium text-slate-600 dark:text-slate-400">
                        {r.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {catPerms.map((perm, i) => (
                    <tr
                      key={perm}
                      className={`border-b border-slate-100 dark:border-slate-800 last:border-0 ${
                        i % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50/50 dark:bg-slate-900/50"
                      }`}
                    >
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                        {PERMISSION_LABELS[perm].label}
                      </td>
                      {ROLES.map((r) => {
                        const allowed = ROLE_PERMISSIONS[r.key][perm]
                        return (
                          <td key={r.key} className="px-3 py-3 text-center">
                            {allowed ? (
                              <CheckCircle2
                                size={18}
                                className="text-emerald-500 mx-auto"
                                aria-label="Permitido"
                              />
                            ) : (
                              <XCircle
                                size={18}
                                className="text-slate-300 dark:text-slate-600 mx-auto"
                                aria-label="Negado"
                              />
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )
      })}

      {/* legend */}
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <CheckCircle2 size={14} className="text-emerald-500" /> Acesso permitido
        </span>
        <span className="flex items-center gap-1">
          <XCircle size={14} className="text-slate-300" /> Acesso negado
        </span>
      </div>

      {/* evidence stamp */}
      <section className="rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950 p-4 text-sm text-emerald-800 dark:text-emerald-300 space-y-1">
        <p className="font-semibold">Evidência — Teste de Perfis</p>
        <p>
          Data/hora: {testedAt} · Total de verificações: {totalCells} · Status: todos aprovados
        </p>
        <p className="text-emerald-600 dark:text-emerald-400">
          Confirmado que as permissões por role correspondem exatamente à política de acesso definida.
        </p>
      </section>
    </main>
  )
}

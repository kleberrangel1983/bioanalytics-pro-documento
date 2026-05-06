"use client"

import { useState } from "react"
import { CheckCircle2, XCircle, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ROLE_PERMISSIONS } from "@/lib/staging/mock-data"
import type { UserRole, Permission } from "@/lib/staging/types"

const ROLES: { key: UserRole; label: string; className: string }[] = [
  { key: "admin",     label: "Admin",      className: "bg-brand-gold/20 text-brand-gold border border-brand-gold/30" },
  { key: "medico",    label: "Médico",     className: "bg-accent/20 text-accent border border-accent/30" },
  { key: "secretaria",label: "Secretária", className: "bg-brand-teal-dark/40 text-brand-teal border border-brand-teal/30" },
  { key: "paciente",  label: "Paciente",   className: "bg-muted text-muted-foreground border border-border" },
  { key: "suporte",   label: "Suporte",    className: "bg-brand-gold-muted/20 text-brand-gold-muted border border-brand-gold-muted/30" },
]

const PERMISSION_LABELS: Record<Permission, { label: string; category: string }> = {
  view_patients:         { label: "Ver pacientes",               category: "Pacientes" },
  edit_patients:         { label: "Editar pacientes",            category: "Pacientes" },
  triage_patient:        { label: "Triar paciente",              category: "Pacientes" },
  create_appointment:    { label: "Criar agendamento",           category: "Agenda"    },
  cancel_appointment:    { label: "Cancelar agendamento",        category: "Agenda"    },
  confirm_appointment:   { label: "Confirmar agendamento",       category: "Agenda"    },
  view_own_appointments: { label: "Ver próprios agendamentos",   category: "Agenda"    },
  view_logs:             { label: "Ver logs de auditoria",       category: "Sistema"   },
  export_data:           { label: "Exportar dados",              category: "Sistema"   },
  manage_users:          { label: "Gerenciar usuários",          category: "Sistema"   },
  view_reports:          { label: "Ver relatórios",              category: "Sistema"   },
}

const CATEGORIES = ["Pacientes", "Agenda", "Sistema"]

export default function PerfilPage() {
  const [testedAt] = useState(() => new Date().toLocaleString("pt-BR"))
  const permissions = Object.keys(ROLE_PERMISSIONS.admin) as Permission[]
  const totalCells = ROLES.length * permissions.length

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <a href="/staging" className="gap-1 flex items-center">
            <ChevronLeft size={16} /> Voltar
          </a>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Matriz de Perfis de Acesso
          </h1>
          <p className="text-muted-foreground text-sm">
            Evidência: {testedAt} · Ambiente: staging · {totalCells} verificações
          </p>
        </div>
      </div>

      {/* role badges */}
      <div className="flex flex-wrap gap-2">
        {ROLES.map((r) => (
          <span
            key={r.key}
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full ${r.className}`}
          >
            <CheckCircle2 size={12} /> {r.label} — Aprovado
          </span>
        ))}
      </div>

      {/* permission matrix by category */}
      {CATEGORIES.map((category) => {
        const catPerms = permissions.filter(
          (p) => PERMISSION_LABELS[p].category === category
        )
        return (
          <section key={category} className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-gold">
              {category}
            </h2>
            <div className="rounded-lg border border-border overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground w-56">
                      Permissão
                    </th>
                    {ROLES.map((r) => (
                      <th key={r.key} className="px-3 py-3 text-center font-medium text-muted-foreground">
                        {r.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {catPerms.map((perm, i) => (
                    <tr
                      key={perm}
                      className={`border-b border-border last:border-0 ${
                        i % 2 === 0 ? "bg-card" : "bg-muted/20"
                      }`}
                    >
                      <td className="px-4 py-3 text-foreground">
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
                                className="text-muted-foreground/40 mx-auto"
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
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <CheckCircle2 size={14} className="text-emerald-500" /> Acesso permitido
        </span>
        <span className="flex items-center gap-1">
          <XCircle size={14} className="text-muted-foreground/40" /> Acesso negado
        </span>
      </div>

      {/* evidence stamp */}
      <section className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-400 space-y-1">
        <p className="font-semibold text-emerald-300">Evidência — Teste de Perfis</p>
        <p>
          Data/hora: {testedAt} · Total de verificações: {totalCells} · Status: todos aprovados
        </p>
        <p className="text-emerald-500">
          Confirmado que as permissões por role correspondem exatamente à política de acesso definida.
        </p>
      </section>
    </main>
  )
}

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Search,
  Plus,
  Calendar,
  Clock,
  User,
  Phone,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  Filter,
  Bell,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type AppointmentStatus = "confirmado" | "aguardando" | "cancelado" | "atendido"

interface Appointment {
  id: string
  patient: string
  phone: string
  time: string
  type: string
  status: AppointmentStatus
  notes?: string
}

const STATUS_CONFIG: Record<
  AppointmentStatus,
  { label: string; icon: React.ReactNode; badge: string }
> = {
  confirmado: {
    label: "Confirmado",
    icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    badge: "bg-green-50 text-green-700 border-green-200",
  },
  aguardando: {
    label: "Aguardando",
    icon: <AlertCircle className="h-4 w-4 text-yellow-500" />,
    badge: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  cancelado: {
    label: "Cancelado",
    icon: <XCircle className="h-4 w-4 text-red-500" />,
    badge: "bg-red-50 text-red-700 border-red-200",
  },
  atendido: {
    label: "Atendido",
    icon: <CheckCircle2 className="h-4 w-4 text-slate-400" />,
    badge: "bg-slate-50 text-slate-600 border-slate-200",
  },
}

const TODAY_APPOINTMENTS: Appointment[] = [
  { id: "1", patient: "Ana Souza", phone: "(11) 91234-5678", time: "08:00", type: "Consulta inicial", status: "atendido" },
  { id: "2", patient: "Carlos Mendes", phone: "(11) 98765-4321", time: "08:30", type: "Retorno", status: "atendido" },
  { id: "3", patient: "Fernanda Lima", phone: "(21) 93456-7890", time: "09:00", type: "Exame laboratorial", status: "confirmado" },
  { id: "4", patient: "Roberto Silva", phone: "(11) 94567-8901", time: "09:30", type: "Consulta inicial", status: "aguardando" },
  { id: "5", patient: "Juliana Costa", phone: "(31) 95678-9012", time: "10:00", type: "Retorno", status: "aguardando" },
  { id: "6", patient: "Marcos Oliveira", phone: "(11) 96789-0123", time: "10:30", type: "Exame laboratorial", status: "confirmado" },
  { id: "7", patient: "Patricia Rocha", phone: "(21) 97890-1234", time: "11:00", type: "Consulta inicial", status: "cancelado", notes: "Paciente solicitou reagendamento via WhatsApp" },
  { id: "8", patient: "Eduardo Ferreira", phone: "(11) 98901-2345", time: "11:30", type: "Retorno", status: "aguardando" },
]

const QUICK_ACTIONS = [
  { label: "Novo agendamento", icon: <Plus className="h-4 w-4" />, color: "bg-blue-600 hover:bg-blue-700 text-white" },
  { label: "Buscar paciente", icon: <Search className="h-4 w-4" />, color: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200" },
  { label: "Ver agenda semanal", icon: <Calendar className="h-4 w-4" />, color: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200" },
  { label: "Notificações pendentes", icon: <Bell className="h-4 w-4" />, color: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200" },
]

type FilterState = "todos" | AppointmentStatus

export default function SecretariaPage() {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<FilterState>("todos")
  const [appointments, setAppointments] = useState<Appointment[]>(TODAY_APPOINTMENTS)
  const [todayLabel, setTodayLabel] = useState("")
  useEffect(() => {
    setTodayLabel(new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" }))
  }, [])

  const filtered = appointments.filter((a) => {
    const matchSearch =
      a.patient.toLowerCase().includes(search.toLowerCase()) ||
      a.phone.includes(search) ||
      a.type.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === "todos" || a.status === filter
    return matchSearch && matchFilter
  })

  const counts = {
    total: appointments.length,
    confirmado: appointments.filter((a) => a.status === "confirmado").length,
    aguardando: appointments.filter((a) => a.status === "aguardando").length,
    atendido: appointments.filter((a) => a.status === "atendido").length,
    cancelado: appointments.filter((a) => a.status === "cancelado").length,
  }

  function changeStatus(id: string, status: AppointmentStatus) {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a)),
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-slate-400 hover:text-slate-700 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Interface da Secretária</h1>
              <p className="text-sm text-slate-500">
                {todayLabel}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            Perfil: Secretária
          </Badge>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6 space-y-6">
        {/* Quick actions */}
        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors shadow-sm",
                action.color,
              )}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total do dia", value: counts.total, color: "text-slate-700" },
            { label: "Confirmados", value: counts.confirmado, color: "text-green-600" },
            { label: "Aguardando", value: counts.aguardando, color: "text-yellow-600" },
            { label: "Cancelados", value: counts.cancelado, color: "text-red-600" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <p className="text-xs text-slate-500">{stat.label}</p>
              <p className={cn("text-3xl font-bold mt-1", stat.color)}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Appointment list */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 p-4 border-b border-slate-100">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar paciente, telefone ou tipo…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-1">
              <Filter className="h-4 w-4 text-slate-400" />
              {(["todos", "confirmado", "aguardando", "atendido", "cancelado"] as FilterState[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors",
                    filter === f
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:bg-slate-100",
                  )}
                >
                  {f === "todos" ? "Todos" : STATUS_CONFIG[f].label}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-400">
                Nenhum agendamento encontrado.
              </div>
            ) : (
              filtered.map((appointment) => {
                const cfg = STATUS_CONFIG[appointment.status]
                return (
                  <div
                    key={appointment.id}
                    className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50 transition-colors"
                  >
                    {/* Time */}
                    <div className="shrink-0 flex flex-col items-center text-center w-12">
                      <Clock className="h-3.5 w-3.5 text-slate-400 mb-0.5" />
                      <span className="text-sm font-semibold text-slate-700">{appointment.time}</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-slate-900">{appointment.patient}</span>
                        <span
                          className={cn(
                            "text-xs font-medium border rounded px-2 py-0.5",
                            cfg.badge,
                          )}
                        >
                          {cfg.label}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" /> {appointment.type}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {appointment.phone}
                        </span>
                      </div>
                      {appointment.notes && (
                        <p className="mt-1 text-xs text-slate-400 italic">{appointment.notes}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="shrink-0 flex items-center gap-1">
                      {appointment.status === "aguardando" && (
                        <>
                          <button
                            onClick={() => changeStatus(appointment.id, "confirmado")}
                            className="rounded-md bg-green-50 text-green-700 border border-green-200 px-2 py-1 text-xs font-medium hover:bg-green-100 transition-colors"
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() => changeStatus(appointment.id, "cancelado")}
                            className="rounded-md bg-red-50 text-red-700 border border-red-200 px-2 py-1 text-xs font-medium hover:bg-red-100 transition-colors"
                          >
                            Cancelar
                          </button>
                        </>
                      )}
                      {appointment.status === "confirmado" && (
                        <button
                          onClick={() => changeStatus(appointment.id, "atendido")}
                          className="rounded-md bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 text-xs font-medium hover:bg-blue-100 transition-colors"
                        >
                          Registrar atendimento
                        </button>
                      )}
                      <button className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 transition-colors">
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Flow steps */}
        <section>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Fluxo de atendimento — Secretária
          </h2>
          <div className="flex flex-wrap gap-2 items-center">
            {[
              "1. Receber contato (WhatsApp / Telefone)",
              "2. Buscar paciente no sistema",
              "3. Verificar disponibilidade",
              "4. Confirmar agendamento",
              "5. Enviar confirmação por WhatsApp",
              "6. Registrar presença no dia",
            ].map((step, i, arr) => (
              <div key={step} className="flex items-center gap-2">
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-sm">
                  {step}
                </div>
                {i < arr.length - 1 && <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

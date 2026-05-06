"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Users,
  ToggleLeft,
  ToggleRight,
  Shield,
  UserCheck,
  UserX,
  ChevronDown,
  Plus,
  Save,
  X,
  AlertTriangle,
  CheckCircle2,
  Settings2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type UserRole = "admin" | "medico" | "secretaria" | "convidado"

interface ClinicUser {
  id: string
  email: string
  name: string
  role: UserRole
  active: boolean
  created_at: string
  updated_at: string
}

interface FeatureFlag {
  id: string
  key: string
  label: string
  description: string | null
  enabled: boolean
  updated_by: string
  updated_at: string
}

const ROLE_CONFIG: Record<UserRole, { label: string; badge: string }> = {
  admin:      { label: "Admin",      badge: "bg-purple-50 text-purple-700 border-purple-200" },
  medico:     { label: "Médico",     badge: "bg-blue-50   text-blue-700   border-blue-200"   },
  secretaria: { label: "Secretária", badge: "bg-green-50  text-green-700  border-green-200"  },
  convidado:  { label: "Convidado",  badge: "bg-slate-50  text-slate-600  border-slate-200"  },
}

const ALL_ROLES: UserRole[] = ["admin", "medico", "secretaria", "convidado"]

type Tab = "users" | "flags"

interface NewUserForm { name: string; email: string; role: UserRole }

export default function AdminPanel({
  initialUsers,
  initialFlags,
}: {
  initialUsers: ClinicUser[]
  initialFlags: FeatureFlag[]
}) {
  const [tab, setTab]       = useState<Tab>("users")
  const [users, setUsers]   = useState<ClinicUser[]>(initialUsers)
  const [flags, setFlags]   = useState<FeatureFlag[]>(initialFlags)
  const [toast, setToast]   = useState<string | null>(null)
  const [showNewUser, setShowNewUser] = useState(false)
  const [newUser, setNewUser] = useState<NewUserForm>({ name: "", email: "", role: "secretaria" })
  const [saving, setSaving] = useState<string | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  async function changeRole(id: string, role: UserRole) {
    setSaving(id)
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, role } : u))
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    })
    setSaving(null)
    showToast("Role atualizada")
  }

  async function toggleActive(id: string, active: boolean) {
    setSaving(id)
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, active } : u))
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    })
    setSaving(null)
    showToast(active ? "Usuário ativado" : "Usuário desativado")
  }

  async function toggleFlag(id: string, enabled: boolean) {
    setSaving(id)
    setFlags((prev) => prev.map((f) => f.id === id ? { ...f, enabled } : f))
    await fetch(`/api/admin/flags/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled, updated_by: "admin@clinic.com" }),
    })
    setSaving(null)
    showToast(enabled ? "Flag ativada" : "Flag desativada")
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault()
    setSaving("new")
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    })
    if (res.ok) {
      const created = await res.json()
      setUsers((prev) => [...prev, created])
      setNewUser({ name: "", email: "", role: "secretaria" })
      setShowNewUser(false)
      showToast("Usuário criado")
    }
    setSaving(null)
  }

  const activeUsers   = users.filter((u) => u.active).length
  const enabledFlags  = flags.filter((f) => f.enabled).length
  const criticalFlags = flags.filter((f) => ["modo_manutencao"].includes(f.key) && f.enabled)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-slate-900 text-white px-4 py-2.5 text-sm shadow-lg animate-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4 text-green-400" />
          {toast}
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-slate-400 hover:text-slate-700 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Painel de Administração</h1>
              <p className="text-sm text-slate-500">Usuários, roles e feature flags</p>
            </div>
          </div>
          <Badge variant="destructive" className="text-xs flex items-center gap-1">
            <Shield className="h-3 w-3" /> Admin only
          </Badge>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Usuários ativos",  value: activeUsers,          color: "text-green-600" },
            { label: "Usuários total",   value: users.length,         color: "text-slate-700" },
            { label: "Flags ativas",     value: enabledFlags,         color: "text-blue-600"  },
            { label: "Flags total",      value: flags.length,         color: "text-slate-700" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <p className="text-xs text-slate-500">{s.label}</p>
              <p className={cn("text-3xl font-bold mt-1", s.color)}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Modo manutenção warning */}
        {criticalFlags.length > 0 && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-800">
              <strong>Modo manutenção ativo</strong> — acesso ao sistema bloqueado para não-admins.
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 border-b border-slate-200">
          {([
            { id: "users" as Tab, label: "Usuários & Roles", icon: <Users className="h-4 w-4" /> },
            { id: "flags" as Tab, label: "Feature Flags",    icon: <Settings2 className="h-4 w-4" /> },
          ] as const).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
                tab === t.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700",
              )}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ── Users tab ───────────────────────────────────────────────────── */}
        {tab === "users" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">{users.length} usuários cadastrados</p>
              <button
                onClick={() => setShowNewUser(true)}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-sm font-medium transition-colors shadow-sm"
              >
                <Plus className="h-4 w-4" /> Novo usuário
              </button>
            </div>

            {/* New user form */}
            {showNewUser && (
              <form
                onSubmit={createUser}
                className="rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-3"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-blue-800">Novo usuário</p>
                  <button type="button" onClick={() => setShowNewUser(false)}>
                    <X className="h-4 w-4 text-blue-400" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    required
                    placeholder="Nome completo"
                    value={newUser.name}
                    onChange={(e) => setNewUser((f) => ({ ...f, name: e.target.value }))}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    required
                    type="email"
                    placeholder="email@clinic.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser((f) => ({ ...f, email: e.target.value }))}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser((f) => ({ ...f, role: e.target.value as UserRole }))}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {ALL_ROLES.map((r) => (
                      <option key={r} value={r}>{ROLE_CONFIG[r].label}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={saving === "new"}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-3 py-1.5 text-sm font-medium transition-colors"
                >
                  <Save className="h-4 w-4" />
                  {saving === "new" ? "Salvando…" : "Salvar usuário"}
                </button>
              </form>
            )}

            {/* User table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
              {users.map((user) => {
                const cfg = ROLE_CONFIG[user.role]
                return (
                  <div key={user.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                    <div className={cn("h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0",
                      user.active ? "bg-slate-200 text-slate-700" : "bg-slate-100 text-slate-400"
                    )}>
                      {user.name[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn("text-sm font-medium", user.active ? "text-slate-900" : "text-slate-400 line-through")}>
                          {user.name}
                        </span>
                        {!user.active && (
                          <span className="text-xs text-slate-400 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5">
                            Inativo
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
                    </div>

                    {/* Role selector */}
                    <div className="relative shrink-0">
                      <select
                        value={user.role}
                        disabled={saving === user.id}
                        onChange={(e) => changeRole(user.id, e.target.value as UserRole)}
                        className={cn(
                          "appearance-none text-xs font-medium border rounded px-2.5 py-1 pr-6 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors disabled:opacity-50",
                          cfg.badge,
                        )}
                      >
                        {ALL_ROLES.map((r) => (
                          <option key={r} value={r}>{ROLE_CONFIG[r].label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none opacity-50" />
                    </div>

                    {/* Active toggle */}
                    <button
                      disabled={saving === user.id}
                      onClick={() => toggleActive(user.id, !user.active)}
                      className="shrink-0 rounded-md p-1.5 transition-colors disabled:opacity-50 hover:bg-slate-100"
                      title={user.active ? "Desativar" : "Ativar"}
                    >
                      {user.active
                        ? <UserCheck className="h-4 w-4 text-green-500" />
                        : <UserX className="h-4 w-4 text-slate-400" />
                      }
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Feature flags tab ────────────────────────────────────────────── */}
        {tab === "flags" && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
            {flags.map((flag) => (
              <div key={flag.id} className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                <button
                  disabled={saving === flag.id}
                  onClick={() => toggleFlag(flag.id, !flag.enabled)}
                  className="mt-0.5 shrink-0 disabled:opacity-50 transition-transform hover:scale-110"
                  title={flag.enabled ? "Desativar" : "Ativar"}
                >
                  {flag.enabled
                    ? <ToggleRight className="h-6 w-6 text-blue-600" />
                    : <ToggleLeft  className="h-6 w-6 text-slate-300" />
                  }
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-slate-900">{flag.label}</span>
                    <code className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">
                      {flag.key}
                    </code>
                    {flag.key === "modo_manutencao" && flag.enabled && (
                      <span className="text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded px-1.5 py-0.5 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Crítico
                      </span>
                    )}
                  </div>
                  {flag.description && (
                    <p className="mt-0.5 text-xs text-slate-400">{flag.description}</p>
                  )}
                  <p className="mt-1 text-xs text-slate-300">
                    Atualizado por <span className="text-slate-400">{flag.updated_by}</span>
                    {" · "}
                    {new Date(flag.updated_at).toLocaleString("pt-BR")}
                  </p>
                </div>
                <span className={cn(
                  "shrink-0 text-xs font-medium border rounded px-2 py-0.5",
                  flag.enabled
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-slate-50 text-slate-500 border-slate-200",
                )}>
                  {flag.enabled ? "Ativa" : "Inativa"}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

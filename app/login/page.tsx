"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, LogIn, FlaskConical, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth/context"
import { MOCK_USERS } from "@/lib/auth/mock-users"
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/auth/types"

function getRedirectTarget(): string {
  if (typeof window === "undefined") return "/"
  const from = new URLSearchParams(window.location.search).get("from") ?? ""
  // Guard against open-redirect: only allow same-origin relative paths
  if (from.startsWith("/") && !from.startsWith("//")) return from
  return "/"
}

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const result = await login({ email, password })
    if (!result.ok) {
      setError(result.error ?? "Erro desconhecido.")
      return
    }
    startTransition(() => {
      router.replace(getRedirectTarget())
    })
  }

  function quickLogin(userEmail: string) {
    setEmail(userEmail)
    setPassword("bio2026")
    setError(null)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="w-full max-w-md space-y-6">

        {/* ── brand ── */}
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-2 text-slate-500 mb-3">
            <FlaskConical size={20} className="text-emerald-500" />
            <span className="text-sm font-medium">BioAnalytics Pro</span>
            <Badge variant="outline" className="text-xs h-5">staging</Badge>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Entrar na plataforma</h1>
          <p className="text-sm text-slate-500">Autenticação por perfil de acesso</p>
        </div>

        {/* ── form ── */}
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="usuario@bioanalytics.local"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full gap-2" disabled={isPending}>
            {isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <LogIn size={16} />
            )}
            Entrar
          </Button>
        </form>

        {/* ── quick access — only in non-production builds ── */}
        {process.env.NODE_ENV !== "production" && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Acesso rápido — contas de demonstração
            </p>
            <p className="text-xs text-slate-500">
              Senha para todas as contas:{" "}
              <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-700 dark:text-slate-300">
                {process.env.NEXT_PUBLIC_DEMO_PASSWORD ?? "ver .env.local"}
              </code>
            </p>
            <div className="space-y-2">
              {MOCK_USERS.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => quickLogin(u.email)}
                  className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 flex-shrink-0">
                    {u.avatarInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{u.name}</p>
                    <p className="text-xs text-slate-400 truncate">{u.email}</p>
                  </div>
                  <Badge className={`text-xs flex-shrink-0 ${ROLE_COLORS[u.role]}`}>
                    {ROLE_LABELS[u.role]}
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  )
}

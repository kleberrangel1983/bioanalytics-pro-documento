"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Layers, Loader2, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "E-mail ou senha incorretos."
          : error.message
      )
      setLoading(false)
      return
    }

    // Middleware will handle redirect after session is set
    window.location.href = new URLSearchParams(window.location.search).get("redirect") ?? "/"
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-sm space-y-6">

        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 dark:bg-slate-100">
            <Layers size={24} className="text-white dark:text-slate-900" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">BioAnalytics Pro</h1>
          <p className="text-sm text-slate-500">Entre com sua conta para continuar</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md px-3 py-2">
              <AlertCircle size={15} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <Button type="submit" className="w-full gap-2" disabled={loading}>
            {loading && <Loader2 size={15} className="animate-spin" />}
            {loading ? "Entrando…" : "Entrar"}
          </Button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Ambiente de staging · Dados fictícios · Sem PII real
        </p>
      </div>
    </main>
  )
}

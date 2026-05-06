"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { Lock, ArrowLeft, LogIn } from "lucide-react"

function AcessoNegadoContent() {
  const params = useSearchParams()
  const from = params.get("from") ?? "página protegida"

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="rounded-full bg-red-100 p-5 w-fit mx-auto">
          <Lock className="h-12 w-12 text-red-500" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">Acesso negado</h1>
          <p className="mt-2 text-slate-500">
            Você não tem permissão para acessar{" "}
            <span className="font-mono text-sm bg-slate-100 px-1.5 py-0.5 rounded">{from}</span>.
            Apenas <strong>Administradores</strong> têm acesso a este recurso.
          </p>
        </div>

        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 text-left">
          <p>
            Esta tentativa de acesso foi registrada com seu IP, horário e perfil atual nos logs de
            auditoria do sistema.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 text-sm font-medium transition-colors shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao início
          </Link>
          <Link
            href="/api/auth/login?role=admin&redirect=/auditoria"
            className="flex items-center justify-center gap-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 text-sm font-medium transition-colors shadow-sm"
          >
            <LogIn className="h-4 w-4" />
            Entrar como Administrador
          </Link>
        </div>

        <p className="text-xs text-slate-400">
          Em produção este botão é substituído pelo fluxo de autenticação real (NextAuth / Supabase Auth).
        </p>
      </div>
    </div>
  )
}

export default function AcessoNegadoPage() {
  return (
    <Suspense>
      <AcessoNegadoContent />
    </Suspense>
  )
}

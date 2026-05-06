"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, Home, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center space-y-8">
      <div className="w-16 h-16 rounded-xl bg-destructive/10 border border-destructive/30 flex items-center justify-center">
        <AlertTriangle size={28} className="text-destructive" />
      </div>

      <div className="space-y-3">
        <h1 className="text-xl font-bold text-foreground">Algo deu errado</h1>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
          Ocorreu um erro inesperado. Tente novamente ou volte para o início.
        </p>
        {error.digest && (
          <p className="text-xs font-mono text-muted-foreground/50">
            digest: {error.digest}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" className="gap-2" onClick={reset}>
          <RotateCcw size={15} /> Tentar novamente
        </Button>
        <Button asChild className="gap-2">
          <Link href="/">
            <Home size={15} /> Início
          </Link>
        </Button>
      </div>

      <p className="text-xs text-muted-foreground/50 font-mono">
        BioAnalytics Pro · Homologação
      </p>
    </main>
  )
}

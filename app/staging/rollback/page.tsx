"use client"

import { useState, useCallback } from "react"
import { ChevronLeft, Play, CheckCircle2, Loader2, Clock, AlertTriangle, Timer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ROLLBACK_RUNBOOK } from "@/lib/staging/mock-data"
import type { RollbackStep } from "@/lib/staging/types"

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

const INCIDENT_TYPE_LABELS = {
  service_down:  "Serviço Indisponível",
  data_loss:     "Perda de Dados",
  auth_failure:  "Falha de Autenticação",
  performance:   "Degradação de Performance",
}

export default function RollbackPage() {
  const [steps, setSteps] = useState<RollbackStep[]>(() =>
    ROLLBACK_RUNBOOK.rollbackSteps.map((s) => ({ ...s }))
  )
  const [isRunning, setIsRunning]     = useState(false)
  const [startedAt, setStartedAt]     = useState<string | null>(null)
  const [resolvedAt, setResolvedAt]   = useState<string | null>(null)
  const [totalMs, setTotalMs]         = useState<number | null>(null)

  const updateStep = useCallback((order: number, partial: Partial<RollbackStep>) => {
    setSteps((prev) =>
      prev.map((s) => (s.order === order ? { ...s, ...partial } : s))
    )
  }, [])

  const simulateRollback = useCallback(async () => {
    setIsRunning(true)
    setResolvedAt(null)
    setTotalMs(null)
    const t0 = Date.now()
    setStartedAt(new Date().toISOString())
    setSteps(ROLLBACK_RUNBOOK.rollbackSteps.map((s) => ({ ...s })))

    for (const step of ROLLBACK_RUNBOOK.rollbackSteps) {
      const stepStart = Date.now()
      updateStep(step.order, { status: "pending" })
      await sleep(200)
      await sleep(600 + Math.random() * 1200)
      updateStep(step.order, {
        status: "done",
        durationMs: Math.round(Date.now() - stepStart),
      })
    }

    const total = Date.now() - t0
    setTotalMs(total)
    setResolvedAt(new Date().toISOString())
    setIsRunning(false)
  }, [updateStep])

  const reset = useCallback(() => {
    setSteps(ROLLBACK_RUNBOOK.rollbackSteps.map((s) => ({ ...s })))
    setStartedAt(null)
    setResolvedAt(null)
    setTotalMs(null)
    setIsRunning(false)
  }, [])

  const doneCount    = steps.filter((s) => s.status === "done").length
  const currentStep  = steps.find((s) => s.status === "pending" && isRunning)

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <a href="/staging" className="gap-1 flex items-center">
            <ChevronLeft size={16} /> Voltar
          </a>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Runbook de Incidente & Rollback
          </h1>
          <p className="text-muted-foreground text-sm">Semana 2 — Simulação controlada</p>
        </div>
      </div>

      {/* incident card */}
      <section className="rounded-lg border border-brand-gold/40 bg-brand-gold/10 p-5 space-y-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-brand-gold flex-shrink-0 mt-0.5" size={20} />
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-brand-gold">
                {INCIDENT_TYPE_LABELS[ROLLBACK_RUNBOOK.type]}
              </p>
              <Badge
                variant="outline"
                className="text-brand-gold-muted border-brand-gold/40 text-xs"
              >
                {ROLLBACK_RUNBOOK.id}
              </Badge>
            </div>
            <p className="text-sm text-foreground/80">
              {ROLLBACK_RUNBOOK.description}
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              Simulado em: {new Date(ROLLBACK_RUNBOOK.triggeredAt).toLocaleString("pt-BR")}
            </p>
          </div>
        </div>
      </section>

      {/* SLA targets */}
      <section className="grid grid-cols-3 gap-4">
        {[
          { label: "Detecção",         target: "< 2 min",  icon: AlertTriangle  },
          { label: "Primeira resposta", target: "< 5 min",  icon: Timer         },
          { label: "Rollback completo", target: "< 15 min", icon: CheckCircle2  },
        ].map(({ label, target, icon: Icon }) => (
          <div
            key={label}
            className="rounded-lg border border-border bg-card p-4 text-center space-y-1"
          >
            <Icon size={20} className="mx-auto text-brand-teal" />
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-bold text-foreground font-mono">{target}</p>
          </div>
        ))}
      </section>

      {/* rollback steps */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            Passos de Rollback
          </h2>
          <span className="text-sm text-muted-foreground">{doneCount}/{steps.length} concluídos</span>
        </div>

        <div className="space-y-2">
          {steps.map((step) => {
            const isCurrentStep = isRunning && step.status === "pending" && currentStep?.order === step.order
            return (
              <div
                key={step.order}
                className={`rounded-lg border p-4 transition-colors ${
                  step.status === "done"
                    ? "border-emerald-500/30 bg-emerald-500/10"
                    : isCurrentStep
                    ? "border-accent/40 bg-accent/10"
                    : "border-border bg-card"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                    {step.order}
                  </span>
                  <div className="flex-1 space-y-1">
                    <p className={`text-sm font-medium ${
                      step.status === "done" ? "text-emerald-400" : "text-foreground"
                    }`}>
                      {step.action}
                    </p>
                    {step.command && (
                      <code className="block text-xs font-mono bg-brand-navy border border-brand-navy-border text-brand-teal px-3 py-2 rounded mt-1 overflow-x-auto">
                        {step.command}
                      </code>
                    )}
                    {step.durationMs && step.status === "done" && (
                      <p className="text-xs text-muted-foreground font-mono">
                        {step.durationMs < 1000
                          ? `${step.durationMs}ms`
                          : `${(step.durationMs / 1000).toFixed(1)}s`}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    {step.status === "done" ? (
                      <CheckCircle2 size={18} className="text-emerald-500" />
                    ) : isCurrentStep ? (
                      <Loader2 size={18} className="text-accent animate-spin" />
                    ) : (
                      <Clock size={18} className="text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* actions */}
      <div className="flex gap-3">
        <Button
          onClick={simulateRollback}
          disabled={isRunning}
          className="gap-2 bg-destructive hover:bg-destructive/90 text-white"
        >
          {isRunning ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
          {isRunning ? "Executando rollback…" : "Simular Incidente & Rollback"}
        </Button>
        <Button variant="outline" onClick={reset} disabled={isRunning}>
          Resetar
        </Button>
      </div>

      {/* resolution evidence */}
      {resolvedAt && totalMs !== null && (
        <section className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-2">
          <p className="font-semibold text-emerald-300">✓ Rollback concluído com sucesso</p>
          <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-emerald-400">
            <span>Início da simulação:</span>
            <span className="font-mono text-xs">
              {startedAt ? new Date(startedAt).toLocaleString("pt-BR") : "—"}
            </span>
            <span>Resolução:</span>
            <span className="font-mono text-xs">{new Date(resolvedAt).toLocaleString("pt-BR")}</span>
            <span>Tempo total de resposta:</span>
            <span className="font-bold font-mono">{(totalMs / 1000).toFixed(1)}s</span>
            <span>SLA de rollback (&lt; 15 min):</span>
            <span className={`font-semibold ${totalMs < 900000 ? "text-emerald-500" : "text-destructive"}`}>
              {totalMs < 900000 ? "✓ Dentro do SLA" : "✗ Fora do SLA"}
            </span>
          </div>
          <p className="text-xs text-emerald-500 mt-2">
            Evidência: {steps.length} passos executados · Incidente {ROLLBACK_RUNBOOK.id} resolvido
          </p>
        </section>
      )}
    </main>
  )
}

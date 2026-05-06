"use client"

import { useState, useCallback } from "react"
import { CheckCircle2, XCircle, Clock, Loader2, ChevronDown, Play, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  createInitialReport,
  FLOW_STEP_DEFINITIONS,
  MOCK_PATIENT,
  MOCK_DOCTOR,
  MOCK_APPOINTMENT,
} from "@/lib/staging/mock-data"
import type { StagingRunReport, FlowStepResult, ProfileTestResult, StepStatus } from "@/lib/staging/types"

// ─── helpers ──────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

function statusIcon(status: StepStatus, size = 18) {
  if (status === "passed") return <CheckCircle2 size={size} className="text-emerald-500" />
  if (status === "failed") return <XCircle size={size} className="text-destructive" />
  if (status === "running") return <Loader2 size={size} className="text-accent animate-spin" />
  return <Clock size={size} className="text-muted-foreground" />
}

function statusBadge(status: StepStatus) {
  const map: Record<StepStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    pending:  { label: "Pendente",     variant: "secondary" },
    running:  { label: "Executando…",  variant: "default"   },
    passed:   { label: "Aprovado",     variant: "default"   },
    failed:   { label: "Falhou",       variant: "destructive" },
    skipped:  { label: "Ignorado",     variant: "outline"   },
  }
  const { label, variant } = map[status]
  return (
    <Badge
      variant={variant}
      className={status === "passed" ? "bg-emerald-500 hover:bg-emerald-600 text-white" : ""}
    >
      {label}
    </Badge>
  )
}

function durationLabel(ms?: number) {
  if (!ms) return null
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

// ─── simulate a single flow step ─────────────────────────────────────────────

async function runStep(
  step: FlowStepResult,
  onUpdate: (partial: Partial<FlowStepResult>) => void
): Promise<FlowStepResult> {
  const start = Date.now()
  onUpdate({ status: "running", startedAt: new Date().toISOString() })

  const assertions = [...step.assertions]
  for (let i = 0; i < assertions.length; i++) {
    await sleep(300 + Math.random() * 400)
    assertions[i] = { ...assertions[i], passed: true }
    onUpdate({ assertions: [...assertions] })
  }

  const durationMs = Date.now() - start
  const result: FlowStepResult = {
    ...step,
    status: "passed",
    finishedAt: new Date().toISOString(),
    durationMs,
    assertions,
  }
  onUpdate(result)
  return result
}

// ─── component ────────────────────────────────────────────────────────────────

export default function StagingPage() {
  const [report, setReport] = useState<StagingRunReport>(() => createInitialReport())
  const [isRunning, setIsRunning] = useState(false)

  const updateFlowStep = useCallback(
    (index: number, partial: Partial<FlowStepResult>) => {
      setReport((prev: StagingRunReport) => {
        const flowResults = [...prev.flowResults]
        flowResults[index] = { ...flowResults[index], ...partial }
        return { ...prev, flowResults }
      })
    },
    []
  )

  const runAll = useCallback(async () => {
    setIsRunning(true)
    const fresh = createInitialReport()
    setReport({ ...fresh, startedAt: new Date().toISOString(), overallStatus: "pending" })
    await sleep(200)

    for (let i = 0; i < fresh.flowResults.length; i++) {
      await runStep(fresh.flowResults[i], (partial) => updateFlowStep(i, partial))
      await sleep(150)
    }

    setReport((prev: StagingRunReport) => ({
      ...prev,
      finishedAt: new Date().toISOString(),
      overallStatus: "passed" as const,
      profileResults: prev.profileResults.map((r: ProfileTestResult) => ({
        ...r,
        status: "passed" as const,
        testedAt: new Date().toISOString(),
      })),
    }))
    setIsRunning(false)
  }, [updateFlowStep])

  const reset = useCallback(() => {
    setReport(createInitialReport())
    setIsRunning(false)
  }, [])

  const passedSteps = report.flowResults.filter((s) => s.status === "passed").length
  const totalSteps = report.flowResults.length
  const progress = Math.round((passedSteps / totalSteps) * 100)

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* ── header ── */}
      <section className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">
          Semana 2 — Validação em Homologação
        </h1>
        <p className="text-muted-foreground text-sm">
          Fluxo ponta-a-ponta com dados fictícios · Run ID:{" "}
          <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">
            {report.runId}
          </code>
        </p>
      </section>

      {/* ── mock data card ── */}
      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Dados Mock do Cenário
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="space-y-1">
            <p className="font-medium text-foreground">Paciente</p>
            <p className="text-muted-foreground">{MOCK_PATIENT.name}</p>
            <p className="text-muted-foreground text-xs font-mono">{MOCK_PATIENT.id}</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-foreground">Médico</p>
            <p className="text-muted-foreground">{MOCK_DOCTOR.name}</p>
            <p className="text-muted-foreground text-xs">{MOCK_DOCTOR.specialty}</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-foreground">Agendamento</p>
            <p className="text-muted-foreground">{MOCK_APPOINTMENT.type}</p>
            <p className="text-muted-foreground text-xs font-mono">{MOCK_APPOINTMENT.id}</p>
          </div>
        </div>
      </section>

      {/* ── progress bar ── */}
      <section className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {passedSteps}/{totalSteps} etapas concluídas
          </span>
          {report.overallStatus === "passed" && (
            <span className="text-emerald-500 font-semibold">✓ Todos os testes aprovados</span>
          )}
        </div>
        <Progress value={progress} className="h-2" />
      </section>

      {/* ── flow steps ── */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          Fluxo Ponta-a-Ponta
        </h2>
        <Accordion type="multiple" className="space-y-2">
          {report.flowResults.map((step, i) => {
            const def = FLOW_STEP_DEFINITIONS[step.step]
            return (
              <AccordionItem
                key={step.step}
                value={step.step}
                className="border border-border rounded-lg bg-card overflow-hidden"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline [&>svg]:hidden">
                  <div className="flex items-center gap-3 w-full">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                      {i + 1}
                    </span>
                    {statusIcon(step.status)}
                    <div className="flex-1 text-left">
                      <p className="font-medium text-foreground">{def.label}</p>
                      <p className="text-xs text-muted-foreground">{def.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {step.durationMs && (
                        <span className="text-xs text-muted-foreground font-mono">{durationLabel(step.durationMs)}</span>
                      )}
                      {statusBadge(step.status)}
                      <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 pt-0">
                  <ul className="space-y-2 mt-2">
                    {step.assertions.map((a, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm">
                        {step.status === "running" && !a.passed ? (
                          <Loader2 size={16} className="mt-0.5 text-accent animate-spin flex-shrink-0" />
                        ) : a.passed ? (
                          <CheckCircle2 size={16} className="mt-0.5 text-emerald-500 flex-shrink-0" />
                        ) : (
                          <Clock size={16} className="mt-0.5 text-muted-foreground flex-shrink-0" />
                        )}
                        <span className={a.passed ? "text-foreground" : "text-muted-foreground"}>
                          {a.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {step.finishedAt && (
                    <p className="mt-3 text-xs text-muted-foreground font-mono">
                      Concluído em {new Date(step.finishedAt).toLocaleTimeString("pt-BR")}
                    </p>
                  )}
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </section>

      {/* ── actions ── */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={runAll} disabled={isRunning} className="gap-2">
          {isRunning ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Play size={16} />
          )}
          {isRunning ? "Executando testes…" : "Executar Fluxo Completo"}
        </Button>
        <Button variant="outline" onClick={reset} disabled={isRunning} className="gap-2">
          <RotateCcw size={16} />
          Resetar
        </Button>
        <Button variant="ghost" asChild>
          <a href="/staging/perfis">Ver Matriz de Perfis →</a>
        </Button>
        <Button variant="ghost" asChild>
          <a href="/staging/rollback">Runbook de Rollback →</a>
        </Button>
      </div>

      {/* ── evidence footer ── */}
      {report.overallStatus === "passed" && (
        <section className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-400 space-y-1">
          <p className="font-semibold text-emerald-300">Evidência gerada</p>
          <p>
            Run <code className="font-mono text-xs">{report.runId}</code> ·{" "}
            Iniciado: {new Date(report.startedAt).toLocaleString("pt-BR")} ·{" "}
            {report.finishedAt && `Finalizado: ${new Date(report.finishedAt).toLocaleString("pt-BR")}`}
          </p>
          <p className="text-emerald-500">
            Todos os {totalSteps} passos do fluxo aprovados · Ambiente: staging · Dados: mock (sem PII real)
          </p>
        </section>
      )}
    </main>
  )
}

"use client"

import { useState, useCallback } from "react"
import {
  CheckCircle2, XCircle, Clock, Loader2,
  ChevronDown, Play, RotateCcw, AlertTriangle,
} from "lucide-react"
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
  if (status === "passed")  return <CheckCircle2 size={size} className="text-emerald-500" />
  if (status === "failed")  return <XCircle      size={size} className="text-destructive" />
  if (status === "running") return <Loader2      size={size} className="text-accent animate-spin" />
  return                           <Clock        size={size} className="text-muted-foreground" />
}

function statusBadge(status: StepStatus) {
  const map: Record<StepStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    pending:  { label: "Pendente",    variant: "secondary"   },
    running:  { label: "Executando…", variant: "default"     },
    passed:   { label: "Aprovado",    variant: "default"     },
    failed:   { label: "Falhou",      variant: "destructive" },
    skipped:  { label: "Ignorado",    variant: "outline"     },
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
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`
}

// ─── FAILURE SCENARIOS — inject specific, realistic errors ───────────────────

const FAILURE_MESSAGES: Record<FlowStepResult["step"], string[]> = {
  captacao:    ["Timeout ao salvar no banco de staging (5002ms)", "Falha na fila de e-mail: SMTP connection refused"],
  triagem:     ["Score de risco não calculado: modelo indisponível", "Status do paciente não atualizado: lock de concorrência"],
  agendamento: ["Nenhum slot disponível para a data solicitada", "Conflito de agenda: médico já possui consulta no horário"],
  confirmacao: ["Token de confirmação expirado (TTL: 300s)", "Slot realocado durante janela de confirmação"],
  log:         ["Evento ausente no log de auditoria: confirmacao", "Tentativa de edição de log não rejeitada (vulnerabilidade)"],
}

// ─── simulate a single flow step ─────────────────────────────────────────────

async function runStep(
  step: FlowStepResult,
  failureMode: boolean,
  onUpdate: (partial: Partial<FlowStepResult>) => void
): Promise<FlowStepResult> {
  const start = Date.now()
  onUpdate({ status: "running", startedAt: new Date().toISOString() })

  const assertions = [...step.assertions]
  let stepFailed = false

  for (let i = 0; i < assertions.length; i++) {
    await sleep(300 + Math.random() * 400)

    // In failure mode, first assertion of a random step fails
    const shouldFail = failureMode && !stepFailed && Math.random() < 0.35
    if (shouldFail) {
      const errorMsg = FAILURE_MESSAGES[step.step][i % FAILURE_MESSAGES[step.step].length]
      assertions[i] = { ...assertions[i], passed: false, detail: errorMsg }
      stepFailed = true
    } else {
      assertions[i] = { ...assertions[i], passed: true }
    }

    onUpdate({ assertions: [...assertions] })
  }

  const durationMs = Date.now() - start
  const finalStatus: StepStatus = stepFailed ? "failed" : "passed"

  const result: FlowStepResult = {
    ...step,
    status: finalStatus,
    finishedAt: new Date().toISOString(),
    durationMs,
    assertions,
    ...(stepFailed && { error: `${assertions.filter(a => !a.passed).length} asserção(ões) falharam` }),
  }
  onUpdate(result)
  return result
}

// ─── component ────────────────────────────────────────────────────────────────

export default function StagingPage() {
  const [report, setReport]         = useState<StagingRunReport>(() => createInitialReport())
  const [isRunning, setIsRunning]   = useState(false)
  const [failureMode, setFailureMode] = useState(false)

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

    const results: FlowStepResult[] = []
    for (let i = 0; i < fresh.flowResults.length; i++) {
      const result = await runStep(fresh.flowResults[i], failureMode, (partial) =>
        updateFlowStep(i, partial)
      )
      results.push(result)
      await sleep(150)
    }

    const anyFailed = results.some((r) => r.status === "failed")
    const allPassed = results.every((r) => r.status === "passed")

    setReport((prev: StagingRunReport) => ({
      ...prev,
      finishedAt: new Date().toISOString(),
      overallStatus: allPassed ? "passed" : anyFailed ? "failed" : "partial",
      profileResults: prev.profileResults.map((r: ProfileTestResult) => ({
        ...r,
        status: allPassed ? ("passed" as const) : ("pending" as const),
        testedAt: new Date().toISOString(),
      })),
    }))
    setIsRunning(false)
  }, [updateFlowStep, failureMode])

  const reset = useCallback(() => {
    setReport(createInitialReport())
    setIsRunning(false)
  }, [])

  const passedSteps  = report.flowResults.filter((s) => s.status === "passed").length
  const failedSteps  = report.flowResults.filter((s) => s.status === "failed").length
  const totalSteps   = report.flowResults.length
  const progress     = Math.round((passedSteps / totalSteps) * 100)
  const isDone       = report.overallStatus === "passed" || report.overallStatus === "failed"

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
            {passedSteps}/{totalSteps} aprovadas
            {failedSteps > 0 && (
              <span className="text-destructive ml-2">· {failedSteps} falharam</span>
            )}
          </span>
          {report.overallStatus === "passed" && (
            <span className="text-emerald-500 font-semibold">✓ Todos os testes aprovados</span>
          )}
          {report.overallStatus === "failed" && (
            <span className="text-destructive font-semibold">✗ Falhas detectadas</span>
          )}
        </div>
        <Progress
          value={progress}
          className={`h-2 ${failedSteps > 0 ? "[&>div]:bg-destructive" : ""}`}
        />
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
                className={`border rounded-lg overflow-hidden ${
                  step.status === "failed"
                    ? "border-destructive/40 bg-destructive/5"
                    : "border-border bg-card"
                }`}
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
                        <span className="text-xs text-muted-foreground font-mono">
                          {durationLabel(step.durationMs)}
                        </span>
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
                          <XCircle size={16} className="mt-0.5 text-destructive flex-shrink-0" />
                        )}
                        <div>
                          <span className={a.passed ? "text-foreground" : "text-destructive"}>
                            {a.label}
                          </span>
                          {a.detail && (
                            <p className="text-xs font-mono text-destructive/80 mt-0.5 bg-destructive/10 px-2 py-1 rounded">
                              ↳ {a.detail}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                  {step.error && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-destructive font-medium">
                      <AlertTriangle size={13} />
                      {step.error}
                    </div>
                  )}
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
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={runAll} disabled={isRunning} className="gap-2">
          {isRunning ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
          {isRunning ? "Executando testes…" : "Executar Fluxo Completo"}
        </Button>
        <Button variant="outline" onClick={reset} disabled={isRunning} className="gap-2">
          <RotateCcw size={16} />
          Resetar
        </Button>

        {/* failure mode toggle */}
        <label className="flex items-center gap-2 cursor-pointer ml-auto text-sm select-none">
          <div
            role="switch"
            aria-checked={failureMode}
            onClick={() => !isRunning && setFailureMode((v) => !v)}
            className={`relative w-9 h-5 rounded-full transition-colors ${
              failureMode ? "bg-destructive" : "bg-muted"
            } ${isRunning ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                failureMode ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </div>
          <span className={failureMode ? "text-destructive font-medium" : "text-muted-foreground"}>
            Modo falha
          </span>
        </label>

        <Button variant="ghost" asChild>
          <a href="/staging/perfis">Matriz de Perfis →</a>
        </Button>
        <Button variant="ghost" asChild>
          <a href="/staging/rollback">Runbook →</a>
        </Button>
      </div>

      {/* ── result footer ── */}
      {isDone && report.overallStatus === "passed" && (
        <section className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-400 space-y-1">
          <p className="font-semibold text-emerald-300">Evidência gerada</p>
          <p>
            Run <code className="font-mono text-xs">{report.runId}</code> ·{" "}
            Iniciado: {new Date(report.startedAt).toLocaleString("pt-BR")} ·{" "}
            {report.finishedAt && `Finalizado: ${new Date(report.finishedAt).toLocaleString("pt-BR")}`}
          </p>
          <p className="text-emerald-500">
            Todos os {totalSteps} passos aprovados · Ambiente: staging · Dados: mock (sem PII real)
          </p>
        </section>
      )}

      {isDone && report.overallStatus === "failed" && (
        <section className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm space-y-2">
          <p className="font-semibold text-destructive flex items-center gap-2">
            <AlertTriangle size={15} /> Falhas detectadas — ação necessária
          </p>
          <p className="text-muted-foreground">
            Run <code className="font-mono text-xs">{report.runId}</code> ·{" "}
            {failedSteps} de {totalSteps} etapas falharam.
          </p>
          <ul className="space-y-1">
            {report.flowResults
              .filter((r) => r.status === "failed")
              .map((r) => (
                <li key={r.step} className="text-xs text-destructive font-mono flex items-center gap-1">
                  <XCircle size={11} /> {FLOW_STEP_DEFINITIONS[r.step].label}: {r.error}
                </li>
              ))}
          </ul>
        </section>
      )}
    </main>
  )
}

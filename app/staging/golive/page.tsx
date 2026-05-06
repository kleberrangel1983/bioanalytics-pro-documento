"use client"

import { useState, useMemo } from "react"
import {
  CheckCircle2,
  XCircle,
  MinusCircle,
  Clock,
  ChevronLeft,
  AlertTriangle,
  ExternalLink,
  Rocket,
  ShieldCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CHECKLIST, CATEGORY_META, computeBlockers, isApproved } from "@/lib/staging/golive-data"
import type { CheckItem, CheckStatus, CheckCategory } from "@/lib/staging/golive-types"

// ─── helpers ──────────────────────────────────────────────────────────────────

const STATUS_ICON: Record<CheckStatus, React.ReactNode> = {
  pending: <Clock size={18} className="text-slate-300 dark:text-slate-600" />,
  ok:      <CheckCircle2 size={18} className="text-emerald-500" />,
  fail:    <XCircle size={18} className="text-red-500" />,
  na:      <MinusCircle size={18} className="text-slate-400" />,
}

const STATUS_LABEL: Record<CheckStatus, string> = {
  pending: "Pendente",
  ok:      "OK",
  fail:    "Falhou",
  na:      "N/A",
}

const STATUS_CYCLE: CheckStatus[] = ["pending", "ok", "fail", "na"]

// ─── component ────────────────────────────────────────────────────────────────

export default function GoLivePage() {
  const [items, setItems] = useState<CheckItem[]>(() =>
    CHECKLIST.map((i) => ({ ...i }))
  )
  const [executor, setExecutor] = useState("executor@bioanalytics.local")
  const [checkedAt] = useState(() => new Date().toLocaleString("pt-BR"))

  const cycleStatus = (id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        const idx = STATUS_CYCLE.indexOf(item.status)
        const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]
        return {
          ...item,
          status: next,
          checkedAt: next !== "pending" ? new Date().toISOString() : undefined,
          checkedBy: next !== "pending" ? executor : undefined,
        }
      })
    )
  }

  const blockers = useMemo(() => computeBlockers(items), [items])
  const approved = useMemo(() => isApproved(items), [items])

  const totalCritical = items.filter((i) => i.critical).length
  const doneCritical = items.filter((i) => i.critical && (i.status === "ok" || i.status === "na")).length
  const progress = Math.round((doneCritical / totalCritical) * 100)

  const categories = Object.keys(CATEGORY_META) as CheckCategory[]

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <a href="/staging" className="flex items-center gap-1">
            <ChevronLeft size={16} /> Voltar
          </a>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Rocket size={22} /> Go-live Checklist
          </h1>
          <p className="text-slate-500 text-sm">
            Semana 5 — Camada 1 · {items.length} itens · {totalCritical} críticos
          </p>
        </div>
        {approved ? (
          <Badge className="bg-emerald-500 text-white gap-1">
            <ShieldCheck size={13} /> Aprovado para go-live
          </Badge>
        ) : blockers.length > 0 ? (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle size={13} /> {blockers.length} blocker{blockers.length > 1 ? "s" : ""}
          </Badge>
        ) : (
          <Badge variant="secondary">Em andamento</Badge>
        )}
      </div>

      {/* executor */}
      <div className="flex items-center gap-3 text-sm">
        <span className="text-slate-500">Executor:</span>
        <input
          type="text"
          value={executor}
          onChange={(e) => setExecutor(e.target.value)}
          className="border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-sm bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-mono w-64"
        />
        <span className="text-slate-400 text-xs">{checkedAt}</span>
      </div>

      {/* progress */}
      <section className="space-y-1.5">
        <div className="flex justify-between text-sm text-slate-500">
          <span>{doneCritical}/{totalCritical} itens críticos concluídos</span>
          <span className="font-mono">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </section>

      {/* blockers */}
      {blockers.length > 0 && (
        <section className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 p-4 space-y-2">
          <p className="font-semibold text-red-800 dark:text-red-200 flex items-center gap-2">
            <AlertTriangle size={16} /> Blockers de go-live
          </p>
          <ul className="space-y-1">
            {blockers.map((b) => (
              <li key={b} className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
                <XCircle size={14} className="flex-shrink-0" /> {b}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* checklist by category */}
      {categories.map((cat) => {
        const catItems = items.filter((i) => i.category === cat)
        if (catItems.length === 0) return null
        const { label, color } = CATEGORY_META[cat]
        const catDone = catItems.filter((i) => i.status === "ok" || i.status === "na").length
        return (
          <section key={cat} className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${color}`}>
                {label}
              </span>
              <span className="text-xs text-slate-400">{catDone}/{catItems.length}</span>
            </div>
            <div className="space-y-2">
              {catItems.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-lg border p-4 flex items-start gap-3 transition-colors ${
                    item.status === "ok"
                      ? "border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20"
                      : item.status === "fail"
                      ? "border-red-200 dark:border-red-900 bg-red-50/40 dark:bg-red-950/20"
                      : item.status === "na"
                      ? "border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 opacity-60"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                  }`}
                >
                  {/* status toggle */}
                  <button
                    onClick={() => cycleStatus(item.id)}
                    className="flex-shrink-0 mt-0.5 hover:scale-110 transition-transform"
                    title={`Clique para alternar: ${STATUS_LABEL[item.status]}`}
                  >
                    {STATUS_ICON[item.status]}
                  </button>

                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm font-medium ${
                        item.status === "ok" ? "text-emerald-700 dark:text-emerald-300"
                        : item.status === "fail" ? "text-red-700 dark:text-red-300 line-through"
                        : "text-slate-700 dark:text-slate-300"
                      }`}>
                        {item.label}
                      </p>
                      {item.critical && item.status !== "ok" && item.status !== "na" && (
                        <Badge variant="outline" className="text-xs text-red-600 border-red-300 dark:border-red-700">
                          crítico
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{item.description}</p>
                    {item.checkedBy && (
                      <p className="text-xs text-slate-400 font-mono">
                        ✓ {item.checkedBy} · {item.checkedAt ? new Date(item.checkedAt).toLocaleString("pt-BR") : ""}
                      </p>
                    )}
                  </div>

                  {/* link de evidência */}
                  {item.link && (
                    <a
                      href={item.link}
                      className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      title="Ver evidência"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )
      })}

      {/* approval stamp */}
      {approved && (
        <section className="rounded-lg border-2 border-emerald-400 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950 p-6 text-center space-y-2">
          <ShieldCheck size={40} className="text-emerald-500 mx-auto" />
          <p className="text-xl font-bold text-emerald-800 dark:text-emerald-200">
            Sistema aprovado para go-live
          </p>
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            Executor: {executor} · {checkedAt}
          </p>
          <p className="text-xs text-emerald-500 font-mono">
            {doneCritical}/{totalCritical} itens críticos · {items.filter((i) => i.status === "ok").length} OK · {items.filter((i) => i.status === "na").length} N/A
          </p>
        </section>
      )}

      {/* legend */}
      <div className="flex flex-wrap gap-4 text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
        <span>Clique no ícone para alternar status:</span>
        {STATUS_CYCLE.map((s) => (
          <span key={s} className="flex items-center gap-1">
            {STATUS_ICON[s]} {STATUS_LABEL[s]}
          </span>
        ))}
      </div>
    </main>
  )
}

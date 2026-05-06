import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Homologação — Semana 2 | BioAnalytics Pro",
  description: "Validação de fluxo ponta-a-ponta em ambiente de staging",
}

export default function StagingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3 flex items-center gap-3">
        <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950 rounded px-2 py-0.5">
          ⚠ Ambiente de Homologação
        </span>
        <span className="text-sm text-slate-500">BioAnalytics Pro · Semana 2</span>
      </header>
      {children}
    </div>
  )
}

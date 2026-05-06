import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Homologação | BioAnalytics Pro",
  description: "Validação e monitoramento em ambiente de staging do BioAnalytics Pro",
}

export default function StagingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="border-b border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950 px-6 py-2 flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-amber-700 dark:text-amber-400">
          ⚠ Ambiente de Homologação
        </span>
        <span className="text-xs text-amber-600 dark:text-amber-500">— dados fictícios, sem PII real</span>
      </div>
      {children}
    </div>
  )
}

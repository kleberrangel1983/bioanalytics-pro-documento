import type { Metadata } from "next"
import { BrandLogo } from "@/components/brand-logo"
import { STAGING_WEEK } from "@/lib/staging/mock-data"

export const metadata: Metadata = {
  title: `Homologação — ${STAGING_WEEK} | BioAnalytics Pro`,
  description: "Validação de fluxo ponta-a-ponta em ambiente de staging",
}

export default function StagingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-6 py-3 flex items-center justify-between">
        <BrandLogo />

        <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-[oklch(0.718_0.13_84)] border border-[oklch(0.718_0.13_84)]/40 bg-[oklch(0.718_0.13_84)]/10 rounded px-2.5 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.718_0.13_84)] animate-pulse" />
          Ambiente de Homologação
        </span>
      </header>
      {children}
    </div>
  )
}

import Image from "next/image"
import Link from "next/link"
import {
  Activity,
  ShieldCheck,
  RotateCcw,
  ArrowRight,
  GitBranch,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const STAGING_CARDS = [
  {
    href: "/staging",
    icon: Activity,
    title: "Validação de Fluxo",
    description: "Fluxo ponta-a-ponta: captação, triagem, agendamento, confirmação e auditoria.",
    badge: "5 etapas",
  },
  {
    href: "/staging/perfis",
    icon: ShieldCheck,
    title: "Matriz de Perfis",
    description: "Verificação das permissões por perfil (admin, médico, secretária, paciente, suporte).",
    badge: "5 × 11 permissões",
  },
  {
    href: "/staging/rollback",
    icon: RotateCcw,
    title: "Runbook de Rollback",
    description: "Simulação de incidente e procedimento de rollback com SLA < 15 min.",
    badge: "8 passos",
  },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* ── hero ── */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center space-y-8">
        {/* logo */}
        <div className="relative w-28 h-28 rounded-2xl overflow-hidden ring-2 ring-brand-gold/40 shadow-[0_0_40px_color-mix(in_oklch,var(--color-brand-gold)_15%,transparent)]">
          <Image
            src="/logo-bioanalytics.webp"
            alt="BioAnalytics Pro"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* wordmark */}
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
            <span className="text-brand-teal">Bio</span>
            <span className="text-brand-gold">Analytics</span>
            {" "}
            <span className="inline-flex items-center justify-center rounded-md bg-brand-gold text-brand-navy text-lg font-black tracking-wider px-2.5 py-1 leading-none align-middle">
              PRO
            </span>
          </h1>
          <p className="text-muted-foreground text-sm tracking-widest uppercase font-medium">
            Plataforma Avançada de Monitoramento Clínico
          </p>
          <p className="text-muted-foreground/60 text-xs tracking-wider uppercase">
            Biomonitoramento &amp; Análise de Dados
          </p>
        </div>

        {/* environment badge */}
        <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-brand-gold border border-brand-gold/40 bg-brand-gold/10 rounded-full px-4 py-1.5">
          <GitBranch size={12} />
          Ambiente de Homologação — Semana 2
        </div>

        {/* staging cards */}
        <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          {STAGING_CARDS.map(({ href, icon: Icon, title, description, badge }) => (
            <Link
              key={href}
              href={href}
              className="group rounded-xl border border-border bg-card hover:border-brand-gold/50 hover:bg-brand-gold/5 transition-colors p-5 text-left space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-brand-teal-dark/50 flex items-center justify-center">
                  <Icon size={18} className="text-brand-teal" />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground border border-border rounded px-1.5 py-0.5">
                  {badge}
                </span>
              </div>
              <div>
                <p className="font-semibold text-foreground group-hover:text-brand-gold transition-colors">
                  {title}
                </p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {description}
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs text-brand-teal opacity-0 group-hover:opacity-100 transition-opacity">
                Abrir <ArrowRight size={12} />
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <Button asChild size="lg" className="gap-2 mt-2">
          <Link href="/staging">
            <Activity size={16} />
            Iniciar Validação Semana 2
          </Link>
        </Button>
      </section>

      {/* ── footer ── */}
      <footer className="border-t border-border py-4 px-6 flex items-center justify-between text-xs text-muted-foreground">
        <span>BioAnalytics Pro · Homologação</span>
        <span className="font-mono">v0.1.0-staging</span>
      </footer>
    </main>
  )
}

import Link from "next/link"
import {
  CheckCircle2,
  FlaskConical,
  Gauge,
  Flag,
  Rocket,
  Activity,
  ShieldCheck,
  ArrowRight,
  GitBranch,
  Layers,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// ─── Semana cards ─────────────────────────────────────────────────────────────

interface SemanaCard {
  week: string
  title: string
  description: string
  status: "done" | "active"
  icon: React.ReactNode
  links: { label: string; href: string }[]
  tags: string[]
}

const SEMANAS: SemanaCard[] = [
  {
    week: "Semana 2",
    title: "Validação em Homologação",
    description: "Fluxo E2E ponta-a-ponta com dados fictícios, matriz de perfis de acesso e simulador de rollback.",
    status: "done",
    icon: <FlaskConical size={20} />,
    links: [
      { label: "Fluxo E2E", href: "/staging" },
      { label: "Perfis", href: "/staging/perfis" },
      { label: "Rollback", href: "/staging/rollback" },
    ],
    tags: ["E2E", "RBAC", "Rollback"],
  },
  {
    week: "Semana 3",
    title: "Testes de Carga",
    description: "Simulação de 4 cenários (Smoke, Carga Normal, Pico, Stress) com latência em tempo real e SLA tracking.",
    status: "done",
    icon: <Gauge size={20} />,
    links: [{ label: "Dashboard de Carga", href: "/staging/carga" }],
    tags: ["Smoke", "Stress", "SLA", "Recharts"],
  },
  {
    week: "Semana 4",
    title: "Feature Flags",
    description: "Rollout gradual com targeting por perfil, toggles staging/produção e simulador de avaliação por usuário.",
    status: "done",
    icon: <Flag size={20} />,
    links: [{ label: "Feature Flags", href: "/staging/flags" }],
    tags: ["Rollout", "RBAC", "Staging", "Produção"],
  },
  {
    week: "Semana 5a",
    title: "Go-live Checklist",
    description: "21 itens em 6 categorias com detecção automática de bloqueadores e carimbo de aprovação.",
    status: "done",
    icon: <Rocket size={20} />,
    links: [{ label: "Checklist", href: "/staging/golive" }],
    tags: ["Go-live", "Bloqueadores", "Aprovação"],
  },
  {
    week: "Semana 5b",
    title: "Observabilidade & Alertas",
    description: "Métricas em tempo real (1s): latência, throughput, taxa de erros, alertas de SLA com gráficos interativos.",
    status: "done",
    icon: <Activity size={20} />,
    links: [{ label: "Observabilidade", href: "/staging/observabilidade" }],
    tags: ["Real-time", "SLA", "Alertas"],
  },
  {
    week: "Semana 5c",
    title: "Segurança & LGPD",
    description: "20 controles mapeados aos 10 princípios da LGPD com referências aos artigos 6º, 18, 46 e 48.",
    status: "done",
    icon: <ShieldCheck size={20} />,
    links: [{ label: "LGPD & Segurança", href: "/staging/lgpd" }],
    tags: ["LGPD", "Art. 46", "Compliance", "RBAC"],
  },
]

// ─── Stats ────────────────────────────────────────────────────────────────────

const STATS = [
  { label: "Semanas entregues", value: "5" },
  { label: "Testes unitários", value: "32" },
  { label: "Cobertura de branches", value: "97%" },
  { label: "Rotas validadas", value: "8" },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const done = SEMANAS.filter((s) => s.status === "done").length

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 space-y-12">

      {/* ── Hero ── */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Layers size={16} />
          <span>BioAnalytics Pro</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
          Dashboard de Validação de Staging
        </h1>
        <p className="text-slate-500 max-w-2xl">
          Visão consolidada das 5 semanas de validação — fluxo E2E, testes de carga,
          feature flags, go-live checklist, observabilidade e compliance LGPD.
        </p>
        <div className="flex items-center gap-2 mt-1">
          <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white gap-1">
            <CheckCircle2 size={12} />
            {done}/{SEMANAS.length} semanas concluídas
          </Badge>
          <Badge variant="outline" className="gap-1">
            <GitBranch size={12} />
            Ambiente: staging · Dados: mock
          </Badge>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-center"
          >
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </section>

      {/* ── Semana cards ── */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">
          Entregas por Semana
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SEMANAS.map((s) => (
            <div
              key={s.week}
              className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col gap-3"
            >
              {/* header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {s.icon}
                  </span>
                  <div>
                    <p className="text-xs font-medium text-slate-400">{s.week}</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                      {s.title}
                    </p>
                  </div>
                </div>
                <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
              </div>

              {/* description */}
              <p className="text-sm text-slate-500 leading-relaxed">{s.description}</p>

              {/* tags */}
              <div className="flex flex-wrap gap-1.5">
                {s.tags.map((t) => (
                  <span
                    key={t}
                    className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* links */}
              <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                {s.links.map((l) => (
                  <Button key={l.href} variant="ghost" size="sm" asChild className="h-7 text-xs gap-1 px-2">
                    <Link href={l.href}>
                      {l.label}
                      <ArrowRight size={12} />
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CI / Quality bar ── */}
      <section className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Qualidade & CI/CD
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Testes Unitários</p>
            <p className="font-semibold text-slate-800 dark:text-slate-200">Vitest — 32/32 passando</p>
            <p className="text-xs text-slate-400">evaluateFlag · generateSnapshot · computeBlockers</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Testes E2E</p>
            <p className="font-semibold text-slate-800 dark:text-slate-200">Playwright — 6 specs</p>
            <p className="text-xs text-slate-400">/staging · /carga · /flags · /golive · /obs · /lgpd</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">GitHub Actions</p>
            <p className="font-semibold text-slate-800 dark:text-slate-200">CI em cada PR</p>
            <p className="text-xs text-slate-400">unit-tests · build · e2e (3 jobs paralelos)</p>
          </div>
        </div>
      </section>

      {/* ── Quick access ── */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Acesso Rápido
        </h2>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Fluxo E2E", href: "/staging" },
            { label: "Testes de Carga", href: "/staging/carga" },
            { label: "Feature Flags", href: "/staging/flags" },
            { label: "Go-live Checklist", href: "/staging/golive" },
            { label: "Observabilidade", href: "/staging/observabilidade" },
            { label: "LGPD", href: "/staging/lgpd" },
            { label: "Perfis", href: "/staging/perfis" },
            { label: "Rollback", href: "/staging/rollback" },
          ].map((l) => (
            <Button key={l.href} variant="outline" size="sm" asChild>
              <Link href={l.href}>{l.label}</Link>
            </Button>
          ))}
        </div>
      </section>

    </main>
  )
}

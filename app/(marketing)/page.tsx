'use client'

import Link from 'next/link'
import {
  Dna,
  FlaskConical,
  BarChart3,
  FileText,
  Shield,
  Zap,
  Users,
  Check,
  Twitter,
  Linkedin,
  Github,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const features = [
  {
    icon: FlaskConical,
    title: 'Gestão de Amostras',
    description: 'Rastreamento completo do ciclo de vida das amostras, desde a coleta até o descarte seguro.',
  },
  {
    icon: BarChart3,
    title: 'Análises Avançadas',
    description: 'Suporte a PCR, ELISA, citometria de fluxo, sequenciamento genômico e microscopia eletrônica.',
  },
  {
    icon: FileText,
    title: 'Relatórios Automáticos',
    description: 'Geração de relatórios em PDF, Excel e CSV com um único clique, prontos para auditorias.',
  },
  {
    icon: Shield,
    title: 'Segurança de Dados',
    description: 'Conformidade total com LGPD e regulamentações ANVISA. Dados criptografados em repouso e em trânsito.',
  },
  {
    icon: Zap,
    title: 'Alertas em Tempo Real',
    description: 'Notificações automáticas de viabilidade crítica, prazos de análise e anomalias de temperatura.',
  },
  {
    icon: Users,
    title: 'Colaboração em Equipe',
    description: 'Suporte a múltiplos usuários com controle granular de permissões e auditoria de acessos.',
  },
]

const plans = [
  {
    name: 'Básico',
    price: 'R$ 299',
    period: '/mês',
    description: 'Ideal para laboratórios pequenos e startups de biotecnologia.',
    features: [
      'Até 500 amostras/mês',
      '3 usuários incluídos',
      'Relatórios PDF e Excel',
      'Suporte por e-mail',
      'Armazenamento 5 GB',
    ],
    highlighted: false,
    cta: 'Começar Grátis',
  },
  {
    name: 'Profissional',
    price: 'R$ 699',
    period: '/mês',
    description: 'Para laboratórios em crescimento com necessidades avançadas.',
    features: [
      'Até 5.000 amostras/mês',
      '15 usuários incluídos',
      'Todos os formatos de relatório',
      'Suporte prioritário 24/7',
      'Armazenamento 50 GB',
      'API de integração',
      'Alertas em tempo real',
    ],
    highlighted: true,
    cta: 'Começar Grátis',
  },
  {
    name: 'Enterprise',
    price: 'Sob consulta',
    period: '',
    description: 'Solução personalizada para grandes instituições e hospitais.',
    features: [
      'Amostras ilimitadas',
      'Usuários ilimitados',
      'Deploy on-premise disponível',
      'SLA garantido 99.9%',
      'Armazenamento ilimitado',
      'Integrações customizadas',
      'Treinamento dedicado',
    ],
    highlighted: false,
    cta: 'Falar com Vendas',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Dna className="size-6 text-primary" />
            <span>BioAnalytics Pro</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Funcionalidades
            </a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              Preços
            </a>
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
              Sobre
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">Começar Grátis</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <Badge variant="secondary" className="mb-6 text-sm px-4 py-1.5">
            Plataforma líder em gestão laboratorial
          </Badge>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 max-w-4xl mx-auto">
            Análise biológica.{' '}
            <span className="text-primary">Documentada com precisão.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Gerencie todo o ciclo de vida das suas amostras laboratoriais em uma plataforma
            integrada. Da coleta ao relatório final, com rastreabilidade completa e conformidade regulatória.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button size="lg" asChild className="text-base px-8">
              <Link href="/dashboard">Começar Grátis</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base px-8">
              <Link href="#features">Ver Funcionalidades</Link>
            </Button>
          </div>

          {/* Dashboard Preview */}
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-2xl border-2">
              <CardHeader className="border-b bg-muted/30 pb-3">
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-red-400" />
                  <div className="size-3 rounded-full bg-yellow-400" />
                  <div className="size-3 rounded-full bg-green-400" />
                  <span className="ml-2 text-xs text-muted-foreground font-mono">bioanalytics.pro/dashboard</span>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Total de Amostras', value: '1.247', delta: '+12.5%' },
                    { label: 'Concluídas', value: '892', delta: '+8.3%' },
                    { label: 'Viabilidade Média', value: '86.4%', delta: '+2.1%' },
                    { label: 'Taxa de Falha', value: '3.2%', delta: '-1.4%' },
                  ].map((kpi) => (
                    <div key={kpi.label} className="rounded-lg border bg-card p-3 text-left">
                      <p className="text-xs text-muted-foreground mb-1">{kpi.label}</p>
                      <p className="text-2xl font-bold">{kpi.value}</p>
                      <p className="text-xs text-green-600 font-medium mt-0.5">{kpi.delta}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border bg-muted/20 h-32 flex items-center justify-center">
                  <div className="flex items-end gap-2 h-20 px-4">
                    {[40, 65, 45, 80, 60, 90, 75, 85, 70, 95, 82, 100].map((h, i) => (
                      <div
                        key={i}
                        className="bg-primary/70 rounded-t w-6 transition-all"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tudo que seu laboratório precisa
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Uma plataforma completa para gerenciar amostras, análises e relatórios com eficiência e precisão.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="border hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <feature.icon className="size-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="about" className="py-20 md:py-28 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div>
              <p className="text-5xl md:text-6xl font-bold mb-3">50.000+</p>
              <p className="text-primary-foreground/80 text-lg">Amostras Processadas</p>
            </div>
            <div>
              <p className="text-5xl md:text-6xl font-bold mb-3">200+</p>
              <p className="text-primary-foreground/80 text-lg">Laboratórios</p>
            </div>
            <div>
              <p className="text-5xl md:text-6xl font-bold mb-3">99.9%</p>
              <p className="text-primary-foreground/80 text-lg">Uptime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 md:py-28">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Planos para todos os tamanhos
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Escolha o plano ideal para o seu laboratório. Sem taxas ocultas, cancele quando quiser.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative flex flex-col ${plan.highlighted ? 'border-primary border-2 shadow-xl' : 'border'}`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <Badge className="px-4 py-1">Mais Popular</Badge>
                  </div>
                )}
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                  <div className="mt-4 flex items-end gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && <span className="text-muted-foreground mb-1">{plan.period}</span>}
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col flex-1">
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="size-4 text-primary shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.highlighted ? 'default' : 'outline'}
                    asChild
                  >
                    <Link href="/dashboard">{plan.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-3">
                <Dna className="size-5 text-primary" />
                <span>BioAnalytics Pro</span>
              </Link>
              <p className="text-sm text-muted-foreground max-w-sm">
                A plataforma mais completa para gestão laboratorial e documentação de análises biológicas.
              </p>
            </div>
            <div>
              <p className="font-semibold text-sm mb-4">Links Rápidos</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Funcionalidades</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Preços</a></li>
                <li><a href="#about" className="hover:text-foreground transition-colors">Sobre</a></li>
                <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Acessar Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-sm mb-4">Redes Sociais</p>
              <div className="flex gap-3">
                <a href="#" aria-label="Twitter" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Twitter className="size-5" />
                </a>
                <a href="#" aria-label="LinkedIn" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Linkedin className="size-5" />
                </a>
                <a href="#" aria-label="GitHub" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Github className="size-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t pt-6 text-center text-sm text-muted-foreground">
            © 2025 BioAnalytics Pro. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}

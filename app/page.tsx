'use client'

import {
  Activity,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts'
import Link from 'next/link'

import { AppShell } from '@/components/app-shell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'

// ─── Sample data ──────────────────────────────────────────────────────────────

const trendData = [
  { month: 'Jan', amostras: 420, analises: 380 },
  { month: 'Fev', amostras: 510, analises: 490 },
  { month: 'Mar', amostras: 580, analises: 540 },
  { month: 'Abr', amostras: 620, analises: 590 },
  { month: 'Mai', amostras: 710, analises: 680 },
  { month: 'Jun', amostras: 800, analises: 760 },
]

const typeData = [
  { tipo: 'Genômica',       contagem: 240 },
  { tipo: 'Proteômica',     contagem: 185 },
  { tipo: 'Metabolômica',   contagem: 130 },
  { tipo: 'Transcriptômica', contagem: 95 },
  { tipo: 'Epigenômica',    contagem: 60 },
]

const recentAnalyses = [
  { id: 'BIO-2024-001', tipo: 'Genômica',       status: 'concluído',    progresso: 100, tempo: '2h 14min' },
  { id: 'BIO-2024-002', tipo: 'Proteômica',     status: 'em andamento', progresso: 67,  tempo: '1h 32min' },
  { id: 'BIO-2024-003', tipo: 'Metabolômica',   status: 'em andamento', progresso: 34,  tempo: '45min'    },
  { id: 'BIO-2024-004', tipo: 'Transcriptômica', status: 'aguardando',  progresso: 0,   tempo: '—'        },
  { id: 'BIO-2024-005', tipo: 'Genômica',       status: 'erro',         progresso: 12,  tempo: '18min'    },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    'concluído':     { label: 'Concluído',    variant: 'default'     },
    'em andamento':  { label: 'Em andamento', variant: 'secondary'   },
    'aguardando':    { label: 'Aguardando',   variant: 'outline'     },
    'erro':          { label: 'Erro',         variant: 'destructive' },
  }
  const { label, variant } = map[status] ?? { label: status, variant: 'outline' }
  return <Badge variant={variant}>{label}</Badge>
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'concluído')    return <CheckCircle2 className="size-4 text-green-500" />
  if (status === 'em andamento') return <Clock className="size-4 text-blue-500" />
  if (status === 'erro')         return <AlertCircle className="size-4 text-destructive" />
  return <Activity className="size-4 text-muted-foreground" />
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <AppShell title="Dashboard">
      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Amostras processadas</CardDescription>
            <CardTitle className="text-3xl">3.640</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="size-3 text-green-500" />
              +12% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Análises concluídas</CardDescription>
            <CardTitle className="text-3xl">3.440</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="size-3 text-green-500" />
              +8% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Taxa de sucesso</CardDescription>
            <CardTitle className="text-3xl">94.5%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={94.5} className="h-1.5" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tempo médio de análise</CardDescription>
            <CardTitle className="text-3xl">1h 48min</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              -6min em relação ao mês anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="tendencia">
        <TabsList>
          <TabsTrigger value="tendencia">Tendência mensal</TabsTrigger>
          <TabsTrigger value="tipos">Por tipo de análise</TabsTrigger>
        </TabsList>

        <TabsContent value="tendencia">
          <Card>
            <CardHeader>
              <CardTitle>Volume de amostras e análises</CardTitle>
              <CardDescription>Últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradAmostras" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(221 83% 53%)" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="hsl(221 83% 53%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradAnalises" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142 71% 45%)" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="hsl(142 71% 45%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="amostras" stroke="hsl(221 83% 53%)" fill="url(#gradAmostras)" strokeWidth={2} name="Amostras" />
                  <Area type="monotone" dataKey="analises" stroke="hsl(142 71% 45%)" fill="url(#gradAnalises)" strokeWidth={2} name="Análises" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tipos">
          <Card>
            <CardHeader>
              <CardTitle>Análises por tipo</CardTitle>
              <CardDescription>Distribuição no mês atual</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={typeData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="tipo" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="contagem" fill="hsl(221 83% 53%)" radius={[4, 4, 0, 0]} name="Contagem" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent analyses */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Análises recentes</CardTitle>
            <CardDescription>Últimas 5 análises iniciadas</CardDescription>
          </div>
          <Button asChild size="sm">
            <Link href="/analyses">Ver todas</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentAnalyses.map((analysis, i) => (
              <div key={analysis.id}>
                {i > 0 && <Separator className="mb-3" />}
                <div className="flex items-center gap-4">
                  <StatusIcon status={analysis.status} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium font-mono">{analysis.id}</span>
                      <StatusBadge status={analysis.status} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{analysis.tipo}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{analysis.tempo}</span>
                    </div>
                    {analysis.progresso > 0 && (
                      <Progress value={analysis.progresso} className="h-1 mt-2" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AppShell>
  )
}

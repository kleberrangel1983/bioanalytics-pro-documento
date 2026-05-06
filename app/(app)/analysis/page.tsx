import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConcentrationChart } from '@/components/analysis/concentration-chart'
import { ViabilityChart } from '@/components/analysis/viability-chart'
import { AnalysisTable } from '@/components/analysis/analysis-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MOCK_ANALYSES } from '@/lib/mock-data'
import { ANALYSIS_TYPE_CONFIG } from '@/lib/constants'
import type { AnalysisType } from '@/lib/types'

function AnalysisSummary() {
  const byType = Object.entries(ANALYSIS_TYPE_CONFIG).map(([type, cfg]) => {
    const analyses = MOCK_ANALYSES.filter(a => a.type === type as AnalysisType)
    const avgViability = analyses.length > 0
      ? analyses.reduce((s, a) => s + a.viability, 0) / analyses.length
      : 0
    return { type, label: cfg.label, count: analyses.length, avgViability }
  })

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {byType.map(({ type, label, count, avgViability }) => (
        <Card key={type}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{count}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Viab. média: {avgViability.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function AnalysisPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Análises</h1>
        <p className="text-muted-foreground">Resultados e tendências de análises laboratoriais</p>
      </div>

      <Tabs defaultValue="summary">
        <TabsList>
          <TabsTrigger value="summary">Resumo</TabsTrigger>
          <TabsTrigger value="concentration">Concentração</TabsTrigger>
          <TabsTrigger value="viability">Viabilidade</TabsTrigger>
          <TabsTrigger value="table">Tabela</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-6 mt-4">
          <AnalysisSummary />
        </TabsContent>

        <TabsContent value="concentration" className="mt-4">
          <ConcentrationChart />
        </TabsContent>

        <TabsContent value="viability" className="mt-4">
          <ViabilityChart />
        </TabsContent>

        <TabsContent value="table" className="mt-4">
          <AnalysisTable />
        </TabsContent>
      </Tabs>
    </div>
  )
}

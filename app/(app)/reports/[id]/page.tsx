import { MOCK_REPORTS, MOCK_SAMPLES } from '@/lib/mock-data'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { formatDate } from '@/lib/formatters'
import { SAMPLE_STATUS_CONFIG, SAMPLE_TYPE_CONFIG } from '@/lib/constants'
import { ReportDetailActions } from './report-detail-actions'

export default function ReportDetailPage({ params }: { params: { id: string } }) {
  const report = MOCK_REPORTS.find(r => r.id === params.id)
  if (!report) notFound()

  const samples = report.sampleIds
    .map(id => MOCK_SAMPLES.find(s => s.id === id))
    .filter(Boolean) as typeof MOCK_SAMPLES

  const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    ready: 'default',
    draft: 'secondary',
    generating: 'outline',
    archived: 'secondary',
  }

  const statusLabel: Record<string, string> = {
    ready: 'Pronto',
    draft: 'Rascunho',
    generating: 'Gerando',
    archived: 'Arquivado',
  }

  const formatLabel: Record<string, string> = {
    pdf: 'PDF',
    xlsx: 'Excel',
    csv: 'CSV',
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">{report.title}</h1>
          <div className="flex flex-wrap gap-2">
            <Badge variant={statusVariant[report.status] ?? 'secondary'}>
              {statusLabel[report.status] ?? report.status}
            </Badge>
            <Badge variant="outline">{formatLabel[report.format] ?? report.format.toUpperCase()}</Badge>
            <Badge variant="outline">{report.type}</Badge>
          </div>
        </div>
        <ReportDetailActions report={report} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conteúdo do Relatório</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left font-medium">Código</th>
                      <th className="px-4 py-3 text-left font-medium">Tipo</th>
                      <th className="px-4 py-3 text-left font-medium">Status</th>
                      <th className="px-4 py-3 text-left font-medium">Data de Coleta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {samples.map((sample) => {
                      const statusCfg = SAMPLE_STATUS_CONFIG[sample.status]
                      const typeCfg = SAMPLE_TYPE_CONFIG[sample.type]
                      return (
                        <tr key={sample.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-mono font-medium">{sample.code}</td>
                          <td className="px-4 py-3">{typeCfg?.label ?? sample.type}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusCfg?.bgColor} ${statusCfg?.color}`}>
                              {statusCfg?.label ?? sample.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{formatDate(sample.collectedAt)}</td>
                        </tr>
                      )
                    })}
                    {samples.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                          Nenhuma amostra associada a este relatório.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Metodologia</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none text-muted-foreground space-y-3">
              <p>
                As amostras incluídas neste relatório foram processadas de acordo com os protocolos
                estabelecidos pelo laboratório, seguindo as diretrizes da ANVISA e as normas ISO 15189
                para laboratórios de análises clínicas.
              </p>
              <p>
                O controle de qualidade foi realizado em todas as etapas do processo analítico,
                incluindo verificação de viabilidade celular, pureza espectrofotométrica (A260/A280)
                e integridade das amostras prior ao início das análises.
              </p>
              <p>
                Os resultados apresentados refletem a média de duplicatas técnicas, com coeficiente
                de variação inferior a 5% para todos os parâmetros mensurados. Amostras com desvios
                fora do padrão foram devidamente identificadas e documentadas para revisão.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Gerado em</p>
                <p className="text-sm font-medium">{formatDate(report.generatedAt)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Formato</p>
                <p className="text-sm font-medium">{formatLabel[report.format] ?? report.format.toUpperCase()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Tipo</p>
                <p className="text-sm font-medium">{report.type}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total de Amostras</p>
                <p className="text-sm font-medium">{report.sampleIds.length} amostras</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Qualidade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Completude</span>
                  <span className="font-medium">94%</span>
                </div>
                <Progress value={94} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Conformidade</span>
                  <span className="font-medium">100%</span>
                </div>
                <Progress value={100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Confiabilidade</span>
                  <span className="font-medium">88%</span>
                </div>
                <Progress value={88} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

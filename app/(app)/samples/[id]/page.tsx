import { notFound } from 'next/navigation'
import { getSampleById, getAnalysesBySampleId, getPatientById } from '@/lib/mock-data'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SampleStatusBadge } from '@/components/samples/sample-status-badge'
import { SAMPLE_TYPE_CONFIG, ANALYSIS_TYPE_CONFIG } from '@/lib/constants'
import { formatDate, formatViability } from '@/lib/formatters'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function SampleDetailPage({ params }: PageProps) {
  const { id } = await params
  const sample = getSampleById(id)
  if (!sample) notFound()

  const analyses = getAnalysesBySampleId(id)
  const patient = getPatientById(sample.patientId)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/samples" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight font-mono">{sample.code}</h1>
          <SampleStatusBadge status={sample.status} />
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Detalhes</TabsTrigger>
          <TabsTrigger value="analyses">Análises ({analyses.length})</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Informações da Amostra</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Código</span>
                  <span className="font-mono font-medium">{sample.code}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tipo</span>
                  <span>{SAMPLE_TYPE_CONFIG[sample.type]?.label}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <SampleStatusBadge status={sample.status} />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Temperatura</span>
                  <span>{sample.storageTemp}°C</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Coletado em</span>
                  <span>{formatDate(sample.collectedAt)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cadastrado em</span>
                  <span>{formatDate(sample.createdAt)}</span>
                </div>
                {sample.notes && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-1">Observações</p>
                    <p className="text-sm">{sample.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Paciente</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {patient ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Código</span>
                      <span className="font-mono font-medium">{patient.code}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Idade</span>
                      <span>{patient.age} anos</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sexo</span>
                      <span>{patient.sex === 'M' ? 'Masculino' : 'Feminino'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Diagnóstico</span>
                      <span className="text-right max-w-[60%]">{patient.diagnosis}</span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Paciente não encontrado</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analyses" className="mt-4">
          {analyses.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhuma análise realizada ainda
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Viabilidade</TableHead>
                    <TableHead>Concentração</TableHead>
                    <TableHead>Pureza</TableHead>
                    <TableHead>pH</TableHead>
                    <TableHead>Realizado em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analyses.map((analysis) => (
                    <TableRow key={analysis.id}>
                      <TableCell>
                        <Badge variant="outline">{ANALYSIS_TYPE_CONFIG[analysis.type]?.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={analysis.viability} className="w-20 h-2" />
                          <span className="text-sm">{formatViability(analysis.viability)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{analysis.concentration.toFixed(2)} mg/mL</TableCell>
                      <TableCell className="text-sm">{analysis.purity.toFixed(2)}</TableCell>
                      <TableCell className="text-sm">{analysis.ph}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(analysis.performedAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Amostra cadastrada</p>
                    <p className="text-xs text-muted-foreground">{formatDate(sample.createdAt)}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Coleta realizada</p>
                    <p className="text-xs text-muted-foreground">{formatDate(sample.collectedAt)}</p>
                  </div>
                </div>
                {analyses.map((a) => (
                  <div key={a.id} className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Análise {ANALYSIS_TYPE_CONFIG[a.type]?.label} realizada</p>
                      <p className="text-xs text-muted-foreground">{formatDate(a.performedAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

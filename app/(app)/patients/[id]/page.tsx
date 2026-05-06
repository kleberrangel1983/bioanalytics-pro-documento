import { notFound } from 'next/navigation'
import { getPatientById, getSamplesByPatientId } from '@/lib/mock-data'
import { SAMPLE_STATUS_CONFIG, SAMPLE_TYPE_CONFIG } from '@/lib/constants'
import { formatDate } from '@/lib/formatters'
import { PatientSexBadge } from '@/components/patients/patient-status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default async function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const patient = getPatientById(id)

  if (!patient) {
    notFound()
  }

  const samples = getSamplesByPatientId(patient.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-2xl font-bold tracking-tight font-mono">{patient.code}</h1>
        <PatientSexBadge sex={patient.sex} />
        <span className="text-muted-foreground">{patient.diagnosis}</span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Código</span>
              <span className="text-sm font-mono font-medium">{patient.code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Idade</span>
              <span className="text-sm font-medium">{patient.age} anos</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Sexo</span>
              <PatientSexBadge sex={patient.sex} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Diagnóstico</span>
              <span className="text-sm font-medium">{patient.diagnosis}</span>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Amostras do Paciente</CardTitle>
            </CardHeader>
            <CardContent>
              {samples.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma amostra encontrada.</p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Data Coleta</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {samples.map((sample) => {
                        const statusCfg = SAMPLE_STATUS_CONFIG[sample.status]
                        const typeCfg = SAMPLE_TYPE_CONFIG[sample.type]
                        return (
                          <TableRow key={sample.id}>
                            <TableCell className="font-mono text-sm">{sample.code}</TableCell>
                            <TableCell>{typeCfg.label}</TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusCfg.bgColor} ${statusCfg.color}`}>
                                {statusCfg.label}
                              </span>
                            </TableCell>
                            <TableCell>{formatDate(sample.collectedAt)}</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

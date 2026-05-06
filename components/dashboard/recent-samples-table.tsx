import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SampleStatusBadge } from '@/components/samples/sample-status-badge'
import { MOCK_SAMPLES, MOCK_PATIENTS } from '@/lib/mock-data'
import { SAMPLE_TYPE_CONFIG } from '@/lib/constants'
import { formatDate } from '@/lib/formatters'
import Link from 'next/link'

export function RecentSamplesTable() {
  const recentSamples = [...MOCK_SAMPLES]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Amostras Recentes</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead>Coletado</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentSamples.map((sample) => {
              const patient = MOCK_PATIENTS.find(p => p.id === sample.patientId)
              return (
                <TableRow key={sample.id}>
                  <TableCell className="font-mono text-sm font-medium">{sample.code}</TableCell>
                  <TableCell className="text-sm">{SAMPLE_TYPE_CONFIG[sample.type]?.label}</TableCell>
                  <TableCell><SampleStatusBadge status={sample.status} /></TableCell>
                  <TableCell className="text-sm">{patient?.code ?? '-'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(sample.collectedAt)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/samples/${sample.id}`}>Ver</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

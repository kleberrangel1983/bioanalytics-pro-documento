import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { MOCK_ANALYSES } from '@/lib/mock-data'
import { ANALYSIS_TYPE_CONFIG } from '@/lib/constants'
import { formatDate, formatViability } from '@/lib/formatters'
import { cn } from '@/lib/utils'

export function AnalysisTable() {
  const analyses = MOCK_ANALYSES
    .sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime())
    .slice(0, 30)

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tipo</TableHead>
            <TableHead>Amostra</TableHead>
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
              <TableCell className="font-mono text-sm">{analysis.sampleId.replace('s', 'AMS-0')}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Progress
                    value={analysis.viability}
                    className={cn('w-20 h-2', analysis.viability < 70 && '[&>div]:bg-red-500')}
                  />
                  <span className={cn('text-sm tabular-nums', analysis.viability < 70 ? 'text-red-600 font-medium' : '')}>
                    {formatViability(analysis.viability)}
                  </span>
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
  )
}

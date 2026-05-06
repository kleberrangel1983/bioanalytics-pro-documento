import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Download, Eye, FileText, FileSpreadsheet } from 'lucide-react'
import { formatDate } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import type { Report } from '@/lib/types'

interface ReportCardProps {
  report: Report
}

const STATUS_STYLES: Record<Report['status'], { label: string; className: string }> = {
  draft: { label: 'Rascunho', className: 'bg-gray-100 text-gray-700' },
  generating: { label: 'Gerando...', className: 'bg-blue-100 text-blue-700' },
  ready: { label: 'Pronto', className: 'bg-green-100 text-green-700' },
  archived: { label: 'Arquivado', className: 'bg-gray-100 text-gray-500' },
}

const FORMAT_ICONS: Record<Report['format'], React.ElementType> = {
  pdf: FileText,
  xlsx: FileSpreadsheet,
  csv: FileText,
}

export function ReportCard({ report }: ReportCardProps) {
  const statusStyle = STATUS_STYLES[report.status]
  const FormatIcon = FORMAT_ICONS[report.format]

  return (
    <Card className={cn('flex flex-col', report.status === 'archived' && 'opacity-70')}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <FormatIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <CardTitle className="text-sm leading-tight truncate">{report.title}</CardTitle>
          </div>
          <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium shrink-0', statusStyle.className)}>
            {statusStyle.label}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-2 pb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="text-xs">{report.type}</Badge>
          <Badge variant="outline" className="text-xs uppercase">{report.format}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {report.sampleIds.length} amostra(s) incluída(s)
        </p>
        <p className="text-xs text-muted-foreground">
          Gerado em: {formatDate(report.generatedAt)}
        </p>
      </CardContent>
      <CardFooter className="gap-2 pt-0">
        <Button variant="outline" size="sm" className="gap-1.5 flex-1" disabled={report.status !== 'ready'}>
          <Eye className="h-3.5 w-3.5" />
          Visualizar
        </Button>
        <Button size="sm" className="gap-1.5 flex-1" disabled={report.status !== 'ready'}>
          <Download className="h-3.5 w-3.5" />
          Download
        </Button>
      </CardFooter>
    </Card>
  )
}

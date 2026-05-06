'use client'

import { toast } from 'sonner'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Report } from '@/lib/types'

export function ReportDetailActions({ report }: { report: Report }) {
  function handleDownload(format: string) {
    toast.success(`Download iniciado`, {
      description: `O relatório está sendo baixado em formato ${format.toUpperCase()}.`,
    })
  }

  return (
    <div className="flex gap-2 shrink-0">
      <Button variant="outline" onClick={() => handleDownload('pdf')}>
        <Download className="size-4 mr-2" />
        Download PDF
      </Button>
      <Button variant="outline" onClick={() => handleDownload('xlsx')}>
        <Download className="size-4 mr-2" />
        Download Excel
      </Button>
    </div>
  )
}

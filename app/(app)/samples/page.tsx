'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { SamplesTable } from '@/components/samples/samples-table'
import { SampleFilters } from '@/components/samples/sample-filters'
import { SampleForm } from '@/components/samples/sample-form'
import { MOCK_SAMPLES } from '@/lib/mock-data'
import { Plus, Download } from 'lucide-react'
import type { SampleStatus, SampleType } from '@/lib/types'
import { exportSamplesToCSV } from '@/lib/export'
import { toast } from 'sonner'

const PAGE_SIZE = 20

export default function SamplesPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<SampleType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<SampleStatus | 'all'>('all')
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)

  function handleExport() {
    exportSamplesToCSV(filtered)
    toast.success(`${filtered.length} amostra(s) exportada(s) para CSV`)
  }

  function clearFilters() {
    setSearch('')
    setTypeFilter('all')
    setStatusFilter('all')
    setPage(1)
  }

  const filtered = MOCK_SAMPLES.filter(s => {
    const matchSearch = search === '' || s.code.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === 'all' || s.type === typeFilter
    const matchStatus = statusFilter === 'all' || s.status === statusFilter
    return matchSearch && matchType && matchStatus
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Amostras</h1>
          <p className="text-muted-foreground">{filtered.length} amostra(s) encontrada(s)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Amostra
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Cadastrar Nova Amostra</DialogTitle>
            </DialogHeader>
            <SampleForm onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <SampleFilters
        search={search}
        type={typeFilter}
        status={statusFilter}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
        onTypeChange={(v) => { setTypeFilter(v); setPage(1) }}
        onStatusChange={(v) => { setStatusFilter(v); setPage(1) }}
        onClear={clearFilters}
      />

      <SamplesTable samples={paginated} />

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              Anterior
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

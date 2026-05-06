'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { SampleStatusBadge } from './sample-status-badge'
import { SAMPLE_TYPE_CONFIG } from '@/lib/constants'
import { MOCK_PATIENTS } from '@/lib/mock-data'
import { formatDate } from '@/lib/formatters'
import { MoreHorizontal, Eye, Pencil, Archive } from 'lucide-react'
import Link from 'next/link'
import type { Sample } from '@/lib/types'
import { cn } from '@/lib/utils'

interface SamplesTableProps {
  samples: Sample[]
}

type SortKey = 'code' | 'type' | 'status' | 'collectedAt'

export function SamplesTable({ samples }: SamplesTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('collectedAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sorted = [...samples].sort((a, b) => {
    let aVal: string = a[sortKey] ?? ''
    let bVal: string = b[sortKey] ?? ''
    const cmp = aVal.localeCompare(bVal)
    return sortDir === 'asc' ? cmp : -cmp
  })

  function SortableHead({ col, label }: { col: SortKey; label: string }) {
    return (
      <TableHead
        className="cursor-pointer select-none hover:text-foreground"
        onClick={() => handleSort(col)}
      >
        <span className="flex items-center gap-1">
          {label}
          {sortKey === col && (
            <span className="text-xs">{sortDir === 'asc' ? '↑' : '↓'}</span>
          )}
        </span>
      </TableHead>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHead col="code" label="Código" />
            <SortableHead col="type" label="Tipo" />
            <SortableHead col="status" label="Status" />
            <TableHead>Paciente</TableHead>
            <SortableHead col="collectedAt" label="Coletado" />
            <TableHead>Análises</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                Nenhuma amostra encontrada
              </TableCell>
            </TableRow>
          ) : (
            sorted.map((sample) => {
              const patient = MOCK_PATIENTS.find(p => p.id === sample.patientId)
              return (
                <TableRow key={sample.id}>
                  <TableCell className="font-mono text-sm font-medium">{sample.code}</TableCell>
                  <TableCell className="text-sm">{SAMPLE_TYPE_CONFIG[sample.type]?.label}</TableCell>
                  <TableCell><SampleStatusBadge status={sample.status} /></TableCell>
                  <TableCell className="text-sm">{patient?.code ?? '-'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(sample.collectedAt)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{sample.analysisIds.length}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Abrir menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/samples/${sample.id}`} className="flex items-center gap-2 cursor-pointer">
                            <Eye className="h-4 w-4" />
                            Ver detalhes
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                          <Pencil className="h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer text-muted-foreground">
                          <Archive className="h-4 w-4" />
                          Arquivar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}

'use client'

import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'
import { SAMPLE_TYPE_CONFIG, SAMPLE_STATUS_CONFIG } from '@/lib/constants'
import type { SampleStatus, SampleType } from '@/lib/types'

interface SampleFiltersProps {
  search: string
  type: SampleType | 'all'
  status: SampleStatus | 'all'
  onSearchChange: (value: string) => void
  onTypeChange: (value: SampleType | 'all') => void
  onStatusChange: (value: SampleStatus | 'all') => void
  onClear: () => void
}

export function SampleFilters({
  search,
  type,
  status,
  onSearchChange,
  onTypeChange,
  onStatusChange,
  onClear,
}: SampleFiltersProps) {
  const hasFilters = search !== '' || type !== 'all' || status !== 'all'

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por código..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>
      <Select value={type} onValueChange={(v) => onTypeChange(v as SampleType | 'all')}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os tipos</SelectItem>
          {(Object.entries(SAMPLE_TYPE_CONFIG) as [SampleType, { label: string }][]).map(([key, cfg]) => (
            <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={status} onValueChange={(v) => onStatusChange(v as SampleStatus | 'all')}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          {(Object.entries(SAMPLE_STATUS_CONFIG) as [SampleStatus, { label: string }][]).map(([key, cfg]) => (
            <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onClear} className="gap-1">
          <X className="h-3.5 w-3.5" />
          Limpar
        </Button>
      )}
    </div>
  )
}

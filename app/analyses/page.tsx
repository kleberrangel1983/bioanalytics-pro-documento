'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Filter } from 'lucide-react'

import { AppShell } from '@/components/app-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// ─── Data ─────────────────────────────────────────────────────────────────────

const ANALYSES = [
  { id: 'BIO-2024-001', nome: 'Estudo genômico paciente A',     tipo: 'Genômica',        status: 'concluído',    progresso: 100, inicio: '2024-06-01', tempo: '2h 14min' },
  { id: 'BIO-2024-002', nome: 'Perfil proteico soro',           tipo: 'Proteômica',      status: 'em andamento', progresso: 67,  inicio: '2024-06-03', tempo: '1h 32min' },
  { id: 'BIO-2024-003', nome: 'Metabólitos urina infantil',     tipo: 'Metabolômica',    status: 'em andamento', progresso: 34,  inicio: '2024-06-03', tempo: '45min'    },
  { id: 'BIO-2024-004', nome: 'RNA-Seq tecido hepático',        tipo: 'Transcriptômica', status: 'aguardando',   progresso: 0,   inicio: '2024-06-04', tempo: '—'        },
  { id: 'BIO-2024-005', nome: 'Marcadores epigenéticos BRCA',   tipo: 'Genômica',        status: 'erro',         progresso: 12,  inicio: '2024-06-04', tempo: '18min'    },
  { id: 'BIO-2024-006', nome: 'Proteômica plasma controle',     tipo: 'Proteômica',      status: 'concluído',    progresso: 100, inicio: '2024-05-28', tempo: '3h 02min' },
  { id: 'BIO-2024-007', nome: 'Análise metabolômica DM2',       tipo: 'Metabolômica',    status: 'concluído',    progresso: 100, inicio: '2024-05-27', tempo: '1h 55min' },
  { id: 'BIO-2024-008', nome: 'Expressão gênica leucócitos',    tipo: 'Transcriptômica', status: 'concluído',    progresso: 100, inicio: '2024-05-25', tempo: '2h 40min' },
  { id: 'BIO-2024-009', nome: 'Sequenciamento exoma completo',  tipo: 'Genômica',        status: 'aguardando',   progresso: 0,   inicio: '2024-06-05', tempo: '—'        },
  { id: 'BIO-2024-010', nome: 'Epigenoma células-tronco',       tipo: 'Epigenômica',     status: 'em andamento', progresso: 51,  inicio: '2024-06-02', tempo: '2h 10min' },
]

const STATUS_LABELS: Record<string, string> = {
  concluído:    'Concluído',
  'em andamento': 'Em andamento',
  aguardando:   'Aguardando',
  erro:         'Erro',
}

function StatusBadge({ status }: { status: string }) {
  const variantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    concluído:      'default',
    'em andamento': 'secondary',
    aguardando:     'outline',
    erro:           'destructive',
  }
  return (
    <Badge variant={variantMap[status] ?? 'outline'}>
      {STATUS_LABELS[status] ?? status}
    </Badge>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalysesPage() {
  const [search, setSearch]     = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter]     = useState('all')

  const filtered = ANALYSES.filter((a) => {
    const matchSearch = search === '' ||
      a.nome.toLowerCase().includes(search.toLowerCase()) ||
      a.id.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || a.status === statusFilter
    const matchType   = typeFilter   === 'all' || a.tipo   === typeFilter
    return matchSearch && matchStatus && matchType
  })

  const tipos = [...new Set(ANALYSES.map((a) => a.tipo))]

  return (
    <AppShell title="Análises">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por ID ou nome…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Filter className="size-4 text-muted-foreground shrink-0" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              {Object.entries(STATUS_LABELS).map(([val, label]) => (
                <SelectItem key={val} value={val}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {tipos.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button asChild>
          <Link href="/analyses/new">
            <Plus className="size-4" />
            Nova análise
          </Link>
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-36">ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead className="w-36">Tipo</TableHead>
                <TableHead className="w-32">Status</TableHead>
                <TableHead className="w-40">Progresso</TableHead>
                <TableHead className="w-28">Início</TableHead>
                <TableHead className="w-28 text-right">Duração</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Nenhuma análise encontrada para os filtros selecionados.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((analysis) => (
                  <TableRow key={analysis.id}>
                    <TableCell className="font-mono text-xs">{analysis.id}</TableCell>
                    <TableCell className="font-medium">{analysis.nome}</TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{analysis.tipo}</span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={analysis.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={analysis.progresso} className="h-1.5 flex-1" />
                        <span className="text-xs text-muted-foreground w-8 text-right">
                          {analysis.progresso}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {analysis.inicio}
                    </TableCell>
                    <TableCell className="text-sm text-right text-muted-foreground">
                      {analysis.tempo}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        {filtered.length} de {ANALYSES.length} análises
      </p>
    </AppShell>
  )
}

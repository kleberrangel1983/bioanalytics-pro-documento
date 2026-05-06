import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { SampleStatus, AnalysisType } from './types'
import { SAMPLE_STATUS_CONFIG, ANALYSIS_TYPE_CONFIG } from './constants'

export function formatDate(date: string | Date): string {
  return format(typeof date === 'string' ? parseISO(date) : date, 'dd/MM/yyyy', { locale: ptBR })
}

export function formatRelativeDate(date: string | Date): string {
  return formatDistanceToNow(typeof date === 'string' ? parseISO(date) : date, { addSuffix: true, locale: ptBR })
}

export function formatViability(value: number): string {
  return `${value.toFixed(1)}%`
}

export function formatConcentration(value: number, unit: string): string {
  return `${value.toFixed(2)} ${unit}`
}

export function getSampleStatusColor(status: SampleStatus): string {
  return SAMPLE_STATUS_CONFIG[status]?.color ?? ''
}

export function getAnalysisTypeLabel(type: AnalysisType): string {
  return ANALYSIS_TYPE_CONFIG[type]?.label ?? type
}

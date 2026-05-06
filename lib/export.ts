import type { Sample, Analysis, Report } from './types'
import { SAMPLE_TYPE_CONFIG, SAMPLE_STATUS_CONFIG } from './constants'
import { formatDate } from './formatters'

function downloadCSV(filename: string, rows: string[][]): void {
  const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportSamplesToCSV(samples: Sample[]): void {
  const header = ['Código', 'Tipo', 'Status', 'ID Paciente', 'Temp. Armazenamento (°C)', 'Coletado em', 'Criado em', 'Observações']
  const rows = samples.map(s => [
    s.code,
    SAMPLE_TYPE_CONFIG[s.type]?.label ?? s.type,
    SAMPLE_STATUS_CONFIG[s.status]?.label ?? s.status,
    s.patientId,
    String(s.storageTemp),
    formatDate(s.collectedAt),
    formatDate(s.createdAt),
    s.notes ?? '',
  ])
  downloadCSV(`amostras_${new Date().toISOString().slice(0, 10)}.csv`, [header, ...rows])
}

export function exportAnalysesToCSV(analyses: Analysis[]): void {
  const header = ['ID Amostra', 'Tipo', 'Concentração', 'Viabilidade (%)', 'Pureza (%)', 'pH', 'Temperatura (°C)', 'Realizado em']
  const rows = analyses.map(a => [
    a.sampleId,
    a.type,
    String(a.concentration),
    String(a.viability),
    String(a.purity),
    String(a.ph),
    String(a.temperature),
    formatDate(a.performedAt),
  ])
  downloadCSV(`analises_${new Date().toISOString().slice(0, 10)}.csv`, [header, ...rows])
}

export function exportReportsToCSV(reports: Report[]): void {
  const header = ['ID', 'Título', 'Tipo', 'Status', 'Formato', 'Total Amostras', 'Gerado em']
  const rows = reports.map(r => [
    r.id,
    r.title,
    r.type,
    r.status,
    r.format.toUpperCase(),
    String(r.sampleIds.length),
    formatDate(r.generatedAt),
  ])
  downloadCSV(`relatorios_${new Date().toISOString().slice(0, 10)}.csv`, [header, ...rows])
}

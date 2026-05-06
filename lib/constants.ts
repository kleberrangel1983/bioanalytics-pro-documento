import { SampleStatus, SampleType, AnalysisType } from './types'

export const SAMPLE_STATUS_CONFIG: Record<SampleStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: 'Pendente', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  processing: { label: 'Em Processo', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  completed: { label: 'Concluída', color: 'text-green-600', bgColor: 'bg-green-100' },
  failed: { label: 'Falhou', color: 'text-red-600', bgColor: 'bg-red-100' },
  archived: { label: 'Arquivada', color: 'text-gray-600', bgColor: 'bg-gray-100' },
}

export const SAMPLE_TYPE_CONFIG: Record<SampleType, { label: string; description: string }> = {
  blood: { label: 'Sangue', description: 'Amostra de sangue periférico' },
  tissue: { label: 'Tecido', description: 'Biópsia de tecido' },
  urine: { label: 'Urina', description: 'Amostra de urina' },
  saliva: { label: 'Saliva', description: 'Amostra de saliva' },
  csf: { label: 'LCR', description: 'Líquido cefalorraquidiano' },
  biopsy: { label: 'Biópsia', description: 'Amostra de biópsia' },
}

export const ANALYSIS_TYPE_CONFIG: Record<AnalysisType, { label: string; color: string }> = {
  pcr: { label: 'PCR', color: 'hsl(var(--chart-1))' },
  elisa: { label: 'ELISA', color: 'hsl(var(--chart-2))' },
  'flow-cytometry': { label: 'Citometria de Fluxo', color: 'hsl(var(--chart-3))' },
  sequencing: { label: 'Sequenciamento', color: 'hsl(var(--chart-4))' },
  microscopy: { label: 'Microscopia', color: 'hsl(var(--chart-5))' },
}

export const NAV_ITEMS = [
  { title: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { title: 'Amostras', href: '/samples', icon: 'FlaskConical' },
  { title: 'Análises', href: '/analysis', icon: 'BarChart3' },
  { title: 'Relatórios', href: '/reports', icon: 'FileText' },
  { title: 'Configurações', href: '/settings', icon: 'Settings' },
]

export const CHART_COLORS = {
  primary: 'hsl(var(--chart-1))',
  secondary: 'hsl(var(--chart-2))',
  tertiary: 'hsl(var(--chart-3))',
  quaternary: 'hsl(var(--chart-4))',
  quinary: 'hsl(var(--chart-5))',
}

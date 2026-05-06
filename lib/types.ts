export type SampleType = 'blood' | 'tissue' | 'urine' | 'saliva' | 'csf' | 'biopsy'
export type SampleStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'archived'
export type AnalysisType = 'pcr' | 'elisa' | 'flow-cytometry' | 'sequencing' | 'microscopy'
export type ReportStatus = 'draft' | 'generating' | 'ready' | 'archived'

export interface Patient {
  id: string; code: string; age: number; sex: 'M' | 'F'; diagnosis: string
}
export interface Sample {
  id: string; code: string; type: SampleType; status: SampleStatus
  collectedAt: string; patientId: string; analysisIds: string[]
  storageTemp: number; notes?: string; createdAt: string
}
export interface Analysis {
  id: string; sampleId: string; type: AnalysisType
  concentration: number; viability: number; purity: number
  ph: number; temperature: number; notes?: string; performedAt: string
}
export interface Report {
  id: string; title: string; type: string; status: ReportStatus
  sampleIds: string[]; generatedAt: string; format: 'pdf' | 'xlsx' | 'csv'
}
export interface KPIMetric {
  label: string; value: number | string; unit?: string; delta: number; trend: 'up' | 'down'
}

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical'

export type IncidentRecord = {
  incidentId: string
  clinicId: string
  severity: IncidentSeverity
  source: 'whatsapp' | 'crm' | 'agenda' | 'auth'
  summary: string
  createdBy: string
  timestampIso: string
}

export function buildIncidentRecord(
  input: Omit<IncidentRecord, 'incidentId' | 'timestampIso'>,
): IncidentRecord {
  const timestampIso = new Date().toISOString()
  return {
    ...input,
    incidentId: `${input.clinicId}:${input.source}:${timestampIso}`,
    timestampIso,
  }
}

export function isCriticalIncident(record: IncidentRecord): boolean {
  return record.severity === 'critical'
}

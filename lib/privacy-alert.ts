export type PrivacyIncident = {
  incidentId: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  containsPatientData: boolean
  affectedClinics: number
}

export function shouldEscalatePrivacyIncident(incident: PrivacyIncident): boolean {
  if (!incident.containsPatientData) return false
  if (incident.severity === 'critical') return true
  if (incident.severity === 'high' && incident.affectedClinics > 1) return true
  return false
}

export function buildPrivacyAlertSummary(incident: PrivacyIncident): string {
  return `Incidente ${incident.incidentId}: severidade ${incident.severity}, clínicas afetadas ${incident.affectedClinics}.`
}

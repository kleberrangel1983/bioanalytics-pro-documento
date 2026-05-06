export type ConsentAction = 'granted' | 'revoked'

export type ConsentChannel = 'whatsapp' | 'in_person' | 'web'

export type ConsentRecord = {
  patientId: string
  clinicId: string
  action: ConsentAction
  channel: ConsentChannel
  purpose: string
  timestampIso: string
  actorId: string
}

export function buildConsentRecord(input: Omit<ConsentRecord, 'timestampIso'>): ConsentRecord {
  return {
    ...input,
    timestampIso: new Date().toISOString(),
  }
}

export function isConsentActive(records: ConsentRecord[]): boolean {
  if (records.length === 0) return false
  const last = records[records.length - 1]
  return last.action === 'granted'
}

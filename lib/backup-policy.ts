export type BackupFrequency = 'daily' | 'weekly'

export type BackupPolicy = {
  clinicId: string
  dataset: 'patients' | 'appointments' | 'crm'
  frequency: BackupFrequency
  retentionDays: number
  encrypted: boolean
  actorId: string
  timestampIso: string
}

export function buildBackupPolicy(
  input: Omit<BackupPolicy, 'timestampIso'>,
): BackupPolicy {
  return {
    ...input,
    timestampIso: new Date().toISOString(),
  }
}

export function isBackupPolicyValid(policy: BackupPolicy): boolean {
  if (!policy.clinicId) return false
  if (policy.retentionDays < 7) return false
  if (!policy.encrypted) return false
  return true
}

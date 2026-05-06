export type TenantScopedRecord = {
  clinicId: string
}

export function canAccessClinicRecord(
  actorClinicId: string,
  record: TenantScopedRecord,
): boolean {
  return actorClinicId === record.clinicId
}

export function assertClinicAccess(
  actorClinicId: string,
  record: TenantScopedRecord,
): void {
  if (!canAccessClinicRecord(actorClinicId, record)) {
    throw new Error('Acesso negado: registro pertence a outra clínica')
  }
}

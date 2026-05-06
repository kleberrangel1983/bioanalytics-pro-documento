export type AuditActorRole =
  | 'admin'
  | 'medico'
  | 'secretaria'
  | 'financeiro'
  | 'paciente'
  | 'suporte'

export type AuditAction =
  | 'patient_record_updated'
  | 'appointment_status_changed'
  | 'crm_filter_applied'

export type AuditEventInput = {
  actorId: string
  actorRole: AuditActorRole
  clinicId: string
  action: AuditAction
  resourceId: string
  metadata?: Record<string, string | number | boolean>
}

export type AuditEvent = AuditEventInput & {
  eventId: string
  timestampIso: string
}

export function buildAuditEvent(input: AuditEventInput): AuditEvent {
  const now = new Date().toISOString()

  return {
    ...input,
    eventId: `${input.clinicId}:${input.action}:${now}`,
    timestampIso: now,
  }
}

export function serializeAuditEvent(event: AuditEvent): string {
  return JSON.stringify(event)
}


export function filterAuditEventsForRole(
  role: AuditActorRole,
  events: AuditEvent[],
): AuditEvent[] {
  if (role === "admin" || role === "medico") return events

  if (role === "suporte") {
    return events.map((event) => ({
      ...event,
      metadata: { redacted: true },
    }))
  }

  return []
}

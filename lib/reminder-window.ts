export type ReminderWindowInput = {
  appointmentDateTimeIso: string
  nowIso: string
  minimumHoursBefore: number
}

export function shouldSendReminder(input: ReminderWindowInput): boolean {
  const appointmentTs = new Date(input.appointmentDateTimeIso).getTime()
  const nowTs = new Date(input.nowIso).getTime()
  const diffHours = (appointmentTs - nowTs) / (1000 * 60 * 60)

  return diffHours >= input.minimumHoursBefore
}

export function buildReminderAuditMetadata(input: ReminderWindowInput): {
  appointmentDateTimeIso: string
  nowIso: string
  minimumHoursBefore: number
} {
  return {
    appointmentDateTimeIso: input.appointmentDateTimeIso,
    nowIso: input.nowIso,
    minimumHoursBefore: input.minimumHoursBefore,
  }
}

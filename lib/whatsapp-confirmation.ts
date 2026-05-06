export type ConfirmationChannel = 'whatsapp'

export type ConfirmationInput = {
  patientFirstName: string
  appointmentDateTimeIso: string
  clinicName: string
  attendantName: string
  confirmationLink?: string
}

export type ConfirmationAuditEvent = {
  channel: ConfirmationChannel
  event: 'appointment_confirmation_prepared'
  timestampIso: string
  attendantName: string
  clinicName: string
  patientFirstName: string
  appointmentDateTimeIso: string
  hasConfirmationLink: boolean
}

export function buildConfirmationMessage(input: ConfirmationInput): string {
  const date = new Date(input.appointmentDateTimeIso)
  const dateText = Number.isNaN(date.getTime())
    ? input.appointmentDateTimeIso
    : date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

  const confirmText = input.confirmationLink
    ? `Confirme aqui: ${input.confirmationLink}`
    : 'Se preferir, responda esta mensagem para confirmar com a atendente.'

  return [
    `Olá, ${input.patientFirstName}.`,
    `Esta é a confirmação da sua consulta na ${input.clinicName}.`,
    `Data e hora: ${dateText}.`,
    `Atendente responsável: ${input.attendantName}.`,
    confirmText,
    'Se precisar, você pode falar com um atendente por esta conversa.',
  ].join(' ')
}

export function buildConfirmationAuditEvent(
  input: ConfirmationInput,
): ConfirmationAuditEvent {
  return {
    channel: 'whatsapp',
    event: 'appointment_confirmation_prepared',
    timestampIso: new Date().toISOString(),
    attendantName: input.attendantName,
    clinicName: input.clinicName,
    patientFirstName: input.patientFirstName,
    appointmentDateTimeIso: input.appointmentDateTimeIso,
    hasConfirmationLink: Boolean(input.confirmationLink),
  }
}

import { createHash } from 'node:crypto'

export type IdempotencyInput = {
  clinicId: string
  patientId: string
  channel: 'whatsapp'
  event: string
  referenceIsoDate: string
}

export function buildIdempotencyKey(input: IdempotencyInput): string {
  const raw = [
    input.clinicId,
    input.patientId,
    input.channel,
    input.event,
    input.referenceIsoDate,
  ].join(':')

  return createHash('sha256').update(raw).digest('hex')
}

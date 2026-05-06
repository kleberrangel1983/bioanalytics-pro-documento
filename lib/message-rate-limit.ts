export type MessageAttempt = {
  patientId: string
  channel: 'whatsapp'
  timestampIso: string
}

export type RateLimitInput = {
  patientId: string
  channel: 'whatsapp'
  nowIso: string
  windowMinutes: number
  maxMessages: number
}

export function canSendMessage(
  attempts: MessageAttempt[],
  input: RateLimitInput,
): boolean {
  const nowTs = new Date(input.nowIso).getTime()
  const minTs = nowTs - input.windowMinutes * 60 * 1000

  const attemptsInWindow = attempts.filter((attempt) => {
    if (attempt.patientId !== input.patientId) return false
    if (attempt.channel !== input.channel) return false

    const ts = new Date(attempt.timestampIso).getTime()
    return ts >= minTs && ts <= nowTs
  })

  return attemptsInWindow.length < input.maxMessages
}

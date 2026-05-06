import { createHmac, timingSafeEqual } from 'node:crypto'

export function generateWebhookSignature(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex')
}

export function verifyWebhookSignature(
  payload: string,
  secret: string,
  signature: string,
): boolean {
  const expected = generateWebhookSignature(payload, secret)
  const expectedBuffer = Buffer.from(expected, 'utf8')
  const signatureBuffer = Buffer.from(signature, 'utf8')

  if (expectedBuffer.length !== signatureBuffer.length) return false
  return timingSafeEqual(expectedBuffer, signatureBuffer)
}

// Token-bucket rate limiter — stays safely below the WhatsApp Business API limit of 80 msg/s.
// NOTE: in-memory only; replace the store with Redis for multi-instance deployments.

const MAX_TOKENS = 75
const REFILL_RATE = 75 // tokens per second

let tokens = MAX_TOKENS
let lastRefillAt = Date.now()

function refill() {
  const now = Date.now()
  const elapsed = (now - lastRefillAt) / 1000
  tokens = Math.min(MAX_TOKENS, tokens + elapsed * REFILL_RATE)
  lastRefillAt = now
}

export function canSend(): boolean {
  refill()
  if (tokens >= 1) {
    tokens -= 1
    return true
  }
  return false
}

export function currentTokens(): number {
  refill()
  return Math.floor(tokens)
}

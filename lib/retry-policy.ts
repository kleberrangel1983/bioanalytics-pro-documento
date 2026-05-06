export type RetryPolicyInput = {
  attempt: number
  baseDelayMs: number
  maxDelayMs: number
}

export function calculateRetryDelayMs(input: RetryPolicyInput): number {
  const exponential = input.baseDelayMs * 2 ** (input.attempt - 1)
  return Math.min(exponential, input.maxDelayMs)
}

export function shouldRetry(
  attempt: number,
  maxAttempts: number,
  isTransientError: boolean,
): boolean {
  if (!isTransientError) return false
  return attempt < maxAttempts
}

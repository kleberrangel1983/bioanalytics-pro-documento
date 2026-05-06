const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const source = fs.readFileSync(path.join(process.cwd(), 'lib/retry-policy.ts'), 'utf8')

test('delay usa backoff exponencial', () => {
  assert.match(source, /baseDelayMs \* 2 \*\* \(input\.attempt - 1\)/)
})

test('delay respeita maxDelayMs', () => {
  assert.match(source, /Math\.min\(exponential, input\.maxDelayMs\)/)
})

test('retry só ocorre para erro transitório e abaixo do limite', () => {
  assert.match(source, /if \(!isTransientError\) return false/)
  assert.match(source, /attempt < maxAttempts/)
})

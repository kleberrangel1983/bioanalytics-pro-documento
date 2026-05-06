const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const source = fs.readFileSync(path.join(process.cwd(), 'lib/webhook-security.ts'), 'utf8')

test('usa HMAC SHA-256 para assinatura de webhook', () => {
  assert.match(source, /createHmac\('sha256'/)
})

test('usa comparação segura contra timing attack', () => {
  assert.match(source, /timingSafeEqual/)
})

test('rejeita assinatura com tamanho diferente', () => {
  assert.match(source, /length !== signatureBuffer\.length/)
})

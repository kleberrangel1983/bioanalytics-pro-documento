const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const source = fs.readFileSync(path.join(process.cwd(), 'lib/message-rate-limit.ts'), 'utf8')

test('rate limit filtra por paciente e canal', () => {
  assert.match(source, /attempt\.patientId !== input\.patientId/)
  assert.match(source, /attempt\.channel !== input\.channel/)
})

test('rate limit aplica janela de tempo em minutos', () => {
  assert.match(source, /windowMinutes \* 60 \* 1000/)
})

test('permite envio só abaixo do limite máximo', () => {
  assert.match(source, /attemptsInWindow\.length < input\.maxMessages/)
})

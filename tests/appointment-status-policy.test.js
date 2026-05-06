const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const source = fs.readFileSync(path.join(process.cwd(), 'lib/appointment-status-policy.ts'), 'utf8')

test('triagem permite avançar para agendado ou cancelado', () => {
  assert.match(source, /triagem: \['agendado', 'cancelado'\]/)
})

test('status final não permite transição (atendido/cancelado)', () => {
  assert.match(source, /atendido: \[\]/)
  assert.match(source, /cancelado: \[\]/)
})

test('função usa matriz de transição permitida', () => {
  assert.match(source, /ALLOWED_TRANSITIONS\[from\]\.includes\(to\)/)
})

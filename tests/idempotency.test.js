const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const source = fs.readFileSync(path.join(process.cwd(), 'lib/idempotency.ts'), 'utf8')

test('gera chave com hash SHA-256', () => {
  assert.match(source, /createHash\('sha256'\)/)
})

test('chave inclui clínica, paciente, canal, evento e data de referência', () => {
  assert.match(source, /input\.clinicId/)
  assert.match(source, /input\.patientId/)
  assert.match(source, /input\.channel/)
  assert.match(source, /input\.event/)
  assert.match(source, /input\.referenceIsoDate/)
})

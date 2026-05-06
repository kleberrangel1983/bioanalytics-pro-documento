const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const source = fs.readFileSync(
  path.join(process.cwd(), 'lib/whatsapp-confirmation.ts'),
  'utf8',
)

test('template inclui opção de falar com atendente', () => {
  assert.match(source, /falar com um atendente/)
})

test('auditoria registra evento de confirmação preparada', () => {
  assert.match(source, /appointment_confirmation_prepared/)
})

test('template não inclui orientação clínica', () => {
  assert.equal(/diagnóstico|conduta|prescrição|CID/i.test(source), false)
})

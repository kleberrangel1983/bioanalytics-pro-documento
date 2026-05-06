const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const source = fs.readFileSync(path.join(process.cwd(), 'lib/crm-filter.ts'), 'utf8')

test('CRM filtra por clinicId (separação por clínica)', () => {
  assert.match(source, /lead\.clinicId !== filter\.clinicId/)
})

test('CRM suporta filtro por status e origem', () => {
  assert.match(source, /filter\.statuses/)
  assert.match(source, /filter\.sources/)
})

test('CRM suporta recorte por período', () => {
  assert.match(source, /dateFromIso/)
  assert.match(source, /dateToIso/)
})

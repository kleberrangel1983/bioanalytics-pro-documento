const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const source = fs.readFileSync(path.join(process.cwd(), 'lib/incident-log.ts'), 'utf8')

test('registro de incidente inclui severidade e origem', () => {
  assert.match(source, /IncidentSeverity/)
  assert.match(source, /source: 'whatsapp' \| 'crm' \| 'agenda' \| 'auth'/)
})

test('incidentId usa clinicId, source e timestamp', () => {
  assert.match(source, /incidentId: `\$\{input\.clinicId\}:\$\{input\.source\}:\$\{timestampIso\}`/)
})

test('classifica incidente crítico', () => {
  assert.match(source, /record\.severity === 'critical'/)
})

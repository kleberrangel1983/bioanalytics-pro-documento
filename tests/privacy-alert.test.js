const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const source = fs.readFileSync(path.join(process.cwd(), 'lib/privacy-alert.ts'), 'utf8')

test('escalona incidente crítico com dado de paciente', () => {
  assert.match(source, /incident\.severity === 'critical'/)
})

test('escalona incidente high com múltiplas clínicas', () => {
  assert.match(source, /incident\.severity === 'high' && incident\.affectedClinics > 1/)
})

test('não escalona quando não há dado de paciente', () => {
  assert.match(source, /if \(!incident\.containsPatientData\) return false/)
})

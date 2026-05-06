const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const source = fs.readFileSync(path.join(process.cwd(), 'lib/access-policy.ts'), 'utf8')

test('secretaria não edita conduta clínica', () => {
  assert.match(source, /secretaria:[\s\S]*edit_clinical_conduct: false/)
})

test('paciente só acessa dado próprio', () => {
  assert.match(source, /paciente:[\s\S]*view_own_patient_data: true/)
  assert.match(source, /paciente:[\s\S]*view_any_patient_data: false/)
})

test('médico pode editar conduta clínica', () => {
  assert.match(source, /medico:[\s\S]*edit_clinical_conduct: true/)
})

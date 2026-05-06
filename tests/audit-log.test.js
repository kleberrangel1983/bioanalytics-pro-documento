const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const source = fs.readFileSync(path.join(process.cwd(), 'lib/audit-log.ts'), 'utf8')

test('audit log define perfis obrigatórios', () => {
  assert.match(source, /'admin'/)
  assert.match(source, /'medico'/)
  assert.match(source, /'secretaria'/)
  assert.match(source, /'financeiro'/)
  assert.match(source, /'paciente'/)
  assert.match(source, /'suporte'/)
})

test('audit log define ações críticas rastreáveis', () => {
  assert.match(source, /patient_record_updated/)
  assert.match(source, /appointment_status_changed/)
  assert.match(source, /crm_filter_applied/)
})

test('audit log serializa evento em JSON', () => {
  assert.match(source, /JSON\.stringify\(event\)/)
})

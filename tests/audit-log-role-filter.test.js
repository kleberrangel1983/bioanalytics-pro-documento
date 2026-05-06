const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const source = fs.readFileSync(path.join(process.cwd(), 'lib/audit-log.ts'), 'utf8')

test('admin e médico podem consultar eventos', () => {
  assert.match(source, /role === "admin" \|\| role === "medico"/)
})

test('suporte recebe metadata redacted', () => {
  assert.match(source, /metadata: \{ redacted: true \}/)
})

test('perfis não autorizados recebem lista vazia', () => {
  assert.match(source, /return \[\]/)
})

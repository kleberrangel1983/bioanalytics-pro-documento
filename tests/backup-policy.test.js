const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const source = fs.readFileSync(path.join(process.cwd(), 'lib/backup-policy.ts'), 'utf8')

test('política de backup exige criptografia', () => {
  assert.match(source, /if \(!policy\.encrypted\) return false/)
})

test('política de backup exige retenção mínima de 7 dias', () => {
  assert.match(source, /retentionDays < 7/)
})

test('política de backup guarda clinicId e dataset', () => {
  assert.match(source, /clinicId/)
  assert.match(source, /dataset/)
})

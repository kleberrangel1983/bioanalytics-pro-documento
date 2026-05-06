const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const source = fs.readFileSync(path.join(process.cwd(), 'lib/data-retention.ts'), 'utf8')

test('retenção usa janela em dias convertida para ms', () => {
  assert.match(source, /retentionDays \* 24 \* 60 \* 60 \* 1000/)
})

test('filtra itens expirados por createdAtIso', () => {
  assert.match(source, /new Date\(item\.createdAtIso\)\.getTime\(\) < minTs/)
})

test('política segura exige pelo menos 7 dias', () => {
  assert.match(source, /retentionDays >= 7/)
})

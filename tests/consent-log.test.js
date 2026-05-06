const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const source = fs.readFileSync(path.join(process.cwd(), 'lib/consent-log.ts'), 'utf8')

test('registro de consentimento contém granted e revoked', () => {
  assert.match(source, /'granted'/)
  assert.match(source, /'revoked'/)
})

test('registro contém canal e finalidade', () => {
  assert.match(source, /channel/)
  assert.match(source, /purpose/)
})

test('status ativo depende do último evento', () => {
  assert.match(source, /last\.action === 'granted'/)
})

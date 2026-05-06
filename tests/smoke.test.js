const test = require('node:test')
const assert = require('node:assert/strict')

test('smoke: ambiente de teste ativo', () => {
  assert.equal(1 + 1, 2)
})

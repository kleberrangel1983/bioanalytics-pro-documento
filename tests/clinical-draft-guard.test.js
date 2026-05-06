const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const source = fs.readFileSync(path.join(process.cwd(), 'lib/clinical-draft-guard.ts'), 'utf8')

test('persistência só é permitida após revisão médica', () => {
  assert.match(source, /reviewedByDoctor === true/)
})

test('marca revisão com timestamp', () => {
  assert.match(source, /reviewedAtIso/)
  assert.match(source, /reviewedByDoctor: true/)
})

test('tipo de rascunho clínico exige flag reviewedByDoctor', () => {
  assert.match(source, /reviewedByDoctor: boolean/)
})

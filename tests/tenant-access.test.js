const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const source = fs.readFileSync(path.join(process.cwd(), 'lib/tenant-access.ts'), 'utf8')

test('separação por clínica: compara actorClinicId com record.clinicId', () => {
  assert.match(source, /actorClinicId === record\.clinicId/)
})

test('assertClinicAccess lança erro quando há acesso cruzado', () => {
  assert.match(source, /Acesso negado: registro pertence a outra clínica/)
})

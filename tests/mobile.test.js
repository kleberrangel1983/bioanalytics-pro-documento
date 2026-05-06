const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const mobileSource = fs.readFileSync(
  path.join(process.cwd(), 'lib/mobile.ts'),
  'utf8',
)

function readBreakpoint() {
  const match = mobileSource.match(/MOBILE_BREAKPOINT\s*=\s*(\d+)/)
  if (!match) throw new Error('MOBILE_BREAKPOINT não encontrado em lib/mobile.ts')
  return Number(match[1])
}

function isMobileWidth(width) {
  const breakpoint = readBreakpoint()
  return width < breakpoint
}

test('lib/mobile.ts define MOBILE_BREAKPOINT', () => {
  assert.equal(readBreakpoint(), 768)
})

test('isMobileWidth: retorna true para largura menor que breakpoint', () => {
  assert.equal(isMobileWidth(767), true)
})

test('isMobileWidth: retorna false para largura igual ao breakpoint', () => {
  assert.equal(isMobileWidth(768), false)
})

test('isMobileWidth: retorna false para largura maior que breakpoint', () => {
  assert.equal(isMobileWidth(1024), false)
})

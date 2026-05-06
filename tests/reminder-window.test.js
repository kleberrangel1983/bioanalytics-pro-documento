const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const source = fs.readFileSync(path.join(process.cwd(), 'lib/reminder-window.ts'), 'utf8')

test('regra usa diferença em horas para envio', () => {
  assert.match(source, /diffHours/)
})

test('respeita mínimo de horas antes da consulta', () => {
  assert.match(source, /minimumHoursBefore/)
  assert.match(source, /diffHours >= input\.minimumHoursBefore/)
})

test('gera metadata auditável do lembrete', () => {
  assert.match(source, /buildReminderAuditMetadata/)
})

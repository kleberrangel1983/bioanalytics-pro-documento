-- Seed data applied to live DB. Appointments use patient IDs from existing rows.

-- Appointments (uses patient_id subselect to avoid hardcoding UUIDs)
INSERT INTO appointments (patient_id, doctor_id, type, scheduled_at, status, created_by)
SELECT id, '00000000-0000-0000-0001-000000000001'::uuid,
       'Consulta Clínica Geral', now() + interval '1 day', 'confirmed', 'seed'
FROM patients LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO appointments (patient_id, doctor_id, type, scheduled_at, status, created_by)
SELECT id, '00000000-0000-0000-0001-000000000001'::uuid,
       'Retorno', now() + interval '3 days', 'pending', 'seed'
FROM patients OFFSET 1 LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO appointments (patient_id, doctor_id, type, scheduled_at, status, created_by)
SELECT id, '00000000-0000-0000-0001-000000000002'::uuid,
       'Triagem Inicial', now() + interval '2 hours', 'confirmed', 'seed'
FROM patients OFFSET 2 LIMIT 1
ON CONFLICT DO NOTHING;

-- Feature flags state (mirrors flags.ts catalogue defaults)
INSERT INTO feature_flags_state (flag_id, environment, enabled, rollout_pct, role_overrides, updated_by) VALUES
  ('novo-dashboard-analitico', 'staging',    true,  100, '{}',                                '00000000-0000-0000-0000-000000000000'),
  ('novo-dashboard-analitico', 'production', true,  20,  '{"admin":true,"suporte":false}',    '00000000-0000-0000-0000-000000000000'),
  ('triagem-ia',               'staging',    true,  100, '{"medico":true}',                   '00000000-0000-0000-0000-000000000000'),
  ('triagem-ia',               'production', false, 0,   '{}',                                '00000000-0000-0000-0000-000000000000'),
  ('agendamento-online',       'staging',    true,  100, '{}',                                '00000000-0000-0000-0000-000000000000'),
  ('agendamento-online',       'production', true,  30,  '{"paciente":true,"admin":true}',    '00000000-0000-0000-0000-000000000000'),
  ('exportacao-pdf-avancada',  'staging',    true,  100, '{}',                                '00000000-0000-0000-0000-000000000000'),
  ('exportacao-pdf-avancada',  'production', true,  100, '{"suporte":false,"paciente":false}','00000000-0000-0000-0000-000000000000'),
  ('notificacoes-whatsapp',    'staging',    true,  100, '{}',                                '00000000-0000-0000-0000-000000000000'),
  ('notificacoes-whatsapp',    'production', true,  5,   '{}',                                '00000000-0000-0000-0000-000000000000'),
  ('modo-offline',             'staging',    false, 0,   '{}',                                '00000000-0000-0000-0000-000000000000'),
  ('modo-offline',             'production', false, 0,   '{}',                                '00000000-0000-0000-0000-000000000000')
ON CONFLICT (flag_id, environment) DO NOTHING;

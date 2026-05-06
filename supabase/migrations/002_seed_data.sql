-- Seed patients
insert into patients (id, name, birth_date, cpf, phone, email) values
  ('00000000-0000-0000-0000-000000000001', 'Maria Silva Santos', '1985-03-15', '123.456.789-00', '(11) 99999-0001', 'maria.silva@email.com'),
  ('00000000-0000-0000-0000-000000000002', 'João Pedro Oliveira', '1972-07-22', '987.654.321-00', '(11) 99999-0002', 'joao.oliveira@email.com'),
  ('00000000-0000-0000-0000-000000000003', 'Ana Beatriz Costa',  '1990-11-08', '456.789.123-00', '(11) 99999-0003', 'ana.costa@email.com');

-- Seed appointments
insert into appointments (patient_id, doctor_id, type, scheduled_at, status) values
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000001', 'Consulta Clínica Geral', now() + interval '1 day', 'confirmed'),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0001-000000000001', 'Retorno', now() + interval '3 days', 'pending'),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0001-000000000002', 'Triagem Inicial', now() + interval '2 hours', 'confirmed');

-- Seed feature flags state (mirrors flags.ts defaults)
insert into feature_flags_state (flag_id, environment, enabled, rollout_pct, role_overrides, updated_by) values
  ('novo-dashboard-analitico', 'staging',    true,  100, '{}',                                   '00000000-0000-0000-0000-000000000000'),
  ('novo-dashboard-analitico', 'production', true,  20,  '{"admin":true,"suporte":false}',        '00000000-0000-0000-0000-000000000000'),
  ('triagem-ia',               'staging',    true,  100, '{"medico":true}',                       '00000000-0000-0000-0000-000000000000'),
  ('triagem-ia',               'production', false, 0,   '{}',                                   '00000000-0000-0000-0000-000000000000'),
  ('agendamento-online',       'staging',    true,  100, '{}',                                   '00000000-0000-0000-0000-000000000000'),
  ('agendamento-online',       'production', true,  30,  '{"paciente":true,"admin":true}',        '00000000-0000-0000-0000-000000000000'),
  ('exportacao-pdf-avancada',  'staging',    true,  100, '{}',                                   '00000000-0000-0000-0000-000000000000'),
  ('exportacao-pdf-avancada',  'production', true,  100, '{"suporte":false,"paciente":false}',    '00000000-0000-0000-0000-000000000000'),
  ('notificacoes-whatsapp',    'staging',    true,  100, '{}',                                   '00000000-0000-0000-0000-000000000000'),
  ('notificacoes-whatsapp',    'production', true,  5,   '{}',                                   '00000000-0000-0000-0000-000000000000'),
  ('modo-offline',             'staging',    false, 0,   '{}',                                   '00000000-0000-0000-0000-000000000000'),
  ('modo-offline',             'production', false, 0,   '{}',                                   '00000000-0000-0000-0000-000000000000');

-- BioAnalytics Pro — Admin: clinic_users e feature_flags
-- Aplicar via: supabase db push

-- ─── clinic_users ─────────────────────────────────────────────────────────────
create table clinic_users (
  id         uuid primary key default uuid_generate_v4(),
  email      text      not null unique,
  name       text      not null,
  role       user_role not null default 'convidado',
  active     boolean   not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger clinic_users_updated_at
  before update on clinic_users
  for each row execute function set_updated_at();

alter table clinic_users enable row level security;

create policy "service_role full access on clinic_users"
  on clinic_users for all
  to service_role
  using (true) with check (true);

-- ─── feature_flags ────────────────────────────────────────────────────────────
create table feature_flags (
  id          uuid primary key default uuid_generate_v4(),
  key         text    not null unique,
  label       text    not null,
  description text,
  enabled     boolean not null default false,
  updated_by  text    not null default 'sistema',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger feature_flags_updated_at
  before update on feature_flags
  for each row execute function set_updated_at();

alter table feature_flags enable row level security;

create policy "service_role full access on feature_flags"
  on feature_flags for all
  to service_role
  using (true) with check (true);

create policy "authenticated read feature_flags"
  on feature_flags for select
  to authenticated
  using (true);

-- ─── Seed ──────────────────────────────────────────────────────────────────────
insert into clinic_users (email, name, role, active) values
  ('admin@clinic.com',             'Administrador',      'admin',      true),
  ('dr.carlos@clinic.com',         'Dr. Carlos Mendes',  'medico',     true),
  ('secretaria.julia@clinic.com',  'Julia Alves',        'secretaria', true),
  ('nova.secretaria@clinic.com',   'Nova Secretária',    'secretaria', true),
  ('guest.teste@clinic.com',       'Usuário Teste',      'convidado',  false);

insert into feature_flags (key, label, description, enabled) values
  ('whatsapp_confirmacao',  'Confirmação via WhatsApp',   'Envia mensagem automática ao criar agendamento',              true),
  ('whatsapp_cancelamento', 'Cancelamento via WhatsApp',  'Permite paciente cancelar via WhatsApp com CANCELAR',         true),
  ('realtime_agenda',       'Agenda em tempo real',       'Supabase Realtime na interface da secretária',                true),
  ('auditoria_detalhada',   'Auditoria detalhada',        'Registra detalhes extras em ações críticas',                  false),
  ('uat_modulo',            'Módulo UAT',                 'Exibe módulo de feedback UAT para usuários piloto',           true),
  ('modo_manutencao',       'Modo manutenção',            'Bloqueia acesso ao sistema para não-admins',                  false),
  ('exportar_relatorio',    'Exportar relatórios',        'Permite exportação de relatórios em CSV/PDF',                 false),
  ('integracao_prontuario', 'Integração prontuário',      'Conecta ao sistema de prontuário eletrônico externo',         false);

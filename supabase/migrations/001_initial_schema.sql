-- BioAnalytics Pro — Schema inicial
-- Aplicar via: supabase db push  ou  supabase migration up

-- ─── Extensions ───────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Enums ────────────────────────────────────────────────────────────────────
create type appointment_status as enum ('aguardando', 'confirmado', 'atendido', 'cancelado');
create type user_role          as enum ('admin', 'medico', 'secretaria', 'convidado');
create type audit_severity     as enum ('info', 'warning', 'critical');

-- ─── patients ─────────────────────────────────────────────────────────────────
create table patients (
  id         uuid primary key default uuid_generate_v4(),
  name       text        not null,
  phone      text        not null unique,
  email      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── appointments ─────────────────────────────────────────────────────────────
create table appointments (
  id           uuid primary key default uuid_generate_v4(),
  patient_id   uuid        not null references patients(id) on delete cascade,
  type         text        not null,
  scheduled_at timestamptz not null,
  status       appointment_status not null default 'aguardando',
  notes        text,
  created_by   text        not null,   -- user e-mail from auth session
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index appointments_scheduled_at_idx on appointments (scheduled_at);
create index appointments_patient_id_idx   on appointments (patient_id);
create index appointments_status_idx       on appointments (status);

-- ─── audit_logs ───────────────────────────────────────────────────────────────
-- Append-only: no UPDATE/DELETE allowed (enforced via RLS below)
create table audit_logs (
  id         uuid primary key default uuid_generate_v4(),
  user_email text           not null,
  user_role  user_role      not null,
  action     text           not null,
  resource   text           not null,
  ip         text           not null,
  severity   audit_severity not null default 'info',
  details    text,
  success    boolean        not null default true,
  created_at timestamptz    not null default now()
);

create index audit_logs_created_at_idx  on audit_logs (created_at desc);
create index audit_logs_severity_idx    on audit_logs (severity);
create index audit_logs_user_email_idx  on audit_logs (user_email);

-- ─── updated_at trigger ───────────────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger patients_updated_at
  before update on patients
  for each row execute function set_updated_at();

create trigger appointments_updated_at
  before update on appointments
  for each row execute function set_updated_at();

-- ─── Row Level Security ───────────────────────────────────────────────────────
alter table patients     enable row level security;
alter table appointments enable row level security;
alter table audit_logs   enable row level security;

-- Authenticated users can read patients and appointments
create policy "authenticated_read_patients"
  on patients for select
  to authenticated
  using (true);

create policy "authenticated_read_appointments"
  on appointments for select
  to authenticated
  using (true);

-- Only service_role (server) can write to all tables
create policy "service_write_patients"
  on patients for all
  to service_role
  using (true) with check (true);

create policy "service_write_appointments"
  on appointments for all
  to service_role
  using (true) with check (true);

-- audit_logs: anyone authenticated can insert, only admin can read, nobody can update/delete
create policy "authenticated_insert_audit"
  on audit_logs for insert
  to authenticated
  with check (true);

create policy "service_read_audit"
  on audit_logs for select
  to service_role
  using (true);

-- ─── Seed data (homologação) ──────────────────────────────────────────────────
insert into patients (name, phone, email) values
  ('Ana Souza',        '(11) 91234-5678', 'ana.souza@email.com'),
  ('Carlos Mendes',    '(11) 98765-4321', 'carlos.mendes@email.com'),
  ('Fernanda Lima',    '(21) 93456-7890', 'fernanda.lima@email.com'),
  ('Roberto Silva',    '(11) 94567-8901', 'roberto.silva@email.com'),
  ('Juliana Costa',    '(31) 95678-9012', 'juliana.costa@email.com'),
  ('Marcos Oliveira',  '(11) 96789-0123', 'marcos.oliveira@email.com'),
  ('Patricia Rocha',   '(21) 97890-1234', 'patricia.rocha@email.com'),
  ('Eduardo Ferreira', '(11) 98901-2345', 'eduardo.ferreira@email.com');

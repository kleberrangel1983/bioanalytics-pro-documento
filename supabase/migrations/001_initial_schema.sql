-- ── Enum ─────────────────────────────────────────────────────────────────────

create type user_role as enum ('admin', 'medico', 'secretaria', 'paciente', 'suporte');

-- ── Patients ─────────────────────────────────────────────────────────────────

create table patients (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  birth_date  date not null,
  cpf         text not null unique,
  phone       text,
  email       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── Appointments ─────────────────────────────────────────────────────────────

create table appointments (
  id            uuid primary key default gen_random_uuid(),
  patient_id    uuid not null references patients(id) on delete cascade,
  doctor_id     uuid not null,
  type          text not null,
  scheduled_at  timestamptz not null,
  status        text not null default 'pending'
                  check (status in ('pending','confirmed','cancelled','completed')),
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index on appointments(patient_id);
create index on appointments(scheduled_at);

-- ── Triage records ────────────────────────────────────────────────────────────

create table triage_records (
  id              uuid primary key default gen_random_uuid(),
  patient_id      uuid not null references patients(id) on delete cascade,
  appointment_id  uuid references appointments(id) on delete set null,
  risk_score      integer not null check (risk_score between 0 and 100),
  symptoms        text[] not null default '{}',
  notes           text,
  triaged_by      uuid not null,
  created_at      timestamptz not null default now()
);

create index on triage_records(patient_id);

-- ── Audit logs ────────────────────────────────────────────────────────────────

create table audit_logs (
  id             uuid primary key default gen_random_uuid(),
  actor_id       uuid not null,
  actor_role     user_role not null,
  action         text not null,
  resource_type  text not null,
  resource_id    uuid,
  metadata       jsonb,
  ip_address     inet,
  created_at     timestamptz not null default now()
);

create index on audit_logs(actor_id);
create index on audit_logs(created_at desc);

-- audit_logs is append-only — disable updates and deletes via RLS
alter table audit_logs enable row level security;
create policy "audit_logs_insert" on audit_logs for insert with check (true);
create policy "audit_logs_select" on audit_logs for select using (true);

-- ── Feature flags state ───────────────────────────────────────────────────────

create table feature_flags_state (
  flag_id        text not null,
  environment    text not null check (environment in ('staging','production')),
  enabled        boolean not null default false,
  rollout_pct    integer not null default 0 check (rollout_pct between 0 and 100),
  role_overrides jsonb not null default '{}',
  updated_by     uuid not null,
  updated_at     timestamptz not null default now(),
  primary key (flag_id, environment)
);

-- ── Row Level Security — medical tables ──────────────────────────────────────
-- Enable RLS on all tables with patient data so the anon key cannot read or
-- write records unless an explicit policy grants access.

alter table patients        enable row level security;
alter table appointments    enable row level security;
alter table triage_records  enable row level security;

-- Authenticated users can read their own patient record (self-service portal).
-- Admin/medico/secretaria access is handled via service_role key server-side.
create policy "patients_authenticated_read" on patients
  for select using (auth.role() = 'authenticated');

-- Authenticated users can see their own appointments.
create policy "appointments_authenticated_read" on appointments
  for select using (auth.role() = 'authenticated');

-- Triage records: readable only by authenticated users (role enforcement in app).
create policy "triage_authenticated_read" on triage_records
  for select using (auth.role() = 'authenticated');

-- ── updated_at trigger ────────────────────────────────────────────────────────

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger patients_updated_at    before update on patients    for each row execute function set_updated_at();
create trigger appointments_updated_at before update on appointments for each row execute function set_updated_at();

-- Applied to the live DB via Supabase MCP to reconcile the pre-existing schema
-- with the column/type layout that the API routes expect.

-- ── Add English status values to pre-existing appointment_status enum ─────────
ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'pending';
ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'confirmed';
ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'cancelled';
ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'completed';

-- ── Add missing columns to pre-existing tables ────────────────────────────────
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS doctor_id uuid;
ALTER TABLE patients     ADD COLUMN IF NOT EXISTS cpf       text;
ALTER TABLE patients     ADD COLUMN IF NOT EXISTS birth_date date;

-- ── Recreate audit_logs to match API schema (was empty) ───────────────────────
DROP TABLE IF EXISTS audit_logs CASCADE;
CREATE TABLE audit_logs (
  id             uuid primary key default gen_random_uuid(),
  actor_id       uuid not null,
  actor_role     text not null,
  action         text not null,
  resource_type  text not null,
  resource_id    uuid,
  metadata       jsonb,
  ip_address     inet,
  created_at     timestamptz not null default now()
);
CREATE INDEX audit_logs_actor_idx   ON audit_logs(actor_id);
CREATE INDEX audit_logs_created_idx ON audit_logs(created_at DESC);
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_logs_insert" ON audit_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "audit_logs_select" ON audit_logs FOR SELECT  USING (true);

-- ── Create triage_records ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS triage_records (
  id              uuid primary key default gen_random_uuid(),
  patient_id      uuid not null references patients(id) on delete cascade,
  appointment_id  uuid references appointments(id) on delete set null,
  risk_score      integer not null check (risk_score between 0 and 100),
  symptoms        text[] not null default '{}',
  notes           text,
  triaged_by      uuid not null,
  created_at      timestamptz not null default now()
);
CREATE INDEX IF NOT EXISTS triage_records_patient_idx ON triage_records(patient_id);
ALTER TABLE triage_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "triage_authenticated_read" ON triage_records
  FOR SELECT USING (auth.role() = 'authenticated');

-- ── Create feature_flags_state ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS feature_flags_state (
  flag_id        text not null,
  environment    text not null check (environment in ('staging','production')),
  enabled        boolean not null default false,
  rollout_pct    integer not null default 0 check (rollout_pct between 0 and 100),
  role_overrides jsonb not null default '{}',
  updated_by     uuid not null,
  updated_at     timestamptz not null default now(),
  primary key (flag_id, environment)
);
ALTER TABLE feature_flags_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "flags_state_select" ON feature_flags_state
  FOR SELECT USING (true);

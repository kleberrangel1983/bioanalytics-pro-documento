-- BioAnalytics Pro — UAT Feedback table
-- Aplicar via: supabase db push

create table if not exists uat_feedback (
  id             uuid primary key default uuid_generate_v4(),
  scenario_id    text        not null,
  scenario_title text        not null,
  tester_name    text        not null,
  tester_role    text        not null,
  rating         smallint    not null check (rating between 1 and 5),
  notes          text,
  is_blocker     boolean     not null default false,
  created_at     timestamptz not null default now()
);

create index if not exists uat_feedback_scenario_id_idx on uat_feedback (scenario_id);
create index if not exists uat_feedback_created_at_idx  on uat_feedback (created_at desc);

-- RLS: only service_role can write; authenticated users can read their own session
alter table uat_feedback enable row level security;

create policy "service_role full access on uat_feedback"
  on uat_feedback for all
  to service_role
  using (true)
  with check (true);

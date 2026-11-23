-- ============================================================
-- MIGRATION 003: AI Defense Challenge Tables
-- Adds tables for the Zero-Trust Proof-of-Competency protocol
-- ============================================================

-- ── Defense Challenges ───────────────────────────────────────
-- Stores generated defense challenges for evidence items
create table if not exists defense_challenges (
  id            text primary key,                    -- e.g., "def-abc123-1700000000"
  evidence_id   uuid references evidence(id) on delete cascade,
  student_id    uuid references profiles(id) on delete cascade,
  challenge_data jsonb not null,                     -- Full DefenseChallenge JSON
  status        text default 'pending'               -- pending | completed | expired
    check (status in ('pending', 'completed', 'expired')),
  created_at    timestamptz default now(),
  expires_at    timestamptz default (now() + interval '24 hours')
);

create index on defense_challenges (evidence_id);
create index on defense_challenges (student_id);

-- ── Defense Submissions ──────────────────────────────────────
-- Stores student responses with keystroke telemetry
create table if not exists defense_submissions (
  id             uuid primary key default gen_random_uuid(),
  challenge_id   text references defense_challenges(id) on delete cascade,
  student_id     uuid references profiles(id) on delete cascade,
  responses_data jsonb not null,                     -- Array of QuestionResponse
  started_at     timestamptz not null,
  completed_at   timestamptz not null,
  created_at     timestamptz default now()
);

create index on defense_submissions (challenge_id);
create index on defense_submissions (student_id);

-- ── Defense Reports ──────────────────────────────────────────
-- Stores AI evaluation reports for faculty review
create table if not exists defense_reports (
  id                     uuid primary key default gen_random_uuid(),
  challenge_id           text references defense_challenges(id) on delete cascade,
  evidence_id            uuid references evidence(id) on delete cascade,
  student_id             uuid references profiles(id) on delete cascade,
  -- Scores
  asi_score              numeric(5,1) not null,       -- 0.0 - 100.0
  telemetry_confidence   numeric(4,3) not null,       -- 0.000 - 1.000
  combined_defense_score numeric(5,1) not null,       -- 0.0 - 100.0
  defense_level          text not null                -- Passed | Marginal | Failed
    check (defense_level in ('Passed', 'Marginal', 'Failed')),
  -- Full report JSON (transcript, per-question evals, telemetry)
  report_data            jsonb not null,
  report_hash            text not null,               -- SHA-256 for integrity
  created_at             timestamptz default now()
);

create index on defense_reports (evidence_id);
create index on defense_reports (student_id);
create index on defense_reports (defense_level);

-- ── Verifiable Credentials ───────────────────────────────────
-- Stores W3C Verifiable Credentials with Ed25519 signatures
create table if not exists verifiable_credentials (
  id               uuid primary key default gen_random_uuid(),
  student_id       uuid references profiles(id) on delete cascade,
  skill_name       text not null,
  credential_data  jsonb not null,                   -- Full W3C VC JSON-LD
  merkle_root      text not null,                    -- Evidence chain Merkle root
  issued_at        timestamptz default now(),
  expires_at       timestamptz not null,
  revoked          boolean default false
);

create index on verifiable_credentials (student_id);
create index on verifiable_credentials (skill_name);

-- ── Update evidence table: add defense_score column ──────────
alter table evidence
  add column if not exists defense_score numeric(5,1) default null,
  add column if not exists defense_level text default null;

-- ── Trigger: After defense report insert, update evidence ────
create or replace function sync_defense_to_evidence()
returns trigger language plpgsql as $$
begin
  update evidence
  set
    defense_score = new.combined_defense_score,
    defense_level = new.defense_level,
    -- Upgrade proof_level to 2 if defense passed and currently below
    proof_level = case
      when new.defense_level = 'Passed' and proof_level < 2 then 2
      else proof_level
    end
  where id = new.evidence_id;
  return new;
end;
$$;

create trigger after_defense_report_insert
after insert on defense_reports
for each row execute function sync_defense_to_evidence();


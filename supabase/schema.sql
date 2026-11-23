-- ============================================================
-- PROOFLY: Full Schema for Supabase
-- Run this in the SQL Editor at:
--   https://pbexpyjmsdltjhnmejjk.supabase.co
-- ============================================================

-- Enable pgvector
create extension if not exists vector;

-- ============================================================
-- ENUMS
-- ============================================================
create type user_role as enum ('student','faculty','placement','admin');
create type verify_status as enum ('self_reported','pending','verified','rejected','revoked');
create type evidence_type as enum ('project','hackathon','internship','certificate','competition','achievement');

-- ============================================================
-- PROFILES  (extends auth.users)
-- ============================================================
create table profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  role         user_role not null default 'student',
  full_name    text not null,
  handle       text unique,
  department   text,
  batch        int,
  headline     text,
  bio          text,
  avatar_url   text,
  github_url   text,
  linkedin_url text,
  website_url  text,
  college      text,
  is_public    boolean default false,
  created_at   timestamptz default now()
);

-- ============================================================
-- SKILLS
-- ============================================================
create table skills (
  id             serial primary key,
  canonical_name text unique not null,
  category       text
);

create table skill_aliases (
  alias    text primary key,
  skill_id int references skills(id) on delete cascade
);

-- ============================================================
-- EVIDENCE
-- ============================================================
create table evidence (
  id              uuid primary key default gen_random_uuid(),
  student_id      uuid references profiles(id) on delete cascade,
  type            evidence_type not null,
  title           text not null,
  description     text,
  proof_url       text,
  proof_file_path text,
  proof_level     int default 0 check (proof_level between 0 and 4),
  depth_factor    numeric default 1.0,
  event_date      date,
  status          verify_status default 'self_reported',
  embedding       vector(384),
  similarity_flag boolean default false,
  metrics         text,
  organization    text,
  created_at      timestamptz default now()
);

create index on evidence using hnsw (embedding vector_cosine_ops);
create index on evidence (student_id);
create index on evidence (status);

-- ============================================================
-- EVIDENCE ↔ SKILLS (many-to-many)
-- ============================================================
create table evidence_skills (
  evidence_id uuid references evidence(id) on delete cascade,
  skill_id    int  references skills(id)   on delete cascade,
  primary key (evidence_id, skill_id)
);

-- ============================================================
-- VERIFICATIONS
-- ============================================================
create table verifications (
  id                uuid primary key default gen_random_uuid(),
  evidence_id       uuid references evidence(id) on delete cascade,
  verifier_id       uuid references profiles(id),
  checked_exists    boolean,
  checked_authorship boolean,
  checked_quality   boolean,
  decision          verify_status not null,
  remarks           text,
  created_at        timestamptz default now()
);

-- Trigger: sync verifications.decision → evidence.status
create or replace function sync_evidence_status()
returns trigger language plpgsql as $$
begin
  update evidence set status = new.decision where id = new.evidence_id;
  return new;
end;
$$;

create trigger after_verification_insert
after insert on verifications
for each row execute function sync_evidence_status();

-- ============================================================
-- OPPORTUNITIES
-- ============================================================
create table opportunities (
  id          uuid primary key default gen_random_uuid(),
  posted_by   uuid references profiles(id),
  title       text not null,
  company     text not null,
  description text,
  location    text,
  type        text default 'internship',  -- internship | full-time | research
  workplace   text default 'Remote',      -- Remote | Hybrid | On-site
  stipend     text,
  deadline    date,
  status      text default 'open',
  embedding   vector(384),
  created_at  timestamptz default now()
);

create table opportunity_skills (
  opportunity_id uuid references opportunities(id) on delete cascade,
  skill_id       int  references skills(id)         on delete cascade,
  weight         numeric default 1.0,
  primary key (opportunity_id, skill_id)
);

-- ============================================================
-- APPLICATIONS
-- ============================================================
create table applications (
  id             uuid primary key default gen_random_uuid(),
  student_id     uuid references profiles(id),
  opportunity_id uuid references opportunities(id),
  status         text default 'Saved',
  applied_date   date,
  updated_at     timestamptz default now()
);

create table application_history (
  id             bigserial primary key,
  application_id uuid references applications(id) on delete cascade,
  status         text not null,
  note           text,
  created_at     timestamptz default now()
);

-- ============================================================
-- AUDIT LOG
-- ============================================================
create table audit_log (
  id         bigserial primary key,
  actor_id   uuid,
  action     text,
  entity     text,
  entity_id  uuid,
  details    jsonb,
  created_at timestamptz default now()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create table notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references profiles(id) on delete cascade,
  title      text not null,
  message    text,
  type       text default 'info',  -- verification | match | application | info
  read       boolean default false,
  link_tab   text,
  created_at timestamptz default now()
);

-- ============================================================
-- Auto-create profile on signup
-- ============================================================
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (
    id,
    full_name,
    role,
    department,
    batch,
    college,
    headline,
    is_public
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'student'::user_role),
    coalesce(new.raw_user_meta_data->>'department', 'Computer Science & AI'),
    coalesce((new.raw_user_meta_data->>'batch')::int, 2026),
    coalesce(new.raw_user_meta_data->>'college', 'Campus University'),
    coalesce(new.raw_user_meta_data->>'headline', 'Verified Scholar'),
    true
  )
  on conflict (id) do update set
    full_name   = excluded.full_name,
    role        = excluded.role,
    department  = coalesce(excluded.department, profiles.department),
    batch       = coalesce(excluded.batch, profiles.batch),
    college     = coalesce(excluded.college, profiles.college),
    is_public   = true;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();


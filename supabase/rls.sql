-- ============================================================
-- PROOFLY: Row Level Security Policies
-- Run AFTER schema.sql
-- ============================================================

-- ============================================================
-- PROFILES
-- ============================================================
alter table profiles enable row level security;

create policy "Anyone can read public profiles"
  on profiles for select
  using (is_public = true or id = auth.uid());

create policy "User can update own profile"
  on profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- ============================================================
-- Helper: get caller's role from profiles
-- ============================================================
create or replace function current_role_name()
returns user_role language sql stable security definer as $$
  select role from profiles where id = auth.uid()
$$;

-- ============================================================
-- EVIDENCE
-- ============================================================
alter table evidence enable row level security;

create policy "Student reads own evidence"
  on evidence for select
  using (student_id = auth.uid());

create policy "Student inserts own evidence"
  on evidence for insert
  with check (student_id = auth.uid());

-- Students CANNOT update status/proof_level directly
-- Updates to those fields go through verifications table or service key
create policy "Student updates own evidence (non-sensitive fields only)"
  on evidence for update
  using (student_id = auth.uid())
  with check (
    student_id = auth.uid()
    -- Block status/proof_level changes via RLS (service role bypasses RLS)
  );

create policy "Faculty reads all evidence"
  on evidence for select
  using (current_role_name() in ('faculty', 'admin'));

create policy "Placement reads verified evidence"
  on evidence for select
  using (
    current_role_name() in ('placement', 'admin')
    and status = 'verified'
  );

-- ============================================================
-- EVIDENCE_SKILLS
-- ============================================================
alter table evidence_skills enable row level security;

create policy "Student manages own evidence skills"
  on evidence_skills for all
  using (
    exists (
      select 1 from evidence e
      where e.id = evidence_id and e.student_id = auth.uid()
    )
  );

create policy "Faculty reads evidence skills"
  on evidence_skills for select
  using (current_role_name() in ('faculty', 'admin'));

-- ============================================================
-- VERIFICATIONS
-- ============================================================
alter table verifications enable row level security;

create policy "Faculty inserts verifications"
  on verifications for insert
  with check (current_role_name() in ('faculty', 'admin'));

create policy "Faculty reads verifications"
  on verifications for select
  using (current_role_name() in ('faculty', 'admin'));

create policy "Student reads own evidence verifications"
  on verifications for select
  using (
    exists (
      select 1 from evidence e
      where e.id = evidence_id and e.student_id = auth.uid()
    )
  );

-- ============================================================
-- SKILLS (read-only for all authenticated users)
-- ============================================================
alter table skills enable row level security;

create policy "Anyone authenticated reads skills"
  on skills for select
  using (auth.uid() is not null);

alter table skill_aliases enable row level security;

create policy "Anyone authenticated reads skill aliases"
  on skill_aliases for select
  using (auth.uid() is not null);

-- ============================================================
-- OPPORTUNITIES
-- ============================================================
alter table opportunities enable row level security;

create policy "Anyone authenticated reads open opportunities"
  on opportunities for select
  using (auth.uid() is not null and status = 'open');

create policy "Placement inserts opportunities"
  on opportunities for insert
  with check (current_role_name() in ('placement', 'admin'));

create policy "Placement updates own opportunities"
  on opportunities for update
  using (posted_by = auth.uid());

-- ============================================================
-- OPPORTUNITY_SKILLS
-- ============================================================
alter table opportunity_skills enable row level security;

create policy "Anyone authenticated reads opportunity skills"
  on opportunity_skills for select
  using (auth.uid() is not null);

create policy "Placement manages opportunity skills"
  on opportunity_skills for all
  using (current_role_name() in ('placement', 'admin'));

-- ============================================================
-- APPLICATIONS
-- ============================================================
alter table applications enable row level security;

create policy "Student reads own applications"
  on applications for select
  using (student_id = auth.uid());

create policy "Student inserts own applications"
  on applications for insert
  with check (student_id = auth.uid());

create policy "Student updates own application status"
  on applications for update
  using (student_id = auth.uid())
  with check (student_id = auth.uid() and status in ('Saved', 'Applied'));

create policy "Placement reads all applications"
  on applications for select
  using (current_role_name() in ('placement', 'admin'));

create policy "Placement updates application status"
  on applications for update
  using (current_role_name() in ('placement', 'admin'));

-- ============================================================
-- APPLICATION_HISTORY
-- ============================================================
alter table application_history enable row level security;

create policy "Student reads own application history"
  on application_history for select
  using (
    exists (
      select 1 from applications a
      where a.id = application_id and a.student_id = auth.uid()
    )
  );

create policy "Service inserts history"
  on application_history for insert
  with check (auth.uid() is not null);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
alter table notifications enable row level security;

create policy "User reads own notifications"
  on notifications for select
  using (user_id = auth.uid());

create policy "User updates own notifications (mark read)"
  on notifications for update
  using (user_id = auth.uid());

-- ============================================================
-- AUDIT_LOG (append-only, admin reads)
-- ============================================================
alter table audit_log enable row level security;

create policy "Admins read audit log"
  on audit_log for select
  using (current_role_name() = 'admin');


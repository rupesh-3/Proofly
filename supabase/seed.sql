-- ============================================================
-- PROOFLY: Seed Data for Supabase
-- Run in the Supabase SQL Editor AFTER schema.sql and rls.sql
-- ============================================================

-- ------------------------------------------------------------
-- 1. Canonical Skills
-- ------------------------------------------------------------
insert into skills (id, canonical_name, category) values
  (1, 'Python', 'Programming'),
  (2, 'TypeScript', 'Programming'),
  (3, 'JavaScript', 'Programming'),
  (4, 'C++', 'Programming'),
  (5, 'Rust', 'Programming'),
  (6, 'Go', 'Programming'),
  (7, 'Java', 'Programming'),
  (8, 'React', 'Programming'),
  (9, 'Next.js', 'Programming'),
  (10, 'Node.js', 'Programming'),
  (11, 'Machine Learning', 'ML/AI'),
  (12, 'Deep Learning', 'ML/AI'),
  (13, 'PyTorch', 'ML/AI'),
  (14, 'TensorFlow', 'ML/AI'),
  (15, 'Natural Language Processing', 'ML/AI'),
  (16, 'Computer Vision', 'ML/AI'),
  (17, 'Transformers', 'ML/AI'),
  (18, 'Large Language Models', 'ML/AI'),
  (19, 'SQL', 'Data'),
  (20, 'PostgreSQL', 'Data'),
  (21, 'MongoDB', 'Data'),
  (22, 'Pandas', 'Data'),
  (23, 'Data Analysis', 'Data'),
  (24, 'Data Visualization', 'Data'),
  (25, 'AWS', 'Cloud'),
  (26, 'Docker', 'Cloud'),
  (27, 'Kubernetes', 'Cloud'),
  (28, 'Google Cloud Platform', 'Cloud'),
  (29, 'CI/CD', 'Cloud'),
  (30, 'Embedded Systems', 'Embedded/IoT'),
  (31, 'Internet of Things', 'Embedded/IoT'),
  (32, 'Arduino', 'Embedded/IoT'),
  (33, 'Raspberry Pi', 'Embedded/IoT'),
  (34, 'UI/UX Design', 'Design'),
  (35, 'Figma', 'Design'),
  (36, 'Design Systems', 'Design'),
  (37, 'Technical Writing', 'Communication'),
  (38, 'Presentation & Speaking', 'Communication'),
  (39, 'Project Management', 'Leadership'),
  (40, 'Team Leadership', 'Leadership'),
  (41, 'Agile & Scrum', 'Leadership')
on conflict (id) do nothing;

select setval('skills_id_seq', (select max(id) from skills));

-- ------------------------------------------------------------
-- 2. Skill Aliases
-- ------------------------------------------------------------
insert into skill_aliases (alias, skill_id) values
  ('py', 1), ('python3', 1),
  ('ts', 2),
  ('js', 3),
  ('cpp', 4),
  ('golang', 6),
  ('reactjs', 8), ('react.js', 8),
  ('nextjs', 9),
  ('nodejs', 10),
  ('ml', 11),
  ('nlp', 15),
  ('cv', 16),
  ('llm', 18), ('llms', 18),
  ('postgres', 20),
  ('k8s', 27),
  ('gcp', 28),
  ('iot', 31)
on conflict (alias) do nothing;

-- ------------------------------------------------------------
-- 3. Institutional Opportunities
-- ------------------------------------------------------------
insert into opportunities (id, title, company, description, location, type, workplace, stipend, deadline, status) values
  (
    '11111111-1111-1111-1111-111111111101',
    'Machine Learning Research Fellow',
    'DeepMind Campus Lab',
    'Collaborate on foundation model evaluation, efficient transformer training benchmarks, and reinforcement learning telemetry.',
    'Mountain View, CA',
    'internship',
    'Hybrid',
    '$58 / hr + Housing Stipend',
    '2026-12-15',
    'open'
  ),
  (
    '11111111-1111-1111-1111-111111111102',
    'Distributed Systems & Cloud Engineer',
    'Stripe Infrastructure',
    'Build reliable, distributed transactional primitives handling millions of global financial operations per second.',
    'San Francisco, CA',
    'full-time',
    'Remote',
    '$145k - $175k Base',
    '2026-11-30',
    'open'
  ),
  (
    '11111111-1111-1111-1111-111111111103',
    'Full-Stack AI Application Engineer',
    'Linear Tech',
    'Design lightning-fast web applications, collaborative client-side sync engines, and delightful interactions for developers.',
    'New York, NY',
    'internship',
    'On-site',
    '$48 / hr',
    '2026-12-01',
    'open'
  )
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- 4. Opportunity Skills
-- ------------------------------------------------------------
-- DeepMind ML Fellow skills: Python (5), PyTorch (5), Machine Learning (4), Docker (3)
insert into opportunity_skills (opportunity_id, skill_id, weight) values
  ('11111111-1111-1111-1111-111111111101', 1, 5.0),
  ('11111111-1111-1111-1111-111111111101', 13, 5.0),
  ('11111111-1111-1111-1111-111111111101', 11, 4.0),
  ('11111111-1111-1111-1111-111111111101', 26, 3.0)
on conflict (opportunity_id, skill_id) do nothing;

-- Stripe Distributed Systems skills: Go (5), Docker (4), Kubernetes (4), PostgreSQL (4)
insert into opportunity_skills (opportunity_id, skill_id, weight) values
  ('11111111-1111-1111-1111-111111111102', 6, 5.0),
  ('11111111-1111-1111-1111-111111111102', 26, 4.0),
  ('11111111-1111-1111-1111-111111111102', 27, 4.0),
  ('11111111-1111-1111-1111-111111111102', 20, 4.0)
on conflict (opportunity_id, skill_id) do nothing;

-- Linear skills: TypeScript (5), React (5), Node.js (4), UI/UX Design (3)
insert into opportunity_skills (opportunity_id, skill_id, weight) values
  ('11111111-1111-1111-1111-111111111103', 2, 5.0),
  ('11111111-1111-1111-1111-111111111103', 8, 5.0),
  ('11111111-1111-1111-1111-111111111103', 10, 4.0),
  ('11111111-1111-1111-1111-111111111103', 34, 3.0)
on conflict (opportunity_id, skill_id) do nothing;


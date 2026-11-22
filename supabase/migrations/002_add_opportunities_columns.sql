-- ============================================================
-- Migration: Add missing columns to opportunities table
-- ============================================================
alter table opportunities add column if not exists location text;
alter table opportunities add column if not exists type text default 'internship';
alter table opportunities add column if not exists workplace text default 'Remote';
alter table opportunities add column if not exists stipend text;
alter table opportunities add column if not exists status text default 'open';
alter table opportunities add column if not exists created_at timestamptz default now();

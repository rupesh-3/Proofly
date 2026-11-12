-- Run this in Supabase SQL Editor to add missing columns
-- https://pbexpyjmsdltjhnmejjk.supabase.co

alter table evidence add column if not exists metrics text;
alter table evidence add column if not exists organization text;


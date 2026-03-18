-- ============================================================
-- ScopeCheck v16: custom questions infrastructure
-- Run this in Supabase SQL Editor
-- ============================================================

-- Add custom_answers column to intros table (stores founder answers as JSON)
ALTER TABLE intros ADD COLUMN IF NOT EXISTS custom_answers jsonb;

-- Add custom_answers column to founders table (accumulates answers across submissions)
ALTER TABLE founders ADD COLUMN IF NOT EXISTS custom_answers jsonb;

-- Ensure custom_fields column exists on investors table (stores investor's custom questions)
-- This column likely already exists; IF NOT EXISTS prevents errors
ALTER TABLE investors ADD COLUMN IF NOT EXISTS custom_fields jsonb;

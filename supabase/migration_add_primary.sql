-- Migration: Add is_primary field to goal_templates
-- Run this in Supabase SQL Editor after the initial schema

ALTER TABLE goal_templates 
ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT FALSE;

-- Create index for primary tasks
CREATE INDEX IF NOT EXISTS idx_goal_templates_primary 
ON goal_templates(user_id, is_primary) 
WHERE is_primary = TRUE AND is_active = TRUE;

-- Ensure only one primary task per user (via application logic)
-- Database constraint would be complex, so we enforce in app

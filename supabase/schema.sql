-- Command Center Database Schema with Row Level Security

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Goal Templates Table
CREATE TABLE IF NOT EXISTS goal_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_primary BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  archived_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Daily Entries Table
CREATE TABLE IF NOT EXISTS daily_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  goal_template_id UUID NOT NULL REFERENCES goal_templates(id) ON DELETE CASCADE,
  minutes_spent INTEGER DEFAULT 0,
  done BOOLEAN DEFAULT FALSE,
  notes TEXT,
  archived_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, date, goal_template_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_goal_templates_user_id ON goal_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_templates_active ON goal_templates(user_id, is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_goal_templates_primary ON goal_templates(user_id, is_primary) WHERE is_primary = TRUE AND is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_daily_entries_user_id ON daily_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_entries_date ON daily_entries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_entries_goal ON daily_entries(goal_template_id);

-- Enable Row Level Security
ALTER TABLE goal_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for goal_templates
-- SELECT: Users can only see their own goals
CREATE POLICY "Users can view own goals"
  ON goal_templates
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: Users can only create their own goals
CREATE POLICY "Users can insert own goals"
  ON goal_templates
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only update their own goals
CREATE POLICY "Users can update own goals"
  ON goal_templates
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can only delete their own goals (soft delete via archive)
CREATE POLICY "Users can delete own goals"
  ON goal_templates
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for daily_entries
-- SELECT: Users can only see their own entries
CREATE POLICY "Users can view own entries"
  ON daily_entries
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: Users can only create their own entries
CREATE POLICY "Users can insert own entries"
  ON daily_entries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only update their own entries
CREATE POLICY "Users can update own entries"
  ON daily_entries
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can only delete their own entries (soft delete via archive)
CREATE POLICY "Users can delete own entries"
  ON daily_entries
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_goal_templates_updated_at BEFORE UPDATE ON goal_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_entries_updated_at BEFORE UPDATE ON daily_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

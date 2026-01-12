# Database Migration Guide: Adding Primary Task Support

This guide explains how to update your Supabase database to add the `is_primary` field for the primary task feature.

## Quick Steps

1. **Open Supabase SQL Editor**
   - Go to your Supabase project dashboard
   - Click **SQL Editor** in the left sidebar
   - Click **"New query"** (or the **"+"** button)

2. **Run the Migration SQL**
   - Copy and paste the contents of `supabase/migration_add_primary.sql`
   - Click **"Run"** (or press Ctrl+Enter)
   - You should see "Success. No rows returned"

3. **Verify the Migration**
   - Go to **Table Editor** in the left sidebar
   - Click on `goal_templates` table
   - You should see a new column `is_primary` (boolean, default: false)

## Detailed Instructions

### Step 1: Access Supabase SQL Editor

1. Log in to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **"New query"** to create a new SQL query

### Step 2: Run the Migration

Copy and paste this SQL into the editor:

```sql
-- Migration: Add is_primary field to goal_templates
ALTER TABLE goal_templates 
ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT FALSE;

-- Create index for primary tasks
CREATE INDEX IF NOT EXISTS idx_goal_templates_primary 
ON goal_templates(user_id, is_primary) 
WHERE is_primary = TRUE AND is_active = TRUE;
```

Click **"Run"** (or press Ctrl+Enter).

You should see:
- ✅ **Success. No rows returned** (this is normal - the query modifies the table structure, not data)

### Step 3: Verify the Migration

1. Go to **Table Editor** in the left sidebar
2. Click on the `goal_templates` table
3. You should see:
   - All existing columns (id, user_id, name, is_active, sort_order, etc.)
   - **New column**: `is_primary` (boolean type, default: false)

### Step 4: Update Existing Data (Optional)

If you have existing tasks and want to set one as primary:

```sql
-- Set the first active task for each user as primary
UPDATE goal_templates
SET is_primary = TRUE
WHERE id IN (
  SELECT DISTINCT ON (user_id) id
  FROM goal_templates
  WHERE is_active = TRUE
    AND archived_at IS NULL
  ORDER BY user_id, created_at ASC
);
```

**Note**: This is optional. If you don't run this, all existing tasks will have `is_primary = false`, and you can set a primary task through the UI.

## Troubleshooting

### Error: "column already exists"
- This means the migration already ran successfully
- You can safely ignore this error
- The `IF NOT EXISTS` clause prevents duplicate columns

### Error: "relation does not exist"
- You need to run the initial schema first
- Go to `supabase/schema.sql` and run that first
- Then come back and run this migration

### No changes visible
- Refresh the Table Editor page
- The new column should appear in the table structure
- Existing rows will have `is_primary = false` by default

## What This Migration Does

1. **Adds `is_primary` column**: Boolean field to mark the primary task
2. **Sets default value**: All existing and new tasks default to `false`
3. **Creates index**: Improves query performance for finding primary tasks
4. **Safe migration**: Uses `IF NOT EXISTS` to prevent errors if run multiple times

## After Migration

Once the migration is complete:
- Your app will automatically use the new `is_primary` field
- You can set a primary task through the UI (click "Set Primary" on any task)
- Only one task can be primary at a time (enforced by the app)

## Need Help?

If you encounter issues:
1. Check the Supabase SQL Editor for error messages
2. Verify your table structure in Table Editor
3. Make sure you have the correct permissions (should work with default RLS policies)

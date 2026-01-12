# Command Center

A private ambient dashboard for daily goals, designed to stay open on a large monitor all day and provide visible progress tracking.

## Features

- **Secure Authentication**: Google Sign-In with email allowlist enforcement
- **Row Level Security**: Database-level security with Supabase RLS policies
- **Optimistic UI**: Instant updates with background synchronization
- **Ambient Dashboard**: Dark theme designed for large monitors
- **Mission Timeline**: Day progress visualization with current time marker
- **Active Operations**: Manage goals with minutes tracking, completion status, and notes
- **Command Stats**: Track total minutes, completion rate, streak, and last activity
- **Archive Instead of Delete**: Preserve data with soft deletes
- **Undo Support**: 5-second undo window for risky actions
- **Keyboard-Friendly**: Inline editing with keyboard shortcuts

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Supabase** (Auth + Postgres)
- **Tailwind CSS**
- **React Hooks**

## Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- Google OAuth credentials

## Setup Instructions

> **📖 For detailed step-by-step instructions with screenshots descriptions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)**

### Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up Supabase**
   - Create a project at [supabase.com](https://supabase.com)
   - Run `supabase/schema.sql` in the SQL Editor
   - Get your Project URL and anon key from Settings > API

3. **Configure Google OAuth**
   - Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com)
   - Enable Google provider in Supabase (Authentication > Providers)
   - Add redirect URIs (see SETUP_GUIDE.md for details)

4. **Set environment variables**
   - Create `.env.local` with:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     NEXT_PUBLIC_ALLOWED_EMAIL=your-email@gmail.com
     ```

5. **Run locally**
   ```bash
   npm run dev
   ```

6. **Deploy to Vercel**
   - Push to GitHub
   - Import to Vercel
   - Add environment variables
   - Update Google OAuth redirect URIs

**For complete detailed instructions, troubleshooting, and screenshots descriptions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)**

## Security Architecture

### Two-Layer Security Model

This application implements security at two layers, inspired by the Supabase todo-list example:

#### 1. App-Level Allowlist
- Location: `lib/auth.ts` and `hooks/useAuth.ts`
- Enforcement: After authentication, checks if `user.email === ALLOWED_EMAIL`
- Action: If email doesn't match, signs out user and shows "Access Denied"
- Purpose: First line of defense, prevents unauthorized users from accessing the app

#### 2. Database-Level Enforcement (RLS)
- Location: `supabase/schema.sql`
- Enforcement: Row Level Security policies on all tables
- Policies:
  - `goal_templates`: Users can only SELECT/INSERT/UPDATE/DELETE their own goals
  - `daily_entries`: Users can only SELECT/INSERT/UPDATE/DELETE their own entries
- Pattern: All policies use `auth.uid() = user_id` condition
- Purpose: Even if app-level check fails, database prevents data access

### Why This Approach?

The Supabase todo-list example demonstrates:
- **Client-side Supabase usage**: Using the anon key is safe because RLS policies enforce security
- **RLS as the foundation**: Database-level security is the ultimate authority
- **Defense in depth**: Multiple layers of security provide redundancy

This Command Center follows the same pattern:
- App-level allowlist provides immediate feedback and prevents unnecessary database queries
- RLS policies ensure that even if someone bypasses the app, they cannot access data
- No "secret URL" security - all security is based on authentication and authorization

## Database Schema

### `goal_templates`
- `id` (UUID, primary key)
- `user_id` (UUID, references auth.users)
- `name` (TEXT)
- `is_active` (BOOLEAN)
- `sort_order` (INTEGER)
- `archived_at` (TIMESTAMP, nullable)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### `daily_entries`
- `id` (UUID, primary key)
- `user_id` (UUID, references auth.users)
- `date` (DATE)
- `goal_template_id` (UUID, references goal_templates)
- `minutes_spent` (INTEGER)
- `done` (BOOLEAN)
- `notes` (TEXT, nullable)
- `archived_at` (TIMESTAMP, nullable)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- Unique constraint on `(user_id, date, goal_template_id)`

## Usage

### Adding Goals
- Type a goal name in the "Add new operation..." field
- Press Enter or click "Add"

### Editing Goals
- Double-click a goal name to edit inline
- Press Enter to save, Escape to cancel

### Tracking Progress
- Enter minutes spent on each goal
- Toggle completion status with the checkbox
- Add notes for context

### Daily Navigation
- Use "Previous Day" / "Today" / "Next Day" buttons in Mission Timeline
- The dashboard automatically loads data for the selected date

### Undo Actions
- After archiving a goal or deleting an entry, an "Undo" button appears
- Undo window is 5 seconds
- Click "Undo" to reverse the action

## Project Structure

```
command-center/
├── app/
│   ├── auth/
│   │   └── callback/
│   │       └── page.tsx          # OAuth callback handler
│   ├── globals.css                # Global styles
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Main dashboard page
├── components/
│   ├── AccessDenied.tsx           # Access denied screen
│   ├── ActiveOperations.tsx       # Center panel - goals and entries
│   ├── CommandStats.tsx           # Right panel - statistics
│   ├── Dashboard.tsx              # Main dashboard container
│   └── MissionTimeline.tsx        # Left panel - day progress
├── hooks/
│   ├── useAuth.ts                 # Authentication hook
│   └── useCommandCenter.ts        # Data management hook
├── lib/
│   ├── auth.ts                    # Auth utilities + email check
│   ├── data.ts                    # Database operations
│   └── supabase.ts                # Supabase client
├── supabase/
│   └── schema.sql                 # Database schema + RLS policies
├── types/
│   └── index.ts                   # TypeScript type definitions
└── README.md
```

## Troubleshooting

### "Access Denied" after sign-in
- Check that `NEXT_PUBLIC_ALLOWED_EMAIL` matches your Google account email exactly
- Restart the development server after changing environment variables

### Database errors
- Ensure you've run the SQL schema in Supabase SQL Editor
- Verify RLS policies are enabled on both tables
- Check that your Supabase project URL and anon key are correct

### OAuth redirect errors
- Verify redirect URI in Google Cloud Console matches your deployment URL
- For local dev: `http://localhost:3000/auth/callback`
- For Vercel: `https://your-app.vercel.app/auth/callback`

## License

Private project - not for distribution.

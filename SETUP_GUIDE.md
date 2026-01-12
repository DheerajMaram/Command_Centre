# Detailed Setup Guide: Supabase + Google OAuth

This guide provides step-by-step instructions for setting up Supabase and Google OAuth for the Command Center application.

---

## Part 1: Supabase Project Setup

### Step 1: Create a Supabase Account and Project

1. **Sign up for Supabase**
   - Go to [https://supabase.com](https://supabase.com)
   - Click **"Start your project"** or **"Sign up"**
   - Sign up using GitHub, Google, or email

2. **Create a New Project**
   - Once logged in, click **"New Project"** (or the **"+"** button)
   - Fill in the project details:
     - **Name**: `command-center` (or any name you prefer)
     - **Database Password**: Create a strong password (save this - you'll need it for direct database access)
     - **Region**: Choose the region closest to you
     - **Pricing Plan**: Free tier is fine for development
   - Click **"Create new project"**
   - Wait 2-3 minutes for the project to be provisioned

3. **Get Your Project Credentials**
   - Once the project is ready, go to **Settings** (gear icon in left sidebar)
   - Click **API** in the settings menu
   - You'll see two important values:
     - **Project URL**: Something like `https://xxxxxxxxxxxxx.supabase.co`
     - **anon public key**: A long string starting with `eyJ...`
   - **Copy both of these** - you'll need them for your `.env.local` file

---

## Part 2: Database Schema Setup

### Step 2: Run the Database Schema

1. **Open SQL Editor**
   - In your Supabase dashboard, click **SQL Editor** in the left sidebar
   - Click **"New query"** (or the **"+"** button)

2. **Copy and Paste the Schema**
   - Open the file `supabase/schema.sql` from this project
   - Copy **ALL** the contents (Ctrl+A, Ctrl+C)
   - Paste it into the SQL Editor in Supabase

3. **Run the Query**
   - Click **"Run"** (or press Ctrl+Enter)
   - You should see a success message: "Success. No rows returned"
   - This creates:
     - Two tables: `goal_templates` and `daily_entries`
     - Indexes for performance
     - Row Level Security (RLS) policies
     - Triggers for automatic timestamp updates

4. **Verify Tables Were Created**
   - Click **Table Editor** in the left sidebar
   - You should see two tables:
     - `goal_templates`
     - `daily_entries`
   - If you see them, the schema was created successfully!

---

## Part 3: Google OAuth Setup

### Step 3: Create Google OAuth Credentials

1. **Go to Google Cloud Console**
   - Visit [https://console.cloud.google.com](https://console.cloud.google.com)
   - Sign in with your Google account (the same one you want to use for the app)

2. **Create a New Project (or Select Existing)**
   - Click the project dropdown at the top (next to "Google Cloud")
   - Click **"New Project"**
   - Enter project name: `Command Center` (or any name)
   - Click **"Create"**
   - Wait a few seconds, then select your new project from the dropdown

3. **Enable Google+ API**
   - In the left sidebar, go to **"APIs & Services"** > **"Library"**
   - Search for **"Google+ API"** (or **"People API"**)
   - Click on it and click **"Enable"**
   - Also search for and enable **"Google Identity Services API"**

4. **Configure OAuth Consent Screen**
   - Go to **"APIs & Services"** > **"OAuth consent screen"**
   - Select **"External"** (unless you have a Google Workspace account)
   - Click **"Create"**
   - Fill in the required fields:
     - **App name**: `Command Center` (or your preferred name)
     - **User support email**: Your email address
     - **Developer contact information**: Your email address
   - Click **"Save and Continue"**
   - On the **Scopes** page, click **"Save and Continue"** (no need to add scopes)
   - On the **Test users** page:
     - Click **"Add Users"**
     - Add your Google email address (the one you'll use to sign in)
     - Click **"Add"**, then **"Save and Continue"**
   - On the **Summary** page, click **"Back to Dashboard"**

5. **Create OAuth 2.0 Credentials**
   - Go to **"APIs & Services"** > **"Credentials"**
   - Click **"+ Create Credentials"** at the top
   - Select **"OAuth client ID"**
   - Choose **"Web application"** as the application type
   - Give it a name: `Command Center Web Client`
   - **Authorized JavaScript origins**: Add these URLs:
     ```
     http://localhost:3000
     https://your-project-ref.supabase.co
     ```
     (Replace `your-project-ref` with your actual Supabase project reference - it's in your Supabase URL)
   - **Authorized redirect URIs**: Add these URLs:
     ```
     http://localhost:3000/auth/callback
     https://your-project-ref.supabase.co/auth/v1/callback
     ```
     (Again, replace `your-project-ref` with your Supabase project reference)
   - Click **"Create"**
   - **IMPORTANT**: A popup will show your **Client ID** and **Client Secret**
   - **Copy both immediately** - you won't be able to see the secret again!
   - If you missed it, you can click the edit icon next to the credential to see the Client ID, but you'll need to reset the secret

---

## Part 4: Configure Google OAuth in Supabase

### Step 4: Connect Google OAuth to Supabase

1. **Go to Supabase Authentication Settings**
   - In your Supabase dashboard, go to **Authentication** (person icon in left sidebar)
   - Click **Providers** in the submenu

2. **Enable Google Provider**
   - Find **Google** in the list of providers
   - Toggle it **ON** (or click to expand and enable it)

3. **Enter Google OAuth Credentials**
   - **Client ID (for OAuth)**: Paste the Client ID you copied from Google Cloud Console
   - **Client Secret (for OAuth)**: Paste the Client Secret you copied
   - **Authorized Client IDs**: Leave empty (or add your Client ID if you want to restrict it)

4. **Save the Configuration**
   - Click **"Save"** at the bottom
   - You should see a green success message

5. **Verify Redirect URL**
   - Supabase will show you a **Redirect URL** that looks like:
     ```
     https://your-project-ref.supabase.co/auth/v1/callback
     ```
   - **Make sure this exact URL is in your Google Cloud Console** under "Authorized redirect URIs"
   - If you need to add it:
     - Go back to Google Cloud Console
     - Edit your OAuth 2.0 Client ID
     - Add the Supabase redirect URL to "Authorized redirect URIs"
     - Save

---

## Part 5: Environment Variables Setup

### Step 5: Create `.env.local` File

1. **Create the File**
   - In your project root directory (same folder as `package.json`)
   - Create a new file named `.env.local`
   - **Important**: Make sure it's named exactly `.env.local` (with the dot at the beginning)

2. **Add Your Credentials**
   - Open `.env.local` in a text editor
   - Add the following lines (replace with your actual values):

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   NEXT_PUBLIC_ALLOWED_EMAIL=your-email@gmail.com
   ```

   **Where to find these values:**
   
   - **NEXT_PUBLIC_SUPABASE_URL**: 
     - From Supabase dashboard: Settings > API > Project URL
     - Example: `https://abcdefghijklmnop.supabase.co`
   
   - **NEXT_PUBLIC_SUPABASE_ANON_KEY**: 
     - From Supabase dashboard: Settings > API > Project API keys > `anon` `public`
     - It's a long string starting with `eyJ...`
     - Copy the entire key
   
   - **NEXT_PUBLIC_ALLOWED_EMAIL**: 
     - Your Google account email address (the one you added as a test user)
     - Example: `yourname@gmail.com`
     - **This must match exactly** (case-sensitive)

3. **Save the File**
   - Save `.env.local`
   - **Important**: This file is in `.gitignore` and won't be committed to git (which is correct for security)

---

## Part 6: Testing the Setup

### Step 6: Test Locally

1. **Install Dependencies** (if you haven't already)
   ```bash
   npm install
   ```

2. **Start the Development Server**
   ```bash
   npm run dev
   ```

3. **Open the Application**
   - Open your browser to `http://localhost:3000`
   - You should see the "Command Center" sign-in page

4. **Test Google Sign-In**
   - Click **"Sign in with Google"**
   - You should be redirected to Google's sign-in page
   - Sign in with your Google account (the one you added as a test user)
   - You should be redirected back to the app
   - If your email matches `NEXT_PUBLIC_ALLOWED_EMAIL`, you'll see the dashboard
   - If it doesn't match, you'll see "Access Denied"

5. **Verify Database Access**
   - Once signed in, try adding a goal
   - Check in Supabase **Table Editor** to see if data appears in `goal_templates`
   - If you see your data, everything is working!

---

## Part 7: Deploy to Vercel (Optional)

### Step 7: Deploy with Environment Variables

1. **Push to GitHub**
   - Create a new repository on GitHub
   - Push your code:
     ```bash
     git init
     git add .
     git commit -m "Initial commit"
     git remote add origin https://github.com/yourusername/command-center.git
     git push -u origin main
     ```

2. **Import to Vercel**
   - Go to [https://vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click **"Add New..."** > **"Project"**
   - Import your repository
   - Click **"Import"**

3. **Add Environment Variables in Vercel**
   - Before deploying, click **"Environment Variables"**
   - Add each variable:
     - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key
     - `NEXT_PUBLIC_ALLOWED_EMAIL` = your email
   - Click **"Save"**

4. **Update Google OAuth Redirect URI**
   - Vercel will give you a deployment URL like `https://command-center.vercel.app`
   - Go back to Google Cloud Console
   - Edit your OAuth 2.0 Client ID
   - Add to **Authorized JavaScript origins**:
     ```
     https://command-center.vercel.app
     ```
   - Add to **Authorized redirect URIs**:
     ```
     https://command-center.vercel.app/auth/callback
     ```
   - Save

5. **Deploy**
   - Click **"Deploy"** in Vercel
   - Wait for deployment to complete
   - Visit your deployed URL and test sign-in!

---

## Troubleshooting

### "Access Denied" after sign-in
- **Check**: `NEXT_PUBLIC_ALLOWED_EMAIL` matches your Google email exactly (case-sensitive)
- **Check**: Restart your dev server after changing `.env.local`
- **Check**: Clear browser cache and cookies

### OAuth redirect errors
- **Check**: Redirect URI in Google Console matches exactly:
  - Local: `http://localhost:3000/auth/callback`
  - Supabase: `https://your-project-ref.supabase.co/auth/v1/callback`
  - Vercel: `https://your-app.vercel.app/auth/callback`
- **Check**: No trailing slashes in redirect URIs

### Database errors
- **Check**: You ran the SQL schema in Supabase SQL Editor
- **Check**: RLS policies are enabled (check in Table Editor > click table > RLS tab)
- **Check**: Supabase URL and anon key are correct in `.env.local`

### "Missing Supabase environment variables" error
- **Check**: File is named `.env.local` (with the dot)
- **Check**: File is in the project root (same folder as `package.json`)
- **Check**: No spaces around the `=` sign in `.env.local`
- **Check**: Restart dev server after creating/modifying `.env.local`

### Google OAuth not working
- **Check**: OAuth consent screen is published (or you're added as a test user)
- **Check**: Google+ API and Identity Services API are enabled
- **Check**: Client ID and Secret are correct in Supabase
- **Check**: Redirect URIs match exactly (no typos)

---

## Quick Reference: Where to Find Things

### Supabase
- **Project URL**: Settings > API > Project URL
- **Anon Key**: Settings > API > Project API keys > `anon` `public`
- **SQL Editor**: SQL Editor in left sidebar
- **Table Editor**: Table Editor in left sidebar
- **Auth Settings**: Authentication > Providers

### Google Cloud Console
- **OAuth Credentials**: APIs & Services > Credentials
- **OAuth Consent Screen**: APIs & Services > OAuth consent screen
- **Project Selection**: Dropdown at top of page

### Your Project
- **Environment Variables**: `.env.local` in project root
- **Database Schema**: `supabase/schema.sql`
- **Auth Configuration**: `lib/auth.ts` (for allowed email)

---

## Security Notes

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **The anon key is safe to use client-side** - RLS policies protect your data
3. **Email allowlist is case-sensitive** - Make sure it matches exactly
4. **RLS policies are your ultimate security** - Even if app-level check fails, database protects data

---

That's it! You should now have a fully functional Command Center with secure authentication and database access.

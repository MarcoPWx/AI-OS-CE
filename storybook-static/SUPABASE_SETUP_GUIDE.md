# Supabase Setup Guide for QuizMentor

_Last Updated: December 26, 2024_

## 📋 Prerequisites

- Supabase account created
- Project created in Supabase dashboard
- Access to project settings

---

## 🚀 Step-by-Step Setup

### Step 1: Get Your Project Credentials

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Settings > API**
4. Copy these values:
   - **Project URL**: `https://YOUR_PROJECT_ID.supabase.co`
   - **anon public key**: (safe to expose in client)
   - **service_role key**: (NEVER expose, server-only)

### Step 2: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

2. Update `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Step 3: Run Database Migrations

#### Option A: Using Supabase Dashboard (Easiest)

1. Go to **SQL Editor** in Supabase dashboard
2. Click "New Query"
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Paste into the SQL editor
5. Click "Run" to execute

#### Option B: Using Supabase CLI

1. Install Supabase CLI:

```bash
npm install -g supabase
```

2. Link your project:

```bash
supabase link --project-ref YOUR_PROJECT_ID
```

3. Run migrations:

```bash
supabase db push
```

### Step 4: Configure Authentication

1. In Supabase Dashboard, go to **Authentication > Providers**

2. **Enable Email Authentication**:
   - Toggle "Enable Email" ON
   - Configure email templates if needed
   - Set redirect URLs:
     - Development: `http://localhost:3000/auth/callback`
     - Production: `https://yourdomain.com/auth/callback`

3. **Configure Password Requirements**:
   - Go to **Authentication > Policies**
   - Set minimum password length: 8
   - Require uppercase: Yes
   - Require numbers: Yes

4. **(Optional) Enable OAuth Providers**:
   - **GitHub OAuth**:
     1. Toggle GitHub ON
     2. Add GitHub OAuth App credentials
     3. Set callback URL: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
   - **Google OAuth**:
     1. Toggle Google ON
     2. Add Google OAuth credentials
     3. Configure consent screen

### Step 5: Set Up Row Level Security (RLS)

The migration script already includes RLS policies, but verify they're enabled:

1. Go to **Database > Tables**
2. For each table, ensure the shield icon is GREEN (RLS enabled)
3. Click on the table > Policies to view/edit policies

### Step 6: Configure Storage (for avatars)

1. Go to **Storage** in dashboard
2. Create a new bucket called `avatars`
3. Set it as PUBLIC bucket
4. Add policies:

```sql
-- Allow users to upload their own avatar
CREATE POLICY "Users can upload own avatar" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to update their own avatar
CREATE POLICY "Users can update own avatar" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public to view avatars
CREATE POLICY "Anyone can view avatars" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'avatars');
```

### Step 7: Set Up Edge Functions (Optional)

For advanced features like webhooks and background jobs:

1. Install Supabase CLI (if not already installed)
2. Create edge functions:

```bash
supabase functions new send-achievement-notification
supabase functions new update-leaderboard
```

3. Deploy functions:

```bash
supabase functions deploy send-achievement-notification
supabase functions deploy update-leaderboard
```

### Step 8: Configure Email Templates

1. Go to **Authentication > Email Templates**
2. Customize templates for:
   - Confirm signup
   - Reset password
   - Magic link
   - Invite user

Example confirmation template:

```html
<h2>Welcome to QuizMentor!</h2>
<p>Thanks for signing up. Please confirm your email:</p>
<a href="{{ .ConfirmationURL }}">Confirm Email</a>
```

### Step 9: Set Up Database Webhooks (Optional)

For real-time features:

1. Go to **Database > Webhooks**
2. Create webhook for quiz completion:
   - Table: `quiz_sessions`
   - Events: UPDATE
   - Conditions: `status = 'completed'`
   - URL: Your backend webhook endpoint

### Step 10: Configure Realtime Subscriptions

Enable realtime for specific tables:

1. Go to **Database > Replication**
2. Toggle ON for tables:
   - `leaderboard` (for live updates)
   - `quiz_sessions` (for multiplayer features)
   - `user_achievements` (for notifications)

---

## 🧪 Testing Your Setup

### Test 1: Database Connection

```typescript
// test-connection.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

async function testConnection() {
  const { data, error } = await supabase.from('categories').select('*').limit(5);

  if (error) {
    console.error('Connection failed:', error);
  } else {
    console.log('Connection successful! Categories:', data);
  }
}

testConnection();
```

### Test 2: Authentication

```typescript
async function testAuth() {
  // Sign up
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: 'test@example.com',
    password: 'TestPass123!',
  });

  console.log('Sign up:', signUpData, signUpError);

  // Sign in
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: 'test@example.com',
    password: 'TestPass123!',
  });

  console.log('Sign in:', signInData, signInError);
}
```

### Test 3: Create Profile

```typescript
async function createProfile(userId: string) {
  const { data, error } = await supabase.from('profiles').insert({
    id: userId,
    username: 'testuser',
    display_name: 'Test User',
  });

  console.log('Profile created:', data, error);
}
```

---

## 🔍 Troubleshooting

### Common Issues:

1. **"relation does not exist" error**
   - Run the migration script again
   - Check if you're in the right schema (public)

2. **Authentication not working**
   - Verify redirect URLs are correct
   - Check if email confirmations are enabled
   - Ensure RLS policies are correct

3. **RLS blocking queries**
   - Temporarily disable RLS to test
   - Check auth.uid() is being passed correctly
   - Review policy conditions

4. **CORS errors**
   - Add your domain to allowed origins
   - Check API URL is correct

5. **Email not sending**
   - Check email settings in dashboard
   - Verify SMTP configuration
   - Check rate limits

---

## 📊 Monitoring

### Enable Logging:

1. Go to **Logs** in dashboard
2. View different log types:
   - API logs
   - Database logs
   - Auth logs
   - Function logs

### Set Up Alerts:

1. Go to **Reports**
2. Create custom queries
3. Set up email alerts for:
   - High error rates
   - Slow queries
   - Failed auth attempts

---

## 🚨 Security Checklist

- [ ] RLS enabled on all tables
- [ ] Service role key NOT exposed in client
- [ ] Environment variables properly configured
- [ ] Email verification enabled
- [ ] Password requirements configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] SSL enforced
- [ ] Backup strategy in place

---

## 📚 Next Steps

1. **Install Supabase client library**:

```bash
npm install @supabase/supabase-js
```

2. **Create Supabase client singleton**:

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
```

3. **Implement authentication service**:
   - See `services/auth/authService.ts`

4. **Start building features**:
   - User registration
   - Quiz sessions
   - Leaderboard
   - Achievements

---

## 📖 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Authentication Guide](https://supabase.com/docs/guides/auth)
- [Storage Guide](https://supabase.com/docs/guides/storage)

---

_Need help? Check the [Supabase Discord](https://discord.supabase.com) or [GitHub Discussions](https://github.com/supabase/supabase/discussions)_

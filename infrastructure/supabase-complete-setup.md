# QuizMentor Complete Supabase Architecture

## 🎯 Supabase Does It All - No PostHog, No External Vault Needed!

### What Supabase Provides:

```
✅ Authentication (replaces Auth0)
✅ Database (PostgreSQL)
✅ Realtime subscriptions
✅ Vector embeddings (pgvector)
✅ Secrets management (Vault)
✅ Edge Functions (replaces some API endpoints)
✅ Storage (replaces S3)
✅ Analytics (with SQL views)
✅ Row Level Security (RLS)
```

## 1. Supabase Vault for Secrets Management

### Enable Vault in Supabase

```sql
-- Enable the Vault extension
CREATE EXTENSION IF NOT EXISTS vault;

-- Create secrets table with encryption
CREATE TABLE IF NOT EXISTS vault.secrets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text UNIQUE NOT NULL,
  secret text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  rotation_period interval DEFAULT '90 days'::interval,
  last_rotated_at timestamptz DEFAULT now()
);

-- Function to store encrypted secrets
CREATE OR REPLACE FUNCTION vault.create_secret(
  secret_name text,
  secret_value text,
  secret_description text DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
  secret_id uuid;
BEGIN
  INSERT INTO vault.secrets (name, secret, description)
  VALUES (
    secret_name,
    vault.encrypt(secret_value::bytea, (SELECT key FROM vault.keys WHERE id = 'default')),
    secret_description
  )
  RETURNING id INTO secret_id;

  RETURN secret_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to retrieve decrypted secrets
CREATE OR REPLACE FUNCTION vault.get_secret(secret_name text)
RETURNS text AS $$
BEGIN
  RETURN convert_from(
    vault.decrypt(
      (SELECT secret::bytea FROM vault.secrets WHERE name = secret_name),
      (SELECT key FROM vault.keys WHERE id = 'default')
    ),
    'utf8'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Automatic secret rotation
CREATE OR REPLACE FUNCTION vault.rotate_secret(secret_name text)
RETURNS void AS $$
DECLARE
  new_value text;
BEGIN
  -- Generate new secret based on type
  CASE secret_name
    WHEN 'jwt_secret' THEN
      new_value := encode(gen_random_bytes(32), 'base64');
    WHEN 'api_key' THEN
      new_value := 'sk_' || encode(gen_random_bytes(24), 'base64');
    ELSE
      new_value := encode(gen_random_bytes(32), 'hex');
  END CASE;

  -- Update the secret
  UPDATE vault.secrets
  SET
    secret = vault.encrypt(new_value::bytea, (SELECT key FROM vault.keys WHERE id = 'default')),
    last_rotated_at = now(),
    updated_at = now()
  WHERE name = secret_name;

  -- Log rotation event
  INSERT INTO vault.rotation_log (secret_name, rotated_at)
  VALUES (secret_name, now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create cron job for automatic rotation
SELECT cron.schedule(
  'rotate-secrets',
  '0 0 * * 0', -- Every Sunday at midnight
  $$
    SELECT vault.rotate_secret(name)
    FROM vault.secrets
    WHERE expires_at < now() OR
          (last_rotated_at + rotation_period) < now();
  $$
);
```

### Using Secrets in Your App

```typescript
// lib/supabase-vault.ts
import { createClient } from '@supabase/supabase-js';

export class SupabaseVault {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // Admin access only
      {
        db: { schema: 'vault' },
      },
    );
  }

  async getSecret(name: string): Promise<string> {
    const { data, error } = await this.supabase.rpc('get_secret', { secret_name: name });

    if (error) throw error;
    return data;
  }

  async setSecret(name: string, value: string, description?: string): Promise<string> {
    const { data, error } = await this.supabase.rpc('create_secret', {
      secret_name: name,
      secret_value: value,
      secret_description: description,
    });

    if (error) throw error;
    return data;
  }

  async rotateSecret(name: string): Promise<void> {
    const { error } = await this.supabase.rpc('rotate_secret', { secret_name: name });

    if (error) throw error;
  }

  // Get all secrets metadata (not values)
  async listSecrets() {
    const { data, error } = await this.supabase
      .from('secrets')
      .select('id, name, description, last_rotated_at, expires_at')
      .order('name');

    return data;
  }
}
```

## 2. Admin Dashboard with Next.js

### Project Structure

```
admin-dashboard/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── analytics/
│   │   │   └── page.tsx
│   │   ├── users/
│   │   │   └── page.tsx
│   │   ├── content/
│   │   │   └── page.tsx
│   │   ├── secrets/
│   │   │   └── page.tsx
│   │   ├── features/
│   │   │   └── page.tsx
│   │   ├── ab-tests/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   └── api/
│       └── cron/
│           └── rotate-secrets/
└── components/
    ├── SecretManager.tsx
    ├── FeatureFlags.tsx
    └── Analytics.tsx
```

### Admin Dashboard Main Page

```tsx
// admin-dashboard/app/(dashboard)/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { AnalyticsCard, UsersCard, ABTestCard, SystemHealth } from '@/components/dashboard';

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies });

  // Get real-time analytics from Supabase
  const { data: stats } = await supabase.rpc('get_dashboard_stats');

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <AnalyticsCard
        totalUsers={stats.total_users}
        activeToday={stats.active_today}
        growth={stats.growth_percentage}
      />
      <UsersCard newSignups={stats.new_signups} retention={stats.retention_rate} />
      <ABTestCard activeTests={stats.active_tests} winningVariants={stats.winning_variants} />
      <SystemHealth
        uptime={stats.uptime}
        apiLatency={stats.avg_latency}
        errorRate={stats.error_rate}
      />
    </div>
  );
}
```

### Secrets Management UI

```tsx
// admin-dashboard/app/(dashboard)/secrets/page.tsx
'use client';

import { useState } from 'react';
import { useSupabase } from '@/lib/supabase';
import { Button, Table, Modal, Input } from '@/components/ui';

export default function SecretsPage() {
  const [secrets, setSecrets] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const vault = useSupabase().vault;

  const loadSecrets = async () => {
    const data = await vault.listSecrets();
    setSecrets(data);
  };

  const handleRotate = async (secretName: string) => {
    if (confirm(`Rotate secret ${secretName}? This will invalidate the old value.`)) {
      await vault.rotateSecret(secretName);
      await loadSecrets();

      // Trigger webhook to update running services
      await fetch('/api/secrets/notify-rotation', {
        method: 'POST',
        body: JSON.stringify({ secret: secretName }),
      });
    }
  };

  const handleAdd = async (name: string, value: string) => {
    await vault.setSecret(name, value);
    setShowAddModal(false);
    await loadSecrets();
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Secrets Management</h1>
        <Button onClick={() => setShowAddModal(true)}>Add Secret</Button>
      </div>

      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Last Rotated</th>
            <th>Expires</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {secrets.map((secret) => (
            <tr key={secret.id}>
              <td className="font-mono">{secret.name}</td>
              <td>{new Date(secret.last_rotated_at).toLocaleDateString()}</td>
              <td>
                {secret.expires_at ? new Date(secret.expires_at).toLocaleDateString() : 'Never'}
              </td>
              <td>
                <Button size="sm" onClick={() => handleRotate(secret.name)} variant="outline">
                  Rotate
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {showAddModal && <SecretAddModal onAdd={handleAdd} onClose={() => setShowAddModal(false)} />}
    </div>
  );
}
```

## 3. Feature Flags with Supabase

```sql
-- Create feature flags table
CREATE TABLE feature_flags (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  enabled boolean DEFAULT false,
  rollout_percentage integer DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  user_overrides jsonb DEFAULT '[]'::jsonb,
  conditions jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Function to check feature flag for user
CREATE OR REPLACE FUNCTION check_feature_flag(
  flag_key text,
  user_id uuid DEFAULT NULL
) RETURNS boolean AS $$
DECLARE
  flag record;
  user_hash integer;
BEGIN
  SELECT * INTO flag FROM feature_flags WHERE key = flag_key;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Check user overrides
  IF user_id IS NOT NULL AND flag.user_overrides @> to_jsonb(user_id::text) THEN
    RETURN true;
  END IF;

  -- Check global enable
  IF NOT flag.enabled THEN
    RETURN false;
  END IF;

  -- Check rollout percentage
  IF flag.rollout_percentage < 100 AND user_id IS NOT NULL THEN
    user_hash := abs(hashtext(user_id::text || flag_key)) % 100;
    RETURN user_hash < flag.rollout_percentage;
  END IF;

  RETURN flag.enabled;
END;
$$ LANGUAGE plpgsql;
```

### Feature Flags UI Component

```tsx
// admin-dashboard/components/FeatureFlags.tsx
export function FeatureFlags() {
  const [flags, setFlags] = useState([]);

  const updateFlag = async (key: string, updates: Partial<FeatureFlag>) => {
    const { error } = await supabase.from('feature_flags').update(updates).eq('key', key);

    if (!error) {
      // Real-time update to all connected clients
      await supabase.channel('feature-flags').send({
        type: 'broadcast',
        event: 'flag-updated',
        payload: { key, ...updates },
      });
    }
  };

  return (
    <div className="space-y-4">
      {flags.map((flag) => (
        <div key={flag.id} className="border p-4 rounded">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold">{flag.name}</h3>
              <code className="text-sm">{flag.key}</code>
              <p className="text-gray-600">{flag.description}</p>
            </div>
            <div className="flex items-center gap-4">
              <Toggle
                checked={flag.enabled}
                onChange={(enabled) => updateFlag(flag.key, { enabled })}
              />
              <Slider
                value={flag.rollout_percentage}
                onChange={(rollout_percentage) => updateFlag(flag.key, { rollout_percentage })}
                max={100}
              />
              <span>{flag.rollout_percentage}%</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

## 4. Analytics with Supabase Views

```sql
-- Create analytics views
CREATE OR REPLACE VIEW analytics_dashboard AS
SELECT
  COUNT(DISTINCT user_id) as total_users,
  COUNT(DISTINCT CASE WHEN last_seen > now() - interval '1 day' THEN user_id END) as daily_active_users,
  COUNT(DISTINCT CASE WHEN last_seen > now() - interval '7 days' THEN user_id END) as weekly_active_users,
  AVG(quiz_completion_rate) as avg_completion_rate,
  AVG(quiz_score) as avg_score
FROM user_analytics;

-- A/B Test Results View
CREATE OR REPLACE VIEW ab_test_results AS
SELECT
  test_name,
  variant,
  COUNT(*) as participants,
  AVG(conversion_rate) as conversion,
  percentile_cont(0.5) WITHIN GROUP (ORDER BY metric_value) as median_value,
  stddev(metric_value) as std_deviation
FROM ab_test_events
GROUP BY test_name, variant;

-- Real-time metrics
CREATE OR REPLACE FUNCTION get_realtime_metrics()
RETURNS TABLE(
  metric text,
  value numeric,
  change_24h numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    'active_users'::text,
    COUNT(DISTINCT user_id)::numeric,
    (COUNT(DISTINCT user_id) - LAG(COUNT(DISTINCT user_id)) OVER (ORDER BY date))::numeric
  FROM user_sessions
  WHERE created_at > now() - interval '15 minutes';
END;
$$ LANGUAGE plpgsql;
```

## 5. Complete Admin Dashboard Deployment

```yaml
# admin-dashboard/.do/app.yaml
name: quizmentor-admin
region: nyc

services:
  - name: admin
    github:
      repo: your-username/quizmentor-admin
      branch: main
      deploy_on_push: true
    build_command: npm run build
    run_command: npm start
    instance_size: basic-xxs
    instance_count: 1
    http_port: 3001
    routes:
      - path: /
    envs:
      - key: NEXT_PUBLIC_SUPABASE_URL
        value: ${SUPABASE_URL}
      - key: SUPABASE_SERVICE_ROLE_KEY
        type: SECRET
        value: ${SUPABASE_SERVICE_KEY}
      - key: NEXTAUTH_SECRET
        type: SECRET
        value: ${NEXTAUTH_SECRET}
```

## 6. Automatic Secret Rotation Flow

```typescript
// api/cron/rotate-secrets/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  // Verify cron secret
  const cronSecret = request.headers.get('x-cron-secret');
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

  // Get secrets that need rotation
  const { data: secretsToRotate } = await supabase
    .from('vault.secrets')
    .select('name')
    .or(`expires_at.lt.now(),last_rotated_at.lt.now()-rotation_period`);

  for (const secret of secretsToRotate) {
    // Rotate the secret
    await supabase.rpc('rotate_secret', { secret_name: secret.name });

    // Notify services of rotation
    await notifyServices(secret.name);
  }

  return NextResponse.json({
    rotated: secretsToRotate.length,
    secrets: secretsToRotate.map((s) => s.name),
  });
}

async function notifyServices(secretName: string) {
  // Trigger redeployment or config reload
  if (secretName.includes('api_key')) {
    // Trigger API service reload
    await fetch('https://api.quizmentor.app/admin/reload-config', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.ADMIN_TOKEN}`,
      },
    });
  }
}
```

## 7. Complete Cost Breakdown

```yaml
Monthly Costs:
  DigitalOcean:
    - API Backend: $40
    - Admin Dashboard: $5
    - Total: $45/month

  Supabase (Pro):
    - Database (8GB): $25
    - Auth (50K MAUs): Included
    - Storage (100GB): Included
    - Realtime: Included
    - Vector embeddings: Included
    - Vault (secrets): Included
    - Edge Functions: Included
    - Total: $25/month

  Expo/Vercel:
    - Expo Web (Vercel): $20
    - EAS Build: Free tier
    - Total: $20/month

Grand Total: $90/month
(Down from $130/month!)
```

## Summary: Why Supabase for Everything

✅ **Single Platform**: Auth, DB, Secrets, Analytics, Storage
✅ **Built-in Security**: RLS, Vault encryption, Auth
✅ **Real-time**: WebSocket subscriptions included
✅ **Cost Effective**: $25/month for everything
✅ **No Additional Services**: No PostHog, No Hashicorp Vault, No separate analytics
✅ **Automatic Rotation**: Cron jobs for secret rotation
✅ **Admin Dashboard**: Full control with Next.js

Everything is integrated, secure, and cost-effective!

-- Feature Flags and A/B Testing Migration
-- Run this in your Supabase SQL editor

-- Remote Configuration Table (single source of truth)
CREATE TABLE IF NOT EXISTS remote_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  app_version TEXT NOT NULL DEFAULT '1.0.0',
  min_version TEXT NOT NULL DEFAULT '1.0.0',
  force_update BOOLEAN DEFAULT FALSE,
  maintenance_mode BOOLEAN DEFAULT FALSE,
  api_endpoints JSONB DEFAULT '{}',
  feature_flags JSONB DEFAULT '{}',
  experiments JSONB DEFAULT '{}',
  ui_config JSONB DEFAULT '{}',
  content JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feature Flags Table
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT FALSE,
  rollout_percentage INTEGER DEFAULT 100 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  conditions JSONB DEFAULT '{}',
  variants JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Experiments Table
CREATE TABLE IF NOT EXISTS experiments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('draft', 'running', 'paused', 'completed')) DEFAULT 'draft',
  variants JSONB NOT NULL DEFAULT '[]',
  metrics TEXT[] DEFAULT '{}',
  success_metrics JSONB DEFAULT '{}',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Experiment Assignments Table
CREATE TABLE IF NOT EXISTS experiment_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  experiment_id UUID REFERENCES experiments(id) ON DELETE CASCADE,
  variant_id TEXT NOT NULL,
  user_id TEXT,
  device_id TEXT,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(experiment_id, COALESCE(user_id, device_id))
);

-- Experiment Events Table
CREATE TABLE IF NOT EXISTS experiment_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  experiment_id UUID REFERENCES experiments(id) ON DELETE CASCADE,
  variant_id TEXT NOT NULL,
  user_id TEXT,
  device_id TEXT,
  event_name TEXT NOT NULL,
  properties JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Experiment Results Table
CREATE TABLE IF NOT EXISTS experiment_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  experiment_id UUID REFERENCES experiments(id) ON DELETE CASCADE,
  variant_id TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC,
  sample_size INTEGER,
  conversion_rate NUMERIC,
  confidence_level NUMERIC,
  is_significant BOOLEAN DEFAULT FALSE,
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Release Versions Table (for A/B releases)
CREATE TABLE IF NOT EXISTS release_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  version TEXT NOT NULL,
  release_channel TEXT DEFAULT 'stable' CHECK (release_channel IN ('alpha', 'beta', 'stable', 'canary')),
  rollout_percentage INTEGER DEFAULT 100,
  features JSONB DEFAULT '{}',
  changelog TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  released_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Release Assignments
CREATE TABLE IF NOT EXISTS user_release_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  device_id TEXT,
  release_version TEXT NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(COALESCE(user_id, device_id))
);

-- Create indexes for performance
CREATE INDEX idx_experiment_assignments_experiment ON experiment_assignments(experiment_id);
CREATE INDEX idx_experiment_assignments_user ON experiment_assignments(user_id);
CREATE INDEX idx_experiment_assignments_device ON experiment_assignments(device_id);
CREATE INDEX idx_experiment_events_experiment ON experiment_events(experiment_id);
CREATE INDEX idx_experiment_events_created ON experiment_events(created_at DESC);
CREATE INDEX idx_feature_flags_name ON feature_flags(name);
CREATE INDEX idx_experiments_status ON experiments(status);

-- Insert default remote config
INSERT INTO remote_config (
  app_version,
  min_version,
  force_update,
  maintenance_mode,
  feature_flags,
  ui_config,
  content
) VALUES (
  '1.0.0',
  '1.0.0',
  FALSE,
  FALSE,
  '{
    "daily_challenge": true,
    "leaderboard": true,
    "achievements": true,
    "premium_content": false,
    "social_sharing": false,
    "multiplayer": false,
    "ai_hints": false,
    "voice_mode": false,
    "offline_mode": true,
    "analytics": true
  }'::jsonb,
  '{
    "theme": "dark",
    "animations_enabled": true,
    "haptics_enabled": true,
    "sound_effects": true,
    "reduced_motion": false
  }'::jsonb,
  '{
    "daily_challenge_enabled": true,
    "categories_order": ["javascript", "react", "typescript", "nodejs", "python", "algorithms", "system-design", "git"],
    "xp_multiplier": 1.0,
    "energy_refill_time": 300,
    "max_energy": 5,
    "quiz_questions_per_session": 10,
    "min_correct_to_pass": 0.6
  }'::jsonb
) ON CONFLICT DO NOTHING;

-- Insert sample feature flags
INSERT INTO feature_flags (name, description, enabled, rollout_percentage) VALUES
  ('new_onboarding', 'New user onboarding flow', true, 50),
  ('ai_hints', 'AI-powered hints for questions', false, 0),
  ('social_features', 'Social sharing and friends', false, 0),
  ('dark_mode_v2', 'Updated dark mode theme', true, 100),
  ('haptic_feedback', 'Enhanced haptic feedback', true, 90),
  ('voice_commands', 'Voice command support', false, 0),
  ('offline_sync', 'Offline data synchronization', true, 100),
  ('premium_tier', 'Premium subscription features', false, 0)
ON CONFLICT (name) DO NOTHING;

-- Insert sample experiments
INSERT INTO experiments (name, description, status, variants, metrics) VALUES
  (
    'button_color_test',
    'Test different button colors for CTR',
    'running',
    '[
      {"id": "control", "name": "Blue Button", "weight": 50, "config": {"color": "#58a6ff"}},
      {"id": "variant_a", "name": "Green Button", "weight": 50, "config": {"color": "#2ea043"}}
    ]'::jsonb,
    ARRAY['button_clicks', 'quiz_starts', 'completion_rate']
  ),
  (
    'quiz_length_test',
    'Test optimal quiz length',
    'running',
    '[
      {"id": "control", "name": "10 Questions", "weight": 33, "config": {"questions": 10}},
      {"id": "variant_a", "name": "5 Questions", "weight": 33, "config": {"questions": 5}},
      {"id": "variant_b", "name": "15 Questions", "weight": 34, "config": {"questions": 15}}
    ]'::jsonb,
    ARRAY['completion_rate', 'time_spent', 'user_satisfaction']
  ),
  (
    'onboarding_flow',
    'Test different onboarding flows',
    'draft',
    '[
      {"id": "control", "name": "Original", "weight": 50, "config": {"steps": 3}},
      {"id": "variant_a", "name": "Simplified", "weight": 50, "config": {"steps": 1}}
    ]'::jsonb,
    ARRAY['signup_completion', 'first_quiz_completion', 'day1_retention']
  )
ON CONFLICT (name) DO NOTHING;

-- Function to get experiment results
CREATE OR REPLACE FUNCTION calculate_experiment_results(p_experiment_id UUID)
RETURNS TABLE (
  variant_id TEXT,
  metric_name TEXT,
  total_events BIGINT,
  unique_users BIGINT,
  conversion_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.variant_id,
    e.event_name as metric_name,
    COUNT(*) as total_events,
    COUNT(DISTINCT COALESCE(e.user_id, e.device_id)) as unique_users,
    ROUND(
      COUNT(DISTINCT CASE WHEN e.event_name = 'conversion' THEN COALESCE(e.user_id, e.device_id) END)::NUMERIC / 
      NULLIF(COUNT(DISTINCT COALESCE(e.user_id, e.device_id)), 0) * 100, 
      2
    ) as conversion_rate
  FROM experiment_events e
  WHERE e.experiment_id = p_experiment_id
  GROUP BY e.variant_id, e.event_name
  ORDER BY e.variant_id, e.event_name;
END;
$$ LANGUAGE plpgsql;

-- Function to assign user to release channel
CREATE OR REPLACE FUNCTION assign_release_channel(p_user_id TEXT, p_device_id TEXT)
RETURNS TEXT AS $$
DECLARE
  v_hash INTEGER;
  v_version TEXT;
BEGIN
  -- Generate consistent hash from user/device ID
  v_hash := abs(hashtext(COALESCE(p_user_id, p_device_id))) % 100;
  
  -- Check existing assignment
  SELECT release_version INTO v_version
  FROM user_release_assignments
  WHERE COALESCE(user_id, device_id) = COALESCE(p_user_id, p_device_id);
  
  IF v_version IS NOT NULL THEN
    RETURN v_version;
  END IF;
  
  -- Assign based on rollout percentages
  SELECT version INTO v_version
  FROM release_versions
  WHERE is_active = TRUE
    AND v_hash < rollout_percentage
  ORDER BY released_at DESC
  LIMIT 1;
  
  IF v_version IS NULL THEN
    SELECT version INTO v_version
    FROM release_versions
    WHERE release_channel = 'stable'
      AND is_active = TRUE
    ORDER BY released_at DESC
    LIMIT 1;
  END IF;
  
  -- Save assignment
  INSERT INTO user_release_assignments (user_id, device_id, release_version)
  VALUES (p_user_id, p_device_id, v_version)
  ON CONFLICT (COALESCE(user_id, device_id)) DO UPDATE
  SET release_version = v_version;
  
  RETURN v_version;
END;
$$ LANGUAGE plpgsql;

-- Real-time update triggers
CREATE OR REPLACE FUNCTION notify_config_change()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify('config_change', json_build_object(
    'table', TG_TABLE_NAME,
    'action', TG_OP,
    'id', NEW.id
  )::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER remote_config_change
AFTER INSERT OR UPDATE OR DELETE ON remote_config
FOR EACH ROW EXECUTE FUNCTION notify_config_change();

CREATE TRIGGER feature_flags_change
AFTER INSERT OR UPDATE OR DELETE ON feature_flags
FOR EACH ROW EXECUTE FUNCTION notify_config_change();

CREATE TRIGGER experiments_change
AFTER INSERT OR UPDATE OR DELETE ON experiments
FOR EACH ROW EXECUTE FUNCTION notify_config_change();

-- Row Level Security
ALTER TABLE remote_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_events ENABLE ROW LEVEL SECURITY;

-- Public read access for configs
CREATE POLICY "Public read access to remote_config"
  ON remote_config FOR SELECT
  USING (true);

CREATE POLICY "Public read access to feature_flags"
  ON feature_flags FOR SELECT
  USING (enabled = true);

CREATE POLICY "Public read access to active experiments"
  ON experiments FOR SELECT
  USING (status = 'running');

-- Users can see their own assignments
CREATE POLICY "Users see own experiment assignments"
  ON experiment_assignments FOR SELECT
  USING (auth.uid()::TEXT = user_id OR device_id IS NOT NULL);

-- Service role can manage everything
CREATE POLICY "Service role full access to remote_config"
  ON remote_config FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access to feature_flags"
  ON feature_flags FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access to experiments"
  ON experiments FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

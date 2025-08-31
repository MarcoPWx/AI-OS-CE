-- Supabase Analytics Tables Migration
-- Run this in your Supabase SQL editor

-- Analytics Events Table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT NOT NULL,
  user_id TEXT,
  session_id TEXT NOT NULL,
  properties JSONB DEFAULT '{}',
  platform TEXT NOT NULL,
  app_version TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);

-- Performance Metrics Table
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_performance_metrics_name ON performance_metrics(metric_name);
CREATE INDEX idx_performance_metrics_created_at ON performance_metrics(created_at DESC);

-- Error Logs Table
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  error_name TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  user_id TEXT,
  platform TEXT NOT NULL,
  app_version TEXT NOT NULL,
  context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX idx_error_logs_error_name ON error_logs(error_name);

-- User Sessions Table
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  session_id TEXT UNIQUE NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  events_count INTEGER DEFAULT 0,
  platform TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX idx_user_sessions_started_at ON user_sessions(started_at DESC);

-- User Profiles Table (for user traits)
CREATE TABLE IF NOT EXISTS user_profiles (
  id TEXT PRIMARY KEY,
  username TEXT,
  email TEXT,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  lifetime_value NUMERIC DEFAULT 0,
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  traits JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_username ON user_profiles(username);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);

-- Quiz Results Table (specific to your app)
CREATE TABLE IF NOT EXISTS quiz_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  category_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  accuracy NUMERIC,
  duration_seconds INTEGER,
  difficulty TEXT,
  xp_earned INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quiz_results_user_id ON quiz_results(user_id);
CREATE INDEX idx_quiz_results_category_id ON quiz_results(category_id);
CREATE INDEX idx_quiz_results_created_at ON quiz_results(created_at DESC);

-- Aggregated Daily Stats View (for dashboard)
CREATE OR REPLACE VIEW daily_stats AS
SELECT 
  DATE(created_at) as date,
  COUNT(DISTINCT user_id) as daily_active_users,
  COUNT(DISTINCT session_id) as total_sessions,
  COUNT(*) as total_events,
  COUNT(CASE WHEN event_name = 'quiz_complete' THEN 1 END) as quizzes_completed,
  COUNT(CASE WHEN event_name = 'user_signup' THEN 1 END) as new_users
FROM analytics_events
GROUP BY DATE(created_at);

-- Function to increment user lifetime value
CREATE OR REPLACE FUNCTION increment_user_ltv(p_user_id TEXT, p_amount NUMERIC)
RETURNS void AS $$
BEGIN
  INSERT INTO user_profiles (id, lifetime_value)
  VALUES (p_user_id, p_amount)
  ON CONFLICT (id) DO UPDATE
  SET lifetime_value = user_profiles.lifetime_value + p_amount,
      updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to get user funnel metrics
CREATE OR REPLACE FUNCTION get_funnel_metrics(p_funnel_name TEXT, p_start_date DATE, p_end_date DATE)
RETURNS TABLE (
  step_number INTEGER,
  step_name TEXT,
  users_count BIGINT,
  conversion_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH funnel_data AS (
    SELECT 
      (properties->>'step_number')::INTEGER as step_num,
      properties->>'step_name' as step,
      COUNT(DISTINCT user_id) as users
    FROM analytics_events
    WHERE event_name = 'funnel_step'
      AND properties->>'funnel_name' = p_funnel_name
      AND created_at::date BETWEEN p_start_date AND p_end_date
    GROUP BY step_num, step
  ),
  first_step AS (
    SELECT users FROM funnel_data WHERE step_num = 1
  )
  SELECT 
    fd.step_num,
    fd.step,
    fd.users,
    ROUND((fd.users::NUMERIC / fs.users) * 100, 2) as conversion_rate
  FROM funnel_data fd
  CROSS JOIN first_step fs
  ORDER BY fd.step_num;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) Policies
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (for your backend)
CREATE POLICY "Service role has full access to analytics_events"
  ON analytics_events FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role has full access to performance_metrics"
  ON performance_metrics FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role has full access to error_logs"
  ON error_logs FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Users can only see their own data
CREATE POLICY "Users can see their own sessions"
  ON user_sessions FOR SELECT
  USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can see their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid()::TEXT = id);

CREATE POLICY "Users can see their own quiz results"
  ON quiz_results FOR SELECT
  USING (auth.uid()::TEXT = user_id);

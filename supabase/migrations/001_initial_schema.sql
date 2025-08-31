-- QuizMentor Database Schema
-- Migration: 001_initial_schema.sql
-- Created: 2025-08-27

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_theme AS ENUM ('light', 'dark');
CREATE TYPE quiz_difficulty AS ENUM ('easy', 'medium', 'hard', 'expert');
CREATE TYPE quiz_status AS ENUM ('in_progress', 'completed', 'abandoned');
CREATE TYPE achievement_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum');

-- User profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    level INTEGER DEFAULT 1 CHECK (level >= 1),
    xp INTEGER DEFAULT 0 CHECK (xp >= 0),
    total_points INTEGER DEFAULT 0 CHECK (total_points >= 0),
    current_streak INTEGER DEFAULT 0 CHECK (current_streak >= 0),
    longest_streak INTEGER DEFAULT 0 CHECK (longest_streak >= 0),
    theme user_theme DEFAULT 'light',
    language TEXT DEFAULT 'en',
    notifications_enabled BOOLEAN DEFAULT true,
    sound_enabled BOOLEAN DEFAULT true,
    last_active_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz categories table
CREATE TABLE quiz_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT,
    difficulty_levels TEXT[] DEFAULT ARRAY['easy', 'medium', 'hard'],
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz questions table
CREATE TABLE quiz_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES quiz_categories(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answers JSONB NOT NULL, -- Array of answer options
    correct_answer INTEGER NOT NULL CHECK (correct_answer >= 0),
    explanation TEXT,
    difficulty quiz_difficulty DEFAULT 'medium',
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    source TEXT, -- Where the question came from
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure correct_answer is within bounds
    CONSTRAINT valid_correct_answer CHECK (
        correct_answer < jsonb_array_length(answers)
    )
);

-- Quiz sessions table
CREATE TABLE quiz_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES quiz_categories(id) ON DELETE SET NULL,
    difficulty quiz_difficulty DEFAULT 'medium',
    total_questions INTEGER NOT NULL CHECK (total_questions > 0),
    correct_answers INTEGER DEFAULT 0 CHECK (correct_answers >= 0),
    score INTEGER DEFAULT 0 CHECK (score >= 0),
    xp_earned INTEGER DEFAULT 0 CHECK (xp_earned >= 0),
    points_earned INTEGER DEFAULT 0 CHECK (points_earned >= 0),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    time_spent INTEGER, -- seconds
    status quiz_status DEFAULT 'in_progress',
    metadata JSONB DEFAULT '{}', -- Additional session data
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure correct_answers doesn't exceed total_questions
    CONSTRAINT valid_correct_answers CHECK (
        correct_answers <= total_questions
    )
);

-- Quiz answers table (individual question responses)
CREATE TABLE quiz_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES quiz_sessions(id) ON DELETE CASCADE,
    question_id UUID REFERENCES quiz_questions(id) ON DELETE CASCADE,
    answer_selected INTEGER NOT NULL CHECK (answer_selected >= 0),
    is_correct BOOLEAN NOT NULL,
    time_taken NUMERIC(5,2) CHECK (time_taken >= 0), -- seconds with decimal precision
    hints_used INTEGER DEFAULT 0 CHECK (hints_used >= 0),
    power_ups_used TEXT[] DEFAULT ARRAY[]::TEXT[],
    answered_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicate answers for same question in session
    UNIQUE(session_id, question_id)
);

-- Achievements definition table
CREATE TABLE achievements (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    tier achievement_tier DEFAULT 'bronze',
    xp_reward INTEGER DEFAULT 0 CHECK (xp_reward >= 0),
    requirements JSONB NOT NULL, -- Conditions to unlock
    is_secret BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User achievements table
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    achievement_id TEXT REFERENCES achievements(id) ON DELETE CASCADE,
    progress NUMERIC(5,2) DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    unlocked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicate achievements per user
    UNIQUE(user_id, achievement_id)
);

-- Analytics events table
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    event_name TEXT NOT NULL,
    event_data JSONB NOT NULL DEFAULT '{}',
    session_id TEXT NOT NULL,
    platform TEXT NOT NULL,
    app_version TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User streaks table (for detailed streak tracking)
CREATE TABLE user_streaks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    streak_date DATE NOT NULL,
    activities_completed INTEGER DEFAULT 0,
    xp_earned INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint for one record per user per day
    UNIQUE(user_id, streak_date)
);

-- Leaderboards table (for cached leaderboard data)
CREATE TABLE leaderboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    leaderboard_type TEXT NOT NULL, -- 'global', 'weekly', 'category', etc.
    category_id UUID REFERENCES quiz_categories(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    rank INTEGER NOT NULL CHECK (rank > 0),
    score INTEGER NOT NULL CHECK (score >= 0),
    metadata JSONB DEFAULT '{}',
    period_start DATE,
    period_end DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint for leaderboard entries
    UNIQUE(leaderboard_type, category_id, user_id, period_start)
);

-- Create indexes for performance
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_level ON profiles(level DESC);
CREATE INDEX idx_profiles_xp ON profiles(xp DESC);
CREATE INDEX idx_profiles_last_active ON profiles(last_active_at DESC);

CREATE INDEX idx_quiz_questions_category ON quiz_questions(category_id);
CREATE INDEX idx_quiz_questions_difficulty ON quiz_questions(difficulty);
CREATE INDEX idx_quiz_questions_active ON quiz_questions(is_active);

CREATE INDEX idx_quiz_sessions_user ON quiz_sessions(user_id);
CREATE INDEX idx_quiz_sessions_status ON quiz_sessions(status);
CREATE INDEX idx_quiz_sessions_created ON quiz_sessions(created_at DESC);
CREATE INDEX idx_quiz_sessions_completed ON quiz_sessions(completed_at DESC);

CREATE INDEX idx_quiz_answers_session ON quiz_answers(session_id);
CREATE INDEX idx_quiz_answers_question ON quiz_answers(question_id);
CREATE INDEX idx_quiz_answers_correct ON quiz_answers(is_correct);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_unlocked ON user_achievements(unlocked_at DESC);

CREATE INDEX idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(timestamp DESC);
CREATE INDEX idx_analytics_events_session ON analytics_events(session_id);

CREATE INDEX idx_user_streaks_user ON user_streaks(user_id);
CREATE INDEX idx_user_streaks_date ON user_streaks(streak_date DESC);

CREATE INDEX idx_leaderboards_type ON leaderboards(leaderboard_type);
CREATE INDEX idx_leaderboards_rank ON leaderboards(rank);
CREATE INDEX idx_leaderboards_period ON leaderboards(period_start, period_end);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quiz_categories_updated_at BEFORE UPDATE ON quiz_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quiz_questions_updated_at BEFORE UPDATE ON quiz_questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_achievements_updated_at BEFORE UPDATE ON achievements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leaderboards_updated_at BEFORE UPDATE ON leaderboards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Quiz sessions policies
CREATE POLICY "Users can view their own quiz sessions" ON quiz_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quiz sessions" ON quiz_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quiz sessions" ON quiz_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Quiz answers policies
CREATE POLICY "Users can view their own quiz answers" ON quiz_answers
    FOR SELECT USING (
        auth.uid() = (SELECT user_id FROM quiz_sessions WHERE id = session_id)
    );

CREATE POLICY "Users can create their own quiz answers" ON quiz_answers
    FOR INSERT WITH CHECK (
        auth.uid() = (SELECT user_id FROM quiz_sessions WHERE id = session_id)
    );

-- User achievements policies
CREATE POLICY "Users can view their own achievements" ON user_achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create user achievements" ON user_achievements
    FOR INSERT WITH CHECK (true); -- Handled by application logic

-- Analytics events policies
CREATE POLICY "Users can view their own analytics" ON analytics_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analytics events" ON analytics_events
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- User streaks policies
CREATE POLICY "Users can view their own streaks" ON user_streaks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage user streaks" ON user_streaks
    FOR ALL USING (true); -- Handled by application logic

-- Public read access for reference tables
CREATE POLICY "Anyone can view quiz categories" ON quiz_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view quiz questions" ON quiz_questions
    FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view achievements" ON achievements
    FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view leaderboards" ON leaderboards
    FOR SELECT USING (true);

-- Comments for documentation
COMMENT ON TABLE profiles IS 'User profile information and gamification stats';
COMMENT ON TABLE quiz_categories IS 'Quiz categories and topics';
COMMENT ON TABLE quiz_questions IS 'Quiz questions with answers and metadata';
COMMENT ON TABLE quiz_sessions IS 'Individual quiz sessions and results';
COMMENT ON TABLE quiz_answers IS 'Individual question responses within sessions';
COMMENT ON TABLE achievements IS 'Achievement definitions and requirements';
COMMENT ON TABLE user_achievements IS 'User progress and unlocked achievements';
COMMENT ON TABLE analytics_events IS 'User behavior and interaction analytics';
COMMENT ON TABLE user_streaks IS 'Daily activity streaks for users';
COMMENT ON TABLE leaderboards IS 'Cached leaderboard rankings';

COMMENT ON COLUMN profiles.xp IS 'Total experience points earned';
COMMENT ON COLUMN profiles.current_streak IS 'Current consecutive days active';
COMMENT ON COLUMN profiles.longest_streak IS 'Longest streak ever achieved';
COMMENT ON COLUMN quiz_questions.answers IS 'JSON array of answer options';
COMMENT ON COLUMN quiz_questions.correct_answer IS 'Index of correct answer (0-based)';
COMMENT ON COLUMN analytics_events.event_data IS 'JSON object with event-specific data';
COMMENT ON COLUMN achievements.requirements IS 'JSON object defining unlock conditions';
-- supabase/migrations/004_user_profiles_gamification.sql
-- User profiles and gamification tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Helper function for updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    
    -- Gamification Stats
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    total_xp INTEGER DEFAULT 0,
    next_level_xp INTEGER DEFAULT 100,
    
    -- Streaks
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE DEFAULT CURRENT_DATE,
    streak_freeze_count INTEGER DEFAULT 0,
    
    -- Achievements & Progress
    achievements JSONB DEFAULT '[]'::jsonb,
    badges JSONB DEFAULT '[]'::jsonb,
    power_ups JSONB DEFAULT '[]'::jsonb,
    
    -- Quiz Stats
    total_quizzes INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    total_answers INTEGER DEFAULT 0,
    perfect_scores INTEGER DEFAULT 0,
    total_time_spent INTEGER DEFAULT 0, -- in seconds
    
    -- Social
    rank INTEGER,
    rank_trend TEXT DEFAULT 'stable', -- up, down, stable
    friends UUID[] DEFAULT '{}',
    
    -- Settings
    notifications_enabled BOOLEAN DEFAULT true,
    privacy_settings JSONB DEFAULT '{"profile_public": true, "stats_public": true}'::jsonb,
    
    -- Compliance
    accepted_terms BOOLEAN DEFAULT false,
    accepted_privacy BOOLEAN DEFAULT false,
    gdpr_consent BOOLEAN DEFAULT false,
    data_retention_consent BOOLEAN DEFAULT true,
    marketing_consent BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Stats Table (for historical tracking)
CREATE TABLE IF NOT EXISTS user_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    
    -- Daily Stats
    quizzes_completed INTEGER DEFAULT 0,
    questions_answered INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    xp_earned INTEGER DEFAULT 0,
    time_spent INTEGER DEFAULT 0, -- seconds
    achievements_unlocked TEXT[],
    
    -- Snapshot Stats
    level_snapshot INTEGER,
    total_xp_snapshot INTEGER,
    streak_snapshot INTEGER,
    rank_snapshot INTEGER,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Achievements Master Table
CREATE TABLE IF NOT EXISTS achievements (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    tier TEXT CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
    xp_reward INTEGER DEFAULT 0,
    requirements JSONB,
    category TEXT,
    is_secret BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Achievements (Junction Table)
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    achievement_id TEXT REFERENCES achievements(id),
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    progress FLOAT DEFAULT 0,
    UNIQUE(user_id, achievement_id)
);

-- Daily Bonuses Table
CREATE TABLE IF NOT EXISTS daily_bonuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    claimed BOOLEAN DEFAULT false,
    rewards JSONB,
    claim_by TIMESTAMPTZ,
    claimed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Quests
CREATE TABLE IF NOT EXISTS user_quests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    quest_id TEXT NOT NULL,
    quest_type TEXT CHECK (quest_type IN ('daily', 'weekly', 'special', 'achievement')),
    name TEXT NOT NULL,
    description TEXT,
    requirements JSONB,
    rewards JSONB,
    progress FLOAT DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    expires_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leaderboard View (Materialized for performance)
CREATE MATERIALIZED VIEW IF NOT EXISTS leaderboard AS
SELECT 
    u.id,
    u.username,
    u.display_name,
    u.avatar_url,
    u.level,
    u.total_xp,
    u.current_streak,
    u.total_quizzes,
    u.rank,
    ROW_NUMBER() OVER (ORDER BY u.total_xp DESC) as global_rank
FROM user_profiles u
WHERE u.privacy_settings->>'stats_public' = 'true';

-- Create indexes for performance
CREATE INDEX idx_user_profiles_username ON user_profiles(username);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_rank ON user_profiles(rank);
CREATE INDEX idx_user_profiles_total_xp ON user_profiles(total_xp DESC);
CREATE INDEX idx_user_stats_user_date ON user_stats(user_id, date DESC);
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_quests_user ON user_quests(user_id, completed);
CREATE INDEX idx_daily_bonuses_user ON daily_bonuses(user_id, claimed);

-- Functions

-- Update user level based on XP
CREATE OR REPLACE FUNCTION calculate_user_level(p_xp INTEGER)
RETURNS TABLE(level INTEGER, next_level_xp INTEGER) AS $$
DECLARE
    v_level INTEGER := 1;
    v_total_xp INTEGER := 0;
    v_base_xp INTEGER := 100;
    v_exponent FLOAT := 1.5;
BEGIN
    WHILE v_total_xp < p_xp AND v_level < 100 LOOP
        v_total_xp := v_total_xp + FLOOR(v_base_xp * POWER(v_level, v_exponent));
        v_level := v_level + 1;
    END LOOP;
    
    RETURN QUERY SELECT 
        v_level - 1,
        FLOOR(v_base_xp * POWER(v_level, v_exponent))::INTEGER;
END;
$$ LANGUAGE plpgsql;

-- Award XP to user
CREATE OR REPLACE FUNCTION award_xp(
    p_user_id UUID,
    p_xp INTEGER,
    p_reason TEXT DEFAULT NULL
)
RETURNS TABLE(
    new_xp INTEGER,
    new_level INTEGER,
    level_up BOOLEAN
) AS $$
DECLARE
    v_current_xp INTEGER;
    v_current_level INTEGER;
    v_new_xp INTEGER;
    v_new_level INTEGER;
BEGIN
    -- Get current stats
    SELECT xp, level INTO v_current_xp, v_current_level
    FROM user_profiles
    WHERE id = p_user_id;
    
    -- Calculate new XP
    v_new_xp := v_current_xp + p_xp;
    
    -- Calculate new level
    SELECT level INTO v_new_level
    FROM calculate_user_level(v_new_xp);
    
    -- Update user profile
    UPDATE user_profiles
    SET 
        xp = v_new_xp,
        total_xp = total_xp + p_xp,
        level = v_new_level,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    -- Log to stats
    INSERT INTO user_stats (user_id, date, xp_earned)
    VALUES (p_user_id, CURRENT_DATE, p_xp)
    ON CONFLICT (user_id, date)
    DO UPDATE SET xp_earned = user_stats.xp_earned + p_xp;
    
    RETURN QUERY SELECT 
        v_new_xp,
        v_new_level,
        v_new_level > v_current_level;
END;
$$ LANGUAGE plpgsql;

-- Update streak
CREATE OR REPLACE FUNCTION update_user_streak(p_user_id UUID)
RETURNS TABLE(
    new_streak INTEGER,
    streak_maintained BOOLEAN,
    streak_broken BOOLEAN
) AS $$
DECLARE
    v_last_activity DATE;
    v_current_streak INTEGER;
    v_new_streak INTEGER;
    v_days_diff INTEGER;
BEGIN
    -- Get current streak info
    SELECT last_activity_date, current_streak
    INTO v_last_activity, v_current_streak
    FROM user_profiles
    WHERE id = p_user_id;
    
    -- Calculate days difference
    v_days_diff := CURRENT_DATE - v_last_activity;
    
    IF v_days_diff = 0 THEN
        -- Same day, maintain streak
        RETURN QUERY SELECT v_current_streak, true, false;
    ELSIF v_days_diff = 1 THEN
        -- Next day, increment streak
        v_new_streak := v_current_streak + 1;
        
        UPDATE user_profiles
        SET 
            current_streak = v_new_streak,
            longest_streak = GREATEST(longest_streak, v_new_streak),
            last_activity_date = CURRENT_DATE,
            updated_at = NOW()
        WHERE id = p_user_id;
        
        RETURN QUERY SELECT v_new_streak, true, false;
    ELSE
        -- Streak broken
        UPDATE user_profiles
        SET 
            current_streak = 1,
            last_activity_date = CURRENT_DATE,
            updated_at = NOW()
        WHERE id = p_user_id;
        
        RETURN QUERY SELECT 1, false, true;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Check and unlock achievements
CREATE OR REPLACE FUNCTION check_achievements(p_user_id UUID)
RETURNS TABLE(
    achievement_id TEXT,
    achievement_name TEXT,
    xp_reward INTEGER
) AS $$
BEGIN
    -- Check streak achievements
    INSERT INTO user_achievements (user_id, achievement_id, progress)
    SELECT 
        p_user_id,
        a.id,
        1.0
    FROM achievements a
    CROSS JOIN user_profiles u
    WHERE u.id = p_user_id
    AND a.category = 'streak'
    AND NOT EXISTS (
        SELECT 1 FROM user_achievements ua 
        WHERE ua.user_id = p_user_id AND ua.achievement_id = a.id
    )
    AND (
        (a.id = 'first_streak' AND u.current_streak >= 3) OR
        (a.id = 'week_warrior' AND u.current_streak >= 7) OR
        (a.id = 'unstoppable' AND u.current_streak >= 30) OR
        (a.id = 'legendary' AND u.current_streak >= 100)
    );
    
    -- Check quiz achievements
    INSERT INTO user_achievements (user_id, achievement_id, progress)
    SELECT 
        p_user_id,
        a.id,
        1.0
    FROM achievements a
    CROSS JOIN user_profiles u
    WHERE u.id = p_user_id
    AND a.category = 'milestone'
    AND NOT EXISTS (
        SELECT 1 FROM user_achievements ua 
        WHERE ua.user_id = p_user_id AND ua.achievement_id = a.id
    )
    AND (
        (a.id = 'first_quiz' AND u.total_quizzes >= 1) OR
        (a.id = 'quiz_master' AND u.total_quizzes >= 100) OR
        (a.id = 'knowledge_seeker' AND u.total_quizzes >= 1000)
    );
    
    -- Return newly unlocked achievements
    RETURN QUERY
    SELECT 
        a.id,
        a.name,
        a.xp_reward
    FROM user_achievements ua
    JOIN achievements a ON ua.achievement_id = a.id
    WHERE ua.user_id = p_user_id
    AND ua.unlocked_at >= NOW() - INTERVAL '1 minute';
END;
$$ LANGUAGE plpgsql;

-- GDPR: Delete user data
CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS VOID AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Get current user ID
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;
    
    -- Delete all user data (cascades will handle related tables)
    DELETE FROM user_profiles WHERE id = v_user_id;
    
    -- Delete auth user
    DELETE FROM auth.users WHERE id = v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- GDPR: Export user data
CREATE OR REPLACE FUNCTION export_user_data()
RETURNS JSON AS $$
DECLARE
    v_user_id UUID;
    v_result JSON;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;
    
    SELECT json_build_object(
        'profile', row_to_json(p),
        'stats', (
            SELECT json_agg(row_to_json(s))
            FROM user_stats s
            WHERE s.user_id = v_user_id
        ),
        'achievements', (
            SELECT json_agg(row_to_json(a))
            FROM user_achievements ua
            JOIN achievements a ON ua.achievement_id = a.id
            WHERE ua.user_id = v_user_id
        ),
        'quests', (
            SELECT json_agg(row_to_json(q))
            FROM user_quests q
            WHERE q.user_id = v_user_id
        )
    ) INTO v_result
    FROM user_profiles p
    WHERE p.id = v_user_id;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_bonuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quests ENABLE ROW LEVEL SECURITY;

-- Users can only see their own profile (unless public)
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Public profiles are viewable" ON user_profiles
    FOR SELECT USING (privacy_settings->>'profile_public' = 'true');

-- Users can only manage their own stats
CREATE POLICY "Users manage own stats" ON user_stats
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own achievements" ON user_achievements
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own bonuses" ON daily_bonuses
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own quests" ON user_quests
    FOR ALL USING (auth.uid() = user_id);

-- Triggers
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default achievements
INSERT INTO achievements (id, name, description, icon, tier, xp_reward, category) VALUES
-- Streaks
('first_streak', 'On Fire!', 'Get a 3-day streak', '🔥', 'bronze', 50, 'streak'),
('week_warrior', 'Week Warrior', '7-day streak', '⚔️', 'silver', 150, 'streak'),
('unstoppable', 'Unstoppable', '30-day streak', '💪', 'gold', 500, 'streak'),
('legendary', 'Legendary', '100-day streak', '👑', 'platinum', 2000, 'streak'),
-- Performance
('perfect_score', 'Perfectionist', 'Get 100% on a quiz', '💯', 'bronze', 100, 'performance'),
('speed_demon', 'Speed Demon', 'Complete quiz in under 30 seconds', '⚡', 'bronze', 75, 'performance'),
('comeback_kid', 'Comeback Kid', 'Improve score by 50%', '📈', 'silver', 100, 'performance'),
-- Milestones
('first_quiz', 'Welcome!', 'Complete your first quiz', '🎯', 'bronze', 25, 'milestone'),
('quiz_master', 'Quiz Master', 'Complete 100 quizzes', '🎓', 'gold', 300, 'milestone'),
('knowledge_seeker', 'Knowledge Seeker', 'Complete 1000 quizzes', '🧠', 'platinum', 1000, 'milestone'),
-- Category Mastery
('category_explorer', 'Explorer', 'Try all categories', '🗺️', 'silver', 200, 'category'),
('category_master', 'Master', 'Master a category', '🏆', 'gold', 300, 'category'),
('polymath', 'Polymath', 'Master 5 categories', '🌟', 'platinum', 1000, 'category'),
-- Social
('social_butterfly', 'Social Butterfly', 'Share 10 results', '🦋', 'bronze', 50, 'social'),
('challenger', 'Challenger', 'Challenge 5 friends', '⚔️', 'silver', 100, 'social'),
('mentor', 'Mentor', 'Help 10 friends improve', '🤝', 'gold', 200, 'social'),
-- Secret
('night_owl', 'Night Owl', 'Complete quiz after midnight', '🦉', 'bronze', 50, 'special'),
('early_bird', 'Early Bird', 'Complete quiz before 6 AM', '🐦', 'bronze', 50, 'special'),
('lucky_seven', 'Lucky Seven', 'Score exactly 77%', '🎰', 'silver', 77, 'special')
ON CONFLICT (id) DO NOTHING;

-- Refresh leaderboard (run periodically)
REFRESH MATERIALIZED VIEW leaderboard;

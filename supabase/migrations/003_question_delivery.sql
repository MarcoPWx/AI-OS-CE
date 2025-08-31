-- supabase/migrations/003_question_delivery.sql
-- Question delivery system with categories, questions, and user progress tracking

-- Question Categories table
CREATE TABLE IF NOT EXISTS question_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES question_categories(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of option strings
    correct_answer INTEGER NOT NULL,
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
    explanation TEXT,
    points INTEGER DEFAULT 10,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    times_answered INTEGER DEFAULT 0,
    times_correct INTEGER DEFAULT 0,
    avg_time_to_answer FLOAT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User question progress
CREATE TABLE IF NOT EXISTS user_question_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    category_id UUID REFERENCES question_categories(id) ON DELETE CASCADE,
    answered_correctly BOOLEAN NOT NULL,
    time_taken INTEGER, -- in seconds
    attempt_number INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, question_id, attempt_number)
);

-- User category progress
CREATE TABLE IF NOT EXISTS user_category_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    category_id UUID REFERENCES question_categories(id) ON DELETE CASCADE,
    questions_attempted INTEGER DEFAULT 0,
    questions_correct INTEGER DEFAULT 0,
    total_time_spent INTEGER DEFAULT 0, -- in seconds
    last_accessed TIMESTAMPTZ DEFAULT NOW(),
    completion_percentage FLOAT DEFAULT 0,
    mastery_level INTEGER DEFAULT 0, -- 0-5 scale
    streak_count INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, category_id)
);

-- Question sets for custom quiz creation
CREATE TABLE IF NOT EXISTS question_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID,
    is_public BOOLEAN DEFAULT false,
    question_ids JSONB NOT NULL, -- Array of question IDs
    metadata JSONB DEFAULT '{}',
    times_played INTEGER DEFAULT 0,
    avg_score FLOAT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Question reports (for flagging issues)
CREATE TABLE IF NOT EXISTS question_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    report_type TEXT CHECK (report_type IN ('incorrect', 'unclear', 'offensive', 'other')),
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Question analytics
CREATE TABLE IF NOT EXISTS question_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    times_shown INTEGER DEFAULT 0,
    times_answered INTEGER DEFAULT 0,
    times_correct INTEGER DEFAULT 0,
    times_skipped INTEGER DEFAULT 0,
    avg_time_to_answer FLOAT DEFAULT 0,
    difficulty_rating FLOAT DEFAULT 0, -- User-perceived difficulty (1-5)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(question_id, date)
);

-- Create indexes for performance
CREATE INDEX idx_questions_category ON questions(category_id);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_questions_active ON questions(is_active);
CREATE INDEX idx_user_progress_user ON user_question_progress(user_id);
CREATE INDEX idx_user_progress_question ON user_question_progress(question_id);
CREATE INDEX idx_user_category_progress_user ON user_category_progress(user_id);
CREATE INDEX idx_category_progress_completion ON user_category_progress(completion_percentage);
CREATE INDEX idx_question_analytics_date ON question_analytics(date);
CREATE INDEX idx_question_analytics_question ON question_analytics(question_id);

-- Full text search on questions
CREATE INDEX idx_questions_text_search ON questions USING gin(to_tsvector('english', text));

-- Create views for easier querying
CREATE VIEW question_performance AS
SELECT 
    q.id,
    q.text,
    q.difficulty,
    c.name as category_name,
    q.times_answered,
    q.times_correct,
    CASE 
        WHEN q.times_answered > 0 THEN (q.times_correct::FLOAT / q.times_answered) * 100
        ELSE 0
    END as success_rate,
    q.avg_time_to_answer
FROM questions q
JOIN question_categories c ON q.category_id = c.id
WHERE q.is_active = true;

CREATE VIEW user_overall_progress AS
SELECT 
    user_id,
    COUNT(DISTINCT category_id) as categories_attempted,
    SUM(questions_attempted) as total_questions_attempted,
    SUM(questions_correct) as total_questions_correct,
    CASE 
        WHEN SUM(questions_attempted) > 0 
        THEN (SUM(questions_correct)::FLOAT / SUM(questions_attempted)) * 100
        ELSE 0
    END as overall_accuracy,
    SUM(total_time_spent) as total_time_spent,
    AVG(mastery_level) as avg_mastery_level,
    MAX(best_streak) as longest_streak
FROM user_category_progress
GROUP BY user_id;

-- Functions for question delivery

-- Function to get next question for a user
CREATE OR REPLACE FUNCTION get_next_question(
    p_user_id UUID,
    p_category_id UUID DEFAULT NULL,
    p_difficulty TEXT DEFAULT NULL
)
RETURNS TABLE (
    question_id UUID,
    category_id UUID,
    text TEXT,
    options JSONB,
    difficulty TEXT,
    points INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        q.id as question_id,
        q.category_id,
        q.text,
        q.options,
        q.difficulty,
        q.points
    FROM questions q
    LEFT JOIN user_question_progress p 
        ON q.id = p.question_id AND p.user_id = p_user_id
    WHERE 
        q.is_active = true
        AND (p_category_id IS NULL OR q.category_id = p_category_id)
        AND (p_difficulty IS NULL OR q.difficulty = p_difficulty)
        AND (p.id IS NULL OR NOT p.answered_correctly) -- Prioritize unanswered or incorrect
    ORDER BY 
        p.id IS NULL DESC, -- Unanswered first
        p.answered_correctly ASC, -- Then incorrectly answered
        RANDOM() -- Random within priority
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to record answer and update stats
CREATE OR REPLACE FUNCTION record_answer(
    p_user_id UUID,
    p_question_id UUID,
    p_is_correct BOOLEAN,
    p_time_taken INTEGER
)
RETURNS VOID AS $$
DECLARE
    v_category_id UUID;
    v_attempt_number INTEGER;
BEGIN
    -- Get category and attempt number
    SELECT category_id INTO v_category_id FROM questions WHERE id = p_question_id;
    
    SELECT COALESCE(MAX(attempt_number), 0) + 1 INTO v_attempt_number
    FROM user_question_progress
    WHERE user_id = p_user_id AND question_id = p_question_id;
    
    -- Insert progress record
    INSERT INTO user_question_progress (
        user_id, question_id, category_id, answered_correctly, 
        time_taken, attempt_number
    ) VALUES (
        p_user_id, p_question_id, v_category_id, p_is_correct, 
        p_time_taken, v_attempt_number
    );
    
    -- Update question stats
    UPDATE questions
    SET 
        times_answered = times_answered + 1,
        times_correct = times_correct + CASE WHEN p_is_correct THEN 1 ELSE 0 END,
        avg_time_to_answer = (
            (avg_time_to_answer * times_answered + p_time_taken) / 
            (times_answered + 1)
        ),
        updated_at = NOW()
    WHERE id = p_question_id;
    
    -- Update or insert user category progress
    INSERT INTO user_category_progress (
        user_id, category_id, questions_attempted, questions_correct,
        total_time_spent, last_accessed
    ) VALUES (
        p_user_id, v_category_id, 1, 
        CASE WHEN p_is_correct THEN 1 ELSE 0 END,
        p_time_taken, NOW()
    )
    ON CONFLICT (user_id, category_id) 
    DO UPDATE SET
        questions_attempted = user_category_progress.questions_attempted + 1,
        questions_correct = user_category_progress.questions_correct + 
            CASE WHEN p_is_correct THEN 1 ELSE 0 END,
        total_time_spent = user_category_progress.total_time_spent + p_time_taken,
        last_accessed = NOW(),
        streak_count = CASE 
            WHEN p_is_correct THEN user_category_progress.streak_count + 1
            ELSE 0
        END,
        best_streak = CASE 
            WHEN p_is_correct AND user_category_progress.streak_count + 1 > user_category_progress.best_streak
            THEN user_category_progress.streak_count + 1
            ELSE user_category_progress.best_streak
        END,
        updated_at = NOW();
        
    -- Update completion percentage
    UPDATE user_category_progress ucp
    SET completion_percentage = (
        SELECT (COUNT(DISTINCT p.question_id)::FLOAT / COUNT(DISTINCT q.id)) * 100
        FROM questions q
        LEFT JOIN user_question_progress p 
            ON q.id = p.question_id 
            AND p.user_id = ucp.user_id 
            AND p.answered_correctly = true
        WHERE q.category_id = ucp.category_id
    )
    WHERE user_id = p_user_id AND category_id = v_category_id;
    
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE question_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_question_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_category_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_reports ENABLE ROW LEVEL SECURITY;

-- Public read access to categories and questions
CREATE POLICY "Public read categories" ON question_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public read questions" ON questions
    FOR SELECT USING (is_active = true);

-- User can only see/modify their own progress
CREATE POLICY "Users manage own question progress" ON user_question_progress
    FOR ALL USING (auth.uid()::uuid = user_id);

CREATE POLICY "Users manage own category progress" ON user_category_progress
    FOR ALL USING (auth.uid()::uuid = user_id);

-- Users can create and view public question sets
CREATE POLICY "Users create question sets" ON question_sets
    FOR INSERT WITH CHECK (auth.uid()::uuid = created_by);

CREATE POLICY "View public question sets" ON question_sets
    FOR SELECT USING (is_public = true OR auth.uid()::uuid = created_by);

CREATE POLICY "Users update own question sets" ON question_sets
    FOR UPDATE USING (auth.uid()::uuid = created_by);

-- Users can report questions
CREATE POLICY "Users report questions" ON question_reports
    FOR INSERT WITH CHECK (auth.uid()::uuid = user_id);

CREATE POLICY "Users view own reports" ON question_reports
    FOR SELECT USING (auth.uid()::uuid = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON question_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at
    BEFORE UPDATE ON questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_category_progress_updated_at
    BEFORE UPDATE ON user_category_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_question_sets_updated_at
    BEFORE UPDATE ON question_sets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

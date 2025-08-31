-- QuizMentor Database Seed Data
-- This file populates the database with initial data for development and testing

-- Insert quiz categories
INSERT INTO quiz_categories (id, name, slug, description, icon, color, difficulty_levels, sort_order) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'JavaScript', 'javascript', 'Core JavaScript concepts and syntax', '🟨', '#F7DF1E', ARRAY['easy', 'medium', 'hard', 'expert'], 1),
    ('550e8400-e29b-41d4-a716-446655440002', 'React', 'react', 'React library and ecosystem', '⚛️', '#61DAFB', ARRAY['easy', 'medium', 'hard'], 2),
    ('550e8400-e29b-41d4-a716-446655440003', 'Node.js', 'nodejs', 'Server-side JavaScript with Node.js', '🟢', '#339933', ARRAY['medium', 'hard', 'expert'], 3),
    ('550e8400-e29b-41d4-a716-446655440004', 'TypeScript', 'typescript', 'TypeScript language and type system', '🔷', '#3178C6', ARRAY['medium', 'hard'], 4),
    ('550e8400-e29b-41d4-a716-446655440005', 'CSS', 'css', 'Cascading Style Sheets and web styling', '🎨', '#1572B6', ARRAY['easy', 'medium', 'hard'], 5),
    ('550e8400-e29b-41d4-a716-446655440006', 'HTML', 'html', 'HyperText Markup Language fundamentals', '📄', '#E34F26', ARRAY['easy', 'medium'], 6),
    ('550e8400-e29b-41d4-a716-446655440007', 'Python', 'python', 'Python programming language', '🐍', '#3776AB', ARRAY['easy', 'medium', 'hard'], 7),
    ('550e8400-e29b-41d4-a716-446655440008', 'Git', 'git', 'Version control with Git', '📚', '#F05032', ARRAY['easy', 'medium'], 8);

-- Insert sample quiz questions for JavaScript
INSERT INTO quiz_questions (id, category_id, question, answers, correct_answer, explanation, difficulty, tags) VALUES
    ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 
     'What is the correct way to declare a variable in JavaScript?', 
     '["var myVar = 5;", "variable myVar = 5;", "v myVar = 5;", "declare myVar = 5;"]', 
     0, 'The "var" keyword is used to declare variables in JavaScript, though "let" and "const" are preferred in modern JavaScript.', 
     'easy', ARRAY['variables', 'syntax', 'fundamentals']),
     
    ('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 
     'Which of the following is NOT a JavaScript data type?', 
     '["String", "Boolean", "Integer", "Undefined"]', 
     2, 'JavaScript has Number type, not Integer. The primitive types are: string, number, boolean, undefined, null, symbol, and bigint.', 
     'easy', ARRAY['data-types', 'fundamentals']),
     
    ('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 
     'What does the "===" operator do in JavaScript?', 
     '["Assignment", "Equality without type conversion", "Equality with type conversion", "Not equal"]', 
     1, 'The "===" operator checks for strict equality, comparing both value and type without type conversion.', 
     'medium', ARRAY['operators', 'comparison', 'types']),
     
    ('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 
     'What will console.log(typeof null) output?', 
     '["null", "undefined", "object", "boolean"]', 
     2, 'This is a well-known JavaScript quirk. typeof null returns "object" due to a bug in the original JavaScript implementation that was never fixed for backward compatibility.', 
     'hard', ARRAY['typeof', 'null', 'quirks']),
     
    ('650e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 
     'Which method is used to add an element to the end of an array?', 
     '["append()", "push()", "add()", "insert()"]', 
     1, 'The push() method adds one or more elements to the end of an array and returns the new length of the array.', 
     'easy', ARRAY['arrays', 'methods']);

-- Insert sample React questions
INSERT INTO quiz_questions (id, category_id, question, answers, correct_answer, explanation, difficulty, tags) VALUES
    ('650e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', 
     'What is JSX in React?', 
     '["A JavaScript library", "A syntax extension for JavaScript", "A CSS framework", "A database query language"]', 
     1, 'JSX is a syntax extension for JavaScript that allows you to write HTML-like code in your JavaScript files.', 
     'easy', ARRAY['jsx', 'syntax', 'fundamentals']),
     
    ('650e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440002', 
     'Which hook is used to manage state in functional components?', 
     '["useEffect", "useState", "useContext", "useReducer"]', 
     1, 'useState is the primary hook for managing local state in functional components.', 
     'medium', ARRAY['hooks', 'state', 'functional-components']),
     
    ('650e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440002', 
     'What is the purpose of useEffect hook?', 
     '["To create state variables", "To handle side effects", "To create context", "To optimize performance"]', 
     1, 'useEffect is used to perform side effects in functional components, such as data fetching, subscriptions, or DOM manipulation.', 
     'medium', ARRAY['hooks', 'useEffect', 'side-effects']);

-- Insert achievements
INSERT INTO achievements (id, name, description, icon, tier, xp_reward, requirements, is_secret) VALUES
    ('first_quiz', 'Welcome!', 'Complete your first quiz', '🎯', 'bronze', 25, '{"type": "quiz_completed", "count": 1}', false),
    ('perfect_score', 'Perfectionist', 'Get 100% on a quiz', '💯', 'bronze', 100, '{"type": "perfect_score", "count": 1}', false),
    ('speed_demon', 'Speed Demon', 'Complete a quiz in under 30 seconds', '⚡', 'bronze', 75, '{"type": "quiz_time", "max_time": 30}', false),
    ('first_streak', 'On Fire!', 'Get a 3-day streak', '🔥', 'bronze', 50, '{"type": "streak", "days": 3}', false),
    ('week_warrior', 'Week Warrior', '7-day streak', '⚔️', 'silver', 150, '{"type": "streak", "days": 7}', false),
    ('unstoppable', 'Unstoppable', '30-day streak', '💪', 'gold', 500, '{"type": "streak", "days": 30}', false),
    ('legendary', 'Legendary', '100-day streak', '👑', 'platinum', 2000, '{"type": "streak", "days": 100}', false),
    ('quiz_master', 'Quiz Master', 'Complete 100 quizzes', '🎓', 'gold', 300, '{"type": "quiz_completed", "count": 100}', false),
    ('knowledge_seeker', 'Knowledge Seeker', 'Complete 1000 quizzes', '🧠', 'platinum', 1000, '{"type": "quiz_completed", "count": 1000}', false),
    ('category_explorer', 'Explorer', 'Try all categories', '🗺️', 'silver', 200, '{"type": "categories_tried", "count": 8}', false),
    ('night_owl', 'Night Owl', 'Complete a quiz after midnight', '🦉', 'bronze', 50, '{"type": "quiz_time_of_day", "after": "00:00"}', true),
    ('early_bird', 'Early Bird', 'Complete a quiz before 6 AM', '🐦', 'bronze', 50, '{"type": "quiz_time_of_day", "before": "06:00"}', true),
    ('lucky_seven', 'Lucky Seven', 'Score exactly 77%', '🎰', 'silver', 77, '{"type": "exact_score", "percentage": 77}', true);

-- Insert sample user profile (for development/testing)
-- Note: This would normally be created when a user signs up
INSERT INTO profiles (id, username, display_name, level, xp, current_streak, longest_streak) VALUES
    ('00000000-0000-0000-0000-000000000000', 'demo_user', 'Demo User', 5, 1250, 7, 15)
ON CONFLICT (id) DO NOTHING;

-- Insert sample quiz session for demo user
INSERT INTO quiz_sessions (id, user_id, category_id, difficulty, total_questions, correct_answers, score, xp_earned, points_earned, status, completed_at, time_spent) VALUES
    ('750e8400-e29b-41d4-a716-446655440001', '00000000-0000-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440001', 'medium', 5, 4, 4, 40, 400, 'completed', NOW() - INTERVAL '1 hour', 120)
ON CONFLICT DO NOTHING;

-- Insert sample quiz answers for the session
INSERT INTO quiz_answers (session_id, question_id, answer_selected, is_correct, time_taken) VALUES
    ('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 0, true, 15.5),
    ('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002', 2, true, 12.3),
    ('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440003', 1, true, 25.7),
    ('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440004', 1, false, 30.2),
    ('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440005', 1, true, 18.9)
ON CONFLICT DO NOTHING;

-- Insert sample user achievements
INSERT INTO user_achievements (user_id, achievement_id, progress, unlocked_at) VALUES
    ('00000000-0000-0000-0000-000000000000', 'first_quiz', 100, NOW() - INTERVAL '2 days'),
    ('00000000-0000-0000-0000-000000000000', 'perfect_score', 100, NOW() - INTERVAL '1 day'),
    ('00000000-0000-0000-0000-000000000000', 'first_streak', 100, NOW() - INTERVAL '1 day'),
    ('00000000-0000-0000-0000-000000000000', 'week_warrior', 100, NOW() - INTERVAL '6 hours')
ON CONFLICT DO NOTHING;

-- Insert sample analytics events
INSERT INTO analytics_events (user_id, event_name, event_data, session_id, platform, app_version, timestamp) VALUES
    ('00000000-0000-0000-0000-000000000000', 'quiz_started', '{"category": "JavaScript", "difficulty": "medium"}', 'session_123', 'web', '1.0.0', NOW() - INTERVAL '2 hours'),
    ('00000000-0000-0000-0000-000000000000', 'quiz_completed', '{"category": "JavaScript", "score": 4, "total": 5, "time": 120}', 'session_123', 'web', '1.0.0', NOW() - INTERVAL '1 hour'),
    ('00000000-0000-0000-0000-000000000000', 'gamification_level_up', '{"level_reached": 5, "xp_amount": 1250}', 'session_123', 'web', '1.0.0', NOW() - INTERVAL '1 hour'),
    ('00000000-0000-0000-0000-000000000000', 'screen_view', '{"screen_name": "ProfileScreen"}', 'session_124', 'web', '1.0.0', NOW() - INTERVAL '30 minutes')
ON CONFLICT DO NOTHING;

-- Insert sample user streaks
INSERT INTO user_streaks (user_id, streak_date, activities_completed, xp_earned) VALUES
    ('00000000-0000-0000-0000-000000000000', CURRENT_DATE - INTERVAL '7 days', 2, 50),
    ('00000000-0000-0000-0000-000000000000', CURRENT_DATE - INTERVAL '6 days', 1, 25),
    ('00000000-0000-0000-0000-000000000000', CURRENT_DATE - INTERVAL '5 days', 3, 75),
    ('00000000-0000-0000-0000-000000000000', CURRENT_DATE - INTERVAL '4 days', 1, 30),
    ('00000000-0000-0000-0000-000000000000', CURRENT_DATE - INTERVAL '3 days', 2, 60),
    ('00000000-0000-0000-0000-000000000000', CURRENT_DATE - INTERVAL '2 days', 1, 40),
    ('00000000-0000-0000-0000-000000000000', CURRENT_DATE - INTERVAL '1 day', 2, 55)
ON CONFLICT DO NOTHING;

-- Insert sample leaderboard data
INSERT INTO leaderboards (leaderboard_type, category_id, user_id, rank, score, period_start, period_end) VALUES
    ('global', NULL, '00000000-0000-0000-0000-000000000000', 42, 1250, CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE),
    ('weekly', NULL, '00000000-0000-0000-0000-000000000000', 15, 335, CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE),
    ('category', '550e8400-e29b-41d4-a716-446655440001', '00000000-0000-0000-0000-000000000000', 8, 800, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE)
ON CONFLICT DO NOTHING;

-- Create some additional sample questions for testing
INSERT INTO quiz_questions (category_id, question, answers, correct_answer, explanation, difficulty, tags) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 
     'What is the output of: console.log(1 + "2" + 3)?', 
     '["6", "123", "15", "Error"]', 
     1, 'JavaScript performs string concatenation from left to right. 1 + "2" becomes "12", then "12" + 3 becomes "123".', 
     'medium', ARRAY['type-coercion', 'operators']),
     
    ('550e8400-e29b-41d4-a716-446655440001', 
     'Which of the following creates a closure in JavaScript?', 
     '["function outer() { var x = 1; function inner() { return x; } return inner; }", "var x = function() { return 1; };", "function test() { return 1; }", "var obj = { x: 1 };"]', 
     0, 'A closure is created when an inner function has access to variables from its outer function scope, even after the outer function has returned.', 
     'hard', ARRAY['closures', 'scope', 'functions']),
     
    ('550e8400-e29b-41d4-a716-446655440002', 
     'What is the correct way to pass props to a React component?', 
     '["<Component props={data} />", "<Component {data} />", "<Component data={data} />", "<Component props=data />"]', 
     2, 'Props are passed to React components using the attribute syntax: <Component propName={value} />.', 
     'easy', ARRAY['props', 'components', 'jsx']),
     
    ('550e8400-e29b-41d4-a716-446655440003', 
     'Which Node.js module is used for file system operations?', 
     '["http", "fs", "path", "os"]', 
     1, 'The "fs" (file system) module provides an API for interacting with the file system in Node.js.', 
     'easy', ARRAY['modules', 'filesystem', 'nodejs']);

-- Update sequences to ensure proper ID generation
SELECT setval(pg_get_serial_sequence('profiles', 'id'), (SELECT MAX(id) FROM profiles) + 1, false);

-- Create a function to generate sample data for testing
CREATE OR REPLACE FUNCTION generate_sample_quiz_data(user_count INTEGER DEFAULT 10)
RETURNS void AS $$
DECLARE
    i INTEGER;
    user_id UUID;
    category_ids UUID[];
    session_id UUID;
BEGIN
    -- Get all category IDs
    SELECT ARRAY(SELECT id FROM quiz_categories WHERE is_active = true) INTO category_ids;
    
    -- Generate sample users and data
    FOR i IN 1..user_count LOOP
        user_id := uuid_generate_v4();
        
        -- Insert sample profile
        INSERT INTO profiles (id, username, display_name, level, xp, current_streak, longest_streak)
        VALUES (
            user_id,
            'user_' || i,
            'Sample User ' || i,
            1 + (random() * 10)::INTEGER,
            (random() * 5000)::INTEGER,
            (random() * 30)::INTEGER,
            (random() * 50)::INTEGER
        );
        
        -- Insert sample quiz sessions
        FOR j IN 1..(1 + (random() * 5)::INTEGER) LOOP
            session_id := uuid_generate_v4();
            
            INSERT INTO quiz_sessions (id, user_id, category_id, difficulty, total_questions, correct_answers, score, xp_earned, status, completed_at)
            VALUES (
                session_id,
                user_id,
                category_ids[1 + (random() * array_length(category_ids, 1))::INTEGER],
                (ARRAY['easy', 'medium', 'hard'])[1 + (random() * 3)::INTEGER]::quiz_difficulty,
                10,
                (random() * 10)::INTEGER,
                (random() * 10)::INTEGER,
                (random() * 100)::INTEGER,
                'completed',
                NOW() - (random() * INTERVAL '30 days')
            );
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Uncomment the following line to generate sample data (for development only)
-- SELECT generate_sample_quiz_data(50);

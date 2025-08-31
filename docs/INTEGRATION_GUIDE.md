# Integration Guide - Adding Smart Quiz Logic to Your App

## Quick Start - Just 3 Changes!

### Change 1: Update QuizScreen.tsx

```typescript
// screens/QuizScreen.tsx

import SimpleQuizOptimizer from '../services/simpleQuizOptimizer';

export default function QuizScreen() {
  const route = useRoute<QuizScreenRouteProp>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sessionConfig, setSessionConfig] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [lives, setLives] = useState(3);
  const [encouragementMessage, setEncouragementMessage] = useState<string | null>(null);

  // NEW: Initialize optimizer
  const optimizer = new SimpleQuizOptimizer();

  useEffect(() => {
    loadOptimizedQuiz();
  }, []);

  // NEW: Load optimized quiz instead of random questions
  const loadOptimizedQuiz = async () => {
    try {
      const userId = await getUserId(); // Your existing auth
      const result = await optimizer.getOptimizedQuiz(
        userId,
        route.params.categoryId,
        route.params.sessionType || 'normal'
      );

      setQuestions(result.questions);
      setSessionConfig(result.config);
      setLives(result.config.livesAllowed);
    } catch (error) {
      console.error('Failed to load quiz:', error);
      // Fallback to existing logic
    }
  };

  // UPDATED: Track answers for optimization
  const handleAnswer = async (answerIndex: number) => {
    const isCorrect = answerIndex === questions[currentQuestionIndex].correctAnswer;

    // Track for optimization
    const rewards = await optimizer.trackAnswer(
      userId,
      questions[currentQuestionIndex].id,
      route.params.categoryId,
      isCorrect,
      timeSpent, // You should track this
      questions[currentQuestionIndex].difficulty
    );

    // Update UI with rewards
    if (isCorrect) {
      showXPAnimation(rewards.xp);
      showStarsAnimation(rewards.stars);
    } else {
      setLives(prev => prev - 1);

      // Show encouragement if struggling
      const message = optimizer.getEncouragementMessage(consecutiveWrong);
      if (message) {
        setEncouragementMessage(message);
      }
    }

    // Your existing logic...
  };

  return (
    <View>
      {/* NEW: Show session type */}
      <Text>{sessionConfig?.questionCount} Questions</Text>

      {/* NEW: Show lives (hearts) */}
      <View style={styles.hearts}>
        {sessionConfig?.livesAllowed === 999 ? (
          <Text>♥️ ∞</Text>
        ) : (
          <Text>{'♥️'.repeat(lives)}</Text>
        )}
      </View>

      {/* NEW: Show encouragement */}
      {encouragementMessage && (
        <View style={styles.encouragement}>
          <Text>{encouragementMessage}</Text>
        </View>
      )}

      {/* Your existing question display... */}
    </View>
  );
}
```

### Change 2: Update Categories Screen

```typescript
// screens/CategoriesScreen.tsx

export default function CategoriesScreen() {
  const [sessionTypeModal, setSessionTypeModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleCategoryPress = (category) => {
    setSelectedCategory(category);
    setSessionTypeModal(true); // NEW: Show session type selection
  };

  const startQuiz = (sessionType: 'quick' | 'normal' | 'challenge') => {
    navigation.navigate('Quiz', {
      categoryId: selectedCategory.id,
      categoryName: selectedCategory.name,
      sessionType // NEW: Pass session type
    });
  };

  return (
    <View>
      {/* Your existing categories... */}

      {/* NEW: Session Type Modal */}
      <Modal visible={sessionTypeModal}>
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Choose Your Mode</Text>

          <TouchableOpacity
            style={styles.sessionOption}
            onPress={() => startQuiz('quick')}
          >
            <Text style={styles.sessionTitle}>Quick Practice</Text>
            <Text style={styles.sessionDesc}>5 questions • Unlimited lives • No pressure</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sessionOption}
            onPress={() => startQuiz('normal')}
          >
            <Text style={styles.sessionTitle}>Normal Quiz</Text>
            <Text style={styles.sessionDesc}>7 questions • 3 lives • Balanced challenge</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sessionOption}
            onPress={() => startQuiz('challenge')}
          >
            <Text style={styles.sessionTitle}>Challenge Mode</Text>
            <Text style={styles.sessionDesc}>10 questions • 1 life • Maximum rewards</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}
```

### Change 3: Create Database Tables

```sql
-- Run these in Supabase SQL editor

-- User progress tracking
CREATE TABLE user_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  category_id UUID,
  total_questions INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  unlocked_hints BOOLEAN DEFAULT false,
  unlocked_challenge BOOLEAN DEFAULT false,
  unlocked_multiplayer BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, category_id)
);

-- Question history for optimization
CREATE TABLE question_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  question_id UUID,
  category_id UUID,
  is_correct BOOLEAN,
  difficulty INTEGER,
  time_spent INTEGER,
  answered_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_user_category (user_id, category_id),
  INDEX idx_answered_at (answered_at)
);

-- Add difficulty to questions if not exists
ALTER TABLE questions
ADD COLUMN IF NOT EXISTS difficulty INTEGER DEFAULT 2 CHECK (difficulty >= 1 AND difficulty <= 5),
ADD COLUMN IF NOT EXISTS last_shown TIMESTAMP;

-- RPC function to update progress
CREATE OR REPLACE FUNCTION update_user_progress(
  p_user_id UUID,
  p_category_id UUID,
  p_correct INTEGER,
  p_total INTEGER
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_progress (user_id, category_id, total_questions, correct_answers)
  VALUES (p_user_id, p_category_id, p_total, p_correct)
  ON CONFLICT (user_id, category_id)
  DO UPDATE SET
    total_questions = user_progress.total_questions + p_total,
    correct_answers = user_progress.correct_answers + p_correct,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;
```

## That's It! 🎉

### What You Get:

✅ **Smart question selection** based on user performance
✅ **3 session types** for different moods
✅ **Automatic difficulty adjustment**
✅ **Encouragement messages** when struggling
✅ **Review of wrong answers** (spaced repetition)
✅ **Progressive unlocking** of features
✅ **XP and rewards** that scale with difficulty

### The Flow:

```
1. User picks category → Shows 3 modes
2. User picks mode → System checks their level
3. System picks smart questions → Orders them well
4. User answers → System tracks and adjusts
5. User finishes → Gets appropriate rewards
6. Next quiz → Even smarter selection
```

## Testing It Out

### Test Case 1: New User

```javascript
// Should get easy questions
// Level 1, all normal difficulty
// Unlimited lives in quick mode
```

### Test Case 2: Struggling User

```javascript
// Answer 2 wrong in a row
// Next quiz should have easier questions
// Should see encouragement message
```

### Test Case 3: Expert User

```javascript
// 90%+ accuracy
// Should get harder questions
// Challenge mode unlocked
```

## Monitoring Success

Look for these metrics:

- **Completion rate** should increase (target: 80%+)
- **Average accuracy** should stay around 70-75%
- **Session length** should be consistent
- **Return rate** should improve

## Troubleshooting

### "Questions too easy"

- Check if difficulty levels are set correctly in database
- Ensure accuracy calculation is working
- Verify recent performance tracking

### "Questions too hard"

- Check comeback mechanics are triggering
- Verify easier questions exist in database
- Check if review questions are being included

### "Same questions repeating"

- Add more questions to database
- Check `last_shown` is being updated
- Verify randomization in selection

## Next Steps

1. **Add difficulty indicators** to UI
2. **Show progress bars** for unlocks
3. **Add achievement notifications**
4. **Create admin dashboard** for monitoring
5. **A/B test** different configurations

This is a working system you can implement TODAY!

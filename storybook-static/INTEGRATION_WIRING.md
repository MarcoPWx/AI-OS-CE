# QuizMentor Integration Wiring – Quiz Flow, Delivery, Gamification

Last Updated: August 27, 2025

## Scope

- Wire quiz screens to real services: question delivery (online/offline) + gamification (XP, combo, quests)
- Keep behavior deterministic and transparent

## Files Touched

- `src/screens/QuizScreenFrictionless.tsx`
  - Uses `questionDelivery.getCategories()` and `getQuestions()`
  - Normalizes question shape for UI
  - Falls back to local `devQuizData` on failures
  - Invokes `GamificationService` on correct/wrong answers and on results

## Question Delivery

- Service: `src/services/questionDelivery.ts`
- Flow on load:
  1. Fetch categories → match by name (case-insensitive) to get `categoryId`
  2. Fetch questions `{ limit: 10, random: true }`
  3. Normalize → `[ { id, question, options, correctAnswer, explanation, difficulty } ]`
  4. Fallback: local `devQuizData` if network or supabase unavailable

## Gamification

- Service: `src/services/gamification.ts`
- On correct: `incrementCombo()` → `awardXP(10, 'quiz_answer_correct')`
- On wrong: `breakCombo()`
- On results: `updateQuestProgress('quiz_complete', 1)`
- Next wiring steps (pending):
  - Show AchievementPopup on unlocks
  - Hook DailyBonusModal at entry (if available)
  - Persist session results to analytics (Supabase)

## API Endpoints (context)

- Route stubs available in `api/src/routes`:
  - `quiz.routes.ts` – `/api/quiz/session`, `/api/quiz/questions`, `/api/quiz/answer`, `/api/quiz/leaderboard`
  - `user.routes.ts` – `/api/users/me`, `/api/users/export`, `DELETE /api/users/me`
  - `analytics.routes.ts` – `/api/analytics/event`

## Testing Plan (follow-up)

- Unit: normalize function, delivery fallback, gamification triggers
- Integration: quiz flow with delivery + XP updates
- E2E: answer set → score/XP/streak visible → results recorded

## Notes

- Reanimated is planned; current animations are RN Animated + Lottie + Haptics
- Supabase URL/keys are placeholders; set via env before production

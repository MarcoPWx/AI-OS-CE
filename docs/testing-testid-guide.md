# Data-TestID Implementation Guide

## Overview

This guide provides best practices for adding `data-testid` attributes to React Native components to improve E2E test reliability and maintainability.

## Why Use Data-TestID?

- **Stable Selectors**: Unlike class names or component structure, test IDs don't change with styling updates
- **Explicit Testing Intent**: Clear indication of which elements are used in tests
- **Better Test Maintenance**: Tests don't break due to UI refactoring
- **Improved Debugging**: Easier to identify elements in test failures

## Implementation Guidelines

### 1. Naming Convention

Use kebab-case with descriptive, hierarchical naming:

```typescript
// Good
testID = 'login-email-input';
testID = 'quiz-category-card';
testID = 'leaderboard-user-rank';

// Bad
testID = 'input1';
testID = 'btn';
testID = 'test';
```

### 2. Component Hierarchy

Follow a parent-child naming structure:

```typescript
// Parent component
<View testID="quiz-screen">
  {/* Child components */}
  <View testID="quiz-header">
    <Text testID="quiz-title">Quiz Title</Text>
    <Text testID="quiz-timer">05:00</Text>
  </View>

  <View testID="quiz-content">
    <Text testID="quiz-question">Question text</Text>
    {answers.map((answer, index) => (
      <TouchableOpacity
        key={answer.id}
        testID={`quiz-answer-${index}`}
      >
        <Text testID={`quiz-answer-text-${index}`}>{answer.text}</Text>
      </TouchableOpacity>
    ))}
  </View>
</View>
```

### 3. Dynamic Elements

For lists and dynamic content, include indices or IDs:

```typescript
// Using index for ordered lists
{items.map((item, index) => (
  <View key={item.id} testID={`list-item-${index}`}>
    <Text testID={`list-item-title-${index}`}>{item.title}</Text>
  </View>
))}

// Using unique IDs when available
{categories.map(category => (
  <TouchableOpacity
    key={category.id}
    testID={`category-${category.id}`}
  >
    <Text testID={`category-name-${category.id}`}>
      {category.name}
    </Text>
  </TouchableOpacity>
))}
```

### 4. Form Elements

Always add test IDs to form inputs and buttons:

```typescript
<TestableInput
  testID="signup-email-input"
  label="Email"
  value={email}
  onChangeText={setEmail}
  error={emailError}
/>

<TestableInput
  testID="signup-password-input"
  label="Password"
  secureTextEntry
  value={password}
  onChangeText={setPassword}
  error={passwordError}
/>

<TestableButton
  testID="signup-submit-button"
  title="Sign Up"
  onPress={handleSubmit}
  loading={isSubmitting}
/>
```

### 5. State-Dependent Elements

Include state information in test IDs or attributes:

```typescript
<View
  testID="loading-spinner"
  accessibilityState={{ busy: true }}
  style={{ display: isLoading ? 'flex' : 'none' }}
/>

<TouchableOpacity
  testID="quiz-pause-button"
  data-paused={isPaused}
  onPress={togglePause}
>
  <Text>{isPaused ? 'Resume' : 'Pause'}</Text>
</TouchableOpacity>
```

## Component Examples

### Authentication Screen

```typescript
export const LoginScreen = () => {
  return (
    <View testID="login-screen">
      <View testID="login-header">
        <Text testID="login-title">Welcome Back</Text>
      </View>

      <View testID="login-form">
        <TestableInput
          testID="email-input"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />

        <TestableInput
          testID="password-input"
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TestableButton
          testID="login-button"
          title="Login"
          onPress={handleLogin}
        />

        <TouchableOpacity testID="forgot-password-link">
          <Text>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity testID="signup-link">
          <Text>Create Account</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <Text testID="error-message">{error}</Text>
      )}
    </View>
  );
};
```

### Quiz Component

```typescript
export const QuizQuestion = ({ question, onAnswer }) => {
  return (
    <View testID="quiz-question-container">
      <View testID="question-header">
        <Text testID="question-number">
          Question {question.number} of {question.total}
        </Text>
        <Text testID="question-category">{question.category}</Text>
      </View>

      <Text testID="question-text">{question.text}</Text>

      <View testID="answer-options">
        {question.options.map((option, index) => (
          <TouchableOpacity
            key={option.id}
            testID={`answer-option-${index}`}
            data-test-correct={option.isCorrect} // For test mode only
            onPress={() => onAnswer(option.id)}
          >
            <Text testID={`answer-text-${index}`}>
              {option.text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TestableButton
        testID="submit-answer-button"
        title="Submit"
        onPress={handleSubmit}
        disabled={!selectedAnswer}
      />
    </View>
  );
};
```

### Leaderboard Component

```typescript
export const LeaderboardList = ({ entries, currentUserId }) => {
  return (
    <ScrollView testID="leaderboard-list">
      {entries.map((entry, index) => (
        <View
          key={entry.userId}
          testID={`leaderboard-entry-${index}`}
          data-current-user={entry.userId === currentUserId}
        >
          <Text testID={`leaderboard-rank-${index}`}>
            {entry.rank}
          </Text>
          <Image
            testID={`leaderboard-avatar-${index}`}
            source={{ uri: entry.avatar }}
          />
          <Text testID={`leaderboard-username-${index}`}>
            {entry.username}
          </Text>
          <Text testID={`leaderboard-score-${index}`}>
            {entry.score} XP
          </Text>
        </View>
      ))}
    </ScrollView>
  );
};
```

## E2E Test Usage

### Playwright Example

```typescript
test('should complete quiz successfully', async ({ page }) => {
  // Navigate to quiz
  await page.click('[data-testid="quiz-tab"]');
  await page.click('[data-testid="category-science"]');

  // Start quiz
  await page.click('[data-testid="start-quiz-button"]');

  // Answer questions
  for (let i = 0; i < 5; i++) {
    await page.waitForSelector('[data-testid="question-text"]');
    await page.click('[data-testid="answer-option-0"]');
    await page.click('[data-testid="submit-answer-button"]');

    if (i < 4) {
      await page.click('[data-testid="next-question-button"]');
    }
  }

  // Complete quiz
  await page.click('[data-testid="finish-quiz-button"]');

  // Verify results
  await expect(page.locator('[data-testid="quiz-results"]')).toBeVisible();
  await expect(page.locator('[data-testid="final-score"]')).toContainText(/\d+/);
});
```

### React Native Testing Library Example

```typescript
describe('LoginScreen', () => {
  it('should show validation errors', async () => {
    const { getByTestId, findByTestId } = render(<LoginScreen />);

    const loginButton = getByTestId('login-button');
    fireEvent.press(loginButton);

    const emailError = await findByTestId('email-input-error');
    const passwordError = await findByTestId('password-input-error');

    expect(emailError).toHaveTextContent('Email is required');
    expect(passwordError).toHaveTextContent('Password is required');
  });
});
```

## Best Practices

### Do's ✅

- Add test IDs to all interactive elements
- Use descriptive, semantic names
- Follow consistent naming conventions
- Document test ID patterns in component files
- Add test IDs during component development
- Use test IDs for critical user paths

### Don'ts ❌

- Don't use test IDs for styling
- Don't expose sensitive information in test IDs
- Don't use random or generated test IDs
- Don't forget to add test IDs to dynamic content
- Don't use test IDs in production for non-testing purposes

## Maintenance

### Regular Audits

1. Review test ID usage quarterly
2. Remove unused test IDs
3. Update test IDs when components change
4. Ensure consistency across the codebase

### Documentation

Keep a registry of critical test IDs:

```typescript
// testIds.constants.ts
export const TEST_IDS = {
  // Authentication
  LOGIN_SCREEN: 'login-screen',
  LOGIN_EMAIL_INPUT: 'email-input',
  LOGIN_PASSWORD_INPUT: 'password-input',
  LOGIN_BUTTON: 'login-button',

  // Quiz
  QUIZ_SCREEN: 'quiz-screen',
  QUIZ_START_BUTTON: 'start-quiz-button',
  QUIZ_QUESTION: 'quiz-question',
  QUIZ_ANSWER_OPTION: (index: number) => `answer-option-${index}`,

  // Navigation
  HOME_TAB: 'home-tab',
  QUIZ_TAB: 'quiz-tab',
  PROFILE_TAB: 'profile-tab',
};
```

## Tools and Utilities

### Test ID Validator

```typescript
// Utility to validate test IDs follow conventions
export const validateTestId = (testId: string): boolean => {
  const pattern = /^[a-z]+(-[a-z0-9]+)*$/;
  return pattern.test(testId);
};
```

### Test ID Generator

```typescript
// Helper to generate consistent test IDs
export const generateTestId = (component: string, element: string, index?: number): string => {
  const base = `${component}-${element}`;
  return index !== undefined ? `${base}-${index}` : base;
};
```

## Migration Strategy

For existing components without test IDs:

1. **Identify Critical Paths**: Start with authentication, quiz, and payment flows
2. **Add Incrementally**: Add test IDs as you write new tests
3. **Update Tests**: Replace fragile selectors with test IDs
4. **Document Changes**: Update component documentation
5. **Review PR**: Ensure test IDs are added in code reviews

## Conclusion

Proper implementation of data-testid attributes significantly improves test reliability and maintenance. Follow these guidelines to create a robust testing infrastructure that scales with your application.

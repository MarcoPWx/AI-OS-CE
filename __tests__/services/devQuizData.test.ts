import {
  devQuizData,
  getRandomQuestions,
  getDailyChallenge,
  Category,
  Question,
} from '../../services/devQuizData';

describe('DevQuizData Service', () => {
  describe('devQuizData', () => {
    it('should contain 8 categories', () => {
      expect(devQuizData).toHaveLength(8);
    });

    it('should have valid category structure', () => {
      devQuizData.forEach((category) => {
        expect(category).toHaveProperty('id');
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('icon');
        expect(category).toHaveProperty('color');
        expect(category).toHaveProperty('description');
        expect(category).toHaveProperty('questions');
        expect(Array.isArray(category.questions)).toBe(true);
        expect(category.questions.length).toBeGreaterThan(0);
      });
    });

    it('should have valid question structure', () => {
      devQuizData.forEach((category) => {
        category.questions.forEach((question) => {
          expect(question).toHaveProperty('id');
          expect(question).toHaveProperty('question');
          expect(question).toHaveProperty('options');
          expect(question).toHaveProperty('correct');
          expect(question).toHaveProperty('difficulty');
          expect(question).toHaveProperty('explanation');

          // Validate options
          expect(Array.isArray(question.options)).toBe(true);
          expect(question.options).toHaveLength(4);

          // Validate correct answer index
          expect(question.correct).toBeGreaterThanOrEqual(0);
          expect(question.correct).toBeLessThan(4);

          // Validate difficulty
          expect(['easy', 'medium', 'hard']).toContain(question.difficulty);
        });
      });
    });

    it('should have unique question IDs within each category', () => {
      devQuizData.forEach((category) => {
        const questionIds = category.questions.map((q) => q.id);
        const uniqueIds = new Set(questionIds);
        expect(uniqueIds.size).toBe(questionIds.length);
      });
    });
  });

  describe('getRandomQuestions', () => {
    it('should return requested number of questions', () => {
      const questions = getRandomQuestions('javascript', 5);
      expect(questions).toHaveLength(5);
    });

    it('should return questions from the specified category', () => {
      const categoryId = 'javascript';
      const questions = getRandomQuestions(categoryId, 3);

      const jsCategory = devQuizData.find((c) => c.id === categoryId);
      const jsQuestionIds = jsCategory?.questions.map((q) => q.id) || [];

      questions.forEach((question) => {
        expect(jsQuestionIds).toContain(question.id);
      });
    });

    it('should return all questions if requested count exceeds available', () => {
      const questions = getRandomQuestions('javascript', 100);
      const jsCategory = devQuizData.find((c) => c.id === 'javascript');
      expect(questions.length).toBe(jsCategory?.questions.length);
    });

    it('should return empty array for invalid category', () => {
      const questions = getRandomQuestions('invalid-category', 5);
      expect(questions).toEqual([]);
    });

    it('should return different questions on subsequent calls', () => {
      const questions1 = getRandomQuestions('javascript', 5);
      const questions2 = getRandomQuestions('javascript', 5);

      const ids1 = questions1.map((q) => q.id).sort();
      const ids2 = questions2.map((q) => q.id).sort();

      // They might occasionally be the same due to randomness,
      // but most of the time they should differ
      const areDifferent = JSON.stringify(ids1) !== JSON.stringify(ids2);

      // Run multiple times to ensure randomness
      let differentCount = 0;
      for (let i = 0; i < 10; i++) {
        const q1 = getRandomQuestions('javascript', 5);
        const q2 = getRandomQuestions('javascript', 5);
        if (
          JSON.stringify(q1.map((q) => q.id).sort()) !== JSON.stringify(q2.map((q) => q.id).sort())
        ) {
          differentCount++;
        }
      }

      // At least 50% should be different
      expect(differentCount).toBeGreaterThan(5);
    });

    it('should handle edge case of 0 questions', () => {
      const questions = getRandomQuestions('javascript', 0);
      expect(questions).toEqual([]);
    });

    it('should handle negative count gracefully', () => {
      const questions = getRandomQuestions('javascript', -5);
      expect(questions).toEqual([]);
    });
  });

  describe('getDailyChallenge', () => {
    it('should return a valid category', () => {
      const challenge = getDailyChallenge();
      expect(challenge).toBeDefined();
      expect(devQuizData).toContainEqual(challenge);
    });

    it('should return the same challenge for the same date', () => {
      const challenge1 = getDailyChallenge();
      const challenge2 = getDailyChallenge();
      expect(challenge1).toEqual(challenge2);
    });

    it('should have a valid category structure', () => {
      const challenge = getDailyChallenge();
      expect(challenge).toHaveProperty('id');
      expect(challenge).toHaveProperty('name');
      expect(challenge).toHaveProperty('questions');
      expect(Array.isArray(challenge.questions)).toBe(true);
    });

    it('should cycle through all categories', () => {
      // Mock different dates to test cycling
      const originalDate = Date;
      const challenges = new Set();

      for (let i = 0; i < 10; i++) {
        // Mock date
        const mockDate = new Date(2024, 0, i + 1);
        global.Date = jest.fn(() => mockDate) as any;
        global.Date.now = originalDate.now;

        const challenge = getDailyChallenge();
        challenges.add(challenge.id);
      }

      // Restore original Date
      global.Date = originalDate;

      // Should have multiple different challenges
      expect(challenges.size).toBeGreaterThan(1);
    });
  });

  describe('Question Content Validation', () => {
    it('should have appropriate code snippets for programming questions', () => {
      const jsCategory = devQuizData.find((c) => c.id === 'javascript');
      const codeQuestions = jsCategory?.questions.filter((q) => q.codeSnippet) || [];

      expect(codeQuestions.length).toBeGreaterThan(0);

      codeQuestions.forEach((question) => {
        expect(question.codeSnippet).toBeTruthy();
        expect(typeof question.codeSnippet).toBe('string');
      });
    });

    it('should have explanations for all questions', () => {
      devQuizData.forEach((category) => {
        category.questions.forEach((question) => {
          expect(question.explanation).toBeTruthy();
          expect(typeof question.explanation).toBe('string');
          expect(question.explanation.length).toBeGreaterThan(10);
        });
      });
    });

    it('should have diverse difficulty levels', () => {
      devQuizData.forEach((category) => {
        const difficulties = category.questions.map((q) => q.difficulty);
        const uniqueDifficulties = new Set(difficulties);

        // Each category should have at least 2 difficulty levels
        expect(uniqueDifficulties.size).toBeGreaterThanOrEqual(2);
      });
    });

    it('should have reasonable question lengths', () => {
      devQuizData.forEach((category) => {
        category.questions.forEach((question) => {
          expect(question.question.length).toBeGreaterThan(10);
          expect(question.question.length).toBeLessThan(500);

          question.options.forEach((option) => {
            expect(option.length).toBeGreaterThan(0);
            expect(option.length).toBeLessThan(200);
          });
        });
      });
    });
  });

  describe('Category Metadata', () => {
    it('should have unique category IDs', () => {
      const categoryIds = devQuizData.map((c) => c.id);
      const uniqueIds = new Set(categoryIds);
      expect(uniqueIds.size).toBe(categoryIds.length);
    });

    it('should have valid hex color codes', () => {
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

      devQuizData.forEach((category) => {
        expect(category.color).toMatch(hexColorRegex);
      });
    });

    it('should have appropriate icons', () => {
      devQuizData.forEach((category) => {
        expect(category.icon).toBeTruthy();
        expect(category.icon.length).toBeGreaterThan(0);
      });
    });

    it('should have meaningful descriptions', () => {
      devQuizData.forEach((category) => {
        expect(category.description).toBeTruthy();
        expect(category.description.length).toBeGreaterThan(20);
        expect(category.description.length).toBeLessThan(200);
      });
    });
  });
});

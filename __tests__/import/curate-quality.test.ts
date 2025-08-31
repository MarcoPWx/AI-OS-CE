import { curate } from '../../scripts/curate-quality.js';

describe('curate-quality', () => {
  it('filters by aggregate/readability and excludes flagged AI items', () => {
    const questions = [
      {
        id: 'q1',
        category: 'catA',
        text: 'Q1',
        options: ['a', 'b'],
        correct_answer: 1,
        explanation: '',
        difficulty: 'easy',
      },
      {
        id: 'q2',
        category: 'catA',
        text: 'Q2',
        options: ['a', 'b'],
        correct_answer: 1,
        explanation: '',
        difficulty: 'easy',
      },
      {
        id: 'q3',
        category: 'catB',
        text: 'Q3',
        options: ['a', 'b'],
        correct_answer: 1,
        explanation: '',
        difficulty: 'easy',
      },
      {
        id: 'q4',
        category: 'catB',
        text: 'Q4',
        options: ['a', 'b'],
        correct_answer: 1,
        explanation: '',
        difficulty: 'easy',
      },
    ];

    const quality = {
      total: 4,
      results: [
        { id: 'q1', readability: 0.3, correct_in_range: 1, aggregate: 0.7 },
        { id: 'q2', readability: 0.1, correct_in_range: 1, aggregate: 0.8 }, // fails readability
        {
          id: 'q3',
          readability: 0.9,
          correct_in_range: 1,
          aggregate: 0.65,
          ai_review: { flags: ['offensive'], score: 0.9 },
        }, // excluded by flag
        { id: 'q4', readability: 0.5, correct_in_range: 1, aggregate: 0.61 }, // included
      ],
    } as any;

    const curated = curate(questions as any, quality as any, {
      minScore: 0.6,
      minReadability: 0.2,
      excludeFlags: ['offensive', 'unclear'],
      maxPerCategory: 0,
    });

    const ids = curated.map((q: any) => q.id);
    expect(ids).toEqual(['q1', 'q4']);
  });

  it('respects per-category cap and prefers higher score', () => {
    const questions = [
      {
        id: 'c1',
        category: 'catC',
        text: 'C1',
        options: ['a', 'b'],
        correct_answer: 1,
        explanation: '',
        difficulty: 'easy',
      },
      {
        id: 'c2',
        category: 'catC',
        text: 'C2',
        options: ['a', 'b'],
        correct_answer: 1,
        explanation: '',
        difficulty: 'easy',
      },
      {
        id: 'd1',
        category: 'catD',
        text: 'D1',
        options: ['a', 'b'],
        correct_answer: 1,
        explanation: '',
        difficulty: 'easy',
      },
    ];

    const quality = {
      total: 3,
      results: [
        { id: 'c1', readability: 0.9, correct_in_range: 1, aggregate: 0.75 },
        { id: 'c2', readability: 0.9, correct_in_range: 1, aggregate: 0.82 },
        { id: 'd1', readability: 0.9, correct_in_range: 1, aggregate: 0.7 },
      ],
    } as any;

    const curated = curate(questions as any, quality as any, {
      minScore: 0.6,
      minReadability: 0.2,
      excludeFlags: [],
      maxPerCategory: 1,
    });

    const byCategory: Record<string, string[]> = {};
    curated.forEach((q: any) => {
      byCategory[q.category] = byCategory[q.category] || [];
      byCategory[q.category].push(q.id);
    });

    expect(byCategory['catC']).toEqual(['c2']); // higher aggregate kept
    expect(byCategory['catD']).toEqual(['d1']);
  });
});

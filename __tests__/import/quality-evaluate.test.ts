import { evaluate } from '../../scripts/quality-evaluate.js';

describe('Quality evaluator', () => {
  it('scores a simple question with valid bounds', () => {
    const q = {
      text: 'What is 2 + 2?',
      options: ['3', '4', '5', '22'],
      correct_answer: 1,
      explanation: '2 + 2 equals 4.',
    };
    const r = evaluate(q);
    expect(r.correct_in_range).toBe(1);
    expect(r.option_uniqueness).toBeGreaterThan(0.5);
    expect(r.readability).toBeGreaterThan(0);
    expect(r.aggregate).toBeGreaterThan(0);
  });
});

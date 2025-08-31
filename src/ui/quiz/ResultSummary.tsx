// src/ui/quiz/ResultSummary.tsx
import React from 'react';

export type ResultSummaryProps = {
  score: number;
  total: number;
  percent: number;
  xp: number;
  maxStreak: number;
};

export function ResultSummary({ score, total, percent, xp, maxStreak }: ResultSummaryProps) {
  return (
    <div
      role="region"
      aria-label="Result summary"
      data-testid="result-summary"
      style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: 12 }}
    >
      <div role="heading" aria-level={3}>
        <strong>Results</strong>
      </div>
      <div data-testid="result-score">
        Score: {score}/{total} ({percent}%)
      </div>
      <div data-testid="result-xp">XP: {xp}</div>
      <div data-testid="result-streak">Max Streak: {maxStreak}</div>
    </div>
  );
}

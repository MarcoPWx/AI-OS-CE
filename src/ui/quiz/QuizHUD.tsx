// src/ui/quiz/QuizHUD.tsx
import React from 'react';

export type QuizHUDProps = {
  index: number;
  total: number;
  score: number;
  xp: number;
  streak: number;
  maxStreak: number;
};

export function QuizHUD({ index, total, score, xp, streak, maxStreak }: QuizHUDProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
      }}
    >
      <div>
        <strong>Progress:</strong> {Math.min(index + 1, total)} / {total}
      </div>
      <div>
        <span style={{ marginRight: 10 }} data-testid="hud-score">
          <strong>Score:</strong> {score}
        </span>
        <span style={{ marginRight: 10 }} data-testid="hud-xp">
          <strong>XP:</strong> {xp}
        </span>
        <span data-testid="hud-streak">
          <strong>Streak:</strong> {streak} (Max {maxStreak})
        </span>
      </div>
    </div>
  );
}

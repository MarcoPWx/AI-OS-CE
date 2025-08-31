// src/ui/quiz/QuizScreen.tsx
import React from 'react';
import type { SessionSnapshot } from '@/core/quiz/types';
import { QuizHUD } from './QuizHUD';
import { QuizQuestion } from './QuizQuestion';
import { Button } from '@/ui/designSystem/components/Button';
import { ProgressBar } from '@/ui/designSystem/components/ProgressBar';
import { Timer } from '@/ui/designSystem/components/Timer';
import { ResultSummary } from '@/ui/quiz/ResultSummary';

export type QuizScreenProps = {
  session: SessionSnapshot;
  onSelect: (index: number) => void;
  onNext: () => void;
  reveal?: boolean;
  locked?: boolean;
  secondsLeft?: number;
  totalSeconds?: number;
  showProgress?: boolean;
};

export function QuizScreen({
  session,
  onSelect,
  onNext,
  reveal = false,
  locked = false,
  secondsLeft,
  totalSeconds,
  showProgress = true,
}: QuizScreenProps) {
  return (
    <div>
      <QuizHUD
        index={session.index}
        total={session.total}
        score={session.score}
        xp={session.xp}
        streak={session.streak}
        maxStreak={session.maxStreak}
      />
      {showProgress && (
        <div style={{ marginBottom: 8 }}>
          <ProgressBar percent={((session.index + 1) / Math.max(1, session.total)) * 100} />
        </div>
      )}
      {typeof secondsLeft === 'number' && typeof totalSeconds === 'number' && (
        <div style={{ marginBottom: 8 }}>
          <Timer secondsLeft={secondsLeft} totalSeconds={totalSeconds} />
        </div>
      )}
      {session.state === 'in_progress' && session.current && (
        <QuizQuestion
          question={session.current.text}
          options={session.current.options}
          selectedIndex={session.answers[session.index]?.selectedIndex ?? null}
          locked={locked}
          revealCorrect={reveal}
          correctIndex={session.current.correctIndex}
          onSelect={onSelect}
        />
      )}
      {session.state === 'in_progress' && (
        <div style={{ marginTop: 12 }}>
          <Button data-testid="next-button" onClick={onNext}>
            Next
          </Button>
        </div>
      )}
      {session.state === 'completed' && (
        <div style={{ marginTop: 12 }}>
          <ResultSummary
            score={session.score}
            total={session.total}
            percent={session.total > 0 ? Math.round((session.score / session.total) * 100) : 0}
            xp={session.xp}
            maxStreak={session.maxStreak}
          />
        </div>
      )}
    </div>
  );
}

// src/stories/QuizEngineSandbox.stories.tsx
import React, { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useGameStore } from '@/stores/gameStore';
import type { Difficulty } from '@/core/quiz/types';
import { getResult } from '@/core/quiz/engine';
import { Button } from '@/ui/designSystem/components/Button';

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <div style={{ width: 140, fontSize: 12, opacity: 0.8 }}>{label}</div>
      <div>{children}</div>
    </label>
  );
}

function QuizEngineSandbox() {
  const { session, start, answer, next, reset } = useGameStore();
  const [topic, setTopic] = useState('math');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');

  const result = useMemo(
    () => (session && session.state === 'completed' ? getResult(session) : null),
    [session],
  );

  return (
    <div style={{ padding: 16, display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16 }}>
      <div>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Controls</div>
        <Row label="Topic">
          <input value={topic} onChange={(e) => setTopic(e.target.value)} />
        </Row>
        <Row label="Difficulty">
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)}>
            <option>easy</option>
            <option>medium</option>
            <option>hard</option>
          </select>
        </Row>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <Button onClick={() => start(topic, difficulty)}>Start</Button>
          <Button variant="ghost" onClick={() => reset()}>
            Reset
          </Button>
        </div>
      </div>

      <div>
        {!session && <div>Start a session to begin.</div>}
        {session && (
          <div style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <strong>Session:</strong> {session.id}
              </div>
              <div>
                <span style={{ marginRight: 12 }}>
                  <strong>Score:</strong> {session.score}/{session.total}
                </span>
                <span style={{ marginRight: 12 }}>
                  <strong>XP:</strong> {session.xp}
                </span>
                <span>
                  <strong>Streak:</strong> {session.streak} (Max {session.maxStreak})
                </span>
              </div>
            </div>

            {session.state === 'in_progress' && session.current && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontWeight: 600 }}>
                  {session.index + 1}. {session.current.text}
                </div>
                <ul style={{ listStyle: 'none', padding: 0, marginTop: 8 }}>
                  {session.current.options.map((opt, idx) => (
                    <li key={idx} style={{ marginBottom: 6 }}>
                      <Button variant="ghost" onClick={() => answer(idx)}>
                        {opt}
                      </Button>
                    </li>
                  ))}
                </ul>
                <div style={{ marginTop: 8 }}>
                  <Button onClick={() => next()}>Next</Button>
                </div>
              </div>
            )}

            {session.state === 'completed' && result && (
              <div style={{ marginTop: 12 }}>
                <div>
                  <strong>Completed</strong>
                </div>
                <div>
                  Score: {result.score}/{result.total} ({result.percent}%)
                </div>
                <div>
                  XP: {result.xp} • Max Streak: {result.maxStreak}
                </div>
                <div style={{ marginTop: 8 }}>
                  <details>
                    <summary>Answers</summary>
                    <pre style={{ fontFamily: 'monospace' }}>
                      {JSON.stringify(result.answers, null, 2)}
                    </pre>
                  </details>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const meta = {
  title: 'Dev/Quiz Engine Sandbox',
  component: QuizEngineSandbox,
  parameters: {
    helpDocs: [
      { href: '?path=/story/specs-quiz-flows-end-to-end--page', title: 'Quiz Flows — End-to-End' },
      { href: '?path=/story/specs-service-catalog--page#express-api', title: 'Service Catalog' },
    ],
    docs: {
      description: {
        component:
          'Interactive sandbox for the core quiz engine: start sessions, answer questions, and review scoring/XP/streak behavior.',
      },
    },
  },
} satisfies Meta<typeof QuizEngineSandbox>;

export default meta;

export const Default: StoryObj<typeof meta> = {};

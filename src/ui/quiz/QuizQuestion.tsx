// src/ui/quiz/QuizQuestion.tsx
import React from 'react';

export type QuizQuestionProps = {
  question: string;
  options: string[];
  selectedIndex?: number | null;
  locked?: boolean;
  revealCorrect?: boolean;
  correctIndex?: number;
  onSelect?: (index: number) => void;
};

export function QuizQuestion({
  question,
  options,
  selectedIndex = null,
  locked = false,
  revealCorrect = false,
  correctIndex,
  onSelect,
}: QuizQuestionProps) {
  function onKeyDown(e: React.KeyboardEvent<HTMLUListElement>) {
    if (!onSelect || locked) return;
    const key = e.key;
    const max = options.length - 1;
    let idx = selectedIndex ?? 0;
    if (key === 'ArrowDown' || key === 'ArrowRight') {
      e.preventDefault();
      idx = Math.min(max, idx + 1);
      onSelect(idx);
    } else if (key === 'ArrowUp' || key === 'ArrowLeft') {
      e.preventDefault();
      idx = Math.max(0, idx - 1);
      onSelect(idx);
    } else if (key === 'Home') {
      e.preventDefault();
      onSelect(0);
    } else if (key === 'End') {
      e.preventDefault();
      onSelect(max);
    } else if (key === 'Enter' || key === ' ') {
      // confirm current selection
      e.preventDefault();
      onSelect(idx);
    }
  }
  return (
    <div>
      <div role="heading" aria-level={3} style={{ fontWeight: 700, marginBottom: 8 }}>
        {question}
      </div>
      <ul
        role="listbox"
        aria-label="options"
        tabIndex={0}
        onKeyDown={onKeyDown}
        style={{ listStyle: 'none', padding: 0 }}
      >
        {options.map((opt, idx) => {
          const isSelected = selectedIndex === idx;
          const isCorrect = revealCorrect && correctIndex === idx;
          const bg = isCorrect
            ? 'rgba(0,208,132,0.15)'
            : isSelected
              ? 'rgba(255,255,255,0.08)'
              : 'transparent';
          const border = isCorrect ? '1px solid #00d084' : '1px solid rgba(255,255,255,0.12)';
          return (
            <li key={idx} style={{ marginBottom: 8 }}>
              <button
                type="button"
                role="option"
                aria-selected={isSelected}
                data-testid={`question-option-${idx}`}
                {...(isSelected ? { 'data-selected': true } : {})}
                {...(isCorrect ? { 'data-correct': true } : {})}
                aria-pressed={isSelected}
                disabled={locked}
                onClick={() => onSelect && onSelect(idx)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border,
                  background: bg,
                  color: '#d7e0ff',
                  cursor: locked ? 'not-allowed' : 'pointer',
                }}
              >
                {opt}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

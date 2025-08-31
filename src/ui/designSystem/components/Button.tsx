// src/ui/designSystem/components/Button.tsx
import React from 'react';
import { tokens } from '../tokens';

export function Button({
  children,
  variant = 'primary',
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'danger' | 'ghost';
  onClick?: () => void;
  disabled?: boolean;
}) {
  const base: React.CSSProperties = {
    padding: `${tokens.spacing(2)}px ${tokens.spacing(3)}px`,
    borderRadius: tokens.radius,
    border: `1px solid ${tokens.colors.border}`,
    background:
      variant === 'primary'
        ? tokens.colors.accent
        : variant === 'danger'
          ? '#7b1b1b'
          : 'transparent',
    color: variant === 'primary' ? '#00140d' : tokens.colors.fg,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
  };
  return (
    <button style={base} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

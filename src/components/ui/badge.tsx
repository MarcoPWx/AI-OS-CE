// src/components/ui/badge.tsx
import React from 'react';

export const Badge: React.FC<
  React.PropsWithChildren<{
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    className?: string;
  }>
> = ({ children, variant = 'default', className = '' }) => {
  const base = 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold';
  const variants: Record<string, string> = {
    default: 'bg-gray-200 text-gray-800',
    secondary: 'bg-gray-100 text-gray-600',
    destructive: 'bg-red-100 text-red-700',
    outline: 'border border-current text-gray-700',
  };
  return <span className={`${base} ${variants[variant] || ''} ${className}`}>{children}</span>;
};

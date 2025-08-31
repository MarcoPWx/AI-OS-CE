// src/components/ui/button.tsx
import React from 'react';

export const Button: React.FC<
  React.PropsWithChildren<
    {
      variant?: 'default' | 'outline' | 'ghost';
      size?: 'sm' | 'md';
      className?: string;
    } & React.ButtonHTMLAttributes<HTMLButtonElement>
  >
> = ({ children, variant = 'default', size = 'md', className = '', ...rest }) => {
  const base = 'inline-flex items-center justify-center rounded-md font-medium transition-colors';
  const variants: Record<string, string> = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 text-gray-800 hover:bg-gray-50',
    ghost: 'text-gray-800 hover:bg-gray-50',
  };
  const sizes: Record<string, string> = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-sm',
  };
  return (
    <button className={`${base} ${variants[variant] || ''} ${sizes[size]} ${className}`} {...rest}>
      {children}
    </button>
  );
};

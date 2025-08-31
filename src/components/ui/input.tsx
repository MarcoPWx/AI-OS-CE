// src/components/ui/input.tsx
import React from 'react';

export const Input: React.FC<
  {
    className?: string;
    icon?: React.ReactNode;
  } & React.InputHTMLAttributes<HTMLInputElement>
> = ({ className = '', icon, ...rest }) => {
  return (
    <div className={`relative ${className}`}>
      {icon && (
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
      )}
      <input
        className={`w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${icon ? 'pl-8' : ''}`}
        {...rest}
      />
    </div>
  );
};

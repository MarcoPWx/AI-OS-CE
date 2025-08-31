// src/components/ui/card.tsx
import React from 'react';

type DivProps = React.HTMLAttributes<HTMLDivElement>;

export const Card: React.FC<React.PropsWithChildren<DivProps>> = ({
  children,
  className = '',
  ...rest
}) => (
  <div className={`rounded-xl border border-gray-200 bg-white shadow-sm ${className}`} {...rest}>
    {children}
  </div>
);

export const CardHeader: React.FC<React.PropsWithChildren<DivProps>> = ({
  children,
  className = '',
  ...rest
}) => (
  <div className={`border-b border-gray-100 px-4 py-3 ${className}`} {...rest}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.PropsWithChildren<DivProps>> = ({
  children,
  className = '',
  ...rest
}) => (
  <h3 className={`text-lg font-semibold ${className}`} {...rest}>
    {children}
  </h3>
);

export const CardContent: React.FC<React.PropsWithChildren<DivProps>> = ({
  children,
  className = '',
  ...rest
}) => (
  <div className={`px-4 py-3 ${className}`} {...rest}>
    {children}
  </div>
);

// src/components/ui/select.tsx
import React from 'react';

type SelectCtx = { value?: string; onValueChange?: (v: string) => void };
const Ctx = React.createContext<SelectCtx>({});

export const Select: React.FC<
  React.PropsWithChildren<{ value?: string; onValueChange?: (v: string) => void }>
> = ({ value, onValueChange, children }) => {
  return <Ctx.Provider value={{ value, onValueChange }}>{children}</Ctx.Provider>;
};

export const SelectTrigger: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  className = '',
  children,
}) => (
  <div
    className={`inline-flex items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ${className}`}
  >
    {children}
  </div>
);

export const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder }) => {
  const { value } = React.useContext(Ctx);
  return <span className="text-gray-700">{value || placeholder || ''}</span>;
};

export const SelectContent: React.FC<React.PropsWithChildren<{}>> = ({ children }) => (
  <div className="mt-2 rounded-md border border-gray-200 bg-white p-1 shadow-sm">{children}</div>
);

export const SelectItem: React.FC<React.PropsWithChildren<{ value: string }>> = ({
  value,
  children,
}) => {
  const { onValueChange } = React.useContext(Ctx);
  return (
    <div
      role="option"
      className="cursor-pointer rounded px-2 py-1 text-sm hover:bg-gray-100"
      onClick={() => onValueChange && onValueChange(value)}
    >
      {children}
    </div>
  );
};

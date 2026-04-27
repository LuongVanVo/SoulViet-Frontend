import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'ghost' | 'outline';
  children: ReactNode;
}

export const Button = ({ className, variant = 'solid', children, ...props }: ButtonProps) => {
  const variantClasses = {
    solid: 'bg-brand text-white shadow-sm hover:bg-brand-dark',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-50',
    outline: 'border border-gray-200 bg-white text-gray-700 hover:border-brand hover:text-brand'
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-brand/30 disabled:pointer-events-none disabled:opacity-50',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
import type { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export const Card = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn('rounded-3xl border border-gray-100 bg-white shadow-sm', className)} {...props} />;
};
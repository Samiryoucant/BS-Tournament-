import React from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-xl', className)} {...props}>
      {children}
    </div>
  );
}

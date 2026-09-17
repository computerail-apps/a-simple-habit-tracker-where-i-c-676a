import * as React from 'react';
import { cn } from '@/lib/cn';

type Variant = 'info' | 'success' | 'warning' | 'destructive';
const variants: Record<Variant, string> = {
  info: 'border-border bg-muted/30 text-foreground',
  success: 'border-success/25 bg-success/10 text-success-foreground',
  warning: 'border-warning/25 bg-warning/10 text-foreground',
  destructive: 'border-destructive/25 bg-destructive/10 text-foreground',
};

export function Alert({ className, variant = 'info', children, ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: Variant }) {
  return (
    <div role="alert" className={cn('rounded-lg border p-4 text-body animate-in', variants[variant], className)} {...props}>
      {children}
    </div>
  );
}
export function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-1 font-medium leading-none tracking-tight', className)} {...props} />;
}
export function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('text-small text-muted-foreground', className)} {...props} />;
}

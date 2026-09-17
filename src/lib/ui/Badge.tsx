import * as React from 'react';
import { cn } from '@/lib/cn';

type Variant = 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive';
const variants: Record<Variant, string> = {
  default: 'bg-primary/10 text-primary border border-primary/20',
  secondary: 'bg-secondary text-secondary-foreground',
  outline: 'border border-border text-foreground',
  success: 'bg-success/15 text-success border border-success/25',
  warning: 'bg-warning/15 text-warning border border-warning/25',
  destructive: 'bg-destructive/15 text-destructive border border-destructive/25',
};

export function Badge({ className, variant = 'default', ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: Variant }) {
  return <div className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-micro font-medium', variants[variant], className)} {...props} />;
}

import * as React from 'react';
import { cn } from '@/lib/cn';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action, className, ...props }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-surface/40 p-10 text-center animate-in', className)} {...props}>
      {icon ? <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">{icon}</div> : null}
      <div className="space-y-1">
        <h3 className="text-h3">{title}</h3>
        {description ? <p className="text-small text-muted-foreground max-w-sm mx-auto">{description}</p> : null}
      </div>
      {action ? <div className="pt-2">{action}</div> : null}
    </div>
  );
}

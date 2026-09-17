import * as React from 'react';
import { cn } from '@/lib/cn';

export interface NavProps extends React.HTMLAttributes<HTMLElement> {
  brand?: React.ReactNode;
  actions?: React.ReactNode;
  sticky?: boolean;
}

export function Nav({ brand, actions, sticky = true, className, children, ...props }: NavProps) {
  return (
    <header
      className={cn(
        sticky && 'sticky top-0 z-40',
        'border-b border-border bg-background/80 backdrop-blur-md',
        className,
      )}
      {...props}
    >
      <div className="container-page flex h-14 items-center gap-6">
        {brand ? <div className="flex items-center gap-2 font-semibold">{brand}</div> : null}
        <nav className="hidden flex-1 items-center gap-1 md:flex">{children}</nav>
        <div className="ml-auto flex items-center gap-2">{actions}</div>
      </div>
    </header>
  );
}

export function NavLink({ className, active, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { active?: boolean }) {
  return (
    <a
      className={cn(
        'inline-flex h-8 items-center rounded-md px-3 text-small font-medium transition-colors',
        active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
        className,
      )}
      {...props}
    />
  );
}

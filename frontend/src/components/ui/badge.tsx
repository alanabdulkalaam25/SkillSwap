import React from 'react';
import { cn } from '../../lib/utils';

type Variant = 'default' | 'secondary' | 'outline' | 'muted' | 'destructive' | 'success' | 'warning';

const styles: Record<Variant, string> = {
  default: 'border-transparent bg-primary text-primary-foreground',
  secondary: 'border-transparent bg-secondary text-secondary-foreground',
  outline: 'border-border bg-transparent text-foreground',
  muted: 'border-transparent bg-muted text-muted-foreground',
  destructive: 'border-destructive/20 bg-destructive-muted text-destructive',
  success: 'border-success/20 bg-success-muted text-success',
  warning: 'border-warning/20 bg-warning-muted text-warning',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = '', variant = 'default', ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-caption-sm font-medium leading-5 transition-colors',
        styles[variant],
        className
      )}
      {...props}
    />
  )
);
Badge.displayName = 'Badge';

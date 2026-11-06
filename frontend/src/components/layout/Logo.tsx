import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LogoProps {
  to?: string;
  className?: string;
  compact?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ to = '/', className, compact = false }) => (
  <Link
    to={to}
    aria-label="SkillSwap home"
    className={cn(
      'inline-flex items-center gap-2.5 rounded-md text-foreground outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background',
      className
    )}
  >
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
      <ArrowLeftRight className="h-4 w-4" strokeWidth={2.25} />
    </span>
    <span className={cn('text-[0.95rem] font-semibold tracking-[-0.02em]', compact && 'sr-only sm:not-sr-only')}>
      SkillSwap
    </span>
  </Link>
);

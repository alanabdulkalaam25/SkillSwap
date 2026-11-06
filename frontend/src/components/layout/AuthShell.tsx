import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '../../lib/utils';

interface AuthShellProps {
  children: React.ReactNode;
  aside: React.ReactNode;
  wide?: boolean;
}

export const AuthShell: React.FC<AuthShellProps> = ({ children, aside, wide = false }) => (
  <div className="min-h-screen bg-background lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center justify-between px-5 sm:px-8 lg:px-10">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link to="/" className="hidden text-caption font-medium text-muted-foreground transition-colors hover:text-foreground sm:block">
            Back to home
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        <div className={cn('mx-auto w-full', wide ? 'max-w-[34rem]' : 'max-w-[26rem]')}>{children}</div>
      </main>

      <footer className="px-5 py-6 text-caption-sm text-muted-foreground sm:px-8 lg:px-10">
        <span className="inline-flex items-center gap-1.5">
          SkillSwap is available to verified college students only.
        </span>
      </footer>
    </div>

    <aside className="relative hidden overflow-hidden border-l border-border bg-muted/30 lg:flex lg:flex-col lg:justify-between">
      <div className="canvas-wash pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
      <div className="relative flex flex-1 items-center px-12 py-14 xl:px-16">
        <div className="w-full max-w-md">{aside}</div>
      </div>
      <div className="relative px-12 pb-10 text-caption-sm text-muted-foreground xl:px-16">
        A small, focused network works better than a huge one when the goal is to actually learn something.
      </div>
    </aside>
  </div>
);

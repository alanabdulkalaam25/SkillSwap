import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';

interface PublicHeaderProps {
  /** Optional anchor links shown on medium screens and above. */
  showSections?: boolean;
}

export const PublicHeader: React.FC<PublicHeaderProps> = ({ showSections = false }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="app-container flex h-14 items-center justify-between gap-4">
        <Logo />

        {showSections && (
          <nav className="hidden items-center gap-1 md:flex" aria-label="Landing page sections">
            <a href="#how-it-works" className="nav-item">
              How it works
            </a>
            <a href="#why-skillswap" className="nav-item">
              Why SkillSwap
            </a>
          </nav>
        )}

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          {user ? (
            <Button asChild size="sm" className="ml-1">
              <Link to="/dashboard">
                Open workspace
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          ) : (
            <>
              <Link to="/login" className="hidden rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block">
                Log in
              </Link>
              <Button asChild size="sm" className="ml-1">
                <Link to="/register">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

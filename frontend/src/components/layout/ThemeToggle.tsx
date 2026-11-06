import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { theme, toggleTheme } = useTheme();
  const next = theme === 'light' ? 'dark' : 'light';

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className={cn('h-9 w-9 text-muted-foreground hover:text-foreground', className)}
    >
      {theme === 'light' ? <Moon className="h-[1.05rem] w-[1.05rem]" /> : <Sun className="h-[1.05rem] w-[1.05rem]" />}
    </Button>
  );
};

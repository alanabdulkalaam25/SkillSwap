import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, Check, LockKeyhole, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuthShell } from '../components/layout/AuthShell';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';

const asidePoints = [
  'Find peers whose skills complement yours.',
  'Propose a two-way exchange in a few clicks.',
  'Unlock contact details only after acceptance.',
];

export const LoginPage: React.FC = () => {
  const { login, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/dashboard';

  if (!isLoading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Enter your college email and password.');
      return;
    }
    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.error || 'Sign-in failed. Check your details and try again.');
    }
  };

  return (
    <AuthShell
      aside={
        <div>
          <p className="eyebrow">Welcome back</p>
          <h2 className="mt-4 text-balance text-display-sm font-semibold text-foreground">
            Pick up where you left off.
          </h2>
          <p className="mt-4 max-w-sm text-body-sm leading-relaxed text-muted-foreground">
            Your matches, requests, and profile are waiting. Nothing has moved while you were away.
          </p>

          <ul className="mt-8 space-y-3.5 border-t border-border pt-7">
            {asidePoints.map((point) => (
              <li key={point} className="flex items-start gap-3 text-body-sm text-muted-foreground">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border bg-background">
                  <Check className="h-3 w-3 text-foreground" />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      }
    >
      <div className="animate-in">
        <h1 className="text-display-sm font-semibold text-foreground">Log in</h1>
        <p className="mt-2 text-body-sm leading-relaxed text-muted-foreground">
          Use the college email associated with your SkillSwap account.
        </p>

        {error && (
          <Alert variant="destructive" className="mt-6">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">College email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@college.edu"
                className="pl-9"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Your password"
                className="pl-9"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting} size="lg">
            {isSubmitting ? 'Signing in…' : 'Sign in'}
            {!isSubmitting && <ArrowRight className="h-4 w-4" />}
          </Button>
        </form>

        <p className="mt-6 text-center text-body-sm text-muted-foreground">
          New to SkillSwap?{' '}
          <Link to="/register" className="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground">
            Create an account
          </Link>
        </p>
      </div>
    </AuthShell>
  );
};

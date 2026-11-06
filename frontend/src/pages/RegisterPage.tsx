import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, Check, Hash, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuthShell } from '../components/layout/AuthShell';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const departments = [
  'Computer Science & Engineering',
  'Information Technology',
  'Artificial Intelligence & Data Science',
  'Electronics & Communication',
  'Electrical & Electronics',
  'Mechanical Engineering',
  'Civil Engineering',
  'Applied Mathematics & Computing',
  'Management & Business Studies',
  'Design & Architecture',
];

const asidePoints = [
  'Verified with your college email and roll number.',
  'Do not pay for lessons. Trade what you know.',
  'Only your department and semester are visible.',
];

export const RegisterPage: React.FC = () => {
  const { register, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: departments[0],
    semester: 4,
    rollNumber: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLoading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Your password must be at least 6 characters long.');
      return;
    }
    setIsSubmitting(true);
    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      department: formData.department,
      semester: formData.semester,
      rollNumber: formData.rollNumber,
    });
    setIsSubmitting(false);
    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setError(result.error || 'Could not create your account.');
    }
  };

  return (
    <AuthShell
      wide
      aside={
        <div>
          <p className="eyebrow">Join SkillSwap</p>
          <h2 className="mt-4 text-balance text-display-sm font-semibold text-foreground">
            Make your campus your classroom.
          </h2>
          <p className="mt-4 max-w-sm text-body-sm leading-relaxed text-muted-foreground">
            A profile takes two minutes. The connections last a semester — sometimes a lot longer.
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
        <h1 className="text-display-sm font-semibold text-foreground">Create your account</h1>
        <p className="mt-2 text-body-sm leading-relaxed text-muted-foreground">
          Tell us enough to verify you are a student. You can add your skills right after.
        </p>

        {error && (
          <Alert variant="destructive" className="mt-6">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="mt-7 space-y-6">
          <fieldset className="space-y-4">
            <legend className="mb-1 text-caption-sm font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Student details
            </legend>

            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  autoComplete="name"
                  required
                  minLength={2}
                  placeholder="Your full name"
                  className="pl-9"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">College email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@college.edu"
                    className="pl-9"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rollNumber">Roll number</Label>
                <div className="relative">
                  <Hash className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="rollNumber"
                    name="rollNumber"
                    required
                    minLength={3}
                    placeholder="e.g. 24CS018"
                    className="pl-9 font-mono text-[0.9em]"
                    value={formData.rollNumber}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_9rem]">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, department: value }))}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Choose a department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department} value={department}>
                        {department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Select
                  value={String(formData.semester)}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, semester: parseInt(value, 10) }))}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="semester">
                    <SelectValue placeholder="Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, index) => index + 1).map((semester) => (
                      <SelectItem key={semester} value={String(semester)}>
                        Semester {semester}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-4 border-t border-border pt-5">
            <legend className="mb-1 text-caption-sm font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Account security
            </legend>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    minLength={6}
                    required
                    placeholder="At least 6 characters"
                    className="pl-9"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="Enter it again"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </fieldset>

          <div className="space-y-4">
            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account…' : 'Create account'}
              {!isSubmitting && <ArrowRight className="h-4 w-4" />}
            </Button>
            <p className="text-center text-body-sm text-muted-foreground">
              Already registered?{' '}
              <Link to="/login" className="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </AuthShell>
  );
};

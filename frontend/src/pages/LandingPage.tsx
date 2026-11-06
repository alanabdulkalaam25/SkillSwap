import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftRight,
  ArrowRight,
  ArrowUpRight,
  Check,
  GraduationCap,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { PublicHeader } from '../components/layout/PublicHeader';
import { Logo } from '../components/layout/Logo';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

const steps = [
  {
    number: '01',
    title: 'Create your student profile',
    copy: 'Sign up with your college email and roll number. Add the skills you can teach and the ones you want to learn.',
  },
  {
    number: '02',
    title: 'Find a genuine match',
    copy: 'SkillSwap surfaces peers where the exchange goes both ways — so both people have something to gain.',
  },
  {
    number: '03',
    title: 'Send a request',
    copy: 'Propose an exchange, agree on the details, and unlock contact only after they accept.',
  },
];

const principles = [
  {
    icon: ShieldCheck,
    title: 'Campus-only by design',
    copy: 'Every account is tied to a verified college email and roll number. No strangers, no noise.',
  },
  {
    icon: ArrowLeftRight,
    title: 'Mutual, not transactional',
    copy: 'Matches are ranked by what you can learn from each other — not by followers or popularity.',
  },
  {
    icon: Sparkles,
    title: 'Quiet by default',
    copy: 'No feeds to scroll, no streaks, no public rankings. Just people and skills worth sharing.',
  },
];

const SamplePerson: React.FC<{
  name: string;
  course: string;
  skills: string[];
  initials: string;
}> = ({ name, course, skills, initials }) => (
  <div className="flex items-start gap-3 p-4 sm:p-5">
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-caption font-semibold text-secondary-foreground">
      {initials}
    </span>
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <p className="truncate text-sm font-medium text-foreground">{name}</p>
        <span className="text-caption-sm text-muted-foreground">Can teach</span>
      </div>
      <p className="mt-0.5 truncate text-caption text-muted-foreground">{course}</p>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {skills.map((skill) => (
          <Badge key={skill} variant="outline" className="font-normal text-foreground">
            {skill}
          </Badge>
        ))}
      </div>
    </div>
  </div>
);

export const LandingPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader showSections />

      <main>
        {/* ---------------- Hero ---------------- */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="canvas-wash pointer-events-none absolute inset-0" aria-hidden="true" />
          <div className="app-container relative py-16 sm:py-24 lg:py-28">
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="outline" className="mx-auto gap-1.5 bg-background px-3 py-1 text-caption-sm font-normal text-muted-foreground">
                <GraduationCap className="h-3.5 w-3.5" />
                A skill exchange for your college
              </Badge>

              <h1 className="mx-auto mt-6 max-w-3xl text-balance text-display-lg font-semibold text-foreground">
                Learn from the people
                <br className="hidden sm:block" /> already around you.
              </h1>

              <p className="mx-auto mt-5 max-w-xl text-pretty text-body leading-relaxed text-muted-foreground sm:mt-6">
                SkillSwap connects students who want to learn something with students who can teach it. Share a skill,
                gain one back — no money, no strangers.
              </p>

              <div className="mt-8 flex flex-col items-stretch justify-center gap-2.5 sm:flex-row sm:items-center">
                {user ? (
                  <Button asChild size="lg">
                    <Link to="/dashboard">
                      Open your workspace
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild size="lg">
                      <Link to="/register">
                        Create your account
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild size="lg" variant="ghost" className="text-muted-foreground">
                      <Link to="/login">
                        I already have one
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </>
                )}
              </div>

              <p className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-caption-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" /> Free for students
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" /> College email required
                </span>
              </p>
            </div>

            {/* Product preview */}
            <div className="mx-auto mt-12 max-w-3xl sm:mt-16">
              <div className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
                <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-5">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-secondary text-muted-foreground">
                      <Search className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <p className="text-caption font-medium text-foreground">Discover peers</p>
                      <p className="text-caption-sm text-muted-foreground">Computer Science &amp; Design</p>
                    </div>
                  </div>
                  <Badge variant="muted" className="hidden font-normal sm:inline-flex">
                    3 mutual matches
                  </Badge>
                </div>

                <div className="divide-y divide-border">
                  <SamplePerson
                    name="Aarav Patel"
                    course="Computer Science · Year 3"
                    skills={['Python', 'Machine learning', 'Git']}
                    initials="AP"
                  />

                  <div className="flex items-center gap-3 bg-muted/40 px-4 py-2.5 text-caption-sm text-muted-foreground sm:px-5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background">
                      <ArrowLeftRight className="h-3 w-3" />
                    </span>
                    <span>Both can teach something the other wants to learn</span>
                  </div>

                  <SamplePerson
                    name="Ananya Iyer"
                    course="Design · Year 2"
                    skills={['UI/UX design', 'Figma', 'Typography']}
                    initials="AI"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 sm:px-5">
                  <p className="flex items-center gap-2 text-caption text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5" />
                    A balanced exchange, ranked by relevance
                  </p>
                  <span className="inline-flex h-8 items-center rounded-md bg-primary px-3 text-caption font-medium text-primary-foreground">
                    Propose exchange
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- How it works ---------------- */}
        <section id="how-it-works" className="border-b border-border scroll-mt-16">
          <div className="app-container py-16 sm:py-20">
            <div className="max-w-2xl">
              <p className="eyebrow">How it works</p>
              <h2 className="mt-3 text-balance text-display-sm font-semibold text-foreground">
                Three steps. No subscriptions, no noise.
              </h2>
              <p className="mt-3 max-w-xl text-body-sm leading-relaxed text-muted-foreground">
                SkillSwap stays out of the way. The point is the exchange between two people who can help each other.
              </p>
            </div>

            <div className="mt-10 grid divide-y divide-border border-y border-border md:grid-cols-3 md:divide-x md:divide-y-0">
              {steps.map((step) => (
                <div key={step.number} className="py-7 md:px-7 md:py-9 md:first:pl-0 md:last:pr-0">
                  <span className="font-mono text-caption text-muted-foreground">{step.number}</span>
                  <h3 className="mt-3 text-heading-sm font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 max-w-sm text-body-sm leading-relaxed text-muted-foreground">{step.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- Principles ---------------- */}
        <section id="why-skillswap" className="border-b border-border scroll-mt-16">
          <div className="app-container grid gap-10 py-16 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div>
              <p className="eyebrow">Why SkillSwap</p>
              <h2 className="mt-3 text-balance text-display-sm font-semibold text-foreground">
                Built for campuses, not for the internet.
              </h2>
              <p className="mt-4 max-w-md text-body-sm leading-relaxed text-muted-foreground">
                A small, focused network works better than a huge one when the goal is to actually learn something.
              </p>
              <Button asChild variant="outline" className="mt-6">
                <Link to={user ? '/dashboard' : '/register'}>
                  {user ? 'Go to your workspace' : 'Join your campus'}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-1">
              {principles.map(({ icon: Icon, title, copy }) => (
                <div key={title} className="flex items-start gap-4 bg-card p-5 sm:p-6">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-foreground">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-heading-sm font-semibold text-foreground">{title}</h3>
                    <p className="mt-1.5 max-w-lg text-body-sm leading-relaxed text-muted-foreground">{copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- Closing CTA ---------------- */}
        <section className="border-b border-border bg-muted/40">
          <div className="app-container flex flex-col items-start justify-between gap-6 py-12 sm:py-16 lg:flex-row lg:items-center">
            <div className="max-w-xl">
              <h2 className="text-balance text-display-sm font-semibold text-foreground">
                Start with what you already know.
              </h2>
              <p className="mt-3 text-body-sm leading-relaxed text-muted-foreground">
                There is probably someone a few rows away who needs exactly the skill you take for granted.
              </p>
            </div>
            <div className="flex flex-col gap-2.5 sm:flex-row">
              {user ? (
                <Button asChild size="lg">
                  <Link to="/dashboard">
                    Open workspace
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg">
                    <Link to="/register">
                      Create your account
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link to="/login">Log in</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* ---------------- Footer ---------------- */}
      <footer className="bg-background">
        <div className="app-container flex flex-col gap-5 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <Logo />
            <p className="text-caption-sm text-muted-foreground">A quieter way to learn from your campus.</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-caption text-muted-foreground">
            <a href="#how-it-works" className="transition-colors hover:text-foreground">How it works</a>
            <Link to="/login" className="transition-colors hover:text-foreground">Log in</Link>
            <Link to="/register" className="transition-colors hover:text-foreground">Create account</Link>
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Students only
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

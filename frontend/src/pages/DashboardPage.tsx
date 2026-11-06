import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftRight,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Compass,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { cn } from '../lib/utils';

type Status = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELED';

interface ExchangeSummary {
  id: string;
  senderId: string;
  receiverId: string;
  status: Status;
  createdAt: string;
  sender: { name: string; department: string };
  receiver: { name: string; department: string };
  offeredSkill: { skill: { name: string } };
  wantedSkill: { skill: { name: string } };
}

interface ProfileSummary {
  bio?: string | null;
  offeredSkills: Array<{ id: string; skill: { name: string } }>;
  wantedSkills: Array<{ id: string; skill: { name: string } }>;
}

const statusVariant: Record<Status, 'warning' | 'success' | 'destructive' | 'muted'> = {
  PENDING: 'warning',
  ACCEPTED: 'success',
  REJECTED: 'destructive',
  CANCELED: 'muted',
};

const statusLabel: Record<Status, string> = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  REJECTED: 'Declined',
  CANCELED: 'Canceled',
};

const actions = [
  {
    to: '/discover',
    icon: Search,
    title: 'Discover peers',
    copy: 'Find students who can teach what you want to learn.',
  },
  {
    to: '/profile',
    icon: BookOpen,
    title: 'Sharpen your profile',
    copy: 'List your skills so the right people can find you.',
  },
  {
    to: '/exchanges',
    icon: ArrowLeftRight,
    title: 'Review requests',
    copy: 'Reply to incoming proposals and track sent ones.',
  },
];

export const DashboardPage: React.FC = () => {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState<ProfileSummary | null>(null);
  const [incoming, setIncoming] = useState<ExchangeSummary[]>([]);
  const [sent, setSent] = useState<ExchangeSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    let active = true;

    const load = async () => {
      const headers = { Authorization: `Bearer ${token}` };
      const [profileRes, incomingRes, sentRes] = await Promise.allSettled([
        fetch('/api/profile/me', { headers }),
        fetch('/api/exchanges/incoming', { headers }),
        fetch('/api/exchanges/sent', { headers }),
      ]);

      if (!active) return;

      if (profileRes.status === 'fulfilled' && profileRes.value.ok) {
        const data = await profileRes.value.json();
        if (data.profile) setProfile(data.profile);
      }
      if (incomingRes.status === 'fulfilled' && incomingRes.value.ok) {
        const data = await incomingRes.value.json();
        setIncoming(data.requests || []);
      }
      if (sentRes.status === 'fulfilled' && sentRes.value.ok) {
        const data = await sentRes.value.json();
        setSent(data.requests || []);
      }
      setLoading(false);
    };

    void load();
    return () => {
      active = false;
    };
  }, [token]);

  const stats = useMemo(() => {
    const all = [...incoming, ...sent];
    return {
      pendingIncoming: incoming.filter((request) => request.status === 'PENDING').length,
      pendingSent: sent.filter((request) => request.status === 'PENDING').length,
      accepted: all.filter((request) => request.status === 'ACCEPTED').length,
      offered: profile?.offeredSkills.length ?? 0,
      wanted: profile?.wantedSkills.length ?? 0,
    };
  }, [incoming, sent, profile]);

  const completion = useMemo(() => {
    let score = 20;
    if (profile?.bio && profile.bio.trim().length > 10) score += 25;
    if ((profile?.offeredSkills.length ?? 0) > 0) score += 30;
    if ((profile?.wantedSkills.length ?? 0) > 0) score += 25;
    return score;
  }, [profile]);

  const recent = useMemo(
    () =>
      [...incoming, ...sent]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 4),
    [incoming, sent]
  );

  if (!user) return null;

  const firstName = user.name.split(' ')[0];
  const initials = user.name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const tiles = [
    { label: 'Incoming requests', value: stats.pendingIncoming, icon: Clock3, hint: 'awaiting your reply' },
    { label: 'Sent requests', value: stats.pendingSent, icon: ArrowLeftRight, hint: 'awaiting a reply' },
    { label: 'Accepted exchanges', value: stats.accepted, icon: CheckCircle2, hint: 'in your network' },
    { label: 'Skills listed', value: stats.offered + stats.wanted, icon: Sparkles, hint: `${stats.offered} offered · ${stats.wanted} wanted` },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Overview</p>
          <h1 className="mt-2 text-display-sm font-semibold text-foreground">Good to see you, {firstName}.</h1>
          <p className="page-description">
            A small exchange today is worth more than a big plan next month.
          </p>
        </div>
        <Badge variant="outline" className="w-fit shrink-0 gap-1.5 whitespace-nowrap py-1.5 font-normal text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-foreground" />
          Verified campus account
        </Badge>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4" aria-label="Your activity at a glance">
        {tiles.map(({ label, value, icon: Icon, hint }) => (
          <Card key={label}>
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-caption font-medium text-muted-foreground">{label}</p>
                <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
              </div>
              <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                {loading ? <span className="text-muted-foreground">—</span> : value}
              </p>
              <p className="mt-0.5 text-caption-sm leading-snug text-muted-foreground">{hint}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
        <div className="space-y-6">
          {/* Quick actions */}
          <section>
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <h2 className="section-title">Where to go next</h2>
                <p className="section-description">Three quiet ways to make progress.</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {actions.map(({ to, icon: Icon, title, copy }) => (
                <Link key={to} to={to} className="group rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                  <Card className="h-full transition-colors duration-normal group-hover:border-foreground/25">
                    <CardContent className="flex h-full flex-col p-4 sm:p-5">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-foreground">
                        <Icon className="h-4 w-4" />
                      </span>
                      <h3 className="mt-4 text-heading-sm font-semibold text-foreground">{title}</h3>
                      <p className="mt-1.5 flex-1 text-caption leading-relaxed text-muted-foreground">{copy}</p>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-caption font-medium text-foreground">
                        Open
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>

          {/* Recent activity */}
          <section>
            <Card>
              <CardHeader className="flex-row items-center justify-between gap-3 border-b border-border pb-4">
                <CardTitle>Recent exchange activity</CardTitle>
                <Link to="/exchanges" className="inline-flex shrink-0 items-center gap-1 text-caption font-medium text-muted-foreground transition-colors hover:text-foreground">
                  View all <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="divide-y divide-border">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="flex items-center gap-3 px-5 py-4 sm:px-6">
                        <span className="h-9 w-9 animate-pulse rounded-full bg-muted" />
                        <div className="flex-1 space-y-1.5">
                          <span className="block h-3.5 w-32 animate-pulse rounded bg-muted" />
                          <span className="block h-3 w-48 animate-pulse rounded bg-muted" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recent.length === 0 ? (
                  <div className="flex flex-col items-center px-6 py-12 text-center">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground">
                      <Clock3 className="h-4 w-4" />
                    </span>
                    <h3 className="mt-3 text-heading-sm font-semibold text-foreground">Nothing here yet</h3>
                    <p className="mt-1 max-w-sm text-body-sm text-muted-foreground">
                      Your exchange requests will appear here. Start by finding a peer with a complementary skill.
                    </p>
                    <Button asChild variant="outline" size="sm" className="mt-4">
                      <Link to="/discover">
                        <Compass className="h-3.5 w-3.5" />
                        Discover peers
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <ul className="divide-y divide-border">
                    {recent.map((request) => {
                      const isIncoming = request.receiverId === user.id;
                      const other = isIncoming ? request.sender : request.receiver;
                      return (
                        <li key={request.id}>
                          <Link to="/exchanges" className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-muted/50 sm:px-6">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-caption font-semibold text-secondary-foreground">
                              {other.name.charAt(0).toUpperCase()}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-caption font-medium text-foreground">
                                {other.name}
                                <span className="ml-2 font-normal text-muted-foreground">
                                  {isIncoming ? 'sent you a request' : 'received your request'}
                                </span>
                              </p>
                              <p className="mt-0.5 truncate text-caption-sm text-muted-foreground">
                                {request.offeredSkill.skill.name} <span className="px-1">↔</span> {request.wantedSkill.skill.name}
                              </p>
                            </div>
                            <Badge variant={statusVariant[request.status]} className="shrink-0">
                              {statusLabel[request.status]}
                            </Badge>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Right column */}
        <aside className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Your profile</CardTitle>
                <UserRound className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-caption font-semibold text-secondary-foreground">
                  {initials}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-caption font-semibold text-foreground">{user.name}</p>
                  <p className="truncate text-caption-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <dl className="space-y-2.5 border-t border-border pt-4 text-caption">
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-muted-foreground">Department</dt>
                  <dd className="max-w-[62%] text-right font-medium text-foreground">{user.department}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Semester</dt>
                  <dd className="font-medium text-foreground">{user.semester}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Roll number</dt>
                  <dd className="font-mono text-caption-sm font-medium text-foreground">{user.rollNumber}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Role</dt>
                  <dd>
                    <Badge variant="secondary" className="font-normal">
                      {user.role === 'ADMIN' ? 'Administrator' : 'Student'}
                    </Badge>
                  </dd>
                </div>
              </dl>

              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to="/profile">View profile</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between text-caption">
                <span className="font-medium text-foreground">Profile readiness</span>
                <span className={cn('font-mono text-caption-sm', completion === 100 ? 'text-success' : 'text-muted-foreground')}>
                  {loading ? '—' : `${completion}%`}
                </span>
              </div>
              <Progress value={loading ? 0 : completion} className="mt-3 h-1.5" />
              <p className="mt-3 text-caption-sm leading-relaxed text-muted-foreground">
                {completion === 100
                  ? 'Your profile is complete. Peers can see exactly how you can help.'
                  : 'Add a short bio and at least one offered and wanted skill so peers can find you.'}
              </p>
              {completion < 100 && (
                <Link to="/profile" className="mt-3 inline-flex items-center gap-1 text-caption font-medium text-foreground">
                  Complete profile <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </CardContent>
          </Card>

          {user.role === 'ADMIN' && (
            <Card>
              <CardContent className="flex items-start gap-3 p-5">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="text-caption font-medium text-foreground">College administration</p>
                  <p className="mt-1 text-caption-sm leading-relaxed text-muted-foreground">
                    Manage student access and the campus skill catalog.
                  </p>
                  <Link to="/admin" className="mt-3 inline-flex items-center gap-1 text-caption font-medium text-foreground">
                    Open admin <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
};

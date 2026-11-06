import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftRight,
  ArrowRight,
  Check,
  Clock3,
  Compass,
  Loader2,
  Mail,
  RefreshCw,
  Send,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { RequestSkeleton } from '../components/LoadingSkeleton';
import { Button } from '../components/ui/button';
import { Badge, type BadgeProps } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Alert, AlertDescription } from '../components/ui/alert';
import { cn } from '../lib/utils';

type BadgeVariant = BadgeProps['variant'];

type ExchangeStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELED';
type ExchangeTab = 'incoming' | 'sent';

interface ExchangeRequest {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  status: ExchangeStatus;
  createdAt: string;
  contactEmail?: string;
  sender: { id: string; name: string; department: string; semester: number };
  receiver: { id: string; name: string; department: string; semester: number };
  offeredSkill: { skill: { name: string; category: string }; proficiency: string; description?: string | null };
  wantedSkill: { skill: { name: string; category: string }; priority: string; notes?: string | null };
}

const statusConfig: Record<ExchangeStatus, { label: string; variant: BadgeVariant }> = {
  PENDING: { label: 'Pending', variant: 'warning' },
  ACCEPTED: { label: 'Accepted', variant: 'success' },
  REJECTED: { label: 'Declined', variant: 'destructive' },
  CANCELED: { label: 'Canceled', variant: 'muted' },
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

const ExchangeCard: React.FC<{
  request: ExchangeRequest;
  perspective: ExchangeTab;
  userId?: string;
  busy: boolean;
  onStatus: (id: string, status: 'ACCEPTED' | 'REJECTED' | 'CANCELED') => void;
}> = ({ request, perspective, userId, busy, onStatus }) => {
  const incoming = perspective === 'incoming';
  const other = incoming ? request.sender : request.receiver;
  const config = statusConfig[request.status];
  const isPending = request.status === 'PENDING';

  return (
    <Card className="transition-colors duration-normal hover:border-foreground/20">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-caption font-semibold text-secondary-foreground">
              {other.name.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-caption font-semibold text-foreground">{other.name}</h2>
              <p className="mt-0.5 truncate text-caption-sm text-muted-foreground">
                {other.department} · Semester {other.semester} · {incoming ? 'sent you a request' : 'recipient'}
              </p>
            </div>
          </div>
          <Badge variant={config.variant} className="shrink-0 font-normal">
            {config.label}
          </Badge>
        </div>

        <div className="mt-4 grid items-stretch gap-2 sm:grid-cols-[1fr_auto_1fr]">
          <div className="rounded-lg border border-border bg-muted/30 p-3.5">
            <p className="text-caption-sm font-medium uppercase tracking-[0.1em] text-muted-foreground">
              {incoming ? 'They offer' : 'You offer'}
            </p>
            <p className="mt-1.5 text-caption font-semibold text-foreground">{request.offeredSkill.skill.name}</p>
            <p className="mt-0.5 text-caption-sm text-muted-foreground">{request.offeredSkill.proficiency} proficiency</p>
          </div>

          <div className="flex items-center justify-center text-muted-foreground">
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background">
              <ArrowLeftRight className="h-3.5 w-3.5" />
            </span>
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-3.5">
            <p className="text-caption-sm font-medium uppercase tracking-[0.1em] text-muted-foreground">
              {incoming ? 'They want to learn' : 'You want to learn'}
            </p>
            <p className="mt-1.5 text-caption font-semibold text-foreground">{request.wantedSkill.skill.name}</p>
            <p className="mt-0.5 text-caption-sm text-muted-foreground">{request.wantedSkill.priority} priority</p>
          </div>
        </div>

        {request.message && (
          <p className="mt-3 rounded-lg border border-border bg-background p-3 text-caption leading-relaxed text-muted-foreground">
            {request.message}
          </p>
        )}

        {request.status === 'ACCEPTED' && request.contactEmail && (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-success/20 bg-success-muted p-3 text-caption text-success">
            <Mail className="h-4 w-4 shrink-0" />
            <span className="font-semibold">Contact unlocked</span>
            <a className="underline underline-offset-2" href={`mailto:${request.contactEmail}`}>
              {request.contactEmail}
            </a>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
          <span className="inline-flex items-center gap-1.5 text-caption-sm text-muted-foreground">
            <Clock3 className="h-3.5 w-3.5" />
            {formatDate(request.createdAt)}
          </span>

          {isPending && incoming && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => onStatus(request.id, 'REJECTED')}
                className="text-muted-foreground hover:text-destructive"
              >
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                Decline
              </Button>
              <Button size="sm" disabled={busy} onClick={() => onStatus(request.id, 'ACCEPTED')}>
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                Accept
              </Button>
            </div>
          )}

          {isPending && !incoming && request.senderId === userId && (
            <Button variant="outline" size="sm" disabled={busy} onClick={() => onStatus(request.id, 'CANCELED')}>
              {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Cancel request
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const ExchangesPage: React.FC = () => {
  const { token, user } = useAuth();
  const [tab, setTab] = useState<ExchangeTab>('incoming');
  const [requests, setRequests] = useState<ExchangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/exchanges/${tab}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not load exchange requests');
      setRequests(data.requests || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load exchange requests');
    } finally {
      setLoading(false);
    }
  }, [tab, token]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  const updateStatus = async (requestId: string, status: 'ACCEPTED' | 'REJECTED' | 'CANCELED') => {
    setBusyId(requestId);
    setActionError(null);
    setActionNotice(null);
    try {
      const response = await fetch(`/api/exchanges/${requestId}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not update this request');
      setActionNotice(
        status === 'ACCEPTED' ? 'Request accepted. Contact details are now visible.' : `Request ${status.toLowerCase()}.`
      );
      await loadRequests();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not update this request');
    } finally {
      setBusyId(null);
    }
  };

  const renderList = (perspective: ExchangeTab) => {
    if (loading) return <RequestSkeleton />;

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-16 text-center">
          <p className="text-body-sm font-medium text-foreground">Could not load requests</p>
          <p className="mt-1 text-caption text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" onClick={() => void loadRequests()} className="mt-4">
            <RefreshCw className="h-3.5 w-3.5" />
            Try again
          </Button>
        </div>
      );
    }

    if (requests.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-16 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground">
            {perspective === 'incoming' ? <Send className="h-4 w-4" /> : <Compass className="h-4 w-4" />}
          </span>
          <h2 className="mt-3 text-heading-sm font-semibold text-foreground">
            {perspective === 'incoming' ? 'No incoming requests' : 'No sent requests'}
          </h2>
          <p className="mt-1 max-w-sm text-body-sm leading-relaxed text-muted-foreground">
            {perspective === 'incoming'
              ? 'When a classmate proposes an exchange, it will show up here.'
              : 'Find a peer with a complementary skill and send your first proposal.'}
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link to="/discover">
              Discover peers
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {requests.map((request) => (
          <ExchangeCard
            key={request.id}
            request={request}
            perspective={perspective}
            userId={user?.id}
            busy={busyId === request.id}
            onStatus={(id, status) => void updateStatus(id, status)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-6">
        <p className="eyebrow">Exchanges</p>
        <h1 className="mt-2 text-display-sm font-semibold text-foreground">Your learning partnerships.</h1>
        <p className="page-description">
          Review proposals, accept a match, and unlock contact details once both sides agree.
        </p>
      </header>

      <Tabs value={tab} onValueChange={(value: ExchangeTab) => setTab(value)} className="w-full">
        <TabsList className="w-full justify-start bg-muted p-1 sm:w-fit">
          <TabsTrigger value="incoming" className="flex-1 gap-2 sm:flex-none">
            Incoming
            {!loading && tab === 'incoming' && requests.length > 0 && (
              <span className="rounded-full bg-background px-1.5 py-0.5 text-[0.65rem] font-medium text-muted-foreground">
                {requests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent" className="flex-1 gap-2 sm:flex-none">
            Sent
            {!loading && tab === 'sent' && requests.length > 0 && (
              <span className="rounded-full bg-background px-1.5 py-0.5 text-[0.65rem] font-medium text-muted-foreground">
                {requests.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {actionError && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{actionError}</AlertDescription>
          </Alert>
        )}
        {actionNotice && (
          <Alert variant="success" className="mt-4 animate-in">
            <AlertDescription>{actionNotice}</AlertDescription>
          </Alert>
        )}

        <TabsContent value="incoming" className={cn('mt-4', tab !== 'incoming' && 'hidden')}>
          {renderList('incoming')}
        </TabsContent>
        <TabsContent value="sent" className={cn('mt-4', tab !== 'sent' && 'hidden')}>
          {renderList('sent')}
        </TabsContent>
      </Tabs>
    </div>
  );
};

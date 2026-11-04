import React, { useCallback, useEffect, useState } from 'react';
import { ArrowLeftRight, Check, Clock3, Loader2, Mail, RefreshCw, Send, X } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

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

const statusStyle: Record<ExchangeStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  ACCEPTED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
  CANCELED: 'bg-slate-100 text-slate-600 border-slate-200',
};

export const ExchangesPage: React.FC = () => {
  const { token, user } = useAuth();
  const [tab, setTab] = useState<ExchangeTab>('incoming');
  const [requests, setRequests] = useState<ExchangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
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

  useEffect(() => { void loadRequests(); }, [loadRequests]);

  const updateStatus = async (requestId: string, status: 'ACCEPTED' | 'REJECTED' | 'CANCELED') => {
    setBusyId(requestId);
    setActionError(null);
    try {
      const response = await fetch(`/api/exchanges/${requestId}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not update this request');
      await loadRequests();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not update this request');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-12">
      <Navbar />
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        <section className="rounded-3xl bg-gradient-to-r from-indigo-900 to-violet-900 text-white p-7 sm:p-9 shadow-lg">
          <div className="flex items-center gap-3 text-indigo-200 text-xs font-semibold uppercase tracking-wider">
            <ArrowLeftRight className="w-4 h-4" /> Skill exchange transaction flow
          </div>
          <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold">Exchange Requests</h1>
          <p className="mt-2 text-sm text-indigo-100 max-w-2xl">Propose a skill swap, review requests from classmates, and share contact details after a request is accepted.</p>
        </section>

        <div className="bg-white border border-slate-200 rounded-2xl p-1.5 flex gap-2 shadow-sm">
          {(['incoming', 'sent'] as const).map((value) => (
            <button key={value} onClick={() => setTab(value)} className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold transition ${tab === value ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>
              {value === 'incoming' ? 'Incoming Requests' : 'Sent Requests'}
            </button>
          ))}
        </div>

        {actionError && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{actionError}</div>}

        {loading ? (
          <div className="py-20 flex flex-col items-center gap-3 text-slate-500"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /><span className="text-sm">Loading requests…</span></div>
        ) : error ? (
          <div className="py-16 flex flex-col items-center gap-4 text-center"><p className="text-sm text-rose-600">{error}</p><button onClick={() => void loadRequests()} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 text-white px-4 py-2 text-sm font-semibold"><RefreshCw className="w-4 h-4" /> Retry</button></div>
        ) : requests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center"><Send className="w-8 h-8 text-slate-300 mx-auto" /><h2 className="mt-3 font-bold text-slate-700">No {tab} requests yet</h2><p className="mt-1 text-sm text-slate-500">Discover classmates and propose a skill exchange to get started.</p></div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => {
              const otherStudent = tab === 'incoming' ? request.sender : request.receiver;
              const isPending = request.status === 'PENDING';
              return (
                <article key={request.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-5 sm:p-6 space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="font-bold text-slate-900">{otherStudent.name}</h2>
                        <p className="mt-1 text-xs text-slate-500">{otherStudent.department} · Semester {otherStudent.semester} · {tab === 'incoming' ? 'sent you a request' : 'recipient'}</p>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${statusStyle[request.status]}`}>{request.status.toLowerCase()}</span>
                    </div>

                    <div className="grid sm:grid-cols-[1fr_auto_1fr] items-stretch gap-3">
                      <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-4">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">{tab === 'incoming' ? 'They offer' : 'You offer'}</div>
                        <div className="mt-1 font-bold text-slate-900">{request.offeredSkill.skill.name}</div>
                        <div className="mt-1 text-xs text-slate-500">{request.offeredSkill.proficiency} proficiency</div>
                      </div>
                      <div className="flex items-center justify-center text-slate-400"><ArrowLeftRight className="w-5 h-5" /></div>
                      <div className="rounded-xl border border-violet-100 bg-violet-50/70 p-4">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-violet-600">{tab === 'incoming' ? 'They want to learn' : 'You want to learn'}</div>
                        <div className="mt-1 font-bold text-slate-900">{request.wantedSkill.skill.name}</div>
                        <div className="mt-1 text-xs text-slate-500">{request.wantedSkill.priority} priority</div>
                      </div>
                    </div>

                    {request.message && <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">“{request.message}”</p>}

                    {request.status === 'ACCEPTED' && request.contactEmail && (
                      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                        <Mail className="w-4 h-4" /><span className="font-semibold">Contact unlocked:</span><a className="underline underline-offset-2" href={`mailto:${request.contactEmail}`}>{request.contactEmail}</a>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                      <span className="flex items-center gap-1.5 text-xs text-slate-400"><Clock3 className="w-3.5 h-3.5" />{new Date(request.createdAt).toLocaleString()}</span>
                      {isPending && tab === 'incoming' && (
                        <div className="flex gap-2">
                          <button disabled={busyId === request.id} onClick={() => void updateStatus(request.id, 'REJECTED')} className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-50"><X className="w-3.5 h-3.5" /> Reject</button>
                          <button disabled={busyId === request.id} onClick={() => void updateStatus(request.id, 'ACCEPTED')} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"><Check className="w-3.5 h-3.5" /> Accept</button>
                        </div>
                      )}
                      {isPending && tab === 'sent' && request.senderId === user?.id && (
                        <button disabled={busyId === request.id} onClick={() => void updateStatus(request.id, 'CANCELED')} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50">Cancel request</button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

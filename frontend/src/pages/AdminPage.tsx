import React, { FormEvent, useCallback, useEffect, useState } from 'react';
import {
  Activity,
  ArrowLeftRight,
  BookOpen,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/table';
import { Alert } from '../components/ui/alert';
import { AdminSkeleton } from '../components/LoadingSkeleton';

type Stats = { students: number; skills: number; exchanges: number; pending: number; suspended: number };
type Student = {
  id: string;
  name: string;
  email: string;
  department: string;
  semester: number;
  rollNumber: string;
  isActive: boolean;
  createdAt: string;
  _count: { offeredSkills: number; wantedSkills: number; sentExchanges: number; receivedExchanges: number };
};

const blankStats: Stats = { students: 0, skills: 0, exchanges: 0, pending: 0, suspended: 0 };

export const AdminPage: React.FC = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(blankStats);
  const [students, setStudents] = useState<Student[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [skillName, setSkillName] = useState('');
  const [category, setCategory] = useState('');
  const [busyId, setBusyId] = useState('');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ status });
      if (query.trim()) params.set('search', query.trim());
      const [statsRes, studentsRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch(`/api/admin/students?${params}`, { headers }),
      ]);
      const statsData = await statsRes.json();
      const studentsData = await studentsRes.json();
      if (!statsRes.ok || !studentsRes.ok) throw new Error(statsData.error || studentsData.error || 'Could not load administrator data');
      setStats(statsData.stats);
      setStudents(studentsData.students);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load administrator data');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, query, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 200);
    return () => window.clearTimeout(timer);
  }, [load]);

  const toggleStudent = async (student: Student) => {
    setBusyId(student.id);
    setError('');
    setNotice('');
    try {
      const res = await fetch(`/api/admin/students/${student.id}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: student.isActive ? 'suspended' : 'active' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not update student status');
      setNotice(`${student.name} is now ${data.student.isActive ? 'active' : 'suspended'}.`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update student status');
    } finally {
      setBusyId('');
    }
  };

  const addSkill = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setNotice('');
    try {
      const res = await fetch('/api/admin/skills', { method: 'POST', headers, body: JSON.stringify({ name: skillName, category }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not add skill');
      setSkillName('');
      setCategory('');
      setNotice(`${data.skill.name} was added to the system catalog.`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add skill');
    }
  };

  const cards = [
    { label: 'Students', value: stats.students, icon: Users },
    { label: 'Catalog skills', value: stats.skills, icon: BookOpen },
    { label: 'Exchanges', value: stats.exchanges, icon: ArrowLeftRight },
    { label: 'Pending', value: stats.pending, icon: Activity },
    { label: 'Suspended', value: stats.suspended, icon: ShieldAlert },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Administration</p>
          <h1 className="mt-2 text-display-sm font-semibold text-foreground">Campus overview.</h1>
          <p className="page-description">Review activity and manage access for your student community.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()} className="w-fit gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </header>

      {error && (
        <Alert variant="destructive" className="animate-in">
          {error}
        </Alert>
      )}
      {notice && (
        <Alert variant="success" className="animate-in">
          {notice}
        </Alert>
      )}

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5" aria-label="Campus statistics">
        {cards.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-caption-sm font-medium text-muted-foreground">{label}</p>
                <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
              </div>
              <p className="mt-2.5 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{loading ? '—' : value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="overflow-hidden">
        <CardHeader className="gap-4 border-b border-border pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <CardTitle>Student roster</CardTitle>
            <CardDescription className="mt-1">Search students and manage account access.</CardDescription>
          </div>
          <div className="grid gap-2 sm:grid-cols-[minmax(13rem,1fr)_9rem]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label="Search students"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Name, email, roll number…"
                className="pl-9"
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger aria-label="Filter by account status">
                <SelectValue placeholder="All accounts" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="all">All accounts</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        {loading ? (
          <div className="p-5">
            <AdminSkeleton inline />
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden lg:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Skills</TableHead>
                    <TableHead>Exchanges</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-caption-sm font-semibold text-secondary-foreground">
                            {student.name.charAt(0).toUpperCase()}
                          </span>
                          <div className="min-w-0 max-w-[16rem]">
                            <p className="truncate text-caption font-medium text-foreground">{student.name}</p>
                            <p className="truncate text-caption-sm text-muted-foreground">
                              {student.email} · <span className="font-mono">{student.rollNumber}</span>
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-caption text-muted-foreground">{student.department}</p>
                        <p className="text-caption-sm text-muted-foreground">Semester {student.semester}</p>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-caption text-muted-foreground">
                        {student._count.offeredSkills} offered · {student._count.wantedSkills} wanted
                      </TableCell>
                      <TableCell className="text-caption text-muted-foreground">
                        {student._count.sentExchanges + student._count.receivedExchanges}
                      </TableCell>
                      <TableCell>
                        <Badge variant={student.isActive ? 'success' : 'destructive'} className="font-normal">
                          {student.isActive ? 'Active' : 'Suspended'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" disabled={busyId === student.id} onClick={() => void toggleStudent(student)}>
                          {busyId === student.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : student.isActive ? 'Suspend' : 'Activate'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {students.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="px-5 py-12 text-center text-body-sm text-muted-foreground">
                        No students match this search.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile cards */}
            <div className="divide-y divide-border lg:hidden">
              {students.length === 0 ? (
                <p className="px-5 py-10 text-center text-body-sm text-muted-foreground">No students match this search.</p>
              ) : (
                students.map((student) => (
                  <div key={student.id} className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-caption font-semibold text-secondary-foreground">
                          {student.name.charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-caption font-medium text-foreground">{student.name}</p>
                          <p className="truncate text-caption-sm text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                      <Badge variant={student.isActive ? 'success' : 'destructive'} className="shrink-0 font-normal">
                        {student.isActive ? 'Active' : 'Suspended'}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-caption-sm text-muted-foreground">
                      <span>{student.department}</span>
                      <span>Semester {student.semester}</span>
                      <span className="font-mono">{student.rollNumber}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
                      <span className="text-caption-sm text-muted-foreground">
                        {student._count.offeredSkills} offered · {student._count.wantedSkills} wanted
                      </span>
                      <Button variant="outline" size="sm" disabled={busyId === student.id} onClick={() => void toggleStudent(student)}>
                        {busyId === student.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : student.isActive ? 'Suspend' : 'Activate'}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Add a catalog skill</CardTitle>
          <CardDescription className="mt-1">New skills become available to students across campus.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={addSkill} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <Input
              required
              minLength={2}
              maxLength={80}
              value={skillName}
              onChange={(event) => setSkillName(event.target.value)}
              placeholder="Skill name"
              aria-label="Skill name"
            />
            <Input
              required
              minLength={2}
              maxLength={80}
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="Category (e.g. Design)"
              aria-label="Skill category"
            />
            <Button type="submit" className="gap-1.5">
              <Plus className="h-4 w-4" />
              Add skill
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

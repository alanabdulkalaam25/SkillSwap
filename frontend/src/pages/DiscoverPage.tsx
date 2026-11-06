import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DirectorySkeleton } from '../components/LoadingSkeleton';
import {
  AlertCircle,
  ArrowLeftRight,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Compass,
  GraduationCap,
  Hash,
  Layers,
  Loader2,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Target,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Pagination } from '../components/ui/pagination';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { cn } from '../lib/utils';

/* ---------- Types ---------- */
interface MatchedSkill {
  skillId: string;
  skillName: string;
  category: string;
  theirProficiency?: string;
  yourPriority?: string;
  yourProficiency?: string;
  theirPriority?: string;
  description?: string | null;
  notes?: string | null;
}

interface MatchResult {
  score: number;
  isMutual: boolean;
  theyCanTeachYou: MatchedSkill[];
  youCanTeachThem: MatchedSkill[];
  commonInterests: Array<{ skillId: string; skillName: string; category: string }>;
  reasons: string[];
}

interface DiscoverSkill {
  id: string;
  skillId: string;
  proficiency?: string;
  priority?: string;
  description?: string | null;
  notes?: string | null;
  skill: {
    id: string;
    name: string;
    category: string;
    description?: string | null;
  };
}

interface DiscoverStudent {
  id: string;
  name: string;
  department: string;
  semester: number;
  rollNumber: string;
  bio?: string | null;
  role: string;
  createdAt: string;
  offeredSkills: DiscoverSkill[];
  wantedSkills: DiscoverSkill[];
  match: MatchResult;
}

interface DiscoverResponse {
  success: boolean;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats: {
    totalFound: number;
    mutualMatches: number;
    highMatches: number;
  };
  students: DiscoverStudent[];
}

const ALL = 'all';

const matchTone = (score: number) =>
  score >= 50 ? 'border-foreground/20 bg-secondary text-foreground' : 'border-border bg-background text-muted-foreground';

const proficiencyBadge = (level?: string) => {
  const map: Record<string, string> = {
    EXPERT: 'border-success/20 bg-success-muted text-success',
    ADVANCED: 'border-foreground/20 bg-secondary text-foreground',
    INTERMEDIATE: 'border-warning/20 bg-warning-muted text-warning',
    BEGINNER: 'border-border bg-muted text-muted-foreground',
  };
  return (level && map[level]) || 'border-border bg-muted text-muted-foreground';
};

const priorityBadge = (level?: string) => {
  const map: Record<string, string> = {
    HIGH: 'border-destructive/20 bg-destructive-muted text-destructive',
    MEDIUM: 'border-warning/20 bg-warning-muted text-warning',
    LOW: 'border-border bg-muted text-muted-foreground',
  };
  return (level && map[level]) || 'border-border bg-muted text-muted-foreground';
};

/* ---------- Filter panel ---------- */
interface FilterProps {
  departments: string[];
  dept: string;
  sem: string;
  skill: string;
  mutual: boolean;
  active: boolean;
  onDept: (value: string) => void;
  onSem: (value: string) => void;
  onSkill: (value: string) => void;
  onMutual: (value: boolean) => void;
  onClear: () => void;
}

const FiltersPanel: React.FC<FilterProps> = ({
  departments,
  dept,
  sem,
  skill,
  mutual,
  active,
  onDept,
  onSem,
  onSkill,
  onMutual,
  onClear,
}) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <p className="text-caption font-medium text-foreground">Filters</p>
      {active && (
        <button
          type="button"
          onClick={onClear}
          className="text-caption-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Clear all
        </button>
      )}
    </div>

    <div className="space-y-2">
      <Label className="text-caption-sm text-muted-foreground">Department</Label>
      <Select value={dept} onValueChange={onDept}>
        <SelectTrigger>
          <SelectValue placeholder="All departments" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All departments</SelectItem>
          {departments.map((department) => (
            <SelectItem key={department} value={department}>
              {department}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    <div className="space-y-2">
      <Label className="text-caption-sm text-muted-foreground">Semester</Label>
      <Select value={sem} onValueChange={onSem}>
        <SelectTrigger>
          <SelectValue placeholder="All semesters" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All semesters</SelectItem>
          {Array.from({ length: 10 }, (_, index) => index + 1).map((semester) => (
            <SelectItem key={semester} value={String(semester)}>
              Semester {semester}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    <div className="space-y-2">
      <Label htmlFor="skill-filter" className="text-caption-sm text-muted-foreground">
        Skill
      </Label>
      <Input
        id="skill-filter"
        placeholder="React, Python, Figma…"
        value={skill}
        onChange={(event) => onSkill(event.target.value)}
      />
    </div>

    <button
      type="button"
      aria-pressed={mutual}
      onClick={() => onMutual(!mutual)}
      className={cn(
        'flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-left text-caption font-medium transition-colors',
        mutual
          ? 'border-foreground/30 bg-secondary text-foreground'
          : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground'
      )}
    >
      <span className="inline-flex items-center gap-2">
        <ArrowLeftRight className="h-3.5 w-3.5" />
        Mutual matches only
      </span>
      <span className={cn('flex h-4 w-4 items-center justify-center rounded-sm border', mutual ? 'border-foreground bg-foreground text-background' : 'border-border')}>
        {mutual && <CheckCircle2 className="h-3 w-3" />}
      </span>
    </button>
  </div>
);

/* ---------- Page ---------- */
export const DiscoverPage: React.FC = () => {
  const { token } = useAuth();

  const [students, setStudents] = useState<DiscoverStudent[]>([]);
  const [stats, setStats] = useState<DiscoverResponse['stats'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState(ALL);
  const [semFilter, setSemFilter] = useState(ALL);
  const [skillFilter, setSkillFilter] = useState('');
  const [mutualOnly, setMutualOnly] = useState(false);
  const [sortBy, setSortBy] = useState('score_desc');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [departments, setDepartments] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState<DiscoverStudent | null>(null);
  const [modalStudent, setModalStudent] = useState<DiscoverStudent | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [showRequestComposer, setShowRequestComposer] = useState(false);
  const [mySkills, setMySkills] = useState<{ offeredSkills: DiscoverSkill[]; wantedSkills: DiscoverSkill[] } | null>(null);
  const [requestOfferedId, setRequestOfferedId] = useState('');
  const [requestWantedId, setRequestWantedId] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch('/api/students/departments', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setDepartments(data.departments || []);
        }
      } catch {
        /* department filter is optional */
      }
    };
    void fetchDepartments();
  }, [token]);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (deptFilter !== ALL) params.set('department', deptFilter);
      if (semFilter !== ALL) params.set('semester', semFilter);
      if (skillFilter.trim()) params.set('skill', skillFilter.trim());
      if (mutualOnly) params.set('mutualOnly', 'true');
      params.set('sort', sortBy);
      params.set('page', page.toString());
      params.set('limit', '20');

      const response = await fetch(`/api/students/discover?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch student directory');
      const data: DiscoverResponse = await response.json();
      setStudents(data.students);
      setStats(data.stats);
      setTotalPages(data.totalPages);
      setTotalCount(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load discover directory');
    } finally {
      setLoading(false);
    }
  }, [token, searchQuery, deptFilter, semFilter, skillFilter, mutualOnly, sortBy, page]);

  useEffect(() => {
    void fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const openProfile = async (student: DiscoverStudent) => {
    setSelectedStudent(student);
    setModalLoading(true);
    try {
      const response = await fetch(`/api/students/${student.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setModalStudent(data.student);
      } else {
        setModalStudent(student);
      }
    } catch {
      setModalStudent(student);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedStudent(null);
    setModalStudent(null);
    setShowRequestComposer(false);
    setRequestSent(false);
    setRequestError(null);
  };

  const openRequestComposer = async () => {
    if (!modalStudent) return;
    setRequestLoading(true);
    setRequestError(null);
    setRequestSent(false);
    try {
      const response = await fetch('/api/profile/me', { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not load your skills');
      const profile = data.profile as { offeredSkills: DiscoverSkill[]; wantedSkills: DiscoverSkill[] };
      setMySkills(profile);
      setRequestOfferedId(profile.offeredSkills[0]?.id || '');
      const matchingWant = profile.wantedSkills.find((wanted) =>
        modalStudent.offeredSkills.some((offered) => offered.skillId === wanted.skillId)
      );
      setRequestWantedId(matchingWant?.id || '');
      setShowRequestComposer(true);
    } catch (err) {
      setRequestError(err instanceof Error ? err.message : 'Could not load your skills');
    } finally {
      setRequestLoading(false);
    }
  };

  const requestableWantedSkills =
    mySkills?.wantedSkills.filter((wanted) =>
      modalStudent?.offeredSkills.some((offered) => offered.skillId === wanted.skillId)
    ) || [];

  const sendExchangeRequest = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!modalStudent) return;
    setRequestLoading(true);
    setRequestError(null);
    try {
      const response = await fetch('/api/exchanges', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: modalStudent.id,
          offeredSkillId: requestOfferedId,
          wantedSkillId: requestWantedId,
          message: requestMessage,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not send exchange request');
      setRequestSent(true);
    } catch (err) {
      setRequestError(err instanceof Error ? err.message : 'Could not send exchange request');
    } finally {
      setRequestLoading(false);
    }
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setSearchQuery('');
    setDeptFilter(ALL);
    setSemFilter(ALL);
    setSkillFilter('');
    setMutualOnly(false);
    setSortBy('score_desc');
    setPage(1);
  };

  const hasActiveFilters =
    Boolean(searchQuery) || deptFilter !== ALL || semFilter !== ALL || Boolean(skillFilter.trim()) || mutualOnly || sortBy !== 'score_desc';

  const filterProps: FilterProps = {
    departments,
    dept: deptFilter,
    sem: semFilter,
    skill: skillFilter,
    mutual: mutualOnly,
    active: deptFilter !== ALL || semFilter !== ALL || Boolean(skillFilter.trim()) || mutualOnly,
    onDept: (value) => {
      setDeptFilter(value);
      setPage(1);
    },
    onSem: (value) => {
      setSemFilter(value);
      setPage(1);
    },
    onSkill: (value) => {
      setSkillFilter(value);
      setPage(1);
    },
    onMutual: (value) => {
      setMutualOnly(value);
      setPage(1);
    },
    onClear: clearAllFilters,
  };

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-6">
        <p className="eyebrow">Discover</p>
        <h1 className="mt-2 text-display-sm font-semibold text-foreground">Find a peer, not a profile.</h1>
        <p className="page-description">
          Search your campus for students whose skills complement yours — then propose a fair exchange.
        </p>
      </header>

      {stats && (
        <div className="grid grid-cols-3 divide-x divide-border overflow-hidden rounded-xl border border-border bg-card">
          <div className="p-4 sm:p-5">
            <p className="text-caption-sm text-muted-foreground">Peers found</p>
            <p className="mt-1 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{stats.totalFound}</p>
          </div>
          <div className="p-4 sm:p-5">
            <p className="text-caption-sm text-muted-foreground">Mutual matches</p>
            <p className="mt-1 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{stats.mutualMatches}</p>
          </div>
          <div className="p-4 sm:p-5">
            <p className="text-caption-sm text-muted-foreground">High match</p>
            <p className="mt-1 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{stats.highMatches}</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[16rem_minmax(0,1fr)] xl:items-start">
        {/* Desktop filter rail */}
        <aside className="hidden xl:block">
          <div className="sticky top-6 rounded-xl border border-border bg-card p-4">
            <FiltersPanel {...filterProps} />
          </div>
        </aside>

        <div className="min-w-0 space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                aria-label="Search peers"
                placeholder="Search by name, skill, department, or roll number…"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2 xl:hidden"
                aria-expanded={showFilters}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filters
                {hasActiveFilters && <span className="h-1.5 w-1.5 rounded-full bg-foreground" />}
              </Button>

              <Select
                value={sortBy}
                onValueChange={(value) => {
                  setSortBy(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-auto min-w-[9.5rem] gap-2 text-caption">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="score_desc">Highest match</SelectItem>
                  <SelectItem value="score_asc">Lowest match</SelectItem>
                  <SelectItem value="name_asc">Name (A–Z)</SelectItem>
                  <SelectItem value="skills_desc">Most skills</SelectItem>
                  <SelectItem value="newest">Newest first</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button variant="ghost" onClick={clearAllFilters} className="hidden gap-1.5 px-2.5 text-muted-foreground sm:inline-flex">
                  <X className="h-3.5 w-3.5" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Mobile filter panel */}
          {showFilters && (
            <div className="rounded-xl border border-border bg-card p-4 xl:hidden">
              <FiltersPanel {...filterProps} />
            </div>
          )}

          {/* Results */}
          {loading ? (
            <DirectorySkeleton />
          ) : error ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-20 text-center">
              <AlertCircle className="h-6 w-6 text-muted-foreground" />
              <p className="mt-3 text-body-sm font-medium text-foreground">Could not load the directory</p>
              <p className="mt-1 text-caption text-muted-foreground">{error}</p>
              <Button variant="outline" size="sm" onClick={() => void fetchStudents()} className="mt-4">
                <RefreshCw className="h-3.5 w-3.5" />
                Try again
              </Button>
            </div>
          ) : students.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-20 text-center">
              <Compass className="h-6 w-6 text-muted-foreground" />
              <p className="mt-3 text-body-sm font-medium text-foreground">No peers match these filters</p>
              <p className="mt-1 max-w-sm text-caption leading-relaxed text-muted-foreground">
                Try widening your search, or check back once more students have listed their skills.
              </p>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearAllFilters} className="mt-4">
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3 text-caption text-muted-foreground">
                <span>
                  Showing <span className="font-medium text-foreground">{students.length}</span> of{' '}
                  <span className="font-medium text-foreground">{totalCount}</span> peers
                </span>
                <span className="font-mono text-caption-sm">
                  {page} / {totalPages}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3">
                {students.map((student) => (
                  <button
                    key={student.id}
                    type="button"
                    onClick={() => void openProfile(student)}
                    className={cn(
                      'group flex h-full flex-col rounded-xl border bg-card p-4 text-left outline-none transition-colors duration-normal sm:p-5',
                      'hover:border-foreground/25 hover:shadow-card-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                      student.match.isMutual ? 'border-success/30' : 'border-border'
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-caption font-semibold text-secondary-foreground">
                          {student.name.charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <h2 className="truncate text-caption font-semibold text-foreground transition-colors group-hover:underline group-hover:decoration-border group-hover:underline-offset-4">
                            {student.name}
                          </h2>
                          <p className="mt-0.5 flex items-center gap-1 truncate text-caption-sm text-muted-foreground">
                            <GraduationCap className="h-3 w-3 shrink-0" />
                            <span className="truncate">{student.department}</span>
                            <span className="text-border">·</span>
                            <span className="shrink-0">Sem {student.semester}</span>
                          </p>
                        </div>
                      </div>

                      <span className={cn('flex shrink-0 flex-col items-center rounded-md border px-2 py-1 text-center', matchTone(student.match.score))}>
                        <span className="text-sm font-semibold leading-none">{student.match.score}%</span>
                        <span className="mt-0.5 text-[0.6rem] uppercase tracking-[0.08em] opacity-70">match</span>
                      </span>
                    </div>

                    {student.match.isMutual && (
                      <Badge variant="success" className="mt-3 w-fit font-normal">
                        <ArrowLeftRight className="h-3 w-3" />
                        Mutual exchange available
                      </Badge>
                    )}

                    {student.bio && (
                      <p className="mt-3 line-clamp-2 text-caption leading-relaxed text-muted-foreground">{student.bio}</p>
                    )}

                    <div className="mt-3 space-y-2 border-t border-border pt-3 text-caption">
                      {student.match.theyCanTeachYou.length > 0 && (
                        <div className="flex items-start gap-2">
                          <BookOpen className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <p className="min-w-0 text-muted-foreground">
                            <span className="text-muted-foreground">Can teach you </span>
                            <span className="font-medium text-foreground">
                              {student.match.theyCanTeachYou.map((skill) => skill.skillName).join(', ')}
                            </span>
                          </p>
                        </div>
                      )}
                      {student.match.youCanTeachThem.length > 0 && (
                        <div className="flex items-start gap-2">
                          <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <p className="min-w-0 text-muted-foreground">
                            <span className="text-muted-foreground">You can teach </span>
                            <span className="font-medium text-foreground">
                              {student.match.youCanTeachThem.map((skill) => skill.skillName).join(', ')}
                            </span>
                          </p>
                        </div>
                      )}
                      {student.match.theyCanTeachYou.length === 0 && student.match.youCanTeachThem.length === 0 && (
                        <div className="flex items-start gap-2 text-muted-foreground">
                          <Layers className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          <span>No direct skill overlap — academic affinity only</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {student.offeredSkills.slice(0, 4).map((skill) => (
                        <Badge key={skill.id} variant="outline" className="font-normal text-muted-foreground">
                          {skill.skill.name}
                        </Badge>
                      ))}
                      {student.offeredSkills.length > 4 && (
                        <Badge variant="muted" className="font-normal">
                          +{student.offeredSkills.length - 4}
                        </Badge>
                      )}
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-3 text-caption-sm">
                      <span className="truncate font-mono text-muted-foreground">{student.rollNumber}</span>
                      <span className="inline-flex shrink-0 items-center gap-1 font-medium text-foreground">
                        View profile
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} showFirstLast className="pt-2" />
            </>
          )}
        </div>
      </div>

      {/* ===== Student profile dialog ===== */}
      <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto p-0">
          {modalLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : modalStudent ? (
            <div className="p-5 sm:p-7">
              <DialogHeader className="pr-8 text-left">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary text-body font-semibold text-secondary-foreground">
                    {modalStudent.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <DialogTitle className="text-heading-lg">{modalStudent.name}</DialogTitle>
                    <DialogDescription className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-caption">
                      <span className="inline-flex items-center gap-1">
                        <GraduationCap className="h-3.5 w-3.5" />
                        {modalStudent.department}
                      </span>
                      <span className="text-border">·</span>
                      <span className="inline-flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5" />
                        Semester {modalStudent.semester}
                      </span>
                      <span className="text-border">·</span>
                      <span className="inline-flex items-center gap-1 font-mono">
                        <Hash className="h-3 w-3" />
                        {modalStudent.rollNumber}
                      </span>
                    </DialogDescription>
                  </div>
                  <span className={cn('hidden shrink-0 flex-col items-center rounded-lg border px-3 py-2 text-center sm:flex', matchTone(modalStudent.match.score))}>
                    <span className="text-lg font-semibold leading-none">{modalStudent.match.score}%</span>
                    <span className="mt-1 text-[0.6rem] uppercase tracking-[0.08em] opacity-70">
                      {modalStudent.match.isMutual ? 'mutual' : 'match'}
                    </span>
                  </span>
                </div>
              </DialogHeader>

              <div className="mt-6 space-y-6">
                {modalStudent.bio && (
                  <p className="rounded-lg border border-border bg-muted/40 p-4 text-caption leading-relaxed text-muted-foreground">
                    {modalStudent.bio}
                  </p>
                )}

                {requestSent ? (
                  <div className="flex items-start gap-2 rounded-lg border border-success/20 bg-success-muted p-3 text-caption text-success">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>
                      Request sent. Track its status in{' '}
                      <Link to="/exchanges" className="font-semibold underline underline-offset-2">
                        Exchange requests
                      </Link>
                      .
                    </span>
                  </div>
                ) : showRequestComposer ? (
                  <form onSubmit={sendExchangeRequest} className="space-y-4 rounded-xl border border-border bg-muted/30 p-4 sm:p-5">
                    <div>
                      <h3 className="text-heading-sm font-semibold text-foreground">Propose an exchange</h3>
                      <p className="mt-1 text-caption leading-relaxed text-muted-foreground">
                        Choose what you can teach and one of your learning goals that {modalStudent.name} offers.
                      </p>
                    </div>

                    {requestError && (
                      <Alert variant="destructive">
                        <AlertDescription>{requestError}</AlertDescription>
                      </Alert>
                    )}

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-caption-sm text-muted-foreground">You can teach</Label>
                        <Select value={requestOfferedId} onValueChange={setRequestOfferedId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose an offered skill" />
                          </SelectTrigger>
                          <SelectContent>
                            {mySkills?.offeredSkills.map((skill) => (
                              <SelectItem key={skill.id} value={skill.id}>
                                {skill.skill.name} · {skill.proficiency}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-caption-sm text-muted-foreground">You want to learn</Label>
                        <Select value={requestWantedId} onValueChange={setRequestWantedId}>
                          <SelectTrigger>
                            <SelectValue placeholder={`A skill ${modalStudent.name} offers`} />
                          </SelectTrigger>
                          <SelectContent>
                            {requestableWantedSkills.map((skill) => (
                              <SelectItem key={skill.id} value={skill.id}>
                                {skill.skill.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {(!mySkills?.offeredSkills.length || !requestableWantedSkills.length) && (
                      <p className="text-caption leading-relaxed text-warning">
                        Add an offered skill and a wanted skill that this student teaches to your profile first.
                      </p>
                    )}

                    <div className="space-y-2">
                      <Label className="text-caption-sm text-muted-foreground">Message (optional)</Label>
                      <Textarea
                        value={requestMessage}
                        onChange={(event) => setRequestMessage(event.target.value)}
                        maxLength={1000}
                        rows={3}
                        placeholder="Introduce yourself and suggest how you could exchange skills…"
                      />
                    </div>

                    <DialogFooter className="gap-2">
                      <Button type="button" variant="ghost" onClick={() => setShowRequestComposer(false)}>
                        Back
                      </Button>
                      <Button type="submit" disabled={requestLoading || !requestOfferedId || !requestWantedId}>
                        {requestLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowLeftRight className="h-3.5 w-3.5" />}
                        Send request
                      </Button>
                    </DialogFooter>
                  </form>
                ) : (
                  <div className="space-y-2">
                    {requestError && (
                      <Alert variant="destructive">
                        <AlertDescription>{requestError}</AlertDescription>
                      </Alert>
                    )}
                    <Button className="w-full" onClick={() => void openRequestComposer()} disabled={requestLoading}>
                      {requestLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowLeftRight className="h-4 w-4" />}
                      Propose a skill exchange
                    </Button>
                  </div>
                )}

                {/* Compatibility */}
                <div className="space-y-4 rounded-xl border border-border bg-muted/30 p-4 sm:p-5">
                  <h3 className="flex items-center gap-2 text-caption-sm font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    <Zap className="h-3.5 w-3.5" />
                    Compatibility
                  </h3>

                  {modalStudent.match.theyCanTeachYou.length > 0 && (
                    <div className="space-y-2">
                      <p className="flex items-center gap-1.5 text-caption font-medium text-foreground">
                        <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                        They can teach you
                      </p>
                      <div className="space-y-1.5">
                        {modalStudent.match.theyCanTeachYou.map((skill) => (
                          <div key={skill.skillId} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2">
                            <span className="text-caption font-medium text-foreground">{skill.skillName}</span>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {skill.theirProficiency && (
                                <Badge variant="outline" className={cn('font-normal', proficiencyBadge(skill.theirProficiency))}>
                                  {skill.theirProficiency}
                                </Badge>
                              )}
                              {skill.yourPriority && (
                                <Badge variant="outline" className={cn('font-normal', priorityBadge(skill.yourPriority))}>
                                  Your {skill.yourPriority.toLowerCase()} priority
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {modalStudent.match.youCanTeachThem.length > 0 && (
                    <div className="space-y-2">
                      <p className="flex items-center gap-1.5 text-caption font-medium text-foreground">
                        <Target className="h-3.5 w-3.5 text-muted-foreground" />
                        You can teach them
                      </p>
                      <div className="space-y-1.5">
                        {modalStudent.match.youCanTeachThem.map((skill) => (
                          <div key={skill.skillId} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2">
                            <span className="text-caption font-medium text-foreground">{skill.skillName}</span>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {skill.yourProficiency && (
                                <Badge variant="outline" className={cn('font-normal', proficiencyBadge(skill.yourProficiency))}>
                                  Your {skill.yourProficiency.toLowerCase()}
                                </Badge>
                              )}
                              {skill.theirPriority && (
                                <Badge variant="outline" className={cn('font-normal', priorityBadge(skill.theirPriority))}>
                                  Their {skill.theirPriority.toLowerCase()} priority
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {modalStudent.match.commonInterests.length > 0 && (
                    <div className="space-y-2">
                      <p className="flex items-center gap-1.5 text-caption font-medium text-foreground">
                        <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                        Shared learning goals
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {modalStudent.match.commonInterests.map((skill) => (
                          <Badge key={skill.skillId} variant="outline" className="font-normal text-muted-foreground">
                            {skill.skillName}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {modalStudent.match.reasons.length > 0 && (
                    <div className="space-y-1.5 border-t border-border pt-3">
                      {modalStudent.match.reasons.map((reason, index) => (
                        <p key={index} className="flex items-start gap-2 text-caption leading-relaxed text-muted-foreground">
                          <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-success" />
                          {reason}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Full skill portfolio */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-border p-4">
                    <h3 className="text-caption font-medium text-foreground">Skills they teach</h3>
                    <div className="mt-3 space-y-2">
                      {modalStudent.offeredSkills.length === 0 ? (
                        <p className="text-caption text-muted-foreground">No offered skills listed.</p>
                      ) : (
                        modalStudent.offeredSkills.map((skill) => (
                          <div key={skill.id} className="flex items-center justify-between gap-2">
                            <span className="truncate text-caption text-foreground">{skill.skill.name}</span>
                            <Badge variant="outline" className={cn('shrink-0 font-normal', proficiencyBadge(skill.proficiency))}>
                              {skill.proficiency}
                            </Badge>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-border p-4">
                    <h3 className="text-caption font-medium text-foreground">Skills they want</h3>
                    <div className="mt-3 space-y-2">
                      {modalStudent.wantedSkills.length === 0 ? (
                        <p className="text-caption text-muted-foreground">No wanted skills listed.</p>
                      ) : (
                        modalStudent.wantedSkills.map((skill) => (
                          <div key={skill.id} className="flex items-center justify-between gap-2">
                            <span className="truncate text-caption text-foreground">{skill.skill.name}</span>
                            <Badge variant="outline" className={cn('shrink-0 font-normal', priorityBadge(skill.priority))}>
                              {skill.priority}
                            </Badge>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Users className="h-6 w-6 text-muted-foreground" />
              <p className="mt-3 text-body-sm text-muted-foreground">Could not load this profile.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

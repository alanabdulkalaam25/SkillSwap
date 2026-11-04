import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import {
  Search,
  Filter,
  Users,
  GraduationCap,
  Layers,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowLeftRight,
  BookOpen,
  Target,
  X,
  Hash,
  Zap,
  TrendingUp,
  Eye,
  Loader2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

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

/* ---------- Badge Helpers ---------- */
const matchBadgeColor = (score: number) => {
  if (score >= 80) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
  if (score >= 50) return 'bg-indigo-100 text-indigo-800 border-indigo-300';
  if (score >= 25) return 'bg-amber-100 text-amber-800 border-amber-300';
  return 'bg-slate-100 text-slate-600 border-slate-300';
};

const matchRingColor = (score: number) => {
  if (score >= 80) return 'ring-emerald-400';
  if (score >= 50) return 'ring-indigo-400';
  if (score >= 25) return 'ring-amber-400';
  return 'ring-slate-300';
};

const proficiencyBadge = (level: string) => {
  const map: Record<string, string> = {
    EXPERT: 'bg-purple-100 text-purple-800',
    ADVANCED: 'bg-blue-100 text-blue-800',
    INTERMEDIATE: 'bg-teal-100 text-teal-800',
    BEGINNER: 'bg-slate-100 text-slate-600',
  };
  return map[level] || 'bg-slate-100 text-slate-600';
};

const priorityBadge = (level: string) => {
  const map: Record<string, string> = {
    HIGH: 'bg-rose-100 text-rose-800',
    MEDIUM: 'bg-amber-100 text-amber-800',
    LOW: 'bg-slate-100 text-slate-600',
  };
  return map[level] || 'bg-slate-100 text-slate-600';
};

/* ---------- Main Component ---------- */
export const DiscoverPage: React.FC = () => {
  const { token } = useAuth();

  const [students, setStudents] = useState<DiscoverStudent[]>([]);
  const [stats, setStats] = useState<DiscoverResponse['stats'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [semFilter, setSemFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [mutualOnly, setMutualOnly] = useState(false);
  const [sortBy, setSortBy] = useState('score_desc');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Departments list for filter dropdown
  const [departments, setDepartments] = useState<string[]>([]);

  // Profile modal
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

  // Filter panel toggle (mobile)
  const [showFilters, setShowFilters] = useState(false);

  // Fetch departments on mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await fetch('/api/students/departments', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setDepartments(data.departments || []);
        }
      } catch (_) {}
    };
    fetchDepartments();
  }, [token]);

  // Fetch students on filter/page change
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (deptFilter) params.set('department', deptFilter);
      if (semFilter) params.set('semester', semFilter);
      if (skillFilter) params.set('skill', skillFilter);
      if (mutualOnly) params.set('mutualOnly', 'true');
      params.set('sort', sortBy);
      params.set('page', page.toString());
      params.set('limit', '20');

      const res = await fetch(`/api/students/discover?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch student directory');
      }

      const data: DiscoverResponse = await res.json();
      setStudents(data.students);
      setStats(data.stats);
      setTotalPages(data.totalPages);
      setTotalCount(data.total);
    } catch (err: any) {
      setError(err.message || 'Failed to load discover directory');
    } finally {
      setLoading(false);
    }
  }, [token, searchQuery, deptFilter, semFilter, skillFilter, mutualOnly, sortBy, page]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Debounced search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  // Open student profile modal
  const openProfile = async (student: DiscoverStudent) => {
    setSelectedStudent(student);
    setModalLoading(true);
    try {
      const res = await fetch(`/api/students/${student.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
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
      const matchingWant = profile.wantedSkills.find((wanted) => modalStudent.offeredSkills.some((offered) => offered.skillId === wanted.skillId));
      setRequestWantedId(matchingWant?.id || '');
      setShowRequestComposer(true);
    } catch (err) {
      setRequestError(err instanceof Error ? err.message : 'Could not load your skills');
    } finally {
      setRequestLoading(false);
    }
  };

  const requestableWantedSkills = mySkills?.wantedSkills.filter((wanted) =>
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
    setDeptFilter('');
    setSemFilter('');
    setSkillFilter('');
    setMutualOnly(false);
    setSortBy('score_desc');
    setPage(1);
  };

  const hasActiveFilters =
    searchQuery || deptFilter || semFilter || skillFilter || mutualOnly || sortBy !== 'score_desc';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-900 via-indigo-800 to-purple-950 text-white p-8 sm:p-10 shadow-xl shadow-indigo-900/10 border border-indigo-700/50">
          <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center space-x-2 bg-purple-500/20 text-purple-200 border border-purple-400/30 px-3 py-1 rounded-full text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span>Phase 3 • Discover Directory & Smart Matching Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Discover Campus Peers
            </h1>
            <p className="text-sm text-indigo-200/90 max-w-2xl">
              Browse the student directory and find peers whose skills complement yours.
              The matching engine scores mutual exchange compatibility — find your ideal skill swap partners.
            </p>
          </div>
        </div>

        {/* Stats Row */}
        {stats && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <div className="text-xl font-extrabold text-slate-900">{stats.totalFound}</div>
                <div className="text-[11px] text-slate-500 font-medium">Peers Found</div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <ArrowLeftRight className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-xl font-extrabold text-slate-900">{stats.mutualMatches}</div>
                <div className="text-[11px] text-slate-500 font-medium">Mutual Matches</div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="text-xl font-extrabold text-slate-900">{stats.highMatches}</div>
                <div className="text-[11px] text-slate-500 font-medium">High Match (≥70%)</div>
              </div>
            </div>
          </div>
        )}

        {/* Search & Filters */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Search Bar */}
          <div className="p-4 flex items-center space-x-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, skill, department, or roll number..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border text-xs font-semibold transition ${
                showFilters || hasActiveFilters
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              )}
              <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center space-x-1 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition"
              >
                <X className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="px-4 pb-4 border-t border-slate-100 pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Department */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                  Department
                </label>
                <select
                  value={deptFilter}
                  onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="">All Departments</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Semester */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                  Semester
                </label>
                <select
                  value={semFilter}
                  onChange={(e) => { setSemFilter(e.target.value); setPage(1); }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="">All Semesters</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>

              {/* Skill */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                  Skill
                </label>
                <input
                  type="text"
                  placeholder="e.g. React, Python..."
                  value={skillFilter}
                  onChange={(e) => { setSkillFilter(e.target.value); setPage(1); }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              {/* Sort */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="score_desc">Highest Match</option>
                  <option value="score_asc">Lowest Match</option>
                  <option value="name_asc">Name (A–Z)</option>
                  <option value="skills_desc">Most Skills</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>

              {/* Mutual Only Toggle */}
              <div className="flex items-end">
                <button
                  onClick={() => { setMutualOnly(!mutualOnly); setPage(1); }}
                  className={`w-full inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-lg border text-xs font-semibold transition ${
                    mutualOnly
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>{mutualOnly ? 'Mutual Only ✓' : 'Mutual Only'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            <p className="text-sm text-slate-500 font-medium">Scanning campus peer directory...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <AlertCircle className="w-10 h-10 text-rose-400" />
            <p className="text-sm text-rose-600 font-semibold">{error}</p>
            <button
              onClick={fetchStudents}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Users className="w-10 h-10 text-slate-300" />
            <p className="text-sm text-slate-500 font-medium">No peers match your current filters.</p>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                Clear all filters →
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Result Count */}
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing <span className="font-bold text-slate-700">{students.length}</span> of{' '}
                <span className="font-bold text-slate-700">{totalCount}</span> peers
              </span>
              <span className="font-medium">
                Page {page} of {totalPages}
              </span>
            </div>

            {/* Student Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {students.map((student) => (
                <div
                  key={student.id}
                  onClick={() => openProfile(student)}
                  className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group overflow-hidden ${
                    student.match.isMutual
                      ? 'border-emerald-200/80 hover:border-emerald-300'
                      : 'border-slate-200/80 hover:border-indigo-200'
                  }`}
                >
                  {/* Match Score Bar */}
                  <div
                    className={`h-1.5 transition-all ${
                      student.match.score >= 80
                        ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                        : student.match.score >= 50
                        ? 'bg-gradient-to-r from-indigo-400 to-indigo-500'
                        : student.match.score >= 25
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                        : 'bg-slate-200'
                    }`}
                    style={{ width: `${Math.max(student.match.score, 5)}%` }}
                  />

                  <div className="p-5 space-y-4">
                    {/* Header Row */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-lg flex items-center justify-center shadow-sm ring-2 ring-offset-2 ${matchRingColor(student.match.score)}`}
                        >
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-700 transition">
                            {student.name}
                          </h3>
                          <div className="flex items-center space-x-1.5 text-[11px] text-slate-500">
                            <GraduationCap className="w-3 h-3" />
                            <span>{student.department}</span>
                            <span className="text-slate-300">•</span>
                            <span>Sem {student.semester}</span>
                          </div>
                        </div>
                      </div>

                      {/* Match Score Badge */}
                      <div
                        className={`flex flex-col items-center px-2.5 py-1.5 rounded-xl border text-center ${matchBadgeColor(student.match.score)}`}
                      >
                        <span className="text-lg font-extrabold leading-none">{student.match.score}%</span>
                        <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5">Match</span>
                      </div>
                    </div>

                    {/* Bio */}
                    {student.bio && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed italic">
                        "{student.bio}"
                      </p>
                    )}

                    {/* Mutual Badge */}
                    {student.match.isMutual && (
                      <div className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg text-[11px] font-bold">
                        <ArrowLeftRight className="w-3 h-3" />
                        <span>Mutual Exchange Available</span>
                      </div>
                    )}

                    {/* Skill Exchange Preview */}
                    <div className="space-y-2">
                      {student.match.theyCanTeachYou.length > 0 && (
                        <div className="flex items-start space-x-2">
                          <div className="w-5 h-5 rounded bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                            <BookOpen className="w-3 h-3 text-blue-600" />
                          </div>
                          <div className="text-[11px]">
                            <span className="text-slate-500">Can teach you: </span>
                            <span className="font-semibold text-slate-700">
                              {student.match.theyCanTeachYou.map((s) => s.skillName).join(', ')}
                            </span>
                          </div>
                        </div>
                      )}
                      {student.match.youCanTeachThem.length > 0 && (
                        <div className="flex items-start space-x-2">
                          <div className="w-5 h-5 rounded bg-violet-50 flex items-center justify-center shrink-0 mt-0.5">
                            <Target className="w-3 h-3 text-violet-600" />
                          </div>
                          <div className="text-[11px]">
                            <span className="text-slate-500">You can teach: </span>
                            <span className="font-semibold text-slate-700">
                              {student.match.youCanTeachThem.map((s) => s.skillName).join(', ')}
                            </span>
                          </div>
                        </div>
                      )}
                      {student.match.theyCanTeachYou.length === 0 && student.match.youCanTeachThem.length === 0 && (
                        <div className="flex items-start space-x-2">
                          <div className="w-5 h-5 rounded bg-slate-50 flex items-center justify-center shrink-0 mt-0.5">
                            <Layers className="w-3 h-3 text-slate-400" />
                          </div>
                          <div className="text-[11px] text-slate-400 italic">
                            No direct skill overlap — academic affinity score only
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Skills Pills (compact) */}
                    <div className="flex flex-wrap gap-1.5">
                      {student.offeredSkills.slice(0, 4).map((s) => (
                        <span
                          key={s.id}
                          className="text-[10px] font-medium bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md"
                        >
                          {s.skill.name}
                        </span>
                      ))}
                      {student.offeredSkills.length > 4 && (
                        <span className="text-[10px] font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">
                          +{student.offeredSkills.length - 4} more
                        </span>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-[11px] text-slate-400 font-mono">{student.rollNumber}</span>
                      <span className="text-[11px] font-bold text-indigo-600 group-hover:text-indigo-800 flex items-center gap-1 transition">
                        View Profile <Eye className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-4 pt-4">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="inline-flex items-center space-x-1 px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
                <span className="text-xs font-bold text-slate-600">
                  {page} / {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="inline-flex items-center space-x-1 px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* ===== Full Profile Modal ===== */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />

          {/* Modal Content */}
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>

            {modalLoading ? (
              <div className="flex items-center justify-center py-32">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              </div>
            ) : modalStudent ? (
              <div className="p-6 sm:p-8 space-y-6">
                {/* Profile Header */}
                <div className="flex items-start space-x-4">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-2xl flex items-center justify-center shadow-lg ring-3 ring-offset-2 ${matchRingColor(modalStudent.match.score)}`}
                  >
                    {modalStudent.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-extrabold text-slate-900">{modalStudent.name}</h2>
                    <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                        {modalStudent.department}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        Semester {modalStudent.semester}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1 font-mono">
                        <Hash className="w-3 h-3" />
                        {modalStudent.rollNumber}
                      </span>
                    </div>
                  </div>

                  {/* Match Score */}
                  <div
                    className={`flex flex-col items-center px-4 py-3 rounded-2xl border ${matchBadgeColor(modalStudent.match.score)}`}
                  >
                    <span className="text-2xl font-extrabold leading-none">{modalStudent.match.score}%</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider mt-1">
                      {modalStudent.match.isMutual ? '⇄ Mutual' : 'Match'}
                    </span>
                  </div>
                </div>

                {/* Bio */}
                {modalStudent.bio && (
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <p className="text-xs text-slate-600 italic leading-relaxed">"{modalStudent.bio}"</p>
                  </div>
                )}

                {requestSent ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                    Exchange request sent. You can follow its status in <a className="font-bold underline" href="/exchanges">Exchange Requests</a>.
                  </div>
                ) : showRequestComposer ? (
                  <form onSubmit={sendExchangeRequest} className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-5 space-y-4">
                    <div>
                      <h3 className="font-bold text-slate-900">Propose a skill exchange</h3>
                      <p className="mt-1 text-xs text-slate-500">Choose what you can teach and one of your learning goals that {modalStudent.name} offers.</p>
                    </div>
                    {requestError && <p role="alert" className="rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700">{requestError}</p>}
                    <div className="grid sm:grid-cols-2 gap-3">
                      <label className="text-xs font-semibold text-slate-600">
                        You can teach
                        <select value={requestOfferedId} onChange={(event) => setRequestOfferedId(event.target.value)} required className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm">
                          <option value="">Choose an offered skill</option>
                          {mySkills?.offeredSkills.map((skill) => <option key={skill.id} value={skill.id}>{skill.skill.name} · {skill.proficiency}</option>)}
                        </select>
                      </label>
                      <label className="text-xs font-semibold text-slate-600">
                        You want to learn
                        <select value={requestWantedId} onChange={(event) => setRequestWantedId(event.target.value)} required className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm">
                          <option value="">Choose a skill {modalStudent.name} offers</option>
                          {requestableWantedSkills.map((skill) => <option key={skill.id} value={skill.id}>{skill.skill.name} · {skill.priority} priority</option>)}
                        </select>
                      </label>
                    </div>
                    {(!mySkills?.offeredSkills.length || !requestableWantedSkills.length) && (
                      <p className="text-xs text-amber-700">To propose this exchange, add an offered skill and a wanted skill that this student offers to your profile.</p>
                    )}
                    <label className="block text-xs font-semibold text-slate-600">
                      Message (optional)
                      <textarea value={requestMessage} onChange={(event) => setRequestMessage(event.target.value)} maxLength={1000} rows={3} placeholder="Introduce yourself and suggest how you could exchange skills…" className="mt-1 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal" />
                    </label>
                    <div className="flex flex-wrap justify-end gap-2">
                      <button type="button" onClick={() => setShowRequestComposer(false)} className="rounded-lg px-4 py-2 text-xs font-bold text-slate-600 hover:bg-white">Back to profile</button>
                      <button type="submit" disabled={requestLoading || !requestOfferedId || !requestWantedId} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50">
                        {requestLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowLeftRight className="w-3.5 h-3.5" />}
                        Send request
                      </button>
                    </div>
                  </form>
                ) : (
                  <button onClick={() => void openRequestComposer()} disabled={requestLoading} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60">
                    {requestLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowLeftRight className="w-4 h-4" />}
                    Send Exchange Request
                  </button>
                )}

                {/* Match Breakdown */}
                <div className="bg-gradient-to-br from-indigo-50/50 to-violet-50/50 rounded-2xl p-5 border border-indigo-100 space-y-4">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Zap className="w-4 h-4 text-indigo-600" />
                    Skill Exchange Compatibility Breakdown
                  </h3>

                  {/* They Can Teach You */}
                  {modalStudent.match.theyCanTeachYou.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold text-blue-700 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        Skills they can teach you:
                      </div>
                      <div className="space-y-1.5">
                        {modalStudent.match.theyCanTeachYou.map((s) => (
                          <div
                            key={s.skillId}
                            className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-blue-100"
                          >
                            <span className="text-xs font-semibold text-slate-800">{s.skillName}</span>
                            <div className="flex items-center space-x-2">
                              {s.theirProficiency && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${proficiencyBadge(s.theirProficiency)}`}>
                                  {s.theirProficiency}
                                </span>
                              )}
                              {s.yourPriority && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${priorityBadge(s.yourPriority)}`}>
                                  Your {s.yourPriority} Priority
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* You Can Teach Them */}
                  {modalStudent.match.youCanTeachThem.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold text-violet-700 flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5" />
                        Skills you can teach them:
                      </div>
                      <div className="space-y-1.5">
                        {modalStudent.match.youCanTeachThem.map((s) => (
                          <div
                            key={s.skillId}
                            className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-violet-100"
                          >
                            <span className="text-xs font-semibold text-slate-800">{s.skillName}</span>
                            <div className="flex items-center space-x-2">
                              {s.yourProficiency && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${proficiencyBadge(s.yourProficiency)}`}>
                                  Your {s.yourProficiency}
                                </span>
                              )}
                              {s.theirPriority && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${priorityBadge(s.theirPriority)}`}>
                                  Their {s.theirPriority} Priority
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Common Learning Interests */}
                  {modalStudent.match.commonInterests.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold text-amber-700 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Study Buddy — Shared learning goals:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {modalStudent.match.commonInterests.map((s) => (
                          <span
                            key={s.skillId}
                            className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-lg"
                          >
                            {s.skillName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reasons */}
                  <div className="pt-2 border-t border-indigo-100 space-y-1">
                    {modalStudent.match.reasons.map((reason, i) => (
                      <div key={i} className="flex items-start space-x-2 text-[11px] text-slate-600">
                        <CheckCircle2 className="w-3 h-3 text-indigo-500 mt-0.5 shrink-0" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Full Skill Portfolio */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Offered Skills */}
                  <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Skills They Teach ({modalStudent.offeredSkills.length})
                    </h4>
                    {modalStudent.offeredSkills.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic">No offered skills listed</p>
                    ) : (
                      <div className="space-y-2">
                        {modalStudent.offeredSkills.map((s) => (
                          <div key={s.id} className="flex items-center justify-between">
                            <span className="text-xs text-slate-700 font-medium">{s.skill.name}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${proficiencyBadge(s.proficiency || '')}`}>
                              {s.proficiency}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Wanted Skills */}
                  <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Skills They Want ({modalStudent.wantedSkills.length})
                    </h4>
                    {modalStudent.wantedSkills.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic">No wanted skills listed</p>
                    ) : (
                      <div className="space-y-2">
                        {modalStudent.wantedSkills.map((s) => (
                          <div key={s.id} className="flex items-center justify-between">
                            <span className="text-xs text-slate-700 font-medium">{s.skill.name}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${priorityBadge(s.priority || '')}`}>
                              {s.priority}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

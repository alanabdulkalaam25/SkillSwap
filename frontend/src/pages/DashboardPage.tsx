import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { 
  CheckCircle2, 
  ShieldCheck, 
  GraduationCap, 
  Hash, 
  Mail, 
  Layers, 
  Database, 
  Server, 
  Cpu, 
  Sparkles,
  ArrowRight,
  Users,
  Repeat,
  Award,
  UserCheck
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 text-white p-8 sm:p-10 shadow-xl shadow-indigo-900/10 border border-indigo-700/50">
          <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center space-x-2 bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                <span>Phase 3 Operational • Discover Directory & Smart Matching Live</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome to Campus SkillSwap, {user.name}!
              </h1>
              <p className="text-sm text-indigo-200/90 max-w-xl">
                Your college identity has been verified. Browse the campus peer directory, discover skill swap partners with smart compatibility scoring, and manage your skills portfolio.
              </p>
              <div className="pt-2 flex items-center space-x-3">
                <NavLink
                  to="/discover"
                  className="inline-flex items-center space-x-2 bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition"
                >
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>Discover Peers</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </NavLink>
                <NavLink
                  to="/profile"
                  className="inline-flex items-center space-x-2 bg-indigo-500/20 text-white hover:bg-indigo-500/30 font-bold text-xs px-4 py-2.5 rounded-xl border border-indigo-400/30 transition"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Manage Skills & Bio</span>
                </NavLink>
              </div>
            </div>

            {/* Verified badge card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl flex items-center space-x-4 self-start md:self-auto">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-indigo-200 font-medium">Institutional Status</div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  Verified Student <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-[11px] text-indigo-300/80 font-mono mt-0.5">{user.rollNumber}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Grid: Student Profile Card & Active Phase 2 Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student Profile Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase">
                  Student Identity Card
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active
                </span>
              </div>

              <div className="flex items-center space-x-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white font-bold text-xl flex items-center justify-center shadow-md shadow-indigo-100">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{user.name}</h4>
                  <div className="flex items-center text-xs text-slate-500 mt-0.5">
                    <Mail className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    <span>{user.email}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 bg-slate-50 rounded-2xl p-4 border border-slate-200/60 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-slate-400" /> Department
                  </span>
                  <span className="font-semibold text-slate-800 text-right">{user.department}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-slate-400" /> Current Semester
                  </span>
                  <span className="font-semibold text-slate-800">Semester {user.semester}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Hash className="w-4 h-4 text-slate-400" /> Roll Number
                  </span>
                  <span className="font-mono font-semibold text-slate-800">{user.rollNumber}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-slate-400" /> Platform Role
                  </span>
                  <span className="font-semibold text-indigo-700">{user.role}</span>
                </div>
              </div>

              {user.bio && (
                <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 line-clamp-3 italic">
                  "{user.bio}"
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <NavLink
                to="/profile"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                Configure Skills & Bio <ArrowRight className="w-3 h-3" />
              </NavLink>
              <span className="text-[11px] text-slate-400 font-mono">Sem {user.semester}</span>
            </div>
          </div>

          {/* Phase 1 & 2 Verification Status Matrix */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase">
                    Platform Operational Status Matrix
                  </h3>
                </div>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Phases 1, 2 & 3 Complete
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <h5 className="text-xs font-bold text-slate-800">Auth Gatekeeper & Roles</h5>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Domain restrictions (@gec.ac.in, @college.edu), unique roll numbers, bcrypt salted passwords, signed JWT.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <h5 className="text-xs font-bold text-slate-800">Master Skills Catalog</h5>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Seeded with 30+ skills across Programming, AI/ML, Design, Hardware & Academics with search filter.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <h5 className="text-xs font-bold text-slate-800">Skills I Can Teach (Offered)</h5>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Beginner to Expert proficiencies, experience notes, deduplication and relational cascades.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <h5 className="text-xs font-bold text-slate-800">Skills I Want (Wanted)</h5>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Low to High learning priorities, project notes, real-time deletion and PostgreSQL persistence.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <h5 className="text-xs font-bold text-slate-800">Discover & Smart Matching</h5>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Peer directory with mutual match scoring, multi-criteria filters, department & semester bonuses.
                  </p>
                </div>
              </div>
            </div>

            {/* Architecture stack pill row */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap gap-2 text-[11px] font-medium text-slate-600">
              <span className="bg-slate-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
                <Server className="w-3 h-3 text-slate-500" /> Fastify v4
              </span>
              <span className="bg-slate-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
                <Database className="w-3 h-3 text-slate-500" /> PostgreSQL
              </span>
              <span className="bg-slate-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
                <Cpu className="w-3 h-3 text-slate-500" /> Prisma ORM
              </span>
              <span className="bg-slate-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
                <Award className="w-3 h-3 text-slate-500" /> Master Catalog
              </span>
            </div>
          </div>
        </div>

        {/* Roadmap Next Phases Preview */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase">
                Upcoming Roadmap Phases
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pipelines designed for seamless execution
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
              Phase 4 Up Next
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50/30 flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-3 shadow-sm">
                  <Users className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">Phase 3: Discover & Matching Engine</h4>
                <p className="text-[11px] text-slate-600 mt-1">
                  Peer directory with mutual match compatibility scoring (+50% mutual, +25% one-way, department/semester bonuses).
                </p>
              </div>
              <div className="mt-4 text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                ✅ Completed
              </div>
            </div>

            <div className="p-4 rounded-2xl border-2 border-indigo-200 bg-indigo-50/30 flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-3 shadow-sm">
                  <Repeat className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">Phase 4: Skill Exchange Requests</h4>
                <p className="text-[11px] text-slate-600 mt-1">
                  Propose, accept, reject skill swaps and unlock verified peer communication channels.
                </p>
              </div>
              <div className="mt-4 text-[11px] font-bold text-indigo-600 flex items-center gap-1">
                Ready to Trigger <ArrowRight className="w-3 h-3" />
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-800">Phase 5: College Admin Dashboard</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Campus-wide metrics, student roster moderation, and global skill approvals.
                </p>
              </div>
              <div className="mt-4 text-[11px] font-medium text-slate-400">Scheduled</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

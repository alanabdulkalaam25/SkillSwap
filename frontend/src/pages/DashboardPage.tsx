import React from 'react';
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
  BookOpen,
  Users,
  Repeat
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 text-white p-8 sm:p-10 shadow-xl shadow-indigo-900/10 border border-indigo-700/50">
          <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                <span>Phase 1 Gatekeeper Active</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Welcome to Campus SkillSwap, {user.name}!
              </h1>
              <p className="text-sm text-indigo-200/80 max-w-xl">
                Your college identity has been verified through our institutional authentication gatekeeper. You are ready to participate in student skill exchange.
              </p>
            </div>

            {/* Verified badge card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center space-x-4 self-start md:self-auto">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-indigo-200 font-medium">Verification Status</div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  Verified Student <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-[11px] text-indigo-300/80 font-mono">{user.rollNumber}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Grid: Student Profile Card & Phase 1 Verification Status */}
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
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Account ID: {user.id.slice(0, 8)}...</span>
              <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Phase 1 Verification Checklist */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase">
                    Phase 1 Gatekeeper Verification Matrix
                  </h3>
                </div>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  100% Operational
                </span>
              </div>

              <div className="space-y-3.5">
                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex items-start space-x-3.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">College Domain & Roll Validation</h5>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Registration verifies institutional email domains and ensures unique student roll numbers across the campus.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex items-start space-x-3.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">Fastify REST Backend & JWT Auth</h5>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Fastify server issuing signed JWT tokens with bcrypt salt hashing (10 rounds) and protected route middleware.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex items-start space-x-3.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">PostgreSQL Schema & Prisma ORM</h5>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Persistent User relational model with UUID, role constraints, department and semester tracking.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex items-start space-x-3.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">Session Persistence via GET /api/auth/me</h5>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Full page refresh immediately validates stored token and hydrates student session without logout.
                    </p>
                  </div>
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
                <ShieldCheck className="w-3 h-3 text-slate-500" /> JWT Bearer
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
                Prepared pipelines waiting for sequential execution
              </p>
            </div>
            <span className="text-xs text-slate-400 font-medium">Ready for Phase 2</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-800">Phase 2: Skill Catalog & Profile</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Manage offered & wanted skills with proficiency levels and bio.
                </p>
              </div>
              <div className="mt-4 text-[11px] font-semibold text-indigo-600 flex items-center gap-1">
                Next in Queue <ArrowRight className="w-3 h-3" />
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-3">
                  <Users className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-800">Phase 3: Matching Engine</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Compatibility algorithm (mutual skills, same department/semester bonus).
                </p>
              </div>
              <div className="mt-4 text-[11px] font-medium text-slate-400">Scheduled</div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                  <Repeat className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-800">Phase 4: Exchange Requests</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Transaction workflow: propose, accept, unlock peer contact channels.
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

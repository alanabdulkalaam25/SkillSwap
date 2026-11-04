import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, LogOut, GraduationCap } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight">SkillSwap</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                Campus Edition
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Peer-to-Peer Student Exchange</p>
          </div>
        </div>

        {/* User Actions */}
        {user && (
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-left text-xs">
                <div className="flex items-center space-x-1.5 font-semibold text-slate-800">
                  <span>{user.name}</span>
                  {user.role === 'ADMIN' ? (
                    <span className="inline-flex items-center text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-medium">
                      Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded font-medium">
                      Student
                    </span>
                  )}
                </div>
                <div className="text-slate-500 flex items-center space-x-2">
                  <span className="flex items-center gap-0.5">
                    <GraduationCap className="w-3 h-3 text-slate-400" />
                    {user.department} • Sem {user.semester}
                  </span>
                  <span>|</span>
                  <span className="font-mono text-[11px]">{user.rollNumber}</span>
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              title="Logout from SkillSwap"
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 bg-slate-100/80 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 px-3 py-2 rounded-xl transition duration-150"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

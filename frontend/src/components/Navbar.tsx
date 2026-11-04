import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, LogOut, GraduationCap, LayoutDashboard, UserCheck, Search, ArrowLeftRight } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Nav */}
        <div className="flex items-center space-x-6">
          <NavLink to="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform duration-200">
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
          </NavLink>

          {/* Navigation Links */}
          {user && (
            <nav className="hidden sm:flex items-center space-x-1 pl-4 border-l border-slate-200">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </NavLink>

              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>My Profile & Skills</span>
              </NavLink>

              <NavLink
                to="/discover"
                className={({ isActive }) =>
                  `flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <Search className="w-3.5 h-3.5" />
                <span>Discover Peers</span>
              </NavLink>

              <NavLink
                to="/exchanges"
                className={({ isActive }) =>
                  `flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Exchanges</span>
              </NavLink>
            </nav>
          )}
        </div>

        {/* User Actions */}
        {user && (
          <div className="flex items-center space-x-3 sm:space-x-4">
            <NavLink
              to="/profile"
              className="flex items-center space-x-3 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200/80 hover:border-indigo-200 px-3 py-1.5 rounded-xl transition duration-150"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block text-left text-xs">
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
            </NavLink>

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

      {/* Mobile Subnav */}
      {user && (
        <div className="sm:hidden flex border-t border-slate-200 bg-slate-50/90 px-4 py-1.5 space-x-2">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex-1 text-center py-1.5 text-xs font-medium rounded-lg ${
                isActive ? 'bg-white shadow-xs text-indigo-600 font-bold' : 'text-slate-600'
              }`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex-1 text-center py-1.5 text-xs font-medium rounded-lg ${
                isActive ? 'bg-white shadow-xs text-indigo-600 font-bold' : 'text-slate-600'
              }`
            }
          >
            My Profile
          </NavLink>
          <NavLink
            to="/discover"
            className={({ isActive }) =>
              `flex-1 text-center py-1.5 text-xs font-medium rounded-lg ${
                isActive ? 'bg-white shadow-xs text-indigo-600 font-bold' : 'text-slate-600'
              }`
            }
          >
            Discover
          </NavLink>
          <NavLink
            to="/exchanges"
            className={({ isActive }) =>
              `flex-1 text-center py-1.5 text-xs font-medium rounded-lg ${
                isActive ? 'bg-white shadow-xs text-indigo-600 font-bold' : 'text-slate-600'
              }`
            }
          >
            Exchanges
          </NavLink>
        </div>
      )}
    </header>
  );
};

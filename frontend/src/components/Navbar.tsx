import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import {
  ArrowLeftRight,
  BookOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Search,
  Shield,
  Sun,
  UserRound,
  X,
} from 'lucide-react';

const routes = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/discover', label: 'Discover', icon: Search },
  { to: '/exchanges', label: 'Exchanges', icon: ArrowLeftRight },
  { to: '/profile', label: 'Profile', icon: UserRound },
];

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isPublic = !user || location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register';

  const routeLink = (to: string, label: string, Icon: typeof Search, compact = false) => (
    <NavLink
      key={to}
      to={to}
      title={compact ? label : undefined}
      aria-label={compact ? label : undefined}
      className={({ isActive }) =>
        `inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
          isActive ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
        } ${compact ? 'justify-center px-2.5' : ''}`
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!compact && <span>{label}</span>}
    </NavLink>
  );

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
        <div className="app-container flex h-14 items-center justify-between gap-3">
          <Link to="/" className="flex min-w-0 items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="SkillSwap home">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BookOpen className="h-4 w-4" />
            </span>
            <span className="font-semibold tracking-tight text-foreground">SkillSwap</span>
            <span className="hidden text-xs text-muted-foreground sm:inline">Campus</span>
          </Link>

          {!isPublic && user && (
            <>
              <nav className="hidden items-center gap-1 xl:flex" aria-label="Main navigation">
                {routes.map(({ to, label, icon }) => routeLink(to, label, icon))}
                {user.role === 'ADMIN' && routeLink('/admin', 'Admin', Shield)}
              </nav>
              <nav className="hidden items-center gap-1 md:flex xl:hidden" aria-label="Main navigation">
                {routes.map(({ to, label, icon }) => routeLink(to, label, icon, true))}
                {user.role === 'ADMIN' && routeLink('/admin', 'Admin', Shield, true)}
              </nav>
            </>
          )}

          <div className="flex shrink-0 items-center gap-1.5">
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}>
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>

            {isPublic ? (
              <div className="hidden items-center gap-2 sm:flex">
                {user ? (
                  <Link to="/dashboard" className="inline-flex h-9 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium text-foreground hover:bg-accent">
                    Workspace <LayoutDashboard className="h-4 w-4" />
                  </Link>
                ) : (
                  <>
                    <Link to="/login" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Log in</Link>
                    <Link to="/register" className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">Create account</Link>
                  </>
                )}
              </div>
            ) : user ? (
              <>
                <Link to="/profile" className="hidden max-w-40 items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground xl:flex">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">{user.name.charAt(0).toUpperCase()}</span>
                  <span className="truncate">{user.name}</span>
                </Link>
                <Button variant="ghost" size="icon" className="hidden md:inline-flex xl:hidden" onClick={logout} aria-label="Sign out">
                  <LogOut className="h-4 w-4" />
                </Button>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden" aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}>
                      {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-64 sm:w-72 p-0">
                    <div className="p-4 border-b border-border">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-base font-semibold text-secondary-foreground">{user.name.charAt(0).toUpperCase()}</span>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{user.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    <nav className="p-2 space-y-1" aria-label="Mobile navigation">
                      {routes.map(({ to, label, icon: Icon }) => (
                        <NavLink key={to} to={to} onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}>
                          <Icon className="h-4 w-4 shrink-0" />
                          <span>{label}</span>
                        </NavLink>
                      ))}
                      {user.role === 'ADMIN' && (
                        <NavLink to="/admin" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}>
                          <Shield className="h-4 w-4 shrink-0" />
                          <span>Admin</span>
                        </NavLink>
                      )}
                      <Button variant="ghost" className="w-full justify-start text-muted-foreground mt-2" onClick={() => { setMobileMenuOpen(false); logout(); }}>
                        <LogOut className="h-4 w-4" />
                        <span>Sign out</span>
                      </Button>
                    </nav>
                  </SheetContent>
                </Sheet>
                <Button variant="ghost" className="hidden h-9 px-2.5 text-muted-foreground xl:inline-flex" onClick={logout}>
                  <LogOut className="h-4 w-4" />
                  <span className="sr-only">Log out</span>
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </header>

      {!isPublic && user && (
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-2 pt-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))] backdrop-blur md:hidden" aria-label="Mobile bottom navigation">
          <div className="mx-auto grid max-w-xl grid-cols-4 gap-1">
            {routes.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={({ isActive }) => `flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-md text-caption font-medium transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </>
  );
};
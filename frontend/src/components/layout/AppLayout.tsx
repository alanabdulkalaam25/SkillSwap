import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  ArrowLeftRight,
  LayoutDashboard,
  LogOut,
  Search,
  Shield,
  UserRound,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '../../lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface NavItem {
  to: string;
  label: string;
  icon: typeof Search;
}

const baseNav: NavItem[] = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/discover', label: 'Discover', icon: Search },
  { to: '/exchanges', label: 'Exchanges', icon: ArrowLeftRight },
  { to: '/profile', label: 'Profile', icon: UserRound },
];

const NavRow: React.FC<{ item: NavItem; onNavigate?: () => void }> = ({ item, onNavigate }) => {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      className={({ isActive }) => cn('nav-item', isActive && 'nav-item-active')}
    >
      <Icon className="h-[1.05rem] w-[1.05rem] shrink-0" />
      <span>{item.label}</span>
    </NavLink>
  );
};

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  if (!user) return null;

  const navItems = user.role === 'ADMIN'
    ? [...baseNav, { to: '/admin', label: 'Admin', icon: Shield }]
    : baseNav;

  const initials = user.name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      {/* ---------- Desktop sidebar ---------- */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-border bg-background lg:flex">
        <div className="flex h-14 items-center border-b border-border px-5">
          <Logo />
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <p className="eyebrow px-3 pb-2 text-[0.68rem]">Workspace</p>
          <nav className="space-y-0.5" aria-label="Main navigation">
            {navItems.map((item) => (
              <NavRow key={item.to} item={item} />
            ))}
          </nav>
        </div>

        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2.5 rounded-md px-2 py-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-caption font-semibold text-secondary-foreground">
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-caption font-medium text-foreground">{user.name}</p>
              <p className="truncate text-caption-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <ThemeToggle />
            <button
              type="button"
              onClick={logout}
              className="inline-flex h-9 items-center gap-2 rounded-md px-2.5 text-caption font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* ---------- Mobile / tablet header ---------- */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md lg:hidden">
        <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6">
          <Logo compact />

          <nav className="hidden items-center gap-0.5 md:flex" aria-label="Main navigation">
            {navItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn('rounded-md px-2.5 py-1.5 text-caption font-medium transition-colors', isActive ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground')
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-caption font-semibold text-secondary-foreground outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  aria-label="Open account menu"
                >
                  {initials}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel className="font-normal">
                  <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
                  <p className="truncate text-caption-sm text-muted-foreground">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <NavLink to="/profile" className="cursor-pointer">
                    <UserRound className="mr-2 h-4 w-4" />
                    Your profile
                  </NavLink>
                </DropdownMenuItem>
                {user.role === 'ADMIN' && (
                  <DropdownMenuItem asChild>
                    <NavLink to="/admin" className="cursor-pointer">
                      <Shield className="mr-2 h-4 w-4" />
                      Admin
                    </NavLink>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={logout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* ---------- Page content ---------- */}
      <div className="lg:pl-60">
        <main className="app-main">
          <Outlet />
        </main>
      </div>

      {/* ---------- Mobile bottom navigation ---------- */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-2 pb-[calc(0.4rem+env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-md md:hidden"
        aria-label="Mobile navigation"
      >
        <div className={cn('mx-auto grid max-w-md gap-0.5', navItems.length === 5 ? 'grid-cols-5' : 'grid-cols-4')}>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex min-h-12 flex-col items-center justify-center gap-1 rounded-md text-[0.68rem] font-medium transition-colors',
                  isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn('h-[1.15rem] w-[1.15rem]', isActive && 'stroke-[2.4]')} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};

import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Gauge,
  LayoutDashboard,
  UserCircle,
  FileBarChart,
  Target,
  Settings,
  ShieldCheck,
  Users,
  CreditCard,
  Landmark,
  Briefcase,
  MessageSquare,
  Sparkles,
  LogOut,
  X,
} from 'lucide-react';
import { cn } from '@/utils/cn';

const ICON_MAP = {
  '/dashboard': LayoutDashboard,
  '/financial-profile': UserCircle,
  '/assessments': FileBarChart,
  '/goals': Target,
  '/settings': Settings,
  '/admin': ShieldCheck,
  '/admin/users': Users,
  '/admin/subscriptions': CreditCard,
  '/admin/loan-types': Landmark,
  '/advisor': Briefcase,
  '/consultations': MessageSquare,
  '/upgrade': Sparkles,
};

export function Sidebar({ navLinks, user, role, onLogout, isOpen, onClose }) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink-950/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-border bg-surface transition-transform duration-200 lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-5">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white">
              <Gauge size={18} />
            </span>
            <span className="font-heading text-[15px] font-bold text-text-primary">LoanGauge</span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-text-muted hover:bg-surface-hover lg:hidden cursor-pointer"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {navLinks.map((link) => {
              const Icon = ICON_MAP[link.to] || LayoutDashboard;
              return (
                <li key={link.name}>
                  <NavLink
                    to={link.to}
                    end={link.to === '/dashboard' || link.to === '/admin' || link.to === '/advisor'}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                      )
                    }
                  >
                    <Icon size={17} />
                    <span>{link.name}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="shrink-0 border-t border-border p-3">
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-100 text-sm font-semibold text-ink-700">
              {(user?.firstName?.[0] || user?.email?.[0] || 'U').toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-text-primary">
                {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.email}
              </p>
              <p className="truncate text-[11px] text-text-muted">{role?.replace('_', ' ')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-danger-subtle hover:text-danger cursor-pointer"
          >
            <LogOut size={17} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, LogOut, UserCircle } from 'lucide-react';
import { formatDate } from '@/utils/helpers';
import { cn } from '@/utils/cn';

export function Topbar({ onMenuClick, notifications = [], onMarkAsRead, user, role, onLogout }) {
  const navigate = useNavigate();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const unread = notifications.filter((n) => !n.read && !n.isRead);
  const initial = (user?.firstName?.[0] || user?.email?.[0] || 'U').toUpperCase();
  const displayName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email;

  useEffect(() => {
    const onClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setIsNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setIsProfileOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface/90 backdrop-blur px-4 sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-md p-2 text-text-secondary hover:bg-surface-hover lg:hidden cursor-pointer"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-1.5">
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setIsNotifOpen((v) => !v)}
            className="relative rounded-full p-2 text-text-secondary hover:bg-surface-hover cursor-pointer"
            aria-label="Notifications"
          >
            <Bell size={19} />
            {unread.length > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-danger" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto rounded-xl border border-border bg-surface shadow-lg">
              <div className="border-b border-border px-4 py-3">
                <p className="text-sm font-semibold text-text-primary">Notifications</p>
              </div>
              {notifications.length === 0 ? (
                <p className="px-4 py-8 text-center text-xs text-text-muted">You're all caught up.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {notifications.map((n) => {
                    const isUnread = !n.read && !n.isRead;
                    return (
                      <li
                        key={n.id}
                        onClick={() => isUnread && onMarkAsRead?.(n.id)}
                        className={cn(
                          'px-4 py-3 text-xs cursor-pointer hover:bg-surface-hover',
                          isUnread && 'bg-primary-50/50'
                        )}
                      >
                        <p className={cn('text-text-primary', isUnread && 'font-semibold')}>
                          {n.message || n.title || 'Notification'}
                        </p>
                        {n.createdAt && (
                          <p className="mt-1 text-[10px] text-text-muted">{formatDate(n.createdAt)}</p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full p-1 pr-1 text-text-secondary hover:bg-surface-hover cursor-pointer"
            aria-label="Account menu"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-100 text-xs font-semibold text-ink-700">
              {initial}
            </span>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-surface shadow-lg">
              <div className="border-b border-border px-4 py-3">
                <p className="truncate text-sm font-semibold text-text-primary">{displayName}</p>
                {role && <p className="truncate text-[11px] text-text-muted">{role.replace('_', ' ')}</p>}
              </div>
              <div className="p-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate('/settings');
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-hover hover:text-text-primary cursor-pointer"
                >
                  <UserCircle size={16} />
                  Profile Settings
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    onLogout?.();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary hover:bg-danger-subtle hover:text-danger cursor-pointer"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;

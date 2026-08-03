import { Bell } from 'lucide-react';
import { useState } from 'react';
import { useNotifications } from '../../hooks/useNotifications';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markRead } = useNotifications();

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2" aria-label="Notifications">
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="p-4 text-sm text-gray-500">No notifications</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markRead(n.id)}
                className={`p-3 border-b cursor-pointer ${n.read ? 'bg-white' : 'bg-blue-50'}`}
              >
                <p className="text-xs font-medium text-gray-500 uppercase">{n.type.replace(/_/g, ' ')}</p>
                <p className="text-sm mt-1">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
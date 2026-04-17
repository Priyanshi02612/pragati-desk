import { Bell } from 'lucide-react';
import { useState } from 'react';
import { useAppContext } from '../../app/AppContext';

export const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const { notifications, currentUser, markNotificationRead } = useAppContext();

  const filtered = notifications.filter(
    (notification) =>
      notification.role === currentUser.role ||
      (currentUser.role === 'Admin' && notification.type === 'performance'),
  );
  const unreadCount = filtered.filter((item) => !item.read).length;

  return (
    <div className="relative">
      <button
        className="relative rounded-2xl border border-white/70 bg-white/90 p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-card"
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label="Open notifications"
      >
        <Bell size={18} className="text-brand-text" />
        {unreadCount ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-danger px-1 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="panel absolute right-0 top-14 z-20 w-80 p-3">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-brand-text">Notifications</h3>
            <span className="text-xs text-brand-muted">{filtered.length} alerts</span>
          </div>
          <div className="space-y-2">
            {filtered.length ? (
              filtered.map((notification) => (
                <button
                  key={notification.id}
                  className={`w-full rounded-2xl p-3 text-left transition ${
                    notification.read ? 'bg-slate-50' : 'bg-emerald-50/60'
                  }`}
                  onClick={() => markNotificationRead(notification.id)}
                  type="button"
                >
                  <p className="text-sm font-semibold text-brand-text">{notification.title}</p>
                  <p className="mt-1 text-xs leading-5 text-brand-muted">{notification.message}</p>
                </button>
              ))
            ) : (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm text-brand-muted">
                No notifications yet.
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

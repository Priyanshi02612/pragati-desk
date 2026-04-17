import {
  BarChart3,
  Crown,
  LayoutDashboard,
  ListTodo,
  LogOut,
  ShieldCheck,
  Ticket,
  UserSquare2,
  Users,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAppContext } from '../../app/AppContext';

const roleConfig = {
  Admin: [
    { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true },
    { label: 'Employees', to: '/admin/employees', icon: Users },
    { label: 'Tickets', to: '/admin/tickets', icon: Ticket },
    { label: 'Performance', to: '/performance', icon: BarChart3 },
    { label: 'Leaderboard', to: '/leaderboard', icon: Crown },
  ],
  'Team Leader': [
    { label: 'Overview', to: '/team-leader', icon: ShieldCheck, end: true },
    { label: 'Tasks', to: '/team-leader/tasks', icon: ListTodo },
    { label: 'Performance', to: '/performance', icon: BarChart3 },
    { label: 'Leaderboard', to: '/leaderboard', icon: Crown },
  ],
  Employee: [
    { label: 'My Tasks', to: '/employee', icon: UserSquare2, end: true },
    { label: 'Performance', to: '/performance', icon: BarChart3 },
    { label: 'Leaderboard', to: '/leaderboard', icon: Crown },
  ],
};

export const Sidebar = () => {
  const { currentUser, logout } = useAppContext();
  const links = roleConfig[currentUser.role];

  return (
    <aside className="panel-muted flex h-full flex-col p-5">
      <div className="mb-8">
        <div className="inline-flex rounded-2xl bg-brand-primary px-3 py-2 text-sm font-bold text-white shadow-sm">
          PragatiDesk
        </div>
        <p className="mt-4 text-sm text-brand-muted">
          Employee task and performance management with role-based productivity views.
        </p>
      </div>

      <nav className="space-y-2">
        {links.map((link) => {
          const Icon = link.icon;

          return (
            <NavLink
              key={link.label}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-text text-white shadow-card'
                    : 'text-brand-muted hover:bg-white hover:text-brand-text'
                }`
              }
              to={link.to}
            >
              <Icon size={18} />
              {link.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto rounded-3xl bg-slate-950 px-4 py-5 text-white">
        <p className="text-xs uppercase tracking-[0.24em] text-white/60">Signed in as</p>
        <p className="mt-2 text-base font-semibold">{currentUser.name}</p>
        <p className="text-sm text-white/70">{currentUser.role}</p>
        <button
          className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-sm font-medium transition hover:bg-white/20"
          type="button"
          onClick={logout}
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
};

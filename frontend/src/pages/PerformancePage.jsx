import { AlertTriangle, BarChart3, ShieldCheck, TrendingUp, UserCircle2 } from 'lucide-react';
import { useMemo } from 'react';
import { useAppContext } from '../app/AppContext';
import { PerformanceCharts } from '../components/charts/PerformanceCharts';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { formatPercent } from '../utils/format';

export const PerformancePage = () => {
  const { currentUser, performanceSeries, tasks, tickets, users } = useAppContext();

  const employees = users.filter((user) => user.role === 'Employee');
  const assignedTickets = tickets.filter((ticket) => ticket.assignedLeaderId === currentUser.id);
  const leaderTeamIds = Array.from(
    new Set(
      tasks
        .filter((task) => assignedTickets.some((ticket) => ticket.id === task.ticketId))
        .map((task) => task.assigneeId),
    ),
  );

  const scopedEmployees =
    currentUser.role === 'Admin'
      ? employees
      : currentUser.role === 'Team Leader'
        ? employees.filter((user) => leaderTeamIds.includes(user.id))
        : employees.filter((user) => user.id === currentUser.id);

  const atRisk = scopedEmployees.filter((user) => user.performance < 85);
  const averageScore = scopedEmployees.length
    ? scopedEmployees.reduce((sum, user) => sum + user.performance, 0) / scopedEmployees.length
    : 0;

  const pageMeta = useMemo(() => {
    if (currentUser.role === 'Admin') {
      return {
        title: 'Organization Performance',
        copy: 'Track completion health and performance risk across the full organization.',
        icon: BarChart3,
      };
    }

    if (currentUser.role === 'Team Leader') {
      return {
        title: 'Team Performance',
        copy: 'Monitor only the employees working within your assigned ticket queue.',
        icon: ShieldCheck,
      };
    }

    return {
      title: 'My Performance',
      copy: 'Stay on top of your own score, delivery rhythm, and improvement focus.',
      icon: UserCircle2,
    };
  }, [currentUser.role]);

  const MetaIcon = pageMeta.icon;

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-brand-secondary text-white">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex rounded-2xl bg-white/10 p-3 text-emerald-300">
              <MetaIcon size={22} />
            </div>
            <h2 className="mt-4 text-3xl font-bold">{pageMeta.title}</h2>
            <p className="mt-3 text-sm leading-7 text-white/72">{pageMeta.copy}</p>
          </div>
          <div className="rounded-3xl bg-white/10 px-5 py-4 text-right">
            <p className="text-sm text-white/70">Average Score</p>
            <p className="mt-1 text-4xl font-bold">{formatPercent(averageScore)}</p>
          </div>
        </div>
      </Card>

      <PerformanceCharts performanceSeries={performanceSeries} />

      <Card>
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-2xl bg-amber-50 p-3 text-brand-accent">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h2 className="section-title">
              {currentUser.role === 'Employee' ? 'Personal Scorecard' : 'Performance Watchlist'}
            </h2>
            <p className="section-copy">
              {currentUser.role === 'Employee'
                ? 'Your current score and coaching focus area.'
                : 'Employees below 85% are highlighted for coaching support.'}
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {scopedEmployees.map((employee) => (
            <div
              key={employee.id}
              className={`rounded-3xl border p-5 ${
                employee.performance < 85
                  ? 'border-rose-200 bg-rose-50'
                  : 'border-brand-border/70 bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-brand-text">{employee.name}</h3>
                  <p className="text-sm text-brand-muted">{employee.department}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    employee.performance < 85
                      ? 'bg-brand-danger text-white'
                      : 'bg-brand-primary text-white'
                  }`}
                >
                  {formatPercent(employee.performance)}
                </span>
              </div>
              <div className="mt-4">
                <ProgressBar value={employee.performance} />
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-brand-muted">
                <TrendingUp size={16} />
                {employee.performance < 85
                  ? 'Needs coaching support and delay reduction'
                  : 'Maintaining a healthy delivery rhythm'}
              </div>
            </div>
          ))}
        </div>

        {atRisk.length ? (
          <div className="mt-6 rounded-3xl bg-slate-950 p-5 text-sm text-white/80">
            {atRisk.length} {atRisk.length > 1 ? 'people are' : 'person is'} below the 85%
            benchmark in this view.
          </div>
        ) : (
          <div className="mt-6 rounded-3xl bg-emerald-50 p-5 text-sm text-emerald-900/80">
            No one in this view is below the 85% benchmark right now.
          </div>
        )}
      </Card>
    </div>
  );
};

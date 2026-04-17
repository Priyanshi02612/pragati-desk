import { Crown, Medal, ShieldCheck, Trophy, UserCircle2 } from 'lucide-react';
import { useMemo } from 'react';
import { useAppContext } from '../app/AppContext';
import { Card } from '../components/ui/Card';
import { formatPercent } from '../utils/format';

export const LeaderboardPage = () => {
  const { currentUser, leaderboard, tasks, tickets, users } = useAppContext();

  const employeeUsers = users.filter((user) => user.role === 'Employee');
  const assignedTickets = tickets.filter((ticket) => ticket.assignedLeaderId === currentUser.id);
  const leaderTeamIds = Array.from(
    new Set(
      tasks
        .filter((task) => assignedTickets.some((ticket) => ticket.id === task.ticketId))
        .map((task) => task.assigneeId),
    ),
  );

  const scopedRankings =
    currentUser.role === 'Admin'
      ? leaderboard.rankings
      : currentUser.role === 'Team Leader'
        ? leaderboard.rankings.filter((entry) =>
            leaderTeamIds.includes(users.find((user) => user.name === entry.name)?.id),
          )
        : leaderboard.rankings.filter((entry) => entry.name === currentUser.name);

  const roleMeta = useMemo(() => {
    if (currentUser.role === 'Admin') {
      return {
        title: 'Organization Leaderboard',
        copy: 'Recognize top contributors across the full workforce.',
        icon: Crown,
      };
    }

    if (currentUser.role === 'Team Leader') {
      return {
        title: 'Team Leaderboard',
        copy: 'Compare only the employees contributing within your current team.',
        icon: ShieldCheck,
      };
    }

    return {
      title: 'My Ranking',
      copy: 'View your own standing without exposing the full company ranking list.',
      icon: UserCircle2,
    };
  }, [currentUser.role]);

  const RoleIcon = roleMeta.icon;
  const monthWinner =
    currentUser.role === 'Admin'
      ? leaderboard.month
      : currentUser.role === 'Team Leader'
        ? {
            ...leaderboard.month,
            name: scopedRankings[0]?.name || leaderboard.month.name,
            score: scopedRankings[0]?.score || leaderboard.month.score,
            achievement: 'Top team performer for the current leadership scope.',
          }
        : {
            name: currentUser.name,
            score: currentUser.performance,
            achievement: 'Your current monthly performance snapshot.',
          };
  const yearWinner =
    currentUser.role === 'Employee'
      ? {
          name: currentUser.name,
          score: currentUser.performance,
          achievement: 'Your year-to-date progress compared against your own goals.',
        }
      : leaderboard.year;

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden bg-gradient-to-r from-brand-primary via-emerald-600 to-brand-secondary text-white">
        <div className="flex items-center gap-4">
          <div className="rounded-3xl bg-white/10 p-4">
            <RoleIcon size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-bold">{roleMeta.title}</h2>
            <p className="mt-2 text-sm text-white/80">{roleMeta.copy}</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="overflow-hidden bg-gradient-to-br from-brand-primary via-emerald-600 to-emerald-800 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-white/75">
                {currentUser.role === 'Employee' ? 'My Monthly Score' : 'Top Monthly Performer'}
              </p>
              <h2 className="mt-4 text-3xl font-bold">{monthWinner.name}</h2>
              <p className="mt-2 text-sm text-white/80">{monthWinner.achievement}</p>
            </div>
            <Crown size={36} />
          </div>
          <div className="mt-8 text-5xl font-bold">{formatPercent(monthWinner.score)}</div>
        </Card>

        <Card className="overflow-hidden bg-gradient-to-br from-brand-secondary via-blue-700 to-slate-950 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-white/75">
                {currentUser.role === 'Employee' ? 'My Yearly Score' : 'Top Yearly Performer'}
              </p>
              <h2 className="mt-4 text-3xl font-bold">{yearWinner.name}</h2>
              <p className="mt-2 text-sm text-white/80">{yearWinner.achievement}</p>
            </div>
            <Trophy size={36} />
          </div>
          <div className="mt-8 text-5xl font-bold">{formatPercent(yearWinner.score)}</div>
        </Card>
      </div>

      <Card>
        <div className="mb-5">
          <h2 className="section-title">
            {currentUser.role === 'Employee' ? 'My Ranking Card' : 'Ranking Cards'}
          </h2>
          <p className="section-copy">
            {currentUser.role === 'Admin'
              ? 'Organization-wide standings across all employees.'
              : currentUser.role === 'Team Leader'
                ? 'Standings limited to employees in your current team scope.'
                : 'A private view of your current position.'}
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {scopedRankings.map((entry, index) => (
            <div
              key={`${entry.name}-${entry.rank}`}
              className="flex items-center justify-between rounded-3xl border border-brand-border/70 bg-slate-50 p-5 transition hover:-translate-y-1 hover:bg-white"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-amber-50 p-3 text-brand-accent">
                  <Medal size={20} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-brand-muted">
                    {currentUser.role === 'Employee' ? 'Current Position' : `Rank #${index + 1}`}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-brand-text">{entry.name}</h3>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-brand-text">{formatPercent(entry.score)}</p>
                <p
                  className={`text-sm font-medium ${
                    entry.trend.startsWith('-') ? 'text-brand-danger' : 'text-brand-primary'
                  }`}
                >
                  {entry.trend}
                </p>
              </div>
            </div>
          ))}
          {!scopedRankings.length && currentUser.role === 'Team Leader' ? (
            <div className="rounded-3xl bg-slate-50 p-6 text-sm text-brand-muted">
              No team leaderboard entries are available until tasks are assigned to employees.
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
};

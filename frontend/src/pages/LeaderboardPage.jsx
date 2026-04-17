import { Crown, Medal, Trophy } from "lucide-react";
import { useAppContext } from "../app/AppContext";
import { Card } from "../components/ui/Card";
import { formatPercent } from "../utils/format";

export const LeaderboardPage = () => {
  const { leaderboard } = useAppContext();

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="overflow-hidden bg-gradient-to-br from-brand-primary via-emerald-600 to-emerald-800 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-white/75">
                Employee of the Month
              </p>
              <h2 className="mt-4 text-3xl font-bold">
                {leaderboard.month.name}
              </h2>
              <p className="mt-2 text-sm text-white/80">
                {leaderboard.month.achievement}
              </p>
            </div>
            <Crown size={36} />
          </div>
          <div className="mt-8 text-5xl font-bold">
            {formatPercent(leaderboard.month.score)}
          </div>
        </Card>

        <Card className="overflow-hidden bg-gradient-to-br from-brand-secondary via-blue-700 to-slate-950 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-white/75">
                Employee of the Year
              </p>
              <h2 className="mt-4 text-3xl font-bold">
                {leaderboard.year.name}
              </h2>
              <p className="mt-2 text-sm text-white/80">
                {leaderboard.year.achievement}
              </p>
            </div>
            <Trophy size={36} />
          </div>
          <div className="mt-8 text-5xl font-bold">
            {formatPercent(leaderboard.year.score)}
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-5">
          <h2 className="section-title">Ranking Cards</h2>
          <p className="section-copy">
            Recognize delivery quality, reliability, and improvement momentum.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {leaderboard.rankings.map((entry) => (
            <div
              key={entry.rank}
              className="flex items-center justify-between rounded-3xl border border-brand-border/70 bg-slate-50 p-5 transition hover:-translate-y-1 hover:bg-white"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-amber-50 p-3 text-brand-accent">
                  <Medal size={20} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-brand-muted">
                    Rank #{entry.rank}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-brand-text">
                    {entry.name}
                  </h3>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-brand-text">
                  {formatPercent(entry.score)}
                </p>
                <p
                  className={`text-sm font-medium ${entry.trend.startsWith("-") ? "text-brand-danger" : "text-brand-primary"}`}
                >
                  {entry.trend}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

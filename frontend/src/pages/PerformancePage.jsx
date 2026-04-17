import { AlertTriangle } from 'lucide-react';
import { useAppContext } from '../app/AppContext';
import { PerformanceCharts } from '../components/charts/PerformanceCharts';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { formatPercent } from '../utils/format';

export const PerformancePage = () => {
  const { performanceSeries, users } = useAppContext();
  const employees = users.filter((user) => user.role === 'Employee');
  const atRisk = employees.filter((user) => user.performance < 85);

  return (
    <div className="space-y-6">
      <PerformanceCharts performanceSeries={performanceSeries} />

      <Card>
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-2xl bg-amber-50 p-3 text-brand-accent">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h2 className="section-title">Performance Watchlist</h2>
            <p className="section-copy">Employees below 85% are highlighted for coaching support.</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {employees.map((employee) => (
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
            </div>
          ))}
        </div>

        {atRisk.length ? (
          <div className="mt-6 rounded-3xl bg-slate-950 p-5 text-sm text-white/80">
            {atRisk.length} employee{atRisk.length > 1 ? 's are' : ' is'} below the 85% benchmark.
            Prioritize coaching, blocker removal, and workload balancing.
          </div>
        ) : null}
      </Card>
    </div>
  );
};

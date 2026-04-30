import { AlertTriangle, CalendarDays, CheckCircle2, Flag } from "lucide-react";
import { Badge } from "../ui/Badge";
import { getProjectStatusTone } from "../../utils/projects";

const getMilestoneIcon = (status) => {
  if (status === "Completed") {
    return CheckCircle2;
  }

  if (status === "Delayed") {
    return AlertTriangle;
  }

  return Flag;
};

export const TimelineComponent = ({ startDate, deadline, milestones = [] }) => (
  <div className="space-y-4">
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-3xl bg-slate-50 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-muted">
          Start Date
        </p>
        <div className="mt-3 flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-50 p-3 text-brand-primary">
            <CalendarDays size={18} />
          </div>
          <p className="font-semibold text-brand-text">{startDate}</p>
        </div>
      </div>
      <div className="rounded-3xl bg-slate-50 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-muted">
          Deadline
        </p>
        <div className="mt-3 flex items-center gap-3">
          <div className="rounded-2xl bg-blue-50 p-3 text-brand-secondary">
            <Flag size={18} />
          </div>
          <p className="font-semibold text-brand-text">{deadline}</p>
        </div>
      </div>
    </div>

    <div className="space-y-4">
      {milestones.map((milestone, index) => {
        const Icon = getMilestoneIcon(milestone.status);

        return (
          <div key={milestone.id} className="flex gap-4">
            <div className="flex w-10 flex-col items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-brand-border/60">
                <Icon
                  size={18}
                  className={
                    milestone.status === "Completed"
                      ? "text-brand-primary"
                      : milestone.status === "Delayed"
                        ? "text-brand-danger"
                        : "text-brand-secondary"
                  }
                />
              </div>
              {index !== milestones.length - 1 ? (
                <div className="mt-2 h-full w-px bg-brand-border/70" />
              ) : null}
            </div>
            <div className="flex-1 rounded-3xl border border-brand-border/60 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-brand-text">
                    {milestone.title}
                  </p>
                  <p className="mt-1 text-sm text-brand-muted">
                    {milestone.date}
                  </p>
                </div>
                <Badge tone={getProjectStatusTone(milestone.status)}>
                  {milestone.status}
                </Badge>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

import { CalendarDays, Plus, User2 } from "lucide-react";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { getProjectPriorityTone } from "../../utils/projects";

export const KanbanColumn = ({
  title,
  tasks = [],
  onAddTask,
  canManage,
}) => (
  <div className="min-w-[280px] flex-1 rounded-3xl bg-slate-50 p-4">
    <div className="mb-4 flex items-center justify-between gap-3">
      <div>
        <h3 className="text-sm font-semibold text-brand-text">{title}</h3>
        <p className="text-xs text-brand-muted">{tasks.length} tasks</p>
      </div>
      {canManage && title === "Pending" ? (
        <Button className="px-3 py-2 text-xs" onClick={onAddTask}>
          <Plus size={14} />
        </Button>
      ) : null}
    </div>

    <div className="space-y-3">
      {tasks.length ? (
        tasks.map((task) => (
          <Card key={task.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <h4 className="text-sm font-semibold text-brand-text">
                {task.title}
              </h4>
              <Badge tone={getProjectPriorityTone(task.priority)}>
                {task.priority}
              </Badge>
            </div>
            <div className="mt-4 space-y-2 text-xs text-brand-muted">
              <div className="flex items-center gap-2">
                <User2 size={14} />
                <span>{task.assignee?.name || "Unassigned"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays size={14} />
                <span>{task.dueDate}</span>
              </div>
            </div>
          </Card>
        ))
      ) : (
        <div className="rounded-3xl border border-dashed border-brand-border/80 bg-white/70 p-5 text-center text-sm text-brand-muted">
          No tasks in this stage yet.
        </div>
      )}
    </div>
  </div>
);

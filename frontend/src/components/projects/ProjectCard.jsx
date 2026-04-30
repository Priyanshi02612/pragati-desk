import {
  CalendarDays,
  Eye,
  Pencil,
  Trash2,
  UserSquare2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { ProjectProgressBar } from "./ProjectProgressBar";
import { TeamAvatarStack } from "./TeamAvatarStack";
import {
  getDeadlineLabel,
  getProjectPriorityTone,
  getProjectStatusTone,
  getTasksSummary,
} from "../../utils/projects";

export const ProjectCard = ({
  project,
  view = "grid",
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}) => {
  const taskSummary = getTasksSummary(project);

  return (
    <Card
      className={`group transition duration-300 hover:-translate-y-1 hover:shadow-soft ${
        view === "list" ? "p-5" : "h-full"
      }`}
    >
      <div
        className={`gap-5 ${
          view === "list" ? "flex flex-col xl:flex-row xl:items-start" : "space-y-5"
        }`}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-secondary">
                {project.clientName}
              </p>
              <h3 className="mt-2 text-xl font-semibold text-brand-text">
                {project.name}
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={getProjectPriorityTone(project.priority)}>
                {project.priority}
              </Badge>
              <Badge tone={getProjectStatusTone(project.status)}>
                {project.status}
              </Badge>
            </div>
          </div>

          <p className="mt-3 line-clamp-2 text-sm leading-6 text-brand-muted">
            {project.description}
          </p>

          <div className="mt-5">
            <ProjectProgressBar value={project.progress} />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">
              <p className="text-brand-muted">Deadline</p>
              <div className="mt-2 flex items-center gap-2 font-semibold text-brand-text">
                <CalendarDays size={16} className="text-brand-secondary" />
                <span>{getDeadlineLabel(project.deadline)}</span>
              </div>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">
              <p className="text-brand-muted">Team Leader</p>
              <div className="mt-2 flex items-center gap-2 font-semibold text-brand-text">
                <UserSquare2 size={16} className="text-brand-primary" />
                <span>{project.teamLeader.name}</span>
              </div>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">
              <p className="text-brand-muted">Tasks</p>
              <p className="mt-2 font-semibold text-brand-text">
                {taskSummary.completed}/{taskSummary.total} completed
              </p>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col justify-between gap-4 xl:max-w-[240px]">
          <div>
            <p className="text-sm text-brand-muted">Assigned team</p>
            <div className="mt-3 flex items-center justify-between gap-4">
              <TeamAvatarStack members={project.teamMembers} />
              <span className="text-sm font-medium text-brand-muted">
                {project.teamMembers.length} members
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link to={`/projects/${project.id}`}>
              <Button className="gap-2">
                <Eye size={16} />
                View
              </Button>
            </Link>
            {canEdit ? (
              <Button className="gap-2" variant="muted" onClick={() => onEdit(project)}>
                <Pencil size={16} />
                Edit
              </Button>
            ) : null}
            {canDelete ? (
              <Button
                className="gap-2"
                variant="danger"
                onClick={() => onDelete(project)}
              >
                <Trash2 size={16} />
                Delete
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
};

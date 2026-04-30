import {
  Activity,
  ArrowLeft,
  BarChart3,
  CalendarDays,
  CircleDollarSign,
  ClipboardList,
  FileText,
  MessageSquareText,
  Plus,
  Upload,
  Users2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAppContext } from "../app/AppContext";
import { AnalyticsCards } from "../components/projects/AnalyticsCards";
import { FileUploadModal } from "../components/projects/FileUploadModal";
import { KanbanColumn } from "../components/projects/KanbanColumn";
import { ProjectProgressBar } from "../components/projects/ProjectProgressBar";
import { TeamAvatarStack } from "../components/projects/TeamAvatarStack";
import { TimelineComponent } from "../components/projects/TimelineComponent";
import { Avatar } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { InputField } from "../components/ui/InputField";
import { Modal } from "../components/ui/Modal";
import {
  formatProjectCurrency,
  formatProjectDate,
  getBudgetUsage,
  getDeadlineLabel,
  getProjectPriorityTone,
  getProjectStatusTone,
  getTasksSummary,
  projectTaskColumns,
  scopeProjectsForRole,
} from "../utils/projects";

const tabs = [
  { id: "overview", label: "Overview", icon: ClipboardList },
  { id: "tasks", label: "Tasks", icon: ClipboardList },
  { id: "team", label: "Team", icon: Users2 },
  { id: "files", label: "Files", icon: FileText },
  { id: "activity", label: "Activity", icon: Activity },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

const delayColors = ["#1D4ED8", "#DC2626"];
const emptyTaskForm = {
  title: "",
  assigneeId: "",
  dueDate: "",
  priority: "Medium",
  status: "Pending",
};

export const ProjectDetailsPage = () => {
  const { projectId } = useParams();
  const { currentUser, projects, updateProject } = useAppContext();
  const [activeTab, setActiveTab] = useState("overview");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState(emptyTaskForm);

  const scopedProjects = useMemo(
    () => scopeProjectsForRole(projects, currentUser),
    [currentUser, projects],
  );
  const project = scopedProjects.find((item) => item.id === projectId);

  if (!project) {
    return <Navigate to="/projects" replace />;
  }

  const canManage = ["Admin", "Team Leader"].includes(currentUser.role);
  const budgetUsage = getBudgetUsage(project);
  const taskSummary = getTasksSummary(project);
  const assignableMembers = [
    ...project.teamMembers,
    ...(project.teamMembers.some((member) => member.id === project.teamLeader.id)
      ? []
      : [project.teamLeader]),
  ];
  const analyticsValues = {
    completion:
      project.analytics.completionRate[project.analytics.completionRate.length - 1]?.value + "%",
    delay:
      project.analytics.delayRatio.find((item) => item.name === "Delayed")?.value + "%",
    productivity:
      Math.round(
        project.analytics.productivity.reduce((sum, item) => sum + item.value, 0) /
          Math.max(project.analytics.productivity.length, 1),
      ) + "%",
    weekly:
      project.analytics.weeklyProgress[project.analytics.weeklyProgress.length - 1]?.value + "%",
  };

  const taskColumns = projectTaskColumns.map((column) => ({
    title: column,
    tasks: project.tasks.filter((task) => task.status === column),
  }));

  const handleAddTask = (event) => {
    event.preventDefault();
    const assignee =
      assignableMembers.find((member) => member.id === taskForm.assigneeId) ||
      assignableMembers[0];

    updateProject(project.id, {
      tasks: [
        ...project.tasks,
        {
          id: `TASK-${Date.now()}`,
          title: taskForm.title,
          priority: taskForm.priority,
          status: taskForm.status,
          dueDate: taskForm.dueDate,
          assignee: { id: assignee.id, name: assignee.name },
        },
      ],
      activity: [
        {
          id: `ACT-${Date.now()}`,
          type: "update",
          title: "Task created",
          description: `${taskForm.title} assigned to ${assignee.name}.`,
          actor: currentUser.name,
          createdAt: new Date().toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
          }),
        },
        ...project.activity,
      ],
    });

    setTaskForm(emptyTaskForm);
    setTaskModalOpen(false);
  };

  const handleUploadFiles = (files) => {
    updateProject(project.id, {
      files: [...project.files, ...files],
      activity: [
        {
          id: `ACT-${Date.now()}`,
          type: "update",
          title: "Files uploaded",
          description: `${files.length} file(s) added to shared documents.`,
          actor: currentUser.name,
          createdAt: new Date().toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
          }),
        },
        ...project.activity,
      ],
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-brand-text shadow-sm transition hover:bg-slate-50"
        >
          <ArrowLeft size={16} />
          Back to projects
        </Link>
        <Badge tone="bg-white text-brand-secondary">Mock data preview</Badge>
      </div>

      <div className="rounded-3xl border border-white/80 bg-gradient-to-r from-brand-primary to-brand-secondary p-6 text-white shadow-soft">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-medium text-white/80">{project.clientName}</p>
            <h2 className="mt-2 text-3xl font-semibold">{project.name}</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone="bg-white/15 text-white">{project.status}</Badge>
              <Badge tone="bg-white/15 text-white">{project.priority}</Badge>
              <Badge tone="bg-white/15 text-white">
                Deadline {formatProjectDate(project.deadline)}
              </Badge>
              <Badge tone="bg-white/15 text-white">{project.progress}% progress</Badge>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm">
              <span className="text-white/70">Deadline</span>
              <p className="mt-1 font-semibold">{getDeadlineLabel(project.deadline)}</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm">
              <span className="text-white/70">Team Leader</span>
              <p className="mt-1 font-semibold">{project.teamLeader.name}</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm">
              <span className="text-white/70">Tasks</span>
              <p className="mt-1 font-semibold">
                {taskSummary.completed}/{taskSummary.total}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-flex min-w-full gap-2 rounded-3xl bg-white/80 p-2 shadow-sm">
          {tabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? "bg-brand-text text-white shadow-sm"
                    : "text-brand-muted hover:bg-slate-100 hover:text-brand-text"
                }`}
                type="button"
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "overview" ? (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <Card>
              <h3 className="section-title">Project Overview</h3>
              <p className="mt-4 text-sm leading-7 text-brand-muted">
                {project.description}
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl bg-slate-50 p-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-blue-50 p-3 text-brand-secondary">
                      <CircleDollarSign size={18} />
                    </div>
                    <div>
                      <p className="text-sm text-brand-muted">Budget usage</p>
                      <p className="font-semibold text-brand-text">
                        {formatProjectCurrency(project.budgetSpent)} /{" "}
                        {formatProjectCurrency(project.budget)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <ProjectProgressBar value={budgetUsage} />
                  </div>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-emerald-50 p-3 text-brand-primary">
                      <CalendarDays size={18} />
                    </div>
                    <div>
                      <p className="text-sm text-brand-muted">Timeline status</p>
                      <p className="font-semibold text-brand-text">
                        Start {formatProjectDate(project.startDate)}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-brand-muted">
                    Deadline is {formatProjectDate(project.deadline)} and current state is{" "}
                    <span className="font-semibold text-brand-text">{project.status}</span>.
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="section-title">Project Timeline</h3>
              <p className="section-copy">
                Gantt-style milestone view showing progress, dates, and delays.
              </p>
              <div className="mt-5">
                <TimelineComponent
                  startDate={formatProjectDate(project.startDate)}
                  deadline={formatProjectDate(project.deadline)}
                  milestones={project.milestones}
                />
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <h3 className="section-title">Recent Updates</h3>
              <div className="mt-4 space-y-3">
                {project.updates.map((update) => (
                  <div key={update} className="rounded-3xl bg-slate-50 p-4 text-sm leading-6 text-brand-muted">
                    {update}
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <h3 className="section-title">Project Summary</h3>
              <div className="mt-4 space-y-3">
                <div className="rounded-3xl border border-brand-border/60 p-4">
                  <p className="text-sm text-brand-muted">Priority</p>
                  <div className="mt-2">
                    <Badge tone={getProjectPriorityTone(project.priority)}>
                      {project.priority}
                    </Badge>
                  </div>
                </div>
                <div className="rounded-3xl border border-brand-border/60 p-4">
                  <p className="text-sm text-brand-muted">Status</p>
                  <div className="mt-2">
                    <Badge tone={getProjectStatusTone(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                </div>
                <div className="rounded-3xl border border-brand-border/60 p-4">
                  <p className="text-sm text-brand-muted">Team</p>
                  <div className="mt-3 flex items-center justify-between gap-4">
                    <TeamAvatarStack members={project.teamMembers} />
                    <span className="text-sm font-medium text-brand-text">
                      {project.teamMembers.length} members
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ) : null}

      {activeTab === "tasks" ? (
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="section-title">Project Tasks</h3>
              <p className="section-copy">
                Pending, in-progress, review, and completed work in one horizontal board.
              </p>
            </div>
            {canManage ? (
              <Button className="gap-2" onClick={() => setTaskModalOpen(true)}>
                <Plus size={16} />
                Add Task
              </Button>
            ) : null}
          </div>
          <div className="mt-6 overflow-x-auto">
            <div className="flex min-w-max gap-4 pb-2">
              {taskColumns.map((column) => (
                <KanbanColumn
                  key={column.title}
                  title={column.title}
                  tasks={column.tasks}
                  canManage={canManage}
                  onAddTask={() => setTaskModalOpen(true)}
                />
              ))}
            </div>
          </div>
        </Card>
      ) : null}

      {activeTab === "team" ? (
        <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
          <Card>
            <h3 className="section-title">Team Leader</h3>
            <div className="mt-5 rounded-3xl bg-slate-50 p-5">
              <div className="flex items-center gap-4">
                <Avatar name={project.teamLeader.name} size="lg" />
                <div>
                  <p className="text-lg font-semibold text-brand-text">
                    {project.teamLeader.name}
                  </p>
                  <p className="text-sm text-brand-muted">
                    {project.teamLeader.designation}
                  </p>
                  <p className="mt-1 text-sm text-brand-secondary">
                    {project.teamLeader.email}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="section-title">Assigned Employees</h3>
                <p className="section-copy">
                  Performance and utilization snapshot for the working squad.
                </p>
              </div>
              <Badge tone="bg-blue-50 text-brand-secondary">
                {project.teamMembers.length} members
              </Badge>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {project.teamMembers.map((member) => (
                <div key={member.id} className="rounded-3xl bg-slate-50 p-5">
                  <div className="flex items-center gap-3">
                    <Avatar name={member.name} />
                    <div>
                      <p className="font-semibold text-brand-text">{member.name}</p>
                      <p className="text-sm text-brand-muted">{member.designation}</p>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white p-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-brand-muted">
                        Performance
                      </p>
                      <p className="mt-2 text-xl font-semibold text-brand-text">
                        {member.performance}%
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white p-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-brand-muted">
                        Utilization
                      </p>
                      <p className="mt-2 text-xl font-semibold text-brand-text">
                        {member.utilization}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : null}

      {activeTab === "files" ? (
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="section-title">Shared Files</h3>
              <p className="section-copy">
                Upload and review project documents in the same workspace.
              </p>
            </div>
            <Button className="gap-2" onClick={() => setUploadOpen(true)}>
              <Upload size={16} />
              Upload Files
            </Button>
          </div>
          <div className="mt-5 space-y-3">
            {project.files.length ? (
              project.files.map((file) => (
                <div
                  key={file.id}
                  className="flex flex-col gap-3 rounded-3xl border border-brand-border/60 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-brand-text">{file.name}</p>
                    <p className="mt-1 text-sm text-brand-muted">
                      Uploaded by {file.uploadedBy} on {file.uploadedAt}
                    </p>
                  </div>
                  <Badge tone="bg-slate-100 text-slate-600">{file.size}</Badge>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-brand-border/70 bg-slate-50 p-8 text-center text-sm text-brand-muted">
                No shared files yet for this project.
              </div>
            )}
          </div>
        </Card>
      ) : null}

      {activeTab === "activity" ? (
        <Card>
          <h3 className="section-title">Activity Timeline</h3>
          <p className="section-copy">
            Updates, completed tasks, delay logs, and discussion context.
          </p>
          <div className="mt-5 space-y-4">
            {project.activity.map((item) => (
              <div key={item.id} className="flex gap-4 rounded-3xl bg-slate-50 p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <MessageSquareText size={18} className="text-brand-secondary" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-brand-text">{item.title}</p>
                    <Badge tone="bg-white text-brand-secondary">{item.type}</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-brand-muted">
                    {item.description}
                  </p>
                  <p className="mt-3 text-xs uppercase tracking-[0.14em] text-brand-muted">
                    {item.actor} • {item.createdAt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {activeTab === "analytics" ? (
        <div className="space-y-6">
          <AnalyticsCards values={analyticsValues} />
          <div className="grid gap-6 xl:grid-cols-2">
            <Card className="h-[360px]">
              <h3 className="section-title">Completion Rate</h3>
              <div className="mt-4 h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={project.analytics.completionRate}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="name" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#16A34A"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="h-[360px]">
              <h3 className="section-title">Delay Ratio</h3>
              <div className="mt-4 h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={project.analytics.delayRatio}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={70}
                      outerRadius={100}
                    >
                      {project.analytics.delayRatio.map((entry, index) => (
                        <Cell key={entry.name} fill={delayColors[index % delayColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="h-[360px]">
              <h3 className="section-title">Team Productivity</h3>
              <div className="mt-4 h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={project.analytics.productivity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="name" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip />
                    <Bar dataKey="value" fill="#1D4ED8" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="h-[360px]">
              <h3 className="section-title">Weekly Progress</h3>
              <div className="mt-4 h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={project.analytics.weeklyProgress}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="name" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#F59E0B"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </div>
      ) : null}

      <FileUploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSubmit={handleUploadFiles}
      />

      <Modal
        title="Add project task"
        description="Create a mock task for this project board."
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
      >
        <form className="space-y-4" onSubmit={handleAddTask}>
          <InputField
            label="Task title"
            value={taskForm.title}
            onChange={(event) =>
              setTaskForm((current) => ({ ...current, title: event.target.value }))
            }
            required
          />
          <div className="grid gap-4 md:grid-cols-2">
            <InputField
              label="Assign employee"
              as="select"
              value={taskForm.assigneeId}
              options={[
                { label: "Select member", value: "" },
                ...project.teamMembers.map((member) => ({
                  label: member.name,
                  value: member.id,
                })),
                ...(!project.teamMembers.some(
                  (member) => member.id === project.teamLeader.id,
                )
                  ? [
                      {
                        label: `${project.teamLeader.name} (Leader)`,
                        value: project.teamLeader.id,
                      },
                    ]
                  : []),
              ]}
              onChange={(event) =>
                setTaskForm((current) => ({
                  ...current,
                  assigneeId: event.target.value,
                }))
              }
              required
            />
            <InputField
              label="Due date"
              type="date"
              value={taskForm.dueDate}
              onChange={(event) =>
                setTaskForm((current) => ({ ...current, dueDate: event.target.value }))
              }
              required
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <InputField
              label="Priority"
              as="select"
              value={taskForm.priority}
              options={[
                { label: "Low", value: "Low" },
                { label: "Medium", value: "Medium" },
                { label: "High", value: "High" },
                { label: "Urgent", value: "Urgent" },
              ]}
              onChange={(event) =>
                setTaskForm((current) => ({ ...current, priority: event.target.value }))
              }
            />
            <InputField
              label="Status"
              as="select"
              value={taskForm.status}
              options={[
                { label: "Pending", value: "Pending" },
                { label: "In Progress", value: "In Progress" },
                { label: "Review", value: "Review" },
                { label: "Completed", value: "Completed" },
              ]}
              onChange={(event) =>
                setTaskForm((current) => ({ ...current, status: event.target.value }))
              }
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="muted" onClick={() => setTaskModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit">Add task</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

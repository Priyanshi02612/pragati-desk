import {
  AlertTriangle,
  FolderKanban,
  LayoutGrid,
  List,
  Plus,
  Search,
  SlidersHorizontal,
  TimerReset,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useAppContext } from "../app/AppContext";
import { StatCard } from "../components/dashboard/StatCard";
import { CreateProjectModal } from "../components/projects/CreateProjectModal";
import { FilterDrawer } from "../components/projects/FilterDrawer";
import { ProjectCard } from "../components/projects/ProjectCard";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { InputField } from "../components/ui/InputField";
import {
  getDeadlineLabel,
  getProjectMetrics,
  getProjectPriorityTone,
  getProjectStatusTone,
  scopeProjectsForRole,
} from "../utils/projects";

const defaultFilters = {
  status: "",
  priority: "",
  teamLeader: "",
  deadline: "",
};

const mockLeaders = [
  {
    id: "leader-1",
    name: "Ritika Sharma",
    role: "Team Leader",
    designation: "Delivery Lead",
  },
  {
    id: "leader-2",
    name: "Kunal Verma",
    role: "Team Leader",
    designation: "Program Manager",
  },
];

const mockMembers = [
  { id: "emp-1", name: "Aarav Mehta", performance: 91 },
  { id: "emp-2", name: "Nisha Patel", performance: 88 },
  { id: "emp-3", name: "Vikram Rao", performance: 86 },
  { id: "emp-4", name: "Sara Khan", performance: 84 },
  { id: "emp-5", name: "Ira Dsouza", performance: 89 },
  { id: "emp-6", name: "Dev Malhotra", performance: 92 },
  { id: "emp-7", name: "Manya Roy", performance: 83 },
  { id: "emp-8", name: "Anika Sen", performance: 90 },
];

export const ProjectsPage = () => {
  const {
    currentUser,
    notifications,
    projects,
    createProject,
    updateProject,
    deleteProject,
  } = useAppContext();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(defaultFilters);
  const [view, setView] = useState("grid");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const scopedProjects = useMemo(
    () => scopeProjectsForRole(projects, currentUser),
    [currentUser, projects],
  );

  const filteredProjects = useMemo(
    () =>
      scopedProjects.filter((project) => {
        const matchesSearch =
          !search ||
          [project.name, project.clientName, project.teamLeader.name]
            .join(" ")
            .toLowerCase()
            .includes(search.toLowerCase());
        const matchesStatus =
          !filters.status || project.status === filters.status;
        const matchesPriority =
          !filters.priority || project.priority === filters.priority;
        const matchesLeader =
          !filters.teamLeader || project.teamLeader.name === filters.teamLeader;
        const matchesDeadline =
          !filters.deadline ||
          new Date(project.deadline) <= new Date(filters.deadline);

        return (
          matchesSearch &&
          matchesStatus &&
          matchesPriority &&
          matchesLeader &&
          matchesDeadline
        );
      }),
    [filters, scopedProjects, search],
  );

  const visibleMetrics = useMemo(
    () => getProjectMetrics(filteredProjects),
    [filteredProjects],
  );

  const projectAlerts = useMemo(
    () =>
      notifications.filter((notification) =>
        ["assignment", "deadline", "delay", "milestone"].includes(
          notification.type,
        ),
      ),
    [notifications],
  );

  const canCreate = currentUser.role === "Admin";
  const canEdit = ["Admin", "Team Leader"].includes(currentUser.role);
  const canDelete = currentUser.role === "Admin";

  const handleFilterChange = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const handleSaveProject = (projectData) => {
    if (editingProject) {
      updateProject(editingProject.id, projectData);
      setEditingProject(null);
      return;
    }

    createProject(projectData);
  };

  const handleDeleteProject = (project) => {
    if (
      window.confirm(
        `Delete ${project.name}? This only affects mock frontend data.`,
      )
    ) {
      deleteProject(project.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/80 bg-gradient-to-r from-brand-primary to-brand-secondary p-6 text-white shadow-soft">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-white/80">
              Projects Management
            </p>
            <h2 className="mt-2 text-3xl font-semibold">
              Connect admins, leaders, and contributors in one delivery view
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/80">
              This mock-data workspace extends PragatiDesk with project
              planning, tracking, analytics, task coordination, and alerts while
              keeping the same dashboard rhythm.
            </p>
          </div>
          {canCreate ? (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus size={16} />
              Create Project
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={FolderKanban}
          label="Total Projects"
          value={visibleMetrics.total}
          helper="Projects in the current view"
        />
        <StatCard
          icon={LayoutGrid}
          label="Active Projects"
          value={visibleMetrics.active}
          helper="Delivery work moving right now"
          tone="secondary"
        />
        <StatCard
          icon={Plus}
          label="Completed Projects"
          value={visibleMetrics.completed}
          helper="Successfully launched projects"
          tone="accent"
        />
        <StatCard
          icon={AlertTriangle}
          label="Delayed Projects"
          value={visibleMetrics.delayed}
          helper="Schedules needing intervention"
          tone="danger"
        />
      </div>

      <Card>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex-1">
            <div className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted"
              />
              <input
                className="w-full rounded-2xl border border-brand-border bg-white py-3 pl-11 pr-4 text-sm shadow-sm transition focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/10"
                placeholder="Search projects, clients, or team leaders"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>

          <div className="hidden flex-wrap gap-3 lg:flex">
            <InputField
              as="select"
              className="min-w-[150px]"
              value={filters.status}
              options={[
                { label: "All Statuses", value: "" },
                { label: "Planning", value: "Planning" },
                { label: "Active", value: "Active" },
                { label: "On Hold", value: "On Hold" },
                { label: "Completed", value: "Completed" },
                { label: "Delayed", value: "Delayed" },
              ]}
              onChange={(event) =>
                handleFilterChange("status", event.target.value)
              }
            />
            <InputField
              as="select"
              className="min-w-[150px]"
              value={filters.priority}
              options={[
                { label: "All Priorities", value: "" },
                { label: "Low", value: "Low" },
                { label: "Medium", value: "Medium" },
                { label: "High", value: "High" },
                { label: "Urgent", value: "Urgent" },
              ]}
              onChange={(event) =>
                handleFilterChange("priority", event.target.value)
              }
            />
            <InputField
              as="select"
              className="min-w-[180px]"
              value={filters.teamLeader}
              options={[
                { label: "All Leaders", value: "" },
                ...Array.from(
                  new Set(projects.map((project) => project.teamLeader.name)),
                ).map((leader) => ({ label: leader, value: leader })),
              ]}
              onChange={(event) =>
                handleFilterChange("teamLeader", event.target.value)
              }
            />
            <InputField
              type="date"
              value={filters.deadline}
              onChange={(event) =>
                handleFilterChange("deadline", event.target.value)
              }
            />
          </div>

          <div className="flex items-center gap-3">
            <Button
              className="gap-2 lg:hidden"
              variant="muted"
              onClick={() => setDrawerOpen(true)}
            >
              <SlidersHorizontal size={16} />
              Filters
            </Button>
            <div className="flex rounded-2xl bg-slate-100 p-1">
              <button
                className={`rounded-2xl px-3 py-2 text-sm font-medium transition ${
                  view === "grid"
                    ? "bg-white text-brand-text shadow-sm"
                    : "text-brand-muted"
                }`}
                type="button"
                onClick={() => setView("grid")}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                className={`rounded-2xl px-3 py-2 text-sm font-medium transition ${
                  view === "list"
                    ? "bg-white text-brand-text shadow-sm"
                    : "text-brand-muted"
                }`}
                type="button"
                onClick={() => setView("list")}
              >
                <List size={16} />
              </button>
            </div>
            <Button
              className="gap-2"
              variant="ghost"
              onClick={() => setFilters(defaultFilters)}
            >
              <TimerReset size={16} />
              Reset
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.55fr]">
        <div
          className={`grid gap-5 ${
            view === "grid" ? "md:grid-cols-2 2xl:grid-cols-2" : "grid-cols-1"
          }`}
        >
          {filteredProjects.length ? (
            filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                view={view}
                canEdit={canEdit}
                canDelete={canDelete}
                onEdit={(selectedProject) => {
                  setEditingProject(selectedProject);
                  setCreateOpen(true);
                }}
                onDelete={handleDeleteProject}
              />
            ))
          ) : (
            <Card className="col-span-full p-10 text-center">
              <h3 className="text-lg font-semibold text-brand-text">
                No projects found
              </h3>
              <p className="mt-2 text-sm text-brand-muted">
                Try adjusting the filters or search query to broaden the current
                view.
              </p>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-amber-50 p-3 text-amber-700">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="section-title">Project Alerts</h3>
                <p className="section-copy">
                  New assignments, near deadlines, delays, and milestone wins.
                </p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {projectAlerts.slice(0, 4).map((alert) => (
                <div key={alert.id} className="rounded-3xl bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-brand-text">
                        {alert.title}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-brand-muted">
                        {alert.message}
                      </p>
                    </div>
                    <Badge tone="bg-white text-brand-secondary">
                      {alert.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="section-title">Quick Snapshot</h3>
            <div className="mt-4 space-y-3">
              {filteredProjects.slice(0, 3).map((project) => (
                <div
                  key={project.id}
                  className="rounded-3xl border border-brand-border/60 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-brand-text">
                        {project.name}
                      </p>
                      <p className="mt-1 text-sm text-brand-muted">
                        {project.clientName}
                      </p>
                    </div>
                    <Badge tone={getProjectStatusTone(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge tone={getProjectPriorityTone(project.priority)}>
                      {project.priority}
                    </Badge>
                    <Badge tone="bg-slate-100 text-slate-600">
                      {getDeadlineLabel(project.deadline)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <FilterDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        onChange={handleFilterChange}
        leaderOptions={Array.from(
          new Set(projects.map((project) => project.teamLeader.name)),
        )}
        onReset={() => setFilters(defaultFilters)}
      />

      <CreateProjectModal
        isOpen={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setEditingProject(null);
        }}
        onSubmit={handleSaveProject}
        leaders={mockLeaders}
        members={mockMembers}
        project={editingProject}
      />
    </div>
  );
};

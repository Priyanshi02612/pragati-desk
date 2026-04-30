export const projectTaskColumns = [
  "Pending",
  "In Progress",
  "Review",
  "Completed",
];

export const getProjectStatusTone = (status) => {
  const tones = {
    Planning: "bg-slate-100 text-slate-600",
    Active: "bg-blue-50 text-brand-secondary",
    "On Hold": "bg-amber-100 text-amber-700",
    Completed: "bg-emerald-100 text-emerald-700",
    Delayed: "bg-rose-100 text-rose-700",
    Review: "bg-violet-100 text-violet-700",
  };

  return tones[status] || "bg-slate-100 text-slate-600";
};

export const getProjectPriorityTone = (priority) => {
  const tones = {
    Low: "bg-slate-100 text-slate-600",
    Medium: "bg-blue-50 text-brand-secondary",
    High: "bg-amber-100 text-amber-700",
    Urgent: "bg-rose-100 text-rose-700",
  };

  return tones[priority] || "bg-slate-100 text-slate-600";
};

export const formatProjectCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

export const getDaysUntil = (date) => {
  const now = new Date();
  const target = new Date(date);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const getDeadlineLabel = (date) => {
  const days = getDaysUntil(date);

  if (days < 0) {
    return `${Math.abs(days)}d overdue`;
  }

  if (days === 0) {
    return "Due today";
  }

  return `${days}d left`;
};

export const formatProjectDate = (date) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));

export const getTasksSummary = (project) => {
  const total = project.tasks?.length || 0;
  const completed = project.tasks?.filter((task) => task.status === "Completed").length || 0;

  return { total, completed };
};

export const getBudgetUsage = (project) => {
  if (!project.budget) {
    return 0;
  }

  return Math.min(Math.round((project.budgetSpent / project.budget) * 100), 100);
};

export const scopeProjectsForRole = (projects, currentUser) => {
  if (!currentUser) {
    return [];
  }

  if (currentUser.role === "Admin") {
    return projects;
  }

  if (currentUser.role === "Team Leader") {
    const exact = projects.filter(
      (project) =>
        project.teamLeader.id === currentUser.id ||
        project.teamLeader.name === currentUser.name,
    );

    return exact.length
      ? exact
      : projects.filter((project) => project.teamLeader.id === "leader-1");
  }

  const exact = projects.filter((project) =>
    project.tasks?.some(
      (task) =>
        task.assignee.id === currentUser.id || task.assignee.name === currentUser.name,
    ),
  );

  return exact.length
    ? exact
    : projects.filter((project) =>
        project.tasks?.some((task) => task.assignee.id === "emp-1"),
      );
};

export const getProjectMetrics = (projects) => ({
  total: projects.length,
  active: projects.filter((project) => project.status === "Active").length,
  completed: projects.filter((project) => project.status === "Completed").length,
  delayed: projects.filter((project) => project.status === "Delayed").length,
});

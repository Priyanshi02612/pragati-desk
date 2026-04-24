const Task = require("../models/Task");
const Ticket = require("../models/Ticket");
const User = require("../models/User");
const { normalizeRole } = require("../utils/roles");

const SCORE_BY_STATUS = {
  Completed: 100,
  "In Progress": 70,
  Pending: 40,
  Delayed: 10,
};

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const clamp = (value, minimum, maximum) => Math.min(Math.max(value, minimum), maximum);

const roundToOneDecimal = (value) => Math.round(value * 10) / 10;

const formatTrend = (currentValue, previousValue) => {
  const diff = roundToOneDecimal(currentValue - previousValue);

  if (diff === 0) {
    return "0%";
  }

  return `${diff > 0 ? "+" : ""}${diff}%`;
};

const createTaskStats = () => ({
  total: 0,
  completed: 0,
  inProgress: 0,
  pending: 0,
  delayed: 0,
});

const accumulateTaskStats = (stats, task) => {
  stats.total += 1;

  if (task.status === "Completed") {
    stats.completed += 1;
    return stats;
  }

  if (task.status === "In Progress") {
    stats.inProgress += 1;
    return stats;
  }

  if (task.status === "Delayed") {
    stats.delayed += 1;
    return stats;
  }

  stats.pending += 1;
  return stats;
};

const calculateScore = (tasks) => {
  if (!tasks.length) {
    return 0;
  }

  const weightedTotal = tasks.reduce(
    (sum, task) => sum + (SCORE_BY_STATUS[task.status] ?? SCORE_BY_STATUS.Pending),
    0,
  );

  return roundToOneDecimal(clamp(weightedTotal / tasks.length, 0, 100));
};

const createMonthRanges = (count, currentDate) => {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth() - (count - index - 1), 1));

    return {
      key: `${date.getUTCFullYear()}-${date.getUTCMonth()}`,
      name: MONTH_LABELS[date.getUTCMonth()],
      start: new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)),
      end: new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1)),
    };
  });
};

const createDayRanges = (count, currentDate) => {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(Date.UTC(
      currentDate.getUTCFullYear(),
      currentDate.getUTCMonth(),
      currentDate.getUTCDate() - (count - index - 1),
    ));

    return {
      name: date.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }),
      start: date,
      end: new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1)),
    };
  });
};

const buildScopedQueries = async (user) => {
  const normalizedRole = normalizeRole(user.role);

  if (normalizedRole === "Admin") {
    return {
      employeeQuery: { role: "Employee" },
      taskQuery: {},
    };
  }

  if (normalizedRole === "Employee") {
    return {
      employeeQuery: { _id: user.id, role: "Employee" },
      taskQuery: { assigneeId: user.id },
    };
  }

  const assignedTickets = await Ticket.find({ assignedLeaderId: user.id }).select("_id");
  const ticketIds = assignedTickets.map((ticket) => ticket._id);

  return {
    employeeQuery: { role: "Employee" },
    taskQuery: { ticketId: { $in: ticketIds } },
  };
};

const buildScopedEmployees = (employees, tasks, role) => {
  if (role !== "Team Leader") {
    return employees;
  }

  const employeeIds = new Set(tasks.map((task) => task.assigneeId.toString()));
  return employees.filter((employee) => employeeIds.has(employee._id.toString()));
};

const buildEmployeeSummaries = (employees, tasks) => {
  const tasksByEmployee = new Map();

  tasks.forEach((task) => {
    const employeeId = task.assigneeId.toString();
    const employeeTasks = tasksByEmployee.get(employeeId) || [];
    employeeTasks.push(task);
    tasksByEmployee.set(employeeId, employeeTasks);
  });

  return employees.map((employee) => {
    const employeeTasks = tasksByEmployee.get(employee._id.toString()) || [];
    const stats = employeeTasks.reduce(accumulateTaskStats, createTaskStats());

    return {
      id: employee._id.toString(),
      name: employee.name,
      email: employee.email,
      department: employee.department,
      avatar: employee.avatar,
      role: employee.role,
      performance: calculateScore(employeeTasks),
      stats,
    };
  });
};

const buildCompletionSeries = (tasks, currentDate) => {
  return createDayRanges(5, currentDate).map(({ name, start, end }) => {
    const dayTasks = tasks.filter((task) => {
      const updatedAt = new Date(task.updatedAt);
      return updatedAt >= start && updatedAt < end;
    });

    if (!dayTasks.length) {
      return {
        name,
        completionRate: 0,
        delayRate: 0,
      };
    }

    const completedTasks = dayTasks.filter((task) => task.status === "Completed").length;
    const delayedTasks = dayTasks.filter((task) => task.status === "Delayed").length;

    return {
      name,
      completionRate: roundToOneDecimal((completedTasks / dayTasks.length) * 100),
      delayRate: roundToOneDecimal((delayedTasks / dayTasks.length) * 100),
    };
  });
};

const buildMonthlySeries = (tasks, currentDate) => {
  return createMonthRanges(4, currentDate).map(({ name, start, end }) => {
    const monthTasks = tasks.filter((task) => {
      const createdAt = new Date(task.createdAt);
      return createdAt >= start && createdAt < end;
    });

    return {
      name,
      performance: calculateScore(monthTasks),
    };
  });
};

const buildLeaderboard = (employeeSummaries, tasks, currentDate) => {
  const monthRanges = createMonthRanges(2, currentDate);
  const currentMonthRange = monthRanges[1];
  const previousMonthRange = monthRanges[0];
  const yearStart = new Date(Date.UTC(currentDate.getUTCFullYear(), 0, 1));
  const yearEnd = new Date(Date.UTC(currentDate.getUTCFullYear() + 1, 0, 1));
  const tasksByEmployee = new Map();

  tasks.forEach((task) => {
    const employeeId = task.assigneeId.toString();
    const employeeTasks = tasksByEmployee.get(employeeId) || [];
    employeeTasks.push(task);
    tasksByEmployee.set(employeeId, employeeTasks);
  });

  const rankings = employeeSummaries
    .map((employee) => {
      const employeeTasks = tasksByEmployee.get(employee.id) || [];
      const currentMonthScore = calculateScore(
        employeeTasks.filter((task) => {
          const createdAt = new Date(task.createdAt);
          return createdAt >= currentMonthRange.start && createdAt < currentMonthRange.end;
        }),
      );
      const previousMonthScore = calculateScore(
        employeeTasks.filter((task) => {
          const createdAt = new Date(task.createdAt);
          return createdAt >= previousMonthRange.start && createdAt < previousMonthRange.end;
        }),
      );
      const yearlyScore = calculateScore(
        employeeTasks.filter((task) => {
          const createdAt = new Date(task.createdAt);
          return createdAt >= yearStart && createdAt < yearEnd;
        }),
      );

      return {
        rank: 0,
        id: employee.id,
        name: employee.name,
        score: employee.performance,
        monthScore: currentMonthScore || employee.performance,
        yearScore: yearlyScore || employee.performance,
        trend: formatTrend(currentMonthScore || employee.performance, previousMonthScore || employee.performance),
      };
    })
    .sort((left, right) => right.score - left.score || left.name.localeCompare(right.name))
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

  const monthWinner = [...rankings].sort((left, right) => right.monthScore - left.monthScore || left.name.localeCompare(right.name))[0];
  const yearWinner = [...rankings].sort((left, right) => right.yearScore - left.yearScore || left.name.localeCompare(right.name))[0];

  return {
    month: monthWinner
      ? {
          name: monthWinner.name,
          score: monthWinner.monthScore,
          role: "Employee",
          achievement: "Best score for the current month across the selected scope.",
        }
      : {
          name: "No data yet",
          score: 0,
          role: "Employee",
          achievement: "Monthly rankings will appear once tasks are assigned.",
        },
    year: yearWinner
      ? {
          name: yearWinner.name,
          score: yearWinner.yearScore,
          role: "Employee",
          achievement: "Top score for the current year across the selected scope.",
        }
      : {
          name: "No data yet",
          score: 0,
          role: "Employee",
          achievement: "Yearly rankings will appear once tasks are assigned.",
        },
    rankings: rankings.map(({ monthScore, yearScore, ...entry }) => entry),
  };
};

const getPerformanceInsights = async (req, res) => {
  try {
    const normalizedRole = normalizeRole(req.user.role);
    const { employeeQuery, taskQuery } = await buildScopedQueries(req.user);
    const [employees, tasks] = await Promise.all([
      User.find(employeeQuery).select("_id name email department avatar role").sort({ name: 1 }),
      Task.find(taskQuery).select("_id assigneeId status createdAt updatedAt dueDate"),
    ]);
    const scopedEmployees = buildScopedEmployees(employees, tasks, normalizedRole);
    const employeeIdSet = new Set(scopedEmployees.map((employee) => employee._id.toString()));
    const scopedTasks = tasks.filter((task) => employeeIdSet.has(task.assigneeId.toString()));
    const employeeSummaries = buildEmployeeSummaries(scopedEmployees, scopedTasks);
    const currentDate = new Date();

    return res.status(200).json({
      employees: employeeSummaries,
      performanceSeries: {
        completion: buildCompletionSeries(scopedTasks, currentDate),
        monthly: buildMonthlySeries(scopedTasks, currentDate),
      },
      leaderboard: buildLeaderboard(employeeSummaries, scopedTasks, currentDate),
      summary: {
        averageScore: employeeSummaries.length
          ? roundToOneDecimal(
              employeeSummaries.reduce((sum, employee) => sum + employee.performance, 0) /
                employeeSummaries.length,
            )
          : 0,
        atRiskCount: employeeSummaries.filter((employee) => employee.performance < 85).length,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Unable to calculate performance insights",
    });
  }
};

module.exports = {
  getPerformanceInsights,
};

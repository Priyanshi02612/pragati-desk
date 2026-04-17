import { useEffect, useMemo, useState } from "react";
import { getCurrentUser, loginUser, registerUser } from "../services/authApi";
import {
  createAdminTicket,
  getAdminUsers,
  getTickets,
} from "../services/adminApi";
import { createLeaderTask, getTasks } from "../services/taskApi";
import {
  getMyNotifications,
  markNotificationAsRead,
} from "../services/notificationApi";
import { TOKEN_STORAGE_KEY } from "../services/api";
import { connectNotificationSocket } from "../services/socket";
import { toRoleLabel } from "../utils/roles";
import { mockLeaderboard, mockPerformanceSeries } from "../data/mockData";

const STORAGE_KEY = "pragatidesk-session";
const initialData = {
  users: [],
  tickets: [],
  tasks: [],
  notifications: [],
  delayRequests: [],
  performanceSeries: mockPerformanceSeries,
  leaderboard: mockLeaderboard,
};

const normalizeAuthUser = (user) => {
  if (!user) {
    return null;
  }

  return {
    ...user,
    id: user.id || user._id,
    role: toRoleLabel(user.role),
  };
};

const attachDashboardProfile = (user, users) => {
  if (!user) {
    return null;
  }

  const profileMatch = users.find((item) => item.role === user.role);

  if (!profileMatch) {
    return user;
  }

  return {
    ...profileMatch,
    ...user,
    id: profileMatch.id,
    authId: user.id,
    avatar: user.avatar || profileMatch.avatar,
  };
};

const normalizeTicket = (ticket) => {
  if (!ticket) {
    return null;
  }

  return {
    ...ticket,
    id: ticket.id || ticket._id,
    ticketNumber: ticket.ticketNumber || ticket.id || ticket._id,
    assignedLeaderId:
      typeof ticket.assignedLeaderId === "object"
        ? ticket.assignedLeaderId?._id || ticket.assignedLeaderId?.id
        : ticket.assignedLeaderId,
    createdAt: ticket.createdAt
      ? ticket.createdAt.toString().split("T")[0]
      : undefined,
  };
};

const normalizeNotification = (notification) => {
  if (!notification) {
    return null;
  }

  return {
    ...notification,
    id: notification.id || notification._id,
    targetUserId:
      typeof notification.targetUserId === "object"
        ? notification.targetUserId?._id || notification.targetUserId?.id
        : notification.targetUserId || null,
  };
};

const normalizeTask = (task) => {
  if (!task) {
    return null;
  }

  return {
    ...task,
    id: task.id || task._id,
    taskNumber: task.taskNumber || "",
    ticketId:
      typeof task.ticketId === "object"
        ? task.ticketId?._id || task.ticketId?.id
        : task.ticketId,
    assigneeId:
      typeof task.assigneeId === "object"
        ? task.assigneeId?._id || task.assigneeId?.id
        : task.assigneeId,
    dueDate: task.dueDate ? task.dueDate.toString().split("T")[0] : "",
  };
};

const normalizeUser = (user) => {
  if (!user) {
    return null;
  }

  return {
    ...user,
    id: user.id || user._id,
    role: toRoleLabel(user.role),
  };
};

const mergeNotifications = (currentNotifications, incomingNotifications) => {
  const notificationsById = new Map(
    currentNotifications.map((notification) => [notification.id, notification]),
  );

  incomingNotifications.forEach((notification) => {
    notificationsById.set(notification.id, notification);
  });

  return Array.from(notificationsById.values()).sort((left, right) => {
    const leftTime = new Date(left.createdAt || 0).getTime();
    const rightTime = new Date(right.createdAt || 0).getTime();
    return rightTime - leftTime;
  });
};

export const useDashboardData = () => {
  const [data, setData] = useState(initialData);
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [isSessionReady, setIsSessionReady] = useState(false);

  useEffect(() => {
    const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);

    if (!token) {
      setIsSessionReady(true);
      return;
    }

    let isMounted = true;

    getCurrentUser()
      .then((response) => {
        if (!isMounted) {
          return;
        }

        const nextUser = attachDashboardProfile(
          normalizeAuthUser(response.user),
          initialData.users,
        );
        setCurrentUser(nextUser);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        window.localStorage.removeItem(STORAGE_KEY);
        setCurrentUser(null);
      })
      .finally(() => {
        if (isMounted) {
          setIsSessionReady(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (currentUser) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
      return;
    }

    window.localStorage.removeItem(STORAGE_KEY);
  }, [currentUser]);

  useEffect(() => {
    const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);

    if (!token || !currentUser || !["Admin", "Team Leader"].includes(currentUser.role)) {
      return;
    }

    let isMounted = true;

    getAdminUsers()
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setData((current) => ({
          ...current,
          users: (response.users || []).map(normalizeUser).filter(Boolean),
        }));
      })
      .catch(() => {
        // Keep the current local users state if the fetch fails.
      });

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  useEffect(() => {
    const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);

    if (!token || !currentUser) {
      return;
    }

    let isMounted = true;

    getTickets()
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setData((current) => ({
          ...current,
          tickets: (response.tickets || []).map(normalizeTicket).filter(Boolean),
        }));
      })
      .catch(() => {
        // Keep the current local tickets state if the fetch fails.
      });

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  useEffect(() => {
    const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);

    if (!token || !currentUser) {
      return;
    }

    let isMounted = true;

    getTasks()
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setData((current) => ({
          ...current,
          tasks: (response.tasks || []).map(normalizeTask).filter(Boolean),
        }));
      })
      .catch(() => {
        // Keep the current local tasks state if the fetch fails.
      });

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  useEffect(() => {
    const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);

    if (!token || !currentUser) {
      return undefined;
    }

    let isMounted = true;

    const syncNotifications = () => {
      getMyNotifications()
        .then((response) => {
          if (!isMounted) {
            return;
          }

          const nextNotifications = (response.notifications || [])
            .map(normalizeNotification)
            .filter(Boolean);

          setData((current) => ({
            ...current,
            notifications: mergeNotifications(
              current.notifications,
              nextNotifications,
            ),
          }));
        })
        .catch(() => {
          // Keep the existing local notifications if polling fails.
        });
    };

    syncNotifications();

    const socket = connectNotificationSocket({
      onNotification: (notification) => {
        if (!isMounted) {
          return;
        }

        const normalizedNotification = normalizeNotification(notification);

        if (!normalizedNotification) {
          return;
        }

        setData((current) => ({
          ...current,
          notifications: mergeNotifications(current.notifications, [
            normalizedNotification,
          ]),
        }));
      },
    });

    return () => {
      isMounted = false;
      socket?.close();
    };
  }, [currentUser]);

  const metrics = useMemo(() => {
    const employees = data.users.filter((user) => user.role === "Employee");
    const activeTickets = data.tickets.filter(
      (ticket) => ticket.status === "Open",
    );
    const completedTasks = data.tasks.filter(
      (task) => task.status === "Completed",
    );
    const delayedTasks = data.tasks.filter((task) => task.status === "Delayed");
    const averagePerformance = employees.length
      ? employees.reduce((sum, employee) => sum + employee.performance, 0) /
        employees.length
      : 0;

    return {
      totalEmployees: employees.length,
      activeTickets: activeTickets.length,
      completedTasks: completedTasks.length,
      delayedTasks: delayedTasks.length,
      averagePerformance,
    };
  }, [data]);

  const login = async (credentials) => {
    const response = await loginUser(credentials);
    const nextUser = attachDashboardProfile(
      normalizeAuthUser(response.user),
      data.users,
    );

    window.localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
    setCurrentUser(nextUser);
    return nextUser;
  };

  const logout = () => {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    setCurrentUser(null);
  };

  const createEmployee = async (payload) => {
    const response = await registerUser(payload);
    const user = normalizeAuthUser(response.user);
    const employee = {
      id: response.user.id,
      authId: response.user.id,
      performance: user.performance ?? 90,
      ...user,
    };

    setData((current) => ({
      ...current,
      users: [employee, ...current.users],
      notifications: [
        {
          id: `NTF-${Date.now()}`,
          title: "New employee added",
          message: `${employee.name} joined ${employee.department}.`,
          type: "assignment",
          read: false,
          role: "Admin",
        },
        ...current.notifications,
      ],
    }));

    return employee;
  };

  const createTicket = async (payload) => {
    const response = await createAdminTicket(payload);
    const ticket = normalizeTicket(response.ticket);
    const assignedLeaderName =
      data.users.find((user) => user.id === ticket.assignedLeaderId)?.name ||
      "a team leader";

    setData((current) => ({
      ...current,
      tickets: [ticket, ...current.tickets],
      notifications: [
        {
          id: `NTF-${Date.now()}`,
          title: "Ticket created",
          message: `${ticket.ticketNumber} assigned to ${assignedLeaderName}.`,
          type: "assignment",
          read: false,
          role: "Team Leader",
          targetUserId: ticket.assignedLeaderId,
        },
        ...current.notifications,
      ],
    }));

    return ticket;
  };

  const createTask = async (payload) => {
    const response = await createLeaderTask(payload);
    const task = normalizeTask(response.task);

    setData((current) => ({
      ...current,
      tasks: [task, ...current.tasks],
      notifications: [
        {
          id: `NTF-${Date.now()}`,
          title: "New task assigned",
          message: `${task.title} was assigned to ${current.users.find((user) => user.id === task.assigneeId)?.name || "the selected employee"}.`,
          type: "assignment",
          read: false,
          role: "Employee",
          targetUserId: task.assigneeId,
        },
        ...current.notifications,
      ],
    }));

    return task;
  };

  const updateTask = (taskId, updates) => {
    setData((current) => ({
      ...current,
      tasks: current.tasks.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task,
      ),
    }));
  };

  const submitDelayRequest = (taskId, reason) => {
    setData((current) => ({
      ...current,
      tasks: current.tasks.map((task) =>
        task.id === taskId
          ? { ...task, status: "Delayed", delayReason: reason }
          : task,
      ),
      delayRequests: [
        {
          id: `DL-${Date.now()}`,
          taskId,
          employeeId: currentUser.id,
          reason,
          status: "Pending",
        },
        ...current.delayRequests,
      ],
      notifications: [
        {
          id: `NTF-${Date.now()}`,
          title: "Delay request submitted",
          message: `${currentUser.name} requested additional time.`,
          type: "delay",
          read: false,
          role: "Team Leader",
        },
        ...current.notifications,
      ],
    }));
  };

  const reviewDelayRequest = (requestId, status) => {
    setData((current) => ({
      ...current,
      delayRequests: current.delayRequests.map((request) =>
        request.id === requestId ? { ...request, status } : request,
      ),
      notifications: [
        {
          id: `NTF-${Date.now()}`,
          title: `Delay ${status.toLowerCase()}`,
          message: `A delay request has been ${status.toLowerCase()}.`,
          type: "delay",
          read: false,
          role: "Employee",
        },
        ...current.notifications,
      ],
    }));
  };

  const markNotificationRead = (notificationId) => {
    markNotificationAsRead(notificationId).catch(() => {
      // Keep local read state even if the sync request fails.
    });

    setData((current) => ({
      ...current,
      notifications: current.notifications.map((item) =>
        item.id === notificationId ? { ...item, read: true } : item,
      ),
    }));
  };

  return {
    ...data,
    currentUser,
    isSessionReady,
    metrics,
    login,
    logout,
    createEmployee,
    createTicket,
    createTask,
    updateTask,
    submitDelayRequest,
    reviewDelayRequest,
    markNotificationRead,
    setCurrentUser,
  };
};

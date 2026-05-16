import { useEffect, useMemo, useState } from "react";
import { getCurrentUser, loginUser, registerUser } from "../services/authApi";
import {
  createAdminTicket,
  getAdminUsers,
  getTickets,
} from "../services/adminApi";
import {
  createConversation as createConversationRequest,
  getChatOverview,
  getConversationMessages as getConversationMessagesRequest,
  markConversationRead as markConversationReadRequest,
  sendConversationMessage,
} from "../services/chatApi";
import {
  completeTask as completeTaskRequest,
  createLeaderTask,
  getTasks,
  startTaskTimer as startTaskTimerRequest,
  stopTaskTimer as stopTaskTimerRequest,
  submitTaskDelayRequest,
} from "../services/taskApi";
import {
  getMyNotifications,
  markNotificationAsRead,
} from "../services/notificationApi";
import { getPerformanceInsights } from "../services/performanceApi";
import { TOKEN_STORAGE_KEY } from "../services/api";
import { connectNotificationChannel } from "../services/pusher";
import { toRoleLabel } from "../utils/roles";

const STORAGE_KEY = "pragatidesk-session";
const emptyPerformanceSeries = {
  completion: [],
  monthly: [],
};
const emptyLeaderboard = {
  month: {
    name: "No data yet",
    score: 0,
    role: "Employee",
    achievement: "Monthly rankings will appear once tasks are assigned.",
  },
  year: {
    name: "No data yet",
    score: 0,
    role: "Employee",
    achievement: "Yearly rankings will appear once tasks are assigned.",
  },
  rankings: [],
};
const initialData = {
  users: [],
  tickets: [],
  tasks: [],
  notifications: [],
  conversations: [],
  chatContacts: [],
  chatMessages: {},
  delayRequests: [],
  performanceSeries: emptyPerformanceSeries,
  leaderboard: emptyLeaderboard,
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
    timerStartedAt: task.timerStartedAt || null,
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

const normalizeChatParticipant = (user) => {
  if (!user) {
    return null;
  }

  return {
    ...user,
    id: user.id || user._id,
    role: toRoleLabel(user.role),
  };
};

const normalizeConversation = (conversation) => {
  if (!conversation) {
    return null;
  }

  return {
    ...conversation,
    id: conversation.id || conversation._id,
    participants: (conversation.participants || [])
      .map(normalizeChatParticipant)
      .filter(Boolean),
    counterpart: normalizeChatParticipant(conversation.counterpart),
    lastMessageSenderId:
      typeof conversation.lastMessageSenderId === "object"
        ? conversation.lastMessageSenderId?._id || conversation.lastMessageSenderId?.id
        : conversation.lastMessageSenderId || null,
    unreadCount: Number(conversation.unreadCount) || 0,
  };
};

const normalizeMessage = (message) => {
  if (!message) {
    return null;
  }

  const sender = normalizeChatParticipant(message.sender || message.senderId);

  return {
    ...message,
    id: message.id || message._id,
    conversationId:
      typeof message.conversationId === "object"
        ? message.conversationId?._id || message.conversationId?.id
        : message.conversationId,
    sender,
    senderId: sender?.id || message.senderId,
    readBy: (message.readBy || []).map((entry) =>
      typeof entry === "object" ? entry._id || entry.id : entry,
    ),
  };
};

const mergePerformanceIntoUsers = (users, performanceEmployees) => {
  const performanceById = new Map(
    performanceEmployees.map((employee) => [employee.id || employee._id, employee]),
  );

  return users.map((user) => {
    const performanceMatch = performanceById.get(user.id);

    if (!performanceMatch) {
      return user;
    }

    return {
      ...user,
      performance: performanceMatch.performance,
      performanceStats: performanceMatch.stats,
    };
  });
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

const mergeConversations = (currentConversations, incomingConversations) => {
  const conversationMap = new Map(
    currentConversations.map((conversation) => [conversation.id, conversation]),
  );

  incomingConversations.forEach((conversation) => {
    conversationMap.set(conversation.id, {
      ...(conversationMap.get(conversation.id) || {}),
      ...conversation,
    });
  });

  return Array.from(conversationMap.values()).sort((left, right) => {
    const leftTime = new Date(left.lastMessageAt || left.updatedAt || 0).getTime();
    const rightTime = new Date(right.lastMessageAt || right.updatedAt || 0).getTime();
    return rightTime - leftTime;
  });
};

const mergeMessages = (currentMessages, incomingMessages) => {
  const messageMap = new Map(currentMessages.map((message) => [message.id, message]));

  incomingMessages.forEach((message) => {
    messageMap.set(message.id, {
      ...(messageMap.get(message.id) || {}),
      ...message,
    });
  });

  return Array.from(messageMap.values()).sort((left, right) => {
    const leftTime = new Date(left.createdAt || 0).getTime();
    const rightTime = new Date(right.createdAt || 0).getTime();
    return leftTime - rightTime;
  });
};

export const useDashboardData = () => {
  const [data, setData] = useState(initialData);
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [isSessionReady, setIsSessionReady] = useState(false);

  const syncPerformanceData = async () => {
    const response = await getPerformanceInsights();
    const performanceEmployees = (response.employees || []).map(normalizeUser).filter(Boolean);

    setData((current) => ({
      ...current,
      users: mergePerformanceIntoUsers(current.users, performanceEmployees),
      performanceSeries: response.performanceSeries || emptyPerformanceSeries,
      leaderboard: response.leaderboard || emptyLeaderboard,
    }));

    setCurrentUser((currentUserState) => {
      if (!currentUserState) {
        return currentUserState;
      }

      const performanceMatch = performanceEmployees.find(
        (employee) => employee.id === currentUserState.id || employee.id === currentUserState.authId,
      );

      if (!performanceMatch) {
        return currentUserState;
      }

      const nextStats = response.employees?.find(
        (employee) => employee.id === performanceMatch.id,
      )?.stats;
      const hasSamePerformance = currentUserState.performance === performanceMatch.performance;
      const hasSameStats =
        JSON.stringify(currentUserState.performanceStats || null) === JSON.stringify(nextStats || null);

      if (hasSamePerformance && hasSameStats) {
        return currentUserState;
      }

      return {
        ...currentUserState,
        performance: performanceMatch.performance,
        performanceStats: nextStats,
      };
    });

    return response;
  };

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

    syncPerformanceData().catch(() => {
      // Keep the existing local insights if the fetch fails.
    });
  }, [currentUser?.id, currentUser?.role, data.tasks.length, data.users.length]);

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

    const notificationChannel = connectNotificationChannel({
      userId: currentUser.id,
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
      onChatMessage: ({ conversation, message }) => {
        if (!isMounted) {
          return;
        }

        const normalizedConversation = normalizeConversation(conversation);
        const normalizedMessage = normalizeMessage(message);

        if (!normalizedConversation || !normalizedMessage) {
          return;
        }

        setData((current) => ({
          ...current,
          conversations: mergeConversations(current.conversations, [
            normalizedConversation,
          ]),
          chatMessages: {
            ...current.chatMessages,
            [normalizedConversation.id]: mergeMessages(
              current.chatMessages[normalizedConversation.id] || [],
              [normalizedMessage],
            ),
          },
        }));
      },
    });

    return () => {
      isMounted = false;
      notificationChannel?.unsubscribe();
    };
  }, [currentUser]);

  useEffect(() => {
    const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);

    if (!token || !currentUser) {
      return;
    }

    let isMounted = true;

    getChatOverview()
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setData((current) => ({
          ...current,
          chatContacts: (response.contacts || [])
            .map(normalizeChatParticipant)
            .filter(Boolean),
          conversations: mergeConversations(
            current.conversations,
            (response.conversations || [])
              .map(normalizeConversation)
              .filter(Boolean),
          ),
        }));
      })
      .catch(() => {
        // Keep the existing local chat state if the fetch fails.
      });

    return () => {
      isMounted = false;
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

  const unreadChatCount = useMemo(
    () =>
      data.conversations.reduce(
        (sum, conversation) => sum + (Number(conversation.unreadCount) || 0),
        0,
      ),
    [data.conversations],
  );

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
      performance: user.performance ?? 0,
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

    await syncPerformanceData().catch(() => null);

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

  const startTaskTimer = async (taskId) => {
    const response = await startTaskTimerRequest(taskId);
    const task = normalizeTask(response.task);

    setData((current) => ({
      ...current,
      tasks: current.tasks.map((item) => (item.id === taskId ? task : item)),
    }));

    await syncPerformanceData().catch(() => null);

    return task;
  };

  const stopTaskTimer = async (taskId) => {
    const response = await stopTaskTimerRequest(taskId);
    const task = normalizeTask(response.task);

    setData((current) => ({
      ...current,
      tasks: current.tasks.map((item) => (item.id === taskId ? task : item)),
    }));

    await syncPerformanceData().catch(() => null);

    return task;
  };

  const completeTask = async (taskId) => {
    const response = await completeTaskRequest(taskId);
    const task = normalizeTask(response.task);

    setData((current) => ({
      ...current,
      tasks: current.tasks.map((item) => (item.id === taskId ? task : item)),
    }));

    await syncPerformanceData().catch(() => null);

    return task;
  };

  const submitDelayRequest = async (taskId, reason) => {
    const response = await submitTaskDelayRequest(taskId, reason);
    const task = normalizeTask(response.task);
    const delayRequest = response.delayRequest
      ? {
          ...response.delayRequest,
          id: response.delayRequest.id || response.delayRequest._id,
          taskId:
            typeof response.delayRequest.taskId === "object"
              ? response.delayRequest.taskId?._id || response.delayRequest.taskId?.id
              : response.delayRequest.taskId,
          employeeId:
            typeof response.delayRequest.employeeId === "object"
              ? response.delayRequest.employeeId?._id ||
                response.delayRequest.employeeId?.id
              : response.delayRequest.employeeId,
        }
      : null;

    setData((current) => ({
      ...current,
      tasks: current.tasks.map((item) => (item.id === taskId ? task : item)),
      delayRequests: delayRequest
        ? [delayRequest, ...current.delayRequests]
        : current.delayRequests,
    }));

    await syncPerformanceData().catch(() => null);

    return { task, delayRequest };
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

  const createConversation = async (participantId) => {
    const response = await createConversationRequest(participantId);
    const conversation = normalizeConversation(response.conversation);

    if (!conversation) {
      throw new Error("Unable to create conversation");
    }

    setData((current) => ({
      ...current,
      conversations: mergeConversations(current.conversations, [conversation]),
    }));

    return conversation;
  };

  const loadConversationMessages = async (conversationId) => {
    const response = await getConversationMessagesRequest(conversationId);
    const messages = (response.messages || []).map(normalizeMessage).filter(Boolean);

    setData((current) => ({
      ...current,
      chatMessages: {
        ...current.chatMessages,
        [conversationId]: mergeMessages(current.chatMessages[conversationId] || [], messages),
      },
    }));

    return messages;
  };

  const sendChatMessage = async (conversationId, content) => {
    const response = await sendConversationMessage(conversationId, content);
    const conversation = normalizeConversation(response.conversation);
    const message = normalizeMessage(response.message);

    if (!conversation || !message) {
      throw new Error("Unable to send message");
    }

    setData((current) => ({
      ...current,
      conversations: mergeConversations(current.conversations, [conversation]),
      chatMessages: {
        ...current.chatMessages,
        [conversation.id]: mergeMessages(current.chatMessages[conversation.id] || [], [message]),
      },
    }));

    return { conversation, message };
  };

  const markChatConversationRead = async (conversationId) => {
    setData((current) => ({
      ...current,
      conversations: current.conversations.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, unreadCount: 0 }
          : conversation,
      ),
    }));

    await markConversationReadRequest(conversationId).catch(() => null);
  };

  return {
    ...data,
    currentUser,
    isSessionReady,
    metrics,
    unreadChatCount,
    login,
    logout,
    createEmployee,
    createTicket,
    createTask,
    updateTask,
    startTaskTimer,
    stopTaskTimer,
    completeTask,
    submitDelayRequest,
    reviewDelayRequest,
    markNotificationRead,
    createConversation,
    loadConversationMessages,
    sendChatMessage,
    markChatConversationRead,
    setCurrentUser,
  };
};

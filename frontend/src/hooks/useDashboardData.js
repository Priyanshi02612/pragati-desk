import { useEffect, useMemo, useState } from 'react';
import { getInitialState, loginAsRole } from '../services/mockApi';

const STORAGE_KEY = 'pragatidesk-session';

export const useDashboardData = () => {
  const [data, setData] = useState(getInitialState);
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (currentUser) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
      return;
    }

    window.localStorage.removeItem(STORAGE_KEY);
  }, [currentUser]);

  const metrics = useMemo(() => {
    const employees = data.users.filter((user) => user.role === 'Employee');
    const activeTickets = data.tickets.filter((ticket) => ticket.status === 'Open');
    const completedTasks = data.tasks.filter((task) => task.status === 'Completed');
    const delayedTasks = data.tasks.filter((task) => task.status === 'Delayed');
    const averagePerformance = employees.length
      ? employees.reduce((sum, employee) => sum + employee.performance, 0) / employees.length
      : 0;

    return {
      totalEmployees: employees.length,
      activeTickets: activeTickets.length,
      completedTasks: completedTasks.length,
      delayedTasks: delayedTasks.length,
      averagePerformance,
    };
  }, [data]);

  const login = (role) => {
    const user = loginAsRole(role);
    setCurrentUser(user);
    return user;
  };

  const logout = () => setCurrentUser(null);

  const createEmployee = (payload) => {
    const employee = {
      id: `employee-${Date.now()}`,
      avatar: payload.name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      performance: 90,
      ...payload,
    };

    setData((current) => ({
      ...current,
      users: [employee, ...current.users],
      notifications: [
        {
          id: `NTF-${Date.now()}`,
          title: 'New employee added',
          message: `${employee.name} joined ${employee.department}.`,
          type: 'assignment',
          read: false,
          role: 'Admin',
        },
        ...current.notifications,
      ],
    }));
  };

  const createTicket = (payload) => {
    const ticket = {
      id: `TCK-${Math.floor(Math.random() * 900 + 100)}`,
      status: 'Open',
      createdAt: new Date().toISOString().split('T')[0],
      ...payload,
    };

    setData((current) => ({
      ...current,
      tickets: [ticket, ...current.tickets],
      notifications: [
        {
          id: `NTF-${Date.now()}`,
          title: 'Ticket created',
          message: `${ticket.id} assigned to a team leader.`,
          type: 'assignment',
          read: false,
          role: 'Team Leader',
        },
        ...current.notifications,
      ],
    }));
  };

  const createTask = (payload) => {
    const task = {
      id: `TSK-${Math.floor(Math.random() * 900 + 100)}`,
      status: 'Pending',
      timeSpent: 0,
      delayReason: '',
      ...payload,
    };

    setData((current) => ({
      ...current,
      tasks: [task, ...current.tasks],
      notifications: [
        {
          id: `NTF-${Date.now()}`,
          title: 'New task assigned',
          message: `${task.title} was assigned to ${current.users.find((user) => user.id === task.assigneeId)?.name}.`,
          type: 'assignment',
          read: false,
          role: 'Employee',
        },
        ...current.notifications,
      ],
    }));
  };

  const updateTask = (taskId, updates) => {
    setData((current) => ({
      ...current,
      tasks: current.tasks.map((task) => (task.id === taskId ? { ...task, ...updates } : task)),
    }));
  };

  const submitDelayRequest = (taskId, reason) => {
    setData((current) => ({
      ...current,
      tasks: current.tasks.map((task) =>
        task.id === taskId ? { ...task, status: 'Delayed', delayReason: reason } : task,
      ),
      delayRequests: [
        {
          id: `DL-${Date.now()}`,
          taskId,
          employeeId: currentUser.id,
          reason,
          status: 'Pending',
        },
        ...current.delayRequests,
      ],
      notifications: [
        {
          id: `NTF-${Date.now()}`,
          title: 'Delay request submitted',
          message: `${currentUser.name} requested additional time.`,
          type: 'delay',
          read: false,
          role: 'Team Leader',
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
          type: 'delay',
          read: false,
          role: 'Employee',
        },
        ...current.notifications,
      ],
    }));
  };

  const markNotificationRead = (notificationId) => {
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

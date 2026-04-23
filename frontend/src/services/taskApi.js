import { apiRequest } from "./api";

export const getTasks = () =>
  apiRequest("/tickets/tasks", {
    method: "GET",
  });

export const createLeaderTask = (payload) =>
  apiRequest("/leader/create-task", {
    method: "POST",
    body: {
      ticketId: payload.ticketId,
      title: payload.title,
      assigneeId: payload.assigneeId,
      dueDate: payload.dueDate,
    },
  });

export const startTaskTimer = (taskId) =>
  apiRequest(`/tickets/tasks/${taskId}/start`, {
    method: "PATCH",
  });

export const stopTaskTimer = (taskId) =>
  apiRequest(`/tickets/tasks/${taskId}/stop`, {
    method: "PATCH",
  });

export const completeTask = (taskId) =>
  apiRequest(`/tickets/tasks/${taskId}/complete`, {
    method: "PATCH",
  });

export const submitTaskDelayRequest = (taskId, reason) =>
  apiRequest(`/tickets/tasks/${taskId}/delay-request`, {
    method: "POST",
    body: { reason },
  });

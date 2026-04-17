import { apiRequest } from "./api";

export const getMyNotifications = () =>
  apiRequest("/notifications/me", {
    method: "GET",
  });

export const markNotificationAsRead = (notificationId) =>
  apiRequest(`/notifications/${notificationId}/read`, {
    method: "PATCH",
  });

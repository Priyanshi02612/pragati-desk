import { apiRequest } from "./api";

export const getChatOverview = () =>
  apiRequest("/chat", {
    method: "GET",
  });

export const createConversation = (participantId) =>
  apiRequest("/chat/conversations", {
    method: "POST",
    body: { participantId },
  });

export const getConversationMessages = (conversationId) =>
  apiRequest(`/chat/conversations/${conversationId}/messages`, {
    method: "GET",
  });

export const sendConversationMessage = (conversationId, content) =>
  apiRequest(`/chat/conversations/${conversationId}/messages`, {
    method: "POST",
    body: { content },
  });

export const markConversationRead = (conversationId) =>
  apiRequest(`/chat/conversations/${conversationId}/read`, {
    method: "POST",
  });

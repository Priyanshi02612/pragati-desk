import { apiRequest } from "./api";

export const getPerformanceInsights = () =>
  apiRequest("/performance", {
    method: "GET",
  });

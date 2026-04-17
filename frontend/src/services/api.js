const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export const TOKEN_STORAGE_KEY = "pragatidesk-token";

const buildHeaders = (headers, body) => {
  const nextHeaders = { ...headers };
  const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);

  if (!(body instanceof FormData)) {
    nextHeaders["Content-Type"] = "application/json";
  }

  if (token) {
    nextHeaders.Authorization = `Bearer ${token}`;
  }

  return nextHeaders;
};

export const apiRequest = async (path, options = {}) => {
  const { headers = {}, body, ...restOptions } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...restOptions,
    headers: buildHeaders(headers, body),
    body: body instanceof FormData || body === undefined ? body : JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || "Request failed");
  }

  return payload;
};

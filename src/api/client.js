import { API_BASE_URL, API_TIMEOUT } from "../utils/constants";

export async function fetchAPI(endpoint, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      signal: controller.signal,
      ...options,
    });
    return response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, headers, ...restOptions } = options;

  // Build full URL
  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  // Get active JWT token from Zustand local storage persistence
  let token: string | null = null;
  try {
    const persistedState = localStorage.getItem("bullwave-auth-storage");
    if (persistedState) {
      const parsed = JSON.parse(persistedState);
      token = parsed?.state?.token || null;
    }
  } catch (e) {
    console.error("Failed to parse persisted auth token", e);
  }

  // Set default headers
  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    ...restOptions,
  });

  if (!response.ok) {
    let errorDetail = "An error occurred";
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch {
       errorDetail = response.statusText || errorDetail;
    }
    throw new Error(errorDetail);
  }

  return response.json() as Promise<T>;
}

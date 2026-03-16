/**
 * Cliente API para integração com GymCore Backend
 * Em dev: usa proxy /api -> localhost:3000 (evita CORS)
 * Com VITE_API_URL: usa URL direta do backend
 */

const API_URL = import.meta.env.VITE_API_URL || "/api";

export const getApiUrl = () => API_URL;

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err: ApiError = {
      statusCode: res.status,
      message: (data as { message?: string }).message || res.statusText,
      error: (data as { error?: string }).error,
    };
    throw err;
  }
  return data as T;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${path}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  const res = await fetch(url, { ...options, headers });
  return handleResponse<T>(res);
}

export async function apiFetchWithAuth<T>(
  path: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${path}`;
  const isFormData = options.body instanceof FormData;
  const headers: HeadersInit = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };
  const res = await fetch(url, { ...options, headers });
  return handleResponse<T>(res);
}

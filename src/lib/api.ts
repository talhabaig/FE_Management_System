import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import type { ApiErrorDetail, ApiErrorResponse, Paginated, SuccessResponse } from '../types/api';

function resolveApiUrl(): string {
  // Always call same-origin `/api` so the refresh cookie stays first-party.
  // Vite (dev) and vercel.json (prod) proxy `/api` to the backend.
  return '';
}

const API_URL = resolveApiUrl();

/**
 * Access token for the current tab. It is intentionally not persisted.
 * A full reload restores the session through the refresh cookie.
 */
let accessToken: string | null = null;

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<string> | null = null;
let authFailureHandler: () => void = () => {
  accessToken = null;
};

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function setAuthFailureHandler(handler: () => void): void {
  authFailureHandler = handler;
}

export class ApiRequestError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: ApiErrorDetail[];
  readonly retryAfterSeconds?: number;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: ApiErrorDetail[],
    retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export function isApiRequestError(error: unknown): error is ApiRequestError {
  return error instanceof ApiRequestError;
}

export function isLoginLockedError(error: unknown): error is ApiRequestError {
  return isApiRequestError(error) && (error.code === 'LOGIN_LOCKED' || error.status === 429);
}

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readDetails(details: unknown): ApiErrorDetail[] | undefined {
  if (!Array.isArray(details)) {
    return undefined;
  }

  const parsed: ApiErrorDetail[] = [];
  for (const item of details) {
    if (!isRecord(item)) {
      continue;
    }
    const path = item.path;
    const message = item.message;
    if (typeof path === 'string' && typeof message === 'string') {
      parsed.push({ path, message });
    }
  }

  return parsed.length > 0 ? parsed : undefined;
}

function readRetryAfterSeconds(details: unknown, headers: unknown): number | undefined {
  if (isRecord(details) && typeof details.retryAfterSeconds === 'number' && Number.isFinite(details.retryAfterSeconds)) {
    return Math.max(0, Math.floor(details.retryAfterSeconds));
  }

  if (!headers || typeof headers !== 'object') {
    return undefined;
  }

  const headerMap = headers as { get?: (name: string) => string | null | undefined; [key: string]: unknown };
  let raw: unknown = typeof headerMap.get === 'function' ? headerMap.get('retry-after') : undefined;
  if (raw == null) {
    raw = headerMap['retry-after'] ?? headerMap['Retry-After'];
  }
  if (Array.isArray(raw)) {
    raw = raw[0];
  }
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return Math.max(0, Math.floor(raw));
  }
  if (typeof raw === 'string' && /^\d+$/.test(raw.trim())) {
    return Number(raw.trim());
  }
  return undefined;
}

function isErrorResponse(value: unknown): value is ApiErrorResponse {
  if (!isRecord(value) || value.success !== false || !isRecord(value.error)) {
    return false;
  }
  return typeof value.error.code === 'string' && typeof value.error.message === 'string';
}

export function toApiError(error: unknown): ApiRequestError {
  if (isApiRequestError(error)) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<unknown>;
    const status = axiosError.response?.status ?? 0;
    const body = axiosError.response?.data;
    if (isErrorResponse(body)) {
      return new ApiRequestError(
        status,
        body.error.code,
        body.error.message,
        readDetails(body.error.details),
        readRetryAfterSeconds(body.error.details, axiosError.response?.headers),
      );
    }
    if (status === 0) {
      return new ApiRequestError(0, 'NETWORK_ERROR', 'Cannot reach the server. Check your connection and try again.');
    }
    return new ApiRequestError(status, 'REQUEST_FAILED', 'The request failed.');
  }

  if (error instanceof Error) {
    return new ApiRequestError(0, 'REQUEST_FAILED', error.message);
  }

  return new ApiRequestError(0, 'REQUEST_FAILED', 'The request failed.');
}

function shouldRefresh(url: string | undefined): boolean {
  if (!url) {
    return false;
  }
  const blocked = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh', '/api/auth/logout'];
  return !blocked.some((path) => url.includes(path));
}

export async function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post<SuccessResponse<{ accessToken: string }>>('/api/auth/refresh')
      .then((response) => {
        const token = response.data.data.accessToken;
        accessToken = token;
        return token;
      })
      .catch((error: unknown) => {
        throw toApiError(error);
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryConfig | undefined;
    const status = error.response?.status;

    if (status === 401 && config && !config._retry && shouldRefresh(config.url)) {
      config._retry = true;
      try {
        const token = await refreshAccessToken();
        config.headers.Authorization = `Bearer ${token}`;
        return await api.request(config);
      } catch (refreshError) {
        accessToken = null;
        authFailureHandler();
        return Promise.reject(toApiError(refreshError));
      }
    }

    return Promise.reject(toApiError(error));
  },
);

export async function requestData<T>(request: Promise<AxiosResponse<SuccessResponse<T>>>): Promise<T> {
  const response = await request;
  return response.data.data;
}

export async function requestList<T>(request: Promise<AxiosResponse<SuccessResponse<T[]>>>): Promise<Paginated<T>> {
  const response = await request;
  const pagination = response.data.pagination;
  if (!pagination) {
    throw new ApiRequestError(500, 'INVALID_RESPONSE', 'List response did not include pagination');
  }
  return { data: response.data.data, pagination };
}

export function compactParams(params: object): Record<string, string | number> {
  const result: Record<string, string | number> = {};
  const entries = Object.entries(params).sort((left, right) => left[0].localeCompare(right[0]));
  for (const [key, value] of entries) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      result[key] = value;
    } else if (typeof value === 'string' && value.trim().length > 0) {
      result[key] = value.trim();
    }
  }
  return result;
}

export function getErrorMessage(error: unknown): string {
  return toApiError(error).message;
}

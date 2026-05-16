import type { ApiErrorBody } from '@blog/types';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'https://blog-api.pinodev.app';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: ApiErrorBody,
  ) {
    super(Array.isArray(body.message) ? body.message.join(', ') : body.message);
    this.name = 'ApiError';
  }
}

export class RateLimitError extends ApiError {
  constructor(body: ApiErrorBody) {
    super(429, body);
    this.name = 'RateLimitError';
  }
}

let refreshPromise: Promise<void> | null = null;

async function attemptRefresh(): Promise<void> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  })
    .then(async (res) => {
      if (!res.ok) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:expired'));
        }
        const body = await res
          .json()
          .catch(() => ({ statusCode: res.status, message: 'Refresh failed' }));
        throw new ApiError(res.status, body as ApiErrorBody);
      }
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

interface RequestOptions extends RequestInit {
  skipRefresh?: boolean;
}

export async function apiClient<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { skipRefresh, ...fetchOptions } = options;
  const response = await fetch(`${API_BASE}${path}`, {
    ...fetchOptions,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...fetchOptions.headers },
  });

  if (response.status === 401 && !skipRefresh) {
    await attemptRefresh();
    return apiClient<T>(path, { ...options, skipRefresh: true });
  }

  if (!response.ok) {
    const body = await response
      .json()
      .catch(() => ({ statusCode: response.status, message: 'Unknown error' }));
    if (response.status === 429) throw new RateLimitError(body as ApiErrorBody);
    throw new ApiError(response.status, body as ApiErrorBody);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

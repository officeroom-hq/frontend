/**
 * REST client for the Officeroom Fastify backend (Tier 1 contract).
 * JSON bodies, Bearer auth, { status, message, data } envelope.
 * Base URL comes from VITE_API_URL (includes /api/v1). Defaults to the local dev server.
 */
export class ApiError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const BASE_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
const TOKEN_KEY = 'officeroom.access_token';

/**
 * The access token lives in memory for the current page. It is mirrored to sessionStorage
 * so a reload can rehydrate via /auth/me. sessionStorage is cleared when the tab closes.
 * The backend issues opaque bearer tokens (no cookies), so this is the storage option available to the SPA.
 */
let accessToken: string | null = readStoredToken();

function readStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
  if (typeof window === 'undefined') return;
  try {
    if (token) window.sessionStorage.setItem(TOKEN_KEY, token);
    else window.sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // storage unavailable (private mode): the in-memory token still works for this page
  }
}

/** Called when a request is rejected and the token cannot be refreshed. The session provider uses it to sign out. */
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

async function send(method: Method, path: string, body?: unknown): Promise<Response> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  return fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

/** Exchanges the current token for a new one. Returns false when the server refuses it. */
async function tryRefresh(): Promise<boolean> {
  const res = await send('POST', '/auth/refresh');
  if (!res.ok) return false;
  const json = (await res.json().catch(() => null)) as { data?: { token?: unknown } } | null;
  const token = json?.data?.token;
  if (typeof token !== 'string') return false;
  setAccessToken(token);
  return true;
}

async function toApiError(res: Response): Promise<ApiError> {
  const body = (await res.json().catch(() => null)) as { message?: string; errors?: Record<string, string[]> } | null;
  const fieldMessage = body?.errors ? Object.values(body.errors).flat()[0] : undefined;
  return new ApiError(res.status, fieldMessage ?? body?.message ?? `Request failed (${res.status})`);
}

export async function request<T>(method: Method, path: string, body?: unknown): Promise<T> {
  let res = await send(method, path, body);
  // Expired token: refresh once and retry. If the refresh fails, the session is over.
  if (res.status === 401 && accessToken) {
    if (await tryRefresh()) {
      res = await send(method, path, body);
    } else {
      setAccessToken(null);
      onUnauthorized?.();
    }
  }
  if (!res.ok) throw await toApiError(res);
  if (res.status === 204) return undefined as T;
  const json = (await res.json()) as { data?: T } | T;
  return (json && typeof json === 'object' && 'data' in json ? (json as { data?: T }).data : json) as T;
}

import { API_BASE_URL } from "../config/env";

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

type QueryValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryValue>;

const NETWORK_MESSAGE = "Tidak dapat terhubung ke server gacha.";
const SERVER_MESSAGE = "Server gacha sedang bermasalah. Coba lagi beberapa saat.";
const MAX_MESSAGE_LENGTH = 140;

/** Nama cookie token CSRF yang umum dipakai backend. */
const CSRF_COOKIE_NAMES = ["csrf_token", "csrfToken", "XSRF-TOKEN", "csrftoken"] as const;
const CSRF_HEADER = "X-CSRF-Token";

const buildUrl = (path: string, query?: QueryParams): string => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_BASE_URL}${normalizedPath}`;

  if (!query) return url;

  const search = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      search.append(key, String(value));
    }
  });

  const queryString = search.toString();
  return queryString ? `${url}?${queryString}` : url;
};

const readCookie = (name: string): string | null => {
  if (typeof document === "undefined" || !document.cookie) return null;

  const prefix = `${name}=`;
  const match = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));

  if (!match) return null;

  try {
    return decodeURIComponent(match.slice(prefix.length));
  } catch {
    return match.slice(prefix.length);
  }
};

/**
 * Token CSRF untuk request yang mengubah state (POST/PUT/PATCH/DELETE).
 *
 * Urutan pembacaan:
 * 1. `<meta name="csrf-token" content="...">` (disarankan, backend meng-inject ke HTML).
 * 2. Cookie double-submit (`csrf_token` / `XSRF-TOKEN`).
 */
export const getCsrfToken = (): string | null => {
  if (typeof document === "undefined") return null;

  const meta = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]');
  const fromMeta = meta?.content?.trim();
  if (fromMeta) return fromMeta;

  for (const name of CSRF_COOKIE_NAMES) {
    const value = readCookie(name);
    if (value) return value;
  }

  return null;
};

const parseBody = async (response: Response): Promise<unknown> => {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
};

/** Pesan dari server yang mengandung detail internal tidak boleh tampil di UI. */
const INTERNAL_PATTERN =
  /(node_modules|\bat\s+\S+\s*\(|\/src\/|\.ts:\d+|\.js:\d+|stack trace|traceback|ECONNREFUSED|ETIMEDOUT|Sequelize|MongoError|PrismaClient|password|secret|token)/i;

const sanitizeMessage = (value: string, fallback: string): string => {
  const singleLine = value.replace(/\s+/g, " ").trim();
  if (!singleLine || INTERNAL_PATTERN.test(singleLine)) return fallback;

  return singleLine.length > MAX_MESSAGE_LENGTH
    ? `${singleLine.slice(0, MAX_MESSAGE_LENGTH - 1)}…`
    : singleLine;
};

const extractRawMessage = (body: unknown): string | null => {
  if (typeof body === "string" && body.trim()) return body.trim();

  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>;
    const nested =
      record.data && typeof record.data === "object" ? (record.data as Record<string, unknown>) : null;
    const candidate = record.message ?? record.error ?? nested?.message;

    if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
  }

  return null;
};

const resolveErrorMessage = (body: unknown, status: number): string => {
  // Error 5xx: jangan pernah menampilkan pesan mentah dari server.
  if (status >= 500) return SERVER_MESSAGE;

  const fallback =
    status === 401 || status === 403
      ? "Sesi kamu tidak valid. Muat ulang halaman."
      : `Permintaan gagal (${status}).`;
  const raw = extractRawMessage(body);

  return raw ? sanitizeMessage(raw, fallback) : fallback;
};

const isSafeMethod = (method: string): boolean => {
  const normalized = method.toUpperCase();
  return normalized === "GET" || normalized === "HEAD" || normalized === "OPTIONS";
};

const request = async <T>(path: string, init: RequestInit, query?: QueryParams): Promise<T> => {
  const method = (init.method ?? "GET").toUpperCase();
  const csrfToken = isSafeMethod(method) ? null : getCsrfToken();

  let response: Response;

  try {
    response = await fetch(buildUrl(path, query), {
      ...init,
      // Sesi/cookie lintas origin tetap terkirim bila backend memakai cookie auth.
      // Backend wajib mengirim `Access-Control-Allow-Credentials: true` +
      // origin eksplisit (bukan "*") dan set cookie `SameSite=Lax|Strict; Secure`.
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(csrfToken ? { [CSRF_HEADER]: csrfToken } : {}),
        ...(init.headers ?? {}),
      },
    });
  } catch {
    throw new ApiError(NETWORK_MESSAGE, 0, "NETWORK_ERROR");
  }

  const body = await parseBody(response);

  if (!response.ok) {
    throw new ApiError(resolveErrorMessage(body, response.status), response.status);
  }

  return body as T;
};

export const apiClient = {
  get: <T>(path: string, query?: QueryParams): Promise<T> => request<T>(path, { method: "GET" }, query),
  post: <T>(path: string, body?: unknown): Promise<T> =>
    request<T>(path, {
      method: "POST",
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
};

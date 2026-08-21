import type { ZodType } from "zod";
import { z } from "zod";
import { env } from "@/shared/config/env";
import { ApiError } from "./errors";

const REQUEST_TIMEOUT_MS = 10_000;

/** Every endpoint answers `{ status, statusCode, data }`. */
const envelopeSchema = z.object({
  status: z.string().optional(),
  statusCode: z.number(),
  data: z.unknown(),
  message: z.string().optional(),
});

export type RequestOptions = {
  /** Seconds. Server Components only — Next's data cache does not exist on the client. */
  revalidate?: number;
  tags?: string[];
  signal?: AbortSignal;
  query?: Record<string, string | number | boolean | undefined | null>;
};

function buildUrl(path: string, query: RequestOptions["query"]): string {
  const url = new URL(`${env.apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === "") continue;
    url.searchParams.set(key, String(value));
  }
  return url.toString();
}

async function request<T>(
  path: string,
  schema: ZodType<T>,
  init: RequestInit,
  opts: RequestOptions = {},
): Promise<T> {
  const url = buildUrl(path, opts.query);

  // TanStack Query supplies its own signal on the client; compose it with our budget.
  const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  const signal = opts.signal ? AbortSignal.any([opts.signal, timeout]) : timeout;

  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      signal,
      headers: { Accept: "application/json", ...init.headers },
      ...(opts.revalidate !== undefined || opts.tags
        ? { next: { revalidate: opts.revalidate, tags: opts.tags } }
        : {}),
    });
  } catch (cause) {
    const timedOut = cause instanceof DOMException && cause.name === "TimeoutError";
    throw new ApiError(
      timedOut ? "timeout" : "network",
      path,
      timedOut ? `Request to ${path} timed out` : `Request to ${path} failed`,
    );
  }

  if (!response.ok) {
    throw new ApiError("http", path, `${response.status} from ${path}`, response.status);
  }

  const envelope = envelopeSchema.safeParse(await response.json().catch(() => null));
  if (!envelope.success) {
    throw new ApiError("envelope", path, `Malformed response envelope from ${path}`);
  }
  if (envelope.data.statusCode !== 200) {
    throw new ApiError(
      "envelope",
      path,
      envelope.data.message ?? `API returned statusCode ${envelope.data.statusCode}`,
      envelope.data.statusCode,
    );
  }

  const parsed = schema.safeParse(envelope.data.data);
  if (!parsed.success) {
    // Fail loudly at the boundary — a silent shape change is how pricing bugs ship.
    throw new ApiError("schema", path, `Unexpected payload from ${path}: ${parsed.error.message}`);
  }

  return parsed.data;
}

export function apiGet<T>(path: string, schema: ZodType<T>, opts?: RequestOptions): Promise<T> {
  return request(path, schema, { method: "GET" }, opts);
}

export function apiPost<T>(
  path: string,
  body: unknown,
  schema: ZodType<T>,
  opts?: RequestOptions,
): Promise<T> {
  return request(
    path,
    schema,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
    opts,
  );
}

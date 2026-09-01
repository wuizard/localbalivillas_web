export type ApiErrorKind = "network" | "timeout" | "http" | "envelope" | "schema";

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number | undefined;
  readonly path: string;

  constructor(kind: ApiErrorKind, path: string, message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.path = path;
    this.status = status;
  }

  /** Copy safe to show a guest — never leaks the endpoint or the raw message. */
  get userMessage(): string {
    switch (this.kind) {
      case "timeout":
      case "network":
        return "We couldn't reach our servers. Check your connection and try again.";
      default:
        return "Something went wrong on our side. Please try again in a moment.";
    }
  }
}

/**
 * A section whose endpoint is not deployed in this environment answers 404. That is an
 * empty catalogue, not an outage — it must not fail a prerender. Narrow on purpose: a
 * network failure or a shape change still throws, so we never ship a silently blank page.
 */
export function isNotFound(error: unknown): boolean {
  return error instanceof ApiError && error.kind === "http" && error.status === 404;
}

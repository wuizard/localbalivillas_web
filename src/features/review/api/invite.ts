import { apiGet, apiPost, ApiError } from "@/shared/api";
import type { ReviewInvite } from "../types";
import { reviewInviteSchema, toReviewInvite } from "./schemas";

/**
 * An admin-issued review link. The token is the whole credential — the guest is never
 * asked for the email the booking was made under, which is the point of it.
 */
export async function getReviewInvite(token: string): Promise<ReviewInvite | null> {
  try {
    const raw = await apiGet(`/review-invite/${encodeURIComponent(token)}`, reviewInviteSchema);
    return toReviewInvite(raw);
  } catch {
    return null;
  }
}

export type SubmitInviteResult =
  { ok: true; invite: ReviewInvite } | { ok: false; message: string };

/**
 * `shared/api` raises an ApiError carrying the HTTP status, not the body, so the copy
 * lives here. Each status is a distinct thing that happened to the link, and the guest
 * needs to be told which — "something went wrong" would send them back to WhatsApp.
 */
const FAILURE_COPY: Record<number, string> = {
  400: "Please choose a rating and write a few words before sending.",
  404: "This review link isn't valid any more. Ask us for a new one and we'll send it over.",
  409: "A review for this stay has already been sent. Thank you.",
  410: "This review link has expired. Ask us for a new one and we'll send it over.",
  429: "That's a few tries in a row — please wait a minute and try again.",
};

export async function submitReviewInvite(
  token: string,
  input: { rating: number; review: string },
): Promise<SubmitInviteResult> {
  try {
    const raw = await apiPost(
      `/review-invite/${encodeURIComponent(token)}/submit`,
      input,
      reviewInviteSchema,
    );
    return { ok: true, invite: toReviewInvite(raw) };
  } catch (error) {
    if (error instanceof ApiError) {
      const known = error.status ? FAILURE_COPY[error.status] : undefined;
      return { ok: false, message: known ?? error.userMessage };
    }
    return { ok: false, message: "Something went wrong on our side. Please try again." };
  }
}

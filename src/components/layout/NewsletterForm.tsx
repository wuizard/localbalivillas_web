"use client";

import { Send } from "lucide-react";
import { useId, useState } from "react";
import { site } from "@/shared/config/site";

/**
 * The API has no subscribe endpoint yet, so the form hands the address to the guest's
 * mail client rather than pretending a signup was stored. Swap the handler for
 * `POST /newsletter` the moment the backend exposes one.
 */
export function NewsletterForm() {
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(event: React.FormEvent) {
    event.preventDefault();

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setError(null);
    const subject = encodeURIComponent("Newsletter signup");
    const body = encodeURIComponent(`Please add ${email} to the Local Bali Villas newsletter.`);
    window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`;
  }

  return (
    <form onSubmit={submit} className="mt-5">
      <label htmlFor={inputId} className="sr-only">
        Your email address
      </label>

      <div className="flex items-center gap-1 rounded-sm border border-white/15 bg-white/5 p-1 focus-within:border-brand-400">
        <input
          id={inputId}
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Your email address"
          aria-invalid={error !== null}
          aria-describedby={error ? errorId : undefined}
          className="min-w-0 flex-1 bg-transparent px-3 py-2 text-body-sm text-white placeholder:text-white/40 focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Subscribe to the newsletter"
          className="flex size-9 shrink-0 items-center justify-center rounded-sm bg-brand-500 text-white transition-colors duration-[120ms] hover:bg-brand-400 active:scale-95"
        >
          <Send size={16} strokeWidth={1.8} aria-hidden />
        </button>
      </div>

      {error ? (
        <p id={errorId} role="alert" className="mt-2 text-body-sm text-danger">
          {error}
        </p>
      ) : null}
    </form>
  );
}

import { cn } from "@/shared/lib/cn";
import type { AboutPage } from "../data/about-pages";

export function AboutArticle({ page }: { page: AboutPage }) {
  return (
    <article className="container-page py-8 md:py-14">
      <header className="max-w-3xl">
        <p className="text-label text-brand-600 uppercase dark:text-brand-300">About us</p>
        <h1 className="mt-2 font-display text-display-lg text-fg">{page.title}</h1>
      </header>

      <div className="mt-7 flex max-w-3xl flex-col gap-4">
        {page.blocks.map((block, index) =>
          block.kind === "heading" ? (
            <h2
              key={`${index}-${block.text}`}
              className={cn(
                "font-display text-title text-fg",
                // Headings after the first get room to breathe from the text above them.
                index > 0 && "mt-4",
              )}
            >
              {block.text}
            </h2>
          ) : (
            <p
              key={`${index}-${block.text}`}
              className={cn(
                "text-body leading-relaxed text-fg-muted",
                block.indented && "border-l-2 border-border pl-4",
              )}
            >
              {block.text}
            </p>
          ),
        )}
      </div>
    </article>
  );
}

import { Check, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Money } from "@/shared/currency";
import type { EventPackageDetail } from "../types";

export function EventPackageHeader({ pkg }: { pkg: EventPackageDetail }) {
  const guests =
    pkg.suitableGuestsMin && pkg.suitableGuestsMax
      ? `${pkg.suitableGuestsMin}–${pkg.suitableGuestsMax} guests`
      : pkg.suitableGuestsMax
        ? `Up to ${pkg.suitableGuestsMax} guests`
        : null;

  return (
    <header className="flex flex-col gap-3">
      <nav aria-label="Breadcrumb">
        <ol className="text-body-sm text-fg-muted flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/events" className="hover:text-brand-600 dark:hover:text-brand-300">
              Events
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-fg">{pkg.name}</li>
        </ol>
      </nav>

      <h1 className="font-display text-display-lg text-fg">{pkg.name}</h1>

      <p className="text-body text-fg-muted max-w-prose md:text-[1.0625rem] md:leading-7">
        {pkg.summary}
      </p>

      {guests ? (
        <span className="text-body-sm text-fg-muted flex items-center gap-1.5">
          <Users size={15} strokeWidth={1.8} aria-hidden />
          {guests}
        </span>
      ) : null}
    </header>
  );
}

export function EventPackageGallery({ images, name }: { images: string[]; name: string }) {
  if (images.length === 0) return null;

  return (
    <div className="grid gap-2 md:grid-cols-3">
      {images.slice(0, 3).map((src, index) => (
        <div
          key={src}
          className={`bg-surface-muted relative overflow-hidden rounded-md ${
            index === 0 ? "aspect-[4/3] md:col-span-2 md:aspect-[3/2]" : "aspect-[4/3]"
          }`}
        >
          <Image
            src={src}
            alt={index === 0 ? name : ""}
            fill
            priority={index === 0}
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}

export function EventPackageAbout({ pkg }: { pkg: EventPackageDetail }) {
  if (pkg.description.length === 0 && pkg.typicallyIncludes.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <h2 id="about-occasion" className="font-display text-display-sm text-fg">
        How it usually works
      </h2>

      {pkg.description.map((paragraph) => (
        <p key={paragraph} className="text-body text-fg-muted max-w-prose leading-relaxed">
          {paragraph}
        </p>
      ))}

      {pkg.typicallyIncludes.length > 0 ? (
        <div className="border-border bg-surface-muted mt-1 rounded-md border p-5">
          <h3 className="text-label text-fg uppercase">Typically includes</h3>
          <ul className="mt-3 flex flex-col gap-2">
            {pkg.typicallyIncludes.map((item) => (
              <li key={item} className="text-body-sm text-fg flex items-start gap-2.5">
                <Check size={15} strokeWidth={2} className="text-brand-500 mt-1 shrink-0" aria-hidden />
                {item}
              </li>
            ))}
          </ul>

          {/* Deliberately a range, deliberately labelled "typically", and deliberately
              carrying no Offer markup: what a party actually costs comes out of the
              conversation, and presenting this as a price would be a claim we cannot keep. */}
          {pkg.indicativeFrom ? (
            <p className="border-border text-body-sm text-fg-muted mt-4 border-t pt-4">
              Past events like this have typically run from{" "}
              <Money amount={pkg.indicativeFrom} className="tabular text-fg font-semibold" />
              {pkg.indicativeTo ? (
                <>
                  {" "}
                  to <Money amount={pkg.indicativeTo} className="tabular text-fg font-semibold" />
                </>
              ) : null}
              . Your quote depends on the villa, the date and how many of you there are.
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

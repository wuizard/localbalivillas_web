import { Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Money } from "@/shared/currency";
import type { EventPackageSummary } from "../types";

function guestRange(pkg: EventPackageSummary): string | null {
  if (pkg.suitableGuestsMin && pkg.suitableGuestsMax) {
    return `${pkg.suitableGuestsMin}–${pkg.suitableGuestsMax} guests`;
  }
  if (pkg.suitableGuestsMax) return `Up to ${pkg.suitableGuestsMax} guests`;
  return null;
}

export function EventPackageCard({
  pkg,
  priority,
}: {
  pkg: EventPackageSummary;
  priority?: boolean;
}) {
  const guests = guestRange(pkg);
  const cover = pkg.images[0] ?? null;

  return (
    <li className="border-border bg-surface flex flex-col overflow-hidden rounded-md border shadow-sm">
      <Link href={pkg.href} className="group flex flex-1 flex-col">
        <div className="bg-surface-muted relative aspect-[4/3] overflow-hidden">
          {cover ? (
            <Image
              src={cover}
              alt=""
              fill
              priority={priority}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : null}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-5">
          <h3 className="font-display text-title text-fg group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors">
            {pkg.name}
          </h3>

          <p className="text-body-sm text-fg-muted line-clamp-3">{pkg.summary}</p>

          {guests ? (
            <span className="text-body-sm text-fg-subtle mt-auto flex items-center gap-1.5 pt-2">
              <Users size={14} strokeWidth={1.8} aria-hidden />
              {guests}
            </span>
          ) : null}

          {/* "Typically", never "from". The real number comes out of the conversation,
              and a range presented as a price is a promise the quote may not keep. */}
          {pkg.indicativeFrom ? (
            <p className="border-border text-body-sm text-fg-muted mt-1 border-t pt-3">
              Typically from{" "}
              <Money amount={pkg.indicativeFrom} className="tabular text-fg font-semibold" />
            </p>
          ) : null}
        </div>
      </Link>
    </li>
  );
}

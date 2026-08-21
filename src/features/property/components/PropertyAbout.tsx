import Image from "next/image";
import { PROPERTY_TYPE_LABEL, type PropertyDetail } from "../types";

export function PropertyAbout({ property }: { property: PropertyDetail }) {
  if (property.description.length === 0) return null;

  const cover = property.images[2] ?? property.images[0];
  const beds = property.bedrooms.at(-1);

  const facts = [
    beds ? `${beds} bedroom ${PROPERTY_TYPE_LABEL[property.type].toLowerCase()}` : null,
    property.maxGuests ? `Sleeps up to ${property.maxGuests}` : null,
    `In ${property.location}, Bali`,
  ].filter((fact): fact is string => fact !== null);

  return (
    <section aria-labelledby="about-property" className="container-page py-10 md:py-14">
      <div className="overflow-hidden rounded-md border border-border bg-surface md:grid md:grid-cols-2 md:items-center">
        {cover ? (
          <div className="relative aspect-[16/10] md:h-full md:aspect-auto md:min-h-[320px]">
            <Image
              src={cover}
              alt={`${property.name} in ${property.location}`}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        ) : null}

        <div className="p-5 md:p-8">
          <h2 id="about-property" className="font-display text-display-sm text-fg">
            About {property.name}
          </h2>

          <div className="mt-3 flex flex-col gap-3">
            {property.description.slice(0, 3).map((paragraph) => (
              <p key={paragraph} className="text-body-sm leading-relaxed text-fg-muted md:text-body">
                {paragraph}
              </p>
            ))}
          </div>

          <ul className="mt-5 flex flex-wrap gap-2">
            {facts.map((fact) => (
              <li
                key={fact}
                className="rounded-full border border-border bg-surface-muted px-3 py-1.5 text-body-sm text-fg"
              >
                {fact}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

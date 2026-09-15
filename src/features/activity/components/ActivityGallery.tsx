import Image from "next/image";

/**
 * One lead image with up to four beside it on desktop, a swipe rail on mobile — the
 * same shape as the property mosaic. Activities usually ship with fewer photos than a
 * villa, so the grid collapses gracefully rather than leaving holes.
 */
export function ActivityGallery({ images, name }: { images: string[]; name: string }) {
  const [lead, ...rest] = images;
  if (!lead) return null;

  const secondary = rest.slice(0, 4);

  return (
    <div className="md:grid md:grid-cols-2 md:gap-2">
      <div className="bg-surface-muted relative aspect-[4/3] overflow-hidden rounded-md md:aspect-[3/2]">
        <Image
          src={lead}
          alt={name}
          fill
          priority
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
      </div>

      {secondary.length > 0 ? (
        <div className="mt-2 flex gap-2 overflow-x-auto md:mt-0 md:grid md:grid-cols-2 md:overflow-visible">
          {secondary.map((src) => (
            <div
              key={src}
              className="bg-surface-muted relative aspect-[4/3] w-[70%] shrink-0 overflow-hidden rounded-md md:aspect-auto md:w-auto"
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="(min-width: 768px) 25vw, 70vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

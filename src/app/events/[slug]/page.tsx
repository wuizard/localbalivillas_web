import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EnquiryForm } from "@/features/enquiry";
import {
  EventPackageAbout,
  EventPackageGallery,
  EventPackageHeader,
  getEventPackageDetail,
  getEventPackages,
} from "@/features/event";
import { env } from "@/shared/config/env";
import { site } from "@/shared/config/site";

export const revalidate = 300;

export async function generateStaticParams() {
  try {
    const packages = await getEventPackages();
    return packages.map((pkg) => ({ slug: pkg.key }));
  } catch {
    // A failed build-time fetch must not fail the build; these render on demand.
    return [];
  }
}

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const pkg = await getEventPackageDetail(slug);

  if (!pkg) return { title: "Not found", robots: { index: false, follow: false } };

  return {
    title: `${pkg.name} at a Bali villa`,
    description: pkg.summary || `${pkg.name} arranged at our villas in Bali.`,
    alternates: { canonical: `/events/${pkg.key}` },
    openGraph: {
      title: `${pkg.name} at a Bali villa`,
      description: pkg.summary,
      images: pkg.images.slice(0, 1),
    },
  };
}

export default async function EventPackagePage({ params }: PageProps) {
  const { slug } = await params;
  const pkg = await getEventPackageDetail(slug);

  if (!pkg) notFound();

  // Service, not Product: the price is quoted per event, and marking an indicative
  // range as an Offer would be a claim the quote may not honour.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: pkg.name,
    description: pkg.summary,
    serviceType: "Event planning",
    provider: { "@type": "Organization", name: site.name, url: env.siteUrl },
    areaServed: { "@type": "Place", name: "Bali, Indonesia" },
    ...(pkg.images.length > 0 ? { image: pkg.images } : {}),
  };

  return (
    <div className="container-page flex flex-col gap-10 py-8 md:gap-14 md:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <EventPackageHeader pkg={pkg} />
      <EventPackageGallery images={pkg.images} name={pkg.name} />
      <EventPackageAbout pkg={pkg} />

      <section id="enquire" className="max-w-2xl scroll-mt-24">
        <EnquiryForm
          kind="event"
          source="event_package"
          subjectRef={pkg.id}
          subjectName={pkg.name}
          heading={`Enquire about ${pkg.name.toLowerCase()}`}
          intro="Send us the date and the numbers and we'll come back with what's possible and what it costs. Nothing is reserved and nothing is charged by sending this."
        />
      </section>
    </div>
  );
}

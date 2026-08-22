import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ABOUT_PAGES, AboutArticle, findAboutPage } from "@/features/content";
import { site } from "@/shared/config/site";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return ABOUT_PAGES.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = findAboutPage(slug);
  if (!page) return { title: "Page not found", robots: { index: false, follow: true } };

  const firstParagraph = page.blocks.find((block) => block.kind === "text")?.text;

  return {
    title: page.title,
    description: firstParagraph?.slice(0, 155) ?? `${page.title} — ${site.name}.`,
    alternates: { canonical: `/about-us/${page.slug}` },
  };
}

export default async function AboutUsPage({ params }: PageProps) {
  const { slug } = await params;
  const page = findAboutPage(slug);
  if (!page) notFound();

  return <AboutArticle page={page} />;
}

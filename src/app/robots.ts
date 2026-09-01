import type { MetadataRoute } from "next";
import { env } from "@/shared/config/env";

export default function robots(): MetadataRoute.Robots {
  // Staging, previews and local builds are byte-identical copies of the storefront.
  // Left crawlable they compete with production for the same terms and can outrank
  // it — the sitemap they serve even invites it. Only the real domain is indexable.
  if (!env.isPublicSite) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    // `/lookup/<token>` is addressed by a secret. The pages already carry noindex,
    // but noindex still invites a crawl — a token in a referrer or a shared link
    // should not be fetched by a bot at all.
    rules: { userAgent: "*", allow: "/", disallow: ["/booking/", "/lookup/"] },
    sitemap: `${env.siteUrl}/sitemap.xml`,
  };
}

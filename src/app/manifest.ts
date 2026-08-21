import type { MetadataRoute } from "next";
import { site } from "@/shared/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.shortName,
    description: site.tagline,
    // Installed sessions stay attributable in analytics.
    start_url: "/?utm_source=pwa",
    display: "standalone",
    background_color: "#fdfcfb",
    theme_color: "#957c64",
    categories: ["travel"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      { name: "Search villas", url: "/properties" },
      { name: "Deals", url: "/deals" },
    ],
  };
}

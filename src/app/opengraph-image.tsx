import { ImageResponse } from "next/og";
import sharp from "sharp";
import { site } from "@/shared/config/site";

export const alt = `${site.name}: luxury villa rentals in Bali`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/jpeg";

/**
 * The share card every page falls back to. Deliberately typographic rather than photographic:
 * a flat card encodes to ~40KB, and WhatsApp silently drops a thumbnail over roughly 300KB —
 * which is how the old S3 hero (545KB, and mislabelled `image/png` while being a JPEG) came
 * to render as no preview at all.
 */
export default async function Image() {
  const png = new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        backgroundColor: "#241d17",
        backgroundImage:
          "radial-gradient(circle at 78% 22%, rgba(149,124,100,0.55) 0%, rgba(36,29,23,0) 58%)",
        color: "#ffffff",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            fontSize: 26,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: "#c9b49c",
          }}
        >
          {site.name}
        </div>
        <div style={{ marginTop: 18, height: 3, width: 96, backgroundColor: "#957c64" }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 82, lineHeight: 1.1, fontWeight: 700, letterSpacing: -1.5 }}>
          Handpicked villas
        </div>
        <div style={{ fontSize: 82, lineHeight: 1.1, fontWeight: 700, letterSpacing: -1.5 }}>
          across Bali
        </div>
        <div style={{ marginTop: 26, fontSize: 32, color: "rgba(255,255,255,0.72)" }}>
          Book direct in Seminyak, Canggu, Ubud, Uluwatu and beyond
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 28, color: "#c9b49c" }}>{site.website}</div>
        <div style={{ fontSize: 26, color: "rgba(255,255,255,0.55)" }}>Best price guarantee</div>
      </div>
    </div>,
    size,
  );

  // JPEG for the same reason the property card uses it: crawlers cap thumbnail fetches by
  // byte size, and a flat card costs nothing in quality to re-encode.
  const jpeg = await sharp(Buffer.from(await png.arrayBuffer()))
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();

  return new Response(new Uint8Array(jpeg), {
    headers: {
      "Content-Type": contentType,
      // Fingerprinted URL, so it can be cached at the edge forever — a scrape that has to wait
      // for a render is a scrape that times out into a bare link.
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
    },
  });
}

import { ImageResponse } from "next/og";
import sharp from "sharp";
import { PROPERTY_TYPE_LABEL, PROPERTY_TYPES, getPropertyDetail } from "@/features/property";
import type { PropertyType } from "@/features/property";
import { site } from "@/shared/config/site";

export const alt = `${site.name} — villa in Bali`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/jpeg";

/**
 * `ImageResponse` only emits PNG, and a photograph at 1200x630 lands around 1.4MB — past the
 * ~300KB where WhatsApp stops fetching a thumbnail, which is the bug this card exists to fix.
 * Re-encoding to JPEG brings the same picture in at roughly a sixth of that.
 */
async function asJpeg(image: ImageResponse): Promise<Response> {
  const png = Buffer.from(await image.arrayBuffer());
  const jpeg = await sharp(png).jpeg({ quality: 78, mozjpeg: true }).toBuffer();

  return new Response(new Uint8Array(jpeg), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}

/**
 * `formatIDR` renders through Intl in the app; the OG renderer runs in a build worker where a
 * narrow no-break space would be drawn as a missing glyph, so the grouping is done by hand.
 */
function idr(amount: number): string {
  return `IDR ${amount.toLocaleString("en-US").replace(/,/g, ".")}`;
}

/**
 * The share card for a property page, generated at build alongside the page itself.
 *
 * The hero is drawn at 1200x630 from our own domain rather than linking the S3 original: the
 * bucket serves a 545KB JPEG under a `.png` name, which WhatsApp drops for size and stricter
 * crawlers reject for the content-type mismatch.
 */
export default async function Image({
  params,
}: {
  params: Promise<{ type: string; key: string }>;
}) {
  const { type, key } = await params;
  const property = (PROPERTY_TYPES as readonly string[]).includes(type)
    ? await getPropertyDetail(key)
    : null;

  if (!property || property.type !== type) {
    return asJpeg(new ImageResponse(<Fallback />, size));
  }

  const label = PROPERTY_TYPE_LABEL[property.type as PropertyType];
  const hero = property.images[0];

  return asJpeg(
    new ImageResponse(
      <div style={{ width: "100%", height: "100%", display: "flex", backgroundColor: "#241d17" }}>
        {hero ? (
          <img
            src={hero}
            alt=""
            width={size.width}
            height={size.height}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: size.width,
              height: size.height,
              objectFit: "cover",
            }}
          />
        ) : null}

        {/* Scrim: the name has to stay legible over a bright pool shot as well as a dusk one. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: size.width,
            height: size.height,
            backgroundImage:
              "linear-gradient(180deg, rgba(20,15,12,0.15) 0%, rgba(20,15,12,0.55) 52%, rgba(20,15,12,0.92) 100%)",
          }}
        />

        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: 64,
            color: "#ffffff",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div
              style={{
                fontSize: 22,
                letterSpacing: 7,
                textTransform: "uppercase",
                color: "#e6d9c9",
              }}
            >
              {site.name}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 22,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: "#ffffff",
                backgroundColor: "rgba(149,124,100,0.9)",
                padding: "10px 22px",
                borderRadius: 999,
              }}
            >
              {label}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: property.name.length > 26 ? 66 : 82,
                lineHeight: 1.08,
                fontWeight: 700,
                letterSpacing: -1.5,
              }}
            >
              {property.name}
            </div>

            {/* One interpolation, not `{location}, Bali`: an expression beside a literal is two
              child nodes to Satori, which then demands an explicit display on the parent. */}
            <div style={{ marginTop: 20, fontSize: 34, color: "rgba(255,255,255,0.82)" }}>
              {`${property.location}, Bali`}
            </div>

            <div
              style={{
                marginTop: 34,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                {property.fromPrice === null ? (
                  <div style={{ fontSize: 34, color: "#e6d9c9" }}>Rates on request</div>
                ) : (
                  <>
                    <div style={{ fontSize: 22, letterSpacing: 4, color: "rgba(255,255,255,0.6)" }}>
                      FROM
                    </div>
                    {/* Satori refuses a multi-child node without an explicit display. */}
                    <div
                      style={{
                        marginTop: 6,
                        display: "flex",
                        alignItems: "baseline",
                        gap: 10,
                      }}
                    >
                      <span style={{ fontSize: 46, fontWeight: 700 }}>
                        {idr(property.fromPrice)}
                      </span>
                      <span style={{ fontSize: 26, color: "rgba(255,255,255,0.65)" }}>/ night</span>
                    </div>
                  </>
                )}
              </div>

              <div style={{ fontSize: 26, color: "rgba(255,255,255,0.7)" }}>{site.website}</div>
            </div>
          </div>
        </div>
      </div>,
      size,
    ),
  );
}

function Fallback() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#241d17",
        color: "#ffffff",
      }}
    >
      <div style={{ fontSize: 26, letterSpacing: 8, textTransform: "uppercase", color: "#c9b49c" }}>
        {site.name}
      </div>
      <div style={{ marginTop: 24, fontSize: 64, fontWeight: 700 }}>Villas across Bali</div>
    </div>
  );
}

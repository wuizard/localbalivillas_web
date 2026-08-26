const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  hellip: "…",
  mdash: "—",
  ndash: "–",
  rsquo: "’",
  lsquo: "‘",
  ldquo: "“",
  rdquo: "”",
};

function decodeEntities(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (match, name: string) => ENTITIES[name.toLowerCase()] ?? match);
}

function toText(html: string): string {
  return decodeEntities(html.replace(/<[^>]*>/g, "")).replace(/\s+/g, " ").trim();
}

/**
 * CMS HTML never reaches the DOM as markup. Rather than sanitising an allowlist of tags and
 * hoping it holds, the boundary extracts plain text and the app renders its own elements —
 * there is no `dangerouslySetInnerHTML` anywhere in the codebase, so `description` and
 * `houseRules` cannot carry script or markup into a page (CLAUDE.md §12).
 *
 * The trade is inline formatting: bold, links and nesting are dropped. The API's copy is
 * plain prose, so nothing of substance is lost.
 */
export function htmlToParagraphs(html: string | null | undefined): string[] {
  if (!html) return [];

  return html
    .split(/<\/p>|<br\s*\/?>|<\/div>/i)
    .map(toText)
    .filter((paragraph) => paragraph.length > 0);
}

const BLOCK = /<(li|p)[^>]*>([\s\S]*?)<\/\1>/gi;
/** A block whose entire content is bold/underlined is a heading, not a rule. */
const HEADING_ONLY = /^\s*(?:<(?:strong|b|u|em)[^>]*>\s*)+[^<]*(?:\s*<\/(?:strong|b|u|em)>\s*)+$/i;

export type LabelledLine = { label: string | null; value: string };

/**
 * Flattens CMS block markup into lines, carrying `<p><strong><u>Check in</u></strong></p>`
 * style headings down onto the lines beneath them as labels.
 *
 * The plain `<li>`-or-paragraphs reader could not see these: a page that mixes headed
 * paragraphs with one stray `<ul>` matched the list branch, and every headed paragraph —
 * check-in times, check-out times, age limits — was silently dropped.
 */
export function htmlToLabelledLines(html: string | null | undefined): LabelledLine[] {
  if (!html) return [];

  const lines: LabelledLine[] = [];
  let heading: string | null = null;

  for (const match of html.matchAll(BLOCK)) {
    const inner = match[2] ?? "";
    const text = toText(inner);
    if (text.length === 0) continue;

    if (match[1]?.toLowerCase() === "p" && HEADING_ONLY.test(inner.trim())) {
      heading = text.replace(/[:\s]+$/, "");
      continue;
    }

    const inline = splitLabelled(text);
    lines.push(inline.label ? inline : { label: heading, value: text });
  }

  return lines;
}

/** Pulls `<li>` contents out as plain strings; falls back to paragraphs when there is no list. */
export function htmlToListItems(html: string | null | undefined): string[] {
  if (!html) return [];

  const items = [...html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
    .map((match) => toText(match[1] ?? ""))
    .filter((item) => item.length > 0);

  return items.length > 0 ? items : htmlToParagraphs(html);
}

/**
 * Splits "Check-out : From 07:00 to 12:00 noon." into its label and value. Returns a null
 * label when the line is not in that shape, so callers can render it as a plain sentence.
 */
export function splitLabelled(line: string): { label: string | null; value: string } {
  const match = /^([^:]{2,40}?)\s*:\s*(.+)$/.exec(line);
  if (!match?.[1] || !match[2]) return { label: null, value: line };
  return { label: match[1].trim(), value: match[2].trim() };
}

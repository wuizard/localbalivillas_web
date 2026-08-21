import { describe, expect, it } from "vitest";
import { htmlToListItems, htmlToParagraphs, splitLabelled } from "./html";

describe("htmlToParagraphs", () => {
  it("splits on paragraph and break boundaries", () => {
    expect(htmlToParagraphs("<p>One</p><p>Two</p>")).toEqual(["One", "Two"]);
    expect(htmlToParagraphs("<p>One<br/>Two</p>")).toEqual(["One", "Two"]);
  });

  it("decodes entities and collapses whitespace", () => {
    expect(htmlToParagraphs("<p>Bali&nbsp;&amp;   beyond&hellip;</p>")).toEqual([
      "Bali & beyond…",
    ]);
  });

  it("returns nothing for empty input", () => {
    expect(htmlToParagraphs(null)).toEqual([]);
    expect(htmlToParagraphs("<p></p>")).toEqual([]);
  });

  it("strips markup rather than trusting it — a script tag becomes inert text", () => {
    const hostile = "<p>Hi<script>alert('x')</script></p>";
    const [paragraph] = htmlToParagraphs(hostile);
    expect(paragraph).toBe("Hialert('x')");
    expect(paragraph).not.toContain("<");
  });
});

describe("htmlToListItems", () => {
  it("extracts list items", () => {
    const html = "<ul><li>Pets are not allowed.</li><li><span>No smoking.</span></li></ul>";
    expect(htmlToListItems(html)).toEqual(["Pets are not allowed.", "No smoking."]);
  });

  it("falls back to paragraphs when there is no list", () => {
    expect(htmlToListItems("<p>Just prose</p>")).toEqual(["Just prose"]);
  });
});

describe("splitLabelled", () => {
  it("splits a labelled rule", () => {
    expect(splitLabelled("Check-out : From 07:00 to 12:00 noon.")).toEqual({
      label: "Check-out",
      value: "From 07:00 to 12:00 noon.",
    });
  });

  it("leaves an unlabelled sentence alone", () => {
    expect(splitLabelled("Pets are not allowed.")).toEqual({
      label: null,
      value: "Pets are not allowed.",
    });
  });

  it("does not treat a long clause before a colon as a label", () => {
    const line =
      "Guests are required to show a photo ID and the name on your booking must match: exactly.";
    expect(splitLabelled(line).label).toBeNull();
  });
});

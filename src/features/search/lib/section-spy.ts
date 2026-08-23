export type SpiedSection<Id extends string> = {
  id: Id;
  /** Distance from the section's top to the scroll container's top. Negative once scrolled past. */
  offsetTop: number;
};

export type SpyOptions = {
  /** The container is scrolled to the bottom. */
  atEnd: boolean;
  /** How far below the container's top edge still counts as "reached". */
  threshold?: number;
};

/**
 * Which section a scrolling reader is looking at: the last one whose top has passed the
 * container's top edge.
 *
 * `atEnd` is not a nicety. The final section is usually shorter than the viewport, so it can
 * never reach the top edge and would otherwise never light up however far down you scroll —
 * at the bottom of the scroll it is simply what is on screen.
 */
export function activeSection<Id extends string>(
  sections: SpiedSection<Id>[],
  { atEnd, threshold = 24 }: SpyOptions,
): Id | null {
  const first = sections[0];
  if (!first) return null;

  const last = sections[sections.length - 1];
  if (atEnd && last) return last.id;

  let current = first.id;
  for (const section of sections) {
    if (section.offsetTop <= threshold) current = section.id;
  }
  return current;
}

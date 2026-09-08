/**
 * Shared motion tokens (pasal 14 & 22).
 *
 * Section reveals are CSS-driven and read their easing from the
 * `--ease-out-editorial` custom property in globals.css. These constants are
 * the JavaScript mirror of the same values, for the two places that genuinely
 * animate in the browser: the parallax media and the sticky process
 * storyteller. Nothing else should hard-code a curve or a duration.
 */

/** Editorial easing: decisive start, long settle. Never bouncy. */
export const easeOutEditorial = [0.22, 1, 0.36, 1] as const;

/**
 * Symmetric curve for cross-dissolves.
 *
 * A crossfade wants no perceived start or end - `easeOutEditorial` would make
 * the new frame arrive abruptly and then linger, which reads as a cut.
 */
export const easeDissolve = [0.4, 0, 0.2, 1] as const;

export const duration = {
  /** Hover, press, colour shifts. */
  micro: 0.2,
  /** Most enter/exit transitions. */
  standard: 0.4,
  /** Section reveals and image openings. */
  editorial: 0.65,
  /** Cross-dissolve between hero frames. Long enough to read as a dissolve. */
  dissolve: 1.4,
} as const;

/** Seconds a hero frame holds at full opacity before the next one takes over. */
export const heroHold = 5.5;

/**
 * Seconds for one sweep of the hero's slow zoom, in or out.
 *
 * Deliberately far longer than a frame's hold: the movement should never
 * arrive anywhere while you are looking at it, only reveal itself if you keep
 * watching. A full in-and-out cycle is twice this.
 */
export const heroZoom = 14;

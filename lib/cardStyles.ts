import type { CSSProperties } from "react";

/**
 * Shared "gleam" gradient border for landing-page cards.
 *
 * Technique: paint two layered backgrounds — a solid white on the
 * padding-box (the visible card surface) and a multi-stop gradient on
 * the border-box (visible through the transparent 1px border). Works
 * with `border-radius` without the seams that `border-image-slice`
 * leaves on rounded corners.
 *
 * Cards that use this should drop their plain `background: #FFFFFF`
 * and `border: 1px solid …` declarations because they're folded into
 * this object.
 */
export const gleamBorder: CSSProperties = {
  border: "1px solid transparent",
  background:
    "linear-gradient(#FFFFFF, #FFFFFF) padding-box, " +
    "linear-gradient(135deg, " +
      "rgba(34,197,94,0.55) 0%, " +     // green top-left
      "rgba(245,158,11,0.45) 32%, " +   // amber mid-top
      "rgba(236,72,153,0.4) 64%, " +    // pink mid-bottom
      "rgba(203,213,225,0.15) 100%" +   // light gray bottom-right
    ") border-box",
};

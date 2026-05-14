import type { CSSProperties } from "react";

/**
 * "Gleam" gradient borders for the Latest Indicator Movements cards.
 *
 * Technique: two-layer background-clip — a solid white on the
 * padding-box (the visible card surface) and a multi-stop gradient on
 * the border-box (visible through the transparent 1px border). Works
 * with `border-radius` without the seams that `border-image-slice`
 * leaves on rounded corners.
 *
 * Each variant uses one accent colour that fades to a lighter tint at
 * the diagonal opposite corner.
 */

function gleam(accent: string, soft: string): CSSProperties {
  return {
    border: "1px solid transparent",
    background:
      "linear-gradient(#FFFFFF, #FFFFFF) padding-box, " +
      `linear-gradient(135deg, ${accent} 0%, ${soft} 55%, rgba(229,231,235,0.15) 100%) border-box`,
  };
}

/** Accelerating cards — green gleam */
export const gleamGreen = gleam("rgba(34,197,94,0.75)", "rgba(187,247,208,0.45)");

/** Slowing cards — amber gleam */
export const gleamAmber = gleam("rgba(245,158,11,0.75)", "rgba(253,224,170,0.45)");

/** Emerging cards — blue gleam */
export const gleamBlue = gleam("rgba(37,99,235,0.7)", "rgba(191,219,254,0.45)");

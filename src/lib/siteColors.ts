export const ORIGINAL_HUE = 158;

/** Hue (0-360) in OKLCH space of a #rrggbb color. */
export function hexToOklchHue(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const lin = (c: number) => {
    c /= 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const r = lin((n >> 16) & 255), g = lin((n >> 8) & 255), b = lin(n & 255);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const h = (Math.atan2(B, A) * 180) / Math.PI;
  return (h + 360) % 360;
}

/** How many degrees to rotate the original green to reach the chosen color (null = original). */
export function hueShiftFor(color: string | null | undefined): number {
  if (!color || !/^#[0-9a-f]{6}$/i.test(color)) return 0;
  let d = hexToOklchHue(color) - ORIGINAL_HUE;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return Math.round(d);
}

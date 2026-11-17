import { describe, it, expect } from "vitest";
import { hueShiftFor } from "./siteColors";
describe("hueShiftFor", () => {
  it("original colors give no shift", () => expect(hueShiftFor(null)).toBe(0));
  it("yellow shifts away from green", () => expect(Math.abs(hueShiftFor("#f5c800"))).toBeGreaterThan(40));
});

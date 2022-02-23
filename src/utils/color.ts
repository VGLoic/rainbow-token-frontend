import { Color } from "common";

export function mergeColors(colorA: Color, colorB: Color) {
  return {
    r: Math.floor((colorA.r + colorB.r) / 2),
    g: Math.floor((colorA.g + colorB.g) / 2),
    b: Math.floor((colorA.b + colorB.b) / 2),
  };
}

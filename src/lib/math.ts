import type { Point } from "./interfaces/room-state";

export const pointLerp = (a: Point, b: Point, t: number): Point => {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  };
};

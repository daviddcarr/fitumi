import { pointLerp } from "../math";

describe("pointLerp", () => {
  it("returns the start point when t=0", () => {
    const a = { x: 0, y: 0 };
    const b = { x: 10, y: 10 };
    expect(pointLerp(a, b, 0)).toEqual({ x: 0, y: 0 });
  });

  it("returns the end point when t=1", () => {
    const a = { x: 0, y: 0 };
    const b = { x: 10, y: 10 };
    expect(pointLerp(a, b, 1)).toEqual({ x: 10, y: 10 });
  });

  it("interpolates halfway when t=0.5", () => {
    const a = { x: 0, y: 0 };
    const b = { x: 10, y: 10 };
    expect(pointLerp(a, b, 0.5)).toEqual({ x: 5, y: 5 });
  });
});

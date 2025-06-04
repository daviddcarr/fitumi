import { getRandomSubject, BASIC_SUBJECTS } from "../subject-sets";
import type { PreviousArt } from "../../lib/interfaces/room-state";

describe("getRandomSubject", () => {
  const EXPECTED_SUBJECTS = BASIC_SUBJECTS.slice(0, 5);

  const previousArt: PreviousArt[] = BASIC_SUBJECTS.filter(
    (subject) => !EXPECTED_SUBJECTS.includes(subject)
  ).map((subject) => ({
    subject,
    strokes: [],
  }));

  it("returns a random subject", () => {
    const result = getRandomSubject([]);
    expect(BASIC_SUBJECTS).toContain(result);
  });

  it("returns a random subject that has not been used", () => {
    const result = getRandomSubject(previousArt);
    expect(EXPECTED_SUBJECTS).toContain(result);
  });
});

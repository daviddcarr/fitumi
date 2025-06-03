import { getColor, PLAYER_COLORS } from '../constants';

describe('getColor', () => {
  it('returns a color by name', () => {
    const red = getColor('Red');
    expect(red).toBeDefined();
    expect(red.hex).toBe('#ff0000');
  });

  it('returns undefined for unknown colors', () => {
    expect(getColor('Unknown')).toBeUndefined();
  });
});

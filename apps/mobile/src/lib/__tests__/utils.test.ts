import { isDefined, formatDuration } from '../utils';

describe('Utils', () => {
  describe('isDefined', () => {
    it('returns true for defined values', () => {
      expect(isDefined(0)).toBe(true);
      expect(isDefined('')).toBe(true);
      expect(isDefined(false)).toBe(true);
      expect(isDefined([])).toBe(true);
      expect(isDefined({})).toBe(true);
    });

    it('returns false for undefined', () => {
      expect(isDefined(undefined)).toBe(false);
    });

    it('returns false for null', () => {
      expect(isDefined(null)).toBe(false);
    });
  });

  describe('formatDuration', () => {
    it('formats zero milliseconds correctly', () => {
      expect(formatDuration(0)).toBe('00:00');
    });

    it('formats seconds correctly', () => {
      expect(formatDuration(5000)).toBe('00:05');
      expect(formatDuration(30000)).toBe('00:30');
      expect(formatDuration(59000)).toBe('00:59');
    });

    it('formats minutes and seconds correctly', () => {
      expect(formatDuration(60000)).toBe('01:00');
      expect(formatDuration(125000)).toBe('02:05');
      expect(formatDuration(600000)).toBe('10:00');
    });
  });
});

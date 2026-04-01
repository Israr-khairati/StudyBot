import { describe, it, expect } from 'vitest';
import { formatDate, truncate } from './utils';

describe('utils.ts', () => {
  describe('formatDate', () => {
    it('should format a Date object correctly', () => {
      const date = new Date('2024-03-31T00:00:00.000Z');
      expect(formatDate(date)).toBe('Mar 31, 2024');
    });

    it('should format a date string correctly', () => {
      expect(formatDate('2024-01-01')).toBe('Jan 1, 2024');
    });
  });

  describe('truncate', () => {
    it('should truncate a string longer than the limit', () => {
      const longStr = 'This is a very long string that should be truncated';
      expect(truncate(longStr, 10)).toBe('This is a ...');
    });

    it('should not truncate a string shorter than the limit', () => {
      const shortStr = 'Short';
      expect(truncate(shortStr, 50)).toBe('Short');
    });

    it('should use default limit of 50', () => {
      const longStr = 'a'.repeat(60);
      expect(truncate(longStr)).toHaveLength(53); // 50 + '...'
    });
  });
});

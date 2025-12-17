import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { validateLength, validateCharacters, validateInput, filterToLowercase } from './validation';

describe('Input Validation', () => {
  // **Feature: lcs-visualization, Property 1: Input Length Validation**
  // **Validates: Requirements 1.2**
  describe('Property 1: Input Length Validation', () => {
    it('should accept strings with length between 1 and 10 (inclusive)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }),
          (length) => {
            const str = 'a'.repeat(length);
            expect(validateLength(str)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject empty strings (length 0)', () => {
      expect(validateLength('')).toBe(false);
    });

    it('should reject strings longer than 10 characters', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 11, max: 100 }),
          (length) => {
            const str = 'a'.repeat(length);
            expect(validateLength(str)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // **Feature: lcs-visualization, Property 2: Input Character Validation**
  // **Validates: Requirements 1.3**
  describe('Property 2: Input Character Validation', () => {
    it('should accept strings containing only lowercase letters (a-z)', () => {
      fc.assert(
        fc.property(
          fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')), { minLength: 1, maxLength: 10 }),
          (str) => {
            expect(validateCharacters(str)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject strings containing uppercase letters', () => {
      fc.assert(
        fc.property(
          fc.stringOf(fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')), { minLength: 1, maxLength: 10 }),
          (str) => {
            expect(validateCharacters(str)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject strings containing digits', () => {
      fc.assert(
        fc.property(
          fc.stringOf(fc.constantFrom(...'0123456789'.split('')), { minLength: 1, maxLength: 10 }),
          (str) => {
            expect(validateCharacters(str)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject strings containing special characters', () => {
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
      fc.assert(
        fc.property(
          fc.stringOf(fc.constantFrom(...specialChars.split('')), { minLength: 1, maxLength: 10 }),
          (str) => {
            expect(validateCharacters(str)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject empty strings', () => {
      expect(validateCharacters('')).toBe(false);
    });
  });

  describe('validateInput (combined validation)', () => {
    it('should accept valid inputs', () => {
      fc.assert(
        fc.property(
          fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')), { minLength: 1, maxLength: 10 }),
          (str) => {
            expect(validateInput(str)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('filterToLowercase', () => {
    it('should filter out non-lowercase characters', () => {
      expect(filterToLowercase('AbC123def')).toBe('abcdef');
      expect(filterToLowercase('HELLO')).toBe('hello');
      expect(filterToLowercase('test@123')).toBe('test');
    });
  });
});

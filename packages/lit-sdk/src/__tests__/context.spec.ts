import { describe, it, expect } from 'vitest';
import { brPageContext, brComponentContext, brMappingContext } from '../context.js';

describe('context', () => {
  describe('brPageContext', () => {
    it('is created with the key "br-page"', () => {
      // Lit Context objects expose their key via toString()
      expect(String(brPageContext)).toBe('br-page');
    });

    it('is defined', () => {
      expect(brPageContext).toBeDefined();
    });
  });

  describe('brComponentContext', () => {
    it('is created with the key "br-component"', () => {
      expect(String(brComponentContext)).toBe('br-component');
    });

    it('is defined', () => {
      expect(brComponentContext).toBeDefined();
    });
  });

  describe('brMappingContext', () => {
    it('is created with the key "br-mapping"', () => {
      expect(String(brMappingContext)).toBe('br-mapping');
    });

    it('is defined', () => {
      expect(brMappingContext).toBeDefined();
    });
  });

  it('all three contexts have unique keys', () => {
    const keys = new Set([
      String(brPageContext),
      String(brComponentContext),
      String(brMappingContext),
    ]);
    expect(keys.size).toBe(3);
  });
});

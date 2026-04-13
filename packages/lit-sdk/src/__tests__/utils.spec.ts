import {
  describe, it, expect, vi, beforeEach,
} from 'vitest';
import {
  getContainerItemContent as sdkGetContainerItemContent,
  isLink,
  TYPE_LINK_EXTERNAL,
  TYPE_LINK_INTERNAL,
} from '@bloomreach/spa-sdk';
import {
  getContainerItemContent,
  getDocumentData,
  isInternalLink,
  isExternalLink,
  isComponent,
  isContainer,
  isContainerItem,
  isContent,
  isDocument,
  isImageSet,
  isMenu,
  isMetaComment,
  isMeta,
  isPage,
  isPagination,
  isReference,
} from '../utils.js';
import { createMockContainerItem, createMockPage, createMockContent } from './mocks.js';

vi.mock('@bloomreach/spa-sdk', () => ({
  getContainerItemContent: vi.fn(),
  isComponent: vi.fn(() => false),
  isContainer: vi.fn(() => false),
  isContainerItem: vi.fn(() => false),
  isContent: vi.fn(() => false),
  isDocument: vi.fn(() => false),
  isImageSet: vi.fn(() => false),
  isLink: vi.fn(() => false),
  isMenu: vi.fn(() => false),
  isMetaComment: vi.fn(() => false),
  isMeta: vi.fn(() => false),
  isPage: vi.fn(() => false),
  isPagination: vi.fn(() => false),
  isReference: vi.fn(() => false),
  TYPE_LINK_EXTERNAL: 'external',
  TYPE_LINK_INTERNAL: 'internal',
}));

describe('utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getContainerItemContent', () => {
    it('delegates to SDK getContainerItemContent', () => {
      const item = createMockContainerItem();
      const page = createMockPage();
      const data = { title: 'Hello' };
      vi.mocked(sdkGetContainerItemContent).mockReturnValue(data);

      const result = getContainerItemContent(item as any, page as any);

      expect(sdkGetContainerItemContent).toHaveBeenCalledWith(item, page);
      expect(result).toEqual(data);
    });

    it('returns undefined when SDK returns null', () => {
      const item = createMockContainerItem();
      const page = createMockPage();
      vi.mocked(sdkGetContainerItemContent).mockReturnValue(null);

      const result = getContainerItemContent(item as any, page as any);

      expect(result).toBeUndefined();
    });
  });

  describe('getDocumentData', () => {
    it('Strategy 1: resolves models.document $ref via page.getContent().getData()', () => {
      const docRef = { $ref: '/page/doc1' };
      const content = createMockContent({ getData: vi.fn(() => ({ title: 'From Model' })) });
      const item = createMockContainerItem({
        getModels: vi.fn(() => ({ document: docRef })),
      });
      const page = createMockPage({
        getContent: vi.fn(() => content),
      });

      const result = getDocumentData(item as any, page as any);

      expect(page.getContent).toHaveBeenCalledWith(docRef);
      expect(content.getData).toHaveBeenCalled();
      expect(result).toEqual({ title: 'From Model' });
    });

    it('Strategy 1: returns raw content when getContent returns object without getData', () => {
      const docRef = { $ref: '/page/doc1' };
      const rawContent = { title: 'Raw Data' };
      const item = createMockContainerItem({
        getModels: vi.fn(() => ({ document: docRef })),
      });
      const page = createMockPage({
        getContent: vi.fn(() => rawContent),
      });

      const result = getDocumentData(item as any, page as any);

      expect(result).toEqual({ title: 'Raw Data' });
    });

    it('Strategy 2: falls back to SDK getContainerItemContent', () => {
      const item = createMockContainerItem({
        getModels: vi.fn(() => ({})),
      });
      const page = createMockPage();
      const fallbackData = { title: 'From Content' };
      vi.mocked(sdkGetContainerItemContent).mockReturnValue(fallbackData);

      const result = getDocumentData(item as any, page as any);

      expect(sdkGetContainerItemContent).toHaveBeenCalledWith(item, page);
      expect(result).toEqual({ title: 'From Content' });
    });

    it('returns undefined when neither strategy works', () => {
      const item = createMockContainerItem({
        getModels: vi.fn(() => ({})),
      });
      const page = createMockPage();
      vi.mocked(sdkGetContainerItemContent).mockReturnValue(null);

      const result = getDocumentData(item as any, page as any);

      expect(result).toBeUndefined();
    });

    it('returns undefined when models.document ref resolves to null content', () => {
      const docRef = { $ref: '/page/doc-missing' };
      const item = createMockContainerItem({
        getModels: vi.fn(() => ({ document: docRef })),
      });
      const page = createMockPage({
        getContent: vi.fn(() => null),
      });
      vi.mocked(sdkGetContainerItemContent).mockReturnValue(null);

      const result = getDocumentData(item as any, page as any);

      expect(result).toBeUndefined();
    });
  });

  describe('isInternalLink', () => {
    it('returns true for internal links', () => {
      const link = { type: 'internal', href: '/page' };
      vi.mocked(isLink).mockReturnValue(true);

      expect(isInternalLink(link)).toBe(true);
    });

    it('returns false when isLink returns false', () => {
      vi.mocked(isLink).mockReturnValue(false);

      expect(isInternalLink('not-a-link')).toBe(false);
    });

    it('returns false for external links', () => {
      const link = { type: 'external', href: 'https://example.com' };
      vi.mocked(isLink).mockReturnValue(true);

      expect(isInternalLink(link)).toBe(false);
    });
  });

  describe('isExternalLink', () => {
    it('returns true for external links', () => {
      const link = { type: 'external', href: 'https://example.com' };
      vi.mocked(isLink).mockReturnValue(true);

      expect(isExternalLink(link)).toBe(true);
    });

    it('returns false when isLink returns false', () => {
      vi.mocked(isLink).mockReturnValue(false);

      expect(isExternalLink('not-a-link')).toBe(false);
    });

    it('returns false for internal links', () => {
      const link = { type: 'internal', href: '/page' };
      vi.mocked(isLink).mockReturnValue(true);

      expect(isExternalLink(link)).toBe(false);
    });
  });

  describe('re-exported type guards', () => {
    it('exports isComponent as a function', () => {
      expect(typeof isComponent).toBe('function');
    });

    it('exports isContainer as a function', () => {
      expect(typeof isContainer).toBe('function');
    });

    it('exports isContainerItem as a function', () => {
      expect(typeof isContainerItem).toBe('function');
    });

    it('exports isContent as a function', () => {
      expect(typeof isContent).toBe('function');
    });

    it('exports isDocument as a function', () => {
      expect(typeof isDocument).toBe('function');
    });

    it('exports isImageSet as a function', () => {
      expect(typeof isImageSet).toBe('function');
    });

    it('exports isMenu as a function', () => {
      expect(typeof isMenu).toBe('function');
    });

    it('exports isMetaComment as a function', () => {
      expect(typeof isMetaComment).toBe('function');
    });

    it('exports isMeta as a function', () => {
      expect(typeof isMeta).toBe('function');
    });

    it('exports isPage as a function', () => {
      expect(typeof isPage).toBe('function');
    });

    it('exports isPagination as a function', () => {
      expect(typeof isPagination).toBe('function');
    });

    it('exports isReference as a function', () => {
      expect(typeof isReference).toBe('function');
    });
  });
});

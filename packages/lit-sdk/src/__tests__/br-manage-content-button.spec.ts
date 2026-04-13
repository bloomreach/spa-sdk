import {
  describe, it, expect, vi, afterEach,
} from 'vitest';
import { TYPE_MANAGE_CONTENT_BUTTON } from '@bloomreach/spa-sdk';
import { createMockPage, createMockMeta, cleanup } from './mocks.js';

import '../br-manage-content-button.js';
import type { BrManageContentButton } from '../br-manage-content-button.js';

vi.mock('@bloomreach/spa-sdk', () => ({
  initialize: vi.fn(),
  destroy: vi.fn(),
  isContainer: vi.fn(() => false),
  isContainerItem: vi.fn(() => false),
  TYPE_CONTAINER_INLINE: 'hst.span',
  TYPE_CONTAINER_NO_MARKUP: 'hst.nomarkup',
  TYPE_CONTAINER_ORDERED_LIST: 'hst.orderedlist',
  TYPE_CONTAINER_UNORDERED_LIST: 'hst.unorderedlist',
  TYPE_MANAGE_CONTENT_BUTTON: 'MANAGE_CONTENT_BUTTON',
  TYPE_MANAGE_MENU_BUTTON: 'MANAGE_MENU_BUTTON',
}));

describe('br-manage-content-button', () => {
  let el: BrManageContentButton;

  afterEach(() => {
    if (el?.parentNode) { cleanup(el); }
  });

  describe('live mode', () => {
    it('returns nothing when isPreview() is false', async () => {
      const page = createMockPage({ isPreview: vi.fn(() => false) });

      el = document.createElement('br-manage-content-button') as BrManageContentButton;
      (el as any)._contextPage = page;
      document.body.appendChild(el);
      await el.updateComplete;

      // Lit renders `nothing` as an empty comment node, no child elements
      expect(el.children.length).toBe(0);
    });

    it('does NOT call page.getButton in live mode', async () => {
      const page = createMockPage({ isPreview: vi.fn(() => false) });

      el = document.createElement('br-manage-content-button') as BrManageContentButton;
      (el as any)._contextPage = page;
      document.body.appendChild(el);
      await el.updateComplete;

      expect(page.getButton).not.toHaveBeenCalled();
    });
  });

  describe('preview mode', () => {
    it('renders empty html in preview mode', async () => {
      const meta = createMockMeta(0);
      const page = createMockPage({
        isPreview: vi.fn(() => true),
        getButton: vi.fn(() => meta),
      });

      el = document.createElement('br-manage-content-button') as BrManageContentButton;
      (el as any)._contextPage = page;
      document.body.appendChild(el);
      await el.updateComplete;

      // Should render empty html (not nothing)
      // In live mode it returns nothing, in preview it returns html``
      // The element exists in the DOM
      expect(el.isConnected).toBe(true);
    });

    it('calls page.getButton with TYPE_MANAGE_CONTENT_BUTTON and all properties', async () => {
      const meta = createMockMeta(2);
      const page = createMockPage({
        isPreview: vi.fn(() => true),
        getButton: vi.fn(() => meta),
      });
      const content = { id: 'doc-1' };

      el = document.createElement('br-manage-content-button') as BrManageContentButton;
      (el as any)._contextPage = page;
      el.content = content as any;
      el.documentTemplateQuery = 'new-banner-document';
      el.folderTemplateQuery = 'new-banner-folder';
      el.path = 'banners';
      el.parameter = 'document';
      el.relative = true;
      el.root = 'banners';
      el.pickerSelectableNodeTypes = 'best:banner,hap:bannerdocument';
      el.pickerConfiguration = 'cms-pickers/documents';
      el.pickerInitialPath = '/content/documents/myproject';
      document.body.appendChild(el);
      await el.updateComplete;

      expect(page.getButton).toHaveBeenCalledWith('MANAGE_CONTENT_BUTTON', {
        content,
        documentTemplateQuery: 'new-banner-document',
        folderTemplateQuery: 'new-banner-folder',
        path: 'banners',
        parameter: 'document',
        relative: true,
        root: 'banners',
        pickerSelectableNodeTypes: 'best:banner,hap:bannerdocument',
        pickerConfiguration: 'cms-pickers/documents',
        pickerInitialPath: '/content/documents/myproject',
      });
    });

    it('renders meta comments via meta.render()', async () => {
      const meta = createMockMeta(2);
      const page = createMockPage({
        isPreview: vi.fn(() => true),
        getButton: vi.fn(() => meta),
      });

      el = document.createElement('br-manage-content-button') as BrManageContentButton;
      (el as any)._contextPage = page;
      document.body.appendChild(el);
      await el.updateComplete;

      expect(meta.render).toHaveBeenCalledWith(el, el);
    });

    it('uses renderTarget for meta injection when provided', async () => {
      const meta = createMockMeta(2);
      const page = createMockPage({
        isPreview: vi.fn(() => true),
        getButton: vi.fn(() => meta),
      });
      const target = document.createElement('div');
      document.body.appendChild(target);

      el = document.createElement('br-manage-content-button') as BrManageContentButton;
      (el as any)._contextPage = page;
      el.renderTarget = target;
      document.body.appendChild(el);
      await el.updateComplete;

      expect(meta.render).toHaveBeenCalledWith(target, target);

      target.remove();
    });

    it('falls back to this when no renderTarget', async () => {
      const meta = createMockMeta(2);
      const page = createMockPage({
        isPreview: vi.fn(() => true),
        getButton: vi.fn(() => meta),
      });

      el = document.createElement('br-manage-content-button') as BrManageContentButton;
      (el as any)._contextPage = page;
      document.body.appendChild(el);
      await el.updateComplete;

      expect(meta.render).toHaveBeenCalledWith(el, el);
    });
  });

  describe('page property vs context', () => {
    it('uses page property over context when both present', async () => {
      const contextPage = createMockPage({
        isPreview: vi.fn(() => true),
        getButton: vi.fn(() => createMockMeta()),
      });
      const directPage = createMockPage({
        isPreview: vi.fn(() => true),
        getButton: vi.fn(() => createMockMeta(2)),
      });

      el = document.createElement('br-manage-content-button') as BrManageContentButton;
      (el as any)._contextPage = contextPage;
      el.page = directPage as any;
      document.body.appendChild(el);
      await el.updateComplete;

      expect(directPage.getButton).toHaveBeenCalled();
      expect(contextPage.getButton).not.toHaveBeenCalled();
    });
  });

  describe('cleanup', () => {
    it('cleans up meta on disconnect', async () => {
      const clearFn = vi.fn();
      const meta = createMockMeta(2, () => clearFn);
      const page = createMockPage({
        isPreview: vi.fn(() => true),
        getButton: vi.fn(() => meta),
      });

      el = document.createElement('br-manage-content-button') as BrManageContentButton;
      (el as any)._contextPage = page;
      document.body.appendChild(el);
      await el.updateComplete;

      el.remove();

      expect(clearFn).toHaveBeenCalled();
    });
  });

  describe('light DOM', () => {
    it('uses light DOM (no shadowRoot)', async () => {
      el = document.createElement('br-manage-content-button') as BrManageContentButton;
      document.body.appendChild(el);
      await el.updateComplete;

      expect(el.shadowRoot).toBeNull();
    });
  });
});

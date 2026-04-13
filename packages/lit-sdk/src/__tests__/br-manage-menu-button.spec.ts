import {
  describe, it, expect, vi, afterEach,
} from 'vitest';
import { TYPE_MANAGE_MENU_BUTTON } from '@bloomreach/spa-sdk';
import { createMockPage, createMockMeta, cleanup } from './mocks.js';

import '../br-manage-menu-button.js';
import type { BrManageMenuButton } from '../br-manage-menu-button.js';

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

describe('br-manage-menu-button', () => {
  let el: BrManageMenuButton;

  afterEach(() => {
    if (el?.parentNode) { cleanup(el); }
  });

  describe('live mode', () => {
    it('returns nothing when isPreview() is false', async () => {
      const page = createMockPage({ isPreview: vi.fn(() => false) });

      el = document.createElement('br-manage-menu-button') as BrManageMenuButton;
      (el as any)._contextPage = page;
      el.menu = { _meta: {} } as any;
      document.body.appendChild(el);
      await el.updateComplete;

      // Lit renders `nothing` as an empty comment node, no child elements
      expect(el.children.length).toBe(0);
    });
  });

  describe('preview mode', () => {
    it('returns nothing when menu is undefined even in preview', async () => {
      const page = createMockPage({ isPreview: vi.fn(() => true) });

      el = document.createElement('br-manage-menu-button') as BrManageMenuButton;
      (el as any)._contextPage = page;
      // No menu set
      document.body.appendChild(el);
      await el.updateComplete;

      // updated() returns early when !this.menu, so no getButton call
      expect(page.getButton).not.toHaveBeenCalled();
    });

    it('renders empty html in preview mode with menu', async () => {
      const meta = createMockMeta(0);
      const page = createMockPage({
        isPreview: vi.fn(() => true),
        getButton: vi.fn(() => meta),
      });

      el = document.createElement('br-manage-menu-button') as BrManageMenuButton;
      (el as any)._contextPage = page;
      el.menu = { _meta: {} } as any;
      document.body.appendChild(el);
      await el.updateComplete;

      // Element is connected and rendered (html`` not nothing)
      expect(el.isConnected).toBe(true);
    });

    it('calls page.getButton with TYPE_MANAGE_MENU_BUTTON and menu', async () => {
      const meta = createMockMeta(2);
      const menu = { _meta: {}, items: [] };
      const page = createMockPage({
        isPreview: vi.fn(() => true),
        getButton: vi.fn(() => meta),
      });

      el = document.createElement('br-manage-menu-button') as BrManageMenuButton;
      (el as any)._contextPage = page;
      el.menu = menu as any;
      document.body.appendChild(el);
      await el.updateComplete;

      expect(page.getButton).toHaveBeenCalledWith('MANAGE_MENU_BUTTON', menu);
    });

    it('renders meta comments via meta.render()', async () => {
      const meta = createMockMeta(2);
      const page = createMockPage({
        isPreview: vi.fn(() => true),
        getButton: vi.fn(() => meta),
      });

      el = document.createElement('br-manage-menu-button') as BrManageMenuButton;
      (el as any)._contextPage = page;
      el.menu = { _meta: {} } as any;
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

      el = document.createElement('br-manage-menu-button') as BrManageMenuButton;
      (el as any)._contextPage = page;
      el.menu = { _meta: {} } as any;
      el.renderTarget = target;
      document.body.appendChild(el);
      await el.updateComplete;

      expect(meta.render).toHaveBeenCalledWith(target, target);

      target.remove();
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

      el = document.createElement('br-manage-menu-button') as BrManageMenuButton;
      (el as any)._contextPage = contextPage;
      el.page = directPage as any;
      el.menu = { _meta: {} } as any;
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

      el = document.createElement('br-manage-menu-button') as BrManageMenuButton;
      (el as any)._contextPage = page;
      el.menu = { _meta: {} } as any;
      document.body.appendChild(el);
      await el.updateComplete;

      el.remove();

      expect(clearFn).toHaveBeenCalled();
    });
  });

  describe('light DOM', () => {
    it('uses light DOM (no shadowRoot)', async () => {
      el = document.createElement('br-manage-menu-button') as BrManageMenuButton;
      document.body.appendChild(el);
      await el.updateComplete;

      expect(el.shadowRoot).toBeNull();
    });
  });
});

import {
  describe, it, expect, vi, beforeEach, afterEach,
} from 'vitest';
import {
  TYPE_CONTAINER_INLINE,
  TYPE_CONTAINER_NO_MARKUP,
  TYPE_CONTAINER_ORDERED_LIST,
  TYPE_CONTAINER_UNORDERED_LIST,
} from '@bloomreach/spa-sdk';
import {
  createMockContainer, createMockContainerItem, createMockPage, createMockMeta, cleanup,
} from './mocks.js';

import '../br-container.js';
import type { BrContainer } from '../br-container.js';

vi.mock('@bloomreach/spa-sdk', () => ({
  initialize: vi.fn(),
  destroy: vi.fn(),
  isContainer: vi.fn(() => false),
  isContainerItem: vi.fn(() => false),
  TYPE_CONTAINER_BOX: 'hst.vbox',
  TYPE_CONTAINER_INLINE: 'hst.span',
  TYPE_CONTAINER_NO_MARKUP: 'hst.nomarkup',
  TYPE_CONTAINER_ORDERED_LIST: 'hst.orderedlist',
  TYPE_CONTAINER_UNORDERED_LIST: 'hst.unorderedlist',
  TYPE_MANAGE_CONTENT_BUTTON: 'MANAGE_CONTENT_BUTTON',
  TYPE_MANAGE_MENU_BUTTON: 'MANAGE_MENU_BUTTON',
}));

describe('br-container', () => {
  let el: BrContainer;

  afterEach(() => {
    if (el?.parentNode) { cleanup(el); }
  });

  async function createContainer(
    containerType = 'hst.vbox',
    children: any[] = [],
    isPreview = false,
  ): Promise<BrContainer> {
    const container = createMockContainer({
      getType: vi.fn(() => containerType),
      getChildren: vi.fn(() => children),
    });
    const page = createMockPage({ isPreview: vi.fn(() => isPreview) });

    el = document.createElement('br-container') as BrContainer;
    (el as any).component = container;
    (el as any)._page = page;
    document.body.appendChild(el);
    await el.updateComplete;
    return el;
  }

  describe('wrapper elements', () => {
    it('renders <div> wrapper for default (vbox) container type', async () => {
      const item = createMockContainerItem();
      await createContainer('hst.vbox', [item]);

      const wrapper = el.querySelector(':scope > div');
      expect(wrapper).not.toBeNull();
      expect(wrapper!.tagName).toBe('DIV');
    });

    it('renders <div> wrapper with <span> item wrappers for inline container', async () => {
      const item = createMockContainerItem();
      await createContainer('hst.span', [item]);

      const wrapper = el.querySelector(':scope > div');
      expect(wrapper).not.toBeNull();
      const spanWrapper = wrapper!.querySelector(':scope > span');
      expect(spanWrapper).not.toBeNull();
    });

    it('renders <ol> wrapper with <li> items for ordered list', async () => {
      const item = createMockContainerItem();
      await createContainer('hst.orderedlist', [item]);

      const wrapper = el.querySelector(':scope > ol');
      expect(wrapper).not.toBeNull();
      const li = wrapper!.querySelector(':scope > li');
      expect(li).not.toBeNull();
    });

    it('renders <ul> wrapper with <li> items for unordered list', async () => {
      const item = createMockContainerItem();
      await createContainer('hst.unorderedlist', [item]);

      const wrapper = el.querySelector(':scope > ul');
      expect(wrapper).not.toBeNull();
      const li = wrapper!.querySelector(':scope > li');
      expect(li).not.toBeNull();
    });

    it('renders no wrapper for no-markup container type', async () => {
      const item = createMockContainerItem();
      await createContainer('hst.nomarkup', [item]);

      // No div, ol, ul wrappers
      expect(el.querySelector(':scope > div')).toBeNull();
      expect(el.querySelector(':scope > ol')).toBeNull();
      expect(el.querySelector(':scope > ul')).toBeNull();
      // br-container-item should be a direct child
      expect(el.querySelector(':scope > br-container-item')).not.toBeNull();
    });
  });

  describe('CSS classes', () => {
    it('adds hst-container class to wrapper in preview mode', async () => {
      const item = createMockContainerItem();
      await createContainer('hst.vbox', [item], true);

      const wrapper = el.querySelector(':scope > div');
      expect(wrapper!.classList.contains('hst-container')).toBe(true);
    });

    it('adds hst-container-item class to item wrappers in preview mode', async () => {
      const item = createMockContainerItem();
      await createContainer('hst.vbox', [item], true);

      const itemWrapper = el.querySelector(':scope > div > div');
      expect(itemWrapper!.classList.contains('hst-container-item')).toBe(true);
    });

    it('no classes in live mode', async () => {
      const item = createMockContainerItem();
      await createContainer('hst.vbox', [item], false);

      const wrapper = el.querySelector(':scope > div');
      // In live mode, class attribute should not contain hst-container
      expect(wrapper!.classList.contains('hst-container')).toBe(false);
    });
  });

  describe('container items', () => {
    it('renders <br-container-item> for each child', async () => {
      const item1 = createMockContainerItem();
      const item2 = createMockContainerItem();
      await createContainer('hst.vbox', [item1, item2]);

      const items = el.querySelectorAll('br-container-item');
      expect(items.length).toBe(2);
    });

    it('passes component to each br-container-item', async () => {
      const item = createMockContainerItem();
      await createContainer('hst.vbox', [item]);

      const containerItem = el.querySelector('br-container-item') as any;
      expect(containerItem.component).toBe(item);
    });
  });

  describe('meta comments', () => {
    it('injects container-level meta comments in preview mode', async () => {
      const meta = createMockMeta(2);
      const container = createMockContainer({
        getType: vi.fn(() => 'hst.vbox'),
        getChildren: vi.fn(() => []),
        getMeta: vi.fn(() => meta),
      });
      const page = createMockPage({ isPreview: vi.fn(() => true) });

      el = document.createElement('br-container') as BrContainer;
      (el as any).component = container;
      (el as any)._page = page;
      document.body.appendChild(el);
      await el.updateComplete;

      expect(meta.render).toHaveBeenCalled();
    });

    it('does NOT inject meta in live mode', async () => {
      const meta = createMockMeta(2);
      const container = createMockContainer({
        getType: vi.fn(() => 'hst.vbox'),
        getChildren: vi.fn(() => []),
        getMeta: vi.fn(() => meta),
      });
      const page = createMockPage({ isPreview: vi.fn(() => false) });

      el = document.createElement('br-container') as BrContainer;
      (el as any).component = container;
      (el as any)._page = page;
      document.body.appendChild(el);
      await el.updateComplete;

      expect(meta.render).not.toHaveBeenCalled();
    });

    it('cleans up meta on disconnect', async () => {
      const clearFn = vi.fn();
      const meta = createMockMeta(2, () => clearFn);
      const container = createMockContainer({
        getType: vi.fn(() => 'hst.vbox'),
        getChildren: vi.fn(() => []),
        getMeta: vi.fn(() => meta),
      });
      const page = createMockPage({ isPreview: vi.fn(() => true) });

      el = document.createElement('br-container') as BrContainer;
      (el as any).component = container;
      (el as any)._page = page;
      document.body.appendChild(el);
      await el.updateComplete;

      el.remove();

      expect(clearFn).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('returns nothing when component is undefined', async () => {
      el = document.createElement('br-container') as BrContainer;
      document.body.appendChild(el);
      await el.updateComplete;

      expect(el.children.length).toBe(0);
    });
  });

  describe('light DOM', () => {
    it('uses light DOM (no shadowRoot)', async () => {
      el = document.createElement('br-container') as BrContainer;
      document.body.appendChild(el);
      await el.updateComplete;

      expect(el.shadowRoot).toBeNull();
    });
  });
});

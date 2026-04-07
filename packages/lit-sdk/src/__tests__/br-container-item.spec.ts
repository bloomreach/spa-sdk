import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMockContainerItem, createMockPage, createMockMeta, cleanup } from './mocks.js';

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

import '../br-container-item.js';
import type { BrContainerItem } from '../br-container-item.js';

// Register a dummy mapped component for testing
if (!customElements.get('test-banner')) {
  class TestBanner extends HTMLElement {
    component: any;
    page: any;
    requestUpdate() {}
  }
  customElements.define('test-banner', TestBanner);
}

describe('br-container-item', () => {
  let el: BrContainerItem;

  const defaultMapping = { Banner: 'test-banner' };

  afterEach(() => {
    if (el?.parentNode) cleanup(el);
    vi.restoreAllMocks();
  });

  async function createContainerItem(
    overrides: Record<string, any> = {},
    mapping = defaultMapping,
    isPreview = false,
  ): Promise<BrContainerItem> {
    const item = createMockContainerItem(overrides);
    const page = createMockPage({ isPreview: vi.fn(() => isPreview) });

    el = document.createElement('br-container-item') as BrContainerItem;
    (el as any).component = item;
    (el as any)._page = page;
    (el as any)._mapping = mapping;
    document.body.appendChild(el);
    await el.updateComplete;
    return el;
  }

  describe('component mapping', () => {
    it('resolves ctype to tag name from mapping', async () => {
      await createContainerItem({ getType: vi.fn(() => 'Banner') });

      const mapped = el.querySelector('test-banner');
      expect(mapped).not.toBeNull();
    });

    it('passes component and page as properties to mapped element', async () => {
      await createContainerItem({ getType: vi.fn(() => 'Banner') });

      const mapped = el.querySelector('test-banner') as any;
      expect(mapped.component).toBeDefined();
      expect(mapped.page).toBeDefined();
    });
  });

  describe('hidden components', () => {
    it('returns nothing when component is hidden', async () => {
      await createContainerItem({
        getType: vi.fn(() => 'Banner'),
        isHidden: vi.fn(() => true),
      });

      expect(el.querySelector('test-banner')).toBeNull();
      expect(el.children.length).toBe(0);
    });
  });

  describe('missing mapping', () => {
    it('returns nothing and warns when ctype has no mapping', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await createContainerItem(
        { getType: vi.fn(() => 'UnknownType') },
        defaultMapping,
      );

      expect(el.querySelector('test-banner')).toBeNull();
      expect(warnSpy).toHaveBeenCalledWith(
        '[br-container-item] No mapping found for ctype "UnknownType"',
      );
    });

    it('returns nothing when ctype is undefined', async () => {
      await createContainerItem({ getType: vi.fn(() => undefined) });

      expect(el.children.length).toBe(0);
    });
  });

  describe('missing component or page', () => {
    it('returns nothing when component is missing', async () => {
      el = document.createElement('br-container-item') as BrContainerItem;
      const page = createMockPage();
      (el as any)._page = page;
      (el as any)._mapping = defaultMapping;
      document.body.appendChild(el);
      await el.updateComplete;

      expect(el.children.length).toBe(0);
    });

    it('returns nothing when page is missing', async () => {
      const item = createMockContainerItem();
      el = document.createElement('br-container-item') as BrContainerItem;
      (el as any).component = item;
      (el as any)._mapping = defaultMapping;
      document.body.appendChild(el);
      await el.updateComplete;

      expect(el.children.length).toBe(0);
    });
  });

  describe('update events', () => {
    it('subscribes to component.on("update") in connectedCallback', async () => {
      const item = createMockContainerItem({ getType: vi.fn(() => 'Banner') });

      el = document.createElement('br-container-item') as BrContainerItem;
      (el as any).component = item;
      (el as any)._page = createMockPage();
      (el as any)._mapping = defaultMapping;
      document.body.appendChild(el);
      await el.updateComplete;

      expect(item.on).toHaveBeenCalledWith('update', expect.any(Function));
    });

    it('unsubscribes component.off("update") in disconnectedCallback', async () => {
      const item = createMockContainerItem({ getType: vi.fn(() => 'Banner') });
      el = document.createElement('br-container-item') as BrContainerItem;
      (el as any).component = item;
      (el as any)._page = createMockPage();
      (el as any)._mapping = defaultMapping;
      document.body.appendChild(el);
      await el.updateComplete;

      el.remove();

      expect(item.off).toHaveBeenCalledWith('update', expect.any(Function));
    });

    it('dispatches br-request-sync on update event in preview mode', async () => {
      const item = createMockContainerItem({ getType: vi.fn(() => 'Banner') });
      const page = createMockPage({ isPreview: vi.fn(() => true) });

      el = document.createElement('br-container-item') as BrContainerItem;
      (el as any).component = item;
      (el as any)._page = page;
      (el as any)._mapping = defaultMapping;
      document.body.appendChild(el);
      await el.updateComplete;

      const syncHandler = vi.fn();
      el.addEventListener('br-request-sync', syncHandler);

      // Trigger update event
      item._emit('update');

      expect(syncHandler).toHaveBeenCalled();
    });

    it('does not dispatch br-request-sync in live mode', async () => {
      const item = createMockContainerItem({ getType: vi.fn(() => 'Banner') });
      const page = createMockPage({ isPreview: vi.fn(() => false) });

      el = document.createElement('br-container-item') as BrContainerItem;
      (el as any).component = item;
      (el as any)._page = page;
      (el as any)._mapping = defaultMapping;
      document.body.appendChild(el);
      await el.updateComplete;

      const syncHandler = vi.fn();
      el.addEventListener('br-request-sync', syncHandler);

      // Trigger update event
      item._emit('update');

      expect(syncHandler).not.toHaveBeenCalled();
    });

    it('forces child element requestUpdate() on update event', async () => {
      const item = createMockContainerItem({ getType: vi.fn(() => 'Banner') });
      const page = createMockPage({ isPreview: vi.fn(() => true) });

      el = document.createElement('br-container-item') as BrContainerItem;
      (el as any).component = item;
      (el as any)._page = page;
      (el as any)._mapping = defaultMapping;
      document.body.appendChild(el);
      await el.updateComplete;

      const mappedEl = el.querySelector('test-banner') as any;
      const updateSpy = vi.spyOn(mappedEl, 'requestUpdate');

      // Trigger update event
      item._emit('update');
      await el.updateComplete;

      expect(updateSpy).toHaveBeenCalled();
    });
  });

  describe('meta comments', () => {
    it('injects meta comments around mapped element in preview mode', async () => {
      const meta = createMockMeta(2);
      const item = createMockContainerItem({
        getType: vi.fn(() => 'Banner'),
        getMeta: vi.fn(() => meta),
      });
      const page = createMockPage({ isPreview: vi.fn(() => true) });

      el = document.createElement('br-container-item') as BrContainerItem;
      (el as any).component = item;
      (el as any)._page = page;
      (el as any)._mapping = defaultMapping;
      document.body.appendChild(el);
      await el.updateComplete;

      expect(meta.render).toHaveBeenCalled();
      // Should be called with the br-container-item element itself so comments
      // end up in its parentNode (the .hst-container-item wrapper div)
      expect(meta.render).toHaveBeenCalledWith(el, el);
    });

    it('does NOT inject meta in live mode', async () => {
      const meta = createMockMeta(2);

      await createContainerItem(
        { getType: vi.fn(() => 'Banner'), getMeta: vi.fn(() => meta) },
        defaultMapping,
        false,
      );

      expect(meta.render).not.toHaveBeenCalled();
    });

    it('cleans up meta on disconnect', async () => {
      const clearFn = vi.fn();
      const meta = createMockMeta(2, () => clearFn);
      const item = createMockContainerItem({
        getType: vi.fn(() => 'Banner'),
        getMeta: vi.fn(() => meta),
      });
      const page = createMockPage({ isPreview: vi.fn(() => true) });

      el = document.createElement('br-container-item') as BrContainerItem;
      (el as any).component = item;
      (el as any)._page = page;
      (el as any)._mapping = defaultMapping;
      document.body.appendChild(el);
      await el.updateComplete;

      el.remove();

      expect(clearFn).toHaveBeenCalled();
    });
  });

  describe('light DOM', () => {
    it('uses light DOM (no shadowRoot)', async () => {
      el = document.createElement('br-container-item') as BrContainerItem;
      document.body.appendChild(el);
      await el.updateComplete;

      expect(el.shadowRoot).toBeNull();
    });
  });
});

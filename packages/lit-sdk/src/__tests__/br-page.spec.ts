import {
  describe, it, expect, vi, beforeEach, afterEach,
} from 'vitest';
import { initialize, destroy } from '@bloomreach/spa-sdk';
import {
  createMockPage, createMockComponent, createMockMeta, cleanup,
} from './mocks.js';

// Import component after mock
import '../br-page.js';
import type { BrPage } from '../br-page.js';

// Mock @bloomreach/spa-sdk before importing the component
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

describe('br-page', () => {
  let el: BrPage;
  const mockConfig = {
    endpoint: 'http://localhost:8080/site/resourceapi',
    baseUrl: '',
    request: { path: '/' },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Default: initialize resolves with a live-mode page
    const mockPage = createMockPage();
    const mockRoot = createMockComponent();
    mockPage.getComponent.mockReturnValue(mockRoot);
    vi.mocked(initialize).mockResolvedValue(mockPage as any);
  });

  afterEach(() => {
    if (el?.parentNode) { cleanup(el); }
  });

  async function createBrPage(config = mockConfig, mapping = {}): Promise<BrPage> {
    el = document.createElement('br-page') as BrPage;
    el.configuration = config as any;
    el.mapping = mapping;
    document.body.appendChild(el);
    await el.updateComplete;
    // Wait for initialize() promise to settle
    await vi.waitFor(() => {
      expect(initialize).toHaveBeenCalled();
    });
    // Let Lit re-render after state update
    await el.updateComplete;
    return el;
  }

  describe('initialization', () => {
    it('calls initialize() with provided configuration', async () => {
      await createBrPage();

      expect(initialize).toHaveBeenCalledWith(mockConfig);
    });

    it('renders <br-component> inside <slot> when initialized', async () => {
      await createBrPage();

      // br-page uses Shadow DOM, query inside shadowRoot
      const shadow = el.shadowRoot!;
      expect(shadow).not.toBeNull();
      const slot = shadow.querySelector('slot');
      expect(slot).not.toBeNull();
      const brComponent = shadow.querySelector('br-component');
      expect(brComponent).not.toBeNull();
    });

    it('renders empty when page is not yet loaded', async () => {
      // Make initialize never resolve
      vi.mocked(initialize).mockReturnValue(new Promise(() => {}));

      el = document.createElement('br-page') as BrPage;
      el.configuration = mockConfig as any;
      document.body.appendChild(el);
      await el.updateComplete;

      // Shadow root should have no meaningful content (just Lit's marker comment)
      const shadow = el.shadowRoot!;
      expect(shadow.querySelector('slot')).toBeNull();
      expect(shadow.querySelector('br-component')).toBeNull();
    });

    it('calls destroy() on disconnectedCallback', async () => {
      await createBrPage();
      el.remove();

      expect(destroy).toHaveBeenCalled();
    });

    it('logs error if initialize() throws', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('SDK init failed');
      vi.mocked(initialize).mockRejectedValue(error);

      el = document.createElement('br-page') as BrPage;
      el.configuration = mockConfig as any;
      document.body.appendChild(el);
      await el.updateComplete;
      // Wait for the promise rejection to be handled
      await new Promise((r) => setTimeout(r, 10));

      expect(consoleSpy).toHaveBeenCalledWith(
        '[br-page] Failed to initialize SPA SDK:',
        error,
      );
      consoleSpy.mockRestore();
    });
  });

  describe('context provision', () => {
    it('updates mapping context when mapping property changes', async () => {
      const mapping1 = { Banner: 'bank-hero' };
      const mapping2 = { Banner: 'bank-hero', Content: 'bank-content' };

      await createBrPage(mockConfig, mapping1);

      // The internal _mapping should be set
      expect((el as any)._mapping).toEqual(mapping1);

      el.mapping = mapping2;
      await el.updateComplete;

      expect((el as any)._mapping).toEqual(mapping2);
    });
  });

  describe('Shadow DOM', () => {
    it('uses Shadow DOM (has shadowRoot)', async () => {
      await createBrPage();

      // br-page does NOT override createRenderRoot, so it uses Shadow DOM
      expect(el.shadowRoot).not.toBeNull();
    });
  });

  describe('preview mode', () => {
    let mockPage: ReturnType<typeof createMockPage>;
    let mockRoot: ReturnType<typeof createMockComponent>;

    beforeEach(() => {
      const meta = createMockMeta(2);
      mockRoot = createMockComponent({ getMeta: vi.fn(() => meta) });
      mockPage = createMockPage({
        isPreview: vi.fn(() => true),
        getComponent: vi.fn(() => mockRoot),
      });
      vi.mocked(initialize).mockResolvedValue(mockPage as any);
    });

    it('renders page-level meta comments via rootComponent.getMeta().render()', async () => {
      await createBrPage();

      const meta = mockRoot.getMeta();
      expect(meta.render).toHaveBeenCalledWith(el, el);
    });

    it('calls page.sync() after render via _scheduleSync', async () => {
      await createBrPage();

      // sync is called via requestAnimationFrame; simulate it
      await new Promise((r) => requestAnimationFrame(r));

      expect(mockPage.sync).toHaveBeenCalled();
    });

    it('listens for br-request-sync events', async () => {
      await createBrPage();

      // Reset sync call count
      mockPage.sync.mockClear();

      // Dispatch a sync request from a child
      el.dispatchEvent(new Event('br-request-sync', { bubbles: true }));

      // Wait for the scheduled sync (may go through cooldown timeout path)
      await vi.waitFor(() => {
        expect(mockPage.sync).toHaveBeenCalled();
      });
    });

    it('cleans up meta on disconnect', async () => {
      const clearFn = vi.fn();
      const meta = createMockMeta(2, () => clearFn);
      mockRoot.getMeta.mockReturnValue(meta);
      mockPage.getComponent.mockReturnValue(mockRoot);

      await createBrPage();

      el.remove();

      expect(clearFn).toHaveBeenCalled();
    });

    it('removes br-request-sync listener on disconnect', async () => {
      await createBrPage();
      const removeListenerSpy = vi.spyOn(el, 'removeEventListener');

      el.remove();

      expect(removeListenerSpy).toHaveBeenCalledWith(
        'br-request-sync',
        expect.any(Function),
      );
      removeListenerSpy.mockRestore();
    });
  });

  describe('live mode', () => {
    it('does NOT call sync()', async () => {
      const mockPage = createMockPage({ isPreview: vi.fn(() => false) });
      const mockRoot = createMockComponent();
      mockPage.getComponent.mockReturnValue(mockRoot);
      vi.mocked(initialize).mockResolvedValue(mockPage as any);

      await createBrPage();

      // Wait a tick to ensure no async sync was scheduled
      await new Promise((r) => setTimeout(r, 50));

      expect(mockPage.sync).not.toHaveBeenCalled();
    });

    it('does NOT render page-level meta', async () => {
      const meta = createMockMeta(2);
      const mockRoot = createMockComponent({ getMeta: vi.fn(() => meta) });
      const mockPage = createMockPage({
        isPreview: vi.fn(() => false),
        getComponent: vi.fn(() => mockRoot),
      });
      vi.mocked(initialize).mockResolvedValue(mockPage as any);

      await createBrPage();

      expect(meta.render).not.toHaveBeenCalled();
    });
  });
});

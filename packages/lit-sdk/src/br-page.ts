import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { provide } from '@lit/context';
import {
  initialize,
  destroy,
  type Configuration,
  type Page,
} from '@bloomreach/spa-sdk';
import { brPageContext, brComponentContext, brMappingContext } from './context.js';

import './br-component.js';

/**
 * Root SDK component. Initializes the Bloomreach SPA SDK and provides
 * the Page, root Component, and component mapping to all descendants
 * via Lit Context.
 *
 * Handles all page.sync() calls centrally with a cooldown to prevent
 * sync loops between the SPA and Experience Manager. Child components
 * request a sync by dispatching a 'br-request-sync' DOM event.
 */
@customElement('br-page')
export class BrPage extends LitElement {
  /** SPA SDK configuration (endpoint, request, etc.) */
  @property({ type: Object })
    configuration!: Configuration;

  /** Maps brXM ctype strings to Lit custom element tag names */
  @property({ type: Object })
    mapping: Record<string, string> = {};

  @provide({ context: brPageContext })
  @state()
  private _page?: Page;

  @provide({ context: brComponentContext })
  @state()
  private _rootComponent?: ReturnType<Page['getComponent']>;

  @provide({ context: brMappingContext })
  @state()
  private _mapping: Record<string, string> = {};

  // ── Page-level meta ──
  // The root component's meta comments tell the EM about the page structure.
  // Without these, the Page/Channel toolbar buttons won't appear.
  private _clearPageMeta?: () => void;

  // ── Sync scheduling ──
  // All sync calls go through _scheduleSync() which enforces a minimum
  // cooldown between consecutive sync() calls. This prevents the loop:
  //   sync → EM repositions → update event → re-render → sync → ...
  private _lastSyncTime = 0;
  private _syncRAF?: number;
  private _syncTimeout?: number;
  private _scriptObserver?: MutationObserver;
  private _scriptLoadCleanup?: () => void;
  private _initGeneration = 0;

  private static SYNC_COOLDOWN_MS = 300;
  private _isConnected = false;

  async connectedCallback() {
    super.connectedCallback();
    this._isConnected = true;
    await this._initialize();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._isConnected = false;
    this._clearPageMeta?.();
    if (this._page?.isPreview()) {
      this.removeEventListener('br-request-sync', this._onSyncRequested);
    }
    if (this._syncRAF) { cancelAnimationFrame(this._syncRAF); }
    if (this._syncTimeout) { clearTimeout(this._syncTimeout); }
    this._scriptLoadCleanup?.();
    this._scriptLoadCleanup = undefined;
    this._scriptObserver?.disconnect();
    destroy();
  }

  willUpdate(changedProps: Map<PropertyKey, unknown>) {
    if (changedProps.has('mapping')) {
      this._mapping = this.mapping;
    }
    if (changedProps.has('configuration') && this._page) {
      this._reinitialize();
    }
  }

  updated() {
    if (!this._page?.isPreview()) { return; }

    // Render page-level meta comments around the <br-page> element.
    // These are inserted into br-page's PARENT (light DOM) via
    // meta.render(this, this), which uses parentNode.insertBefore().
    // The EM needs these comments to show Page/Channel toolbar buttons.
    this._clearPageMeta?.();
    this._clearPageMeta = undefined;
    if (this._rootComponent) {
      const meta = this._rootComponent.getMeta();
      if (meta.length > 0) {
        this._clearPageMeta = meta.render(this, this);
      }
    }

    // Schedule a sync after br-page re-renders.
    this._scheduleSync();
  }

  private _onSyncRequested = () => {
    this._scheduleSync();
  };

  /**
   * Schedule a page.sync() call with cooldown protection.
   * Coalesces multiple rapid sync requests into one.
   */
  private _scheduleSync() {
    if (!this._page) { return; }

    // Clear any pending scheduled sync
    if (this._syncRAF) {
      cancelAnimationFrame(this._syncRAF);
      this._syncRAF = undefined;
    }
    if (this._syncTimeout) {
      clearTimeout(this._syncTimeout);
      this._syncTimeout = undefined;
    }

    const now = Date.now();
    const elapsed = now - this._lastSyncTime;
    const cooldown = BrPage.SYNC_COOLDOWN_MS;

    if (elapsed >= cooldown) {
      // Enough time since last sync — fire on next animation frame
      // (gives Lit time to finish rendering the full subtree)
      this._syncRAF = requestAnimationFrame(() => {
        this._syncRAF = undefined;
        this._doSync();
      });
    } else {
      // Too soon — defer until cooldown expires
      this._syncTimeout = window.setTimeout(() => {
        this._syncTimeout = undefined;
        this._doSync();
      }, cooldown - elapsed);
    }
  }

  private _doSync() {
    this._lastSyncTime = Date.now();
    this._page?.sync();
  }

  /**
   * Watch for the Experience Manager inject script being added to the DOM.
   * The EM sends an 'inject' RPC after receiving our 'ready' event, which
   * causes the SDK to create a <script> tag in document.body.
   * We need to sync AFTER that script has loaded — otherwise the overlay
   * manager isn't ready to handle the sync.
   */
  private _watchForInjectScript() {
    if (!document.body) { return; }
    this._scriptObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node instanceof HTMLScriptElement && node.src) {
            // Found an injected script — wait for it to load, then sync
            this._scriptObserver?.disconnect();
            this._scriptObserver = undefined;
            const handler = () => {
              this._scriptLoadCleanup = undefined;
              this._scheduleSync();
            };
            node.addEventListener('load', handler, { once: true });
            this._scriptLoadCleanup = () => node.removeEventListener('load', handler);
            return;
          }
        }
      }
    });
    this._scriptObserver.observe(document.body, { childList: true });
  }

  private _reinitialize() {
    // Clean up previous page state before re-initializing
    this._clearPageMeta?.();
    this._clearPageMeta = undefined;
    if (this._page?.isPreview()) {
      this.removeEventListener('br-request-sync', this._onSyncRequested);
    }
    if (this._syncRAF) { cancelAnimationFrame(this._syncRAF); }
    if (this._syncTimeout) { clearTimeout(this._syncTimeout); }
    this._scriptLoadCleanup?.();
    this._scriptLoadCleanup = undefined;
    this._scriptObserver?.disconnect();
    destroy();
    this._page = undefined;
    this._rootComponent = undefined;
    this._initialize();
  }

  private async _initialize() {
    const generation = ++this._initGeneration;
    try {
      const page = await initialize(this.configuration);

      // Guard against disconnect or superseded initialization
      if (!this._isConnected || generation !== this._initGeneration) {
        // Only destroy on disconnect — stale pages are garbage collected.
        // Calling destroy() for stale generations would wipe the global
        // spa-sdk singleton state used by the newer active initialization.
        if (!this._isConnected) {
          destroy();
        }
        return;
      }

      this._page = page;
      this._rootComponent = this._page.getComponent();

      // Preview mode: set up EM integration (sync scheduling, inject script detection)
      if (this._page.isPreview()) {
        this.addEventListener('br-request-sync', this._onSyncRequested);
        this._watchForInjectScript();
      }
    } catch (e) {
      console.error('[br-page] Failed to initialize SPA SDK:', e);
    }
  }

  render() {
    if (!this._page || !this._rootComponent) {
      return html``;
    }

    return html`<slot><br-component></br-component></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'br-page': BrPage;
  }
}

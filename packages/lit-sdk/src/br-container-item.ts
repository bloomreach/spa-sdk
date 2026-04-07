import { LitElement, nothing, type ReactiveElement } from 'lit';
import { html, unsafeStatic } from 'lit/static-html.js';
import { customElement, property } from 'lit/decorators.js';
import { consume } from '@lit/context';
import type { ContainerItem, Page } from '@bloomreach/spa-sdk';
import { brPageContext, brMappingContext } from './context.js';

/**
 * Renders a brXM container item by resolving its `ctype` to a Lit custom element
 * tag name via the component mapping.
 *
 * Responsibilities:
 * - Resolves ctype → Lit tag name from mapping context
 * - Renders the mapped element using Lit's static html (preserves DOM across re-renders)
 * - Passes `component` and `page` as properties to the mapped element
 * - Injects meta comments around the mapped element for Experience Manager overlays
 * - Listens for `update` events for live editing
 * - Skips rendering if the component is hidden (Relevance)
 *
 * On SDK update events, dispatches a 'br-request-sync' event that bubbles
 * up to br-page, which handles sync scheduling with loop protection.
 * Also forces the mapped child element to re-render, since the SDK mutates
 * the ContainerItem in place (same object reference → Lit won't detect a change).
 */
@customElement('br-container-item')
export class BrContainerItem extends LitElement {
  @property({ type: Object })
    component?: ContainerItem;

  @consume({ context: brPageContext, subscribe: true })
  private _page?: Page;

  @consume({ context: brMappingContext, subscribe: true })
  private _mapping: Record<string, string> = {};

  // Light DOM for Experience Manager meta comment injection
  createRenderRoot() {
    return this;
  }

  private _clearMeta?: () => void;
  private _updateHandler?: () => void;
  // Flag: true when re-render was triggered by an SDK update event
  private _pendingComponentUpdate = false;

  connectedCallback() {
    super.connectedCallback();
    // Listen for live editing updates from Experience Manager
    if (this.component) {
      this._updateHandler = () => {
        // Only act on updates in preview mode (Experience Manager editing)
        if (!this._page?.isPreview()) { return; }
        this._pendingComponentUpdate = true;
        this.requestUpdate();
        // Request sync from br-page (which applies cooldown to prevent loops)
        this.dispatchEvent(new Event('br-request-sync', { bubbles: true, composed: true }));
      };
      this.component.on('update', this._updateHandler);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._clearMeta?.();
    if (this.component && this._updateHandler) {
      this.component.off('update', this._updateHandler);
    }
  }

  updated() {
    // Inject meta comments around <br-container-item> itself so they end up
    // as direct children of the .hst-container-item wrapper div created by
    // br-container. meta.render(head, tail) inserts begin comments before
    // head and end comments after tail in head.parentNode — so using `this`
    // places them in the wrapper div, matching the Angular SDK's DOM structure
    // and enabling EM drag-and-drop reordering.
    this._clearMeta?.();
    if (this.component && this._page?.isPreview()) {
      const meta = this.component.getMeta();
      if (meta.length > 0) {
        this._clearMeta = meta.render(this, this);
      }
    }

    // After an SDK update event, force the mapped child element to re-render.
    // The SDK mutates the ContainerItem object in place, so the Lit property
    // reference (.component) stays the same — Lit's dirty check won't detect
    // the change. We need to explicitly poke the child.
    if (this._pendingComponentUpdate) {
      this._pendingComponentUpdate = false;
      const mappedEl = this.firstElementChild as ReactiveElement | null;
      if (mappedEl && typeof mappedEl.requestUpdate === 'function') {
        mappedEl.requestUpdate();
      }
    }
  }

  render() {
    if (!this.component || !this._page) { return nothing; }

    // Hidden components render nothing (Relevance feature)
    if (this.component.isHidden()) { return nothing; }

    const ctype = this.component.getType();
    if (!ctype) { return nothing; }

    const tagName = this._mapping[ctype];
    if (!tagName) {
      console.warn(`[br-container-item] No mapping found for ctype "${ctype}"`);
      return nothing;
    }

    const tag = unsafeStatic(tagName);
    return html`<${tag} .component=${this.component} .page=${this._page}></${tag}>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'br-container-item': BrContainerItem;
  }
}

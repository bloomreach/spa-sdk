import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { consume } from '@lit/context';
import type { Container, Page } from '@bloomreach/spa-sdk';
import {
  TYPE_CONTAINER_INLINE,
  TYPE_CONTAINER_NO_MARKUP,
  TYPE_CONTAINER_ORDERED_LIST,
  TYPE_CONTAINER_UNORDERED_LIST,
} from '@bloomreach/spa-sdk';
import { brPageContext } from './context.js';

import './br-container-item.js';

/**
 * Renders a brXM container and its container item children.
 *
 * Renders a type-specific wrapper element based on the container's xtype:
 * - `hst.vbox` (default) → `<div>` wrapper, `<div>` item wrappers
 * - `hst.span` (inline)  → `<div>` wrapper, `<span>` item wrappers
 * - `hst.orderedlist`     → `<ol>` wrapper, `<li>` item wrappers
 * - `hst.unorderedlist`   → `<ul>` wrapper, `<li>` item wrappers
 * - `hst.nomarkup`        → no wrapper elements
 *
 * In preview mode, adds `hst-container` class to the wrapper and
 * `hst-container-item` class to each item wrapper. These classes are
 * required by the Experience Manager for overlay positioning.
 *
 * Injects container-level meta comments for the Experience Manager
 * "Add component" button.
 */
@customElement('br-container')
export class BrContainer extends LitElement {
  @property({ type: Object })
    component?: Container;

  @consume({ context: brPageContext, subscribe: true })
  private _page?: Page;

  // Light DOM for Experience Manager meta comment injection
  createRenderRoot() {
    return this;
  }

  private _clearMeta?: () => void;

  disconnectedCallback() {
    super.disconnectedCallback();
    this._clearMeta?.();
  }

  updated() {
    // Inject container-level meta comments (for "Add component" button in EM)
    this._clearMeta?.();
    if (this.component && this._page?.isPreview()) {
      const meta = this.component.getMeta();
      if (meta.length > 0) {
        // Render meta around the wrapper element, or self for no-markup
        const wrapper = this.firstElementChild as HTMLElement;
        const target = wrapper || this;
        this._clearMeta = meta.render(target, target);
      }
    }
  }

  render() {
    if (!this.component) { return nothing; }

    const isPreview = this._page?.isPreview() ?? false;
    const containerType = this.component.getType();
    const items = this.component.getChildren();

    // Render each child item, wrapped in the appropriate element
    const itemsHtml = items.map((item) => {
      const itemContent = html`<br-container-item .component=${item}></br-container-item>`;

      if (containerType === TYPE_CONTAINER_NO_MARKUP) {
        return itemContent;
      }

      const itemClass = isPreview ? 'hst-container-item' : nothing;
      switch (containerType) {
        case TYPE_CONTAINER_INLINE:
          return html`<span class=${itemClass}>${itemContent}</span>`;
        case TYPE_CONTAINER_ORDERED_LIST:
        case TYPE_CONTAINER_UNORDERED_LIST:
          return html`<li class=${itemClass}>${itemContent}</li>`;
        default: // TYPE_CONTAINER_BOX
          return html`<div class=${itemClass}>${itemContent}</div>`;
      }
    });

    // Render the container wrapper based on type
    if (containerType === TYPE_CONTAINER_NO_MARKUP) {
      return html`${itemsHtml}`;
    }

    const containerClass = isPreview ? 'hst-container' : nothing;
    switch (containerType) {
      case TYPE_CONTAINER_ORDERED_LIST:
        return html`<ol class=${containerClass}>${itemsHtml}</ol>`;
      case TYPE_CONTAINER_UNORDERED_LIST:
        return html`<ul class=${containerClass}>${itemsHtml}</ul>`;
      default: // TYPE_CONTAINER_BOX and TYPE_CONTAINER_INLINE
        return html`<div class=${containerClass}>${itemsHtml}</div>`;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'br-container': BrContainer;
  }
}

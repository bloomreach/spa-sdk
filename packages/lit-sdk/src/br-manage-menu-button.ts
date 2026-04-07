import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { consume } from '@lit/context';
import type { Page, Menu } from '@bloomreach/spa-sdk';
import { TYPE_MANAGE_MENU_BUTTON } from '@bloomreach/spa-sdk';
import { brPageContext } from './context.js';

/**
 * Renders an "Edit Menu" button overlay when in Experience Manager preview mode.
 *
 * Usage mirrors `<br-manage-content-button>`:
 *
 * 1. **Light DOM** (inside SDK infrastructure or light-DOM components):
 *    ```html
 *    <br-manage-menu-button .menu=${menu}></br-manage-menu-button>
 *    ```
 *
 * 2. **Shadow DOM** (inside mapped components):
 *    ```html
 *    <br-manage-menu-button
 *      .menu=${menu}
 *      .page=${this.page}
 *      .renderTarget=${this}
 *    ></br-manage-menu-button>
 *    ```
 *
 * Only renders when `page.isPreview()` is true.
 */
@customElement('br-manage-menu-button')
export class BrManageMenuButton extends LitElement {
  /** The menu model to generate the edit button for */
  @property({ type: Object })
  menu?: Menu;

  /** Direct page reference (use when inside Shadow DOM where context may not reach) */
  @property({ type: Object })
  page?: Page;

  /**
   * Light DOM element to inject meta comments around.
   * When used inside Shadow DOM, pass the host element so comments
   * end up in the light DOM where the Experience Manager can find them.
   */
  @property({ type: Object })
  renderTarget?: HTMLElement;

  @consume({ context: brPageContext, subscribe: true })
  private _contextPage?: Page;

  // Light DOM for meta comment injection
  createRenderRoot() {
    return this;
  }

  private _clearMeta?: () => void;

  disconnectedCallback() {
    super.disconnectedCallback();
    this._clearMeta?.();
  }

  private get _page(): Page | undefined {
    return this.page ?? this._contextPage;
  }

  updated() {
    this._clearMeta?.();
    this._clearMeta = undefined;

    if (!this._page?.isPreview() || !this.menu) return;

    const meta = this._page.getButton(TYPE_MANAGE_MENU_BUTTON, this.menu);
    if (meta && meta.length > 0) {
      const target = this.renderTarget ?? this;
      this._clearMeta = meta.render(target, target);
    }
  }

  render() {
    if (!this._page?.isPreview()) return nothing;
    return html``;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'br-manage-menu-button': BrManageMenuButton;
  }
}

import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { consume } from '@lit/context';
import type { Page, ManageContentButton } from '@bloomreach/spa-sdk';
import { TYPE_MANAGE_CONTENT_BUTTON } from '@bloomreach/spa-sdk';
import { brPageContext } from './context.js';

/**
 * Renders an "Edit" button overlay when in Experience Manager preview mode.
 *
 * Can be used in two ways:
 *
 * 1. **Light DOM** (inside SDK infrastructure or light-DOM components):
 *    ```html
 *    <br-manage-content-button .content=${document}></br-manage-content-button>
 *    ```
 *    Meta comments are injected around this element itself.
 *
 * 2. **Shadow DOM** (inside mapped components like bank-hero):
 *    ```html
 *    <br-manage-content-button
 *      .content=${document}
 *      .page=${this.page}
 *      .renderTarget=${this}
 *    ></br-manage-content-button>
 *    ```
 *    Pass the host element as `renderTarget` so meta comments are injected
 *    into the light DOM around the host, where the Experience Manager can
 *    find them. Pass `page` directly since context may not cross all
 *    shadow boundaries reliably.
 *
 * Only renders when `page.isPreview()` is true.
 */
@customElement('br-manage-content-button')
export class BrManageContentButton extends LitElement {
  @property({ type: Object })
  content?: ManageContentButton['content'];

  @property({ type: String })
  documentTemplateQuery?: string;

  @property({ type: String })
  folderTemplateQuery?: string;

  @property({ type: String })
  path?: string;

  @property({ type: String })
  parameter?: string;

  @property({ type: Boolean })
  relative?: boolean;

  @property({ type: String })
  root?: string;

  @property({ type: String })
  pickerSelectableNodeTypes?: string;

  @property({ type: String })
  pickerConfiguration?: string;

  @property({ type: String })
  pickerInitialPath?: string;

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

    if (!this._page?.isPreview()) return;

    // Use page.getButton() to create proper manage content button meta.
    // This merges the content's meta with button config (documentTemplateQuery, etc.)
    // matching the Angular SDK pattern: page.getButton(TYPE_MANAGE_CONTENT_BUTTON, this)
    const meta = this._page.getButton(TYPE_MANAGE_CONTENT_BUTTON, {
      content: this.content,
      documentTemplateQuery: this.documentTemplateQuery,
      folderTemplateQuery: this.folderTemplateQuery,
      path: this.path,
      parameter: this.parameter,
      relative: this.relative,
      root: this.root,
      pickerSelectableNodeTypes: this.pickerSelectableNodeTypes,
      pickerConfiguration: this.pickerConfiguration,
      pickerInitialPath: this.pickerInitialPath,
    });
    if (meta && meta.length > 0) {
      // If renderTarget is set, inject meta around that element (light DOM).
      // Otherwise inject around this element itself.
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
    'br-manage-content-button': BrManageContentButton;
  }
}

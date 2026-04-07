import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { type ContainerItem, type Page, type Document, type ImageSet } from '@bloomreach/spa-sdk';
import '@bloomreach/lit-sdk';
import { sanitize } from '../utils/sanitize.js';

@customElement('lit-content')
export class LitContent extends LitElement {
  @property({ type: Object }) component?: ContainerItem;
  @property({ type: Object }) page?: Page;

  // Light DOM for Bootstrap CSS and EM meta comments
  createRenderRoot() {
    return this;
  }

  render() {
    if (!this.component || !this.page) return nothing;

    const documentRef = this.component.getModels<DocumentModels>().document;
    const document = documentRef && this.page.getContent<Document>(documentRef);

    if (!document) return nothing;

    const {
      author,
      content,
      publicationDate,
      date = publicationDate,
      image: imageRef,
      title,
    } = document.getData<DocumentData>();
    const image = imageRef && this.page.getContent<ImageSet>(imageRef);

    return html`
      <div class="${this.page.isPreview() ? 'has-edit-button' : ''}">
        <br-manage-content-button .content=${document} .page=${this.page}></br-manage-content-button>
        ${image ? html`<img class="img-fluid mb-3" src=${image.getOriginal()?.getUrl() || ''} alt=${title || ''} />` : nothing}
        ${title ? html`<h1>${title}</h1>` : nothing}
        ${author ? html`<p class="mb-3 text-muted">${author}</p>` : nothing}
        ${date ? html`<p class="mb-3 small text-muted">${new Date(date).toDateString()}</p>` : nothing}
        ${content ? html`<div>${unsafeHTML(this.page.rewriteLinks(sanitize(content.value)))}</div>` : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lit-content': LitContent;
  }
}

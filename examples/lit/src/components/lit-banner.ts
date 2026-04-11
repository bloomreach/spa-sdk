import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { type ContainerItem, type Page, type Content, type Document, type ImageSet } from '@bloomreach/spa-sdk';
import '@bloomreach/lit-sdk';
import { sanitize } from '../utils/sanitize.js';

@customElement('lit-banner')
export class LitBanner extends LitElement {
  @property({ type: Object }) component?: ContainerItem;
  @property({ type: Object }) page?: Page;

  // Light DOM for Bootstrap CSS and EM meta comments
  createRenderRoot() {
    return this;
  }

  render() {
    if (!this.component || !this.page) return nothing;

    const documentRef = this.component.getModels<DocumentModels>().document;
    const document = documentRef && this.page.getContent(documentRef);

    if (!document) {
      if (!this.page.isPreview()) return nothing;
      return html`
        <div class="jumbotron mb-3 has-edit-button">
          <br-manage-content-button
            documentTemplateQuery="new-banner-document"
            folderTemplateQuery="new-banner-folder"
            parameter="document"
            root="banners"
            ?relative=${true}
            pickerSelectableNodeTypes="best:banner,hap:bannerdocument"
            .page=${this.page}
          ></br-manage-content-button>
          <p class="text-muted">Click to select a banner document</p>
        </div>
      `;
    }

    const { content, image: imageRef, link: linkRef, title } = (document as Content).getData<DocumentData>();
    const imageVariant = this.component.getParameters<BannerParameters>().imageVariant;
    const imageSet = imageRef && this.page.getContent<ImageSet>(imageRef);
    const image = imageSet && (imageVariant ? imageSet.getVariant(imageVariant) : imageSet.getOriginal());
    const link = linkRef && this.page.getContent<Document>(linkRef);

    return html`
      <div class="jumbotron mb-3 ${this.page.isPreview() ? 'has-edit-button' : ''}">
        <br-manage-content-button
          .content=${document}
          documentTemplateQuery="new-banner-document"
          folderTemplateQuery="new-banner-folder"
          parameter="document"
          root="banners"
          ?relative=${true}
          pickerSelectableNodeTypes="best:banner,hap:bannerdocument"
          .page=${this.page}
        ></br-manage-content-button>
        ${title ? html`<h1>${title}</h1>` : nothing}
        ${image ? html`<img class="img-fluid" src=${image.getUrl()} alt=${title || ''} />` : nothing}
        ${content && this.page
          ? html`<div>${unsafeHTML(sanitize(this.page.rewriteLinks(content.value)))}</div>`
          : nothing}
        ${link
          ? html`
            <p class="lead">
              <a href=${(link as any).getUrl()} class="btn btn-primary btn-lg" role="button">Learn more</a>
            </p>`
          : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lit-banner': LitBanner;
  }
}

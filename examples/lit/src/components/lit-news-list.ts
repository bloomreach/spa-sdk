import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { type ContainerItem, type Page, type Document } from '@bloomreach/spa-sdk';
import '@bloomreach/lit-sdk';

@customElement('lit-news-list-item')
export class LitNewsListItem extends LitElement {
  @property({ type: Object }) document?: Document;
  @property({ type: Object }) page?: Page;

  createRenderRoot() {
    return this;
  }

  render() {
    if (!this.document || !this.page) return nothing;

    const { author, date, introduction, title } = this.document.getData<DocumentData>();

    return html`
      <div class="card mb-3">
        <br-manage-content-button .content=${this.document} .page=${this.page}></br-manage-content-button>
        <div class="card-body">
          ${title ? html`
            <h2 class="card-title">
              <a href=${this.document.getUrl() || ''}>${title}</a>
            </h2>` : nothing}
          ${author ? html`<div class="card-subtitle mb-3 text-muted">${author}</div>` : nothing}
          ${date ? html`<div class="card-subtitle mb-3 small text-muted">${new Date(date).toDateString()}</div>` : nothing}
          ${introduction ? html`<p class="card-text">${introduction}</p>` : nothing}
        </div>
      </div>
    `;
  }
}

@customElement('lit-news-list-pagination')
export class LitNewsListPagination extends LitElement {
  @property({ type: Object }) pageable?: Pageable;
  @property({ type: Object }) page?: Page;

  createRenderRoot() {
    return this;
  }

  render() {
    if (!this.page || !this.pageable?.showPagination) return nothing;

    const { previous, previousPage, pageNumbersArray, currentPage, next, nextPage } = this.pageable;

    return html`
      <nav aria-label="News List Pagination">
        <ul class="pagination">
          <li class="page-item ${previous ? '' : 'disabled'}">
            <a href=${previous ? this.page.getUrl(`?page=${previousPage}`) : '#'} class="page-link" aria-label="Previous">
              <span aria-hidden="true">&laquo;</span>
              <span class="sr-only">Previous</span>
            </a>
          </li>
          ${pageNumbersArray.map((pageNumber) => html`
            <li class="page-item ${pageNumber === currentPage ? 'active' : ''}">
              <a href=${this.page!.getUrl(`?page=${pageNumber}`)} class="page-link">${pageNumber}</a>
            </li>
          `)}
          <li class="page-item ${next ? '' : 'disabled'}">
            <a href=${next ? this.page.getUrl(`?page=${nextPage}`) : '#'} class="page-link" aria-label="Next">
              <span aria-hidden="true">&raquo;</span>
              <span class="sr-only">Next</span>
            </a>
          </li>
        </ul>
      </nav>
    `;
  }
}

@customElement('lit-news-list')
export class LitNewsList extends LitElement {
  @property({ type: Object }) component?: ContainerItem;
  @property({ type: Object }) page?: Page;

  createRenderRoot() {
    return this;
  }

  render() {
    if (!this.component || !this.page) return nothing;

    const pageable = this.component.getModels<PageableModels>().pageable;
    if (!pageable) return nothing;

    return html`
      <div>
        ${pageable.items.map((reference) => html`
          <lit-news-list-item
            .document=${this.page!.getContent<Document>(reference)}
            .page=${this.page}
          ></lit-news-list-item>
        `)}
        ${this.page.isPreview() ? html`
          <div class="has-edit-button float-right">
            <br-manage-content-button
              documentTemplateQuery="new-news-document"
              folderTemplateQuery="new-news-folder"
              root="news"
              .page=${this.page}
            ></br-manage-content-button>
          </div>
        ` : nothing}
        <lit-news-list-pagination
          .pageable=${pageable}
          .page=${this.page}
        ></lit-news-list-pagination>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lit-news-list': LitNewsList;
    'lit-news-list-item': LitNewsListItem;
    'lit-news-list-pagination': LitNewsListPagination;
  }
}

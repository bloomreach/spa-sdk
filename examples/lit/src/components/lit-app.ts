import { LitElement, html, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { keyed } from 'lit/directives/keyed.js';
import { consume } from '@lit/context';
import { type Configuration, type Page, extractSearchParams } from '@bloomreach/spa-sdk';
import { brPageContext } from '@bloomreach/lit-sdk';

// Import SDK components (registers custom elements)
import '@bloomreach/lit-sdk';

// Import mapped components (registers custom elements)
import './lit-banner.js';
import './lit-content.js';
import './lit-menu.js';
import './lit-news-list.js';

const COMPONENT_MAPPING: Record<string, string> = {
  'Banner': 'lit-banner',
  'Content': 'lit-content',
  'News List': 'lit-news-list',
  'Simple Content': 'lit-content',
};

@customElement('lit-app')
export class LitApp extends LitElement {
  @state() private _path = `${window.location.pathname}${window.location.search}`;

  @consume({ context: brPageContext, subscribe: true })
  private _page?: Page;

  // Light DOM so Bootstrap CSS applies and EM meta comments work
  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();

    // SPA navigation: intercept internal link clicks
    this.addEventListener('click', this._onLinkClick);
    window.addEventListener('popstate', this._onPopState);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('click', this._onLinkClick);
    window.removeEventListener('popstate', this._onPopState);
  }

  private _onLinkClick = (e: Event) => {
    const anchor = (e.target as HTMLElement).closest('a');
    if (!anchor || !anchor.href) return;

    const url = new URL(anchor.href, window.location.origin);
    if (url.origin !== window.location.origin) return;
    if (anchor.target === '_blank') return;

    e.preventDefault();
    const newPath = `${url.pathname}${url.search}`;
    if (newPath !== this._path) {
      history.pushState({}, '', anchor.href);
      this._path = newPath;
    }
  };

  private _onPopState = () => {
    this._path = `${window.location.pathname}${window.location.search}`;
  };

  private get _configuration(): Configuration {
    let configuration: Configuration = {
      path: this._path,
      endpoint: import.meta.env.VITE_BRXM_ENDPOINT,
      httpClient: async (config: any) => {
        const response = await fetch(config.url, {
          method: config.method,
          headers: config.headers as Record<string, string>,
          body: config.data,
        });
        const data = await response.json();
        return { data };
      },
    };

    if (!import.meta.env.VITE_BRXM_ENDPOINT && import.meta.env.VITE_BR_MULTI_TENANT_SUPPORT) {
      const endpointQueryParameter = 'endpoint';
      const { searchParams } = extractSearchParams(configuration.path!, [endpointQueryParameter].filter(Boolean));

      configuration = {
        ...configuration,
        endpoint: searchParams.get(endpointQueryParameter) ?? '',
        baseUrl: `?${endpointQueryParameter}=${searchParams.get(endpointQueryParameter)}`,
      };
    }

    return configuration;
  }

  render() {
    return html`
      ${keyed(this._path, html`
        <br-page .configuration=${this._configuration} .mapping=${COMPONENT_MAPPING}>
          <header>
            <nav class="navbar navbar-expand-sm navbar-dark sticky-top bg-dark" role="navigation">
              <div class="container">
                <a href=${this._page?.getUrl('/') ?? '/'} class="navbar-brand">
                  ${this._page?.getTitle() || 'brXM + Lit = \u2764\uFE0F'}
                </a>
                <div class="collapse navbar-collapse">
                  <lit-menu></lit-menu>
                </div>
              </div>
            </nav>
          </header>
          <section class="container flex-fill pt-3">
            <br-component name="main"></br-component>
          </section>
          <footer class="bg-dark text-light py-3">
            <div class="container clearfix">
              <div class="float-left pr-3">&copy; Bloomreach</div>
              <div class="overflow-hidden">
                <br-component name="footer"></br-component>
              </div>
            </div>
          </footer>
        </br-page>
      `)}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lit-app': LitApp;
  }
}

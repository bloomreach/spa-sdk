import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { type Configuration, type Page, extractSearchParams } from '@bloomreach/spa-sdk';
import { brPageContext } from '@bloomreach/lit-sdk';

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
  @consume({ context: brPageContext, subscribe: true })
  private _page?: Page;

  // Light DOM so Bootstrap CSS applies and EM meta comments work
  createRenderRoot() {
    return this;
  }

  private get _configuration(): Configuration {
    let configuration: Configuration = {
      path: `${window.location.pathname}${window.location.search}`,
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
      const endpoint = searchParams.get(endpointQueryParameter);

      if (endpoint) {
        configuration = {
          ...configuration,
          endpoint,
          baseUrl: `?${new URLSearchParams({ [endpointQueryParameter]: endpoint })}`,
        };
      }
    }

    return configuration;
  }

  render() {
    return html`
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
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lit-app': LitApp;
  }
}

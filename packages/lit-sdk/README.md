# Bloomreach Lit SDK

Bloomreach Lit SDK integration for [Lit](https://lit.dev/) web components. This package provides the same component set as the React, Angular, and Vue SDKs — built with Lit patterns: custom elements, decorators, and `@lit/context` for state propagation.

## Features

- Lit custom elements for Bloomreach page rendering
- Dynamic component mapping (brXM `ctype` to Lit tag name)
- Experience Manager preview integration with live editing
- Context-based state propagation via `@lit/context`
- Full TypeScript support with re-exported spa-sdk types

## Installation

```bash
npm install @bloomreach/lit-sdk @bloomreach/spa-sdk
```

## Quick Start

### 1. Create the app shell

```typescript
import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import type { Configuration } from '@bloomreach/spa-sdk';
import '@bloomreach/lit-sdk';

import './my-banner.js';
import './my-content.js';

const MAPPING: Record<string, string> = {
  'Banner': 'my-banner',
  'Content': 'my-content',
};

@customElement('my-app')
export class MyApp extends LitElement {
  private get _config(): Configuration {
    return {
      endpoint: 'http://localhost:8080/site/resourceapi',
      httpClient: async (config) => {
        const response = await fetch(config.url, {
          method: config.method,
          headers: config.headers as Record<string, string>,
          body: config.data,
        });
        return { data: await response.json() };
      },
      path: `${window.location.pathname}${window.location.search}`,
    } as Configuration;
  }

  createRenderRoot() { return this; }

  render() {
    return html`
      <br-page .configuration=${this._config} .mapping=${MAPPING}>
        <header>
          <br-component name="menu"></br-component>
        </header>
        <main>
          <br-component name="main"></br-component>
        </main>
        <footer>
          <br-component name="footer"></br-component>
        </footer>
      </br-page>
    `;
  }
}
```

### 2. Create a mapped component

Every mapped component receives `component` (ContainerItem) and `page` (Page) properties from the SDK:

```typescript
import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { ContainerItem, Page } from '@bloomreach/spa-sdk';
import { getDocumentData } from '@bloomreach/lit-sdk';

interface BannerData {
  title: string;
  content: { value: string };
}

@customElement('my-banner')
export class MyBanner extends LitElement {
  @property({ type: Object }) component?: ContainerItem;
  @property({ type: Object }) page?: Page;

  createRenderRoot() { return this; }

  render() {
    if (!this.component || !this.page) return nothing;
    const data = getDocumentData<BannerData>(this.component, this.page);
    if (!data) return nothing;

    return html`
      <div class="banner">
        <br-manage-content-button
          .content=${this.page.getContent(this.component.getModels().document)}
          .page=${this.page}
        ></br-manage-content-button>
        <h1>${data.title}</h1>
      </div>
    `;
  }
}
```

> **Note:** Use `createRenderRoot() { return this; }` (light DOM) on components that need `<br-manage-content-button>` or `<br-manage-menu-button>`, so the Experience Manager can find the meta comments.

## Components

### `<br-page>`

Root SDK component. Initializes the SPA SDK and provides Page, Component, and mapping to descendants via Lit Context.

| Property | Type | Required | Description |
|---|---|---|---|
| `configuration` | `Configuration` | Yes | SPA SDK configuration (endpoint, httpClient, etc.) |
| `mapping` | `Record<string, string>` | Yes | Maps brXM `ctype` strings to Lit custom element tag names |

Two rendering modes:
- **Auto-render** (no children) — renders the full component tree
- **Custom layout** (with children) — you control layout with `<br-component name="...">`

> **Note:** Auto-render mode uses a slot fallback internally. Ensure no whitespace or text nodes exist between the opening and closing `<br-page>` tags, as any light DOM content (including whitespace) will suppress the fallback. This is not an issue when using Lit template bindings.

### `<br-component>`

Traverses the brXM component tree by name and renders children recursively.

| Property | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | No | Name of the child component to resolve |

The `name` values correspond to component names in the brXM page layout (e.g., `menu`, `main`, `footer`).

### `<br-manage-content-button>`

Renders an "Edit content" overlay in Experience Manager preview mode.

| Property | Type | Required | Description |
|---|---|---|---|
| `content` | `Content` | No | The content object to edit |
| `page` | `Page` | No | Direct page reference |
| `documentTemplateQuery` | `string` | No | Template query for new documents |
| `folderTemplateQuery` | `string` | No | Template query for new folders |
| `parameter` | `string` | No | Component parameter name |
| `relative` | `boolean` | No | Store as relative path |
| `root` | `string` | No | Root folder path |
| `pickerSelectableNodeTypes` | `string` | No | Selectable node types for picker |
| `pickerConfiguration` | `string` | No | CMS picker configuration path |
| `pickerInitialPath` | `string` | No | Initial path for the picker |

### `<br-manage-menu-button>`

Renders an "Edit menu" overlay in Experience Manager preview mode.

| Property | Type | Required | Description |
|---|---|---|---|
| `menu` | `Menu` | Yes | The menu model to edit |
| `page` | `Page` | No | Direct page reference |

## Component Mapping

The `mapping` property on `<br-page>` maps brXM `ctype` strings to Lit custom element tag names:

```typescript
const MAPPING: Record<string, string> = {
  'Banner': 'my-banner',
  'Content': 'my-content',
  'News List': 'my-news-list',
  'Simple Content': 'my-content',   // multiple ctypes can map to one element
};
```

The `ctype` is read from `ContainerItem.getType()` (falls back to the component label). Unmapped ctypes produce a console warning.

## Data Extraction

### `getDocumentData<T>(component, page)`

Resolves document data for container items using the standard `models.document` pattern:

```typescript
import { getDocumentData } from '@bloomreach/lit-sdk';

const data = getDocumentData<BannerData>(component, page);
```

### `getContainerItemContent<T>(component, page)`

Resolves content from the `content` field pattern (alternative to document references):

```typescript
import { getContainerItemContent } from '@bloomreach/lit-sdk';

const data = getContainerItemContent<BannerData>(component, page);
```

## Context System

The SDK uses `@lit/context` to propagate state without prop-drilling:

| Context | Type | Provider | Description |
|---|---|---|---|
| `brPageContext` | `Page` | `<br-page>` | The initialized Page object |
| `brComponentContext` | `Component` | `<br-page>`, `<br-component>` | Current component in the tree |
| `brMappingContext` | `Record<string, string>` | `<br-page>` | The ctype-to-tag-name mapping |

You typically don't consume these directly — the SDK passes `component` and `page` as properties to mapped elements. For components outside the mapping (e.g., a menu), consume the context:

```typescript
import { consume } from '@lit/context';
import { brPageContext } from '@bloomreach/lit-sdk';

@customElement('my-menu')
class MyMenu extends LitElement {
  @consume({ context: brPageContext, subscribe: true })
  private page?: Page;
}
```

## Experience Manager Preview

When running in the Experience Manager iframe, the SDK automatically handles:

1. **JWT Authentication** — Token from `?token=` included in API requests
2. **DOM Comments** — Meta comments injected for editing overlays
3. **`page.sync()`** — Called after renders to reposition overlays
4. **Live updates** — Re-renders on content editor changes

---

## Advanced Topics

### Internal components

`<br-container>` and `<br-container-item>` are internal components instantiated automatically by `<br-component>`. You don't use them directly. `<br-container-item>` resolves the `ctype`, creates the mapped element, sets `component`/`page` properties, and handles the `isHidden()` Relevance feature.

### Shadow DOM vs Light DOM

| Component | DOM Mode | Reason |
|---|---|---|
| `<br-page>` | Shadow DOM | Uses `<slot>` for layout projection |
| `<br-component>`, `<br-container>`, `<br-container-item>` | Light DOM | EM meta comments need light DOM |
| `<br-manage-content-button>`, `<br-manage-menu-button>` | Light DOM | EM meta comments need light DOM |
| **Your mapped components** | Either | Use light DOM if the component needs a manage button |

Your app shell should also use light DOM (`createRenderRoot() { return this; }`).

### Shadow DOM manage button (`renderTarget`)

If your mapped component must use Shadow DOM but needs a manage button, pass `renderTarget` to inject meta comments in the light DOM:

```html
<br-manage-content-button
  .content=${document}
  .page=${this.page}
  .renderTarget=${this}
></br-manage-content-button>
```

### Field name mapping

brXM compound fields may use type-specific names (e.g., `featureitem` instead of `items`). Inspect the Delivery API response and map fields in your component:

```typescript
const raw = getDocumentData<any>(this.component, this.page);
const data = { ...raw, items: raw.featureitem ?? raw.items ?? [] };
```

### Dual-mode components

Components that work both with the SDK and standalone data props:

```typescript
@customElement('my-component')
export class MyComponent extends LitElement {
  @property({ type: Object }) data?: MyData;
  @property({ type: Object }) component?: ContainerItem;
  @property({ type: Object }) page?: Page;

  private _getData(): MyData | undefined {
    if (this.component && this.page) {
      return getDocumentData<MyData>(this.component, this.page);
    }
    return this.data;
  }
}
```

### API Reference

**Components:** `BrPage`, `BrComponent`, `BrComponentNode`, `BrContainer`, `BrContainerItem`, `BrManageContentButton`, `BrManageMenuButton`

**Contexts:** `brPageContext`, `brComponentContext`, `brMappingContext`

**Utilities:** `getDocumentData`, `getContainerItemContent`, `isInternalLink`, `isExternalLink`

**Type guards** (re-exported from `@bloomreach/spa-sdk`): `isComponent`, `isContainer`, `isContainerItem`, `isContent`, `isDocument`, `isImageSet`, `isLink`, `isMenu`, `isMetaComment`, `isMeta`, `isPage`, `isPagination`, `isReference`

**Types** (re-exported from `@bloomreach/spa-sdk`): `Page`, `Component`, `ContainerItem`, `Container`, `Content`, `Document`, `ImageSet`, `Image`, `Link`, `Menu`, `Menu10`, `MenuItem`, `MetaCollection`, `MetaComment`, `Meta`, `PageModel`, `Configuration`, `ManageContentButton`, `Reference`

**Functions** (re-exported from `@bloomreach/spa-sdk`): `initialize`, `destroy`

### Troubleshooting

- **"this.httpClient is not a function"** — Provide an `httpClient` in the configuration. See [Quick Start](#quick-start).
- **"No mapping found for ctype"** — The `ctype` from brXM doesn't match your mapping keys. Check the Delivery API response for exact values (case-sensitive).
- **Components render empty** — Verify `getDocumentData()` returns data. Check the Network tab for API responses.
- **Context not reaching components** — Ensure your app shell uses light DOM.
- **EM overlays not appearing** — Check `page.isPreview()`, CORS headers, and preview URL configuration.

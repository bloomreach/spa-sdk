# Bloomreach SPA SDK for Lit

Bloomreach SPA SDK integration for [Lit](https://lit.dev/) web components. This package provides the same component set as the React, Angular, and Vue SDKs — built with Lit patterns: custom elements, decorators, and `@lit/context` for state propagation.

## Table of Contents

- [Architecture](#architecture)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Components](#components)
  - [`<br-page>`](#br-page)
  - [`<br-component>`](#br-component)
  - [`<br-container>`](#br-container)
  - [`<br-container-item>`](#br-container-item)
  - [`<br-manage-content-button>`](#br-manage-content-button)
  - [`<br-manage-menu-button>`](#br-manage-menu-button)
- [Component Mapping](#component-mapping)
- [Writing Mapped Components](#writing-mapped-components)
- [Data Extraction](#data-extraction)
- [Custom Layouts](#custom-layouts)
- [Context System](#context-system)
- [Experience Manager Preview](#experience-manager-preview)
- [API Reference](#api-reference)
- [Light DOM vs Shadow DOM](#light-dom-vs-shadow-dom)
- [Troubleshooting](#troubleshooting)

---

## Architecture

```
+---------------------------------------------+
|          Your Lit Web Components             |  <-- lit-banner, lit-content, etc.
+---------------------------------------------+
|       lit-sdk (this package)                 |  <-- br-page, br-component, etc.
+---------------------------------------------+
|       @bloomreach/spa-sdk (core)             |  <-- Framework-agnostic
+-----------------------+---------------------+
|   Delivery API        |  Experience Manager |  <-- brXM Backend
|   (JSON REST)         |  (postMessage RPC)  |
+-----------------------+---------------------+
```

The SDK sits between your application components and the core `@bloomreach/spa-sdk`. It handles:

1. **Initialization** — Calls `initialize()` from the core SDK with your configuration
2. **Context propagation** — Distributes the `Page`, current `Component`, and component `mapping` down the tree via `@lit/context`
3. **Component tree rendering** — Recursively traverses the brXM component model and renders containers, container items, and regular components
4. **Component mapping** — Resolves `ctype` strings from brXM to Lit custom element tag names
5. **Experience Manager integration** — Injects DOM comments for editing overlays, calls `page.sync()`, and listens for live update events

---

## Installation

### Install the SDK and its peer dependencies

```bash
npm install @bloomreach/lit-sdk lit @lit/context @bloomreach/spa-sdk
```

### Usage

Import from `@bloomreach/lit-sdk` anywhere in your project:

```typescript
// Barrel import (components, utilities, contexts, types)
import { BrPage, getDocumentData, brPageContext } from '@bloomreach/lit-sdk';

// Side-effect import registers all custom elements
import '@bloomreach/lit-sdk';
```

---

## Quick Start

### 1. Create the app shell

```typescript
import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import type { Configuration } from '@bloomreach/spa-sdk';

// Register SDK custom elements
import '@bloomreach/lit-sdk';

// Register your mapped components
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
      baseUrl: '',
      httpClient: async (config) => {
        const response = await fetch(config.url, {
          method: config.method,
          headers: config.headers as Record<string, string>,
          body: config.data,
        });
        const data = await response.json();
        return { data };
      },
      path: `${window.location.pathname}${window.location.search}`,
    } as Configuration;
  }

  // Light DOM so br-page (also light DOM children) work correctly
  createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <br-page
        .configuration=${this._config}
        .mapping=${MAPPING}
      ></br-page>
    `;
  }
}
```

### 2. Create a mapped component

```typescript
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { ContainerItem, Page } from '@bloomreach/spa-sdk';
import { getDocumentData } from '@bloomreach/lit-sdk';

interface HeroData {
  headline: string;
  subtitle: string;
}

@customElement('my-hero')
export class MyHero extends LitElement {
  @property({ type: Object }) component?: ContainerItem;
  @property({ type: Object }) page?: Page;

  static styles = css`
    :host { display: block; }
    h1 { font-size: 3rem; }
  `;

  render() {
    const data = this.component && this.page
      ? getDocumentData<HeroData>(this.component, this.page)
      : undefined;

    if (!data) return html``;

    return html`
      <section>
        <h1>${data.headline}</h1>
        <p>${data.subtitle}</p>
      </section>
    `;
  }
}
```

### 3. Provide an httpClient

The `@bloomreach/spa-sdk` does **not** bundle an HTTP client. You must provide one in the configuration. The `httpClient` function receives a config object and must return `{ data }`:

```typescript
httpClient: async (config) => {
  const response = await fetch(config.url, {
    method: config.method,
    headers: config.headers as Record<string, string>,
    body: config.data,
  });
  const data = await response.json();
  return { data };
},
```

The config object has these fields:
- `url` — Full URL to fetch
- `method` — HTTP method (`'GET'`, `'POST'`, etc.)
- `headers` — Request headers (includes `Authorization` for preview mode)
- `data` — Request body (for POST requests)

---

## Components

### `<br-page>`

The root SDK component. Initializes the Bloomreach SPA SDK and provides `Page`, root `Component`, and the component `mapping` to all descendants via Lit Context.

**Properties:**

| Property | Type | Required | Description |
|---|---|---|---|
| `configuration` | `Configuration` | Yes | SPA SDK configuration (endpoint, httpClient, etc.) |
| `mapping` | `Record<string, string>` | Yes | Maps brXM `ctype` strings to Lit custom element tag names |

**Rendering modes:**

1. **Auto-render** (no children) — renders the full component tree automatically:
   ```html
   <br-page .configuration=${config} .mapping=${mapping}></br-page>
   ```

2. **Custom layout** (with children) — you control the layout using `<br-component name="...">`:
   ```html
   <br-page .configuration=${config} .mapping=${mapping}>
     <nav>
       <br-component name="menu"></br-component>
     </nav>
     <main>
       <br-component name="main"></br-component>
     </main>
   </br-page>
   ```

**DOM strategy:** Uses Shadow DOM with `<slot>`. In auto-render mode, a fallback `<br-component>` inside the slot renders the full tree. In custom layout mode, your children are projected via the slot. Context events are composed and cross shadow boundaries, so slotted `<br-component>` elements receive context correctly.

**Lifecycle:**
- `connectedCallback` — Calls `initialize()` from the core SDK
- `updated` — Calls `page.sync()` to reposition Experience Manager overlays
- `disconnectedCallback` — Calls `destroy()` to clean up SDK state

---

### `<br-component>`

Traverses the brXM component tree by name and renders children recursively.

**Properties:**

| Property | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | No | Name of the child component to resolve |

**Behavior:**
- **With `name`**: Looks up a named child of the current component and renders it (works for containers, container items, and regular components)
- **Without `name`**: Renders all children of the current component

**Example — multi-column layout:**

```html
<br-page .configuration=${config} .mapping=${mapping}>
  <div class="sidebar">
    <br-component name="left"></br-component>
  </div>
  <main>
    <br-component name="main"></br-component>
  </main>
</br-page>
```

The `name` values correspond to the component names defined in the brXM page layout (e.g., `menu`, `main`, `left`, `right`, `footer`).

**DOM strategy:** Light DOM — required for Experience Manager DOM comment injection.

---

### `<br-container>`

Renders a brXM container and its container item children. This is an internal component — you typically don't use it directly. It is instantiated automatically by `<br-component>` when it encounters a container in the component tree.

**Responsibilities:**
- Renders each child as a `<br-container-item>`
- Injects container-level meta comments for the Experience Manager "Add component" button

**DOM strategy:** Light DOM.

---

### `<br-container-item>`

The key mapping component. Resolves a container item's `ctype` to a Lit custom element tag name and dynamically creates the mapped element. This is an internal component — instantiated automatically by `<br-container>`.

**Responsibilities:**
- Reads `ctype` from `ContainerItem.getType()` (falls back to `label`)
- Looks up the Lit tag name from the mapping context
- Creates the element via `document.createElement(tagName)`
- Sets `component` and `page` as properties on the created element
- Injects meta comments for Experience Manager overlays
- Listens for `update` events for live editing in preview mode
- Skips rendering if `component.isHidden()` (Relevance feature)

**DOM strategy:** Light DOM.

---

### `<br-manage-content-button>`

Renders an "Edit content" button overlay when running in Experience Manager preview mode. Uses `page.getButton(TYPE_MANAGE_CONTENT_BUTTON, config)` to generate the correct meta comments. Only visible when `page.isPreview()` is true.

**Properties:**

| Property | Type | Required | Description |
|---|---|---|---|
| `content` | `ManageContentButton['content']` | No | The Content object to edit (resolved via `page.getContent()`) |
| `page` | `Page` | No | Direct page reference (use when Lit Context is unavailable) |
| `documentTemplateQuery` | `string` | No | Template query for creating new documents |
| `folderTemplateQuery` | `string` | No | Template query for creating new folders |
| `path` | `string` | No | Initial document location, relative to `root` |
| `parameter` | `string` | No | Component parameter name for storing the document path |
| `relative` | `boolean` | No | Whether the picked value is stored as a relative path |
| `root` | `string` | No | Root folder path for selectable document locations |
| `renderTarget` | `HTMLElement` | No | Light DOM element to inject meta comments around (see Shadow DOM usage below) |

The `page` property is resolved in this order: explicit `page` prop → Lit Context (`brPageContext`).

**Usage in light DOM components (recommended):**

When your mapped component uses light DOM, the button works naturally — meta comments are injected around the button element itself in the regular DOM, where the Experience Manager can find them:

```typescript
@customElement('my-hero')
export class MyHero extends LitElement {
  @property({ type: Object }) component?: ContainerItem;
  @property({ type: Object }) page?: Page;

  // Light DOM for Experience Manager compatibility
  createRenderRoot() { return this; }

  private _getDocument(): Content | undefined {
    if (!this.component || !this.page) return undefined;
    const models = this.component.getModels<{ document?: Reference }>();
    return models?.document
      ? this.page.getContent<Content>(models.document)
      : undefined;
  }

  render() {
    return html`
      <section>
        <br-manage-content-button
          .content=${this._getDocument()}
          .page=${this.page}
        ></br-manage-content-button>
        <h1>...</h1>
      </section>
    `;
  }
}
```

**Usage in Shadow DOM components (with `renderTarget`):**

When your mapped component uses Shadow DOM, the button's meta comments would be invisible to the Experience Manager (they'd be inside the shadow root). Use the `renderTarget` prop to inject comments around a light DOM element instead:

```html
<br-manage-content-button
  .content=${this._getDocument()}
  .page=${this.page}
  .renderTarget=${this}
></br-manage-content-button>
```

> **Note:** When using `renderTarget`, the manage content button meta comments wrap the same element as the container-item meta comments, which can cause overlapping overlays in the Experience Manager. For the best editing experience, use light DOM on components that need a manage content button.

**"Create new" button (no existing content):**

Omit `content` and provide template queries instead. This creates a button that lets editors create a new document:

```html
<br-manage-content-button
  documentTemplateQuery="new-banner-document"
  folderTemplateQuery="new-banner-folder"
  root="banners"
  .page=${this.page}
></br-manage-content-button>
```

**DOM strategy:** Light DOM.

---

### `<br-manage-menu-button>`

Renders an "Edit Menu" button overlay when running in Experience Manager preview mode. Uses `page.getButton(TYPE_MANAGE_MENU_BUTTON, menu)` to generate the correct meta comments. Only visible when `page.isPreview()` is true **and** a `menu` is provided.

**Properties:**

| Property | Type | Required | Description |
|---|---|---|---|
| `menu` | `Menu` | Yes | The Menu model to generate the edit button for |
| `page` | `Page` | No | Direct page reference (use when Lit Context is unavailable) |
| `renderTarget` | `HTMLElement` | No | Light DOM element to inject meta comments around (see Shadow DOM usage in `<br-manage-content-button>`) |

The `page` property is resolved in this order: explicit `page` prop → Lit Context (`brPageContext`).

**Usage:**

```typescript
import { getDocumentData } from '@bloomreach/lit-sdk';
import '@bloomreach/lit-sdk';

// Inside a mapped component's render():
render() {
  const menu = this.page?.getContent<Menu>(menuRef);

  return html`
    <nav>
      <br-manage-menu-button
        .menu=${menu}
        .page=${this.page}
      ></br-manage-menu-button>
      ${menu?.getItems().map(item => html`
        <a href=${this.page!.getUrl(item.getLink()!)}>${item.getName()}</a>
      `)}
    </nav>
  `;
}
```

**DOM strategy:** Light DOM.

---

## Component Mapping

The `mapping` property on `<br-page>` maps brXM `ctype` strings to Lit custom element tag names:

```typescript
const MAPPING: Record<string, string> = {
  'Banner': 'my-banner',
  'Content': 'my-content',
  'News List': 'my-news-list',      // uses label fallback (no ctype set)
  'Simple Content': 'my-content',   // multiple ctypes can map to one element
};
```

**How it works:**

1. brXM returns a page model containing container items, each with a `ctype` field
2. `<br-container-item>` calls `component.getType()` which returns `ctype` (or falls back to `label`)
3. The ctype is looked up in the mapping to find the corresponding Lit tag name
4. `document.createElement(tagName)` creates the element
5. `component` (ContainerItem) and `page` (Page) are set as properties on the element

**Finding the correct ctype values:**

The `ctype` values are defined in the brXM catalog configuration. Check your `catalog.yaml` or use the Delivery API response to see what ctypes are returned. In the browser console, unmapped ctypes will produce a warning:

```
[br-container-item] No mapping found for ctype "MyComponent"
```

---

## Writing Mapped Components

Every mapped component receives two properties from the SDK:

| Property | Type | Description |
|---|---|---|
| `component` | `ContainerItem` | The brXM container item (access parameters, models, meta) |
| `page` | `Page` | The brXM page object (resolve content references, check preview mode) |

### Minimal template

```typescript
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { ContainerItem, Page } from '@bloomreach/spa-sdk';
import { getDocumentData } from '@bloomreach/lit-sdk';

interface MyData {
  title: string;
  body: string;
}

@customElement('my-component')
export class MyComponent extends LitElement {
  @property({ type: Object }) component?: ContainerItem;
  @property({ type: Object }) page?: Page;

  static styles = css`
    :host { display: block; }
  `;

  render() {
    const data = this.component && this.page
      ? getDocumentData<MyData>(this.component, this.page)
      : undefined;

    if (!data) return html``;

    return html`
      <h2>${data.title}</h2>
      <p>${data.body}</p>
    `;
  }
}
```

### Dual-mode components (SDK + standalone)

If a component should work both with the SDK and with direct data props (e.g., for testing or standalone use):

```typescript
@customElement('my-component')
export class MyComponent extends LitElement {
  /** Direct data prop (standalone mode) */
  @property({ type: Object }) data?: MyData;

  /** SDK: container item from brXM */
  @property({ type: Object }) component?: ContainerItem;

  /** SDK: page object from brXM */
  @property({ type: Object }) page?: Page;

  private _getData(): MyData | undefined {
    if (this.component && this.page) {
      return getDocumentData<MyData>(this.component, this.page);
    }
    return this.data;
  }

  render() {
    const data = this._getData();
    if (!data) return html``;
    return html`<h2>${data.title}</h2>`;
  }
}
```

### Shadow DOM vs Light DOM on mapped components

Mapped components have two options:

- **Shadow DOM** (Lit default) — Use when the component does **not** need a `<br-manage-content-button>`. The container-item overlay meta comments are injected by `<br-container-item>` *outside* the mapped component, so Shadow DOM encapsulation is preserved.

- **Light DOM** — Use when the component **does** need a `<br-manage-content-button>`. The button's meta comments must be in the regular DOM for the Experience Manager to find them. Override `createRenderRoot()` and scope styles with the tag name prefix:

```typescript
@customElement('my-hero')
export class MyHero extends LitElement {
  @property({ type: Object }) component?: ContainerItem;
  @property({ type: Object }) page?: Page;

  createRenderRoot() { return this; }

  render() {
    return html`
      <style>
        my-hero .hero { /* scoped styles */ }
        my-hero h1 { font-size: 3rem; }
      </style>
      <section class="hero">
        <br-manage-content-button
          .content=${this._getDocument()}
          .page=${this.page}
        ></br-manage-content-button>
        <h1>...</h1>
      </section>
    `;
  }
}
```

---

## Data Extraction

The SDK provides two utility functions for extracting content from container items.

### `getDocumentData<T>(component, page)`

**Recommended.** Resolves document data for container items that use the `BaseHstDynamicComponent` pattern (the standard brXM dynamic component with a document picker).

These components store a document reference in `models.document` (a `$ref` pointer), not in the `content` field.

```typescript
import { getDocumentData } from '@bloomreach/lit-sdk';

const data = getDocumentData<HeroData>(component, page);
```

**Resolution strategy (in order):**
1. Checks `component.getModels().document` for a `$ref` → resolves via `page.getContent()` → calls `getData()`
2. Falls back to `getContainerItemContent()` (for the content-field pattern)
3. Returns `undefined` if neither works

### `getContainerItemContent<T>(component, page)`

Wraps the core SDK's `getContainerItemContent`. Resolves content from the `content` field on the container item model. Use this when your component stores content directly rather than via a document reference.

```typescript
import { getContainerItemContent } from '@bloomreach/lit-sdk';

const data = getContainerItemContent<BannerData>(component, page);
```

### Field name mapping

brXM may return compound field arrays with type-specific names that differ from your TypeScript interfaces. For example, a document type with a `featureitem` compound field will return data as:

```json
{
  "sectionTitle": "Our Features",
  "featureitem": [{ "icon": "...", "title": "..." }]
}
```

If your TypeScript interface uses `items` instead of `featureitem`, map the field in your component:

```typescript
private _getData(): FeaturesData | undefined {
  if (this.component && this.page) {
    const raw = getDocumentData<any>(this.component, this.page);
    if (raw) {
      return {
        sectionTitle: raw.sectionTitle,
        items: raw.featureitem ?? raw.items ?? [],
      };
    }
  }
  return this.data;
}
```

---

## Custom Layouts

By default, `<br-page>` with no children auto-renders the entire component tree. For multi-column or custom layouts, add `<br-component name="...">` children:

```html
<br-page .configuration=${config} .mapping=${mapping}>
  <header>
    <br-component name="header"></br-component>
  </header>
  <div class="layout">
    <aside>
      <br-component name="menu"></br-component>
    </aside>
    <main>
      <br-component name="main"></br-component>
    </main>
  </div>
  <footer>
    <br-component name="footer"></br-component>
  </footer>
</br-page>
```

The `name` attribute corresponds to the component names defined in your brXM page layout. Common names include `menu`, `main`, `top`, `bottom`, `left`, `right`, `header`, `footer`.

To see what names are available, inspect the Delivery API response at your endpoint (e.g., `http://localhost:8080/site/resourceapi`). The root component's children will have `name` fields.

---

## Context System

The SDK uses [`@lit/context`](https://lit.dev/docs/data/context/) to propagate state down the component tree without prop-drilling. Three contexts are defined:

| Context | Type | Provider | Description |
|---|---|---|---|
| `brPageContext` | `Page \| undefined` | `<br-page>` | The initialized Page object |
| `brComponentContext` | `Component \| undefined` | `<br-page>`, `<br-component>` | The current component in the tree |
| `brMappingContext` | `Record<string, string>` | `<br-page>` | The ctype-to-tag-name mapping |

**How it works:**

1. `<br-page>` provides all three contexts after initialization
2. `<br-component>` consumes `brComponentContext` from its parent and provides a new one for its children (the resolved child component)
3. `<br-container>` and `<br-container-item>` consume `brPageContext` and `brMappingContext`
4. Context events are `composed` and cross shadow boundaries, so slotted children of `<br-page>` receive context correctly

**Using contexts in your own components:**

You typically don't need to consume these contexts directly — the SDK passes `component` and `page` as properties to your mapped elements. However, if needed:

```typescript
import { consume } from '@lit/context';
import { brPageContext } from '@bloomreach/lit-sdk';
import type { Page } from '@bloomreach/spa-sdk';

@customElement('my-component')
class MyComponent extends LitElement {
  @consume({ context: brPageContext, subscribe: true })
  private page?: Page;
}
```

---

## Experience Manager Preview

When your SPA runs inside the Experience Manager iframe (preview mode), the SDK automatically handles:

1. **JWT Authentication** — Token from the `?token=` query parameter is included as an `Authorization` header on Delivery API requests
2. **DOM Comments** — Meta comments (`beginNodeSpan`/`endNodeSpan`) are injected around containers and container items so the Experience Manager can position editing overlays
3. **`page.sync()`** — Called after every render cycle (in `updated()`) to tell the Experience Manager that overlays can be repositioned
4. **Live updates** — `<br-container-item>` listens for `update` events on the ContainerItem, triggering re-renders when content editors make changes

### Prerequisites for preview mode

1. Set the channel's preview URL to your SPA origin in brXM:
   ```
   PreviewURLChannelInfo_url: http://localhost:5173
   ```

2. Configure CORS on the HST mount:
   ```yaml
   hst:responseheaders: ['Access-Control-Allow-Origin: http://localhost:5173']
   ```

3. Enable the Page Model API on the HST mount:
   ```yaml
   hst:pagemodelapi: resourceapi
   ```

---

## API Reference

### Exports

**Components** (custom elements — registered on import):

| Export | Tag Name | Description |
|---|---|---|
| `BrPage` | `<br-page>` | Root SDK component |
| `BrComponent` | `<br-component>` | Named child lookup + recursive rendering |
| `BrComponentNode` | `<br-component-node>` | Internal: renders a generic component node |
| `BrContainer` | `<br-container>` | Internal: renders a container |
| `BrContainerItem` | `<br-container-item>` | Internal: resolves ctype and renders mapped element |
| `BrManageContentButton` | `<br-manage-content-button>` | Edit content button overlay (preview only) |
| `BrManageMenuButton` | `<br-manage-menu-button>` | Edit menu button overlay (preview only) |

**Contexts:**

| Export | Description |
|---|---|
| `brPageContext` | Lit Context for the Page object |
| `brComponentContext` | Lit Context for the current Component |
| `brMappingContext` | Lit Context for the component mapping |

**Utilities:**

| Export | Description |
|---|---|
| `getDocumentData<T>(component, page)` | Resolve document data (models.document pattern) |
| `getContainerItemContent<T>(component, page)` | Resolve content data (content field pattern) |
| `isInternalLink(link)` | Check if a Link object is an internal (SPA) link |
| `isExternalLink(link)` | Check if a Link object is an external link |

**Type guards** (re-exported from `@bloomreach/spa-sdk`):

`isComponent`, `isContainer`, `isContainerItem`, `isContent`, `isDocument`, `isImageSet`, `isLink`, `isMenu`, `isMetaComment`, `isMeta`, `isPage`, `isPagination`, `isReference`

**Types** (re-exported from `@bloomreach/spa-sdk`):

`Page`, `Component`, `ContainerItem`, `Container`, `Content`, `Document`, `ImageSet`, `Image`, `Link`, `Menu`, `Menu10`, `MenuItem`, `MetaCollection`, `MetaComment`, `Meta`, `PageModel`, `Configuration`, `ManageContentButton`, `Reference`

**Functions** (re-exported from `@bloomreach/spa-sdk`):

`initialize`, `destroy`

---

## Light DOM vs Shadow DOM

Understanding the DOM strategy is important for this SDK:

| Component | DOM Mode | Reason |
|---|---|---|
| `<br-page>` | **Shadow DOM** | Uses `<slot>` for custom layout projection. Context events are composed and cross shadow boundaries. |
| `<br-component>` | **Light DOM** | Must be in light DOM so Experience Manager can inject meta comments and find component boundaries. |
| `<br-component-node>` | **Light DOM** | Same reason as `<br-component>`. |
| `<br-container>` | **Light DOM** | Meta comments for "Add component" button need light DOM. |
| `<br-container-item>` | **Light DOM** | Meta comments for editing overlays need light DOM. |
| `<br-manage-content-button>` | **Light DOM** | Meta comments need light DOM. |
| `<br-manage-menu-button>` | **Light DOM** | Meta comments need light DOM. |
| **Your mapped components** | **Shadow DOM** or **Light DOM** | Shadow DOM by default. Use light DOM if the component needs a `<br-manage-content-button>` or `<br-manage-menu-button>` (meta comments must be in the regular DOM). |

If your app shell wraps `<br-page>`, it should also use light DOM so the SDK's light DOM components are not inside a shadow root:

```typescript
// App shell should use light DOM
createRenderRoot() {
  return this;
}
```

---

## Troubleshooting

### "this.httpClient is not a function"

The `@bloomreach/spa-sdk` requires an `httpClient` in the configuration. See [Provide an httpClient](#3-provide-an-httpclient).

### "No mapping found for ctype '...'"

The `ctype` value from brXM doesn't match any key in your mapping object. Check the Delivery API response to see the actual `ctype` values. They must match exactly (case-sensitive).

### Components render empty

1. Check that `getDocumentData()` returns data — add `console.log` in your component's render method
2. Verify the Delivery API response contains content for your components (check browser Network tab)
3. brXM's `BaseHstDynamicComponent` stores documents in `models.document` — use `getDocumentData()` instead of `getContainerItemContent()`

### Field names don't match TypeScript interfaces

brXM compound fields use type-specific names (e.g., `featureitem` instead of `items`). Inspect the raw data from the Delivery API and map field names in your component's data extraction method. See [Field name mapping](#field-name-mapping).

### Context not reaching components

- Ensure your app shell uses light DOM (`createRenderRoot() { return this; }`)
- If using custom layout, `<br-component name="...">` elements must be direct or slotted children of `<br-page>` — context events are composed and will cross the shadow boundary

### Experience Manager overlays not appearing

1. Verify `page.isPreview()` returns `true` (check browser console)
2. Ensure `page.sync()` is being called after renders (handled by `<br-page>` automatically)
3. Confirm CORS headers are configured on the HST mount
4. Confirm the preview URL is set correctly on the channel

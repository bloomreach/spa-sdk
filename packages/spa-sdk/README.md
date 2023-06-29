# Bloomreach SPA SDK

Bloomreach SPA SDK provides simplified headless integration
with [Bloomreach Content](https://www.bloomreach.com/en/products/content)
for JavaScript-based applications. This library interacts with
the [Page Model API](https://documentation.bloomreach.com/library/concepts/page-model-api/introduction.html)
and exposes a simplified and framework-agnostic interface over the page model.

## Features

- Page Model API Client
- Page Model Javascript implementation
- URL Generator
- Integration with Bloomreach Experience Manager Preview

## Get Started

### Installation

To get the SDK into your project with [NPM](https://docs.npmjs.com/cli/npm):

```bash
npm install @bloomreach/spa-sdk
```

And with [Yarn](https://yarnpkg.com):

```bash
yarn add @bloomreach/spa-sdk
```

### Usage

The following code snippet requests a related page model and shows the page's title.

```javascript
import axios from "axios";
import { initialize } from "@bloomreach/spa-sdk";

async function showPage(path) {
  const page = await initialize({
    // The path to request from the Page Model API, should include query
    // parameters if those are present in the url
    path,
    // The location of the Page Model API of the brX channel
    endpoint: "http://localhost:8080/delivery/site/v1/channels/brxsaas/pages",
    // The httpClient used to make requests
    httpClient: axios,
  });

  document.querySelector("#title").innerText = page.getTitle();
}

showPage(`${window.location.pathname}${window.location.search}`);
```

### Relevance Integration

(not applicable to Content SaaS)

The SDK provides basic [Express
middleware](https://expressjs.com/en/guide/using-middleware.html) for seamless
integration
with [the Relevance Module](https://documentation.bloomreach.com/14/library/enterprise/enterprise-features/targeting/targeting.html).

```javascript
import express from "express";
import { relevance } from "@bloomreach/spa-sdk/dist/express";

const app = express();

app.use(relevance);
```

The middleware can be customized using the `withOptions` method.

```javascript
app.use(relevance.withOptions({ name: "_visitor", maxAge: 24 * 60 * 60 }));
```

### Rendering HTML content safely

You should/must sanitize any HTML content returned in the page model for security reasons. Before the removal of the
sanitize method, we used the [`sanitize-html`](https://www.npmjs.com/package/sanitize-html) package in the SDK for this purpose. You can now use your preferred
sanitization libraries or techniques based on your project requirements. Make sure to preserve the `data-type` attribute
on links in the rich content fields when sanitizing as it lets the SDK determine which links are external and which are
internal when using the [`rewriteLinks`](https://bloomreach.github.io/spa-sdk/interfaces/index.Page.html#rewriteLinks) method.

For example, in a React example, you may sanitize and render the HTML content which came from the backend like the
following example:

```tsx
import sanitize from 'sanitize-html';
  
function sanitizeRichContent(content: string): string {
  return sanitize(content, {
    allowedAttributes: {
      a: ['href', 'name', 'target', 'title', 'data-type', 'rel'],
      img: ['src', 'srcset', 'alt', 'title', 'width', 'height', 'loading'],
    },
    allowedTags: sanitizeHTML.defaults.allowedTags.concat(['img']),
  });
}
/* ... */

/* Suppose the content.value below contains HTML markups string. */
<div>
   {content && <div dangerouslySetInnerHTML={{ __html: page.rewriteLinks(sanitizeRichContent(content.value)) }} />}
</div>
```

The same principle may apply in other frameworks. e.g, `v-html` in Vue.js or `[innerHTML]` in Angular.

## Persist preview data for pages without SDK instance

If you are using the SPA SDK selectively on certain pages, you will need to persist the preview related data when
navigating between pages that have and those that don't have a SDK instance. The easiest way to achieve this result is
by making use of the cookie storage as illustrated below.

The following snippet of the code shows the possible implementation of a function which builds a Configuration object to
pass into the `initialize` function from the SPA SDK or directly to a `BrPage` component.
It reads preview data from the query string and saves it to the cookies, restoring that data if it not available in a
query string. To manage the cookies you could use `cookie` library or any other library.

### Important notes

* The preview site should be served on a separate domain compared to the live site to avoid saving preview related
  cookies for the live site.
* In case, when the first page which is loading in preview doesn't use SPA SDK you should parse query parameters and
  save preview related data to the cookies by yourself.

This is a generic example and you should adjust it to your specific framework.

```typescript
import axios from 'axios';
import cookie from 'cookie';
import { Configuration } from '@bloomreach/spa-sdk';

export default function buildConfiguration(): Configuration {
  const PREVIEW_TOKEN_KEY = 'token';
  const PREVIEW_SERVER_ID_KEY = 'server-id';
  // Read a token and server id from the query string
  const searchParams = new URLSearchParams(window.location.search);
  const queryToken = searchParams.get(PREVIEW_TOKEN_KEY);
  const queryServerId = searchParams.get(PREVIEW_SERVER_ID_KEY);

  const cookies = cookie.parse(document.cookie);

  // Prioritize values from the query string because cookies might be outdated.
  const authorizationToken = queryToken ?? cookies[PREVIEW_TOKEN_KEY];
  const serverId = queryServerId ?? cookies[PREVIEW_SERVER_ID_KEY];

  // Save the values from the query string to have ability to restore them when switch back from legacy page to the SPA-SDK rendered page.
  if (queryToken) {
    document.cookie = cookie.serialize(PREVIEW_TOKEN_KEY, queryToken);
  }

  if (queryServerId) {
    document.cookie = cookie.serialize(PREVIEW_SERVER_ID_KEY, queryServerId);
  }

  const configuration = {
    endpoint: 'your-pda-endpoint',
    httpClient: axios,
    path: `${location.pathname}${location.search}`,
    // Provide authorization token and server id if they exist to the SPA-SDK initialization method.
    ...(authorizationToken ? { authorizationToken } : {}),
    ...(serverId ? { serverId } : {}),
  };

  return configuration;
};

```

## License

Published under [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) license.

## Reference

Typedoc for the SPA SDK is automatically generated and published
to https://bloomreach.github.io/spa-sdk/modules/index.html

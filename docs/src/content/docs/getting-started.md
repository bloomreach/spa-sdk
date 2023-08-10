---
title: "Getting started"
description: "Getting started"
---

## Introduction

The Bloomreach SPA SDK is a Javascript library aimed at providing a seamless headless integration with the [Bloomreach Experience Manager](https://www.bloomreach.com/en/products/experience-manager). This library is suitable for SSR, CSR or Hybrid JS applications. 

This library interacts with the [Page Model API](https://documentation.bloomreach.com/library/concepts/page-model-api/introduction.html)
and exposes a simplified and framework-agnostic interface over the page model.

### Features
- Page Model API Client
- Page Model Javascript implementation
- URL Generator
- Integration with Bloomreach Experience Manager Preview

## Getting started

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

### Rendering HTML content safely

The SPA SDK provides an API, ```Page.sanitize(html)```,
which sanitizes HTML content using the [sanitize-html](https://www.npmjs.com/package/sanitize-html) library,
to render the HTML content safely.

For example, in a React example, you may sanitize and render the HTML content which came from the backend like the following example:

```
{/* Suppose the content.value below contains HTML markups string. */}
<div>
   {content && <div dangerouslySetInnerHTML={{ __html: page.rewriteLinks(page.sanitize(content.value)) }} />}
</div>
```

The same principle may apply in other frameworks. e.g, `v-html` in Vue.js or `[innerHTML]` in Angular.
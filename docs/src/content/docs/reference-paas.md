---
title: "PaaS Referece"
description: ""
---

## About

The [Relevance module](https://xmdocumentation.bloomreach.com/library/enterprise/enterprise-features/targeting/targeting.html) is a ***content PaaS only*** module. It is not supported in Content SaaS.

The SDK provides basic [Express
middleware](https://expressjs.com/en/guide/using-middleware.html) for seamless integration with the module.

## Installation

```javascript
import express from "express";
import { relevance } from "@bloomreach/spa-sdk/lib/express";

const app = express();

app.use(relevance);
```

The middleware can be customized using the `withOptions` method.

```javascript
app.use(relevance.withOptions({ name: "_visitor", maxAge: 24 * 60 * 60 }));
```

## Reference

#### Configuration

In addition to the other options, the `initialize` function supports several Relevance speciffic configuration options:

| Relevance speciffic options
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`visitor`** <br> An object holding information about the current visitor. The option takes precedence over `request.visitor` <br><br> Required: no <br> Default: . _none_ |
| **`visitor.id`** <br> The current visitor identifier. <br><br> Required: yes <br> Default: _none_ |
| **`visitor.header`** <br> An HTTP-header using to pass the visitor identifier to the Page Model API. <br><br> Required: yes <br> Default: _none_ |
| **`request`** <br> Current user's request. <br><br> Required: yes <br> Default: _none_ |
| **`request.connection`** <br> Current request remote connection containing the remote address. This option is used in [the Relevance Module](https://documentation.bloomreach.com/14/library/enterprise/enterprise-features/targeting/targeting.html) <br><br> Required: no <br> Default: . _none_ |
| **`request.emit`** <br> Emits an event in the request scope. This option can be used in [Node.js integration](https://nodejs.org/api/stream.html#stream_readable_streams) <br><br> Required: no <br> Default: . _none_ |
| **`request.headers`** <br> An object holding request headers. It should contain a `Cookie` header if rendering is happening on the server-side in the UrlRewriter-based setup. <br><br> Required: no <br> Default: `{}` |
| **`request.path`** <br> The path part of the URL, including a query string if present (e.g. `/path/to/page?foo=1`). The option is **deprecated** in favor of `path` <br><br> Required: no <br> Default: . `/` |
| **`request.visitor`** <br> An object holding information about the current visitor. <br><br> Required: no <br> Default: _none_ |

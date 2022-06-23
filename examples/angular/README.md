# Angular CSR/SSR SPA

Example Angular SPA using the Bloomreach Experience [Angular SDK](https://www.npmjs.com/package/@bloomreach/ng-sdk).  This project was
generated with [Angular CLI](https://github.com/angular/angular-cli).

## Install and run
```bash
npm ci
npm run start
```

## Available scripts

In the project directory, you can run:

### Development server

Run `npm run start` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

For Angular Universal application, you can use `npm run dev:ssr`.

### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

### Build

Run `npm run build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

### Launch

Run `npm run start:ssr` to start Angular Universal application.

## Requesting & persisting user consent
Personalization is handled via a separate package [npm package](https://www.npmjs.com/package/@bloomreach/segmentation) such that you can easily exclude it if you don't plan to use it.

## Personalization
Personalization requires an Exponea account. Once you have that set up, you can fetch a project id for which you can enable personalization.

In order to initialize the personalization package, you will need to provide the *project id* as an *environment variable*:
`exponeaProjectToken` - with Exponea project token, and `exponeaApiUrl` - with Exponea API endpoint.

If further customization is needed, please note that all logic regarding cookie consent popup and executing personalization is located in the `./src/app/utils/cookieconsent.ts` file.
Simply inject `./src/app/cookie-consent/cookie-consent.component.ts` into the application bootstrapping sequence in order to enable personalization. See `./src/app/index/index.component.html` for an example.

## Persist preview data for pages without SDK instance
If you are using the SPA SDK selectively on certain pages, you will need to persist the preview related data when navigating between pages that have and those that don't have a SDK instance. The easiest way to achieve this result is by making use of the cookie storage as illustrated below.

The following snippet of the code shows the possible implementation of the place where you are building configuration object for the `initialize` function. Read preview data from the query string and save it to the cookies for the following restoring that data if it not available in a query string. Extend configuration object for the `initialize` function with preview data (`authorizationToken` and `serverId`). To manage cookies you could use `cookie` library or any other library.

### Important notes
* The preview site should be served on a separate domain compared to the live site to avoid saving preview related cookies for the live site.
* In case, when the first page which is loading in preview doesn't use SPA SDK you should parse query parameters and save preview related data to the cookies by yourself.

```typescript
import { REQUEST, RESPONSE } from '@nguniversal/express-engine/tokens';
import { Request, Response } from 'express';
import cookie from 'cookie';

export class IndexComponent implements OnInit {

...

  constructor(
    router: Router,
    route: ActivatedRoute,
    @Inject(ENDPOINT) endpoint?: string,
    @Inject(REQUEST) @Optional() request?: Request,
    @Inject(RESPONSE) @Optional() response?: Response
  ) {

    const PREVIEW_TOKEN_KEY = 'token';
    const PREVIEW_SERVER_ID_KEY = 'server-id';
    // Read a token and server id from the query params
    const queryToken = route.snapshot.queryParams[PREVIEW_TOKEN_KEY];
    const queryServerId = route.snapshot.queryParams[PREVIEW_SERVER_ID_KEY];

    const cookies = request
      ? cookie.parse(request.cookies ?? request.headers.cookie)
      : cookie.parse(document.cookie);

    // Make priority to values from query string because in cookies they might be outdated.
    const authorizationToken = queryToken ?? cookies[PREVIEW_TOKEN_KEY];
    const serverId = queryServerId ?? cookies[PREVIEW_SERVER_ID_KEY];

    // Save the values from the query string to have ability to restore them when switch back from legacy page to the SPA-SDK rendered page.
    if (response && request) {
      if (queryToken) response.cookie(PREVIEW_TOKEN_KEY, queryToken);
      if (queryServerId) response.cookie(PREVIEW_SERVER_ID_KEY, queryServerId);
    } else {
      if (queryToken) document.cookie = cookie.serialize(PREVIEW_TOKEN_KEY, queryToken);
      if (queryServerId) document.cookie = cookie.serialize(PREVIEW_SERVER_ID_KEY, queryServerId);
    }

    this.configuration = {
      endpoint,
      request,
      endpointQueryParameter: 'endpoint',
      path: router.url,
      // Provide authorization token and server id if they exist to the SPA-SDK initialization method.
      ...(authorizationToken ? { authorizationToken } : {}),
      ...(serverId ? { serverId } : {}),
    } as IndexComponent['configuration'];

    ...
  }
}
```

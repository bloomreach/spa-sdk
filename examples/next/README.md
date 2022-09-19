# Next.js SSR SPA

Example Next.js SPA using the Bloomreach Experience [React SDK](https://www.npmjs.com/package/@bloomreach/react-sdk).  The app uses
unversal framework [Next.js](https://github.com/zeit/next.js) for creating
isomorphic React applications.

## Install and run
```bash
npm ci
npm run dev
```

## Available scripts

In the project directory, you can run:

### `npm run dev`

Runs the app in the development mode. Open <http://localhost:3000> to view
it in the browser.

The page will reload if you make edits. You will also see any lint errors in the
console.

### `npm run build`

Builds the app for production to the `build` folder. It correctly bundles React
in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes. Your app is ready
to be deployed!

### `npm run start`

Runs the app in the production mode. This will start an express server to serve
the app from the `build` folder. This requires the app to have been build first
by running `npm run build`.

## Requesting & persisting user consent
Personalization is handled via a separate package [npm package](https://www.npmjs.com/package/@bloomreach/segmentation) such that you can easily exclude it if you don't plan to use it.

## Personalization
Personalization requires an Exponea account. Once you have that set up, you can fetch a project id for which you can enable personalization.

In order to initialize the personalization package, you will need to provide the *project id* as an *environment variable*:
`NEXT_PUBLIC_EXPONEA_PROJECT_TOKEN` - with Exponea project token, and `NEXT_PUBLIC_EXPONEA_API_URL` - with Exponea API endpoint.

If further customization is needed, please note that all logic regarding cookie consent popup and executing personalization is located in the `./utils/cookieconsent.ts` file.
Simply inject `./components/CookieConsent.tsx` into the application bootstrapping sequence in order to enable personalization. See `./pages/[[...route]].tsx` for an example.

## Persist preview data for pages without SDK instance
If you are using the SPA SDK selectively on certain pages, you will need to persist the preview related data when navigating between pages that have and those that don't have a SDK instance. The easiest way to achieve this result is by making use of the cookie storage as illustrated below.

The following snippet of the code shows the possible implementation of the `getServerSideProps` function for SPA-SDK application. Read preview data from the query string and save it to the cookies for the following restoring that data if it not available in a query string. Extend configuration object for the `initialize` function with preview data (`authorizationToken` and `serverId`). To manage cookies you could use `cookies-next` library or any other library.

### Important notes
* The preview site should be served on a separate domain compared to the live site to avoid saving preview related cookies for the live site.
* In case, when the first page which is loading in preview doesn't use SPA SDK you should parse query parameters and save preview related data to the cookies by yourself.

```typescript

import { setCookies, getCookies } from 'cookies-next';

export const getServerSideProps: GetServerSideProps = async ({
  req: request,
  res: response,
  resolvedUrl: path,
  query, // An object representing the query string
}) => {
  relevance(request, response);

  const PREVIEW_TOKEN_KEY = 'token';
  const PREVIEW_SERVER_ID_KEY = 'server-id';
  // Read a token and server id from the query string
  const queryToken = query[PREVIEW_TOKEN_KEY] as string;
  const queryServerId = query[PREVIEW_SERVER_ID_KEY] as string;

  const cookies = getCookies({ req: request, res: response });

  // Make priority to values from query string because in cookies they might be outdated.
  const authorizationToken = queryToken ?? cookies[PREVIEW_TOKEN_KEY];
  const serverId = queryServerId ?? cookies[PREVIEW_SERVER_ID_KEY];

  // Save the values from the query string to have ability to restore them when switch back from legacy page to the SPA-SDK rendered page.
  if (queryToken) setCookies(PREVIEW_TOKEN_KEY, queryToken, { req: request, res: response });
  if (queryServerId) setCookies(PREVIEW_SERVER_ID_KEY, queryServerId, { req: request, res: response });

  const configuration = {
    path,
    endpoint: process.env.BRXM_ENDPOINT,
    // Provide authorization token and server id if they exist to the SPA-SDK initialization method.
    ...(authorizationToken ? { authorizationToken } : {}),
    ...(serverId ? { serverId } : {}),
  };
  const page = await initialize({ ...configuration, request, httpClient: axios });

  return { props: { configuration, page: page.toJSON() } };
};
```

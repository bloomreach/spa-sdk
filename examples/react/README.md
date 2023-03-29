# React CSR SPA

Example React SPA using the Bloomreach [React SDK](https://www.npmjs.com/package/@bloomreach/react-sdk). The app is created
using [create-react-app](https://github.com/facebook/create-react-app).

## Install and run

```bash
npm ci
npm run start
```

## Available scripts

In the project directory, you can run:

### `npm run start`

Runs the app in the development mode. Open <http://localhost:3000> to view
it in the browser.

The page will reload if you make edits. You will also see any lint errors in the
console.

### `npm run build`

Builds the app for production to the `build` folder. It correctly bundles React
in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes. Your app is ready
to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment)
for more information.

### `npm run start`

Runs the app in the production mode. This will start an express server to serve
the app from the `build` folder. This requires the app to have been build first
by running `npm run build`.

## Persist preview data for pages without SDK instance
If you are using the SPA SDK selectively on certain pages, you will need to persist the preview related data when navigating between pages that have and those that don't have a SDK instance. The easiest way to achieve this result is by making use of the cookie storage as illustrated below.

The following snippet of the code shows the possible implementation of the function which is a enter point for SPA-SDK application. Read preview data from the query string and save it to the cookies for the following restoring that data if it not available in a query string. Extend configuration object for the `initialize` function with preview data (`authorizationToken` and `serverId`). To manage cookies you could use `cookie` library or any other library.

### Important notes
* The preview site should be served on a separate domain compared to the live site to avoid saving preview related cookies for the live site.
* In case, when the first page which is loading in preview doesn't use SPA SDK you should parse query parameters and save preview related data to the cookies by yourself.


```typescript
import cookie from 'cookie';

export default function App({ location }: RouteComponentProps): JSX.Element {
  const PREVIEW_TOKEN_KEY = 'token';
  const PREVIEW_SERVER_ID_KEY = 'server-id';
  // Read a token and server id from the query string
  const searchParams = new URLSearchParams(location.search);
  const queryToken = searchParams.get(PREVIEW_TOKEN_KEY);
  const queryServerId = searchParams.get(PREVIEW_SERVER_ID_KEY);

  const cookies = cookie.parse(document.cookie);

  // Make priority to values from query string because in cookies they might be outdated.
  const authorizationToken = queryToken ?? cookies[PREVIEW_TOKEN_KEY];
  const serverId = queryServerId ?? cookies[PREVIEW_SERVER_ID_KEY];

  // Save the values from the query string to have ability to restore them when switch back from legacy page to the SPA-SDK rendered page.
  if (queryToken) document.cookie = cookie.serialize(PREVIEW_TOKEN_KEY, queryToken);
  if (queryServerId) document.cookie = cookie.serialize(PREVIEW_SERVER_ID_KEY, queryServerId);

  const configuration = {
    endpoint: process.env.REACT_APP_BRXM_ENDPOINT,
    httpClient: axios,
    path: `${location.pathname}${location.search}`,
    // Provide authorization token and server id if they exist to the SPA-SDK initialization method.
    ...(authorizationToken ? { authorizationToken } : {}),
    ...(serverId ? { serverId } : {}),
  };
  const mapping = { Banner, Content, 'News List': NewsList, 'Simple Content': Content };

  return (
    <BrPage configuration={configuration} mapping={mapping}>
    {/**/}
    </BrPage>
  );
};
```

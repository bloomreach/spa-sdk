# Nuxt.js SSR SPA
Example Vue.js SPA using the Bloomreach Experience [Vue.js SDK](https://www.npmjs.com/package/@bloomreach/vue-sdk).  This project was
generated with [create-nuxt-app](https://nuxtjs.org/guide/installation/).

## Install and run
```bash
npm ci
npm run dev
```
## Available scripts
In the project directory, you can run:

### Development server
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Launch
```bash
npm run start
```

### Generate static project
```bash
npm run generate
```

### Run linter
```bash
npm run lint
```

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).

## Requesting & persisting user consent
Personalization is handled via a separate package [npm package](https://www.npmjs.com/package/@bloomreach/segmentation) such that you can easily exclude it if you don't plan to use it.

## Personalization
Personalization requires an Exponea account. Once you have that set up, you can fetch a project id for which you can enable personalization.

In order to initialize the personalization package, you will need to provide the *project id* as an *environment variable*:
`NUXT_APP_EXPONEA_PROJECT_TOKEN` - with Exponea project token, and `NUXT_APP_EXPONEA_API_URL` - with Exponea API endpoint.

If further customization is needed, please note that all logic regarding cookie consent popup and executing personalization is located in the `./utils/cookieconsent.ts` file.
Simply inject `./components/BrCookieConsent.vue` into the application bootstrapping sequence in order to enable personalization. See `./pages/_.vue` for an example.

## Persist preview data for pages without SDK instance
If you are using the SPA SDK selectively on certain pages, you will need to persist the preview related data when navigating between pages that have and those that don't have a SDK instance. The easiest way to achieve this result is by making use of the cookie storage as illustrated below.

The following snippet of the code shows the possible implementation of the `asyncData` function for SPA-SDK application. Read preview data from the query string and save it to the cookies for the following restoring that data if it not available in a query string. Extend configuration object for the `initialize` function with preview data (`authorizationToken` and `serverId`). To manage cookies you could use `cookie-universal-nuxt` library or any other library.

### Important notes
* The preview site should be served on a separate domain compared to the live site to avoid saving preview related cookies for the live site.
* In case, when the first page which is loading in preview doesn't use SPA SDK you should parse query parameters and save preview related data to the cookies by yourself.


Add `cookie-universal-nuxt` to `nuxt.config.js`:
```json
{
  ...
  modules: ['cookie-universal-nuxt'],
  ...
}
```

```javascript
@Component({
  async asyncData(context) {
    const PREVIEW_TOKEN_KEY = 'token';
    const PREVIEW_SERVER_ID_KEY = 'server-id';
    // Read a token and server id from the query string
    const queryToken = context.query[PREVIEW_TOKEN_KEY];
    const queryServerId = context.query[PREVIEW_SERVER_ID_KEY];

    // Make priority to values from query string because in cookies they might be outdated.
    const authorizationToken = queryToken ?? context.app.$cookies.get(PREVIEW_TOKEN_KEY);
    const serverId = queryServerId ?? context.app.$cookies.get(PREVIEW_SERVER_ID_KEY);

    // Save the values from the query string to have ability to restore them when switch back from legacy page to the SPA-SDK rendered page.
    if (queryToken) context.app.$cookies.set(PREVIEW_TOKEN_KEY, queryToken);
    if (queryServerId) context.app.$cookies.set(PREVIEW_SERVER_ID_KEY, queryServerId);

    const configuration = {
      baseUrl: process.env.BASE_URL !== '/' ? process.env.BASE_URL : '',
      endpoint: process.env.VUE_APP_BRXM_ENDPOINT,
      path: context.route.fullPath,
      visitor: context.nuxtState?.visitor,
      // Provide authorization token and server id if they exist to the SPA-SDK initialization method.
      ...(authorizationToken ? { authorizationToken } : {}),
      ...(serverId ? { serverId } : {}),
    };
  }
})
export default class App extends Vue {
  ...
}
```

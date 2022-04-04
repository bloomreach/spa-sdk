# Vue CSR SPA
Example Vue.js SPA using the Bloomreach Experience [Vue.js SDK](https://www.npmjs.com/package/@bloomreach/vue-sdk).  This project was
generated with [Vue CLI](https://cli.vuejs.org/).

## Install and run
```bash
yarn
yarn serve --port=3000
```

## Available scripts
In the project directory, you can run:

### Compiles and hot-reloads for development
```bash
yarn serve
```

### Compiles and minifies for production
```bash
yarn build
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## Requesting & persisting user consent
Personalization is handled via a separate package [npm package](https://www.npmjs.com/package/@bloomreach/segmentation) such that you can easily exclude it if you don't plan to use it.

## Personalization
Personalization requires an Exponea account. Once you have that set up, you can fetch a project id for which you can enable personalization.

In order to initialize the personalization package, you will need to provide the *project id* as an *environment variable*:
`VUE_APP_EXPONEA_PROJECT_TOKEN` - with Exponea project token, and `VUE_APP_EXPONEA_API_URL` - with Exponea API endpoint.

If further customization is needed, please note that all logic regarding cookie consent popup and executing personalization is located in the `./src/utils/cookieconsent.ts` file.
Simply inject `./src/components/BrCookieConsent.vue` into the application bootstrapping sequence in order to enable personalization. See `./src/App.vue` for an example.

## Persist preview data for pages without SDK instance
If you are using the SPA SDK selectively on certain pages, you will need to persist the preview related data when navigating between pages that have and those that don't have a SDK instance. The easiest way to achieve this result is by making use of the cookie storage as illustrated below.

The following snippet of the code shows the possible implementation of the `data` function for SPA-SDK application. Read preview data from the query string and save it to the cookies for the following restoring that data if it not available in a query string. Extend configuration object for the `initialize` function with preview data (`authorizationToken` and `serverId`). To manage cookies you could use `cookie` library or any other library.

### Important notes
* The preview site should be served on a separate domain compared to the live site to avoid saving preview related cookies for the live site.
* In case, when the first page which is loading in preview doesn't use SPA SDK you should parse query parameters and save preview related data to the cookies by yourself.


```javascript
import cookie from 'cookie';

@Component({
  data(this: App) {
    const PREVIEW_TOKEN_KEY = 'token';
    const PREVIEW_SERVER_ID_KEY = 'server-id';
    // Read a token and server id from the query string
    const queryToken = this.$route.query[PREVIEW_TOKEN_KEY] as string;
    const queryServerId = this.$route.query[PREVIEW_SERVER_ID_KEY] as string;

    const cookies = cookie.parse(document.cookie);

    // Make priority to values from query string because in cookies they might be outdated.
    const authorizationToken = queryToken ?? cookies[PREVIEW_TOKEN_KEY];
    const serverId = queryServerId ?? cookies[PREVIEW_SERVER_ID_KEY];

    // Save the values from the query string to have ability to restore them when switch back from legacy page to the SPA-SDK rendered page.
    if (queryToken) document.cookie = cookie.serialize(PREVIEW_TOKEN_KEY, queryToken);
    if (queryServerId) document.cookie = cookie.serialize(PREVIEW_SERVER_ID_KEY, queryServerId);

    return {
      configuration: {
        baseUrl: process.env.BASE_URL !== '/' ? process.env.BASE_URL : '',
        endpoint: process.env.VUE_APP_BRXM_ENDPOINT,
        endpointQueryParameter: 'endpoint',
        httpClient: axios,
        path: this.$route.fullPath,
        // Provide authorization token and server id if they exist to the SPA-SDK initialization method.
        ...(authorizationToken ? { authorizationToken } : {}),
        ...(serverId ? { serverId } : {}),
      },
      mapping: {
        Banner,
        Content,
        menu: Menu,
        'News List': NewsList,
        'Simple Content': Content,
      },
    };
  },
})
export default class App extends Vue {
  ...
}
```

# Nuxt.js SSR SPA
Example Vue.js SPA using the Bloomreach Experience [Vue.js SDK](https://www.npmjs.com/package/@bloomreach/vue-sdk).  This project was
generated with [create-nuxt-app](https://nuxtjs.org/guide/installation/).

## Install and run
```bash
yarn
yarn dev
```
## Available scripts
In the project directory, you can run:

### Development server
```bash
yarn dev
```

### Build
```bash
yarn build
```

### Launch
```bash
yarn start
```

### Generate static project
```bash
yarn generate
```

### Run linter
```bash
yarn lint
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

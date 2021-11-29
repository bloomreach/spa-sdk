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

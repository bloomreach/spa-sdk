# Angular CSR/SSR SPA

Example Angular SPA using the Bloomreach Experience [Angular SDK](https://www.npmjs.com/package/@bloomreach/ng-sdk).  This project was
generated with [Angular CLI](https://github.com/angular/angular-cli).

## Install and run
```bash
yarn
yarn start
```

## Available scripts

In the project directory, you can run:

### Development server

Run `yarn start` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

For Angular Universal application, you can use `yarn dev:ssr`.

### Code scaffolding

Run `yarn ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

### Build

Run `yarn build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

### Launch

Run `yarn start:ssr` to start Angular Universal application.

## Requesting & persisting user consent
Personalization is handled via a separate package [npm package](https://www.npmjs.com/package/@bloomreach/segmentation) such that you can easily exclude it if you don't plan to use it.

## Personalization
Personalization requires an Exponea account. Once you have that set up, you can fetch a project id for which you can enable personalization.

In order to initialize the personalization package, you will need to provide the *project id* as an *environment variable*:
`exponeaProjectToken` - with Exponea project token, and `exponeaApiUrl` - with Exponea API endpoint.

If further customization is needed, please note that all logic regarding cookie consent popup and executing personalization is located in the `./src/app/utils/cookieconsent.ts` file.
Simply inject `./src/app/cookie-consent/cookie-consent.component.ts` into the application bootstrapping sequence in order to enable personalization. See `./src/app/index/index.component.html` for an example.

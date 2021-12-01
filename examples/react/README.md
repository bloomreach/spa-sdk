# React CSR SPA

Example React SPA using the Bloomreach [React SDK](https://www.npmjs.com/package/@bloomreach/react-sdk). The app is created
using [create-react-app](https://github.com/facebook/create-react-app).

## Install and run

```bash
yarn
yarn start
```

## Available scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode. Open <http://localhost:3000> to view
it in the browser.

The page will reload if you make edits. You will also see any lint errors in the
console.

### `yarn build`

Builds the app for production to the `build` folder. It correctly bundles React
in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes. Your app is ready
to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment)
for more information.

### `yarn start`

Runs the app in the production mode. This will start an express server to serve
the app from the `build` folder. This requires the app to have been build first
by running `yarn build`.


## Requesting & persisting user consent
Personalization is handled via a separate package [npm package](https://www.npmjs.com/package/@bloomreach/segmentation) such that you can easily exclude it if you don't plan to use it.

## Personalization
Personalization requires an Exponea account. Once you have that set up, you can fetch a project id for which you can enable personalization.

In order to initialize the personalization package, you will need to provide the *project id* as an *environment variable*:
`REACT_APP_EXPONEA_PROJECT_TOKEN` - with Exponea project token, and `REACT_APP_EXPONEA_API_URL` - with Exponea API endpoint.

If further customization is needed, please note that all logic regarding cookie consent popup and executing personalization is located in the `./src/utils/cookieconsent.ts` file.
Simply inject `./src/components/CookieConsent.tsx` into the application bootstrapping sequence in order to enable personalization. See `./src/App.tsx` for an example.

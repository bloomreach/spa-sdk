# Next.js SSR SPA

Example Next.js SPA using the Bloomreach Experience [React SDK](https://www.npmjs.com/package/@bloomreach/react-sdk).  The app uses
unversal framework [Next.js](https://github.com/zeit/next.js) for creating
isomorphic React applications.

## Install and run
```bash
yarn
yarn dev
```

## Available scripts

In the project directory, you can run:

### `yarn dev`

Runs the app in the development mode. Open <http://localhost:3000> to view
it in the browser.

The page will reload if you make edits. You will also see any lint errors in the
console.

### `yarn build`

Builds the app for production to the `build` folder. It correctly bundles React
in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes. Your app is ready
to be deployed!

### `yarn start`

Runs the app in the production mode. This will start an express server to serve
the app from the `build` folder. This requires the app to have been build first
by running `yarn build`.

## Requesting & persisting user consent
Personalization is handled via a separate package [npm package](https://www.npmjs.com/package/@bloomreach/segmentation) such that you can easily exclude it if you don't plan to use it.

## Personalization
Personalization requires an Exponea account. Once you have that set up, you can fetch a project id for which you can enable personalization.

In order to initialize the personalization package, you will need to provide the *project id* as an *environment variable*:
`NEXT_PUBLIC_EXPONEA_PROJECT_TOKEN` - with Exponea project token, and `NEXT_PUBLIC_EXPONEA_API_URL` - with Exponea API endpoint.

If further customization is needed, please note that all logic regarding cookie consent popup and executing personalization is located in the `./utils/cookieconsent.ts` file.
Simply inject `./components/CookieConsent.tsx` into the application bootstrapping sequence in order to enable personalization. See `./pages/[[...route]].tsx` for an example.

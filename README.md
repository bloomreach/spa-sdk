# Bloomreach SPA SDKs

## Introduction

This workspace contains the libraries that can be used to develop an SPA in
combination with Bloomreach.

The SDKs are located under the `packages` folder and example SPAs are located in
the `examples` folder for each of the supported frameworks. See the READMEs of
the respective packages for more detailed information.

The SDKs:

- [SPA SDK](./packages/spa-sdk/README.md)
- [React SDK](./packages/react-sdk/README.md)
- [Vue SDK](./packages/vue-sdk/README.md)
- [Angular SDK](./packages/ng-sdk/README.md)

The examples:

- [React CSR example](./examples/react/README.md)
- [Next.js example](./examples/next/README.md)
- [Vue CSR example](./examples/vue/README.md)
- [Angular CSR/Universal example](./examples/angular/README.md)

### Bloomreach support

The latest SPA SDK versions support both the Paas and Saas backends from
Bloomreach. For more information please read [the latest developer](https://documentation.bloomreach.com/developers/content/tutorials/get-started.html)
guides on the documentation website.

### Framework support

The supported frameworks are currently:

- React and Next.js
- Vue (3)
- Angular and Angular Universal

The versions of these frameworks that the SDKs currently is verified to work
with are indicated in the release notes of each package and the minimum required
versions are set in the `package.json` files of the respective packages.

## SPA SDK and Framework SDKs

The integration between an SPA and Bloomreach Content is achieved by using a
Framework SDK which itself has the SPA SDK as a dependency. Depending on the use
case one might import interfaces or functions from the SPA SDK directly.

The SPA SDK itself is written in typescript and is framework independent, it
holds the core code that sets up a connection to the Page Model API of the
Bloomreach Content instance. When initializing it will use the provided
configuration to do a call to the PMA and transform the response from a
PageModel to a Page object that provides methods to easily query and work with
the model. The SPA SDK also automatically detects whether it is in preview mode
and sets up the connection with the Bloomreach Experience Manager Preview if
that is the case. The Framework SDKs use this Page object to derive what needs
to be rendered on the page.

In short the SPA SDK contains:

- Page Model API Client
- Page Model Javascript implementation
- URL Generator
- Integration with Bloomreach Experience Manager Preview

and the Framework SDK contains:

- HTTP Client
- Framework specific components that render the required DOM

## Development

### NPM + Lerna-lite + Yalc

The repository contains multiple self-contained npm packages that also depend
on other packages in the repository. To easily manage the dependencies between
them and execute commands taking into account topological order we use
[lerna-lite](https://github.com/ghiscoding/lerna-lite) to manage its packages
and builds, however we do not use the `bootstrap` mechanism of lerna as it
caused duplicate framework instances when symlinking the dependencies. Instead
we use [Yalc](https://github.com/wclr/yalc) to (optionally) link the
dependencies.
 
This lerna workspace configuration is located in [lerna.json](./lerna.json).

#### Installation

Installation of the dependencies of all the workspaces is done by running `npm
ci` in the root of the workspace. 

Running `npm run build` will not only build all packages but also link them
together such that you can develop packages locally without having to publish
'prerelease' versions.

Running `npm run dev` in the root of the monorepo will watch each SDK package
and build and `yalc push` it when changes happen. Combining this with running
the dev server for one of the example apps allows for live development with any
SDK.

#### Commands

You can also use the lerna cli to run commands if you require topological
ordering such as `npx lerna run build --scope @bloomreach/example-react
--include-dependencies` which wil build example-react as well as its dependency
structure.

The root workspace commands are straightforward and are listed in the
[package.json](./package.json) scripts property.

#### Branches

There is the `main` branch which is protected and requires MR's to recieve
changes, it should only contain those changes/commits that are actually in a
released version of the SPA SDKs.

There is also the `development` branch which should be used as the baseline for
any other working branches.

Generally speaking for any kind of development one would:

* Branch the `development` branch to a new branch e.g. `mybranch`
* Do work on `mybranch` until finished
* Create an MR of `mybranch` to be merged into `development`
* Create a test release if it has to be published to `npm` for test purposes
   but use `prerelease` strategy and use `dist-tag` that mentions jira ticket or
   general effort for easier recognition by running `npm run release -- prerelease --dist-tag [your Jira issue / effort name]`
* Get reviews & approval
* After the pipelines are green: merge the MR to `development`

## Releasing
#### Prerequisites
* You need access to the npm @bloomreach organization and rights to publish packages
* You need access to the heroku dashboard and rights to deploy apps
* You need access to the SPA SDK Jira project to manage releases

#### Steps
Pre release actions:
* Check if issues mentioned in the commits since the last release have the fixVersion assigned as the version you are about to release
* Check if all issues in the upcoming release are closed, any open issues must be moved to a different release, or the
    release must be postponed
* Check out the `development` branch and make sure your local branch its up to date and the pipeline for `development` is green
* Make sure that running `npm run docs` can be done succesfully

Release actions:
* Run `npm run bump` in the workspace root to update the versions in all package files
* Commit these version changes with `git commit -am "[your Jira issue] Bumping versions to [new version]"`
* Create a new _annotated_ tag on the `development` branch using `git tag -a spa-sdk-[new-version]`
* Push to `origin` with `git push --follow-tags`
* Make MR to the `main` branch and merge it after approve

Post release actions:
* Check that release pipeline is green
* Check that all example apps have been deployed to Heroku
* Set the Jira release version as released
* Create release notes on github
* Check that Documentation Portal has been deployed correctly to [github pages](https://bloomreach.github.io/spa-sdk/docs/)
* Check that TypeDoc has been deployed correctly to [github pages](https://bloomreach.github.io/spa-sdk/)

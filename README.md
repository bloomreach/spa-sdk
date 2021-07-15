# Bloomreach SPA SDKs

## Introduction

This workspace contains the libraries that can be used to develop an SPA in
combination with Bloomreach Content.

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
- [Nuxt.js example](./examples/nuxt/README.md)
- [Angular CSR/Universal example](./examples/angular/README.md)

### Bloomreach support

The latest SPA SDK versions support both the Paas and Saas backends from
Bloomreach.  For more information please read [the latest developer](https://documentation.bloomreach.com/developers/content/tutorials/get-started.html)
guides on the documentation website.

### Framework support

The supported frameworks are currently:
- React and Next.js
- Vue and Nuxt.js
- Angular and Angular Universal

The versions of these frameworks that the SDKs currently is verified to work
with are indicated in the [release notes](http://todo/insert/link/here) and the
minimum required versions are set in the `package.json` files of the respective
packages.

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
- Page Model parser
- Page Model Javascript implementation
- Integration with Bloomreach Experience Manager Preview

and the Framework SDK contains:
- HTTP Client
- Framework specific components that render the required DOM

## Development

### Yarn workspace

Due to the correlated nature of the packages it was decided to choose
[yarn](https://yarnpkg.com/) as a package manager because of its
[workspaces](https://yarnpkg.com/features/workspaces) feature.

This yarn workspace configuration is located in the root
[package.json](./package.json). The workspace actually uses yarn 2 / berry and
will locally install this yarn version upon running the`yarn` command. You would
still have a yarn v1 global install to run the commands.

#### Installation

Installation of the dependencies of all the workspaces is done by running `yarn`
in the root of the workspace. This will also symlink all the related packages.
To have correct compilation of the packages you therefore also need to run the
`yarn build` command to create the `dist` output of each package that others
would depend on.

#### Commands

Its recommended to use the yarn workspace command to run any of the package.json
scripts in the workspaces. e.g. `yarn workspace @bloomreach/spa-sdk build`

The root workspace commands are straightforward and are listed in the
[package.json](./package.json) scripts property.

#### Branches

There is the `main` branch which is protected and requires MR's to recieve
changes, it should only contain those changes/commits that are actually in a
released version of the SPA SDKs.

There is also the `development` branch which should be used as the baseline for
any other working branches.

Generally speaking for any kind of development one would:
1. branch the `development` branch to a new branch e.g. `mybranch`
2. do work on `mybranch` until finished
3. create an MR of `mybranch` to be merged into `development`
4. get reviews & approval
5. After the pipelines are green: merge the MR

## Releasing

The release process is a continuation of the above where a Jenkinspipeline would:
1. Run the build pipeline and if successful
2. Run `yarn bump someVersion` to update the versions in all package files
3. Auto generate a changelog
4. Commit these changes
5. Attempt to publish the packages to the npm registry and if successful
6. Set a tag `spa-sdk-someVersion` on the `main` branch
7. Push the new tag to the Github mirror

If this pipeline is successful a dev would then manually create a release on Gitlab and Github with release notes.

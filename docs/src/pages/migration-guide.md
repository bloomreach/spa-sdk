---
layout: "/src/layouts/MainLayout.astro"
---

# Migration guide

Below is a set of instructions that need to be taken into account when migrating from older versions. They are listed in
reverse order with the latest release on top, so please make sure to scroll down to find the version you are upgrading
from and follow it from there. Versions that did not require any upgrade steps are not listed.

## v22

The import path to the relevance module must be updated from @bloomreach/spa-sdk/lib/express to
@bloomreach/spa-sdk/dist/express

## v21

Removed the `sanitize` method from the `Page` object to reduce the size of the library. We strongly recommend that you
sanitize any HTML content returned in the page model. Before the removal of the sanitize method, we used the
`sanitize-html` package in the SDK for this purpose. You can now use your preferred sanitation libraries or techniques
based on your project requirements. Make sure to preserve the `data-type` attribute on links in the rich content fields
when sanitizing as it lets the SDK determine which links are external and which are internal when using the `rewriteLinks`
method.

The Page Delivery `apiVersion` is no longer set by default because it always required a second HTTP request. The result is
that for Bloomreach customers that use version brxm 14.7 will need to explicitly set apiVersion to PDA 1.0 in the SDK
configuration if they want to use / were using 1.0 (PDA 0.9 is used by default in brxm 14.7). For more information see
[the brxm documentation](https://xmdocumentation.bloomreach.com/library/concepts/page-model-api/configuration.html).

Removed the endpointQueryParameter option from configuration, this should not be used by consuming apps as it was used
to enable 'multi-tenant' mode for the example apps which for any production site is a security risk.

Reverted the changes introduced in 18.0.0:

- Page.rewriteLinks now returns string again instead of Promise
- Removed the prepareHTML method and the useHTML React hook as they were created to easily combine the sanitize method
  with the rewriteLinks method. With the removal of the `sanitize` method, they are no longer useful additions.

Reverted the changes introduced in 18.0.1:

- `initialize` now returns Page | Promise again instead of Promise

The reason for reverting these changes is to support SSR in React and Vue. The asynchronous nature of the previously introduced changes conflicted with the synchronous nature of the React and Vue SSR APIs.

## v20, v19, v18, v17

**These versions are deprecated and should not be used.** Please look at the steps for [v21](#v21) if you are upgrading
from these versions.

## v16

BrProps interface Page and Component properties can now be undefined be sure to adjust the typescript components
consuming these to avoid breaking builds / type checks.

---
layout: "/src/layouts/MainLayout.astro"
title: "Getting started"
---

# Getting started

The Bloomreach SPA SDKs make life considerably easier when integrating the Content Delivery APIs in your app, it also
provides automatic integration with the Bloomreach Experience Manager which is a Visual Page Builder for business users.

The SDKs consists of a core plain javascript/typescript SDK `@bloomreach/spa-sdk` and a set of framework specific SDKs
`@bloomreach/react-sdk`, `@bloomreach/vue-sdk`, `@bloomreach/vue3-sdk` and `@bloomreach/ng-sdk` which extend the core
SDK with the framework specific rendering logic.

The SPA SDK itself is written in typescript and is framework independent, it holds the core code that sets up a
connection to the Page Delivery API of the Bloomreach Content instance. When initializing it will use the provided
configuration to do a call to the PDA and transform the response from a PageModel to a Page object that provides methods
to easily query and work with the model. See the SPA SDK documentation for more information. The SPA SDK also
automatically detects whether it is in `preview` mode and sets up the connection with the Bloomreach Experience Manager
Preview if that is the case. The Framework SDKs use this Page object to derive what needs to be rendered on the page and
use the framework specific lifecylces and rendering hooks to dynamically render out the page components.

In short the core SPA SDK contains:

- Page Delivery API Client
- Page Model Javascript implementation
- URL Generator
- Integration with Bloomreach Experience Manager Preview

and the Framework SDK contains:

- HTTP Client
- Framework specific components that render provided components

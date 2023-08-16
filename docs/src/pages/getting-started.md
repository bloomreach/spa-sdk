---
layout: '/src/layouts/MainLayout.astro'
---

# Getting started 

The integration between an SPA and Bloomreach Content is achieved by using a
Framework SDK which itself has the SPA SDK as a dependency. Depending on the
use case one might import interfaces or functions from the SPA SDK directly.

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
* Page Model API Client
* Page Model Javascript implementation
* URL Generator
* Integration with Bloomreach Experience Manager Preview

and the Framework SDK contains:
* HTTP Client
* Framework specific components that render the required DOM

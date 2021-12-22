# Bloomreach SPA SDK

Bloomreach SPA SDK provides simplified headless integration with [Bloomreach Experience Manager](https://www.bloomreach.com/en/products/experience-manager)
for JavaScript-based applications. This library interacts with the [Page Model API](https://documentation.bloomreach.com/library/concepts/page-model-api/introduction.html)
and exposes a simplified and framework-agnostic interface over the page model.

## Features

- Page Model API Client
- Page Model Javascript implementation
- URL Generator
- Integration with Bloomreach Experience Manager Preview

## Get Started

### Installation

To get the SDK into your project with [NPM](https://docs.npmjs.com/cli/npm):

```bash
npm install @bloomreach/spa-sdk
```

And with [Yarn](https://yarnpkg.com):

```bash
yarn add @bloomreach/spa-sdk
```

### Usage

The following code snippet requests a related page model and shows the page's title.

```javascript
import axios from "axios";
import { initialize } from "@bloomreach/spa-sdk";

async function showPage(path) {
  const page = await initialize({
    // The path to request from the Page Model API, should include query
    // parameters if those are present in the url
    path,
    // The location of the Page Model API of the brX channel
    endpoint: "http://localhost:8080/delivery/site/v1/channels/brxsaas/pages",
    // The httpClient used to make requests
    httpClient: axios,
  });

  document.querySelector("#title").innerText = page.getTitle();
}

showPage(`${window.location.pathname}${window.location.search}`);
```

### Relevance Integration

(not applicable to Content SaaS)

The SDK provides basic [Express
middleware](https://expressjs.com/en/guide/using-middleware.html) for seamless
integration with [the Relevance Module](https://documentation.bloomreach.com/14/library/enterprise/enterprise-features/targeting/targeting.html).

```javascript
import express from "express";
import { relevance } from "@bloomreach/spa-sdk/lib/express";

const app = express();

app.use(relevance);
```

The middleware can be customized using the `withOptions` method.

```javascript
app.use(relevance.withOptions({ name: "_visitor", maxAge: 24 * 60 * 60 }));
```

### Rendering HTML content safely

The SPA SDK provides an API, ```Page.sanitize(html)```,
which sanitizes HTML content using the [sanitize-html](https://www.npmjs.com/package/sanitize-html) library,
to render the HTML content safely.

For example, in a React example, you may sanitize and render the HTML content which came from the backend like the following example:

```
{/* Suppose the content.value below contains HTML markups string. */}
<div>
   {content && <div dangerouslySetInnerHTML={{ __html: page.rewriteLinks(page.sanitize(content.value)) }} />}
</div>
```

The same principle may apply in other frameworks. e.g, `v-html` in Vue.js or `[innerHTML]` in Angular.

## License

Published under [Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0) license.

## Reference

#### Configuration

The `initialize` function supports several options you may use to customize page initialization.

| Commonly used options                                                                                                                                                                                                                                                                                                |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`debug`** <br> The option enabling debug mode. <br><br> Required: no <br> Default: `false`                                                                                                                                                                                                                         |
| **`endpoint`** <br> Base URL of the Page Model API (e.g. `http://localhost:8080/delivery/site/v1/channels/brxsaas/pages` or `http://localhost:8080/site/channel/resourceapi`). This option is exclusive and should not be used together with `options` or `cmsBaseUrl` <br><br> Required: yes <br> Default: . _none_ |
| **`httpClient`** <br> The HTTP client that will be used to fetch the page model. Signature is similar to [Axios](https://github.com/axios/axios#axiosconfig) client. <br><br> Required: yes <br> Default: _none_                                                                                                     |
| **`path`** <br> The path part of the URL, **including a query string if present (e.g. `/path/to/page?foo=1`** <br><br> Required: no <br> Default: ) `/` .                                                                                                                                                            |
| **`origin`** <br> The brXM origin to verify an integration with the Experience Manager. This option should be used when the brXM is accessible from a host other than the Page Model API. By default, the origin from the `apiBaseUrl` or `endpoint` parameters is used. <br><br> Required: no <br> Default: _none_  |
| **`baseUrl`** <br> Base URL of the SPA (e.g. `/account` or `//www.example.com`). This option can only be used if `endpoint` is present. <br><br> Required: no <br> Default: `""`                                                                                                                                     |
| **`apiBaseUrl`** <br> Base URL of the Page Model API (e.g. `http://localhost:8080/delivery/site/v1/channels/brxsaas/pages` or `http://localhost:8080/site/channel/resourceapi`). This option will be ignored if `options` is present. <br><br> Required: no <br> Default: `cmsBaseUrl` + `"/resourceapi"`            |
| **`spaBaseUrl`** <br> Base URL of the SPA (e.g. `/account` or `//www.example.com`). This option will be ignored if `options` is present. <br><br> Required: no <br> Default: `""`                                                                                                                                    |

| Extra options
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`apiVersion`** <br> Current API version. By default, the compatible with the current setup version will be chosen. <br><br> Required: no <br> Default: _none_ |
| **`apiVersionHeader`** <br> API version header. <br><br> Required: `"Accept-Version"` <br> Default: _none_ |
| **`authorizationHeader`** <br> Authorization header for the Page Model API. <br><br> Required: no <br> Default: `"Authorization"` |
| **`authorizationQueryParameter`** <br> The query string parameter used to pass authorization header value. <br><br> Required: no <br> Default: `"token"` |
| **`authorizationToken`** <br> Authorization token for the Page Model API. By default, the SDK will try to extract the token from the request query string using `authorizationQueryParameter` option. <br><br> Required: no <br> Default: _none_ |
| **`endpointQueryParameter`** <br> The query string parameter used as the brXM endpoint (`cmsBaseUrl`). The option will be ignored if the `cmsBaseUrl` option is not empty. In case when this option is used, the `apiBaseUrl` will be prepended with the value from the query parameter. This option should be used only for testing or debugging. By default, the option is disabled. <br><br> Required: no <br> Default: _none_ |
| **`serverId`** <br> Cluster node identifier. By default, the SDK will try to extract the value from the request query string using `serverIdQueryParameter` option. <br><br> Required: no <br> Default: _none_ |
| **`serverIdHeader`** <br> Header identifying the current cluster node. <br><br> Required: no <br> Default: `"Server-Id"` |
| **`serverIdQueryParameter`** <br> The query string parameter used to pass a cluster node identifier. <br><br> Required: no <br> Default: `"server-id"` |
| **`window`** <br> A window object reference will be used to interact with brXM. It needs to be set when initialize is being called within an iframe or worker process. <br><br> Required: no <br> Default: `window` |

| Relevance options (PaaS-only)
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`visitor`** <br> An object holding information about the current visitor. The option takes precedence over `request.visitor` <br><br> Required: no <br> Default: . _none_ |
| **`visitor.id`** <br> The current visitor identifier. <br><br> Required: yes <br> Default: _none_ |
| **`visitor.header`** <br> An HTTP-header using to pass the visitor identifier to the Page Model API. <br><br> Required: yes <br> Default: _none_ |
| **`request`** <br> Current user's request. <br><br> Required: yes <br> Default: _none_ |
| **`request.connection`** <br> Current request remote connection containing the remote address. This option is used in [the Relevance Module](https://documentation.bloomreach.com/14/library/enterprise/enterprise-features/targeting/targeting.html) <br><br> Required: no <br> Default: . _none_ |
| **`request.emit`** <br> Emits an event in the request scope. This option can be used in [Node.js integration](https://nodejs.org/api/stream.html#stream_readable_streams) <br><br> Required: no <br> Default: . _none_ |
| **`request.headers`** <br> An object holding request headers. It should contain a `Cookie` header if rendering is happening on the server-side in the UrlRewriter-based setup. <br><br> Required: no <br> Default: `{}` |
| **`request.path`** <br> The path part of the URL, including a query string if present (e.g. `/path/to/page?foo=1`). The option is **deprecated** in favor of `path` <br><br> Required: no <br> Default: . `/` |
| **`request.visitor`** <br> An object holding information about the current visitor. <br><br> Required: no <br> Default: _none_ |

| These options are deprecated and will be removed in the next major release
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`cmsBaseUrl`** <br> Base URL of the site (e.g. `http://localhost:8080/site` or `http://localhost:8080/site/channel`). This option is exclusive and should not be used together with `options` or `endpoint` <br><br> Required: _exclusive_ <br> Default: . _none_ |
| **`options`** <br> The CMS URL options. This option is exclusive and should not be used together with `cmsBaseUrl` or `endpoint`. Use this property to enable the UrlRewriter-based setup. <br><br> Required: _exclusive_ <br> Default: _none_ |
| **`options.live`** <br> The CMS URL options for the live site. <br><br> Required: yes <br> Default: _none_ |
| **`options.live.apiBaseUrl`** <br> Base URL of the Page Model API for the live site (e.g. `http://localhost:8080/delivery/site/v1/channels/brxsaas/pages` or `http://localhost:8080/site/channel/resourceapi` <br><br> Required: no <br> Default: ) `options.live.cmsBaseUrl` + `"/resourceapi"` . |
| **`options.live.cmsBaseUrl`** <br> Base URL of the live site (e.g. `http://localhost:8080/site` or `http://localhost:8080/site/channel` <br><br> Required: yes <br> Default: ) _none_ . |
| **`options.live.spaBaseUrl`** <br> Base URL of the live SPA (e.g. `/account` or `//www.example.com` <br><br> Required: no <br> Default: ) `""` . |
| **`options.preview`** <br> The CMS URL options for the preview site. <br><br> Required: yes <br> Default: _none_ |
| **`options.preview.apiBaseUrl`** <br> Base URL of the Page Model API for the preview site (e.g. `http://localhost:8080/site/_cmsinternal/resourceapi` or `http://localhost:8080/site/_cmsinternal/channel/resourceapi` <br><br> Required: no <br> Default: ) `options`<br>`.preview.cmsBaseUrl` <br>+ `"/resourceapi"` . |
| **`options.preview.cmsBaseUrl`** <br> Base URL of the live site (e.g. `http://localhost:8080/site/_cmsinternal` or `http://localhost:8080/site/_cmsinternal/channel` <br><br> Required: yes <br> Default: ) _none_ . |
| **`options.preview.spaBaseUrl`** <br> Base URL of the live SPA (e.g. `/site/_cmsinternal?bloomreach-preview=true` or `/site/_cmsinternal/channel?bloomreach-preview=true`). This path and query string parameters will be used to detect whether it is a preview mode or not. <br><br> Required: no <br> Default: `""` |

#### Functions

| Function                                                                                  | Description                                                                                                                                                                                                                                    |
| ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `initialize(config, model?): Promise<Page>`                                               | This function accepts a configuration object as an argument and returns a promisified JavaScript object representing the page model. In case, when the page model has already been fetched, you can pass this JSON blob as a second parameter. |
| `destroy(page: Page): void`                                                               | Destroys the integration with the SPA page object.                                                                                                                                                                                             |
| `getContainerItemContent<T>(component: ContainerItem, page: Page): T \| null`             | Returns the content object that belongs to the container item, or null if not found.                                                                                                                                                           |
| `isPage(value): boolean`                                                                  | Checks whether a value is a page.                                                                                                                                                                                                              |
| `isComponent(value): boolean`                                                             | Checks whether a value is a page component.                                                                                                                                                                                                    |
| `isContainer(value): boolean`                                                             | Checks whether a value is a page container.                                                                                                                                                                                                    |
| `isContainerItem(value): boolean`                                                         | Checks whether a value is a page container item.                                                                                                                                                                                               |
| `isContent(value): boolean`                                                               | Checks whether a value is a content object.                                                                                                                                                                                                    |
| `isDocument(value): boolean`                                                              | Checks whether a value is a document object.                                                                                                                                                                                                   |
| `isImageSet(value): boolean`                                                              | Checks whether a value is an image set object.                                                                                                                                                                                                 |
| `isMenu(value): boolean`                                                                  | Checks whether a value is a menu object.                                                                                                                                                                                                       |
| `isMeta(value): boolean`                                                                  | Checks whether a value is a meta-data object.                                                                                                                                                                                                  |
| `isMetaComment(value): boolean`                                                           | Checks whether a value is a meta-data comment.                                                                                                                                                                                                 |
| `isPagination(value): boolean`                                                            | Checks whether a value is a pagination.                                                                                                                                                                                                        |
| `isLink(value): boolean`                                                                  | Checks whether a value is a link.                                                                                                                                                                                                              |
| `isReference(value): boolean`                                                             | Checks whether a value is a content reference.                                                                                                                                                                                                 |
| `relevance(request: IncomingMessage, response: OutgoingMessage, next?: () => void): void` | Express middleware for seamless integration with [the Relevance Module](https://documentation.bloomreach.com/14/library/enterprise/enterprise-features/targeting/targeting.html).                                                              |
| `relevance.withOptions(options?: Options): Handler`                                       | Customizes Express middleware for [the Relevance Module](https://documentation.bloomreach.com/14/library/enterprise/enterprise-features/targeting/targeting.html) integration.                                                                 |

#### Constants

| Constant                        | Description                                     |
| ------------------------------- | ----------------------------------------------- |
| `META_POSITION_BEGIN`           | Meta-data following before a page component.    |
| `META_POSITION_END`             | Meta-data following after a page component.     |
| `TYPE_CONTAINER_BOX`            | A blocked container with blocked items.         |
| `TYPE_CONTAINER_INLINE`         | A blocked container with inline items.          |
| `TYPE_CONTAINER_NO_MARKUP`      | A container without surrounding markup.         |
| `TYPE_CONTAINER_ORDERED_LIST`   | An ordered list container.                      |
| `TYPE_CONTAINER_UNORDERED_LIST` | An unordered list container.                    |
| `TYPE_CONTAINER_ITEM_UNDEFINED` | A container item without mapping.               |
| `TYPE_LINK_EXTERNAL`            | Link to a page outside the current application. |
| `TYPE_LINK_INTERNAL`            | Link to a page inside the current application.  |
| `TYPE_LINK_RESOURCE`            | Link to a CMS resource.                         |
| `TYPE_MANAGE_MENU_BUTTON`       | A manage menu button.                           |
| `TYPE_MANAGE_CONTENT_BUTTON`    | A manage content button.                        |

#### Objects

##### Page

The `Page` class represents the brXM page to render. This is the main entry point to the page model.

| Method                                                                                            | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `getButton(type: string, ...params: any[]): MetaCollection`                                       | Generates a meta-data collection for the Experience Manager buttons.                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `getChannelParameters(): object`                                                                  | Gets current channel parameters.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| <code>getComponent(...componentNames): Component &vert; undefined</code>                          | Gets a component in the page (e.g. `getComponent('main', 'right')`). If `componentNames` is omitted, then the page root component will be returned.                                                                                                                                                                                                                                                                                                                                                                  |
| <code>getContent<T>(reference: Reference &vert; string): Content &vert; T &vert; undefined</code> | Gets a content item used on the page.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| <code>getDocument<T>(): T &vert; undefined</code>                                                 | Gets the page root document. This option is available only along with the Experience Pages feature.                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `getMeta(meta): MetaCollection`                                                                   | Generates a meta-data collection from the provided `meta` model. The method is **deprecated** and will be removed in the next major release.                                                                                                                                                                                                                                                                                                                                                                         |
| <code>getTitle(): string &vert; undefined</code>                                                  | Gets the title of the page, or `undefined` if not configured.                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `getUrl(link?: Link): string`                                                                     | Generates a URL for a link object.<br> - If the link object type is internal, then it will prepend `spaBaseUrl` or `baseUrl`. In case when the link starts with the same path as in `cmsBaseUrl`, this part will be removed.<br> - If the link object type is unknown, then it will return `undefined`.<br> - If the link parameter is omitted, then the link to the current page will be returned.<br> - In other cases, the link will be returned as-is.                                                           |
| `getUrl(path: string): string`                                                                    | Generates an SPA URL for the path.<br> - If it is a relative path and `cmsBaseUrl` is present, then it will prepend `spaBaseUrl`.<br> - If it is an absolute path and `cmsBaseUrl` is present, then the behavior will be similar to internal link generation.<br> - If it is a relative path and `endpoint` is present, then it will resolve this link relative to the current page URL.<br> - If it is an absolute path and `endpoint` is present, then it will resolve this link relative to the `baseUrl` option. |
| <code> getVersion(): string &vert; undefined</code>                                               | Returns the Page Model version.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| <code>getVisitor(): Visitor &vert; undefined</code>                                               | Gets the current visitor information, or undefined if the [Relevance Module](https://documentation.bloomreach.com/library/enterprise/enterprise-features/targeting/targeting.html) is not enabled. The `Visitor` object consists of the following properties:<br> - `id: string` - the current visitor identifier;<br> - `header: string` - an HTTP-header using to pass the visitor identifier to the Page Model API.                                                                                               |
| <code>getVisit(): Visit &vert; undefined</code>                                                   | Gets the current visit information, or undefined if the [Relevance Module](https://documentation.bloomreach.com/library/enterprise/enterprise-features/targeting/targeting.html) is not enabled. The `Visit` object consists of the following properties:<br> - `id: string` - the current visit identifier;<br> - `new: boolean` - a flag showing that this is a new visit.                                                                                                                                         |
| `isPreview(): boolean`                                                                            | Returns whether the page is in the preview mode.                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `rewriteLinks(content: string, type?: string): string`                                            | Rewrite links to pages and resources in the HTML content. This method looks up for `a` tags with `data-type` and `href` attributes and `img` tags with `src` attribute. Links will be updated according to the configuration used to initialize the page. The `type` parameter is similar to `mimeType` parameter of the [DOMParser](https://developer.mozilla.org/en-US/docs/Web/API/DOMParser).                                                                                                                    |
| `sync(): void`                                                                                    | Synchronizes the brXM integration state (UI elements positions).                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `toJSON(): object`                                                                                | A plain JavaScript object of the page model.                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |

##### Component

The `Component` class corresponds to page nodes, and it may hold other components inside.

| Method                                                                             | Description                                      |
| ---------------------------------------------------------------------------------- | ------------------------------------------------ |
| `getId(): string`                                                                  | Returns the component id.                        |
| `getMeta(): MetaCollection`                                                        | Returns the component meta-data collection.      |
| `getModels(): object`                                                              | Returns the map of the component models.         |
| <code>getUrl(): string &vert; undefined</code>                                     | Returns the link to the partial component model. |
| `getName(): string`                                                                | Returns the name of the component.               |
| `getParameters(): object`                                                          | Returns the parameters of the component.         |
| `getProperties(): object`                                                          | Alias for `getParameters` method.         |
| `getChildren(): Component[]`                                                       | Returns the direct children of the component.    |
| <code>getComponent(...componentNames: string[]): Component &vert; undefined</code> | Looks up for a nested component.                 |
| <code>getComponentById(id: string): Component &vert; undefined</code>              | Looks up for a nested component by its id.       |

##### Container

The `Container` class represents a page node that is actually present in the DOM but as an element surrounding its children. Container extends the Component class, and therefore, all the [Component methods](#component) are applicable here.

| Method                                          | Description                                                                                                                                |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| <code>getType(): string &vert; undefined</code> | Returns the [type](https://documentation.bloomreach.com/library/concepts/template-composer/channel-editor-containers.html) of a container. |

##### Container Item

The `ContainerItem` objects are usually visible on the page and interact with the user. Container Item extends the Component class, and therefore, all the [Component methods](#component) are applicable here.

| Method                                                | Description                                                                                                                                    |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| <code>getLabel(): string &vert; undefined</code>      | Returns the label of a container item catalogue component.                                                                                     |
| <code>getType(): string &vert; undefined</code>       | Returns the type of a container item. The available types depend on which container items have been configured in the backend (e.g. "Banner"). |
| `isHidden(): boolean`                                 | Returns whether the component should not render anything. Hiding components is only possible with the Relevance feature.                       |
| `on(eventName: string, listener: Function): Function` | Subscribes for an event and returns the unsubscribe function.                                                                                  |
| `off(eventName: string, listener: Function): void`    | Unsubscribes from an event.                                                                                                                    |
| <code>getContentReference(): Reference &vert; undefined</code> | Returns a [RFC-6901](https://tools.ietf.org/html/rfc6901) JSON Pointer to the content of this container item.   |
| <code>getContent<T>(page: Page): T &vert; null;</code> | Returns the content of this component from the page that contains the content.   |

##### Content

The `Content` object holds document data that is used by the page components.

| Method                                            | Description                                                       |
| ------------------------------------------------- | ----------------------------------------------------------------- |
| `getId(): string`                                 | Returns the content id.                                           |
| <code>getLocale(): string &vert; undefined</code> | Returns the content locale.                                       |
| `getMeta(): MetaCollection`                       | Returns the content meta-data collection.                         |
| `getName(): string`                               | Returns the content name.                                         |
| `getData(): object`                               | Returns the content data as it is returned in the Page Model API. |
| <code>getUrl(): string &vert; undefined</code>    | Returns the link to the content.                                  |

##### Document

The `Document` object holds document data that is used by the page components.

| Method                                            | Description                                                        |
| ------------------------------------------------- | ------------------------------------------------------------------ |
| `getId(): string`                                 | Returns the document id.                                           |
| <code>getLocale(): string &vert; undefined</code> | Returns the document locale.                                       |
| `getMeta(): MetaCollection`                       | Returns the document meta-data collection.                         |
| `getName(): string`                               | Returns the document name.                                         |
| `getData(): object`                               | Returns the document data as it is returned in the Page Model API. |
| <code>getUrl(): string &vert; undefined</code>    | Returns the link to the content.                                   |

##### ImageSet

The `ImageSet` object holds images collection that is used by the page components.

| Method                                              | Description                         |
| --------------------------------------------------- | ----------------------------------- |
| <code>getDescription(): string undefined;</code>    | Returns the image set description.  |
| `getDisplayName(): string`                          | Returns the image set display name. |
| `getId(): string`                                   | Returns the document id.            |
| `getFileName(): string`                             | Returns the image set file name.    |
| `getId(): string`                                   | Returns the image set id.           |
| <code>getLocale(): string &vert; undefined</code>   | Returns the image set locale.       |
| `getName(): string`                                 | Returns the image name.             |
| <code>getOriginal(): Image &vert; undefined</code>  | Returns the original image.         |
| <code>getThumbnail(): Image &vert; undefined</code> | Returns the thumbnail.              |

##### Image

The `Image` object holds an image object that is used by the `ImageSet` object.

| Method                                              | Description                     |
| --------------------------------------------------- | ------------------------------- |
| `getDisplayName(): string`                          | Returns the image display name. |
| <code>getFileName(): string &vert; undefined</code> | Returns the image file name.    |
| `getHeight(): number`                               | Returns the image height.       |
| `getMimeType(): string`                             | Returns the image mime-type.    |
| `getName(): string`                                 | Returns the image name.         |
| `getSize(): number`                                 | Returns the image size.         |
| <code>getUrl(): string &vert; undefined</code>      | Returns the image link.         |
| `getWidth(): number`                                | Returns the image width.        |

##### Menu

The `Menu` object holds the page menu data with all the menu items.

| Method                                                | Description                                                                                                |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `getItems(): MenuItem[]`                              | Returns the menu items.                                                                                    |
| `getMeta(): MetaCollection`                           | Returns the menu meta-data collection.                                                                     |
| `getName(): string`                                   | Returns the menu name.                                                                                     |
| <code>getSelected(): MenuItem &vert; undefined</code> | Returns the current menu item. The method is **deprecated** and will be removed in the next major release. |

##### MenuItem

The `MenuItem` object holds a menu item that is used by the `Menu` object.

| Method                                         | Description                                        |
| ---------------------------------------------- | -------------------------------------------------- |
| `getChildren(): MenuItem[]`                    | Returns the child items.                           |
| `getDepth(): number`                           | Returns the menu item depth level.                 |
| <code>getLink(): Link &vert; undefined</code>  | Returns the menu item link.                        |
| `getName(): string`                            | Returns the menu item name.                        |
| `getParameters(): object`                      | Returns the menu item parameters.                  |
| <code>getUrl(): string &vert; undefined</code> | Returns the menu item url.                         |
| `isExpanded(): boolean`                        | Returns whether the menu item is expanded.         |
| `isRepositoryBased(): boolean`                 | Returns whether the menu item is repository based. |
| `isSelected(): boolean`                        | Returns whether the menu item is selected.         |

##### MetaCollection

| Method                                                      | Description                                                                               |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `clear(): void`                                             | Clears previously rendered meta-data objects.                                             |
| `render(head: HTMLElement, tail: HTMLElement): () => void;` | Renders meta-data objects on the page and returns the callback clearing rendered objects. |

##### Meta

The `Meta` objects are being used by the brXM to page and its components.

| Method                  | Description                                                     |
| ----------------------- | --------------------------------------------------------------- |
| `getData(): string`     | Returns the meta-data.                                          |
| `getPosition(): string` | Returns the meta-data position relative to the related element. |

##### Pagination

The `Pagination` object holds the pagination data with all the pagination items.

| Method                                                      | Description                                             |
| ----------------------------------------------------------- | ------------------------------------------------------- |
| `getCurrent(): PaginationItem`                              | Returns the current page.                               |
| `getFirst(): PaginationItem`                                | Returns the first page.                                 |
| `getItems(): Reference[]`                                   | Returns the current page items.                         |
| `getLast(): PaginationItem`                                 | Returns the last page.                                  |
| <code>getNext(): PaginationItem &vert; undefined</code>     | Returns the next page.                                  |
| `getOffset(): number`                                       | Returns the number of items before the current page.    |
| `getPages(): PaginationItem[]`                              | Returns currently listed pages.                         |
| <code>getPrevious(): PaginationItem &vert; undefined</code> | Returns the previous page.                              |
| `getSize(): number`                                         | Returns the number of items listed on the current page. |
| `getTotal(): number`                                        | Returns the total number of items.                      |
| `isEnabled(): boolean`                                      | Returns whether the pagination is enabled.              |

##### PaginationItem

The `PaginationItem` object holds a pagination item that is used by the `Pagination` object.

| Method                                         | Description              |
| ---------------------------------------------- | ------------------------ |
| `getNumber(): number`                          | Returns the page number. |
| <code>getUrl(): string &vert; undefined</code> | Returns the page URL.    |

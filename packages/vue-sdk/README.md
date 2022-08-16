# Bloomreach Vue.js SDK

Bloomreach Vue.js SDK provides simplified headless integration with [Bloomreach Experience Manager](https://www.bloomreach.com/en/products/experience-manager)
for Vue-based applications. This library interacts with the [Page Model API](https://documentation.bloomreach.com/api-reference/content/delivery/page-delivery-api/page-delivery-api.html)
and [Bloomreach SPA SDK](https://www.npmjs.com/package/@bloomreach/spa-sdk) and
exposes a simplified declarative Vue.js interface over the Page Model.

## Features

- Bloomreach Page Vue component;
- Bloomreach Components Vue component;
- Manage Content Button;
- Manage Menu Button;
- [Slots](https://vuejs.org/v2/guide/components-slots.html) support;
- [Vue Server-Side Rendering](https://ssr.vuejs.org/) support;
- [Nuxt.js](https://nuxtjs.org/) support;
- [Vue Router](https://router.vuejs.org/) support;
- [Jest](https://jestjs.io/) support.

**Important notice**: Vue SDK does not work in combination with `nomarkup`
xtype container components. (The xtype of a container component is described [here](https://documentation.bloomreach.com/api-reference/content/management/site-management-api/schemas.html) and [here](https://documentation.bloomreach.com/14/library/concepts/template-composer/channel-editor-containers.html))
The problem is that Vue 2 does not support multi-root templates and the fragement libraries such as [Vue Fragment](https://www.npmjs.com/package/vue-fragment) that enable this for Vue 2 all add 'magic' parentNodes which is incompatible with some of the Bloomreach Experience Manager code constructs. We are looking into updating to Vue 3 when possible which [does support multi-root templates](https://v3.vuejs.org/guide/migration/fragments.html#_2-x-syntax) without extra magic.

## Get Started

### Installation

To get the SDK into your project with [NPM](https://docs.npmjs.com/cli/npm):

```bash
npm install @bloomreach/vue-sdk
```

And with [Yarn](https://yarnpkg.com):

```bash
yarn add @bloomreach/vue-sdk
```

### Usage

The following code snippets render a simple page with a
[Banner](https://documentation.bloomreach.com/library/setup/hst-components/overview.html)
component.

#### `src/main.ts`

In the app's entry file, it needs to import and
[install](https://vuejs.org/v2/guide/plugins.html#Using-a-Plugin) the `BrSdk`
plugin to make the SDK components available globally.

```javascript
import Vue from 'vue';
import { BrSdk } from '@bloomreach/vue-sdk';

Vue.use(BrSdk);

// ...
```

#### `src/App.vue`

In the `App` component, it needs to pass the configuration and brXM components
mapping into the `br-page` component inputs.

```html
<template>
  <br-page :configuration="configuration" :mapping="mapping">
    <template v-slot:default="props">
      <header>
        <a :href="props.page.getUrl('/')">Home</a>
        <br-component component="menu" />
      </header>
      <section>
        <br-component component="main" />
      </section>
      <footer>
        <br-component component="footer" />
      </footer>
    </template>
  </br-page>
</template>

<script>
  import Banner from './components/Banner.vue';

  export default {
    data() {
      return {
        configuration: {
          /* ... */
        },
        mapping: { Banner },
      };
    },
  };
</script>
```

#### `src/components/Banner.vue`

Finally, in the `Banner` component, it can consume the component data via the
`component` prop.

```html
<template>
  <div>Banner: {{ component.getName() }}</div>
</template>

<script>
  export default { props: ['component'] };
</script>
```

### Non-blocking render mode (NBRMode)

Non-blocking rendering mode can be used to decrease the time for your application to load fully on the client side. By
default the NBRMode configuration is `false` to avoid breaking existing setups. Setting it to `true` will enable
non-blocking render mode. When the mode is active the children of the BrPage component will start mounting while the
Page Model is being fetched. These children might contain logic themselves that queries some external API and using
non-blocking render mode would allow this to be executed in parallel to requesting the Page Model.

```html
<template>
  Hello
</template>

<script>
  export default {
    name: 'MyComponent',
    async mounted() {
      // This will run in parallel to fetching the PageModel from the Delivery API
      await fetch('https://yourapi.com');
    }
  };
</script>
```
```html
<template>
  <br-page :configuration="configuration" :mapping="mapping">
    <my-component></my-component>
    <template v-slot:default="props">
      ...
  </br-page>
</template>

<script>
  export default {
    data() {
      return {
        configuration: {
          /* ... */
          NBRMode: true,
        },
        mapping: { ... },
      };
    },
  };
</script>
```
### Configuration

The `br-page` component supports several options you may use to customize page
initialization. These options will be passed to the `initialize` function from
[`@bloomreach/spa-sdk`](https://www.npmjs.com/package/@bloomreach/spa-sdk). See
[here](https://www.npmjs.com/package/@bloomreach/spa-sdk#configuration) for the
full configuration documentation.

### Mapping

The `br-page` component provides a way to link Vue components with the brXM
ones. It requires to pass the `mapping` property that maps the component type
with its representation.

The [Container Items](https://www.npmjs.com/package/@bloomreach/spa-sdk#container-item) can be
mapped by their labels.

```html
<template>
  <br-page :configuration="configuration" :mapping="mapping" />
</template>

<script>
  import NewsList from './components/NewsList.vue';

  export default {
    data() {
      return {
        configuration: {
          /* ... */
        },
        mapping: { 'News List': NewsList },
      };
    },
  };
</script>
```

The [Containers](https://www.npmjs.com/package/@bloomreach/spa-sdk#container-item)
can be only mapped by their [type](https://documentation.bloomreach.com/library/concepts/template-composer/channel-editor-containers.html),
so you need to use [constants](https://www.npmjs.com/package/@bloomreach/spa-sdk#constants) from
[`@bloomreach/spa-sdk`](www.npmjs.com/package/@bloomreach/spa-sdk). By default,
the Vue.js SDK provides an implementation for all the container types as it is
defined in the [documentation](https://documentation.bloomreach.com/library/concepts/template-composer/channel-editor-containers.html).

```html
<template>
  <br-page :configuration="configuration" :mapping="mapping" />
</template>

<script>
  import { TYPE_CONTAINER_INLINE } from '@bloomreach/spa-sdk';
  import InlineContainer from './components/InlineContainer.vue';

  export default {
    data() {
      return {
        configuration: {
          /* ... */
        },
        mapping: { [TYPE_CONTAINER_INLINE]: InlineContainer },
      };
    },
  };
</script>
```

From within the Container component, the Container Items can be accessed via the
`getChildren` method. This can be used to reorder or wrap child elements.

```html
<template>
  <div>
    <span v-for="(child, key) in component.getChildren()" :key="key">
      <br-component :component="child" />
    </span>
  </div>
</template>

<script>
  export default { props: ['component'] };
</script>
```

That is also possible to render children via the default slot.

```javascript
export default {
  render(createElement) {
    return createElement(
      'div',
      this.$slots.default.map((node) => createElement('span', [node])),
    );
  },
};
```

The [Components](https://www.npmjs.com/package/@bloomreach/spa-sdk#component)
can be mapped by their names. It is useful for a menu component mapping.

```html
<template>
  <br-page :configuration="configuration" :mapping="mapping" />
</template>

<script>
  import Menu from './components/Menu.vue';

  export default {
    data() {
      return {
        configuration: {
          /* ... */
        },
        mapping: { menu: Menu },
      };
    },
  };
</script>
```

By default, container items that are not mapped will be rendered as a warning
text. There is an option to override the fallback.

```html
<template>
  <br-page :configuration="configuration" :mapping="mapping" />
</template>

<script>
  import { TYPE_CONTAINER_ITEM_UNDEFINED } from '@bloomreach/spa-sdk';
  import Fallback from './components/Fallback.vue';

  export default {
    data() {
      return {
        configuration: {
          /* ... */
        },
        mapping: { [TYPE_CONTAINER_ITEM_UNDEFINED]: Fallback },
      };
    },
  };
</script>
```

### Inline Mapping

There is also another way to render a component. In case you need to show a
static component or a component from the abstract page, you can use inline
component mapping.

```html
<template>
  <br-page :configuration="configuration" :mapping="mapping">
    <template>
      <br-component component="menu">
        <template v-slot:default="{ component, page }">
          <menu :component="component" :page="page" />
        </template>
      </br-component>
    </template>
  </br-page>
</template>

<script>
  import Menu from './components/Menu.vue';

  export default {
    components: { Menu },
    data() {
      return {
        configuration: {
          /* ... */
        },
        mapping: {},
      };
    },
  };
</script>
```

In a component it is also possible to point where the component's children are
going to be placed.

```html
<template>
  <div>
    @copy; Bloomreach
    <br-component />
  </div>
</template>

<script>
  export default { props: ['component'] };
</script>
```

The component data in case of inline mapping can be accessed via the template
context.

```html
<template>
  <br-page :configuration="configuration" :mapping="mapping">
    <template>
      <br-component component="menu">
        <template v-slot:default="{ component, page }">
          <ul>
            <li><a :href="page.getUrl('/')">Home</a></li>
            <li v-for="(item, key) in component.getModels()" :key="key">...</li>
          </ul>
        </template>
      </br-component>
    </template>
  </br-page>
</template>

<script>
  export default {
    data() {
      return {
        configuration: {
          /* ... */
        },
        mapping: {},
      };
    },
  };
</script>
```

### Buttons

It is recommended to add the css style `position: relative` to the Buttons
so they will position correctly within their parent container component.

Manage menu button can be placed inside a menu component using
`br-manage-menu-button` component.

```html
<template>
  <ul v-if="menu" :class="{ 'has-edit-button': page.isPreview() }">
    <!-- ... -->

    <br-manage-menu-button :menu="menu" />
  </ul>
</template>

<script>
  import { Menu, Reference } from '@bloomreach/spa-sdk';

  interface MenuModels {
    menu: Reference;
  }

  export default {
    computed: {
      menu() {
        const { menu: menuRef } = this.component.getModels<MenuModels>();

        return menuRef && this.page.getContent<Menu>(menuRef);
      },
    },
    props: ['component', 'page'],
  };
</script>
```

Manage content button can be placed inside a component using
`br-manage-content-button` component with non-empty `content` property.

```html
<template>
  <div v-if="document" :class="{ 'has-edit-button': page.isPreview() }">
    <!-- ... -->

    <br-manage-content-button
      :content="document"
      document-template-query="new-banner-document"
      folder-template-query="new-banner-folder"
      parameter="document"
      root="banners"
      :relative="true"
    />
  </div>
</template>

<script>
  import { Document, Reference } from '@bloomreach/spa-sdk';

  interface BannerModels {
    document: Reference;
  }

  export default {
    computed: {
      document() {
        const { document: documentRef } = this.component.getModels<BannerModels>();

        return documentRef && this.page.getContent<Document>(documentRef);
      },
    },
    props: ['component', 'page'],
  };
</script>
```

Add new content button can be placed inside a component using
`br-manage-content-button` directive but without passing a content entity.

```html
<template>
  <div :class="{ 'has-edit-button': page.isPreview() }">
    <!-- ... -->

    <br-manage-content-button
      document-template-query="new-news-document"
      folder-template-query="new-news-folder"
      root="news"
    />
  </div>
</template>

<script>
  export default {
    props: ['component', 'page'],
  };
</script>
```

### Using the SPA SDK selectively on certain pages
If you are navigating between pages that have and those that don't have a SDK instance you will need to persist the preview related data.
See detailed guide how to setup it in framework specific examples, [nuxtjs](https://github.com/bloomreach/spa-sdk/tree/main/examples/nuxt#persist-preview-data-for-pages-without-sdk-instance), [vue](https://github.com/bloomreach/spa-sdk/tree/main/examples/vue#persist-preview-data-for-pages-without-sdk-instance).

## License

Published under [Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0)
license.

## Reference

The Vue.js SDK is using [Bloomreach SPA SDK](https://www.npmjs.com/package/@bloomreach/spa-sdk#reference) to interact
with the brXM.

### br-page

This is the entry point to the page model. This component requests and
initializes the page model, and then renders the page root component
recursively.

| Property        | Required | Description                                                                                                                                  |
| --------------- | :------: | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `configuration` |  _yes_   | The [configuration](#configuration) of the SPA SDK.                                                                                          |
| `mapping`       |  _yes_   | The brXM and Vue.js components [mapping](#mapping).                                                                                          |
| `page`          |   _no_   | Preinitialized page instance or prefetched page model. Mostly that should be used to transfer state from the server-side to the client-side. |

This component also supports a default slot transclusion. `<template>` from the
component contents will be rendered in the root component context.

| Variable    | Description                |
| ----------- | -------------------------- |
| `component` | The root component.        |
| `page`      | The current page instance. |

### br-component

This component points to where children or some component should be placed.
`br-component` can be used inside `br-page` or mapped components only. If it
contains `<template>` in the contents, then the template will be rendered in the
context of every matched component. Otherwise, it will try to render all
children components recursively.

| Property    | Required | Description                                                                                                                                                                                                                     |
| ----------- | :------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `component` |   _no_   | The component instance or a path to a component. The path is defined as a slash-separated components name chain relative to the current component (e.g. `main/container`). If it is omitted, all the children will be rendered. |

The template context holds references to the current component and the current
page instance.

| Variable    | Description                |
| ----------- | -------------------------- |
| `component` | The current component.     |
| `page`      | The current page instance. |

### br-manage-content-button

This component places a button on the page that opens the linked content in the
document editor or opens a document editor to create a new one. The button will
only be shown in preview mode.

| Property                    | Required | Description                                                                                     |
| --------------------------- | :------: | ----------------------------------------------------------------------------------------------- |
| `content`                   |   _no_   | The content entity to open for editing.                                                         |
| `document-template-query`   |   _no_   | Template query to use for creating new documents. For Content SaaS, the key is like `new-banner-document` for `banner` document type. In case the document type is in a namespace other than `brxsaas`, the key also includes namespace prefix, such as `new-vuestorefront-accordion-document` for `accordion` document type in `vuestorefront` namespace. |
| `folder-template-query`     |   _no_   | Template query to use in case folders specified by `path` do not yet exist and must be created. For Content SaaS, the key is like `new-banner-folder` for `banner` document type. In case the document type is in a namespace other than `brxsaas`, the key also includes namespace prefix, such as `new-vuestorefront-accordion-folder` for `accordion` document type in `vuestorefront` namespace. |
| `path`                      |   _no_   | Initial location of a new document, relative to the `root`.                                     |
| `parameter`                 |   _no_   | Name of the component parameter in which the document path is stored.                           |
| `pickerConfiguration`       |   _no_   | The root path of the CMS configuration to use for the picker, relative to `/hippo:configuration/hippo:frontend/cms`. |
| `pickerEnableUpload`        |   _no_   | When this picker is used for images, this flag determines if uploads are enabled.               |
| `pickerInitialPath`         |   _no_   | The initial path to use in the picker if nothing has been selected yet, relative to the pickerRootPath. |
| `pickerRemembersLastVisited`|   _no_   | Whether the picker remembers the last visited path.                                             |
| `pickerRootPath`            |   _no_   | The absolute root path to use in the picker, or an empty string if the channel content path is used. |
| `pickerSelectableNodeTypes` |   _no_   | Types of nodes to be able to select in the picker, separated by a comma.                        |
| `relative`                  |   _no_   | Flag indicating that the picked value should be stored as a relative path.                      |
| `root`                      |   _no_   | Path to the root folder of selectable document locations.                                       |

### br-manage-menu-button

This directive places a button on the page that opens the linked menu in the
menu editor. The button will only be shown in preview mode.

| Property | Required | Description             |
| -------- | :------: | ----------------------- |
| `menu`   |  _yes_   | The related menu model. |

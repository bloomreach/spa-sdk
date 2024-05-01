# Bloomreach Vue SDK

Bloomreach Vue SDK provides simplified headless integration with [Bloomreach Content](https://www.bloomreach.com/en/products/content)
for Vue-based applications. This library interacts with the [Page Model API](https://documentation.bloomreach.com/api-reference/content/delivery/page-delivery-api/page-delivery-api.html)
and [Bloomreach SPA SDK](https://www.npmjs.com/package/@bloomreach/spa-sdk) and
exposes a simplified declarative Vue.js interface over the Page Model.

## Prerequisite

To use Vue SDK, you need to have Vue 3 installed.

## Features

- Bloomreach Page Vue component;
- Bloomreach Components Vue component;
- Manage Content Button;
- Manage Menu Button;

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
[install](https://vuejs.org/guide/reusability/plugins.html) the `BrSdk`
plugin to make the SDK components available globally.

```typescript
import { createApp } from 'vue'
import { BrSdk } from '@bloomreach/vue-sdk';

const app = createApp(/*... */);
app.use(BrSdk);

/*... */
```

#### `src/App.vue`

In the `App` component, it needs to pass the configuration and Bloomreach Content components
mapping into the `br-page` component inputs.

```html
<template>
  <br-page :configuration="configuration" :mapping="mapping">
    <template v-slot="props">
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

<script lang="ts" setup>
  import Banner from './components/Banner.vue';
  
  const configuration = {
    /* ... */
  };
  const mapping = { Banner };
</script>
```

#### `src/components/Banner.vue`

Finally, in the `Banner` component, it can consume the component data via the
`component` prop.

```html
<template>
  <div>Banner: {{ component.getName() }}</div>
</template>

<script lang="ts" setup>
  import { toRefs } from 'vue';
  
  const props = defineProps<{ component: Component }>();
  const { component } = toRefs(props);
</script>
```

### Non-blocking render mode (NBRMode)

Non-blocking rendering mode can be used to decrease the time for your application to load fully on the client side. By
default the NBRMode configuration is `false` to avoid breaking existing setups. Setting it to `true` will enable
non-blocking render mode. When the mode is active the children of the BrPage component will start mounting while the
Page Model is being fetched. These children might contain logic themselves that queries some external API and using
non-blocking render mode would allow this to be executed in parallel to requesting the Page Model.

```html
<!-- MyComponent.vue -->
<template>
  Hello
</template>

<script lang="ts" setup>
  import { onMounted } from 'vue';
  
  onMounted(async () => {
    // This will run in parallel to fetching the Page Model from the Delivery API
    await fetch('https://yourapi.com');
  });
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

<script lang="ts" setup>
  const configuration = {
    NBRMode: true,
    /* ... */
  };
  const mapping = {/* ... */};
</script>
```
### Configuration

The `br-page` component supports several options you may use to customize page
initialization. These options will be passed to the `initialize` function from
[`@bloomreach/spa-sdk`](https://www.npmjs.com/package/@bloomreach/spa-sdk). See
[here](https://bloomreach.github.io/spa-sdk/modules/index.html#Configuration) for the
full configuration documentation in the SPA SDK Typedocs.

### Mapping

The `br-page` component provides a way to link Vue components with the Bloomreach Content
ones. It requires to pass the `mapping` property that maps the component type
with its representation.

The [Container Items](https://bloomreach.github.io/spa-sdk/interfaces/index.ContainerItem.html) can be
mapped by their labels.

```html
<template>
  <br-page :configuration="configuration" :mapping="mapping" />
</template>

<script lang="ts" setup>
  import NewsList from './components/NewsList.vue';
  
  const configuration = {
    /* ... */
  };
  const mapping = { 'News List': NewsList };
</script>
```

The [Containers](https://bloomreach.github.io/spa-sdk/interfaces/index.ContainerItem.html)
can be only mapped by their [type](https://documentation.bloomreach.com/library/concepts/template-composer/channel-editor-containers.html),
so you need to use [constants](https://bloomreach.github.io/spa-sdk/modules/index.html#TYPE_CONTAINER_BOX) from
[`@bloomreach/spa-sdk`](www.npmjs.com/package/@bloomreach/spa-sdk). By default,
the Vue SDK provides an implementation for all the container types as it is
defined in the [documentation](https://documentation.bloomreach.com/library/concepts/template-composer/channel-editor-containers.html).

```html
<template>
  <br-page :configuration="configuration" :mapping="mapping" />
</template>

<script lang="ts" setup>
  import { TYPE_CONTAINER_INLINE } from '@bloomreach/spa-sdk';
  import InlineContainer from './components/InlineContainer.vue';
  
  const configuration = {
    /* ... */
  };
  const mapping = { [TYPE_CONTAINER_INLINE]: InlineContainer };
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

<script lang="ts" setup>
  import { toRefs } from 'vue';
  
  const props = defineProps<{ component: Component }>();
  const { component } = toRefs(props);
</script>
```

The [Components](https://bloomreach.github.io/spa-sdk/interfaces/index.Component.html)
can be mapped by their names. It is useful for a menu component mapping.

```html
<template>
  <br-page :configuration="configuration" :mapping="mapping" />
</template>

<script lang="ts" setup>
  import Menu from './components/Menu.vue';

  const configuration = {
    /* ... */
  };
  const mapping = { menu: Menu };
</script>
```

By default, container items that are not mapped will be rendered as a warning
text. There is an option to override the fallback.

```html
<template>
  <br-page :configuration="configuration" :mapping="mapping" />
</template>

<script lang="ts" setup>
  import { TYPE_CONTAINER_ITEM_UNDEFINED } from '@bloomreach/spa-sdk';
  import Fallback from './components/Fallback.vue';

  const configuration = {
    /* ... */
  };
  const mapping = { [TYPE_CONTAINER_ITEM_UNDEFINED]: Fallback };
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
          <Menu :component="component" :page="page" />
        </template>
      </br-component>
    </template>
  </br-page>
</template>

<script>
  import Menu from './components/Menu.vue';
  
  const configuration = {
    /* ... */
  };
  const mapping = {
    /* ... */
  };
</script>
```

In a component it is also possible to point where the component's children are
going to be placed.

```html

<template>
  <div>
    @copy; Bloomreach
    <br-component/>
  </div>
</template>

<script lang="ts" setup>
  import { Component } from '@bloomreach/spa-sdk';
  import { toRefs } from 'vue';
  
  const props = defineProps < { component: Component } > ();
  const { component } = toRefs(props);
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

<script lang="ts" setup>
  const configuration = {
    /* ... */
  };
  const mapping = {
    /* ... */
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

<script lang="ts" setup>
  import { toRefs, computed } from 'vue';
  import { Menu, Reference, Component, Page } from '@bloomreach/spa-sdk';

  interface MenuModels {
    menu: Reference;
  }
  
  const props = defineProps<{ component: Component; page: Page }>();
  const { component, page } = toRefs(props);
  const menu = computed(() => {
    const { menu: menuRef } = component.value.getModels<MenuModels>();
    return menuRef && page.value.getContent<Menu>(menuRef);
  });
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
  import { toRefs, computed } from 'vue';
  import { Document, Reference, Page, Component } from '@bloomreach/spa-sdk';

  interface BannerModels {
    document: Reference;
  }
  
  const props = defineProps<{ component: Component; page: Page }>();
  const { component, page } = toRefs(props);
  
  const document = computed(() => {
    const { document: documentRef } = component.value.getModels<BannerModels>();
    return documentRef && page.value.getContent<Document>(documentRef);
  });
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

<script lang="ts" setup>
  import { Component, Page } from '@bloomreach/spa-sdk';
  
  const props = defineProps<{ component: Component, page: Page }>();
  const { component, page } = toRefs(props);
</script>
```

## License

Published under [Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0)
license.

## Reference

The Vue SDK is using [Bloomreach SPA SDK](https://www.npmjs.com/package/@bloomreach/spa-sdk) to interact
with Bloomreach Content.

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

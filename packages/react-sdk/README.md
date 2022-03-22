# Bloomreach React SDK

Bloomreach React SDK provides simplified headless integration with [Bloomreach Experience Manager](https://www.bloomreach.com/en/products/experience-manager)
for React-based applications. This library interacts with the [Page Model API](https://documentation.bloomreach.com/api-reference/content/delivery/page-delivery-api/page-delivery-api.html)
and [Bloomreach SPA SDK](https://www.npmjs.com/package/@bloomreach/spa-sdk) and
exposes a simplified declarative React interface over the Page Model.

## Features

- Bloomreach Page component;
- Bloomreach Component component;
- Manage Content Button;
- Manage Menu Button;
- [Context API](https://reactjs.org/docs/context.html) support;
- [Hooks API](https://reactjs.org/docs/hooks-intro.html) support;
- [Next.js](https://nextjs.org/) support;
- [React Router](https://reacttraining.com/react-router/) and [Next Routes](https://github.com/fridays/next-routes) support;
- [React Native](https://reactnative.dev/) support;
- [Enzyme](https://airbnb.io/enzyme/) and [Jest](https://jestjs.io/) support.

## Get Started

### Installation

To get the SDK into your project with [NPM](https://docs.npmjs.com/cli/npm):

```bash
npm install @bloomreach/react-sdk
```

And with [Yarn](https://yarnpkg.com):

```bash
yarn add @bloomreach/react-sdk
```

### Usage

The following code snippet renders a simple page with a
[Banner](https://documentation.bloomreach.com/library/setup/hst-components/overview.html)
component.

```jsx
import React from 'react';
import axios from 'axios';
import { BrComponent, BrPage, BrPageContext, BrProps } from '@bloomreach/react-sdk';

function Banner({ component }: BrProps) {
  return <div>Banner: {component.getName()}</div>;
}

export default function App() {
  const configuration = { /* ... */ };

  return (
    <BrPage configuration={configuration} mapping={{ Banner }}>
      <header>
        <BrPageContext.Consumer>
          { page => <Link to={page.getUrl('/')} />Home</Link> }
        </BrPageContext.Consumer>
        <BrComponent path="menu"><Menu /></BrComponent>
      </header>
      <section>
        <BrComponent path="main" />
      </section>
      <BrComponent path="footer">
        <footer><BrComponent /></footer>
      </BrComponent>
    </BrPage>
  );
}
```

### Configuration

The `BrPage` component supports several options you may use to customize page
initialization. These options will be passed to the `initialize` function from
[`@bloomreach/spa-sdk`](https://www.npmjs.com/package/@bloomreach/spa-sdk). See
[here](https://www.npmjs.com/package/@bloomreach/spa-sdk#configuration) for the
full configuration documentation.

### Mapping

The `BrPage` component provides a way to link React components with the brXM
ones. It requires to pass the `mapping` property that maps the component type
with its representation.

The [Container Items](https://www.npmjs.com/package/@bloomreach/spa-sdk#container-item) can be
mapped by their labels.

```jsx
import NewsList from "./components/NewsList";

return <BrPage mapping={{ "News List": NewsList }} />;
```

The [Containers](https://www.npmjs.com/package/@bloomreach/spa-sdk#container-item)
can be only mapped by their [type](https://documentation.bloomreach.com/library/concepts/template-composer/channel-editor-containers.html),
so you need to use [constants](https://www.npmjs.com/package/@bloomreach/spa-sdk#constants) from
[`@bloomreach/spa-sdk`](www.npmjs.com/package/@bloomreach/spa-sdk). By default,
the React SDK provides an implementation for all the container types as it's
defined in the [documentation](https://documentation.bloomreach.com/library/concepts/template-composer/channel-editor-containers.html).

```jsx
import { TYPE_CONTAINER_INLINE } from "@bloomreach/spa-sdk";
import MyInlineContainer from "./components/MyInlineContainer";

return <BrPage mapping={{ [TYPE_CONTAINER_INLINE]: MyInlineContainer }} />;
```

From within the Container component, the Container Items can be accessed via the
`children` property. This can be used to reorder or wrap child elements.

```jsx
export default function MyInlineContainer() {
  return (
    <div>
      {React.Children.map(props.children, (child) => (
        <span className="float-left">{child}</span>
      ))}
    </div>
  );
}
```

The [Components](https://www.npmjs.com/package/@bloomreach/spa-sdk#component)
can be mapped by their names. It is useful for a menu component mapping.

```jsx
import Menu from "./components/Menu";

return <BrPage mapping={{ menu: Menu }} />;
```

By default, container items that are not mapped will be rendered as a warning
text. There is an option to override the fallback.

```jsx
import { TYPE_CONTAINER_ITEM_UNDEFINED } from "@bloomreach/spa-sdk";
import Fallback from "./components/Fallback";

return <BrPage mapping={{ [TYPE_CONTAINER_ITEM_UNDEFINED]: Fallback }} />;
```

### Inline Mapping

There is also another way to render a component. In case you need to show a
static component or a component from the abstract page, you can use inline
component mapping.

```jsx
return (
  <BrComponent path="menu">
    <Menu />
  </BrComponent>
);
```

It is also possible to point where the component's children are going to be
placed.

```jsx
return (
  <BrComponent path="footer">
    <footer>
      <BrComponent />
    </footer>
  </BrComponent>
);
```

The component data in case of inline mapping can be accessed via the
`BrComponentContext`.

```jsx
return (
  <BrComponentContext.Consumer>
    {(component) => (
      <BrComponent path="footer">
        <footer>
          &copy; {component.getName()}
          <BrComponent />
        </footer>
      </BrComponent>
    )}
  </BrComponentContext.Consumer>
);
```

Or by using React Hooks.

```jsx
import { BrComponentContext } from "@bloomreach/react-sdk";

export default function Menu() {
  const component = React.useContext(BrComponentContext);

  return <ul>{component.getName()}</ul>;
}
```

### Buttons

It is recommended to add the css style `position: relative` to the Buttons
so they will position correctly within their parent container component.

Manage menu button can be placed inside a menu component using
`BrManageMenuButton` component.

```tsx
import React from "react";
import { Menu, Reference } from "@bloomreach/spa-sdk";
import {
  BrComponentContext,
  BrManageMenuButton,
  BrPageContext,
} from "@bloomreach/react-sdk";

interface MenuModels {
  menu: Reference;
}

export default function MenuComponent() {
  const component = React.useContext(BrComponentContext);
  const page = React.useContext(BrPageContext);
  const menuRef = component?.getModels<MenuModels>().menu;
  const menu = menuRef && page?.getContent<Menu>(menuRef);

  if (!menu) {
    return null;
  }

  return (
    <ul className={page?.isPreview() ? "has-edit-button" : ""}>
      {/* ... */}

      <BrManageMenuButton menu={menu} />
    </ul>
  );
}
```

Manage content button can be placed inside a component using
`BrManageContentButton` component with non-empty `content` property.

```tsx
import React from "react";
import { Document, Reference } from "@bloomreach/spa-sdk";
import { BrManageContentButton, BrProps } from "@bloomreach/react-sdk";

interface BannerModels {
  document: Reference;
}

export default function Banner({ component, page }: BrProps) {
  const { document: documentRef } = component.getModels<BannerModels>();
  const document = documentRef && page.getContent<Document>(documentRef);

  return (
    <div className={page.isPreview() ? "has-edit-button" : ""}>
      {/* ... */}

      <BrManageContentButton
        content={document}
        documentTemplateQuery="new-banner-document"
        folderTemplateQuery="new-banner-folder"
        parameter="document"
        root="banners"
        relative
      />
    </div>
  );
}
```

Add new content button can be placed inside a component using
`BrManageContentButton` directive but without passing a content entity.

```tsx
import React from "react";
import { BrManageContentButton, BrProps } from "@bloomreach/react-sdk";

export default function News({ component, page }: BrProps) {
  // ...

  return (
    <div className={page.isPreview() ? "has-edit-button" : ""}>
      {/* ... */}

      <BrManageContentButton
        documentTemplateQuery="new-news-document"
        folderTemplateQuery="new-news-folder"
        root="news"
      />
    </div>
  );
}
```

### React Native

The SDK is fully compatible with [React Native](https://reactnative.dev/)
framework, but there are some of the best practices.

- It is impossible to use `<div>` elements in React Native, and it is
  recommended to use the `hst.nomarkup` container type in the backend
  configuration.

- If there is a need to support other container types, those types should be
  overridden explicitly in the mapping. The default implementation is using HTML
  entities as described in the
  [documentation](https://documentation.bloomreach.com/library/concepts/template-composer/channel-editor-containers.html).

  ```jsx
  import React from "react";
  import { View } from "react-native";
  import { TYPE_CONTAINER_BOX } from "@bloomreach/spa-sdk";

  function MyBoxContainer() {
    return (
      <View>
        {React.Children.map(props.children, (child) => (
          <View>{child}</View>
        ))}
      </View>
    );
  }

  export default function App() {
    return <BrPage mapping={{ [TYPE_CONTAINER_BOX]: MyBoxContainer }} />;
  }
  ```

- The fallback mapping should be overridden to prevent errors on production when
  a new component type pops up on the backend since the default implementation is
  returning a plain text node.

  ```jsx
  import React from "react";
  import { Text } from "react-native";
  import { TYPE_CONTAINER_ITEM_UNDEFINED } from "@bloomreach/spa-sdk";

  function Fallback({ component, page }) {
    return (
      page.isPreview() && (
        <Text>Component "{component.getType()}" is not defined.</Text>
      )
    );
  }

  export default function App() {
    return <BrPage mapping={{ [TYPE_CONTAINER_ITEM_UNDEFINED]: Fallback }} />;
  }
  ```

- For integration with [the Relevance
  Module](https://documentation.bloomreach.com/14/library/enterprise/enterprise-features/targeting/targeting.html),
  the visitor identifier storing and passing should be handled on the application
  side. There is the `visitor` option in the [configuration](#configuration) that
  enables a setup without using cookies.

  ```jsx
  import React, { useEffect, useMemo, useRef } from "react";
  import { read, write } from "./storage";

  export default function App() {
    const ref = useRef(null);
    const configuration = {
      /* ... */
      visitor: read("visitor"),
    };

    const visitor =
      ref.current &&
      ref.current.state.page &&
      ref.current.state.page.getVisitor();

    useEffect(() => void visitor && write("visitor", visitor), [
      visitor && visitor.id,
    ]);

    return <BrPage ref={ref} configuration={configuration} />;
  }
  ```

### Using the SPA SDK selectively on certain pages
If you are navigating between pages that have and those that don't have a SDK instance you will need to persist the preview related data.
See detailed guide how to setup it in framework specific examples, [nextjs](https://github.com/bloomreach/spa-sdk/tree/main/examples/next#persist-preview-data-for-pages-without-sdk-instance), [react](https://github.com/bloomreach/spa-sdk/tree/main/examples/react#persist-preview-data-for-pages-without-sdk-instance).

## License

Published under [Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0)
license.

## Reference

The React SDK is using [Bloomreach SPA SDK](https://www.npmjs.com/package/@bloomreach/spa-sdk#reference) to interact
with the brXM.

### BrPage

This is the entry point to the page model. This component requests and
initializes the page model, and then renders the page root component with React
children passed to this component. The component also sets the page object into
`BrPageContext`.

| Property        | Required | Description                                                                                                                                  |
| --------------- | :------: | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `configuration` |  _yes_   | The [configuration](#configuration) of the SPA SDK.                                                                                          |
| `mapping`       |  _yes_   | The brXM and React components [mapping](#mapping).                                                                                           |
| `page`          |   _no_   | Preinitialized page instance or prefetched page model. Mostly that should be used to transfer state from the server-side to the client-side. |

### BrComponent

This component points to where children or some component should be placed.
`BrComponent` can be used inside `BrPage` or mapped components only. If React
children are passed, then they will be rendered [as-are](#inline-mapping).
Otherwise, it will try to render all children components recursively.

| Property | Required | Description                                                                                                                                                                                             |
| -------- | :------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `path`   |   _no_   | The path to a component. The path is defined as a slash-separated components name chain relative to the current component (e.g. `main/container`). If it is omitted, all the children will be rendered. |

### BrManageContentButton

This component places a button on the page that opens the linked content in the
document editor or opens a document editor to create a new one. The button will
only be shown in preview mode.

| Property                    | Required | Description                                                                                     |
| --------------------------- | :------: | ----------------------------------------------------------------------------------------------- |
| `content`                   |   _no_   | The content entity to open for editing.                                                         |
| `documentTemplateQuery`     |   _no_   | Template query to use for creating new documents. For Content SaaS, the key is like `new-banner-document` for `banner` document type. In case the document type is in a namespace other than `brxsaas`, the key also includes namespace prefix, such as `new-vuestorefront-accordion-document` for `accordion` document type in `vuestorefront` namespace. |
| `folderTemplateQuery`       |   _no_   | Template query to use in case folders specified by `path` do not yet exist and must be created. For Content SaaS, the key is like `new-banner-folder` for `banner` document type. In case the document type is in a namespace other than `brxsaas`, the key also includes namespace prefix, such as `new-vuestorefront-accordion-folder` for `accordion` document type in `vuestorefront` namespace. |
| `path`                      |   _no_   | Initial location of a new document, relative to the `root`.                                     |
| `parameter`                 |   _no_   | Name of the component parameter in which the document path is stored.                           |
| `pickerConfiguration`       |   _no_   | The root path of the CMS configuration to use for the picker, relative to `/hippo:configuration/hippo:frontend/cms`. |
| `pickerInitialPath`         |   _no_   | The initial path to use in the picker if nothing has been selected yet, relative to the pickerRootPath. |
| `pickerRemembersLastVisited`|   _no_   | Whether the picker remembers the last visited path.                                             |
| `pickerRootPath`            |   _no_   | The absolute root path to use in the picker, or an empty string if the channel content path is used. |
| `pickerSelectableNodeTypes` |   _no_   | Types of nodes to be able to select in the picker, separated by a comma.                        |
| `relative`                  |   _no_   | Flag indicating that the picked value should be stored as a relative path.                      |
| `root`                      |   _no_   | Path to the root folder of selectable document locations.                                       |

### BrManageMenuButton

This component places a button on the page that opens the linked menu in the
menu editor. The button will only be shown in preview mode.

| Property | Required | Description             |
| -------- | :------: | ----------------------- |
| `menu`   |  _yes_   | The related menu model. |

### BrComponentContext

The [React Context](https://reactjs.org/docs/context.html) holding the current brXM [Component](https://www.npmjs.com/package/@bloomreach/spa-sdk#component).

### BrPageContext

The [React Context](https://reactjs.org/docs/context.html) holding the current brXM [Page](https://www.npmjs.com/package/@bloomreach/spa-sdk#page).

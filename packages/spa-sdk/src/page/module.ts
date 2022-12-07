/*
 * Copyright 2019-2022 Bloomreach
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Typed } from 'emittery';
import { ContainerModule } from 'inversify';

import { CmsEventBus, CmsEventBusService, CmsEventBusServiceProvider } from '../cms';
import { UrlBuilder, UrlBuilderService } from '../url';

import { ButtonFactory } from './button-factory';
import { createManageContentButton, TYPE_MANAGE_CONTENT_BUTTON } from './button-manage-content';
import {
  ComponentChildrenToken,
  ComponentImpl,
  ComponentModelToken,
  TYPE_COMPONENT,
  TYPE_COMPONENT_CONTAINER,
  TYPE_COMPONENT_CONTAINER_ITEM,
} from './component';
import { ComponentFactory } from './component-factory';
import { ContainerImpl } from './container';
import { ContainerItemImpl } from './container-item';
import { ContentFactory } from './content-factory';
import { DocumentImpl, DocumentModelToken, TYPE_DOCUMENT } from './document';
import { PageEventBusService } from './page-events';
import { ImageFactory, ImageImpl, ImageModel, ImageModelToken } from './image';
import { ImageSetImpl, ImageSetModelToken, TYPE_IMAGE_SET } from './image-set';
import { TYPE_LINK_INTERNAL } from './link';
import { LinkFactory } from './link-factory';
import {
  DomParserServiceProvider,
  LinkRewriterImpl,
  LinkRewriterService,
  XmlSerializerServiceProvider,
} from './link-rewriter';
import { Menu, MenuImpl, MenuModelToken, TYPE_MANAGE_MENU_BUTTON, TYPE_MENU } from './menu';
import { MenuItemFactory, MenuItemImpl, MenuItemModel, MenuItemModelToken } from './menu-item';
import { TYPE_META_COMMENT } from './meta';
import { MetaCollectionImpl, MetaCollectionModel, MetaCollectionModelToken } from './meta-collection';
import { MetaCollectionFactory } from './meta-collection-factory';
import { MetaCommentImpl } from './meta-comment';
import { MetaFactory } from './meta-factory';
import { PageImpl, PageModel, PageModelToken } from './page';
import { PageFactory } from './page-factory';
import { PaginationImpl, PaginationModelToken, TYPE_PAGINATION } from './pagination';
import {
  PaginationItemFactory,
  PaginationItemImpl,
  PaginationItemModel,
  PaginationItemModelToken,
} from './pagination-item';

export function PageModule(): ContainerModule {
  return new ContainerModule((bind) => {
    bind(PageEventBusService)
      .toDynamicValue(() => new Typed())
      .inSingletonScope()
      .when(() => typeof window !== 'undefined');

    /*
     Its necessary to use a async provider here because we can only get the CmsEventBus once the module is installed,
     if the page is in preview mode
    */
    bind(CmsEventBusServiceProvider).toProvider<CmsEventBus | undefined>(
      (context) => () =>
        new Promise<CmsEventBus | undefined>((resolve) => {
          try {
            if (context.container.isBound(CmsEventBusService)) {
              const cmsEventBus = context.container.get<CmsEventBus>(CmsEventBusService);
              resolve(cmsEventBus);
            }
          } catch (e) {
            resolve(undefined);
          }
        }),
    );

    bind(LinkRewriterService).to(LinkRewriterImpl).inSingletonScope();
    bind(DomParserServiceProvider).toProvider(() => async () => {
      const { DOMParser } = await import('@xmldom/xmldom');
      return new DOMParser();
    });
    bind(XmlSerializerServiceProvider).toProvider(() => async () => {
      const { XMLSerializer } = await import('@xmldom/xmldom');
      return new XMLSerializer();
    });

    bind(ButtonFactory)
      .toSelf()
      .inSingletonScope()
      .onActivation((context, factory) =>
        factory
          .register(TYPE_MANAGE_CONTENT_BUTTON, createManageContentButton)
          .register(TYPE_MANAGE_MENU_BUTTON, (menu: Menu) => menu.getMeta()),
      );

    bind(LinkFactory)
      .toSelf()
      .inSingletonScope()
      .onActivation(({ container }, factory) => {
        const url = container.get<UrlBuilder>(UrlBuilderService);

        return factory.register(TYPE_LINK_INTERNAL, url.getSpaUrl.bind(url));
      });

    bind(MetaCollectionFactory).toFactory(({ container }) => (model: MetaCollectionModel) => {
      const scope = container.createChild();
      scope.bind(MetaCollectionImpl).toSelf();
      scope.bind(MetaCollectionModelToken).toConstantValue(model);

      return scope.get(MetaCollectionImpl);
    });

    bind(MetaFactory)
      .toSelf()
      .inSingletonScope()
      .onActivation((context, factory) =>
        factory.register(TYPE_META_COMMENT, (model, position) => new MetaCommentImpl(model, position)),
      );

    bind(MenuItemFactory).toFactory(({ container }) => (model: MenuItemModel) => {
      const scope = container.createChild();
      scope.bind(MenuItemImpl).toSelf();
      scope.bind(MenuItemModelToken).toConstantValue(model);

      return scope.get(MenuItemImpl);
    });

    bind(ImageFactory).toFactory(({ container }) => (model: ImageModel) => {
      const scope = container.createChild();
      scope.bind(ImageImpl).toSelf();
      scope.bind(ImageModelToken).toConstantValue(model);

      return scope.get(ImageImpl);
    });

    bind(PaginationItemFactory).toFactory(({ container }) => (model: PaginationItemModel) => {
      const scope = container.createChild();
      scope.bind(PaginationItemImpl).toSelf();
      scope.bind(PaginationItemModelToken).toConstantValue(model);

      return scope.get(PaginationItemImpl);
    });

    bind(ContentFactory)
      .toSelf()
      .inSingletonScope()
      .onActivation(({ container }, factory) =>
        factory
          .register(TYPE_DOCUMENT, (model) => {
            const scope = container.createChild();
            scope.bind(DocumentImpl).toSelf();
            scope.bind(DocumentModelToken).toConstantValue(model);

            return scope.get(DocumentImpl);
          })
          .register(TYPE_IMAGE_SET, (model) => {
            const scope = container.createChild();
            scope.bind(ImageSetImpl).toSelf();
            scope.bind(ImageSetModelToken).toConstantValue(model);

            return scope.get(ImageSetImpl);
          })
          .register(TYPE_MENU, (model) => {
            const scope = container.createChild();
            scope.bind(MenuImpl).toSelf();
            scope.bind(MenuModelToken).toConstantValue(model);

            return scope.get(MenuImpl);
          })
          .register(TYPE_PAGINATION, (model) => {
            const scope = container.createChild();
            scope.bind(PaginationImpl).toSelf();
            scope.bind(PaginationModelToken).toConstantValue(model);

            return scope.get(PaginationImpl);
          }),
      );

    bind(ComponentFactory)
      .toSelf()
      .inSingletonScope()
      .onActivation(({ container }, factory) =>
        factory
          .register(TYPE_COMPONENT, (model, children) => {
            const scope = container.createChild();
            scope.bind(ComponentImpl).toSelf();
            scope.bind(ComponentModelToken).toConstantValue(model);
            scope.bind(ComponentChildrenToken).toConstantValue(children);

            return scope.get(ComponentImpl);
          })
          .register(TYPE_COMPONENT_CONTAINER, (model, children) => {
            const scope = container.createChild();
            scope.bind(ContainerImpl).toSelf();
            scope.bind(ComponentModelToken).toConstantValue(model);
            scope.bind(ComponentChildrenToken).toConstantValue(children);

            return scope.get(ContainerImpl);
          })
          .register(TYPE_COMPONENT_CONTAINER_ITEM, (model) => {
            const scope = container.createChild();
            scope.bind(ContainerItemImpl).toSelf();
            scope.bind(ComponentModelToken).toConstantValue(model);

            return scope.get(ContainerItemImpl);
          }),
      );

    bind(PageFactory).toFactory(({ container }) => (model: PageModel) => {
      const scope = container.createChild();
      scope.bind(PageImpl).toSelf();
      scope.bind(PageModelToken).toConstantValue(model);

      return scope.get(PageImpl);
    });
  });
}

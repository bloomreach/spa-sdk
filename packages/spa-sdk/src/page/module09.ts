/*
 * Copyright 2019-2025 Bloomreach
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Typed } from 'emittery';
import { ContainerModule } from 'inversify';
import { UrlBuilder, UrlBuilderService } from '../url';

import { ButtonFactory } from './button-factory';
import { createManageContentButton, TYPE_MANAGE_CONTENT_BUTTON } from './button-manage-content';
import { ComponentChildrenToken, ComponentModelToken } from './component';
import { ComponentFactory } from './component-factory09';
import { ComponentImpl, TYPE_COMPONENT, TYPE_COMPONENT_CONTAINER, TYPE_COMPONENT_CONTAINER_ITEM } from './component09';
import { ContainerItemImpl } from './container-item09';
import { ContainerImpl } from './container09';
import { ContentFactory } from './content-factory09';
import { ContentImpl, ContentModel, ContentModelToken } from './content09';
import { TYPE_LINK_INTERNAL } from './link';
import { LinkFactory } from './link-factory';
import { LinkRewriterImpl, LinkRewriterService } from './link-rewriter';
import { TYPE_MANAGE_MENU_BUTTON } from './menu';
import { Menu } from './menu09';
import { TYPE_META_COMMENT } from './meta';
import { MetaCollectionImpl, MetaCollectionModel, MetaCollectionModelToken } from './meta-collection';
import { MetaCollectionFactory } from './meta-collection-factory';
import { MetaCommentImpl } from './meta-comment';
import { MetaFactory } from './meta-factory';
import { PageModelToken } from './page';
import { PageEventBusService } from './page-events';
import { PageFactory } from './page-factory';
import { PageImpl, PageModel } from './page09';

export function PageModule(): ContainerModule {
  return new ContainerModule((bind) => {
    bind(PageEventBusService)
      .toDynamicValue(() => new Typed())
      .inSingletonScope()
      .when(() => typeof window !== 'undefined');
    bind(LinkRewriterService).to(LinkRewriterImpl).inSingletonScope();

    bind(ButtonFactory)
      .toSelf()
      .inSingletonScope()
      .onActivation((context, factory) => factory
        .register(TYPE_MANAGE_CONTENT_BUTTON, createManageContentButton)
        .register(TYPE_MANAGE_MENU_BUTTON, ({ _meta }: Menu) => _meta ?? {}));

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
      .onActivation((context, factory) => factory
        .register(TYPE_META_COMMENT, (model, position) => new MetaCommentImpl(model, position)));

    bind(ContentFactory).toFactory(({ container }) => (model: ContentModel) => {
      const scope = container.createChild();
      scope.bind(ContentImpl).toSelf();
      scope.bind(ContentModelToken).toConstantValue(model);

      return scope.get(ContentImpl);
    });

    bind(ComponentFactory)
      .toSelf()
      .inSingletonScope()
      .onActivation(({ container }, factory) => factory
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
        }));

    bind(PageFactory).toFactory(({ container }) => (model: PageModel) => {
      const scope = container.createChild();
      scope.bind(PageImpl).toSelf();
      scope.bind(PageModelToken).toConstantValue(model);

      return scope.get(PageImpl);
    });
  });
}

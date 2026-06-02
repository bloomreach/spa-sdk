/*
 * Copyright 2026 Bloomreach
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

/**
 * Composition root for the spa-sdk.
 *
 * SdkRuntime owns the full object graph for one SDK instance. Two layers:
 *
 * - Persistent: logger, CMS event bus, PostMessage and Cms — created once per
 *   runtime and reused across route changes so the CMS-to-SPA bridge survives.
 * - Per-page: URL builder, API, factories, page event bus, Spa — rebuilt fresh
 *   on every {@link SdkRuntime#createScope} call to prevent state leaking between pages.
 *
 * index.ts holds a single SdkRuntime instance. A future SSR wrapper can create
 * one per request instead, gaining full isolation without any API change.
 */

import { Typed } from 'emittery';

import { Cms } from './cms/cms';
import { CmsEvents, CmsEventBus } from './cms/cms-events';
import { PostMessage, PostMessageOptions } from './cms/post-message';
import { Logger } from './logger/logger';
import { ButtonFactory } from './page/button-factory';
import { createManageContentButton, TYPE_MANAGE_CONTENT_BUTTON } from './page/button-manage-content';
import {
  ComponentImpl,
  TYPE_COMPONENT,
  TYPE_COMPONENT_CONTAINER,
  TYPE_COMPONENT_CONTAINER_ITEM,
} from './page/component';
import { ComponentFactory } from './page/component-factory';
import { ContainerImpl } from './page/container';
import { ContainerItemImpl, ContainerItemModel } from './page/container-item';
import { ContentFactory } from './page/content-factory';
import { ContentModel } from './page/content';
import { DocumentImpl, DocumentModel, TYPE_DOCUMENT } from './page/document';
import { ImageSetImpl, ImageSetModel, TYPE_IMAGE_SET } from './page/image-set';
import { TYPE_LINK_INTERNAL } from './page/link';
import { LinkFactory } from './page/link-factory';
import { LinkRewriter } from './page/link-rewriter';
import { MenuImpl, MenuModel, Menu, TYPE_MANAGE_MENU_BUTTON, TYPE_MENU } from './page/menu';
import { MetaCollection } from './page/meta-collection';
import { PageImpl, PageFactories, PageContext } from './page/page';
import { PageEvents } from './page/page-events';
import { PageFactory } from './page/page-factory';
import { PaginationImpl, PaginationModel, TYPE_PAGINATION } from './page/pagination';
import { Api } from './spa/api';
import { Configuration } from './configuration';
import { Spa } from './spa/spa';
import { UrlBuilder } from './url/builder';

export class SdkRuntime {
  private logger: Logger | undefined;

  private cmsEventBus: CmsEventBus | undefined;

  private cmsEventBusResolved = false;

  // Widened to any: a single PostMessage instance is shared as both RPC client
  // and server, erasing the distinct procedure/event type parameters.
  private postMessage: PostMessage<any, any, any, any> | undefined;

  private cms: Cms | undefined;

  private currentSpa: Spa | undefined;

  // --- Persistent layer -----------------------------------------------------------------

  getLogger(): Logger {
    if (!this.logger) {
      this.logger = new Logger(console);
    }

    return this.logger;
  }

  getCmsEventBus(): CmsEventBus | undefined {
    if (!this.cmsEventBusResolved) {
      this.cmsEventBus = typeof window !== 'undefined' ? new Typed<CmsEvents>() : undefined;
      this.cmsEventBusResolved = true;
    }

    return this.cmsEventBus;
  }

  initializePreview(options: PostMessageOptions): void {
    if (!this.postMessage) {
      this.postMessage = new PostMessage(this.getLogger());
    }

    if (!this.cms) {
      this.cms = new Cms(this.postMessage, this.getCmsEventBus(), this.getLogger());
    }

    this.postMessage.initialize(options);
    this.cms.initialize(options);
  }

  // --- Per-page layer -------------------------------------------------------------------

  createScope(config: Configuration): Spa {
    const log = this.getLogger();
    const pageEventBus = typeof window !== 'undefined' ? new Typed<PageEvents>() : undefined;

    const urlBuilder = new UrlBuilder({ endpoint: config.endpoint, baseUrl: config.baseUrl });

    const linkFactory = new LinkFactory(new Map([
      [TYPE_LINK_INTERNAL, urlBuilder.getSpaUrl.bind(urlBuilder)],
    ]));

    const linkRewriter = new LinkRewriter(linkFactory);

    const buttonBuilders: [string, (...args: any[]) => MetaCollection][] = [
      [TYPE_MANAGE_CONTENT_BUTTON, createManageContentButton],
      [TYPE_MANAGE_MENU_BUTTON, (menu: Menu) => menu.getMeta()],
    ];
    const buttonFactory = new ButtonFactory(new Map(buttonBuilders));

    // The factory builders receive the generic ContentModel; the registered type guarantees
    // the concrete model shape at runtime, so each is narrowed to the matching model type.
    const contentBuilders: [string, (model: ContentModel) => unknown][] = [
      [TYPE_DOCUMENT, (model) => new DocumentImpl(model as DocumentModel, linkFactory)],
      [TYPE_IMAGE_SET, (model) => new ImageSetImpl(model as ImageSetModel, linkFactory)],
      [TYPE_MENU, (model) => new MenuImpl(model as MenuModel, linkFactory)],
      [TYPE_PAGINATION, (model) => new PaginationImpl(model as PaginationModel, linkFactory)],
    ];
    const contentFactory = new ContentFactory(new Map(contentBuilders));

    const componentFactory = new ComponentFactory(new Map([
      [TYPE_COMPONENT, (model, children) => new ComponentImpl(model, children, linkFactory)],
      [TYPE_COMPONENT_CONTAINER,
        (model, children) => new ContainerImpl(model, children, linkFactory)],
      [TYPE_COMPONENT_CONTAINER_ITEM, (model) => new ContainerItemImpl(
        model as ContainerItemModel,
        linkFactory,
        config,
        pageEventBus,
        log,
      )],
    ]));

    const pageFactories: PageFactories = {
      buttonFactory,
      componentFactory,
      contentFactory,
      linkFactory,
      linkRewriter,
    };
    const pageContext: PageContext = {
      apiOptions: config,
      cmsEventBus: this.getCmsEventBus(),
      pageEventBus,
      logger: log,
    };
    const pageFactory: PageFactory = (model) => new PageImpl(model, pageFactories, pageContext);

    const api = new Api(urlBuilder, config, log);
    const spa = new Spa(api, pageFactory, this.getCmsEventBus(), pageEventBus, log);

    this.currentSpa = spa;

    return spa;
  }

  destroyScope(): void {
    this.currentSpa?.destroy();
    this.currentSpa = undefined;
  }
}

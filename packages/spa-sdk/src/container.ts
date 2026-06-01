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
 * Replaces the former Inversify container with explicit, hand-wired construction.
 * Two layers mirror the previous base/child container split:
 *
 * - A persistent (process-level) layer — logger, CMS event bus, post-message and
 *   CMS clients — created lazily and reused across every {@link initialize} call.
 *   Reusing these is required so the CMS-to-SPA bridge survives SPA route changes.
 * - A per-page layer — URL builder, API client, factories, page event bus and the
 *   SPA instance — rebuilt on every {@link createScope} call for clean state.
 */

import { Typed } from 'emittery';

import { CmsImpl, Cms } from './cms/cms';
import { CmsEvents, CmsEventBus } from './cms/cms-events';
import { PostMessage, PostMessageOptions } from './cms/post-message';
import { ConsoleLogger } from './logger/console';
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
import { DocumentImpl, DocumentModel, TYPE_DOCUMENT } from './page/document';
import { ImageImpl, ImageFactory } from './page/image';
import { ImageSetImpl, ImageSetModel, TYPE_IMAGE_SET } from './page/image-set';
import { TYPE_LINK_INTERNAL } from './page/link';
import { LinkFactory } from './page/link-factory';
import { LinkRewriterImpl } from './page/link-rewriter';
import { MenuImpl, MenuModel, Menu, TYPE_MANAGE_MENU_BUTTON, TYPE_MENU } from './page/menu';
import { MenuItemImpl, MenuItemFactory } from './page/menu-item';
import { TYPE_META_COMMENT } from './page/meta';
import { MetaCollectionImpl } from './page/meta-collection';
import { MetaCollectionFactory } from './page/meta-collection-factory';
import { MetaCommentImpl } from './page/meta-comment';
import { MetaFactory } from './page/meta-factory';
import { PageImpl } from './page/page';
import { PageEvents } from './page/page-events';
import { PageFactory } from './page/page-factory';
import { PaginationImpl, PaginationModel, TYPE_PAGINATION } from './page/pagination';
import { PaginationItemImpl, PaginationItemFactory } from './page/pagination-item';
import { ApiImpl, ApiOptions } from './spa/api';
import { Spa } from './spa/spa';
import { UrlBuilderImpl, UrlBuilderOptions } from './url/builder';

// --- Persistent (process-level) layer ------------------------------------------------

let logger: Logger | undefined;
let cmsEventBus: CmsEventBus | undefined;
let cmsEventBusResolved = false;
// Default generic arguments are intentionally widened to `any` here: the former
// Inversify bindings aliased a single PostMessage instance to both the RPC client
// and server tokens, erasing their distinct procedure/event types at the boundary.
let postMessage: PostMessage<any, any, any, any> | undefined;
let cms: Cms | undefined;
let currentSpa: Spa | undefined;

/**
 * Returns the shared logger, creating it on first use.
 */
export function getLogger(): Logger {
  if (!logger) {
    logger = new ConsoleLogger(console);
  }

  return logger;
}

/**
 * Returns the shared CMS event bus, or `undefined` outside the browser.
 * The bus is gated on `window` to match the former environment-scoped binding,
 * and resolved once so the same instance bridges every page.
 */
function getCmsEventBus(): CmsEventBus | undefined {
  if (!cmsEventBusResolved) {
    cmsEventBus = typeof window !== 'undefined' ? new Typed<CmsEvents>() : undefined;
    cmsEventBusResolved = true;
  }

  return cmsEventBus;
}

/**
 * Initializes the preview-mode CMS integration.
 * The post-message and CMS clients are created lazily on first preview and reused
 * thereafter, matching the former process-singleton lifecycle.
 * @param options The CMS integration options.
 */
export function initializePreview(options: PostMessageOptions): void {
  if (!postMessage) {
    postMessage = new PostMessage(getLogger());
  }

  if (!cms) {
    cms = new CmsImpl(postMessage, postMessage, getCmsEventBus(), getLogger());
  }

  postMessage.initialize(options);
  cms.initialize(options);
}

// --- Per-page layer -------------------------------------------------------------------

/**
 * Builds the per-page object graph and returns the SPA instance.
 * Any previously created SPA is left untouched; call {@link destroyScope} first to
 * tear it down. Each call produces a fresh graph so no mutable state leaks between pages.
 * @param apiOptions Options for the Page Model API client.
 * @param urlOptions Options for the URL builder.
 */
export function createScope(apiOptions: ApiOptions, urlOptions: UrlBuilderOptions): Spa {
  const log = getLogger();
  const pageEventBus = typeof window !== 'undefined' ? new Typed<PageEvents>() : undefined;

  const urlBuilder = new UrlBuilderImpl(urlOptions);

  const linkFactory = new LinkFactory();
  linkFactory.register(TYPE_LINK_INTERNAL, urlBuilder.getSpaUrl.bind(urlBuilder));

  const linkRewriter = new LinkRewriterImpl(linkFactory);

  const metaFactory = new MetaFactory();
  metaFactory.register(TYPE_META_COMMENT, (model, position) => new MetaCommentImpl(model, position));

  const metaCollectionFactory: MetaCollectionFactory = (model) => new MetaCollectionImpl(model, metaFactory);

  const buttonFactory = new ButtonFactory(metaCollectionFactory);
  buttonFactory
    .register(TYPE_MANAGE_CONTENT_BUTTON, createManageContentButton)
    .register(TYPE_MANAGE_MENU_BUTTON, (menu: Menu) => menu.getMeta());

  const menuItemFactory: MenuItemFactory = (model) => new MenuItemImpl(model, linkFactory, menuItemFactory);

  const imageFactory: ImageFactory = (model) => new ImageImpl(model, linkFactory);

  const paginationItemFactory: PaginationItemFactory = (model) => new PaginationItemImpl(model, linkFactory);

  // The factory builders receive the generic ContentModel; the registered type guarantees
  // the concrete model shape at runtime, so each is narrowed to the matching model type.
  const contentFactory = new ContentFactory();
  contentFactory
    .register(TYPE_DOCUMENT, (model) => new DocumentImpl(model as DocumentModel, linkFactory, metaCollectionFactory))
    .register(TYPE_IMAGE_SET, (model) => new ImageSetImpl(model as ImageSetModel, imageFactory))
    .register(TYPE_MENU, (model) => new MenuImpl(model as MenuModel, metaCollectionFactory, menuItemFactory))
    .register(TYPE_PAGINATION, (model) => new PaginationImpl(model as PaginationModel, paginationItemFactory));

  const componentFactory = new ComponentFactory();
  componentFactory
    .register(
      TYPE_COMPONENT,
      (model, children) => new ComponentImpl(model, children, linkFactory, metaCollectionFactory),
    )
    .register(
      TYPE_COMPONENT_CONTAINER,
      (model, children) => new ContainerImpl(model, children, linkFactory, metaCollectionFactory),
    )
    .register(
      TYPE_COMPONENT_CONTAINER_ITEM,
      (model) => new ContainerItemImpl(
        model as ContainerItemModel,
        linkFactory,
        metaCollectionFactory,
        apiOptions,
        pageEventBus,
        log,
      ),
    );

  const pageFactory: PageFactory = (model) => new PageImpl(
    model,
    buttonFactory,
    componentFactory,
    contentFactory,
    linkFactory,
    linkRewriter,
    metaCollectionFactory,
    getCmsEventBus()!,
    apiOptions,
    pageEventBus,
    log,
  );

  const api = new ApiImpl(urlBuilder, apiOptions, log);
  const spa = new Spa(api, pageFactory, getCmsEventBus(), pageEventBus, log);

  currentSpa = spa;

  return spa;
}

/**
 * Destroys the current SPA scope, if any. The persistent layer is left intact.
 */
export function destroyScope(): void {
  currentSpa?.destroy();
  currentSpa = undefined;
}

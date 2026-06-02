/*
 * Copyright 2019-2026 Bloomreach
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

import { CmsEventBus } from '../cms';
import { Logger } from '../logger';
import { isAbsoluteUrl, resolveUrl } from '../url';
import { ButtonFactory } from './button-factory';
import { ManageContentButton, TYPE_MANAGE_CONTENT_BUTTON } from './button-manage-content';
import { Component, ComponentMeta, ComponentModel } from './component';
import { ComponentFactory } from './component-factory';
import { ContainerModel } from './container';
import { ContainerItemModel } from './container-item';
import { ContentModel } from './content';
import { ContentFactory } from './content-factory';
import { Document } from './document';
import { isLink, Link } from './link';
import { LinkFactory } from './link-factory';
import { LinkRewriter } from './link-rewriter';
import { Menu, TYPE_MANAGE_MENU_BUTTON } from './menu';
import { MetaCollection } from './meta-collection';
import { PageEventBus, PageUpdateEvent } from './page-events';
import { isReference, Reference, resolve } from './reference';
import { Visit, Visitor } from './relevance';
import { ApiOptions } from '../spa/api';

type ChannelParameters = Record<string, any>;
type PageLinks = 'self' | 'site';

/**
 * Current channel info.
 */
interface ChannelInfoModel {
  props: ChannelParameters;
}

/**
 * Current channel of a page.
 */
interface ChannelModel {
  info: ChannelInfoModel;
}

/**
 * Meta-data of a page root component.
 */
interface PageRootMeta extends ComponentMeta {
  pageTitle?: string;
}

/**
 * Model of a page root component.
 */
interface PageRootModel {
  meta: PageRootMeta;
}

/**
 * Meta-data of a page.
 */
interface PageMeta {
  /**
   * The page locale, e.g. en_US, nl_NL, etc
   */
  locale?: string;

  /**
   * The current Page Model version.
   */
  version?: string;

  /**
   * Meta-data about the current visitor. Available when the Relevance Module is enabled.
   * @see https://documentation.bloomreach.com/library/enterprise/enterprise-features/targeting/targeting.html
   */
  visitor?: Visitor;

  /**
   * Meta-data about the current visit. Available when the Relevance Module is enabled.
   * @see https://documentation.bloomreach.com/library/enterprise/enterprise-features/targeting/targeting.html
   */
  visit?: Visit;

  /**
   * Preview mode flag.
   */
  preview?: boolean;
}

/**
 * Model of a page.
 */
export interface PageModel {
  channel: ChannelModel;
  document?: Reference;
  links: Record<PageLinks, Link>;
  meta: PageMeta;
  page: Record<string, ((ComponentModel | ContainerItemModel | ContainerModel) & PageRootModel) | ContentModel>;
  root: Reference;
}

/**
 * The current page to render.
 */
export interface Page {
  /**
   * Generates a manage content button.
   * @return The manage content button meta-data.
   */
  getButton(type: typeof TYPE_MANAGE_CONTENT_BUTTON, button: ManageContentButton): MetaCollection;

  /**
   * Generates a manage menu button.
   * @return The menu button meta-data.
   */
  getButton(type: typeof TYPE_MANAGE_MENU_BUTTON, menu: Menu): MetaCollection;

  /**
   * Generates a meta-data collection for the Experience Manager buttons.
   * @return The button meta-data.
   */
  getButton(type: string, ...params: any[]): MetaCollection;

  /**
   * Gets current channel parameters.
   * @returns The channel parameters.
   */
  getChannelParameters<T extends ChannelParameters = ChannelParameters>(): T;

  /**
   * Gets a root component in the page.
   * @return The root component.
   */
  getComponent<T extends Component>(): T;

  /**
   * Gets a component in the page (e.g. `getComponent('main', 'right')`).
   * @param componentNames The names of the component and its parents.
   * @return The component, or `undefined` if no such component exists.
   */
  getComponent<T extends Component>(...componentNames: string[]): T | undefined;

  /**
   * Gets a content item used on the page.
   * @typeParam T The expected content type. Defaults to {@link Document}.
   * Pass an explicit type for non-document content — e.g. {@link ImageSet},
   * {@link Menu}, or {@link Pagination} — to get a correctly typed result.
   * @param reference The reference to the content. It can be an object containing
   * an [RFC-6901](https://tools.ietf.org/html/rfc6901) JSON Pointer.
   */
  getContent<T = Document>(reference: Reference | string): T | undefined;

  /**
   * Gets the page root document.
   * This option is available only along with the Experience Pages feature.
   */
  getDocument<T>(): T | undefined;

  /**
   * The page locale, defaults to en_US.
   */
  getLocale(): string;

  /**
   * @return The title of the page, or `undefined` if not configured.
   */
  getTitle(): string | undefined;

  /**
   * Generates a URL for a link object.
   * - If the link object type is internal, then it will prepend `baseUrl`.
   * - If the link object type is unknown, then it will return `undefined`.
   * - If the link parameter is omitted, then the link to the current page will be returned.
   * - In other cases, the link will be returned as-is.
   * @param link The link object to generate URL.
   */
  getUrl(link?: Link): string | undefined;

  /**
   * Generates an SPA URL for the path.
   * - If it is a relative path, it will resolve relative to the current page URL.
   * - If it is an absolute path, it will resolve relative to the `baseUrl` option.
   * @param path The path to generate URL.
   */
  getUrl(path: string): string;

  /**
   * @return The Page Model version.
   */
  getVersion(): string | undefined;

  /**
   * @return The current visitor data.
   */
  getVisitor(): Visitor | undefined;

  /**
   * @return The current visit data.
   */
  getVisit(): Visit | undefined;

  /**
   * @returns Whether the page is in the preview mode.
   */
  isPreview(): boolean;

  /**
   * Rewrite links to pages and resources in the HTML content.
   * This method looks up for `a` tags with `data-type` and `href` attributes and `img` tags with `src` attribute.
   * Links will be updated according to the configuration used to initialize the page.
   * @param content The HTML content to rewrite links.
   * @param type The content type.
   */
  rewriteLinks(content: string, type?: string): string;

  /**
   * Synchronizes the CMS integration state.
   */
  sync(): void;

  /**
   * @return A plain JavaScript object of the page model.
   */
  toJSON(): any;
}

/**
 * Build-time dependencies for {@link PageImpl}: the factories used to construct
 * and render page content.
 */
export interface PageFactories {
  buttonFactory: ButtonFactory;
  componentFactory: ComponentFactory;
  contentFactory: ContentFactory;
  linkFactory: LinkFactory;
  linkRewriter: LinkRewriter;
}

/**
 * Runtime context for {@link PageImpl}: API configuration, event buses and logging.
 */
export interface PageContext {
  apiOptions: ApiOptions;
  cmsEventBus?: CmsEventBus;
  pageEventBus?: PageEventBus;
  logger?: Logger;
}

export class PageImpl implements Page {
  protected content = new WeakMap<Record<string, any>, unknown>();

  protected root?: Component;

  private buttonFactory: ButtonFactory;

  private contentFactory: ContentFactory;

  private linkFactory: LinkFactory;

  private linkRewriter: LinkRewriter;

  private cmsEventBus: CmsEventBus | undefined;

  private apiOptions: ApiOptions;

  private logger: Logger | undefined;

  /**
   * @param model The raw page model from the Page Model API.
   * @param factories Build-time factories for constructing and rendering page content.
   * @param context Runtime API configuration, event buses and logger.
   */
  constructor(
    protected model: PageModel,
    factories: PageFactories,
    context: PageContext,
  ) {
    this.buttonFactory = factories.buttonFactory;
    this.contentFactory = factories.contentFactory;
    this.linkFactory = factories.linkFactory;
    this.linkRewriter = factories.linkRewriter;
    this.cmsEventBus = context.cmsEventBus;
    this.apiOptions = context.apiOptions;
    this.logger = context.logger;

    context.pageEventBus?.on('page.update', this.onPageUpdate.bind(this));

    this.root = factories.componentFactory.create(model, this.apiOptions.refPrefix);
  }

  protected onPageUpdate(event: PageUpdateEvent): void {
    Object.assign(this.model.page, event.page.page);
  }

  getButton(type: string, ...params: unknown[]): MetaCollection {
    return this.buttonFactory.create(type, ...params);
  }

  getChannelParameters<T>(): T {
    return this.model.channel.info.props as T;
  }

  getComponent<T extends Component>(): T;

  getComponent<T extends Component>(...componentNames: string[]): T | undefined;

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  getComponent(...componentNames: string[]) {
    return this.root?.getComponent(...componentNames);
  }

  getContent<T>(reference: Reference | string): T | undefined;

  getContent(reference: Reference | string): unknown | undefined {
    const model = resolve<ContentModel>(
      this.model,
      isReference(reference) ? reference : { $ref: `${this.apiOptions.refPrefix ?? '/page/'}${reference}` },
      this.apiOptions.refPrefix,
    );

    if (!model) {
      return undefined;
    }

    if (!this.content.has(model)) {
      this.content.set(model, this.contentFactory.create(model));
    }

    return this.content.get(model);
  }

  getDocument<T>(): T | undefined {
    return this.model.document && this.getContent(this.model.document);
  }

  getLocale(): string {
    return this.model.meta.locale || 'en_US';
  }

  getTitle(): string | undefined {
    return resolve<PageRootModel>(this.model, this.model.root, this.apiOptions.refPrefix)?.meta?.pageTitle;
  }

  getUrl(link?: Link): string | undefined;

  getUrl(path: string): string;

  getUrl(link?: Link | string): string | undefined {
    if (typeof link === 'undefined' || isLink(link) || isAbsoluteUrl(link)) {
      return this.linkFactory.create((link as Link) ?? this.model.links.site ?? '');
    }

    return resolveUrl(link, this.linkFactory.create(this.model.links.site) ?? '');
  }

  getVersion(): string | undefined {
    return this.model.meta.version;
  }

  getVisitor(): Visitor | undefined {
    return this.model.meta.visitor;
  }

  getVisit(): Visit | undefined {
    return this.model.meta.visit;
  }

  isPreview(): boolean {
    return !!this.model.meta.preview;
  }

  rewriteLinks(content: string, type = 'text/html'): string {
    return this.linkRewriter.rewrite(content, type);
  }

  sync(): void {
    this.cmsEventBus?.emit('page.ready', {});
  }

  toJSON(): PageModel {
    return this.model;
  }
}

/**
 * Checks whether a value is a page.
 * @param value The value to check.
 */
export function isPage(value: any): value is Page {
  return value instanceof PageImpl;
}

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

import { inject, injectable, optional } from 'inversify';
import { CmsEventBusProvider, CmsEventBusServiceProvider } from '../cms';
import { Logger } from '../logger';
import { ButtonFactory } from './button-factory';
import { Component, ComponentMeta } from './component';
import { ComponentFactory } from './component-factory09';
import { ComponentModel } from './component09';
import { ContainerItemModel } from './container-item09';
import { ContainerModel } from './container09';
import { ContentFactory } from './content-factory09';
import { Content, ContentModel } from './content09';
import { PageEventBusService } from './page-events';
import { EventBus, PageUpdateEvent } from './events09';
import { Link, TYPE_LINK_INTERNAL } from './link';
import { LinkFactory } from './link-factory';
import { LinkRewriter, LinkRewriterService } from './link-rewriter';
import { MetaCollection, MetaCollectionModel } from './meta-collection';
import { MetaCollectionFactory } from './meta-collection-factory';
import { Page, PageModel as PageModel10, PageModelToken } from './page';
import { isReference, Reference } from './reference';
import { Visit, Visitor } from './relevance';

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
  _meta: PageRootMeta;
}

/**
 * Model of a page.
 */
export interface PageModel {
  _links: PageModel10['links'];
  _meta: PageModel10['meta'];
  channel?: PageModel10['channel'];
  content?: { [reference: string]: ContentModel };
  page: (ComponentModel | ContainerItemModel | ContainerModel) & PageRootModel;
}

@injectable()
export class PageImpl implements Page {
  protected content: Map<string, Content>;

  protected root: Component;

  constructor(
    @inject(PageModelToken) protected model: PageModel,
    @inject(ButtonFactory) private buttonFactory: ButtonFactory,
    @inject(ComponentFactory) componentFactory: ComponentFactory,
    @inject(ContentFactory) private contentFactory: ContentFactory,
    @inject(LinkFactory) private linkFactory: LinkFactory,
    @inject(LinkRewriterService) private linkRewriter: LinkRewriter,
    @inject(MetaCollectionFactory) private metaFactory: MetaCollectionFactory,
    @inject(CmsEventBusServiceProvider) private cmsEventBusProvider: CmsEventBusProvider,
    @inject(PageEventBusService) @optional() eventBus?: EventBus,
    @inject(Logger) @optional() private logger?: Logger,
  ) {
    eventBus?.on('page.update', this.onPageUpdate.bind(this));

    this.root = componentFactory.create(model.page);
    this.content = new Map(Object.entries(model.content || {}).map(([alias, m]) => [alias, this.contentFactory(m)]));
  }

  protected onPageUpdate(event: PageUpdateEvent): void {
    Object.entries((event.page as PageModel).content || {}).forEach(([alias, model]) =>
      this.content.set(alias, this.contentFactory(model)),
    );
  }

  private static getContentReference(reference: Reference): string {
    return reference.$ref.split('/', 3)[2] || '';
  }

  getButton(type: string, ...params: unknown[]): MetaCollection {
    return this.buttonFactory.create(type, ...params);
  }

  getChannelParameters<T>(): T {
    return (this.model.channel?.info.props ?? {}) as T;
  }

  getComponent<T extends Component>(): T;

  getComponent<T extends Component>(...componentNames: string[]): T | undefined;

  getComponent(...componentNames: string[]): Component | undefined {
    return this.root.getComponent(...componentNames);
  }

  getContent(reference: Reference | string): Content | undefined {
    const contentReference = isReference(reference) ? PageImpl.getContentReference(reference) : reference;

    return this.content.get(contentReference);
  }

  getDocument<T>(): T | undefined {
    throw new Error('The page document is not supported by this version of the Page Model API.');
  }

  getLocale(): string {
    throw new Error('The locale is not supported by this version of the Page Model API.');
  }

  getMeta(meta: MetaCollectionModel): MetaCollection {
    return this.metaFactory(meta);
  }

  getTitle(): string | undefined {
    return this.model.page._meta.pageTitle;
  }

  getUrl(link?: Link): string | undefined;

  getUrl(path: string): string;

  getUrl(link?: Link | string): string | undefined {
    return this.linkFactory.create((link as Link) ?? { ...this.model._links.site, type: TYPE_LINK_INTERNAL });
  }

  getVersion(): string | undefined {
    return this.model._meta.version;
  }

  getVisitor(): Visitor | undefined {
    return this.model._meta.visitor;
  }

  getVisit(): Visit | undefined {
    return this.model._meta.visit;
  }

  isPreview(): boolean {
    return !!this.model._meta.preview;
  }

  async rewriteLinks(content: string, type = 'text/html'): Promise<string> {
    return this.linkRewriter.rewrite(content, type);
  }

  async sync(): Promise<void> {
    const cmsEventBus = await this.cmsEventBusProvider();
    cmsEventBus?.emit('page.ready', {});
  }

  toJSON(): PageModel {
    return this.model;
  }

  async sanitize(content: string): Promise<string> {
    const { default: sanitizeHtml } = await import('sanitize-html');
    return sanitizeHtml(content, { allowedAttributes: { a: ['href', 'name', 'target', 'title', 'data-type', 'rel'] } });
  }

  async prepareHTML(documentRef?: Reference, dataFieldName?: string): Promise<string | null> {
    const document = documentRef && this.getContent(documentRef);
    if (!document) {
      this.logger?.warn(`Document reference "${documentRef}" not found in page model`);
      return null;
    }

    const data = document.getData();
    const htmlContent = dataFieldName && data?.[dataFieldName];
    if (!htmlContent) {
      this.logger?.warn(`Data field name "${dataFieldName}" not found in document data model`);
      return null;
    }

    return this.rewriteLinks(await this.sanitize(htmlContent.value));
  }
}

/**
 * Checks whether a value is a page.
 * @param value The value to check.
 */
export function isPage(value: any): value is Page {
  return value instanceof PageImpl;
}

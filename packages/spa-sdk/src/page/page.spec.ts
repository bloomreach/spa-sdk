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
import { CmsEventBus } from '../cms';
import { ButtonFactory } from './button-factory';
import { Component, TYPE_COMPONENT } from './component';
import { ComponentFactory } from './component-factory';
import { ContentModel } from './content';
import { ContentFactory } from './content-factory';
import { isLink, Link, TYPE_LINK_EXTERNAL, TYPE_LINK_INTERNAL } from './link';
import { LinkFactory } from './link-factory';
import { LinkRewriter } from './link-rewriter';
import { MetaCollectionFactory } from './meta-collection-factory';
import { isPage, Page, PageImpl, PageModel } from './page';
import { PageEventBus } from './page-events';

let buttonFactory: jest.Mocked<ButtonFactory>;
let componentFactory: jest.Mocked<ComponentFactory>;
let content: unknown;
let contentFactory: jest.Mocked<ContentFactory>;
let cmsEventBus: CmsEventBus;
let eventBus: PageEventBus;
let linkFactory: jest.Mocked<LinkFactory>;
let linkRewriter: jest.Mocked<LinkRewriter>;
let metaFactory: jest.MockedFunction<MetaCollectionFactory>;
let root: Component;

const model = {
  channel: {
    info: {
      props: {},
    },
  },
  links: {
    self: { href: 'self-url', type: TYPE_LINK_EXTERNAL },
    site: { href: 'site-url', type: TYPE_LINK_INTERNAL },
  },
  meta: {},
  page: {
    root: { id: 'id', meta: {}, type: TYPE_COMPONENT },
  },
  root: { $ref: '/page/root' },
} as PageModel;

function createPage(pageModel = model) {
  return new PageImpl(
    pageModel,
    buttonFactory,
    componentFactory,
    contentFactory,
    linkFactory,
    linkRewriter,
    metaFactory,
    cmsEventBus,
    eventBus,
  );
}

beforeEach(() => {
  buttonFactory = { create: jest.fn() } as unknown as typeof buttonFactory;
  componentFactory = { create: jest.fn(() => root) } as unknown as typeof componentFactory;
  content = {};
  contentFactory = { create: jest.fn(() => content) } as unknown as typeof contentFactory;
  cmsEventBus = new Typed();
  eventBus = new Typed();
  linkFactory = { create: jest.fn() } as unknown as typeof linkFactory;
  linkRewriter = { rewrite: jest.fn() } as unknown as jest.Mocked<LinkRewriter>;
  metaFactory = jest.fn();
  root = { getComponent: jest.fn() } as unknown as jest.Mocked<Component>;
});

describe('PageImpl', () => {
  describe('getButton', () => {
    it('should delegate to the ButtonFactory to create button', () => {
      const page = createPage();
      const testModel = {};

      page.getButton('something', testModel);

      expect(buttonFactory.create).toHaveBeenCalledWith('something', testModel);
    });
  });

  describe('getChannelParameters', () => {
    it('should return channel info parameters', () => {
      const page = createPage();

      expect(page.getChannelParameters()).toBe(model.channel.info.props);
    });
  });

  describe('getComponent', () => {
    it('should forward a call to the root component', () => {
      const page = createPage();
      page.getComponent('a', 'b');

      expect(root.getComponent).toBeCalledWith('a', 'b');
    });
  });

  describe('getContent', () => {
    let page: Page;

    beforeEach(() => {
      page = createPage({
        ...model,
        page: {
          ...model.page,
          content1: { id: 'id1', type: 'document' } as ContentModel,
          content2: { id: 'id2', type: 'document' } as ContentModel,
        },
      });
    });

    it('should return a content item', () => {
      expect(page.getContent('content1')).toBe(content);
      expect(page.getContent('content1')).toBe(content);
      expect(contentFactory.create).toBeCalledTimes(1);
      expect(contentFactory.create).toHaveBeenCalledWith({ id: 'id1', type: 'document' });
    });

    it('should return a content item by reference', () => {
      expect(page.getContent({ $ref: '/page/content2' })).toBe(content);
      expect(contentFactory.create).toHaveBeenCalledWith({ id: 'id2', type: 'document' });
    });
  });

  describe('getDocument', () => {
    it('should return a page document', () => {
      const page = createPage({
        ...model,
        document: { $ref: 'something' },
      });

      jest.spyOn(page, 'getContent').mockReturnValue('document');

      expect(page.getDocument()).toBe('document');
      expect(page.getContent).toHaveBeenCalledWith({ $ref: 'something' });
    });

    it('should return an undefined value', () => {
      const page = createPage();

      expect(page.getDocument()).toBeUndefined();
    });
  });

  describe('getMeta', () => {
    it('should delegate to the MetaFactory to create new meta', () => {
      const page = createPage();
      const testModel = {};

      page.getMeta(testModel);

      expect(metaFactory).toHaveBeenCalledWith(testModel);
    });
  });

  describe('getTitle', () => {
    it('should return a page title', () => {
      const page = createPage({
        ...model,
        page: {
          root: { ...model.page.root, meta: { pageTitle: 'something' } },
        } as PageModel['page'],
      });

      expect(page.getTitle()).toBe('something');
    });

    it('should return an undefined value', () => {
      const page = createPage();

      expect(page.getTitle()).toBeUndefined();
    });
  });

  describe('getUrl', () => {
    it('should pass a link to the link factory', () => {
      const link = { href: '' };
      const page = createPage();
      linkFactory.create.mockReturnValueOnce('url');

      expect(page.getUrl(link)).toBe('url');
      expect(linkFactory.create).toBeCalledWith(link);
    });

    it('should pass the current page link', () => {
      const page = createPage();
      linkFactory.create.mockReturnValueOnce('url');

      expect(page.getUrl()).toBe('url');
      expect(linkFactory.create).toBeCalledWith({ href: 'site-url', type: TYPE_LINK_INTERNAL });
    });

    it.each`
      link            | base       | expected
      ${'something'}  | ${'/news'} | ${'/news/something'}
      ${'/something'} | ${'/news'} | ${'/something'}
      ${'something'}  | ${'/'}     | ${'/something'}
      ${'?page=1'}    | ${'/news'} | ${'/news?page=1'}
    `('should resolve "$link" to "$expected" relative to "$base"', ({ link, base, expected }) => {
      const page = createPage({
        ...model,
        links: {
          ...model.links,
          site: { ...model.links.site, href: base },
        },
      });
      linkFactory.create.mockImplementationOnce(
        ((mockLink?: Link | string) => (isLink(mockLink) ? mockLink.href : mockLink)) as typeof linkFactory.create,
      );

      expect(page.getUrl(link)).toBe(expected);
    });
  });

  describe('getLocale', () => {
    it('should return nl_NL', () => {
      const page = createPage({ ...model, meta: { locale: 'nl_NL' } });

      expect(page.getLocale()).toBe('nl_NL');
    });

    it('defaults to en_US', () => {
      const page = createPage();

      expect(page.getLocale()).toBe('en_US');
    });
  });

  describe('getVersion', () => {
    it('should return a version', () => {
      const page = createPage({
        ...model,
        meta: { version: '1.0' },
      });

      expect(page.getVersion()).toEqual('1.0');
    });

    it('should return an undefined value', () => {
      const page = createPage();

      expect(page.getVersion()).toBeUndefined();
    });
  });

  describe('getVisitor', () => {
    it('should return a visitor', () => {
      const page = createPage({
        ...model,
        meta: {
          visitor: {
            id: 'some-id',
            header: 'some-header',
            new: false,
          },
        },
      });

      expect(page.getVisitor()).toEqual({
        id: 'some-id',
        header: 'some-header',
        new: false,
      });
    });

    it('should return an undefined value', () => {
      const page = createPage();

      expect(page.getVisitor()).toBeUndefined();
    });
  });

  describe('getVisit', () => {
    it('should return a visit', () => {
      const page = createPage({
        ...model,
        meta: {
          visit: {
            id: 'some-id',
            new: false,
          },
        },
      });

      expect(page.getVisit()).toEqual({
        id: 'some-id',
        new: false,
      });
    });

    it('should return an undefined value', () => {
      const page = createPage();

      expect(page.getVisit()).toBeUndefined();
    });
  });

  describe('isPreview', () => {
    it('should return true', () => {
      const page = createPage({ ...model, meta: { preview: true } });

      expect(page.isPreview()).toBe(true);
    });

    it('should return false', () => {
      const page = createPage();

      expect(page.isPreview()).toBe(false);
    });
  });

  describe('onPageUpdate', () => {
    it('should update content on page.update event', async () => {
      const page = createPage();

      expect(page.getContent('content')).toBeUndefined();

      await eventBus.emitSerial('page.update', {
        page: {
          ...model,
          page: {
            content: { id: 'id', type: 'document' } as ContentModel,
          },
        },
      });

      expect(page.getContent('content')).toBe(content);
      expect(contentFactory.create).toBeCalledWith({ id: 'id', type: 'document' });
    });
  });

  describe('rewriteLinks', () => {
    it('should pass a call to the link rewriter', () => {
      linkRewriter.rewrite.mockReturnValueOnce('rewritten');

      const page = createPage();

      expect(page.rewriteLinks('something', 'text/html')).toBe('rewritten');
      expect(linkRewriter.rewrite).toBeCalledWith('something', 'text/html');
    });
  });

  describe('sync', () => {
    it('should emit page.ready event', () => {
      jest.spyOn(cmsEventBus, 'emit');

      const page = createPage();
      page.sync();

      expect(cmsEventBus.emit).toBeCalledWith('page.ready', {});
    });
  });

  describe('toJSON', () => {
    it('should return a page model', () => {
      const page = createPage();

      expect(page.toJSON()).toBe(model);
    });
  });
});

describe('isPage', () => {
  it('should return true', () => {
    const page = createPage();

    expect(isPage(page)).toBe(true);
  });

  it('should return false', () => {
    expect(isPage(undefined)).toBe(false);
    expect(isPage({})).toBe(false);
  });
});

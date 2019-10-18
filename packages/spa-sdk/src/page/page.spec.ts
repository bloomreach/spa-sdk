/*
 * Copyright 2019 Hippo B.V. (http://www.onehippo.com)
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
import { Component, TYPE_COMPONENT } from './component';
import { ContentModel, Content } from './content';
import { Events } from '../events';
import { Factory } from './factory';
import { MetaCollectionModel, Meta } from './meta';
import { PageImpl, PageModel, Page } from './page';

describe('PageImpl', () => {
  let content: Content;
  let contentFactory: jest.Mocked<Factory<[ContentModel], Content>>;
  let eventBus: Typed<Events>;
  let metaFactory: jest.Mocked<Factory<[MetaCollectionModel], Meta[]>>;
  let root: Component;

  function createPage(model: PageModel) {
    return new PageImpl(model, root, contentFactory, eventBus, metaFactory);
  }

  beforeEach(() => {
    content = {} as jest.Mocked<Content>;
    contentFactory = { create: jest.fn() };
    eventBus = new Typed<Events>();
    metaFactory = { create: jest.fn() };
    root = { getComponent: jest.fn() } as unknown as jest.Mocked<Component>;

    contentFactory.create.mockReturnValue(content);
  });

  describe('getComponent', () => {
    it('should forward a call to the root component', () => {
      const page = createPage({ page: { id: 'id', type: TYPE_COMPONENT } });
      page.getComponent('a', 'b');

      expect(root.getComponent).toBeCalledWith('a', 'b');
    });
  });

  describe('getContent', () => {
    let page: Page;

    beforeEach(() => {
      page = createPage({
        content: {
          content1: { id: 'id1', name: 'content1' },
          content2: { id: 'id2', name: 'content2' },
        },
        page: { id: 'id', type: TYPE_COMPONENT },
      });
    });

    it('should create content instances', () => {
      expect(contentFactory.create).toBeCalledTimes(2);
      expect(contentFactory.create).nthCalledWith(1, { id: 'id1', name: 'content1' });
      expect(contentFactory.create).nthCalledWith(2, { id: 'id2', name: 'content2' });
    });

    it('should return a content item', () => {
      expect(page.getContent('content1')).toBe(content);
    });
  });

  describe('getMeta', () => {
    it('should delegate to the MetaFactory to create new meta', () => {
      const metaFactoryCreateSpy = jest.spyOn(metaFactory, 'create');
      const page = createPage({ page: { id: 'id', type: TYPE_COMPONENT } });

      const metaCollectionModel = {} as MetaCollectionModel;
      page.getMeta(metaCollectionModel);

      expect(metaFactoryCreateSpy).toHaveBeenCalledWith(metaCollectionModel);
    });
  });

  describe('getTitle', () => {
    it('should return a page title', () => {
      const page = createPage({
        page: {
          id: 'id',
          type: TYPE_COMPONENT,
          _meta: { pageTitle: 'something' },
        },
      });

      expect(page.getTitle()).toBe('something');
    });

    it('should return an undefined value', () => {
      const page1 = createPage({ page: { id: 'id', type: TYPE_COMPONENT, _meta: {} } });
      const page2 = createPage({ page: { id: 'id', type: TYPE_COMPONENT } });

      expect(page1.getTitle()).toBeUndefined();
      expect(page2.getTitle()).toBeUndefined();
    });
  });

  describe('isPreview', () => {
    it('should return true', () => {
      const page = createPage({
        page: { id: 'id', type: TYPE_COMPONENT },
        _meta: { preview: true },
      });

      expect(page.isPreview()).toBe(true);
    });

    it('should return false', () => {
      const page1 = createPage({ page: { id: 'id', type: TYPE_COMPONENT, _meta: {} } });
      const page2 = createPage({ page: { id: 'id', type: TYPE_COMPONENT } });

      expect(page1.isPreview()).toBe(false);
      expect(page2.isPreview()).toBe(false);
    });
  });

  describe('onPageUpdate', () => {
    it('should update content on page.update event', async () => {
      const page = createPage({ page: { id: 'id', type: TYPE_COMPONENT } });

      expect(page.getContent('content')).toBeUndefined();

      await eventBus.emitSerial('page.update', { page: {
        content: {
          content: { id: 'id', name: 'content' },
        },
        page: { id: 'id', type: TYPE_COMPONENT },
      } });

      expect(contentFactory.create).toBeCalledWith({ id: 'id', name: 'content' });
      expect(page.getContent('content')).toBe(content);
    });
  });

  describe('sync', () => {
    it('should emit page.ready event', () => {
      spyOn(eventBus, 'emit');

      const page = createPage({ page: { id: 'id', type: TYPE_COMPONENT } });
      page.sync();

      expect(eventBus.emit).toBeCalledWith('page.ready', {});
    });
  });
});

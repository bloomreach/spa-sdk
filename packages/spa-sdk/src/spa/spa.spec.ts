/*
 * Copyright 2019-2023 Bloomreach
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
import { Component, EventBus, Page, PageFactory, PageModel, TYPE_COMPONENT } from '../page';
import { Api } from './api';
import { Spa } from './spa';

jest.mock('../url');

const model = {
  _meta: {},
  content: {
    someContent: { id: 'content-id', name: 'content-name' },
  },
  page: {
    id: 'page-id',
    type: TYPE_COMPONENT,
    _links: {
      componentRendering: { href: 'some-url' },
    },
  },
};
const config = {
  httpClient: jest.fn(),
  request: { path: '/' },
};

describe('Spa', () => {
  let api: jest.Mocked<Api>;
  let eventBus: EventBus;
  let page: jest.Mocked<Page>;
  let pageFactory: jest.MockedFunction<PageFactory>;
  let spa: Spa;

  beforeEach(() => {
    eventBus = new Typed();
    api = {
      initialize: jest.fn(),
      getPage: jest.fn(async () => model),
      getComponent: jest.fn(() => model),
    } as unknown as jest.Mocked<Api>;
    page = {
      getComponent: jest.fn(),
      isPreview: jest.fn(),
    } as unknown as jest.Mocked<Page>;
    pageFactory = jest.fn();

    pageFactory.mockReturnValue(page);
    spa = new Spa(api, pageFactory, eventBus);
  });

  describe('initialize', () => {
    beforeEach(async () => spa.initialize(config.request.path));

    it('should get page through an API', () => {
      expect(api.getPage).toBeCalledWith(config.request.path);
    });

    it('should use a page model from the arguments', () => {
      jest.clearAllMocks();
      const pageModel = {} as PageModel;

      spa.initialize(pageModel);
      expect(api.getPage).not.toBeCalled();
      expect(pageFactory).toBeCalledWith(pageModel);
    });

    it('should create a page instance', () => {
      expect(pageFactory).toBeCalledWith(model);
    });

    it('should reject a promise when fetching the page model fails', () => {
      const error = new Error('Failed to fetch page model data');
      api.getPage.mockImplementationOnce(async () => {
        throw error;
      });
      const promise = spa.initialize(config.request.path);

      expect.assertions(1);
      expect(promise).rejects.toBe(error);
    });
  });

  describe('onCmsUpdate', () => {
    let component: jest.Mocked<Component>;
    let root: jest.Mocked<Component>;

    beforeEach(async () => {
      root = { getComponentById: jest.fn() } as unknown as jest.Mocked<Component>;
      component = { getUrl: jest.fn() } as unknown as jest.Mocked<Component>;

      page.getComponent.mockReturnValue(root);
      page.isPreview.mockReturnValue(true);
      jest.spyOn(eventBus, 'emit');
      await spa.initialize(config.request.path);

      jest.clearAllMocks();
    });

    it('should not proceed if a component does not exist', async () => {
      await spa.onCmsUpdate({ id: 'some-component', properties: {} });

      expect(root.getComponentById).toBeCalledWith('some-component');
      expect(api.getComponent).not.toBeCalled();
      expect(eventBus.emit).not.toBeCalledWith('page.update', expect.anything());
    });

    describe('on component update', () => {
      beforeEach(async () => {
        root.getComponentById.mockReturnValue(component);
        component.getUrl.mockReturnValue('some-url');
        await spa.onCmsUpdate({ id: 'page-id', properties: { a: 'b' } });
      });

      it('should request a component model', () => {
        expect(component.getUrl).toBeCalled();
        expect(api.getComponent).toBeCalledWith('some-url', { a: 'b' });
      });

      it('should emit page.update event', () => {
        expect(eventBus.emit).toBeCalledWith('page.update', { page: model });
      });
    });
  });

  describe('destroy', () => {
    beforeEach(() => spa.initialize(config.request.path));

    it('should remove all page events', async () => {
      jest.spyOn(eventBus, 'clearListeners');

      await spa.destroy();

      expect(eventBus.clearListeners).toBeCalled();
    });
  });
});

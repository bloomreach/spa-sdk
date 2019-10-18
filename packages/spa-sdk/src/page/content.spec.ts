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

import { ContentImpl, ContentModel } from './content';
import { Factory } from './factory';
import { Link } from './link';
import { MetaCollectionModel, MetaImpl, Meta, META_POSITION_BEGIN } from './meta';

let linkFactory: jest.Mocked<Factory<[Link], string>>;
let metaFactory: jest.Mocked<Factory<[MetaCollectionModel], Meta[]>>;

function createContent(model: ContentModel) {
  return new ContentImpl(model, linkFactory, metaFactory);
}

beforeEach(() => {
  linkFactory = { create: jest.fn() };
  metaFactory = { create: jest.fn() };
});

describe('ContentImpl', () => {
  describe('getId', () => {
    it('should return a content item id', () => {
      const content = createContent({ id: 'some-id', name: 'some-name' });

      expect(content.getId()).toBe('some-id');
    });
  });

  describe('getLocale', () => {
    it('should return a content item locale', () => {
      const content = createContent({ id: 'some-id', name: 'some-name', localeString: 'some-locale' });

      expect(content.getLocale()).toBe('some-locale');
    });

    it('should return undefined when there is no locale', () => {
      const content = createContent({ id: 'some-id', name: 'some-name' });

      expect(content.getLocale()).toBeUndefined();
    });
  });

  describe('getMeta', () => {
    it('should return a meta-data array', () => {
      const metaModel = {};
      const meta = new MetaImpl({ data: '', type: 'comment' }, META_POSITION_BEGIN);
      metaFactory.create.mockReturnValueOnce([meta]);

      const content = createContent({ id: 'some-id', name: 'some-name', _meta: metaModel });

      expect(metaFactory.create).toBeCalledWith(metaModel);
      expect(content.getMeta()).toEqual([meta]);
    });

    it('should pass an empty object if there is no meta-data', () => {
      createContent({ id: 'some-id', name: 'some-name' });

      expect(metaFactory.create).toBeCalledWith({});
    });
  });

  describe('getName', () => {
    it('should return a content item name', () => {
      const content = createContent({ id: 'some-id', name: 'some-name' });

      expect(content.getName()).toBe('some-name');
    });
  });

  describe('getData', () => {
    it('should return a content item data', () => {
      const content = createContent({ id: 'some-id', name: 'some-name' });

      expect(content.getData()).toEqual({ id: 'some-id', name: 'some-name' });
    });
  });

  describe('getUrl', () => {
    it('should return a content url', () => {
      const content = createContent({ id: 'some-id', name: 'some-name', _links: { site: { href: 'url' } } });
      linkFactory.create.mockReturnValueOnce('url');

      expect(content.getUrl()).toBe('url');
      expect(linkFactory.create).toBeCalledWith({ href: 'url' });
    });

    it('should return undefined when content links are missing', () => {
      const content = createContent({ id: 'some-id', name: 'some-name' });

      expect(content.getUrl()).toBeUndefined();
    });
  });
});

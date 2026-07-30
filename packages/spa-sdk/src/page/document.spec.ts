/*
 * Copyright 2020-2026 Bloomreach
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

import { DocumentImpl, DocumentModel, TYPE_DOCUMENT, getDocuments, isDocument } from './document';
import { LinkFactory } from './link-factory';
import { MetaCollectionImpl, MetaCollection } from './meta-collection';
import { Page } from './page';

jest.mock('./meta-collection');

let linkFactory: jest.Mocked<LinkFactory>;

const model = {
  links: { site: { href: 'url' } },
  data: {
    id: 'some-id',
    name: 'some-name',
  },
  type: TYPE_DOCUMENT,
} as DocumentModel;

function createDocument(contentModel = model) {
  return new DocumentImpl(contentModel, linkFactory);
}

beforeEach(() => {
  linkFactory = { create: jest.fn() } as unknown as typeof linkFactory;
});

describe('DocumentImpl', () => {
  describe('getId', () => {
    it('should return a document id', () => {
      const document = createDocument();

      expect(document.getId()).toBe('some-id');
    });
  });

  describe('getLocale', () => {
    it('should return a document locale', () => {
      const document = createDocument({ ...model, data: { ...model.data, localeString: 'some-locale' } });

      expect(document.getLocale()).toBe('some-locale');
    });

    it('should return undefined when there is no locale', () => {
      const document = createDocument();

      expect(document.getLocale()).toBeUndefined();
    });
  });

  describe('getMeta', () => {
    it('should return a meta-data array', () => {
      const metaModel = {};
      const meta = {} as MetaCollection;
      jest.mocked(MetaCollectionImpl).mockReturnValueOnce(meta as unknown as MetaCollectionImpl);

      const document = createDocument({ ...model, meta: metaModel });

      expect(MetaCollectionImpl).toHaveBeenCalledWith(metaModel);
      expect(document.getMeta()).toEqual(meta);
    });

    it('should pass an empty object if there is no meta-data', () => {
      createDocument();

      expect(MetaCollectionImpl).toHaveBeenCalledWith({});
    });
  });

  describe('getName', () => {
    it('should return a document name', () => {
      const document = createDocument();

      expect(document.getName()).toBe('some-name');
    });
  });

  describe('getData', () => {
    it('should return a document data', () => {
      const document = createDocument();

      expect(document.getData()).toEqual(expect.objectContaining({ id: 'some-id', name: 'some-name' }));
    });
  });

  describe('getUrl', () => {
    it('should return a document url', () => {
      const document = createDocument();
      linkFactory.create.mockReturnValueOnce('url');

      expect(document.getUrl()).toBe('url');
      expect(linkFactory.create).toHaveBeenCalledWith({ href: 'url' });
    });
  });
});

describe('isDocument', () => {
  it('should return true', () => {
    const document = createDocument();

    expect(isDocument(document)).toBe(true);
  });

  it('should return false', () => {
    expect(isDocument(undefined)).toBe(false);
    expect(isDocument({})).toBe(false);
  });
});

describe('getDocuments', () => {
  let page: jest.Mocked<Page>;

  beforeEach(() => {
    page = { getContent: jest.fn() } as unknown as jest.Mocked<Page>;
  });

  it('should return an empty array when given no references', () => {
    expect(getDocuments(page, [])).toEqual([]);
    expect(page.getContent).not.toHaveBeenCalled();
  });

  it('should resolve each reference to a document', () => {
    const first = createDocument({ ...model, data: { ...model.data, id: 'first' } });
    const second = createDocument({ ...model, data: { ...model.data, id: 'second' } });
    page.getContent.mockReturnValueOnce(first).mockReturnValueOnce(second);

    const documents = getDocuments(page, [{ $ref: '/page/first' }, { $ref: '/page/second' }]);

    expect(documents).toEqual([first, second]);
    expect(page.getContent).toHaveBeenNthCalledWith(1, { $ref: '/page/first' });
    expect(page.getContent).toHaveBeenNthCalledWith(2, { $ref: '/page/second' });
  });

  it('should omit references that cannot be resolved to a document', () => {
    const resolved = createDocument();
    page.getContent.mockReturnValueOnce(undefined).mockReturnValueOnce(resolved);

    const documents = getDocuments(page, [{ $ref: '/page/missing' }, { $ref: '/page/present' }]);

    expect(documents).toEqual([resolved]);
  });

  it('should omit resolved content that is not a document', () => {
    page.getContent.mockReturnValueOnce({ notADocument: true } as any);

    const documents = getDocuments(page, [{ $ref: '/page/wrong-type' }]);

    expect(documents).toEqual([]);
  });

  it('should accept string references', () => {
    const resolved = createDocument();
    page.getContent.mockReturnValueOnce(resolved);

    expect(getDocuments(page, ['some-ref'])).toEqual([resolved]);
    expect(page.getContent).toHaveBeenCalledWith('some-ref');
  });
});

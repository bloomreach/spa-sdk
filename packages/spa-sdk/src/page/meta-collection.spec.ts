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

import { isMetaCollection, MetaCollectionImpl, MetaCollectionModel } from './meta-collection';
import { META_POSITION_BEGIN, META_POSITION_END, TYPE_META_COMMENT } from './meta';
import { MetaCommentImpl } from './meta-comment';

function createMetaCollection(model = {} as MetaCollectionModel) {
  return new MetaCollectionImpl(model);
}

describe('MetaCollectionImpl', () => {
  describe('constructor', () => {
    it('should extend a built-in array class', () => {
      const collection = createMetaCollection();

      expect(collection).toBeInstanceOf(Array);
    });

    it('should build MetaCommentImpl for each span item', () => {
      const collection = createMetaCollection({
        beginNodeSpan: [
          { data: '<!--meta1-->', type: TYPE_META_COMMENT },
          { data: '<!--meta2-->', type: TYPE_META_COMMENT },
        ],
        endNodeSpan: [{ data: '<!--meta3-->', type: TYPE_META_COMMENT }],
      });

      expect(collection).toHaveLength(3);
      expect(collection[0]).toBeInstanceOf(MetaCommentImpl);
      expect(collection[1]).toBeInstanceOf(MetaCommentImpl);
      expect(collection[2]).toBeInstanceOf(MetaCommentImpl);
    });

    it('should assign correct positions', () => {
      const collection = createMetaCollection({
        beginNodeSpan: [{ data: '<!--begin-->', type: TYPE_META_COMMENT }],
        endNodeSpan: [{ data: '<!--end-->', type: TYPE_META_COMMENT }],
      });

      expect(collection[0].getPosition()).toBe(META_POSITION_BEGIN);
      expect(collection[1].getPosition()).toBe(META_POSITION_END);
    });

    it('should hold meta-data items', () => {
      const collection = createMetaCollection({
        beginNodeSpan: [{ data: '<!--meta1-->', type: TYPE_META_COMMENT }],
        endNodeSpan: [{ data: '<!--meta2-->', type: TYPE_META_COMMENT }],
      });

      expect(collection).toMatchSnapshot();
    });
  });

  describe('clear', () => {
    let a: HTMLElement;
    let collection: MetaCollectionImpl;

    beforeEach(() => {
      collection = new MetaCollectionImpl(
        {
          beginNodeSpan: [{ data: 'meta1', type: TYPE_META_COMMENT }],
          endNodeSpan: [{ data: 'meta2', type: TYPE_META_COMMENT }],
        },
      );

      a = document.createElement('a');

      document.body.append(a);
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should remove rendered comments', () => {
      collection.render(a, a);
      collection.clear();

      expect(document.body).toMatchSnapshot();
    });
  });

  describe('render', () => {
    let a: HTMLElement;
    let b: HTMLElement;
    let collection: MetaCollectionImpl;

    beforeEach(() => {
      collection = new MetaCollectionImpl(
        {
          beginNodeSpan: [
            { data: 'meta1', type: TYPE_META_COMMENT },
            { data: 'meta2', type: TYPE_META_COMMENT },
          ],
          endNodeSpan: [
            { data: 'meta3', type: TYPE_META_COMMENT },
            { data: 'meta4', type: TYPE_META_COMMENT },
          ],
        },
      );

      a = document.createElement('a');
      b = document.createElement('b');

      document.body.append(a, b);
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should not render on detached element', () => {
      document.body.removeChild(a);

      collection.render(a, a);

      expect(document.body).toMatchSnapshot();
    });

    it('should not render on document node', () => {
      const node = document.body.parentNode?.parentNode as Node;

      collection.render(node, node);

      expect(document.body).toMatchSnapshot();
    });

    it('should surround an element with comments', () => {
      collection.render(a, a);

      expect(document.body).toMatchSnapshot();
    });

    it('should surround multiple elements with comments', () => {
      collection.render(a, b);

      expect(document.body).toMatchSnapshot();
    });

    it('should return a callback clearing rendered comments', () => {
      const clear = collection.render(a, a);
      clear();

      expect(clear).toBeInstanceOf(Function);
      expect(document.body).toMatchSnapshot();
    });

    it('should return a callback clearing only rendered comments during the call', () => {
      const clear = collection.render(a, a);
      collection.render(b, b);
      clear();

      expect(document.body).toMatchSnapshot();
    });
  });
});

describe('isMetaCollection', () => {
  it('should return true', () => {
    const meta = createMetaCollection();

    expect(isMetaCollection(meta)).toBe(true);
  });

  it('should return false', () => {
    expect(isMetaCollection(undefined)).toBe(false);
    expect(isMetaCollection([])).toBe(false);
    expect(isMetaCollection({})).toBe(false);
  });
});

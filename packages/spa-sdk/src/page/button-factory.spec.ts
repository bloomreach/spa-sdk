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

import { ButtonFactory } from './button-factory';
import { MetaCollectionImpl, MetaCollection, isMetaCollection } from './meta-collection';
import { MetaFactory } from './meta-factory';

jest.mock('./meta-collection');

jest.mock('./meta-collection');

let metaFactory: MetaFactory;

beforeEach(() => {
  metaFactory = new MetaFactory();
  jest.mocked(MetaCollectionImpl).mockClear();
});

describe('ButtonFactory', () => {
  let factory: ButtonFactory;
  let builder1: jest.MockedFunction<((...args: any[]) => MetaCollection)>;
  let builder2: jest.MockedFunction<((...args: any[]) => MetaCollection)>;

  beforeEach(() => {
    builder1 = jest.fn(() => ({} as MetaCollection));
    builder2 = jest.fn(() => ({} as MetaCollection));
    factory = new ButtonFactory(metaFactory, new Map([['type1', builder1], ['type2', builder2]]));
  });

  describe('create', () => {
    it('should call a registered builder', () => {
      factory.create('type1', { id: 'id1' });
      factory.create('type2', { id: 'id2' });

      expect(builder1).toHaveBeenCalledWith({ id: 'id1' });
      expect(builder2).toHaveBeenCalledWith({ id: 'id2' });
    });

    it('should throw an error on unknown button type', () => {
      expect(() => factory.create('type3')).toThrow();
    });

    it('should create a meta-collection instance', () => {
      const button = {} as MetaCollection;

      jest.mocked(isMetaCollection).mockReturnValueOnce(false);
      jest.mocked(MetaCollectionImpl).mockReturnValueOnce(button as unknown as MetaCollectionImpl);

      factory.create('type1', { id: 'id1' });

      expect(MetaCollectionImpl).toHaveBeenCalledWith(button, metaFactory);
    });

    it('should create a meta-collection instance', () => {
      const button = {} as MetaCollection;

      jest.mocked(isMetaCollection).mockReturnValueOnce(true);
      builder1.mockReturnValueOnce(button);

      expect(factory.create('type1', { id: 'id1' })).toBe(button);
    });
  });
});

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
import { MetaCollection } from './meta-collection';

describe('ButtonFactory', () => {
  let factory: ButtonFactory;
  let builder1: jest.MockedFunction<((...args: any[]) => MetaCollection)>;
  let builder2: jest.MockedFunction<((...args: any[]) => MetaCollection)>;

  beforeEach(() => {
    builder1 = jest.fn(() => ({} as MetaCollection));
    builder2 = jest.fn(() => ({} as MetaCollection));
    factory = new ButtonFactory(new Map([['type1', builder1], ['type2', builder2]]));
  });

  describe('create', () => {
    it('should call a registered builder and return its result', () => {
      const result1 = {} as MetaCollection;
      const result2 = {} as MetaCollection;
      builder1.mockReturnValueOnce(result1);
      builder2.mockReturnValueOnce(result2);

      expect(factory.create('type1', { id: 'id1' })).toBe(result1);
      expect(factory.create('type2', { id: 'id2' })).toBe(result2);
      expect(builder1).toHaveBeenCalledWith({ id: 'id1' });
      expect(builder2).toHaveBeenCalledWith({ id: 'id2' });
    });

    it('should throw an error on unknown button type', () => {
      expect(() => factory.create('type3')).toThrow();
    });
  });
});

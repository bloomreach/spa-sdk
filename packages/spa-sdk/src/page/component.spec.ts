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

import { ComponentImpl, ComponentModel, Component, TYPE_COMPONENT, isComponent } from './component';
import { LinkFactory } from './link-factory';
import { MetaCollectionFactory } from './meta-collection-factory';
import { MetaCollection } from './meta-collection';

let linkFactory: jest.Mocked<LinkFactory>;
let metaFactory: jest.MockedFunction<MetaCollectionFactory>;

const model = {
  links: { self: { href: 'url' } },
  meta: {},
  id: 'id',
  type: TYPE_COMPONENT,
} as ComponentModel;

function createComponent(componentModel = model, children: Component[] = []) {
  return new ComponentImpl(componentModel, children, linkFactory, metaFactory);
}

beforeEach(() => {
  linkFactory = { create: jest.fn() } as unknown as typeof linkFactory;
  metaFactory = jest.fn();
});

describe('ComponentImpl', () => {
  describe('getId', () => {
    it('should return a component id', () => {
      const component = createComponent();

      expect(component.getId()).toBe('id');
    });
  });

  describe('getMeta', () => {
    it('should return a meta-data collection', () => {
      const meta = {} as MetaCollection;

      metaFactory.mockReturnValueOnce(meta);
      const component = createComponent();

      expect(metaFactory).toBeCalledWith(model.meta);
      expect(component.getMeta()).toEqual(meta);
    });
  });

  describe('getModels', () => {
    it('should return models object', () => {
      const component = createComponent({ ...model, models: { a: 1, b: 2 } });

      expect(component.getModels()).toEqual({ a: 1, b: 2 });
    });

    it('should return empty object', () => {
      const component = createComponent();

      expect(component.getModels()).toEqual({});
    });
  });

  describe('getUrl', () => {
    it('should return a model url', () => {
      const component = createComponent();

      linkFactory.create.mockReturnValueOnce('url');

      expect(component.getUrl()).toBe('url');
      expect(linkFactory.create).toBeCalledWith({ href: 'url' });
    });

    it('should return undefined when component links are missing', () => {
      const component = createComponent();

      expect(component.getUrl()).toBeUndefined();
    });
  });

  describe('getName', () => {
    it('should return a name', () => {
      const component = createComponent({ ...model, name: 'something' });

      expect(component.getName()).toBe('something');
    });

    it('should return an empty string', () => {
      const component = createComponent();

      expect(component.getName()).toBe('');
    });
  });

  describe('getParameters', () => {
    it('should return parameters', () => {
      const component = createComponent({
        ...model,
        meta: {
          params: { a: '1', b: '2' },
        },
      });

      expect(component.getParameters()).toEqual({ a: '1', b: '2' });
    });

    it('should return an empty object', () => {
      const component = createComponent();

      expect(component.getParameters()).toEqual({});
    });
  });

  describe('getProperties', () => {
    it('should return parameters', () => {
      const component = createComponent({
        ...model,
        meta: {
          params: { a: '1', b: '2' },
        },
      });

      expect(component.getProperties()).toEqual({ a: '1', b: '2' });
    });

    it('should return an empty object', () => {
      const component = createComponent();

      expect(component.getProperties()).toEqual({});
    });
  });

  describe('getComponent', () => {
    it('should return a reference to itself', () => {
      const component = createComponent();

      expect(component.getComponent()).toBe(component);
    });

    it('should find a child component', () => {
      const root = createComponent({ ...model, id: 'root-component' }, [
        createComponent({ ...model, id: 'a-component', name: 'a' }),
        createComponent({ ...model, id: 'b-component', name: 'b' }, [
          createComponent({ ...model, id: 'c-component', name: 'c' }),
        ]),
      ]);

      expect(root.getComponent('a')).toBeDefined();
      expect(root.getComponent('a')!.getName()).toBe('a');

      expect(root.getComponent('b', 'c')).toBeDefined();
      expect(root.getComponent('b', 'c')!.getName()).toBe('c');
    });

    it('should not find a child component', () => {
      const component = createComponent();

      expect(component.getComponent('a', 'b')).toBeUndefined();
    });
  });

  describe('getComponentById', () => {
    it('should find a component by id', () => {
      const root = createComponent({ ...model, id: 'root-component' }, [
        createComponent({ ...model, id: 'a-component', name: 'a' }),
        createComponent({ ...model, id: 'b-component', name: 'b' }, [
          createComponent({ ...model, id: 'c-component', name: 'c' }),
        ]),
      ]);

      expect(root.getComponentById('a-component')).toBeDefined();
      expect(root.getComponentById('a-component')!.getName()).toBe('a');

      expect(root.getComponentById('c-component')).toBeDefined();
      expect(root.getComponentById('c-component')!.getName()).toBe('c');
    });

    it('should return undefined when a component does not exist', () => {
      const component = createComponent();

      expect(component.getComponentById('a')).toBeUndefined();
    });
  });
});

describe('isComponent', () => {
  it('should return true', () => {
    const component = createComponent();

    expect(isComponent(component)).toBe(true);
  });

  it('should return false', () => {
    expect(isComponent(undefined)).toBe(false);
    expect(isComponent({})).toBe(false);
  });
});

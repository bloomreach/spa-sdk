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

import { MenuImpl, MenuModel, TYPE_MENU, isMenu } from './menu';
import { MenuItemImpl, MenuItemModel } from './menu-item';
import { MetaCollectionImpl, MetaCollection } from './meta-collection';
import { LinkFactory } from './link-factory';

jest.mock('./meta-collection');
jest.mock('./menu-item');

let linkFactory: jest.Mocked<LinkFactory>;

const itemModel = {} as MenuItemModel;
const metaModel = {};

const model = {
  data: {
    name: 'something',
    siteMenuItems: [],
  },
  meta: metaModel,
  type: TYPE_MENU,
} as MenuModel;

function createMenu(menuModel = model) {
  return new MenuImpl(menuModel, linkFactory);
}

beforeEach(() => {
  linkFactory = { create: jest.fn() } as unknown as typeof linkFactory;
  jest.mocked(MenuItemImpl).mockClear();
});

describe('MenuImpl', () => {
  describe('getItems', () => {
    it('should return menu items as MenuItemImpl instances', () => {
      const item = {} as MenuItemImpl;
      jest.mocked(MenuItemImpl).mockReturnValueOnce(item as unknown as MenuItemImpl);

      const menu = createMenu({ ...model, data: { ...model.data, siteMenuItems: [itemModel] } });

      expect(menu.getItems()).toEqual([item]);
      expect(MenuItemImpl).toHaveBeenCalledWith(itemModel, linkFactory);
    });
  });

  describe('getMeta', () => {
    it('should return a meta-data array', () => {
      const meta = {} as MetaCollection;
      jest.mocked(MetaCollectionImpl).mockReturnValueOnce(meta as unknown as MetaCollectionImpl);

      const menu = createMenu({ ...model, meta: metaModel });

      expect(MetaCollectionImpl).toHaveBeenCalledWith(metaModel);
      expect(menu.getMeta()).toEqual(meta);
    });
  });

  describe('getName', () => {
    it('should return a menu name', () => {
      const menu = createMenu();

      expect(menu.getName()).toBe('something');
    });
  });

  describe('getSelected', () => {
    it('should return undefined when there is no selected item', () => {
      const menu = createMenu();

      expect(menu.getSelected()).toBeUndefined();
    });

    it('should return a selected item', () => {
      const item = {} as MenuItemImpl;
      jest.mocked(MenuItemImpl).mockReturnValueOnce(item as unknown as MenuItemImpl);

      const menu = createMenu({ ...model, data: { ...model.data, selectSiteMenuItem: itemModel } });

      expect(menu.getSelected()).toBe(item);
    });
  });
});

describe('isMenu', () => {
  it('should return true', () => {
    const menu = createMenu();

    expect(isMenu(menu)).toBe(true);
  });

  it('should return false', () => {
    expect(isMenu(undefined)).toBe(false);
    expect(isMenu({})).toBe(false);
  });
});

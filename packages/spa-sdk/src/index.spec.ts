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

import { default as model } from './index.fixture.json';
import {
  destroy,
  initialize,
  Container,
  ContainerItem,
  Page,
  META_POSITION_BEGIN,
  META_POSITION_END,
  TYPE_CONTAINER_BOX,
} from './index';
import { Window } from './cms';
import { PageModel } from './page';

declare const window: Window;

describe('initialize', () => {
  let page: Page;
  const httpClient = jest.fn(async () => ({ data: model as unknown as PageModel }));

  beforeEach(async () => {
    httpClient.mockClear();
    page = await initialize({
      httpClient,
      request: { path: '/' },
      options: {
        live: {
          pageModelBaseUrl: 'http://localhost:8080/site/my-spa',
        },
        preview: {
          pageModelBaseUrl: 'http://localhost:8080/site/_cmsinternal/my-spa',
        },
      },
    });

    window.SPA!.init({ sync: jest.fn() });
  });

  afterEach(() => {
    destroy(page);
  });

  it('should be a page entity', () => {
    expect(page.getTitle()).toBe('Homepage');
  });

  it('should contain a root component', () => {
    const root = page.getComponent();
    expect(root!.getName()).toBe('test');
    expect(root!.getParameters()).toEqual({});
  });

  it('should contain page meta-data', () => {
    const [meta1, meta2] = page.getComponent()!.getMeta();

    expect(meta1).toBeDefined();
    expect(meta1.getPosition()).toBe(META_POSITION_END);
    expect(JSON.parse(meta1.getData())).toMatchSnapshot();

    expect(meta2).toBeDefined();
    expect(meta2.getPosition()).toBe(META_POSITION_END);
    expect(JSON.parse(meta2.getData())).toMatchSnapshot();
  });

  it('should contain a main component', () => {
    const main = page.getComponent<Container>('main');

    expect(main).toBeDefined();
    expect(main!.getName()).toBe('main');
    expect(main!.getType()).toBe(TYPE_CONTAINER_BOX);
    expect(main!.getParameters()).toEqual({});
  });

  it('should contain two banners', () => {
    const main = page.getComponent<Container>('main');
    const children = main!.getChildren();

    expect(children.length).toBe(2);

    const [banner0, banner1] = children;

    expect(banner0.getName()).toBe('banner');
    expect(banner0.getType()).toBe('Banner');
    expect(banner0.isHidden()).toBe(false);
    expect(banner0.getParameters()).toEqual({ document: 'banners/banner1' });

    expect(banner1.getName()).toBe('banner1');
    expect(banner1.getType()).toBe('Banner');
    expect(banner1.isHidden()).toBe(true);
    expect(banner1.getParameters()).toEqual({ document: 'banners/banner2' });

    expect(page.getComponent('main', 'banner')).toBe(banner0);
    expect(page.getComponent('main', 'banner1')).toBe(banner1);
  });

  it('should contain components meta-data', () => {
    const [meta1, meta2] = page.getComponent('main', 'banner')!.getMeta();

    expect(meta1).toBeDefined();
    expect(meta1.getPosition()).toBe(META_POSITION_BEGIN);
    expect(JSON.parse(meta1.getData())).toMatchSnapshot();

    expect(meta2).toBeDefined();
    expect(meta2.getPosition()).toBe(META_POSITION_END);
    expect(JSON.parse(meta2.getData())).toMatchSnapshot();
  });

  it('should resolve content references', () => {
    const banner0 = page.getComponent('main', 'banner');
    const document0 = page.getContent(banner0!.getModels().document);

    const banner1 = page.getComponent('main', 'banner1');
    const document1 = page.getContent(banner1!.getModels().document);

    expect(document0).toBeDefined();
    expect(document0!.getName()).toBe('banner1');
    expect(document1).toBeDefined();
    expect(document1!.getName()).toBe('banner2');
  });

  it('should contain content meta-data', () => {
    const banner0 = page.getComponent('main', 'banner');
    const document0 = page.getContent(banner0!.getModels().document);
    const [meta] = document0!.getMeta();

    expect(meta).toBeDefined();
    expect(meta.getPosition()).toBe(META_POSITION_BEGIN);
    expect(JSON.parse(meta.getData())).toMatchSnapshot();
  });

  it('should react on a component rendering', async () => {
    const banner0 = page.getComponent('main', 'banner') as ContainerItem;
    const banner1 = page.getComponent('main', 'banner1') as ContainerItem;
    const listener0 = jest.fn();
    const listener1 = jest.fn();

    httpClient.mockClear();
    banner0.on('update', listener0);
    banner1.on('update', listener1);

    httpClient.mockImplementationOnce(async () => ({
      data: {
        ...model,
        page: model.page.components[0].components[0],
      },
    }));

    window.SPA!.renderComponent('r1_r1_r1', {});
    await new Promise(resolve => process.nextTick(resolve));

    expect(httpClient).toBeCalledWith(expect.objectContaining({ url: banner0.getUrl() }));
    expect(listener0).toBeCalled();
    expect(listener1).not.toBeCalled();
  });
});

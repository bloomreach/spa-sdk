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

import {
  Container,
  destroy,
  initialize,
  META_POSITION_BEGIN,
  META_POSITION_END,
  Page,
  PageModel,
  TYPE_CONTAINER_BOX,
  TYPE_LINK_EXTERNAL,
  TYPE_LINK_INTERNAL,
  TYPE_LINK_RESOURCE,
} from './index';
import model from './index.fixture.json';
import { HttpRequest } from './spa/http';

describe('initialize', () => {
  let defaultPage: Page;
  const emit = jest.fn();
  const httpClient = jest.fn(async () => ({ data: model as unknown as PageModel }));

  beforeEach(async () => {
    emit.mockClear();
    httpClient.mockClear();
    defaultPage = await initialize({
      httpClient,
      window,
      baseUrl: '//example-domain.com',
      endpoint: 'http://localhost:8080/site/my-spa/resourceapi',
      path: '/?token=something',
      request: { emit },
    });
  });

  afterEach(() => {
    destroy(defaultPage);

    document.cookie = '__br__campaign_id=; Max-Age=0;';
    document.cookie = '__br__segment=; Max-Age=0;';
    document.cookie = '__br__ttl=; Max-Age=0;';
  });

  it('should be a page entity', () => {
    expect(defaultPage.getTitle()).toBe('Homepage');
  });

  it('should contain a root component', () => {
    const root = defaultPage.getComponent();
    expect(root!.getName()).toBe('test');
    expect(root!.getParameters()).toEqual({});
  });

  it('should contain page meta-data', () => {
    const [meta1, meta2] = defaultPage.getComponent()!.getMeta();

    expect(meta1).toBeDefined();
    expect(meta1.getPosition()).toBe(META_POSITION_END);
    expect(JSON.parse(meta1.getData())).toMatchSnapshot();

    expect(meta2).toBeDefined();
    expect(meta2.getPosition()).toBe(META_POSITION_END);
    expect(JSON.parse(meta2.getData())).toMatchSnapshot();
  });

  /* eslint-disable max-len */
  it.each`
    link                                                                   | expected
    ${''}                                                                  | ${'//example-domain.com/?token=something'}
    ${'/news'}                                                             | ${'//example-domain.com/news?token=something'}
    ${{ href: 'http://127.0.0.1/news?a=b', type: TYPE_LINK_EXTERNAL }}     | ${'http://127.0.0.1/news?a=b'}
    ${{ href: '/news?a=b', type: TYPE_LINK_INTERNAL }}                     | ${'//example-domain.com/news?a=b&token=something'}
    ${{ href: 'news#hash', type: TYPE_LINK_INTERNAL }}                     | ${'//example-domain.com/news?token=something#hash'}
    ${{ href: 'http://127.0.0.1/resource.jpg', type: TYPE_LINK_RESOURCE }} | ${'http://127.0.0.1/resource.jpg'}
  `('should create a URL "$expected" for link "$link"', ({ link, expected }) => {
    expect(defaultPage.getUrl(link)).toBe(expected);
  });
  /* eslint-enable max-len */

  it('should contain a main component', () => {
    const main = defaultPage.getComponent<Container>('main');

    expect(main).toBeDefined();
    expect(main!.getName()).toBe('main');
    expect(main!.getType()).toBe(TYPE_CONTAINER_BOX);
    expect(main!.getParameters()).toEqual({});
  });

  it('should contain two banners', () => {
    const main = defaultPage.getComponent<Container>('main');
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

    expect(defaultPage.getComponent('main', 'banner')).toBe(banner0);
    expect(defaultPage.getComponent('main', 'banner1')).toBe(banner1);
  });

  it('should contain components meta-data', () => {
    const [meta1, meta2] = defaultPage.getComponent('main', 'banner')!.getMeta();

    expect(meta1).toBeDefined();
    expect(meta1.getPosition()).toBe(META_POSITION_BEGIN);
    expect(JSON.parse(meta1.getData())).toMatchSnapshot();

    expect(meta2).toBeDefined();
    expect(meta2.getPosition()).toBe(META_POSITION_END);
    expect(JSON.parse(meta2.getData())).toMatchSnapshot();
  });

  it('should resolve content references', () => {
    const banner0 = defaultPage.getComponent('main', 'banner');
    const document0 = defaultPage.getContent(banner0!.getModels().document);

    const banner1 = defaultPage.getComponent('main', 'banner1');
    const document1 = defaultPage.getContent(banner1!.getModels().document);

    expect(document0).toBeDefined();
    expect(document0!.getName()).toBe('banner1');
    expect(document1).toBeDefined();
    expect(document1!.getName()).toBe('banner2');
  });

  it('should contain content meta-data', () => {
    const banner0 = defaultPage.getComponent('main', 'banner');
    const document0 = defaultPage.getContent(banner0!.getModels().document);
    const [meta] = document0!.getMeta();

    expect(meta).toBeDefined();
    expect(meta.getPosition()).toBe(META_POSITION_BEGIN);
    expect(JSON.parse(meta.getData())).toMatchSnapshot();
  });

  it('should rewrite content links', () => {
    const banner0 = defaultPage.getComponent('main', 'banner');
    const document0 = defaultPage.getContent(banner0!.getModels().document);
    const banner1 = defaultPage.getComponent('main', 'banner1');
    const document1 = defaultPage.getContent(banner1!.getModels().document);

    expect(document0!.getUrl()).toBe('http://127.0.0.1/site/another-spa/banner1.html');
    expect(document1!.getUrl()).toBe('//example-domain.com/banner2.html?token=something');
  });

  it('should rewrite links in the HTML blob', async () => {
    const banner = defaultPage.getComponent('main', 'banner');
    const document = defaultPage.getContent(banner!.getModels().document);
    const { content } = document!.getData<{ content: any }>();
    const rewritten = await defaultPage.rewriteLinks(content.value);

    expect(rewritten).toMatchSnapshot();
  });

  // it('should react on a component rendering', async () => {
  //   const banner0 = defaultPage.getComponent('main', 'banner') as ContainerItem;
  //   const banner1 = defaultPage.getComponent('main', 'banner1') as ContainerItem;
  //   const listener0 = jest.fn();
  //   const listener1 = jest.fn();
  //   const [[id, containerItemModel]] = Object.entries(model.page).filter(
  //     ([, { id: pageId }]: any) => pageId === 'r1_r1_r1',
  //   );
  //
  //   httpClient.mockClear();
  //   banner0.on('update', listener0);
  //   banner1.on('update', listener1);
  //
  //   httpClient.mockImplementationOnce(async () => ({
  //     data: {
  //       ...model,
  //       page: { [id]: containerItemModel },
  //       root: { $ref: `/page/${id}` },
  //     } as unknown as PageModel,
  //   }));
  //
  //   window.postMessage(
  //     {
  //       type: 'brxm:event',
  //       event: 'update',
  //       payload: {
  //         id: 'r1_r1_r1',
  //         properties: { some: 'value' },
  //       },
  //     },
  //     '*',
  //   );
  //   await new Promise((resolve) => setTimeout(resolve, 0));
  //
  //   expect(httpClient).toBeCalled();
  //   expect(httpClient.mock.calls[0]).toMatchSnapshot();
  //   expect(listener0).toBeCalled();
  //   expect(listener1).not.toBeCalled();
  // });

  it('should use an origin from the endpoint', async () => {
    const postMessageSpy = jest.spyOn(window.parent, 'postMessage');
    await defaultPage.sync();

    expect(postMessageSpy).toBeCalledWith(expect.anything(), 'http://localhost:8080');
  });

  it('should use a custom origin', async () => {
    const page = await initialize({
      httpClient,
      window,
      endpoint: 'http://localhost:8080/site/my-spa/resourceapi',
      origin: 'http://localhost:12345',
      path: '/?token=something',
    });
    const postMessageSpy = jest.spyOn(window.parent, 'postMessage');
    await page.sync();
    destroy(page);

    expect(postMessageSpy).toBeCalledWith(expect.anything(), 'http://localhost:12345');
  });

  it('should emit a request event', async () => {
    expect(emit).toBeCalledWith('br:spa:initialized', defaultPage);
  });

  it('should use campaign variant id as params from url', async () => {
    const page = await initialize({
      httpClient,
      window,
      endpoint: 'http://localhost:8080/site/my-spa/resourceapi',
      origin: 'http://localhost:12345',
      path: '/?btm_campaign_id=12345&btm_segment=silver',
    });

    expect(httpClient).toBeCalledWith({
      headers: {},
      method: 'GET',
      url: 'http://localhost:8080/site/my-spa/resourceapi/?__br__campaignVariant=12345%3Asilver',
    });

    destroy(page);
  });

  it('should use campaign variant id as params from cookie', async () => {
    document.cookie = '__br__segment=gold';
    document.cookie = '__br__campaign_id=12345';

    const page = await initialize({
      httpClient,
      window,
      endpoint: 'http://localhost:8080/site/my-spa/resourceapi',
      origin: 'http://localhost:12345',
    });

    expect(httpClient).toBeCalledWith({
      headers: {},
      method: 'GET',
      url: 'http://localhost:8080/site/my-spa/resourceapi/?__br__campaignVariant=12345%3Agold',
    });

    destroy(page);
  });

  it('should use campaign variant id as params from request cookie', async () => {
    const request: HttpRequest = {
      headers: { cookie: '__br__campaign_id=foo; __br__segment=bar' },
    };

    const page = await initialize({
      httpClient,
      request,
      endpoint: 'http://localhost:8080/site/my-spa/resourceapi',
      origin: 'http://localhost:12345',
    });

    expect(httpClient).toBeCalledWith({
      headers: {},
      method: 'GET',
      url: 'http://localhost:8080/site/my-spa/resourceapi/?__br__campaignVariant=foo%3Abar',
    });

    destroy(page);
  });

  it('should use campaign variant id as params from request cookie', async () => {
    const request: HttpRequest = {
      headers: { cookie: '__br__campaign_id=foo; __br__segment=bar' },
    };

    const page = await initialize({
      httpClient,
      request,
      endpoint: 'http://localhost:8080/site/my-spa/resourceapi',
      origin: 'http://localhost:12345',
    });

    expect(httpClient).toBeCalledWith({
      headers: {},
      method: 'GET',
      url: 'http://localhost:8080/site/my-spa/resourceapi/?__br__campaignVariant=foo%3Abar',
    });

    destroy(page);
  });

  it('should omit campaign variant id if no url params and window does not contain respective cookies', async () => {
    const page = await initialize({
      httpClient,
      endpoint: 'http://localhost:8080/site/my-spa/resourceapi',
      origin: 'http://localhost:12345',
    });

    expect(httpClient).toBeCalledWith({
      headers: {},
      method: 'GET',
      url: 'http://localhost:8080/site/my-spa/resourceapi/',
    });

    destroy(page);
  });

  it('should omit campaign variant id if no url params and request does not contain respective cookies', async () => {
    const request: HttpRequest = {
      headers: { cookie: '' },
    };

    const page = await initialize({
      httpClient,
      request,
      endpoint: 'http://localhost:8080/site/my-spa/resourceapi',
      origin: 'http://localhost:12345',
    });

    expect(httpClient).toBeCalledWith({
      headers: {},
      method: 'GET',
      url: 'http://localhost:8080/site/my-spa/resourceapi/',
    });

    destroy(page);
  });

  it('should omit campaign variant id if url query params contain ttl equal zero', async () => {
    const request: HttpRequest = {
      headers: undefined,
    };

    const page = await initialize({
      httpClient,
      request,
      endpoint: 'http://localhost:8080/site/my-spa/resourceapi',
      origin: 'http://localhost:12345',
      path: '/?btm_campaign_id=12345&btm_segment=silver&btm_ttl=0',
    });

    expect(httpClient).toBeCalledWith({
      headers: {},
      method: 'GET',
      url: 'http://localhost:8080/site/my-spa/resourceapi/',
    });

    destroy(page);
  });

  it('should use segment ids as params from cookie', async () => {
    document.cookie = '__br__segment=gold';
    document.cookie = '__br__campaign_id=12345';
    document.cookie = '__br__segment_ids=12345,2345';

    const page = await initialize({
      httpClient,
      window,
      endpoint: 'http://localhost:8080/site/my-spa/resourceapi',
      origin: 'http://localhost:12345',
    });

    expect(httpClient).toBeCalledWith({
      headers: {},
      method: 'GET',
      url:
        'http://localhost:8080/site/my-spa/resourceapi/' +
        '?__br__campaignVariant=12345%3Agold&__br__segmentIds=12345%2C2345',
    });

    destroy(page);
  });

  it('should use segment ids from request as a query param', async () => {
    const request: HttpRequest = {
      headers: { cookie: '__br__segment_ids=foo,bar' },
    };

    const page = await initialize({
      httpClient,
      request,
      endpoint: 'http://localhost:8080/site/my-spa/resourceapi',
      origin: 'http://localhost:12345',
    });

    expect(httpClient).toBeCalledWith({
      headers: {},
      method: 'GET',
      url: 'http://localhost:8080/site/my-spa/resourceapi/?__br__segmentIds=foo%2Cbar',
    });

    destroy(page);
  });

  it('should omi query param if request do not contains segment ids', async () => {
    const request: HttpRequest = {
      headers: { cookie: '' },
    };

    const page = await initialize({
      httpClient,
      request,
      endpoint: 'http://localhost:8080/site/my-spa/resourceapi',
      origin: 'http://localhost:12345',
    });

    expect(httpClient).toBeCalledWith({
      headers: {},
      method: 'GET',
      url: 'http://localhost:8080/site/my-spa/resourceapi/',
    });

    destroy(page);
  });
});

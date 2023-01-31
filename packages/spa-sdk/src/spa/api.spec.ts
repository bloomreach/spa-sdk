/*
 * Copyright 2020-2023 Bloomreach
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

import { isConfigurationWithProxy } from '../configuration';
import { PageModel } from '../page';
import { UrlBuilder } from '../url';
import { ApiImpl } from './api';

jest.mock('../configuration');
jest.mock('../url');

const model = {} as PageModel;
const config = {
  httpClient: jest.fn(async () => ({ data: model })),
  path: '/',
  request: {
    connection: {
      remoteAddress: '127.0.0.1',
    },
    headers: {
      cookie: 'JSESSIONID=1234',
      host: 'example.com',
      referer: 'https://example.com',
      'user-agent': 'Google Bot',
    },
    visitor: {
      id: 'visitor-id',
      header: 'visitor-header',
    },
  },
};

describe('ApiImpl', () => {
  let API: ApiImpl;
  let urlBuilder: jest.Mocked<UrlBuilder>;

  beforeEach(async () => {
    urlBuilder = {
      initialize: jest.fn(),
      getApiUrl: jest.fn((path: string) => `https://example.com${path}`),
    } as unknown as jest.Mocked<UrlBuilder>;

    API = new ApiImpl(urlBuilder, config);
  });

  describe('getPage', () => {
    beforeEach(async () => API.getPage(config.path));

    it('should generate a URL', () => {
      expect(urlBuilder.getApiUrl).toBeCalledWith(config.path);
    });

    it('should request a page model', () => {
      expect(config.httpClient).toBeCalledWith({
        url: 'https://example.com/',
        method: 'GET',
        headers: {
          Referer: 'https://example.com',
          'User-Agent': 'Google Bot',
          'visitor-header': 'visitor-id',
          'X-Forwarded-For': '127.0.0.1',
        },
      });
    });

    it('should return a page model', async () => {
      expect(await API.getPage(config.path)).toBe(model);
    });

    it('should forward cookie header if the setup is using a reverse proxy', async () => {
      jest.mocked(isConfigurationWithProxy).mockReturnValueOnce(true);

      const api = new ApiImpl(urlBuilder, config);
      await api.getPage(config.path);

      expect(config.httpClient).toBeCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            Cookie: 'JSESSIONID=1234',
          }),
        }),
      );
    });

    it('should not include x-forwarded-for header when the remote address could not be determined', async () => {
      const api = new ApiImpl(urlBuilder, { httpClient: config.httpClient });
      await api.getPage(config.path);

      expect(config.httpClient).toBeCalledWith(
        expect.not.objectContaining({
          headers: {
            'x-forwarded-for': expect.anything(),
          },
        }),
      );
    });

    it('should not include visitor header when visitor configuration is not defined', async () => {
      const api = new ApiImpl(urlBuilder, { httpClient: config.httpClient });
      await api.getPage(config.path);

      expect(config.httpClient).toBeCalledWith(
        expect.not.objectContaining({
          headers: {
            'visitor-header': expect.anything(),
          },
        }),
      );
    });

    it('should prefer visitor from the common config', async () => {
      const api = new ApiImpl(urlBuilder, {
        ...config,
        visitor: { header: 'custom-visitor-header', id: 'custom-visitor' },
      });
      await api.getPage(config.path);

      expect(config.httpClient).toBeCalledWith(
        expect.not.objectContaining({
          headers: {
            'custom-visitor-header': 'custom-visitor',
          },
        }),
      );
    });

    it('should not include API version header when the API version is not set', async () => {
      const api = new ApiImpl(urlBuilder, { httpClient: config.httpClient });
      await api.getPage(config.path);

      expect(config.httpClient).toBeCalledWith(
        expect.not.objectContaining({
          headers: {
            'Accept-Version': expect.anything(),
          },
        }),
      );
    });

    it('should include a custom API version header', async () => {
      const api = new ApiImpl(urlBuilder, {
        apiVersionHeader: 'X-Version',
        apiVersion: 'version',
        httpClient: config.httpClient,
      });
      await api.getPage(config.path);

      expect(config.httpClient).toBeCalledWith(
        expect.objectContaining({
          headers: {
            'X-Version': 'version',
          },
        }),
      );
    });

    it('should fall back to the default API version header', async () => {
      const api = new ApiImpl(urlBuilder, {
        apiVersion: 'version',
        httpClient: config.httpClient,
      });
      await api.getPage(config.path);

      expect(config.httpClient).toBeCalledWith(
        expect.objectContaining({
          headers: {
            'Accept-Version': 'version',
          },
        }),
      );
    });

    it('should include a custom authorization header', async () => {
      const api = new ApiImpl(urlBuilder, {
        authorizationHeader: 'X-Auth',
        authorizationToken: 'token',
        httpClient: config.httpClient,
      });
      await api.getPage(config.path);

      expect(config.httpClient).toBeCalledWith(
        expect.objectContaining({
          headers: {
            'X-Auth': 'Bearer token',
          },
        }),
      );
    });

    it('should fall back to the default authorization header', async () => {
      const api = new ApiImpl(urlBuilder, {
        authorizationToken: 'token',
        httpClient: config.httpClient,
      });
      await api.getPage(config.path);

      expect(config.httpClient).toBeCalledWith(
        expect.objectContaining({
          headers: {
            Authorization: 'Bearer token',
          },
        }),
      );
    });

    it('should include a custom server-id header', async () => {
      const api = new ApiImpl(urlBuilder, {
        serverIdHeader: 'X-Custom-Server-Id',
        serverId: 'some',
        httpClient: config.httpClient,
      });
      await api.getPage(config.path);

      expect(config.httpClient).toBeCalledWith(
        expect.objectContaining({
          headers: {
            'X-Custom-Server-Id': 'some',
          },
        }),
      );
    });

    it('should fall back to the default server-id header', async () => {
      const api = new ApiImpl(urlBuilder, {
        serverId: 'some',
        httpClient: config.httpClient,
      });
      await api.getPage(config.path);

      expect(config.httpClient).toBeCalledWith(
        expect.objectContaining({
          headers: {
            'Server-Id': 'some',
          },
        }),
      );
    });
  });

  describe('getComponent', () => {
    it('should request a component model', () => {
      API.getComponent('https://example.com/component', {});

      expect(config.httpClient).toBeCalledWith(
        expect.objectContaining({
          url: 'https://example.com/component',
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/x-www-form-urlencoded',
          }),
        }),
      );
    });

    it('should request a customized component model', () => {
      API.getComponent('https://example.com/component', { a: 'b' });

      expect(config.httpClient).toBeCalledWith(
        expect.objectContaining({
          url: 'https://example.com/component',
          method: 'POST',
          data: 'a=b',
          headers: expect.objectContaining({
            'Content-Type': 'application/x-www-form-urlencoded',
          }),
        }),
      );
    });

    it('should return a component model', async () => {
      expect(await API.getComponent('/', {})).toBe(model);
    });
  });
});

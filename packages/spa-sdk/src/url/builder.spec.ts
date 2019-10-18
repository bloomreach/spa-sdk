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

import { UrlBuilderImpl } from './builder';

describe('UrlBuilderImpl', () => {
  const builder = new UrlBuilderImpl();

  describe('getApiUrl', () => {
    const options1 = { cmsBaseUrl: 'http://localhost:8080/site/spa' };
    const options2 = { ...options1, apiBaseUrl: 'http://127.0.0.1/resourceapi' };
    const options3 = { ...options1, apiUrlSuffix: '/something?query' };
    const options4 = { ...options1, spaBaseUrl: '/news' };
    const options5 = { ...options1, spaBaseUrl: '//example.com/news' };
    const options6 = { ...options1, spaBaseUrl: 'https://example.com/news' };

    it.each`
      options     | path                      | expected
      ${options1} | ${'/'}                    | ${'http://localhost:8080/site/spa/resourceapi/'}
      ${options1} | ${'/news'}                | ${'http://localhost:8080/site/spa/resourceapi/news'}
      ${options1} | ${'/news/'}               | ${'http://localhost:8080/site/spa/resourceapi/news/'}
      ${options1} | ${'/news/2019/foo.html'}  | ${'http://localhost:8080/site/spa/resourceapi/news/2019/foo.html'}
      ${options1} | ${'/?param=value'}        | ${'http://localhost:8080/site/spa/resourceapi/?param=value'}
      ${options1} | ${'/news?param=value'}    | ${'http://localhost:8080/site/spa/resourceapi/news?param=value'}
      ${options2} | ${'/'}                    | ${'http://127.0.0.1/resourceapi/'}
      ${options2} | ${'/news'}                | ${'http://127.0.0.1/resourceapi/news'}
      ${options3} | ${'/news'}                | ${'http://localhost:8080/site/spa/resourceapi/news/something?query'}
      ${options3} | ${'/news?param=value'}    | ${'http://localhost:8080/site/spa/resourceapi/news/something?query&param=value'}
      ${options4} | ${'/news'}                | ${'http://localhost:8080/site/spa/resourceapi'}
      ${options4} | ${'/news/'}               | ${'http://localhost:8080/site/spa/resourceapi/'}
      ${options4} | ${'/news?param=value'}    | ${'http://localhost:8080/site/spa/resourceapi?param=value'}
      ${options4} | ${'/news/2019/?query'}    | ${'http://localhost:8080/site/spa/resourceapi/2019/?query'}
      ${options5} | ${'/news/2019/?query'}    | ${'http://localhost:8080/site/spa/resourceapi/2019/?query'}
      ${options6} | ${'/news/2019/?query'}    | ${'http://localhost:8080/site/spa/resourceapi/2019/?query'}
    `('should create the Page Model API URL for "$path" using options "$options"', ({ options, path, expected }) => {
      builder.initialize(options);

      expect(builder.getApiUrl(path)).toBe(expected);
    });

    it.each`
      options     | path                      | message
      ${options4} | ${'/'}                    | ${'The path "/" does not start with the base path "/news".'}
      ${options6} | ${'/something'}           | ${'The path "/something" does not start with the base path "/news".'}
    `('should throw an error for the path "$path" with message "$message"', ({ options, path, message }) => {
      builder.initialize(options);

      expect(() => builder.getApiUrl(path)).toThrow(message);
    });
  });

  describe('getCmsUrl', () => {
    const options1 = { cmsBaseUrl: 'http://localhost:8080/site/spa' };
    const options2 = { cmsBaseUrl: '//example.com' };

    it.each`
      options     | path       | expected
      ${options1} | ${''}      | ${'http://localhost:8080'}
      ${options1} | ${'/'}     | ${'http://localhost:8080/'}
      ${options1} | ${'/news'} | ${'http://localhost:8080/news'}
      ${options2} | ${'/'}     | ${'//example.com/'}
      ${options2} | ${'/news'} | ${'//example.com/news'}
      ${options2} | ${'//localhost/news'}          | ${'//example.com/news'}
      ${options2} | ${'/news?something#something'} | ${'//example.com/news?something#something'}
    `('should create a CMS URL for "$path" using options "$options"', ({ options, path, expected }) => {
      builder.initialize(options);

      expect(builder.getCmsUrl(path)).toBe(expected);
    });
  });

  describe('getSpaUrl', () => {
    const options1 = { cmsBaseUrl: 'http://localhost:8080/site/spa' };
    const options2 = { ...options1, spaBaseUrl: '//example.com/something' };
    const options3 = { ...options1, spaBaseUrl: '' };

    it.each`
      options     | path                      | expected
      ${options1} | ${'/'}                    | ${'/'}
      ${options1} | ${'/news'}                | ${'/news'}
      ${options1} | ${'/site/spa/news/'}      | ${'/news/'}
      ${options1} | ${'/site/spa/news?query'} | ${'/news?query'}
      ${options1} | ${'/site/spa/news?q#h'}   | ${'/news?q#h'}
      ${options2} | ${'/site/spa/about'}      | ${'//example.com/something/about'}
      ${options2} | ${'//host/site/spa/news'} | ${'//example.com/something/news'}
      ${options3} | ${'//host/site/spa'}      | ${'/'}
    `('should create an SPA URL for "$path" using options "$options"', ({ options, path, expected }) => {
      builder.initialize(options);

      expect(builder.getSpaUrl(path)).toBe(expected);
    });
  });
});

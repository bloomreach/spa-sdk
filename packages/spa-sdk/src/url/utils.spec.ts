/*
 * Copyright 2020-2025 Bloomreach
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
  appendSearchParams,
  buildUrl,
  extractSearchParams,
  isAbsoluteUrl,
  isMatched,
  mergeSearchParams,
  parseUrl,
  resolveUrl,
} from './utils';

describe('appendSearchParams', () => {
  it.each`
    url                       | params   | result
    ${'//example-domain.com'} | ${'a=b'} | ${'//example-domain.com?a=b'}
    ${'/path'}                | ${'a=b'} | ${'/path?a=b'}
    ${'/path?a=b'}            | ${'a=c'} | ${'/path?a=c'}
  `('should append "$params" to "$url"', ({ url, params, result }) => {
    expect(appendSearchParams(url, new URLSearchParams(params))).toEqual(result);
  });
});

describe('buildUrl', () => {
  it.each`
    source                                               | result
    ${{ path: '/' }}                                     | ${'/'}
    ${{ pathname: '/path' }}                             | ${'/path'}
    ${{ origin: '//example-domain.com', path: '/path' }} | ${'//example-domain.com/path'}
    ${{ pathname: '/path', search: '?a=b' }}             | ${'/path?a=b'}
    ${{ pathname: '/path', hash: '#hash' }}              | ${'/path#hash'}
    ${{ searchParams: new URLSearchParams('a=b') }}      | ${'?a=b'}
  `('should build "$source" into "$result"', ({ source, result }) => {
    expect(buildUrl(source)).toEqual(result);
  });
});

describe('extractSearchParams', () => {
  it.each`
    url                           | params        | result                    | search
    ${'//example-domain.com?a=b'} | ${['a']}      | ${'//example-domain.com'} | ${'a=b'}
    ${'/path?a=b&c=d'}            | ${['a']}      | ${'/path?c=d'}            | ${'a=b'}
    ${'/path?a=b&c=d'}            | ${['a', 'b']} | ${'/path?c=d'}            | ${'a=b'}
    ${'/path?a=b&b=c'}            | ${['a', 'b']} | ${'/path'}                | ${'a=b&b=c'}
  `('should extract "$search" from "$url"', ({ url, params, result, search }) => {
    expect(extractSearchParams(url, params)).toEqual({
      url: result,
      searchParams: new URLSearchParams(search),
    });
  });
});

describe('isAbsoluteUrl', () => {
  it.each`
    url
    ${'http://example-domain.com'}
    ${'//example-domain.com/news'}
    ${'/news'}
  `('should return true for "$url"', ({ url }) => {
    expect(isAbsoluteUrl(url)).toBe(true);
  });

  it.each`
    url
    ${'example-domain.com'}
    ${'news/something'}
    ${'?param=something'}
    ${'#hash'}
  `('should return false for "$url"', ({ url }) => {
    expect(isAbsoluteUrl(url)).toBe(false);
  });
});

describe('isMatched', () => {
  it.each`
    link                            | base
    ${'http://example-domain.com'}  | ${undefined}
    ${'http://example-domain.com'}  | ${''}
    ${'http://example-domain.com/'} | ${'http://example-domain.com/'}
    ${'//example-domain.com/'}      | ${'http://example-domain.com/'}
    ${'http://example-domain.com/'} | ${'//example-domain.com/'}
    ${'/'}                          | ${'http://example-domain.com/'}
    ${'/spa/something'}             | ${'/spa'}
    ${'/spa/something?a=b'}         | ${'/spa?a=b'}
    ${'/spa/something?a'}           | ${'/spa?a'}
    ${'/spa/something?a=c'}         | ${'/spa?a'}
  `('should match "$link" with "$base"', ({ link, base }) => {
    expect(isMatched(link, base)).toBe(true);
  });

  it.each`
    link                            | base
    ${'http://example-domain.com'}  | ${'http://example-domain.com/'}
    ${'https://example-domain.com'} | ${'http://example-domain.com/'}
    ${'http://example-domain.com'}  | ${'http://localhost:8080/'}
    ${'/spa'}                       | ${'/spa/something'}
    ${'/spa/something'}             | ${'/spa?a=b'}
    ${'/spa/something?c'}           | ${'/spa?a=b'}
    ${'/spa/something'}             | ${'/spa?a'}
  `('should not match "$link" with "$base"', ({ link, base }) => {
    expect(isMatched(link, base)).toBe(false);
  });
});

describe('mergeSearchParams', () => {
  it.each`
    source            | result
    ${['a=b', 'b=c']} | ${'a=b&b=c'}
    ${['a=b', 'a=c']} | ${'a=c'}
  `('should merge "$source" to "$result"', ({ source, result }) => {
    const [params, ...rest] = source.map((search: string) => new URLSearchParams(search));
    const merged = mergeSearchParams(params, ...rest);
    const expected = new URLSearchParams(result);

    expect(Array.from(merged.entries())).toEqual(Array.from(expected.entries()));
  });
});

describe('parseUrl', () => {
  /* eslint-disable max-len */
  it.each`
    url                                          | hash       | origin                         | path                  | pathname   | search      | searchParams
    ${''}                                        | ${''}      | ${''}                          | ${''}                 | ${''}      | ${''}       | ${new URLSearchParams()}
    ${'/path'}                                   | ${''}      | ${''}                          | ${'/path'}            | ${'/path'} | ${''}       | ${new URLSearchParams()}
    ${"/path?a='"}                               | ${''}      | ${''}                          | ${'/path?a=%27'}      | ${'/path'} | ${'?a=%27'} | ${new URLSearchParams("a='")}
    ${'http://example-domain.com'}               | ${''}      | ${'http://example-domain.com'} | ${''}                 | ${''}      | ${''}       | ${new URLSearchParams()}
    ${'http://example-domain.com?a=b#hash'}      | ${'#hash'} | ${'http://example-domain.com'} | ${'?a=b#hash'}        | ${''}      | ${'?a=b'}   | ${new URLSearchParams('a=b')}
    ${'http://example-domain.com/'}              | ${''}      | ${'http://example-domain.com'} | ${'/'}                | ${'/'}     | ${''}       | ${new URLSearchParams()}
    ${'http://example-domain.com/path'}          | ${''}      | ${'http://example-domain.com'} | ${'/path'}            | ${'/path'} | ${''}       | ${new URLSearchParams()}
    ${'http://example-domain.com/#hash'}         | ${'#hash'} | ${'http://example-domain.com'} | ${'/#hash'}           | ${'/'}     | ${''}       | ${new URLSearchParams()}
    ${'http://example-domain.com/path?a=b#hash'} | ${'#hash'} | ${'http://example-domain.com'} | ${'/path?a=b#hash'}   | ${'/path'} | ${'?a=b'}   | ${new URLSearchParams('a=b')}
    ${"http://example-domain.com/path?a='#hash"} | ${'#hash'} | ${'http://example-domain.com'} | ${'/path?a=%27#hash'} | ${'/path'} | ${'?a=%27'} | ${new URLSearchParams("a='")}
    ${'//example-domain.com?a=b#hash'}           | ${'#hash'} | ${'//example-domain.com'}      | ${'?a=b#hash'}        | ${''}      | ${'?a=b'}   | ${new URLSearchParams('a=b')}
  `('should parse "$url"', ({ url, searchParams, ...parts }) => {
    const { searchParams: parsedSearchParams, ...parsedParts } = parseUrl(url);

    expect(parsedParts).toEqual(parts);
    expect(Array.from(parsedSearchParams.entries())).toEqual(Array.from(searchParams.entries()));
  });
  /* eslint-disable max-len */
});

describe('resolveUrl', () => {
  it.each`
    source                | base                           | expected
    ${'something'}        | ${'/news'}                     | ${'/news/something'}
    ${'something'}        | ${'/news/'}                    | ${'/news/something'}
    ${'/something'}       | ${'/news'}                     | ${'/something'}
    ${'/'}                | ${'/news'}                     | ${'/'}
    ${''}                 | ${'/news'}                     | ${'/news'}
    ${'something'}        | ${''}                          | ${'/something'}
    ${'something'}        | ${'//example-domain.com'}      | ${'//example-domain.com/something'}
    ${'/something'}       | ${'//example-domain.com/news'} | ${'//example-domain.com/something'}
    ${'something'}        | ${'/news#param1'}              | ${'/news/something#param1'}
    ${'something#param2'} | ${'/news#param1'}              | ${'/news/something#param2'}
    ${'?a=c'}             | ${'/news?a=b'}                 | ${'/news?a=c'}
    ${'?a=b'}             | ${'/news?b=c'}                 | ${'/news?b=c&a=b'}
    ${'something?a=b'}    | ${'/news'}                     | ${'/news/something?a=b'}
  `('should resolve "$source" to "$expected" relative to "$base"', ({ source, base, expected }) => {
    expect(resolveUrl(source, base)).toBe(expected);
  });
});

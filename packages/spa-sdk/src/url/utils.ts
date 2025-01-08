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

interface Url {
  hash: string;
  origin: string;
  pathname: string;
  search: string;
  searchParams: URLSearchParams;
  path: string;
}

export function parseUrl(url: string): Url {
  // Since the incoming url might be just a string or relative path we should provide a dummy base URL
  // to be able to resolve relative URLs.
  // The dummy URL have to be unique to avoid any intersection with a real URL
  // because we are using the origin property from parsed URL object.
  // we are using example.com as it is a domain which cannot be registered by anyone (like a malicious user)
  const DUMMY_BASE_URL = 'http://example.com';
  const parsedUrl = new URL(url, DUMMY_BASE_URL);
  const { hash, search, searchParams } = parsedUrl;

  let { origin, pathname } = parsedUrl;

  // If url is a string or relative path, like 'someurl', '/news', etc we should return origin as an empty string.
  origin = origin !== DUMMY_BASE_URL ? origin : '';

  // For urls without protocol like //example.com?query#hash we should omit protocol from origin as well
  if (url.startsWith('//')) {
    origin = origin.replace(parsedUrl.protocol, '');
  }

  // For urls like `//example.com?query#hash` pathname should be empty string ''.
  if (url.startsWith(origin) && !url.replace(origin, '').startsWith('/') && pathname.startsWith('/')) {
    pathname = pathname.substring(1);
  }

  return { hash, origin, pathname, search, searchParams, path: `${pathname}${search}${hash}` };
}

export function buildUrl(url: Partial<Url>): string {
  const searchParams = url.searchParams?.toString() ?? '';
  const search = url.search ?? `${searchParams && `?${searchParams}`}`;
  const path = url.path ?? `${url.pathname ?? ''}${search}${url.hash ?? ''}`;

  return `${url.origin ?? ''}${path}`;
}

export function mergeSearchParams(params: URLSearchParams, ...rest: URLSearchParams[]): URLSearchParams {
  const result = new URLSearchParams(params);
  rest.forEach((restParams) => restParams.forEach((value, key) => result.set(key, value)));

  return result;
}

export function appendSearchParams(url: string, params: URLSearchParams): string {
  const { hash, origin, pathname, searchParams } = parseUrl(url);

  return buildUrl({ hash, origin, pathname, searchParams: mergeSearchParams(searchParams, params) });
}

/**
 * Extracts query parameters from URL and returns URL object that contains URL path and extracted parameters
 *
 * @param url The URL of the page.
 * @param params Parameters to extract.
 */
export function extractSearchParams(
  url: string,
  params: string[],
): {
  searchParams: URLSearchParams;
  url: string;
} {
  const { hash, origin, pathname, searchParams } = parseUrl(url);
  const extracted = new URLSearchParams();

  params.forEach((param) => {
    if (searchParams.has(param)) {
      extracted.set(param, searchParams.get(param)!);
      searchParams.delete(param);
    }
  });

  return {
    searchParams: extracted,
    url: buildUrl({ hash, origin, pathname, searchParams }),
  };
}

export function isAbsoluteUrl(url: string): boolean {
  const { origin, pathname } = parseUrl(url);

  return !!origin || pathname.startsWith('/');
}

function isMatchedOrigin(origin: string, baseOrigin: string): boolean {
  const [schema, host = ''] = origin.split('//', 2);
  const [baseSchema, baseHost = ''] = baseOrigin.split('//', 2);

  return !baseOrigin || !origin || ((!schema || !baseSchema || schema === baseSchema) && baseHost === host);
}

function isMatchedPathname(pathname: string, basePathname: string): boolean {
  return !basePathname || pathname.startsWith(basePathname);
}

function isMatchedQuery(search: URLSearchParams, baseSearch: URLSearchParams): boolean {
  let match = true;
  baseSearch.forEach((value, key) => {
    match = match && ((!value && search.has(key)) || search.getAll(key).includes(value));
  });

  return match;
}

export function isMatched(link: string, base = ''): boolean {
  const linkUrl = parseUrl(link);
  const baseUrl = parseUrl(base);

  return (
    isMatchedOrigin(linkUrl.origin, baseUrl.origin)
    && isMatchedPathname(linkUrl.pathname, baseUrl.pathname)
    && isMatchedQuery(linkUrl.searchParams, baseUrl.searchParams)
  );
}

export function resolveUrl(url: string, base: string): string {
  const baseUrl = parseUrl(base);
  const sourceUrl = parseUrl(url);
  const pathname = sourceUrl.pathname.startsWith('/')
    ? sourceUrl.pathname
    : `${baseUrl.pathname}${baseUrl.pathname.endsWith('/') || !sourceUrl.pathname ? '' : '/'}${sourceUrl.pathname}`;

  return buildUrl({
    pathname,
    hash: sourceUrl.hash || baseUrl.hash,
    origin: sourceUrl.origin || baseUrl.origin,
    searchParams: mergeSearchParams(baseUrl.searchParams, sourceUrl.searchParams),
  });
}

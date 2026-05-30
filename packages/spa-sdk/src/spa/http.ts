/*
 * Copyright 2019-2026 Bloomreach
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

import { Visitor } from '../page';

/**
 * Map of HTTP headers.
 */
export type HttpHeaders = Record<string, string | number | boolean>;

/**
 * Configuration of an HTTP client call.
 */
export type HttpClientConfig = {
  /**
   * HTTP request method.
   */
  method: 'GET' | 'POST';

  /**
   * The URL to send the HTTP request to.
   */
  url: string;

  /**
   * Optional: the headers to send with the HTTP request.
   */
  headers?: HttpHeaders;

  /**
   * Optional: the data to send with the HTTP request.
   * Will only be provided when the 'method' is 'post'.
   */
  data?: any;
};

/**
 * An HTTP response.
 */
export interface HttpResponse<T> {
  /**
   * The data returned in the response.
   */
  data: T;
}

/**
 * Fetches the page model data.
 *
 * Axios satisfies this type directly and can be passed as-is:
 * ```typescript
 * import axios from 'axios';
 * initialize({ httpClient: axios, ... });
 * ```
 *
 * When using the native `fetch` API, a thin wrapper is required because `fetch`
 * takes `(url, init)` as separate arguments, returns `Response` instead of
 * `{ data: T }`, and only accepts `string` header values:
 * ```typescript
 * import { HttpClient } from '@bloomreach/spa-sdk';
 *
 * const httpClient: HttpClient<PageModel> = async ({ method, url, headers, data }) => {
 *   const response = await fetch(url, {
 *     method,
 *     headers: headers as Record<string, string>,
 *     body: data !== undefined ? JSON.stringify(data) : undefined,
 *   });
 *   return { data: await response.json() };
 * };
 * ```
 */
export type HttpClient<T> = (config: HttpClientConfig) => Promise<HttpResponse<T>>;

/**
 * An HTTP connection.
 */
export interface HttpConnection {
  /**
   * Client's remote IP address.
   */
  remoteAddress?: string;
}

/**
 * An HTTP request
 */
export interface HttpRequest {
  /**
   * HTTP connection data.
   */
  connection?: HttpConnection;

  /**
   * Emits an event in the request scope.
   * @see https://nodejs.org/api/stream.html#stream_readable_streams
   */
  emit?(event: string | symbol, ...args: any[]): boolean;

  /**
   * All request headers (including cookies).
   */
  headers?: Partial<Record<string, string | string[]>>;

  /**
   * The path part of the URL, including a query string if present.
   * For example: '/path/to/page?foo=1'. The path always starts with '/'.
   * @deprecated The parameter is deprecated in favor of `path` in the configuration object.
   */
  path?: string;

  /**
   * Current request visitor.
   */
  visitor?: Omit<Visitor, 'new'>;
}

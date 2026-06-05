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

import { ApiOptions } from './spa';
import { PostMessageOptions } from './cms';
import { UrlBuilderOptions } from './url';

/**
 * Configuration of the SPA SDK.
 */
export interface Configuration extends ApiOptions, PostMessageOptions, UrlBuilderOptions {
  /**
   * The NBRMode parameter used to indicate whether the children of the BrPage component should be
   * rendered immediately or wait until the Page model has been retrieved and parsed.
   * By default, the option is `false`.
   */
  NBRMode?: boolean;

  /**
   * The query string parameter used to pass authorization header value.
   * By default, `token` parameter is used.
   */
  authorizationQueryParameter?: string;

  /**
   * The query string parameter used to pass a cluster node identifier.
   * By default, `server-id` parameter is used.
   */
  serverIdQueryParameter?: string;

  /**
   * The path part of the URL, including a query string if present.
   * For example: '/path/to/page?foo=1'. The path always starts with '/'.
   */
  path?: string;

  /**
   * The option enabling debug mode.
   */
  debug?: boolean;
}

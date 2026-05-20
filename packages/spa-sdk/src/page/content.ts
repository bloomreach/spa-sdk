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

import { MetaCollection } from './meta-collection';

/**
 * Polymorphic discriminator used by `ContentFactory` to dispatch a content
 * model to its concrete builder (e.g. `Document`, `ImageSet`, `Menu`,
 * `Pagination`).
 */
export interface ContentModel {
  type: string;
}

/**
 * Content used on the page.
 */
export interface Content {
  /**
   * @return The content id.
   */
  getId(): string;

  /**
   * @return The content locale.
   */
  getLocale(): string | undefined;

  /**
   * @return The content meta-data collection.
   */
  getMeta(): MetaCollection;

  /**
   * @return The content name.
   */
  getName(): string;

  /**
   * @return The content data as it is returned in the Page Model API.
   */
  getData<T extends Record<string, any> = Record<string, any>>(): T;

  /**
   * @return The link to the content.
   */
  getUrl(): string | undefined;
}

/**
 * Checks whether a value structurally satisfies the `Content` interface.
 */
export function isContent(value: any): value is Content {
  return (
    !!value
    && typeof value === 'object'
    && typeof value.getId === 'function'
    && typeof value.getLocale === 'function'
    && typeof value.getMeta === 'function'
    && typeof value.getName === 'function'
    && typeof value.getData === 'function'
    && typeof value.getUrl === 'function'
  );
}

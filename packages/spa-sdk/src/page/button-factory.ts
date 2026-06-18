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

import { Builder } from './factory';
import { MetaCollection } from './meta-collection';

type ButtonBuilder = Builder<any[], MetaCollection>;

export class ButtonFactory {
  constructor(private builders: Map<string, ButtonBuilder> = new Map()) {}

  create(type: string, ...params: unknown[]): MetaCollection {
    if (!this.builders.has(type)) {
      throw new Error(`Unsupported button type: '${type}'.`);
    }

    return this.builders.get(type)!(...params);
  }
}

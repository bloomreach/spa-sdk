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
import { ContentModel } from './content';

type ContentBuilder = Builder<[ContentModel], unknown>;

export class ContentFactory {
  constructor(private builders: Map<ContentModel['type'], ContentBuilder> = new Map()) {}

  /**
   * Creates a typed content object from a model.
   * @param model The raw content model from the page.
   * @return The result of the registered builder for the model's type, or the
   *   model itself unchanged if no builder is registered for that type.
   */
  create(model: ContentModel): ContentModel {
    if (!this.builders.has(model.type)) {
      return model;
    }

    return this.builders.get(model.type)!(model) as ContentModel;
  }
}

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

import { MetaCollectionModel, Meta } from './meta';

/**
 * Generic component type.
 */
export const TYPE_COMPONENT = 'COMPONENT';

/**
 * Parameters of a component.
 */
export interface ComponentParameters {
  [name: string]: string | undefined;
}

/**
 * Meta-data of a component.
 */
export interface ComponentMeta extends MetaCollectionModel {
  params?: ComponentParameters;
}

interface Models {
  [model: string]: any;
}

/**
 * Model of a component.
 */
export interface ComponentModel {
  _meta?: ComponentMeta;
  models?: Models;
  name?: string;
  type: typeof TYPE_COMPONENT | string;
  components?: ComponentModel[];
}

/**
 * A component in the current page.
 */
export interface Component {
  /**
   * Returns component meta-data collection.
   */
  getMeta(): Meta[];

  /**
   * Returns map of models.
   */
  getModels(): Models;

  /**
   * @return The name of this component.
   */
  getName(): string;

  /**
   * @return the parameters of this component.
   */
  getParameters(): ComponentParameters;

  /**
   * Look up for a nested component.
   * @param componentNames A lookup path.
   */
  getComponent<T extends Component>(...componentNames: string[]): T | undefined;
}

export class Component implements Component {
  constructor(
    protected model: ComponentModel,
    protected children: Component[] = [],
    protected meta: Meta[] = [],
  ) {}

  getMeta() {
    return this.meta;
  }

  getModels() {
    return this.model.models || {};
  }

  getName() {
    return this.model.name || '';
  }

  getParameters() {
    return this.model._meta && this.model._meta.params || {};
  }

  getComponent(...componentNames: string[]) {
    // tslint:disable-next-line:no-this-assignment
    let component: Component | undefined = this;

    while (componentNames.length && component) {
      const name = componentNames.shift()!;
      component = component.children.find(component => component.getName() === name);
    }

    return component;
  }
}

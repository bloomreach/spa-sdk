/*
 * Copyright 2019-2023 Bloomreach
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

import { inject, injectable } from 'inversify';
import { LinkFactory } from './link-factory';
import { Link } from './link';
import { MetaCollectionFactory } from './meta-collection-factory';
import { MetaCollectionModel, MetaCollection } from './meta-collection';
import { Reference } from './reference';

export const ComponentChildrenToken = Symbol.for('ComponentChildrenToken');
export const ComponentModelToken = Symbol.for('ComponentModelToken');

/**
 * Generic component type.
 */
export const TYPE_COMPONENT = 'component';

/**
 * Container type.
 */
export const TYPE_COMPONENT_CONTAINER = 'container';

/**
 * Container item type.
 */
export const TYPE_COMPONENT_CONTAINER_ITEM = 'container-item';

/**
 * Container item content type.
 */
export const TYPE_COMPONENT_CONTAINER_ITEM_CONTENT = 'componentcontent';

export type ComponentType =
  | typeof TYPE_COMPONENT
  | typeof TYPE_COMPONENT_CONTAINER_ITEM
  | typeof TYPE_COMPONENT_CONTAINER;

type ComponentLinks = 'self';

type ComponentModels = Record<string, any>;

type ComponentParameters = Record<string, any>;

type ComponentProperties = ComponentParameters;

/**
 * Meta-data of a component.
 */
export interface ComponentMeta extends MetaCollectionModel {
  params?: ComponentParameters;
}

/**
 * Model of a component.
 */
export interface ComponentModel {
  children?: Reference[];
  id: string;
  links: Record<ComponentLinks, Link>;
  meta: ComponentMeta;
  models?: ComponentModels;
  name?: string;
  type: ComponentType;
}

/**
 * A component in the current page.
 */
export interface Component {
  /**
   * @return The component id.
   */
  getId(): string;

  /**
   * @return The component meta-data collection.
   */
  getMeta(): MetaCollection;

  /**
   * @return The map of the component models.
   */
  getModels<T extends ComponentModels>(): T;

  /**
   * @return The link to the partial component model.
   */
  getUrl(): string | undefined;

  /**
   * @return The name of the component.
   */
  getName(): string;

  /**
   * @return The parameters of the component.
   */
  getParameters<T = ComponentParameters>(): T;

  /**
   * @return The properties of the component.
   * @alias getParameters
   */
  getProperties<T = ComponentProperties>(): T;

  /**
   * @return The direct children of the component.
   */
  getChildren(): Component[];

  /**
   * Looks up for a nested component.
   * @param componentNames A lookup path.
   */
  getComponent<U extends Component>(...componentNames: string[]): U | undefined;
  getComponent(): this;

  /**
   * Looks up for a nested component by its id.
   * @param id A component id.
   */
  getComponentById<U extends Component>(id: string): U | this | undefined;
}

@injectable()
export class ComponentImpl implements Component {
  protected meta: MetaCollection;

  constructor(
    @inject(ComponentModelToken) protected model: ComponentModel,
    @inject(ComponentChildrenToken) protected children: Component[],
    @inject(LinkFactory) private linkFactory: LinkFactory,
    @inject(MetaCollectionFactory) metaFactory: MetaCollectionFactory,
  ) {
    this.meta = metaFactory(this.model.meta);
  }

  getId(): string {
    return this.model.id;
  }

  getMeta(): MetaCollection {
    return this.meta;
  }

  getModels<T extends ComponentModels>(): T;

  getModels(): Record<string, unknown> {
    return this.model.models || {};
  }

  getUrl(): string | undefined {
    return this.linkFactory.create(this.model.links.self);
  }

  getName(): string {
    return this.model.name || '';
  }

  getParameters<T>(): T {
    return (this.model.meta.params ?? {}) as T;
  }

  getProperties<T>(): T {
    return this.getParameters<T>();
  }

  getChildren(): Component[] {
    return this.children;
  }

  getComponent(): this;

  getComponent<U extends Component>(...componentNames: string[]): U | undefined;

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  getComponent(...componentNames: string[]) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let component: Component | undefined = this;

    while (componentNames.length && component) {
      const name = componentNames.shift()!;
      component = component.getChildren().find((childComponent) => childComponent.getName() === name);
    }

    return component;
  }

  getComponentById<U extends Component>(id: string): U | this | undefined;

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  getComponentById(id: string) {
    const queue = [this as Component];

    while (queue.length) {
      const component = queue.shift()!;

      if (component.getId() === id) {
        return component;
      }

      queue.push(...component.getChildren());
    }

    return undefined;
  }
}

/**
 * Checks whether a value is a page component.
 * @param value The value to check.
 */
export function isComponent(value: any): value is Component {
  return value instanceof ComponentImpl;
}

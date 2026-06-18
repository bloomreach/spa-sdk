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

import { ComponentModel, ComponentType, Component } from './component';
import { PageModel } from './page';
import { resolve } from './reference';

type ComponentBuilder = (model: ComponentModel, children: Component[]) => Component;

/**
 * A component factory producing components based on a type.
 */
export class ComponentFactory {
  constructor(private builders: Map<ComponentType, ComponentBuilder> = new Map()) {}

  /**
   * Builds the full component tree from the page model using a bottom-up traversal.
   * @param page The page model containing the component hierarchy.
   * @param refPrefix Optional prefix used to resolve JSON Pointer `$ref` values.
   *   Defaults to `/page/` when not set by the CMS.
   * @return The root component, or `undefined` if the page model has no root reference.
   */
  create(page: PageModel, refPrefix?: string): Component | undefined {
    const heap = [page.root];
    const pool = new Map<ComponentModel, Component>();

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < heap.length; i++) {
      heap.push(...(resolve<ComponentModel>(page, heap[i], refPrefix)?.children ?? []));
    }

    return heap.reverse().reduce<Component | undefined>((previous, reference) => {
      const model = resolve<ComponentModel>(page, reference, refPrefix)!;
      const children = model?.children?.map(
        (child) => pool.get(resolve<ComponentModel>(page, child, refPrefix)!)!,
      ) ?? [];
      const component = this.buildComponent(model, children);

      pool.set(model, component);

      return component;
    }, undefined);
  }

  private buildComponent(model: ComponentModel, children: Component[]): Component {
    const builder = this.builders.get(model.type);
    if (!builder) {
      throw new Error(`Unsupported component type: '${model.type}'.`);
    }

    return builder(model, children);
  }
}

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

import { Typed } from 'emittery';
import {
  ComponentImpl,
  ComponentMeta,
  ComponentModel,
  Component,
  TYPE_COMPONENT_CONTAINER_ITEM,
  TYPE_COMPONENT_CONTAINER_ITEM_CONTENT,
} from './component';
import { Emitter } from '../emitter';
import { PageEventBus, PageUpdateEvent } from './page-events';
import { LinkFactory } from './link-factory';
import { Logger } from '../logger';
import { MetaCollectionImpl } from './meta-collection';
import { Page, PageModel } from './page';
import { Reference, resolve } from './reference';
import { ApiOptions } from '../spa/api';

/**
 * A container item without mapping.
 */
export const TYPE_CONTAINER_ITEM_UNDEFINED: symbol = Symbol.for('ContainerItemUndefined');

interface ContainerItemParameters {
  [parameter: string]: string | undefined;
}

/**
 * Meta-data of a container item.
 */
export interface ContainerItemMeta extends ComponentMeta {
  hidden?: boolean;
  params?: ContainerItemParameters;
  paramsInfo?: ComponentMeta['params'];
}

/**
 * Model of a container item.
 */
export interface ContainerItemModel extends ComponentModel {
  content?: Reference;
  ctype?: string;
  label?: string;
  meta: ContainerItemMeta;
  type: typeof TYPE_COMPONENT_CONTAINER_ITEM;
}

/**
 * Content model of a container item
 */
export interface ContainerItemContent<T> {
  type: string;
  data: T;
}

/**
 * Container item update event.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ContainerItemUpdateEvent {}

export interface ContainerItemEvents {
  update: ContainerItemUpdateEvent;
}

/**
 * A component that can be configured in the UI.
 */
export interface ContainerItem extends Component, Emitter<ContainerItemEvents> {
  /**
   * Returns the label of a container item catalogue component.
   *
   * @return The label of a catalogue component (e.g. "News List").
   */
  getLabel(): string | undefined;

  /**
   * Returns the type of a container item. The available types depend on which
   * container items have been configured in the backend.
   *
   * @return The type of a container item (e.g. "Banner").
   */
  getType(): string | undefined;

  /**
   * Returns whether the component should not render anything.
   * Hiding components is only possible with the Relevance feature.
   *
   * @return Whether the component is hidden or not.
   */
  isHidden(): boolean;

  /**
   * Returns the content of this component.
   *
   * @param page The page that contains the content
   */
  getContent<T>(page: Page): T | null;

  /**
   * Returns a [RFC-6901](https://tools.ietf.org/html/rfc6901) JSON Pointer
   * to the content of this container item.
   */
  getContentReference(): Reference | undefined;
}

/**
 * Returns the content of this component.
 *
 * @param component The component that references the content
 * @param page The page that contains the content
 */
export function getContainerItemContent<T>(component: ContainerItem, page: Page): T | null {
  const contentRef = component.getContentReference();
  if (!contentRef) {
    return null;
  }

  const componentContent = page.getContent<ContainerItemContent<T>>(contentRef);
  if (!componentContent) {
    return null;
  }

  if (componentContent?.type !== TYPE_COMPONENT_CONTAINER_ITEM_CONTENT) {
    return null;
  }

  return componentContent.data;
}

export class ContainerItemImpl extends ComponentImpl implements ContainerItem {
  private events = new Typed<ContainerItemEvents>();

  on = this.events.on.bind(this.events);

  off = this.events.off.bind(this.events);
  /**
   * @param model The container item model.
   * @param linkFactory Factory for generating component and resource URLs.
   * @param apiOptions API options used to resolve content references.
   * @param eventBus Optional event bus; when provided, the item re-renders on `page.update`.
   * @param logger Optional logger for debug output.
   */
  constructor(
    protected model: ContainerItemModel,
    linkFactory: LinkFactory,
    private apiOptions: ApiOptions,
    eventBus?: PageEventBus,
    private logger?: Logger,
  ) {
    super(model, [], linkFactory);

    eventBus?.on('page.update', this.onPageUpdate.bind(this));
  }

  protected onPageUpdate(event: PageUpdateEvent): void {
    const page = event.page as PageModel;
    const model = resolve<ContainerItemModel>(page, page.root, this.apiOptions.refPrefix);
    if (model?.id !== this.getId()) {
      return;
    }

    this.logger?.debug('Received container item update event.');
    this.logger?.debug('Event:', event);

    this.model = model;
    this.meta = new MetaCollectionImpl(model.meta);
    this.events.emit('update', {});
  }

  getLabel(): string | undefined {
    return this.model.label;
  }

  getType(): string | undefined {
    return this.model.ctype ?? this.model.label;
  }

  isHidden(): boolean {
    return !!this.model.meta.hidden;
  }

  getParameters<T>(): T {
    return (this.model.meta.paramsInfo ?? {}) as T;
  }

  getContent<T>(page: Page): T | null {
    return getContainerItemContent(this, page);
  }

  getContentReference(): Reference | undefined {
    return this.model.content;
  }
}

/**
 * Checks whether a value is a page container item.
 * @param value The value to check.
 */
export function isContainerItem(value: any): value is ContainerItem {
  return value instanceof ContainerItemImpl;
}

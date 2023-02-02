/*
 * Copyright 2023 Bloomreach
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

import { Injectable, TemplateRef, Type } from '@angular/core';
import { Page } from '@bloomreach/spa-sdk';
import { BehaviorSubject } from 'rxjs';
import type { BrComponentContext } from '../br-component.directive';
import { BrProps } from '../br-props.model';

export interface BrNodeContext extends BrComponentContext {
  template?: TemplateRef<BrComponentContext>;
}

@Injectable({
  providedIn: 'root',
})
export class BrPageService {
  private _mapping: Record<keyof any, Type<BrProps>> = {};
  private _node!: TemplateRef<BrNodeContext>;
  private readonly state$: BehaviorSubject<Page | undefined>;

  constructor() {
    this.state$ = new BehaviorSubject<Page | undefined>(undefined);
  }

  get mapping(): Record<keyof any, Type<BrProps>> {
    return this._mapping;
  }

  set mapping(mapping: Record<keyof any, Type<BrProps>>) {
    this._mapping = mapping;
  }

  get node(): TemplateRef<BrNodeContext> {
    return this._node;
  }

  set node(node: TemplateRef<BrNodeContext>) {
    this._node = node;
  }

  get state(): BehaviorSubject<Page | undefined> {
    return this.state$;
  }
}

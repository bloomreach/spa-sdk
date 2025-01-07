/*
 * Copyright 2020-2025 Bloomreach
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

import { Directive, Input, TemplateRef } from '@angular/core';
import { Component } from '@bloomreach/spa-sdk';
import type { BrComponentContext } from './br-component.directive';

@Directive({
  selector: '[brNode]',
})
export class BrNodeDirective {
  @Input('brNode') component!: Component;

  @Input('brNodeTemplate') template?: TemplateRef<BrComponentContext>;
}

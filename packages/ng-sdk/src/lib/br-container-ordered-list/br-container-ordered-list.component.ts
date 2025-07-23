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

import { Component, HostBinding, Input } from '@angular/core';
import { Container, Page } from '@bloomreach/spa-sdk';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'ol.br-container-ordered-list',
  templateUrl: './br-container-ordered-list.component.html',
  standalone: false,
})
export class BrContainerOrderedListComponent {
  @Input() component!: Container;

  @Input() page!: Page;

  @HostBinding('class.hst-container')
  get isPreview(): boolean {
    return this.page?.isPreview();
  }
}

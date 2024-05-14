/*
 * Copyright 2024 Bloomreach
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

import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrSdkModule } from '@bloomreach/ng-sdk';
import { Component as BrComponent, Page } from '@bloomreach/spa-sdk';
import { NewsItemComponent } from '../news-item/news-item.component';

@Component({
  selector: 'br-news-list',
  standalone: true,
  imports: [
    CommonModule,
    BrSdkModule,
    RouterModule,
    NewsItemComponent,
  ],
  templateUrl: './news-list.component.html',
})
export class NewsListComponent {
  @Input() component!: BrComponent;

  @Input() page!: Page;

  get pagination(): Pageable {
    return this.component.getModels<PageableModels>().pageable;
  }
}

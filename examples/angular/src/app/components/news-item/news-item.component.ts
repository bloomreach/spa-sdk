/*
 * Copyright 2024-2025 Bloomreach
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
import { Document } from '@bloomreach/spa-sdk';
import { ParseUrlPipe } from '../../pipes/parse-url.pipe';

@Component({
  selector: 'br-news-item',
  imports: [
    CommonModule,
    BrSdkModule,
    RouterModule,
    ParseUrlPipe,
  ],
  templateUrl: './news-item.component.html',
})
export class NewsItemComponent {
  @Input() item!: Document;

  get data(): DocumentData {
    return this.item.getData<DocumentData>();
  }
}

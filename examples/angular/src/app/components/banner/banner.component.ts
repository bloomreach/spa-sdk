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

import { Component, Input, OnInit } from '@angular/core';
import { Component as BrComponent, Document, ImageSet, Page } from '@bloomreach/spa-sdk';
import { CommonModule } from '@angular/common';
import { BrSdkModule } from '@bloomreach/ng-sdk';
import { RouterModule } from '@angular/router';
import { sanitize } from '../../utils/sanitize';
import { ParseUrlPipe } from '../../pipes/parse-url.pipe';

@Component({
  selector: 'br-banner',
  imports: [
    CommonModule,
    BrSdkModule,
    RouterModule,
    ParseUrlPipe,
  ],
  templateUrl: './banner.component.html',
})
export class BannerComponent implements OnInit {
  @Input() component!: BrComponent;

  @Input() page!: Page;

  safeHTML?: string | null;

  async ngOnInit(): Promise<void> {
    const content = this.document?.getData<DocumentData>().content;
    if (content) {
      const sanitized = sanitize(content!.value);
      this.safeHTML = this.page.rewriteLinks(sanitized);
    }
  }

  get document(): Document | undefined {
    const { document } = this.component.getModels<DocumentModels>();

    return document && this.page.getContent<Document>(document);
  }

  get data(): DocumentData | undefined {
    return this.document?.getData<DocumentData>();
  }

  get image(): ImageSet | undefined {
    return this.data?.image && this.page.getContent<ImageSet>(this.data.image);
  }

  get link(): Document | undefined {
    return this.data?.link && this.page.getContent<Document>(this.data.link);
  }
}

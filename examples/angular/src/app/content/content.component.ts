/*
 * Copyright 2020-2023 Bloomreach
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

@Component({
  selector: 'br-content',
  templateUrl: './content.component.html',
})
export class ContentComponent implements OnInit {
  @Input() component!: BrComponent;

  @Input() page!: Page;

  safeHTML?: Promise<string | null>;

  async ngOnInit(): Promise<void> {
    const ref = this.component.getModels<DocumentModels>().document;
    this.safeHTML = this.page.prepareHTML(ref, 'content');
  }

  get document(): Document | undefined {
    const { document } = this.component.getModels<DocumentModels>();

    return document && this.page.getContent<Document>(document);
  }

  get data(): DocumentData | undefined {
    return this.document?.getData<DocumentData>();
  }

  get date(): number | undefined {
    return this.data?.date ?? this.data?.publicationDate;
  }

  get image(): ImageSet | undefined {
    return this.data?.image && this.page.getContent<ImageSet>(this.data.image);
  }
}

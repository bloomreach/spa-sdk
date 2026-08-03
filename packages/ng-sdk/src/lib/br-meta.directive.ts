/*
 * Copyright 2020-2026 Bloomreach
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

import {
  Directive,
  inject,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { MetaCollection } from '@bloomreach/spa-sdk';
import { BrPageService } from './br-page/br-page.service';

@Directive({
  standalone: false,
})
export abstract class BrMetaDirective implements OnChanges, OnDestroy {
  protected meta?: MetaCollection | undefined;

  private clear?: ReturnType<MetaCollection['render']>;

  private container = inject(ViewContainerRef);
  private template = inject(TemplateRef<never>, { optional: true });
  private pageService = inject(BrPageService, { optional: true });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ngOnChanges(changes: SimpleChanges): void {
    this.clearMeta();
    this.container.clear();

    const { head, tail } = this.render();
    this.clear = head && tail && this.meta?.render(head, tail);
    if (this.clear) {
      this.sync();
    }
  }

  ngOnDestroy(): void {
    this.clearMeta();
    this.container.clear();
  }

  private clearMeta(): void {
    if (!this.clear) {
      return;
    }
    this.clear();
    this.clear = undefined;
    this.sync();
  }

  private sync(): void {
    const page = this.pageService?.state.getValue();
    if (page?.isPreview?.()) {
      page.sync();
    }
  }

  private render(): { head: any; tail: any } {
    if (!this.template) {
      return {
        head: this.container.element.nativeElement,
        tail: this.container.element.nativeElement,
      };
    }

    const embeddedViewRef = this.container.createEmbeddedView(this.template);
    const [head] = embeddedViewRef.rootNodes;
    const [tail] = embeddedViewRef.rootNodes.slice(-1);

    return { head, tail };
  }
}

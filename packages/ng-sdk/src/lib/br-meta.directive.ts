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

import {
  Directive,
  OnChanges,
  OnDestroy,
  Optional,
  SimpleChanges,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { MetaCollection } from '@bloomreach/spa-sdk';

@Directive({
  standalone: false,
})
export abstract class BrMetaDirective implements OnChanges, OnDestroy {
  protected meta?: MetaCollection | undefined;

  private clear?: ReturnType<MetaCollection['render']>;

  constructor(private container: ViewContainerRef, @Optional() private template?: TemplateRef<never>) {
    // Constructor intentionally left empty
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ngOnChanges(changes: SimpleChanges): void {
    this.clear?.();
    this.container.clear();

    const { head, tail } = this.render();
    this.clear = head && tail && this.meta?.render(head, tail);
  }

  ngOnDestroy(): void {
    this.clear?.();
    this.container.clear();
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

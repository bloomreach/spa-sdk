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
  ChangeDetectorRef,
  Directive,
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  Type,
  ViewContainerRef,
} from '@angular/core';
import { ContainerItem, TYPE_CONTAINER_ITEM_UNDEFINED } from '@bloomreach/spa-sdk';
import { BrContainerItemUndefinedComponent } from './br-container-item-undefined/br-container-item-undefined.component';
import { BrNodeComponentDirective } from './br-node-component.directive';
import { BrNodeDirective } from './br-node.directive';
import { BrPageService } from './br-page/br-page.service';
import { BrProps } from './br-props.model';

@Directive({
  selector: '[brNodeContainerItem]',
})
export class BrNodeContainerItemDirective extends BrNodeComponentDirective implements OnChanges, OnDestroy {
  constructor(
    container: ViewContainerRef,
    injector: Injector,
    node: BrNodeDirective,
    page: BrPageService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    super(container, injector, node, page);

    this.onUpdate = this.onUpdate.bind(this);
  }

  @Input('brNodeContainerItem') component?: ContainerItem;

  ngOnChanges(changes: SimpleChanges): void {
    changes.component?.previousValue?.off('update', this.onUpdate);

    super.ngOnChanges(changes);

    this.component?.on('update', this.onUpdate);
  }

  ngOnDestroy(): void {
    this.component?.off('update', this.onUpdate);
  }

  private onUpdate(): void {
    this.changeDetectorRef.markForCheck();
    this.ngOnChanges({});
    this.page.state.getValue()?.sync();
  }

  protected getMapping(): Type<BrProps> | undefined {
    const type = this.component?.getType();

    if (type && type in this.page.mapping) {
      return this.page.mapping[type];
    }

    return this.page.mapping[TYPE_CONTAINER_ITEM_UNDEFINED as any] ?? BrContainerItemUndefinedComponent;
  }
}

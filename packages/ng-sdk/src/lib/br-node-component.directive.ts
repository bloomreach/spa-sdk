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
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  Type,
  ViewContainerRef,
} from '@angular/core';
import { Component, MetaCollection } from '@bloomreach/spa-sdk';
import { BrNodeDirective } from './br-node.directive';
import { BrPageService } from './br-page/br-page.service';
import { BrProps } from './br-props.model';

@Directive({
  selector: '[brNodeComponent]',
  standalone: false,
})
export class BrNodeComponentDirective implements OnChanges, OnDestroy {
  @Input('brNodeComponent') component?: Component;

  private clear?: ReturnType<MetaCollection['render']>;

  constructor(
    private container: ViewContainerRef,
    private injector: Injector,
    private node: BrNodeDirective,
    protected page: BrPageService,
  ) {
    // Constructor intentionally left empty
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ngOnChanges(changes: SimpleChanges): void {
    this.clear?.();
    this.container.clear();

    const { head, tail } = this.render();

    this.clear = head && tail && this.component?.getMeta()?.render(head, tail);
  }

  protected getMapping(): Type<BrProps> | undefined {
    return this.component && this.page.mapping[this.component.getName()];
  }

  private render(): { head: any; tail: any } {
    if (this.node.template) {
      return this.renderTemplate();
    }

    const component = this.getMapping();
    if (!component) {
      return this.renderChildren();
    }

    return this.renderMapping(component);
  }

  private renderTemplate(): { head: any; tail: any } {
    const embeddedViewRef = this.container.createEmbeddedView(this.node.template!, {
      $implicit: this.component,
      component: this.component,
      page: this.page.state.getValue(),
    });
    const [head] = embeddedViewRef.rootNodes;
    const [tail] = embeddedViewRef.rootNodes.slice(-1);

    return { head, tail };
  }

  private renderChildren(): { head: any; tail: any } {
    const nodes = this.component
      ?.getChildren()
      ?.map((component) => this.container.createEmbeddedView(
        this.page.node,
        {
          component,
          $implicit: component,
          page: this.page.state.getValue()!,
        },
      ))
      .flatMap((view) => view.rootNodes);

    const head = nodes?.[0] ?? this.container.element.nativeElement;
    const tail = nodes?.[nodes.length - 1] ?? head;

    return { head, tail };
  }

  private renderMapping(component: Type<BrProps>): { head: any; tail: any } {
    const componentRef = this.container.createComponent(component);

    componentRef.instance.component = this.component;
    componentRef.instance.page = this.page.state.getValue();

    return {
      head: componentRef.location.nativeElement,
      tail: componentRef.location.nativeElement,
    };
  }

  ngOnDestroy(): void {
    this.clear?.();
    this.container.clear();
  }
}

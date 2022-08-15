/*
 * Copyright 2020-2022 Bloomreach
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  ComponentFactoryResolver,
  Directive,
  Injector,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  Type,
  ViewContainerRef,
} from '@angular/core';
import { Component, MetaCollection } from '@bloomreach/spa-sdk';
import { BrNodeDirective } from './br-node.directive';
import { BrPageComponent } from './br-page/br-page.component';
import { BrProps } from './br-props.model';

@Directive({
  selector: '[brNodeComponent]',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['component:brNodeComponent'],
})
export class BrNodeComponentDirective<T extends Component> implements OnChanges, OnDestroy {
  component?: T;

  private clear?: ReturnType<MetaCollection['render']>;

  constructor(
    private container: ViewContainerRef,
    private injector: Injector,
    private componentFactoryResolver: ComponentFactoryResolver,
    private node: BrNodeDirective,
    protected page: BrPageComponent,
  ) {}

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
    // tslint:disable: no-non-null-assertion
    const embeddedViewRef = this.container.createEmbeddedView(this.node.template!, {
      $implicit: this.component,
      component: this.component,
      page: this.page.state.getValue(),
    });
    // tslint:enable: no-non-null-assertion
    const [head] = embeddedViewRef.rootNodes;
    const [tail] = embeddedViewRef.rootNodes.slice(-1);

    return { head, tail };
  }

  private renderChildren(): { head: any; tail: any } {
    const nodes = this.component
      ?.getChildren()
      ?.map((component) =>
        this.container.createEmbeddedView(this.page.node, {
          component,
          $implicit: component,
          page: this.page.state.getValue()!,
        }),
      )
      .flatMap((view) => view.rootNodes);

    const head = nodes?.[0] ?? this.container.element.nativeElement;
    const tail = nodes?.[nodes.length - 1] ?? head;

    return { head, tail };
  }

  private renderMapping(component: Type<BrProps>): { head: any; tail: any } {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);
    const componentRef = this.container.createComponent(componentFactory, undefined, this.injector);

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

/*
 * Copyright 2020 Bloomreach
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

import { Directive, Input, OnChanges, Optional, SimpleChanges, TemplateRef, ViewContainerRef } from '@angular/core';
import { Menu, TYPE_MANAGE_MENU_BUTTON } from '@bloomreach/spa-sdk';
import { BrMetaDirective } from './br-meta.directive';
import { BrPageComponent } from './br-page/br-page.component';

/**
 * The button directive that opens a menu editor.
 */
@Directive({ selector: '[brManageMenuButton]' })
export class BrManageMenuButtonDirective extends BrMetaDirective implements OnChanges {
  /**
   * The related menu model.
   */
  @Input('brManageMenuButton') menu!: Menu;

  constructor(
    container: ViewContainerRef,
    @Optional() template?: TemplateRef<never>,
    @Optional() private page?: BrPageComponent,
  ) {
    super(container, template);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.meta = this.page?.state.getValue()?.getButton(TYPE_MANAGE_MENU_BUTTON, this.menu);

    super.ngOnChanges(changes);
  }
}
